# Bloco de Notas (Full Stack Desacoplado)

Este projeto foi estruturado em dois projetos completamente individuais e desacoplados:

- **[backend/](file:///c:/Users/Pedro%20Campos/Desktop/api_notas/backend)**: API REST em Node.js com Express e persistência em arquivo JSON.
- **[frontend/](file:///c:/Users/Pedro%20Campos/Desktop/api_notas/frontend)**: Interface Web moderna desenvolvida em HTML5, CSS3 e JavaScript Vanilla.

---

## Estrutura de Pastas

```text
api_notas/
├── backend/
│   ├── data.json          # Persistência de dados
│   ├── package.json       # Dependências e scripts do backend (porta 3000)
│   ├── README.md          # Documentação específica da API
│   └── server.js          # Servidor Express com APIs CRUD
│
├── frontend/
│   ├── app.js             # Lógica e consumo da API REST
│   ├── index.html         # Estrutura visual da aplicação
│   ├── package.json       # Scripts do frontend (porta 5000)
│   ├── README.md          # Documentação específica da interface
│   ├── server.js          # Servidor estático nativo do frontend
│   └── style.css          # Estilização moderna e responsiva
│
├── package.json           # Scripts para conveniência no nível raiz
└── README.md              # Documentação geral do workspace
```

---

## Como Executar

Você pode executar cada projeto individualmente em seus respectivos diretórios:

### 1. Executar o Backend
Abra um terminal:
```bash
cd backend
npm install   # apenas na primeira vez
npm start
```
> O backend iniciará em **http://localhost:3000** e responderá às rotas em `/api/notes`.

### 2. Executar o Frontend
Abra um segundo terminal:
```bash
cd frontend
npm start
```
> O frontend iniciará em **http://localhost:5000**. Ao abrir no navegador, a interface se comunicará diretamente com o backend na porta 3000 via CORS.

---

### Executar a partir da Raiz (Opcional)
Se preferir gerenciar a partir da pasta raiz:
- Para o backend: `npm run start:backend`
- Para o frontend: `npm run start:frontend`

