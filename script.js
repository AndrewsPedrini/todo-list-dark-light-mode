// Seletores principais
const body = document.body;
const themeToggleBtn = document.getElementById("theme-toggle");
const taskForm = document.getElementById("task-form");
const taskInput = document.getElementById("task-input");
const taskList = document.getElementById("task-list");
const filterButtons = document.querySelectorAll(".filter-btn");
const taskCounter = document.getElementById("task-counter");

// Estado
let tasks = [];
let currentFilter = "all";

// Chaves do localStorage
const TASKS_KEY = "todo_tasks_v1";
const THEME_KEY = "todo_theme_v1";

// ======= THEME =======

function loadTheme() {
  const savedTheme = localStorage.getItem(THEME_KEY);
  if (savedTheme === "dark") {
    body.classList.remove("light-theme");
    body.classList.add("dark-theme");
    themeToggleBtn.textContent = "🌙 Escuro";
  } else {
    body.classList.remove("dark-theme");
    body.classList.add("light-theme");
    themeToggleBtn.textContent = "🌞 Claro";
  }
}

function toggleTheme() {
  const isDark = body.classList.contains("dark-theme");
  if (isDark) {
    body.classList.remove("dark-theme");
    body.classList.add("light-theme");
    localStorage.setItem(THEME_KEY, "light");
    themeToggleBtn.textContent = "🌞 Claro";
  } else {
    body.classList.remove("light-theme");
    body.classList.add("dark-theme");
    localStorage.setItem(THEME_KEY, "dark");
    themeToggleBtn.textContent = "🌙 Escuro";
  }
}

themeToggleBtn.addEventListener("click", toggleTheme);

// ======= TASKS / STORAGE =======

function loadTasks() {
  const saved = localStorage.getItem(TASKS_KEY);
  if (saved) {
    try {
      tasks = JSON.parse(saved);
    } catch (error) {
      tasks = [];
    }
  }
}

function saveTasks() {
  localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
}

function updateCounter() {
  const total = tasks.length;
  const remaining = tasks.filter((t) => !t.completed).length;
  taskCounter.textContent = `${remaining} de ${total} tarefas pendentes`;
}

function createTaskElement(task) {
  const li = document.createElement("li");
  li.classList.add("task-item");
  li.dataset.id = task.id;

  if (task.completed) {
    li.classList.add("completed");
  }

  li.innerHTML = `
    <div class="task-main">
      <input type="checkbox" class="task-checkbox" ${
        task.completed ? "checked" : ""
      } />
      <span class="task-text">${task.text}</span>
    </div>
    <div class="task-actions">
      <button class="edit-btn">Editar</button>
      <button class="delete-btn">Excluir</button>
    </div>
  `;

  return li;
}

function renderTasks() {
  taskList.innerHTML = "";

  const filtered = tasks.filter((task) => {
    if (currentFilter === "active") return !task.completed;
    if (currentFilter === "completed") return task.completed;
    return true;
  });

  if (filtered.length === 0) {
    const empty = document.createElement("li");
    empty.classList.add("task-item");
    empty.innerHTML =
      '<span class="task-text">Nenhuma tarefa por aqui ainda...</span>';
    taskList.appendChild(empty);
  } else {
    filtered.forEach((task) => {
      const li = createTaskElement(task);
      taskList.appendChild(li);
    });
  }

  updateCounter();
}

function addTask(text) {
  const trimmed = text.trim();
  if (!trimmed) return;

  const newTask = {
    id: Date.now().toString(),
    text: trimmed,
    completed: false,
  };

  tasks.push(newTask);
  saveTasks();
  renderTasks();
}

function deleteTask(id) {
  tasks = tasks.filter((task) => task.id !== id);
  saveTasks();
  renderTasks();
}

function toggleTask(id) {
  tasks = tasks.map((task) =>
    task.id === id ? { ...task, completed: !task.completed } : task
  );
  saveTasks();
  renderTasks();
}

function editTask(id) {
  const task = tasks.find((t) => t.id === id);
  if (!task) return;

  const newText = prompt("Editar tarefa:", task.text);
  if (newText === null) return; // cancelou
  const trimmed = newText.trim();
  if (!trimmed) return;

  task.text = trimmed;
  saveTasks();
  renderTasks();
}

// ======= EVENTOS =======

// Submit do formulário
taskForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const value = taskInput.value;
  addTask(value);
  taskInput.value = "";
  taskInput.focus();
});

// Clique dentro da lista (delegação)
taskList.addEventListener("click", (e) => {
  const li = e.target.closest(".task-item");
  if (!li) return;
  const id = li.dataset.id;

  if (e.target.classList.contains("task-checkbox")) {
    toggleTask(id);
  }

  if (e.target.classList.contains("delete-btn")) {
    deleteTask(id);
  }

  if (e.target.classList.contains("edit-btn")) {
    editTask(id);
  }
});

// Filtros
filterButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    filterButtons.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    currentFilter = btn.dataset.filter;
    renderTasks();
  });
});

// ======= INICIALIZAÇÃO =======

loadTheme();
loadTasks();
renderTasks();
updateCounter();
