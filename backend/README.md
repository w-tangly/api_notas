# Backend - API Bloco de Notas

API REST desenvolvida em Node.js com Express para gerenciar notas e persistência em arquivo JSON.

## Instalação e Execução

1. Acesse a pasta do backend:
   ```bash
   cd backend
   ```

2. Instale as dependências:
   ```bash
   npm install
   ```

3. Inicie o servidor:
   ```bash
   npm start
   ```
   *(ou `npm run dev` para modo de desenvolvimento com recarregamento automático).*

O servidor iniciará em `http://localhost:3000`.

## Endpoints da API

- `GET /api/notes`: Lista todas as notas (suporta filtro `?search=termo`).
- `GET /api/notes/:id`: Retorna uma nota por ID.
- `POST /api/notes`: Cria uma nova nota.
  - Body JSON: `{ "titulo": "string", "texto": "string", "cor": "#ffffff" }`
- `PUT /api/notes/:id`: Atualiza uma nota existente.
  - Body JSON: `{ "titulo": "string", "texto": "string", "cor": "#ffffff" }`
- `DELETE /api/notes/:id`: Exclui uma nota por ID.

