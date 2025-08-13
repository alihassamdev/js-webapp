// === Dashboard.js ===
console.log("Dashboard JS Loaded...")

import { clearSession } from './session.js';

const loginTime = localStorage.getItem("loginTime");
const isLoggedIn = localStorage.getItem("isLoggedIn");

// Auto-logout after 30 minutes
const maxSessionTime = 30 * 60 * 1000;

if (!isLoggedIn || !loginTime || Date.now() - loginTime > maxSessionTime) {
    localStorage.clear();
    window.location.href = "login.html";
} else {
    // Show content
    document.getElementById("pageBody").style.display = "";
    // document.getElementById("userEmailDisplay").textContent = localStorage.getItem("userEmail");
}

// === ID Generator ===
function generateTodoId() {
    return "todo_" + Math.random().toString(36).substr(2, 9);
}

// === Show Selected Content ===
function showSection(sectionId) {
    console.log("Show Items...")
    // Hide all content
    document.querySelectorAll('.content').forEach(section => {
        section.classList.remove('active');
    });

    // Show target section
    document.getElementById(sectionId).classList.add('active');
}

// Sidebar links
document.querySelectorAll('.sidebar-item-link').forEach(link => {
    link.addEventListener('click', e => {
        e.preventDefault();
        const targetId = link.getAttribute('data-target');
        console.log("targetId:", targetId);
        showSection(targetId);
    });
});


const API_URL = "http://localhost:3000/todos";

// === Fetch and Render Todos ===
async function fetchTodos() {
    try {
        const userId = localStorage.getItem("userId");
        const res = await fetch(`${API_URL}?userId=${userId}`);
        const todos = await res.json();
        renderTodos(todos);
    } catch (error) {
        console.error("Error fetching todos:", error);
    }
}

// === Update Status in JSON Server ===
async function updateStatus(id, status) {
    try {
        await fetch(`${API_URL}/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status })
        });
        fetchTodos(); // Refresh after update
    } catch (error) {
        console.error("Error updating status:", error);
    }
}

// === Delete Todo in JSON Server ===
async function deleteTodo(id) {
    try {
        await fetch(`${API_URL}/${id}`, { method: "DELETE" });
        fetchTodos(); // Refresh after delete
    } catch (error) {
        console.error("Error deleting todo:", error);
    }
}

// === Add Todo ===
async function addTodo(text) {
    try {
        const newTodo = {
            id: generateTodoId(),
            userId: localStorage.getItem("userId"),
            text,
            status: "incomplete"
        };

        await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newTodo)
        });

        fetchTodos(); // Refresh after add
    } catch (error) {
        console.error("Error adding todo:", error);
    }
}

// === Update Todo Text ===
async function updateTodoText(id, text) {
    try {
        await fetch(`${API_URL}/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text })
        });
        showSection('dashboard');
        fetchTodos();
    } catch (error) {
        console.error("Error updating todo text:", error);
    }
}

// === Function to render todos ===
function renderTodos(todos) {
    console.log(todos);
    const incompleteList = document.getElementById('incomplete-list');
    const inProgressList = document.getElementById('inprogress-list');
    const completedList = document.getElementById('completed-list');

    // Clear old content
    incompleteList.innerHTML = '';
    inProgressList.innerHTML = '';
    completedList.innerHTML = '';

    // Loop through todos and append to correct section
    todos.forEach(todo => {
        const li = document.createElement('li');
        li.className = 'card';
        li.innerHTML = `
        <div class="card-img"></div>
        <h3 class="card-title">${todo.text}</h3>
        
        <form class="task-status">
                <label>
                    <input type="checkbox" name="task-inprogress" id="task-inprogress-${todo.id}" ${todo.status === 'inprogress' ? 'checked' : ''}>
                    In Progress
                </label>
                <label>
                    <input type="checkbox" name="task-done" id="task-done-${todo.id}" ${todo.status === 'done' ? 'checked' : ''}>
                    Done
                </label>
            </form>

        <div class="card-btns">
                <button type="button" id="delete-btn-${todo.id}">
                    <img src="/assets/img/bin.svg" alt="">
                </button>
                <button type="button" id="edit-btn-${todo.id}">
                    <img src="/assets/img/pencil.svg" alt="">
                </button>
            </div>
`;

        if (todo.status === 'incomplete') {
            incompleteList.appendChild(li);
        }
        else if (todo.status === 'inprogress') {
            inProgressList.appendChild(li);
        }
        else if (todo.status === 'done') {
            completedList.appendChild(li);
        }

        // Handle status changes
        li.querySelector(`#task-inprogress-${todo.id}`).addEventListener('change', (e) => {
            updateStatus(todo.id, e.target.checked ? 'inprogress' : 'incomplete');
        });

        li.querySelector(`#task-done-${todo.id}`).addEventListener('change', (e) => {
            updateStatus(todo.id, e.target.checked ? 'done' : 'incomplete');
        });

        // Handle delete
        li.querySelector(`#delete-btn-${todo.id}`).addEventListener('click', () => {
            deleteTodo(todo.id);
        });

        // Edit event
        li.querySelector(`#edit-btn-${todo.id}`).addEventListener('click', () => {
            document.getElementById("edit-todo-id").value = todo.id;
            document.getElementById("edit-todo-text").value = todo.text;
            showSection('edit-todo');
        });

    });
}

// Handle add-todo form
document.getElementById("add-todo-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const text = document.getElementById("new-todo-text").value.trim();
    if (text) {
        addTodo(text);
        document.getElementById("new-todo-text").value = "";
    }
});

// Handle Edit-todo form
document.getElementById("edit-todo-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const id = document.getElementById("edit-todo-id").value;
    const text = document.getElementById("edit-todo-text").value.trim();
    if (text) {
        updateTodoText(id, text);
    }
});

// Handle Logout 
const logoutBtn = document.getElementById('logout-btn');
logoutBtn.addEventListener('click', () => {
    clearSession();
    window.location.href = "login.html";
});

// Handle Add Items OnClick
document.querySelectorAll('.add-new-task').forEach(link => {
    link.addEventListener('click', e => {
        e.preventDefault();
        showSection('add-items');
    });
});

fetchTodos();