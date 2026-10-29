// Elementos do DOM e Configuração da API
const API_URL = 'http://localhost:3000/api/notes';

const notesGrid = document.getElementById('notesGrid');
const emptyState = document.getElementById('emptyState');
const notesCount = document.getElementById('notesCount');
const sectionTitle = document.getElementById('sectionTitle');
const searchInput = document.getElementById('searchInput');
const clearSearchBtn = document.getElementById('clearSearchBtn');

const noteModal = document.getElementById('noteModal');
const noteForm = document.getElementById('noteForm');
const modalTitle = document.getElementById('modalTitle');
const noteIdInput = document.getElementById('noteId');
const noteTitleInput = document.getElementById('noteTitleInput');
const noteContentInput = document.getElementById('noteContentInput');

const openCreateModalBtn = document.getElementById('openCreateModalBtn');
const emptyCreateBtn = document.getElementById('emptyCreateBtn');
const closeModalBtn = document.getElementById('closeModalBtn');
const cancelModalBtn = document.getElementById('cancelModalBtn');
const toastEl = document.getElementById('toast');

let currentNotes = [];
let toastTimeout = null;

// ==========================================
// Utilitários e Notificações (Toast)
// ==========================================
function showToast(message, duration = 3000) {
  if (!toastEl) return;
  toastEl.textContent = message;
  toastEl.style.display = 'block';

  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    toastEl.style.display = 'none';
  }, duration);
}

function formatDate(isoString) {
  if (!isoString) return '';
  try {
    const date = new Date(isoString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return '';
  }
}

// ==========================================
// Requisições para o Backend (CRUD)
// ==========================================

// 1. Listar notas (GET)
async function loadNotes(searchTerm = '') {
  try {
    const url = searchTerm ? `${API_URL}?search=${encodeURIComponent(searchTerm)}` : API_URL;
    const response = await fetch(url);
    if (!response.ok) throw new Error('Falha ao buscar notas da API');
    
    currentNotes = await response.json();
    renderNotes(currentNotes, searchTerm);
  } catch (err) {
    console.error('Erro na requisição GET /api/notes:', err);
    showToast('Erro ao carregar as notas do servidor.');
  }
}

// 2. Renderizar notas na tela
function renderNotes(notes, searchTerm = '') {
  notesGrid.innerHTML = '';
  const count = notes.length;
  notesCount.textContent = count === 1 ? '1 nota' : `${count} notas`;

  if (searchTerm) {
    sectionTitle.textContent = `Resultados para "${searchTerm}"`;
  } else {
    sectionTitle.textContent = 'Todas as Notas';
  }

  if (count === 0) {
    emptyState.style.display = 'block';
    notesGrid.style.display = 'none';
    return;
  }

  emptyState.style.display = 'none';
  notesGrid.style.display = 'grid';

  notes.forEach(note => {
    const card = document.createElement('article');
    card.className = 'note-card';
    card.style.backgroundColor = note.cor || '#ffffff';

    const cardBody = document.createElement('div');
    cardBody.className = 'note-card-body';

    const titleEl = document.createElement('h3');
    titleEl.className = 'note-title';
    titleEl.textContent = note.titulo || 'Sem título';

    const textEl = document.createElement('p');
    textEl.className = 'note-text';
    textEl.textContent = note.texto || '';

    cardBody.appendChild(titleEl);
    if (note.texto) cardBody.appendChild(textEl);

    const cardFooter = document.createElement('footer');
    cardFooter.className = 'note-footer';

    const dateEl = document.createElement('span');
    dateEl.className = 'note-date';
    dateEl.textContent = formatDate(note.atualizadoEm || note.criadoEm);

    const actionsEl = document.createElement('div');
    actionsEl.className = 'note-actions';

    const editBtn = document.createElement('button');
    editBtn.className = 'card-action-btn edit-action';
    editBtn.title = 'Editar Nota';
    editBtn.innerHTML = '✏️ Editar';
    editBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      openEditModal(note);
    });

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'card-action-btn delete-action';
    deleteBtn.title = 'Excluir Nota';
    deleteBtn.innerHTML = '🗑️ Excluir';
    deleteBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      handleDelete(note.id, note.titulo);
    });

    actionsEl.appendChild(editBtn);
    actionsEl.appendChild(deleteBtn);

    cardFooter.appendChild(dateEl);
    cardFooter.appendChild(actionsEl);

    card.appendChild(cardBody);
    card.appendChild(cardFooter);

    // Clique no card também permite editar
    card.addEventListener('click', () => openEditModal(note));

    notesGrid.appendChild(card);
  });
}

// 3. Salvar nota (POST ou PUT)
async function handleSaveNote(event) {
  event.preventDefault();

  const id = noteIdInput.value;
  const titulo = noteTitleInput.value.trim();
  const texto = noteContentInput.value.trim();
  const selectedColor = document.querySelector('input[name="noteColor"]:checked')?.value || '#ffffff';

  if (!titulo && !texto) {
    alert('Preencha ao menos o título ou o conteúdo da nota.');
    return;
  }

  const payload = {
    titulo,
    texto,
    cor: selectedColor
  };

  try {
    let response;
    if (id) {
      // Edição (PUT)
      response = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!response.ok) throw new Error('Erro ao atualizar nota');
      showToast('Nota atualizada com sucesso!');
    } else {
      // Criação (POST)
      response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!response.ok) throw new Error('Erro ao criar nota');
      showToast('Nota criada com sucesso!');
    }

    closeModal();
    loadNotes(searchInput.value.trim());
  } catch (err) {
    console.error('Erro ao salvar:', err);
    showToast('Não foi possível salvar a nota.');
  }
}

// 4. Excluir nota (DELETE)
async function handleDelete(id, titulo) {
  const confirmMsg = titulo ? `Deseja realmente excluir a nota "${titulo}"?` : 'Deseja realmente excluir esta nota?';
  if (!confirm(confirmMsg)) return;

  try {
    const response = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
    if (!response.ok) throw new Error('Erro ao deletar nota');

    showToast('Nota removida com sucesso!');
    loadNotes(searchInput.value.trim());
  } catch (err) {
    console.error('Erro ao excluir:', err);
    showToast('Não foi possível excluir a nota.');
  }
}

// ==========================================
// Controle do Modal
// ==========================================
function openCreateModal() {
  modalTitle.textContent = 'Nova Nota';
  noteIdInput.value = '';
  noteTitleInput.value = '';
  noteContentInput.value = '';

  const defaultColor = document.querySelector('input[name="noteColor"][value="#ffffff"]');
  if (defaultColor) defaultColor.checked = true;

  noteModal.classList.add('active');
  noteModal.setAttribute('aria-hidden', 'false');
  setTimeout(() => noteTitleInput.focus(), 50);
}

function openEditModal(note) {
  modalTitle.textContent = 'Editar Nota';
  noteIdInput.value = note.id;
  noteTitleInput.value = note.titulo || '';
  noteContentInput.value = note.texto || '';

  const noteColor = note.cor || '#ffffff';
  const colorRadio = document.querySelector(`input[name="noteColor"][value="${noteColor}"]`);
  if (colorRadio) {
    colorRadio.checked = true;
  } else {
    const fallbackColor = document.querySelector('input[name="noteColor"][value="#ffffff"]');
    if (fallbackColor) fallbackColor.checked = true;
  }

  noteModal.classList.add('active');
  noteModal.setAttribute('aria-hidden', 'false');
  setTimeout(() => noteTitleInput.focus(), 50);
}

function closeModal() {
  noteModal.classList.remove('active');
  noteModal.setAttribute('aria-hidden', 'true');
}

// Event Listeners do Modal
openCreateModalBtn.addEventListener('click', openCreateModal);
emptyCreateBtn.addEventListener('click', openCreateModal);
closeModalBtn.addEventListener('click', closeModal);
cancelModalBtn.addEventListener('click', closeModal);
noteForm.addEventListener('submit', handleSaveNote);

// Fechar modal clicando fora
noteModal.addEventListener('click', (e) => {
  if (e.target === noteModal) closeModal();
});

// Fechar com tecla Escape
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && noteModal.classList.contains('active')) {
    closeModal();
  }
});

// ==========================================
// Pesquisa com debounce
// ==========================================
let debounceTimer = null;

searchInput.addEventListener('input', (e) => {
  const query = e.target.value;
  clearSearchBtn.style.display = query.length > 0 ? 'block' : 'none';

  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    loadNotes(query.trim());
  }, 250);
});

clearSearchBtn.addEventListener('click', () => {
  searchInput.value = '';
  clearSearchBtn.style.display = 'none';
  loadNotes();
  searchInput.focus();
});

// ==========================================
// Inicialização
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
  loadNotes();
});

