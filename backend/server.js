// Backend REST API - Bloco de Notas
const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const FILE = path.join(__dirname, 'data.json');

// Middlewares
app.use(bodyParser.json());

// CORS completo para permitir requisições de origens externas (incluindo o frontend separado)
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});

// Funções de leitura e gravação no data.json
function readNotes() {
    try {
        if (!fs.existsSync(FILE)) {
            fs.writeFileSync(FILE, JSON.stringify([], null, 2), 'utf8');
            return [];
        }
        const data = fs.readFileSync(FILE, 'utf8');
        return JSON.parse(data || '[]');
    } catch (err) {
        console.error('Erro ao ler data.json:', err);
        return [];
    }
}

function saveNotes(notes) {
    try {
        fs.writeFileSync(FILE, JSON.stringify(notes, null, 2), 'utf8');
    } catch (err) {
        console.error('Erro ao salvar data.json:', err);
    }
}

// ==========================================
// Rotas da API (CRUD)
// ==========================================

// 1. GET /api/notes - Listar notas (com suporte a ?search=)
app.get('/api/notes', (req, res) => {
    let notes = readNotes();
    const { search } = req.query;

    if (search) {
        const termo = search.toLowerCase();
        notes = notes.filter(n =>
            (n.titulo && n.titulo.toLowerCase().includes(termo)) ||
            (n.texto && n.texto.toLowerCase().includes(termo))
        );
    }

    res.json(notes);
});

// 2. GET /api/notes/:id - Obter nota específica
app.get('/api/notes/:id', (req, res) => {
    const notes = readNotes();
    const note = notes.find(n => String(n.id) === String(req.params.id));

    if (note) {
        res.json(note);
    } else {
        res.status(404).json({ error: 'Nota não encontrada' });
    }
});

// 3. POST /api/notes - Criar uma nova nota
app.post('/api/notes', (req, res) => {
    const { titulo, texto, cor } = req.body;

    if (!titulo && !texto) {
        return res.status(400).json({ error: 'Título ou texto devem ser preenchidos.' });
    }

    const notes = readNotes();

    const novaNota = {
        id: Date.now().toString(),
        titulo: titulo || 'Sem título',
        texto: texto || '',
        cor: cor || '#ffffff',
        criadoEm: new Date().toISOString(),
        atualizadoEm: new Date().toISOString()
    };

    notes.push(novaNota);
    saveNotes(notes);

    res.status(201).json(novaNota);
});

// 4. PUT /api/notes/:id - Editar nota existente
app.put('/api/notes/:id', (req, res) => {
    const notes = readNotes();
    const index = notes.findIndex(n => String(n.id) === String(req.params.id));

    if (index >= 0) {
        notes[index].titulo = req.body.titulo !== undefined ? req.body.titulo : notes[index].titulo;
        notes[index].texto = req.body.texto !== undefined ? req.body.texto : notes[index].texto;
        notes[index].cor = req.body.cor !== undefined ? req.body.cor : (notes[index].cor || '#ffffff');
        notes[index].atualizadoEm = new Date().toISOString();

        saveNotes(notes);
        res.json(notes[index]);
    } else {
        res.status(404).json({ error: 'Nota não encontrada' });
    }
});

// 5. DELETE /api/notes/:id - Excluir nota
app.delete('/api/notes/:id', (req, res) => {
    const notes = readNotes();
    const initialLength = notes.length;
    const novasNotas = notes.filter(n => String(n.id) !== String(req.params.id));

    if (novasNotas.length === initialLength) {
        return res.status(404).json({ error: 'Nota não encontrada' });
    }

    saveNotes(novasNotas);
    res.json({ message: 'Nota removida com sucesso', id: req.params.id });
});

// Inicialização do servidor
app.listen(PORT, () => {
    console.log(`Backend rodando em http://localhost:${PORT}`);
});

