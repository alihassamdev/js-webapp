// === Dashboard.js ===
console.log("Dashboard JS Loaded...");

import { clearSession } from './session.js';

const loginTime = localStorage.getItem("loginTime");
const isLoggedIn = localStorage.getItem("isLoggedIn");

const imagePath = "/assets/img/todo-images/";

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

// Mobile SideBar Toggle Btn
const sidebarToggleBtn = document.getElementById("sidebar-toggle-btn");
const sidebar = document.querySelector(".sidebar");

sidebarToggleBtn.addEventListener("click", () => {
    sidebar.classList.toggle("open");
});

// Optional: close sidebar when clicking outside
document.addEventListener("click", (e) => {
    if (window.innerWidth <= 768 && sidebar.classList.contains("open")) {
        if (!sidebar.contains(e.target) && !sidebarToggleBtn.contains(e.target)) {
            sidebar.classList.remove("open");
        }
    }
});

// Handle Dashboard Click
document.querySelector(".logo a").addEventListener("click", function(e) {
    e.preventDefault(); // optional, only if you want to control navigation
    window.location.href = "dashboard.html";
});


// === Fetch and Render Todos ===
const API_URL = "http://localhost:3000/todos";

let allTodos = []; // store all todos fetched

async function fetchTodos() {
    try {
        const userId = localStorage.getItem("userId");
        const res = await fetch(`${API_URL}?userId=${userId}`);
        const todos = await res.json();
        allTodos = todos; // save all todos here
        renderTodos(todos);
    } catch (error) {
        console.error("Error fetching todos:", error);
    }
}

// === Search Handler ===
const searchInput = document.getElementById("search-todo-text");
const searchBtn = document.getElementById("search-todo-btn");
const listContainer = document.getElementById("search-results-list");

// Function to render any todo list into the single container
function renderSearchTodos(todos) {
    listContainer.innerHTML = "";

    if (todos.length === 0) {
        listContainer.innerHTML = `<li class="no-results">No Todos Found</li>`;
        return;
    }

    todos.forEach(todo => {
        const li = document.createElement('li');
        li.className = 'card';
        li.innerHTML = `
            <div class="card-img">
                <img class="todo-img" src="${imagePath + todo.imageName}" alt="todo-image" data-id="${todo.id}"/>
            </div>
            <h3 class="card-title">${todo.text}</h3>
            
            <form class="task-status">
                <label>
                    <input type="checkbox" name="task-inprogress" id="task-inprogress-${todo.id}" 
                        ${todo.status === 'inprogress' ? 'checked' : ''}>
                    In Progress
                </label>
                <label>
                    <input type="checkbox" name="task-done" id="task-done-${todo.id}" 
                        ${todo.status === 'done' ? 'checked' : ''}>
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
        listContainer.appendChild(li);

        // Attach same listeners as in renderTodos
        li.querySelector(`#task-inprogress-${todo.id}`).addEventListener('change', (e) => {
            updateStatus(todo.id, e.target.checked ? 'inprogress' : 'incomplete');
        });

        li.querySelector(`#task-done-${todo.id}`).addEventListener('change', (e) => {
            updateStatus(todo.id, e.target.checked ? 'done' : 'incomplete');
        });

        li.querySelector(`#delete-btn-${todo.id}`).addEventListener('click', () => {
            deleteTodo(todo.id);
        });

        li.querySelector(`#edit-btn-${todo.id}`).addEventListener('click', () => {
            document.getElementById("edit-todo-id").value = todo.id;
            document.getElementById("edit-todo-text").value = todo.text;
            showSection('edit-todo');
        });

        // Add fallback image logic
        li.querySelectorAll('img.todo-img').forEach(img => {
            img.onerror = () => {
                img.src = imagePath+"default.png";  
            };
        });
    });
}


// Search click event
searchBtn.addEventListener("click", () => {
    const query = searchInput.value.trim().toLowerCase();
    const filtered = query === ""
        ? allTodos
        : allTodos.filter(todo => todo.text.toLowerCase().includes(query));

    renderSearchTodos(filtered);

    showSection('search-todo');
});



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
        <div class="card-img"><img class="todo-img" src="${imagePath + todo.imageName}" alt="todo-image" data-id="${todo.id}" /></div>
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

        // Add fallback image logic
        li.querySelectorAll('img.todo-img').forEach(img => {
            img.onerror = () => {
                img.src = imagePath+"default.png";  
            };
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
    console.log(imagePath);
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

// Handle Add Items OnClick
document.getElementById('update-user-btn').addEventListener('click', e => {
    e.preventDefault();
    fillUserProfileForm();
    showSection('update-user-profile');
});

// Handle the Add Items Button State
const newTodoInput = document.getElementById("new-todo-text");
const addItemsBtn = document.getElementById("add-items-btn");

const editTodoInput = document.getElementById("edit-todo-text");
const updateItemsBtn = document.getElementById("update-items-btn");

function toggleButtonState(input, button) {
    button.disabled = input.value.trim() === "";
}

// Input Event Listeners
newTodoInput.addEventListener("input", () => toggleButtonState(newTodoInput, addItemsBtn));
editTodoInput.addEventListener("input", () => toggleButtonState(editTodoInput, updateItemsBtn));

// Run on page load
toggleButtonState(newTodoInput, addItemsBtn);
toggleButtonState(editTodoInput, updateItemsBtn);

fetchTodos();


// ====================================================================
const USERS_API_URL = "http://localhost:3000/users";

async function fillUserProfileForm() {
    try {
        const userId = localStorage.getItem("userId");
        const res = await fetch(`${USERS_API_URL}/${userId}`);
        if (!res.ok) throw new Error("Failed to fetch user profile");

        const user = await res.json();

        // Fill the form fields
        document.getElementById("update-user-name").value = user.name || "";
        document.getElementById("update-user-surname").value = user.surname || "";
        document.getElementById("update-user-phone").value = user.phoneNum || "";
        document.getElementById("update-user-email").value = user.email || "";
        document.getElementById("update-user-password").value = user.password || "";
    } catch (error) {
        console.error("Error loading user profile:", error);
    }
}

document.getElementById("update-user-form").addEventListener("submit", async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    const userId = localStorage.getItem("userId");
    const updatedUser = {
        name: document.getElementById("update-user-name").value.trim(),
        surname: document.getElementById("update-user-surname").value.trim(),
        phoneNum: document.getElementById("update-user-phone").value.trim(),
        email: document.getElementById("update-user-email").value.trim(),
        password: document.getElementById("update-user-password").value.trim(),
    };

    try {
        await fetch(`${USERS_API_URL}/${userId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updatedUser)
        });

        alert("Profile updated successfully!");
        showSection('dashboard');
    } catch (error) {
        console.error("Error updating user profile:", error);
    }
});

function validateForm() {
    let isValid = true;

    // Helper to set error message
    const setError = (id, message) => {
        document.getElementById(id).textContent = message || '';
        if (message) isValid = false;
    };

    // Clear all errors
    ['name-error', 'surname-error', 'phone-error', 'email-error', 'password-error']
        .forEach(id => setError(id, ''));

    // Get field values (dynamic IDs)
    const name = document.getElementById('update-user-name').value.trim();
    const surname = document.getElementById('update-user-surname').value.trim();
    const phoneNum = document.getElementById('update-user-phone').value.trim();
    const email = document.getElementById('update-user-email').value.trim();
    const password = document.getElementById('update-user-password').value.trim();

    // Patterns
    const emailPattern = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    const passwordPattern = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/;

    // Required field checks
    if (!name) setError('name-error', 'Name is required');
    if (!email) setError('email-error', 'Email is required');
    else if (!emailPattern.test(email)) setError('email-error', 'Invalid Email Format');

    if (!password) setError('password-error', 'Password is required');
    else if (!passwordPattern.test(password))
        setError('password-error', '6–20 chars, include 1 digit, 1 uppercase, 1 lowercase');

    // Optional fields (validate only if filled)
    if (phoneNum && !/^\d{7,15}$/.test(phoneNum)) {
        setError('phone-error', 'Invalid phone number');
    }

    return isValid;
}

// Toggle Password Field 
const passwordInput = document.getElementById("update-user-password");
  const togglePassword = document.querySelector(".toggle-password");

  togglePassword.addEventListener("click", () => {
    if (passwordInput.type === "password") {
      passwordInput.type = "text";
      togglePassword.src = "/assets/img/close-eye.png";
    } else {
      passwordInput.type = "password";
      togglePassword.src = "/assets/img/open-eye.png";
    }
  });