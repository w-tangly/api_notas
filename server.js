// Importa Express, Body-Parser, FS e Path
const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const FILE = path.join(__dirname, 'data.json');

// Permite receber JSON
app.use(bodyParser.json());

// Libera acesso externo
// Libera CORS completo para requisições de navegadores (incluindo preflight OPTIONS)
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});

// Função para ler o arquivo
function readNotes(){
    try{
        const data = fs.readFileSync(FILE);
        return JSON.parse(data);
    } catch {
        return []
    }
}
// Serve arquivos estáticos da pasta 'public' (Interface Web)
app.use(express.static(path.join(__dirname, 'public')));

// Função para ler o arquivo de dados
function readNotes() {
    try {
        if (!fs.existsSync(FILE)) {
            fs.writeFileSync(FILE, JSON.stringify([], null, 2));
            return [];
        }
        const data = fs.readFileSync(FILE, 'utf8');
        return JSON.parse(data || '[]');
    } catch (err) {
        console.error('Erro ao ler data.json:', err);
        return [];
    }
}

// Função para salvar o arquivo
function saveNotes(notes){
    fs.writeFileSync(FILE, JSON.stringify(notes, null, 2));
}
// Função para salvar o arquivo de dados
function saveNotes(notes) {
    try {
        fs.writeFileSync(FILE, JSON.stringify(notes, null, 2), 'utf8');
    } catch (err) {
        console.error('Erro ao salvar data.json:', err);
    }
}

// =======================
// GET - listar as notas
// =======================
app.get('/api/notes', (req, res) => {
    const notes = readNotes();
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

// POST - criar uma nova nota
// =======================
// GET - Obter nota específica por ID
// =======================
app.get('/api/notes/:id', (req, res) => {
    const notes = readNotes();
    const note = notes.find(n => String(n.id) === String(req.params.id));

    if (note) {
        res.json(note);
    } else {
        res.status(404).json({ error: 'Nota não encontrada' });
    }
});

// =======================
// POST - Criar uma nova nota
// =======================
app.post('/api/notes', (req, res) => {
    const { titulo, texto, cor } = req.body;

    if (!titulo && !texto) {
        return res.status(400).json({ error: 'Título ou texto devem ser preenchidos.' });
    }

    const notes = readNotes();

    const novaNota = {
        id: Date.now().toString(),
        titulo: req.body.titulo,
        texto: req.body.texto,
        titulo: titulo || 'Sem título',
        texto: texto || '',
        cor: cor || '#ffffff',
        criadoEm: new Date().toISOString(),
        atualizadoEm: new Date().toISOString()
    };

    notes.push(novaNota);
    saveNotes(notes);

    res.json(novaNota);
    res.status(201).json(novaNota);
});

// ========================
// PUT - Editar uma nota
// PUT - Editar uma nota existente
// ========================
app.put('/api/notes/:id', (req, res) => {
    const notes = readNotes();
    const index = notes.findIndex(n => String(n.id) === String(req.params.id));

    if (index >= 0) {
        notes[index].titulo = req.body.titulo !== undefined ? req.body.titulo : notes[index].titulo;
        notes[index].texto = req.body.texto !== undefined ? req.body.texto : notes[index].texto;
        notes[index].cor = req.body.cor !== undefined ? req.body.cor : (notes[index].cor || '#ffffff');
        notes[index].atualizadoEm = new Date().toISOString();

    if(index >= 0){
            notes[index].titulo = req.body.titulo;
            notes[index].texto = req.body.texto;
            saveNotes(notes);
            res.json(notes[index]);
        } else {
            res.status(404).json({ error: 'Nota não encontrada' });
        }
    }
});

// ========================
// DELETE - Excluir uma nota
// ========================
app.delete('/api/notes/:id', (req, res) => {
    const notes = readNotes();
    const initialLength = notes.length;

    const novasNotas = notes.filter(n => String(n.id) !== String(req.params.id));
    if (novasNotas.length === initialLength) {
        return res.status(404).json({ error: 'Nota não encontrada' });
    }

    saveNotes(novasNotas);

    res.json({ message: 'Nota removida' });
    res.json({ message: 'Nota removida com sucesso', id: req.params.id });
});

// Inicia o servidor
app.listen(PORT, () => {console.log(`Servidor rodando em http://localhost:${PORT}`)});