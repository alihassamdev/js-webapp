// === Signup.js ===
console.log("Signup JS Loaded...");

import { setSession, isSessionValid, clearSession } from '../session.js';

// Check Session & Redirect
if (isSessionValid()) {
    window.location.href = "dashboard.html";
}

// === User ID Generator ===
function generateUserId() {
    return "user_"+Math.random().toString(36).substr(2, 9);
}

const signupForm = document.getElementById('signup-form');
signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    console.log("Clicked Submit")

    if (!validateForm()) return;

    const email = document.getElementById('email').value.trim();

    // Check if email exists
    try {
        const checkResponse = await fetch(`http://localhost:3000/users?email=${encodeURIComponent(email)}`);
        if (!checkResponse.ok) throw new Error("Failed to check email");

        const existingUsers = await checkResponse.json();

        if (existingUsers.length > 0) {
            // Email exists - show error and stop
            document.getElementById('email-error').textContent = "Email already exists";
            return;
        } else {
            // Email not found, proceed to save
            await saveUser();
            console.log("Form Submitted...");
        }
    } catch (error) {
        console.error(error);
        alert("Error checking email.");
    }
});

// Validate Form
function validateForm() {
    let isValid = true;

    // Helper to set error message
    const setError = (id, message) => {
        document.getElementById(id).textContent = message || '';
        if (message) isValid = false;
    };

    // Clear all errors
    ['name-error', 'surname-error', 'phone-error', 'email-error', 'password-error', 'terms-error']
        .forEach(id => setError(id, ''));

    // Get field values
    const name = document.getElementById('name').value.trim();
    const surname = document.getElementById('surname').value.trim();
    const phoneNum = document.getElementById('phone-number').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();
    const termsCondition = document.getElementById('terms-condition').checked;

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

    if (!termsCondition) setError('terms-error', 'Please accept the Terms & Conditions');

    // Optional fields (validate only if filled)
    if (phoneNum && !/^\d{7,15}$/.test(phoneNum)) {
        setError('phone-error', 'Invalid phone number');
    }

    return isValid;
}

// Save User to JSON
async function saveUser() {
    const name = document.getElementById('name').value.trim();
    const surname = document.getElementById('surname').value.trim();
    const phoneNum = document.getElementById('phone-number').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();
    const termsCondition = document.getElementById('terms-condition').checked;

    try {
        const response = await fetch("http://localhost:3000/users", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: generateUserId(), name, surname, phoneNum, email, password, termsCondition })
        });

        if (!response.ok) throw new Error("Failed to save user");

        const data = await response.json();
        console.log("User saved:", data);

        console.log("Signup successful!");

        // Save login status
        setSession(data.id, email);

        window.location.href = "login.html";

    } catch (error) {
        console.error(error);
        alert("Error saving user.");
    }
}

// Toggle The Submit Button 
const termsCondition = document.getElementById('terms-condition');
const signInBtn = document.getElementById('signin-btn');
termsCondition.addEventListener('change', () => {
    console.log("Terms Condition check?:", termsCondition.checked);
    signInBtn.disabled = !signInBtn.disabled;
});

// Toggle Password Field 
const passwordInput = document.getElementById("password");
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
