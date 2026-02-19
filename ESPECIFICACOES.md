# Especificações do Sistema — Ki-Pedreiro (Desktop Electron)

> **Versão:** 1.0 | **Data:** 2026-02-19

---

## 1. Arquitetura Geral

O sistema é uma aplicação **Electron** (desktop) com arquitetura dividida em:

| Camada | Tecnologia | Responsabilidade |
|--------|-----------|-----------------|
| **Renderer** (front) | HTML/CSS/JS vanilla, ES modules | Interface do usuário (SPA via hash routing) |
| **Main** (back) | Node.js / Electron Main Process | Banco de dados SQLite, controllers, sincronização |
| **Preload** | `contextBridge` | Ponte segura entre Renderer e Main via IPC |
| **Banco local** | SQLite (`better-sqlite3`) | Armazenamento offline (`%AppData%/kipedreiro.db`) |
| **API remota** | PHP REST (localhost:8000) | Fonte de verdade na nuvem |

---

## 2. Estrutura de Rotas (Hash Navigation)

| Hash | View | Descrição |
|------|------|-----------|
| `#usuario_menu` | `UsuariosView.renderizarMenu()` | Dashboard com stats e atalhos |
| `#usuario_listar` | `UsuarioListar.renderizarLista()` | Lista paginada + CRUD modal |
| `#servico_listar` | `ServicosListar.renderizarLista()` | Lista paginada + CRUD modal |

> A rota `#usuario_criar` foi **descontinuada** — criação via modal na lista.

---

## 3. IPC Channels (preload.js ↔ main.js)

### Usuários

| Canal | Método preload | Método controller |
|-------|---------------|------------------|
| `usuarios:listar` | `window.api.listar(params)` | `UsuarioController.listar(params)` |
| `usuarios:cadastrar` | `window.api.cadastrar(usuario)` | `UsuarioController.cadastrar(usuario)` |
| `usuarios:buscarPorId` | `window.api.buscarporid(uuid)` | `UsuarioController.buscarUsuarioPorId(uuid)` |
| `usuarios:editar` | `window.api.editarUsuario(usuario)` | `UsuarioController.atualizarUsuario(usuario)` |
| `usuarios:removerusuario` | `window.api.removerUsuario(uuid)` | `UsuarioController.removerUsuario(uuid)` |
| `usuarios:dashboardStats` | `window.api.obterDadosDashboard()` | `UsuarioController.obterDadosDashboard()` |

### Serviços

| Canal | Método preload | Método controller |
|-------|---------------|------------------|
| `servicos:listar` | `window.api.listarServicos(params)` | `ServicoController.listar(params)` |
| `servicos:cadastrar` | `window.api.cadastrarServico(servico)` | `ServicoController.cadastrar(servico)` |
| `servicos:editar` | `window.api.editarServico(servico)` | `ServicoController.editar(servico)` |
| `servicos:excluir` | `window.api.excluirServico(id)` | `ServicoController.excluir(id)` |
| `servicos:sincronizar` | `window.api.sincronizarServicos()` | `ServicoController.sincronizar()` |

---

## 4. Schema do Banco Local (SQLite)

### Tabela `usuarios`

```sql
CREATE TABLE IF NOT EXISTS usuarios (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  uuid         TEXT,
  nome_usuario TEXT NOT NULL,
  email_usuario TEXT NOT NULL,
  tipo_usuario TEXT NOT NULL,          -- 'user' | 'admin'
  sync_status  INTEGER DEFAULT 0,      -- 0=Pendente, 1=Sincronizado
  criado_em    DATETIME DEFAULT CURRENT_TIMESTAMP,
  atualizado_em DATETIME,
  excluido_em  DATETIME                -- soft-delete
);
```

### Tabela `servicos`

```sql
CREATE TABLE IF NOT EXISTS servicos (
  id               INTEGER PRIMARY KEY AUTOINCREMENT,
  nome_servico     TEXT,
  descricao_servico TEXT,
  foto_servico     TEXT,
  caminho_imagem   TEXT,
  image_base64     TEXT,               -- data:image/...;base64,...
  sync_status      INTEGER DEFAULT 0,  -- 0=Pendente, 1=Sincronizado
  criado_em        DATETIME DEFAULT CURRENT_TIMESTAMP,
  atualizado_em    DATETIME,
  excluido_em      DATETIME            -- soft-delete
);
```

---

## 5. CRUD Offline — Usuários

| Operação | Model | Logic |
|----------|-------|-------|
| **Criar** | `Usuarios.adicionar(usuario)` | Gera UUID, `sync_status=0` |
| **Listar** | `Usuarios.listar(params)` | Pagina por `page/limit`, filtra por `search` |
| **Buscar por ID** | `Usuarios.buscarPorUUID(uuid)` | Retorna um registro |
| **Editar** | `Usuarios.atualizar(usuario)` | Atualiza `nome_usuario`, `email_usuario`, `tipo_usuario`, seta `sync_status=0` |
| **Excluir** | `Usuarios.remover(uuid)` | Soft-delete: preenche `excluido_em` |

---

## 6. CRUD Offline — Serviços

| Operação | Model | Logic |
|----------|-------|-------|
| **Criar** | `Servicos.adicionar(servico)` | Salva `image_base64`, `sync_status=0` |
| **Listar** | `Servicos.listar(params)` | Pagina + filtra, ignora `excluido_em IS NOT NULL` |
| **Editar** | `Servicos.atualizar(servico)` | Atualiza por `id`, seta `sync_status=0` |
| **Excluir** | `Servicos.remover(id)` | Soft-delete: preenche `excluido_em` |
| **Sync Down** | `Servicos.cadastrarLocalmente(dados[])` | Limpa e reinserere da API (API é fonte de verdade) |

---

## 7. Sincronização com a API

### Configuração

```
API_URL   = http://localhost:8000/backend/api/
API_KEY   = 9D67A537A... (Bearer token)
INTERVALO = 1 minuto (setInterval)
```

### Fluxo de Sync UP (local → API)

```
[SyncService.enviarDadosLocais('servicos')]
  ↓ listarPendentes() → registros com sync_status = 0
  ↓ POST /api/servicos  { nome_servico, descricao_servico, image_base64, ... }
  ↓ API decodifica base64 → salva imagem no servidor
  ↓ Se sucesso → marcarComoSincronizado(id)
```

### Fluxo de Sync DOWN (API → local)

```
[SyncService.sincronizar('servicos')]
  ↓ GET /api/servicos
  ↓ response.data[] → Servicos.cadastrarLocalmente()
  ↓ Apaga tabela e reinserere (API = fonte de verdade)
  ↓ Todos com sync_status = 1
```

---

## 8. Upload de Imagem — Serviços

1. Usuário seleciona arquivo via `<input type="file" accept="image/*">`
2. `FileReader.readAsDataURL(file)` converte para `data:image/jpeg;base64,...`
3. String base64 salva no campo `image_base64` do SQLite local
4. Na exibição: `<img src="${servico.image_base64}">` (sem servidor)
5. Na sincronização: `image_base64` é enviado no payload JSON para a API PHP
6. API PHP decodifica e salva o arquivo no servidor

---

## 9. Convenções de Código

- **Nomenclatura SQL:** colunas sempre com nome completo (ex: `nome_usuario`, nunca `nome`)
- **Soft-delete:** exclusão sempre preenche `excluido_em`, nunca `DELETE`
- **sync_status:** `0` = pendente/modificado localmente | `1` = sincronizado com API
- **Paginação:** sempre retornar `{ data, total, page, limit, totalPages }`
- **Modais:** abertura via `<dialog>.showModal()`, fechamento limpa o formulário
- **IPC Naming:** `entidade:acao` (ex: `servicos:editar`, `usuarios:listar`)
