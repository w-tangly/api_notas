// Importa o Express, Body-Parser e FS
const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');

const app = express();
const PORT = 3000;
const FILE = 'data.json';

// Permite receber JSON
app.use(bodyParser.json());

// Libera acesso externo
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    next();
})

// Função para ler o arquivo
function readNotes(){
    try{
        const data = fs.readFileSync(FILE);
        return JSON.parse(data);
    } catch {
        return []
    }
}

// Função para salvar o arquivo
function saveNotes(notes){
    fs.writeFileSync(FILE, JSON.stringify(notes, null, 2));
}

// =======================
// GET - listar as notas
// =======================

app.get('/api/notes', (req, res) => {
    const notes = readNotes();
    res.json(notes);
});

// POST - criar uma nova nota
app.post('/api/notes', (req, res) => {
    const notes = readNotes();

    const novaNota = {
        id: Date.now().toString(),
        titulo: req.body.titulo,
        texto: req.body.texto
    };

    notes.push(novaNota);
    saveNotes(notes);

    res.json(novaNota);
});

// ========================
// PUT - Editar uma nota
// ========================
app.put('/api/notes/:id', (req, res) => {
    const notes = readNotes();

    const index = notes.findIndex(n => n.id === req.params.id);

    if(index >= 0){
        notes[index].titulo = req.body.titulo;
        notes[index].texto = req.body.texto;
        saveNotes(notes);
        res.json(notes[index]);
    } else {
        res.status(404).json({ error: 'Nota não encontrada' });
    }
});

// ========================
// DELETE - Excluir uma nota
// ========================
app.delete('/api/notes/:id', (req, res) => {
    const notes = readNotes(); 

    const novasNotas = notes.filter(n => n.id !== req.params.id);

    saveNotes(novasNotas);

    res.json({ message: 'Nota removida' });
});

// Inicia o servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});