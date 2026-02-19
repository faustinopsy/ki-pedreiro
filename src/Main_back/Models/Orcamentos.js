import db from '../Database/db.js';

class Orcamentos {

    listar(params = {}) {
        const { page = 1, limit = 10, search = '' } = params;
        const offset = (page - 1) * limit;

        let query = `
      SELECT o.*, u.nome_usuario AS cliente_nome
      FROM orcamentos o
      LEFT JOIN usuarios u ON u.uuid = o.cliente_uuid
      WHERE o.excluido_em IS NULL
    `;
        let countQuery = `
      SELECT COUNT(*) as total FROM orcamentos o
      LEFT JOIN usuarios u ON u.uuid = o.cliente_uuid
      WHERE o.excluido_em IS NULL
    `;
        const bindings = [];

        if (search) {
            const term = `%${search}%`;
            const clause = ` AND (o.titulo LIKE ? OR u.nome_usuario LIKE ?)`;
            query += clause;
            countQuery += clause;
            bindings.push(term, term);
        }

        query += ` ORDER BY o.criado_em DESC LIMIT ? OFFSET ?`;

        try {
            const total = (db.prepare(countQuery).get(...bindings))?.total || 0;
            const data = db.prepare(query).all(...bindings, limit, offset);
            return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
        } catch (err) {
            console.error('[Orcamentos] Erro ao listar:', err);
            throw err;
        }
    }

    buscarPorId(id) {
        const orcamento = db.prepare(`
      SELECT o.*, u.nome_usuario AS cliente_nome
      FROM orcamentos o
      LEFT JOIN usuarios u ON u.uuid = o.cliente_uuid
      WHERE o.id = ? AND o.excluido_em IS NULL
    `).get(id);

        if (!orcamento) return null;

        const itens = db.prepare(`
      SELECT oi.*, s.nome_servico
      FROM orcamento_itens oi
      LEFT JOIN servicos s ON s.id = oi.servico_id
      WHERE oi.orcamento_id = ?
    `).all(id);

        return { ...orcamento, itens };
    }

    adicionar(orcamento) {
        const { titulo, cliente_uuid, status = 'rascunho', observacoes = '', itens = [] } = orcamento;

        const valor_total = itens.reduce((sum, i) => sum + (i.quantidade * i.valor_unitario), 0);

        const tx = db.transaction(() => {
            const info = db.prepare(`
        INSERT INTO orcamentos (titulo, cliente_uuid, status, valor_total, observacoes, sync_status, criado_em, atualizado_em)
        VALUES (?, ?, ?, ?, ?, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `).run(titulo, cliente_uuid, status, valor_total, observacoes);

            const orcamentoId = info.lastInsertRowid;

            const stmtItem = db.prepare(`
        INSERT INTO orcamento_itens (orcamento_id, servico_id, quantidade, valor_unitario, valor_total)
        VALUES (?, ?, ?, ?, ?)
      `);

            for (const item of itens) {
                const vt = item.quantidade * item.valor_unitario;
                stmtItem.run(orcamentoId, item.servico_id, item.quantidade, item.valor_unitario, vt);
            }

            return orcamentoId;
        });

        return tx();
    }

    atualizar(orcamento) {
        const { id, titulo, cliente_uuid, status, observacoes = '', itens = [] } = orcamento;
        const valor_total = itens.reduce((sum, i) => sum + (i.quantidade * i.valor_unitario), 0);

        const tx = db.transaction(() => {
            db.prepare(`
        UPDATE orcamentos
        SET titulo = ?, cliente_uuid = ?, status = ?, valor_total = ?,
            observacoes = ?, sync_status = 0, atualizado_em = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(titulo, cliente_uuid, status, valor_total, observacoes, id);

            // Recria os itens
            db.prepare(`DELETE FROM orcamento_itens WHERE orcamento_id = ?`).run(id);

            const stmtItem = db.prepare(`
        INSERT INTO orcamento_itens (orcamento_id, servico_id, quantidade, valor_unitario, valor_total)
        VALUES (?, ?, ?, ?, ?)
      `);
            for (const item of itens) {
                const vt = item.quantidade * item.valor_unitario;
                stmtItem.run(id, item.servico_id, item.quantidade, item.valor_unitario, vt);
            }
        });

        tx();
        return true;
    }

    remover(id) {
        const info = db.prepare(`
      UPDATE orcamentos SET excluido_em = CURRENT_TIMESTAMP, sync_status = 0 WHERE id = ?
    `).run(id);
        return info.changes > 0;
    }
}

export default Orcamentos;
