/**
 * Todo List Application
 * Local storage-based task management system
 */

const STORAGE_KEY = 'todolist_tasks';
const FILTER_KEY = 'todolist_filter';

let todos = [];
let currentFilter = 'all';
let editingId = null;

/**
 * Initialize the application
 */
function init() {
    loadTodos();
    currentFilter = localStorage.getItem(FILTER_KEY) || 'all';
    renderTodos();
    setupEventListeners();
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
    const input = document.getElementById('todoInput');
    
    // Add todo on Enter key
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            showAddModal();
        }
    });
}

/**
 * Load todos from local storage
 */
function loadTodos() {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        todos = stored ? JSON.parse(stored) : [];
    } catch (error) {
        console.error('Error loading todos:', error);
        todos = [];
    }
}

/**
 * Save todos to local storage
 */
function saveTodos() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
    } catch (error) {
        console.error('Error saving todos:', error);
    }
}

/**
 * Show add/edit modal
 */
function showAddModal(todoId = null) {
    const modal = document.getElementById('todoModal');
    const input = document.getElementById('todoInput');
    const title = document.getElementById('modalTitle');
    
    // Reset form
    document.getElementById('modalTitle2').value = '';
    document.getElementById('modalDescription').value = '';
    document.getElementById('modalPriority').value = 'medium';
    document.getElementById('modalDueDate').value = '';
    
    if (todoId !== null) {
        // Edit mode
        editingId = todoId;
        title.textContent = 'Edit Task';
        
        const todo = todos.find(t => t.id === todoId);
        if (todo) {
            document.getElementById('modalTitle2').value = todo.title;
            document.getElementById('modalDescription').value = todo.description || '';
            document.getElementById('modalPriority').value = todo.priority || 'medium';
            document.getElementById('modalDueDate').value = todo.dueDate || '';
        }
    } else {
        // Add mode
        editingId = null;
        title.textContent = 'Add New Task';
        
        // Populate from quick input if exists
        const quickText = input.value.trim();
        if (quickText) {
            document.getElementById('modalTitle2').value = quickText;
            input.value = '';
        }
    }
    
    modal.classList.add('active');
    document.getElementById('modalTitle2').focus();
}

/**
 * Close modal
 */
function closeModal() {
    const modal = document.getElementById('todoModal');
    modal.classList.remove('active');
    editingId = null;
}

/**
 * Save todo
 */
function saveTodo() {
    const title = document.getElementById('modalTitle2').value.trim();
    const description = document.getElementById('modalDescription').value.trim();
    const priority = document.getElementById('modalPriority').value;
    const dueDate = document.getElementById('modalDueDate').value;
    
    if (!title) {
        alert('Please enter a task title');
        return;
    }
    
    if (editingId !== null) {
        // Update existing todo
        const todo = todos.find(t => t.id === editingId);
        if (todo) {
            todo.title = title;
            todo.description = description;
            todo.priority = priority;
            todo.dueDate = dueDate;
            todo.updatedAt = new Date().toISOString();
        }
    } else {
        // Add new todo
        const newTodo = {
            id: Date.now(),
            title: title,
            description: description,
            priority: priority,
            dueDate: dueDate,
            completed: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        todos.unshift(newTodo);
    }
    
    saveTodos();
    renderTodos();
    closeModal();
}

/**
 * Toggle todo completion
 */
function toggleTodo(id) {
    const todo = todos.find(t => t.id === id);
    if (todo) {
        todo.completed = !todo.completed;
        todo.updatedAt = new Date().toISOString();
        saveTodos();
        renderTodos();
    }
}

/**
 * Delete todo
 */
function deleteTodo(id) {
    if (confirm('Are you sure you want to delete this task?')) {
        todos = todos.filter(t => t.id !== id);
        saveTodos();
        renderTodos();
    }
}

/**
 * Filter todos
 */
function filterTodos(filter) {
    currentFilter = filter;
    localStorage.setItem(FILTER_KEY, filter);
    
    // Update active button
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    renderTodos();
}

/**
 * Get filtered todos
 */
function getFilteredTodos() {
    switch (currentFilter) {
        case 'active':
            return todos.filter(t => !t.completed);
        case 'completed':
            return todos.filter(t => t.completed);
        default:
            return todos;
    }
}

/**
 * Format date
 */
function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

/**
 * Render todos
 */
function renderTodos() {
    const todoList = document.getElementById('todoList');
    const emptyState = document.getElementById('emptyState');
    const filteredTodos = getFilteredTodos();
    
    // Update stats
    const total = todos.length;
    const completed = todos.filter(t => t.completed).length;
    document.getElementById('totalCount').textContent = total;
    document.getElementById('completedCount').textContent = completed;
    document.getElementById('footerText').textContent = 
        `${todos.filter(t => !t.completed).length} task${todos.filter(t => !t.completed).length !== 1 ? 's' : ''} remaining`;
    
    if (filteredTodos.length === 0) {
        todoList.innerHTML = '';
        emptyState.style.display = 'block';
    } else {
        emptyState.style.display = 'none';
        todoList.innerHTML = filteredTodos.map(todo => `
            <li class="todo-item ${todo.completed ? 'completed' : ''}">
                <input 
                    type="checkbox" 
                    class="checkbox" 
                    ${todo.completed ? 'checked' : ''}
                    onchange="toggleTodo(${todo.id})"
                >
                <div class="todo-content">
                    <div class="todo-text">${escapeHtml(todo.title)}</div>
                    <div class="todo-meta">
                        ${todo.description ? `<span>📝 ${escapeHtml(todo.description)}</span>` : ''}
                        <span class="todo-priority priority-${todo.priority}">${todo.priority}</span>
                        ${todo.dueDate ? `<span>📅 ${formatDate(todo.dueDate)}</span>` : ''}
                    </div>
                </div>
                <div class="todo-actions">
                    <button class="btn-small btn-edit" onclick="showAddModal(${todo.id})">✏️ Edit</button>
                    <button class="btn-small btn-delete" onclick="deleteTodo(${todo.id})">🗑️ Delete</button>
                </div>
            </li>
        `).join('');
    }
}

/**
 * Clear completed todos
 */
function clearCompleted() {
    if (confirm('Clear all completed tasks?')) {
        todos = todos.filter(t => !t.completed);
        saveTodos();
        renderTodos();
    }
}

/**
 * Export todos as JSON
 */
function exportTodos() {
    const dataStr = JSON.stringify(todos, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `todos_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
}

/**
 * Escape HTML special characters
 */
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

/**
 * Import todos from JSON file
 */
function importTodos(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const imported = JSON.parse(e.target.result);
            if (Array.isArray(imported)) {
                todos = [...todos, ...imported];
                saveTodos();
                renderTodos();
                alert('Todos imported successfully!');
            }
        } catch (error) {
            alert('Error importing todos: ' + error.message);
        }
    };
    reader.readAsText(file);
}

/**
 * Close modal when clicking outside
 */
document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('todoModal');
    
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });
    
    // Initialize app
    init();
});

/**
 * Keyboard shortcuts
 */
document.addEventListener('keydown', (e) => {
    // Press Escape to close modal
    if (e.key === 'Escape') {
        closeModal();
    }
});
