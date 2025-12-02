const TodoApp = {
    todos: [],
    currentTab: 'active',
    nextId: 1,

    init() {
        this.loadFromStorage();
        this.bindEvents();
        this.render();
    },

    // ---------- Speicherung ----------
    saveToStorage() {
        localStorage.setItem('todos', JSON.stringify(this.todos));
        localStorage.setItem('nextId', this.nextId);
    },

    loadFromStorage() {
        const savedTodos = localStorage.getItem('todos');
        const savedId = localStorage.getItem('nextId');
        if (savedTodos) this.todos = JSON.parse(savedTodos);
        if (savedId) this.nextId = parseInt(savedId);
    },

    // ---------- Funktionen ----------
    addTodo() {
        const input = document.getElementById('todoInput');
        const text = input.value.trim();
        if (!text) return;

        const todo = {
            id: this.nextId++,
            text,
            completed: false,
            archived: false,
            createdAt: new Date()
        };

        this.todos.push(todo);
        this.saveToStorage();
        input.value = '';
        this.render();
    },

    deleteTodo(id) {
        if (confirm('Möchtest du diese Aufgabe wirklich löschen?')) {
            this.todos = this.todos.filter(todo => todo.id !== id);
            this.saveToStorage();
            this.render();
        }
    },

    completeTodo(id) {
        const todo = this.todos.find(t => t.id === id);
        if (todo) todo.completed = !todo.completed;
        this.saveToStorage();
        this.render();
    },

    archiveTodo(id) {
        const todo = this.todos.find(t => t.id === id);
        if (todo) {
            todo.archived = !todo.archived;
            if (todo.archived) todo.completed = true;
        }
        this.saveToStorage();
        this.render();
    },

    restoreTodo(id) {
        const todo = this.todos.find(t => t.id === id);
        if (todo) {
            todo.archived = false;
            todo.completed = false;
        }
        this.saveToStorage();
        this.render();
    },

    // ---------- Rendering ----------
    render() {
        const list = document.getElementById('todoList');
        list.innerHTML = '';

        let filteredTodos = [];
        if (this.currentTab === 'active') {
            filteredTodos = this.todos.filter(t => !t.completed && !t.archived);
        } else if (this.currentTab === 'completed') {
            filteredTodos = this.todos.filter(t => t.completed && !t.archived);
        } else if (this.currentTab === 'archived') {
            filteredTodos = this.todos.filter(t => t.archived);
        }

        if (filteredTodos.length === 0) {
            list.innerHTML = `<div class="empty-state">Keine Aufgaben vorhanden.</div>`;
            return;
        }

        filteredTodos.forEach(todo => {
            const item = document.createElement('div');
            item.className = `todo-item ${todo.completed ? 'completed' : ''} ${todo.archived ? 'archived' : ''}`;

            const span = document.createElement('span');
            span.textContent = todo.text;
            span.onclick = () => this.completeTodo(todo.id);

            const actions = document.createElement('div');
            actions.className = 'actions';

            if (!todo.archived) {
                const archiveBtn = document.createElement('button');
                archiveBtn.className = 'archive-btn';
                archiveBtn.textContent = '📦';
                archiveBtn.title = 'Archivieren';
                archiveBtn.onclick = () => this.archiveTodo(todo.id);
                actions.appendChild(archiveBtn);
            }

            if (todo.archived) {
                const restoreBtn = document.createElement('button');
                restoreBtn.className = 'restore-btn';
                restoreBtn.textContent = '↩️';
                restoreBtn.title = 'Wiederherstellen';
                restoreBtn.onclick = () => this.restoreTodo(todo.id);
                actions.appendChild(restoreBtn);
            }

            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'delete-btn';
            deleteBtn.textContent = '🗑️';
            deleteBtn.title = 'Löschen';
            deleteBtn.onclick = () => this.deleteTodo(todo.id);
            actions.appendChild(deleteBtn);

            item.appendChild(span);
            item.appendChild(actions);

            list.appendChild(item);
        });

        this.updateStats();
    },

    updateStats() {
        const active = this.todos.filter(t => !t.completed && !t.archived).length;
        const completed = this.todos.filter(t => t.completed && !t.archived).length;
        const archived = this.todos.filter(t => t.archived).length;

        document.getElementById('activeCount').textContent = active;
        document.getElementById('completedCount').textContent = completed;
        document.getElementById('archivedCount').textContent = archived;
    },

    bindEvents() {
        document.getElementById('addButton').onclick = () => this.addTodo();
        document.getElementById('todoInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addTodo();
        });

        document.querySelectorAll('.tab').forEach(tab => {
            tab.onclick = () => {
                document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                this.currentTab = tab.dataset.tab;
                this.render();
            };
        });
    }
};

// App starten
window.onload = () => TodoApp.init();
