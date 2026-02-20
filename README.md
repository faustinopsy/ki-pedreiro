# Ki-Pedreiro 🛠️

Sistema de gestão para prestadores de serviços (pedreiros/autônomos) desenvolvido em Electron, focado em funcionamento offline-first com sincronização em background.

## 🚀 Tecnologias

- **Runtime:** [Electron](https://www.electronjs.org/)
- **Build Tool:** [Vite](https://vitejs.dev/) + [Electron Forge](https://www.electronforge.io/)
- **Frontend:** Vanilla JavaScript (ES Modules) + [TailwindCSS](https://tailwindcss.com/)
- **Database:** [better-sqlite3](https://github.com/WiseLibs/better-sqlite3) (SQLite local)
- **Segurança:** Context Isolation + IPC Bridge

---

## 🏗️ Instalação e Execução

### Pré-requisitos
- Node.js (v18 ou superior recomendado)
- Git

### Ambiente de Desenvolvimento

1. **Clone o repositório:**
   ```bash
   git clone https://github.com/faustinopsy/ki-pedreiro.git
   cd ki-pedreiro
   ```

2. **Instale as dependências:**
   ```bash
   npm install
   ```

3. **Inicie em modo dev:**
   ```bash
   npm run start
   # ou
   npm run dev
   ```

---

## 📦 Gerando o Executável (Build)

Este projeto utiliza módulos nativos (`better-sqlite3`), o que requer cuidados especiais durante o build. O arquivo `forge.config.js` já está configurado com hooks para garantir que tudo funcione.

### Comando de Build
Para gerar o instalador/executável para Windows:

```bash
npm run build
```
ou
```bash
npm run package
```

> **Nota:** O comando acima executa `electron-forge make`.

### Resolução de Problemas no Build
Se você encontrar erros como *"Cannot find module 'better-sqlite3'"* na versão final:
1. Feche qualquer instância do app aberta.
2. Apague a pasta `out`.
3. Rode `npm run build` novamente.
   * *O `forge.config.js` possui um hook `packageAfterPrune` que copia manualmente as dependências nativas necessárias.*

---

## 📐 Arquitetura do Projeto

### Estrutura de Diretórios
```
ki-pedreiro/
├── src/
│   ├── main.js                 # Ponto de entrada do Processo Principal (Backend)
│   ├── preload.js              # Ponte de segurança (IPC) Preload
│   ├── renderer.js             # Ponto de entrada do Processo de Renderização (Frontend)
│   ├── index.css              # Estilos Globais (Tailwind imports)
│   │
│   ├── Main_back/              # Lógica do Backend (Node.js)
│   │   ├── Controllers/        # Regras de Negócio (Usuario, Servico, Orcamento)
│   │   ├── Database/           # Conexão SQLite e Migrations
│   │   ├── Models/             # Acesso a Dados (DAOs)
│   │   └── Services/           # Serviços (ex: SyncService.js)
│   │
│   └── Renderer_front/         # Lógica do Frontend (Browser)
│       ├── Services/           # Roteamento e Utils (Rotas.js, Configuracao.js)
│       └── Views/              # Componentes de Tela (Classes JS manipulando DOM)
│
├── forge.config.js             # Configuração crítica de Empacotamento
├── vite.*.config.mjs           # Configurações do Vite (Main, Preload, Renderer)
└── package.json
```

### Fluxo de Dados

1. **Frontend (Renderer):**
   - O usuário interage com a interface.
   - A `View` chama métodos expostos em `window.api` (definidos no `preload.js`).
   - Exemplo: `window.api.listarServicos()`.

2. **Ponte (IPC):**
   - O `preload.js` intercepta a chamada e usa `ipcRenderer.invoke('canal', dados)`.
   - Garante que o Frontend não tenha acesso direto ao Node.js.

3. **Backend (Main):**
   - O `src/main.js` escuta o evento via `ipcMain.handle('canal', ...)`.
   - Redireciona para o `Controller` apropriado (ex: `ServicoController`).
   - O Controller aciona o `Model`, que consulta o banco `SQLite`.
   - O resultado retorna por toda a cadeia até a View.

### Sistema de Sincronização (`SyncService.js`)
O app possui um serviço de sincronização automática que roda no **Main Process**:
- **Ciclo:** A cada 60 segundos (e na inicialização).
- **Download:** Faz GET na API externa para trazer novos registros.
- **Upload:** Faz POST para enviar registros criados localmente (pendentes).
- **Status:** Verifica `net.isOnline()` antes de tentar.

---

## 🛠️ Detalhes Técnicos Importantes

### 1. Módulos Nativos (better-sqlite3)
O SQLite é compilado em C++. No Electron, isso exige que o módulo seja:
- **Extraído do ASAR:** Configurado em `forge.config.js` via `asar.unpack`.
- **Carregado via `require`:** No `src/Main_back/Database/db.js`, usamos `require` em vez de `import` para garantir compatibilidade em runtime no Main Process.

### 2. Configuração do Vite
- **Renderer:** Configurado com `target: 'esnext'` para suportar *Top-Level Await* e recursos modernos do JS.
- **Main/Preload:** Configurados como bibliotecas Node para empacotamento otimizado.

### 3. Frontend "Vanilla" Modular
- Não utiliza frameworks pesados (React/Vue).
- Usa classes ES6 para organizar as Views.
- Roteamento próprio simples baseado em hash (`#home`, `#servicos`).
