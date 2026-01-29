# Arquitetura do Projeto Ki-Pedreiro

Este documento descreve a estrutura técnica, o fluxo de dados e as decisões de arquitetura do aplicativo Desktop **Ki-Pedreiro**.

## Visão Geral

O projeto é construído sobre a plataforma **Electron**, utilizando **Vite** para o bundle e **SQLite** para persistência de dados local. A aplicação segue uma divisão clara entre **Main Process** (Backend local) e **Renderer Process** (Frontend).

### Stack Tecnológica
- **Runtime**: Electron
- **Build Tool**: Vite + Electron Forge
- **Database**: SQLite (via `better-sqlite3`)
- **Frontend**: Vanilla JS (ES Modules) + HTML + CSS
- **Comunicação**: IPC (Inter-Process Communication) via `contextBridge`

---

## Estrutura de Pastas

A pasta `src` é o núcleo da aplicação e está dividida responsavelmente:

### 1. `Main_back` (Backend / Main Process)
Contém toda a lógica de negócios e acesso a dados que roda no processo principal do Node.js.
- **Controllers/**: Controladores que gerenciam a lógica das requisições (ex: `UsuarioController.js`). Intermediam entre o IPC e o Model.
- **Models/**: Camada de acesso direto ao banco de dados (ex: `Usuarios.js`). Utiliza SQL preparado para segurança.
- **Database/**: Configuração e inicialização do SQLite (`db.js`).
- **Services/**: Serviços de background, como sincronização de dados (`SyncService.js`).

### 2. `Renderer_front` (Frontend / Renderer Process)
Contém a interface do usuário e lógica de apresentação.
- **Services/**: Serviços do frontend, incluindo Roteamento (`Rotas.js`) e Configurações.
- **Views/**: Classes responsáveis por gerar o HTML e gerenciar eventos de cada "página".
- **Assets**: Arquivos CSS globais (`index.css`).

---

## Fluxo da Informação

O fluxo de dados segue um padrão unidirecional e seguro, isolando o frontend do acesso direto ao sistema/banco de dados.

1. **Ação do Usuário**: O usuário interage com a interface (ex: Clica em "Salvar").
2. **Frontend (View)**:
   - Captura o evento.
   - Chama a API exposta no `window.api` (definida no `preload.js`).
3. **Bridge (Preload)**:
   - `preload.js` recebe a chamada e a encaminha para o Main Process via `ipcRenderer.invoke`.
4. **Main Process (IPC Handler)**:
   - O `main.js` intercepta o evento (ex: `usuarios:cadastrar`).
   - Delega a execução para o **Controller** apropriado.
5. **Controller**:
   - Valida os dados recebidos.
   - Chama o **Model** para persistência.
6. **Model**:
   - Executa a query SQL segura no SQLite.
   - Retorna o resultado para o Controller.
7. **Retorno**:
   - O resultado viaja de volta pelo Controller -> Main -> Preload -> Frontend (Promise resolution).
   - A View atualiza a interface com o feedback.

---

## Sistema de Sincronização

Existe um serviço dedicado (`SyncService`) rodando no Main Process:
- **Auto-Sync**: Um intervalo (`setInterval` de 1 minuto) verifica dados locais não sincronizados (`sync_status = 0`).
- **Estados**:
    - `0`: Pendente de envio.
    - `1`: Sincronizado.
- **Log**: O sistema mantêm logs no console do Main process sobre o ciclo de sincronização.

## Roteamento (Frontend)

O frontend opera como uma **SPA (Single Page Application)** manual:
- Utiliza o evento `hashchange` do navegador (`#usuario_listar`, `#usuario_criar`).
- A classe `Rotas.js` mapeia o hash para uma função que instancia a View correspondente e injeta o HTML no container principal (`#app`).
