// === Signin Js ===
console.log("Signin Loaded...");

import { setSession, isSessionValid } from '../session.js';

// Check Session & Redirect
if (isSessionValid()) {
    window.location.href = "dashboard.html";
}

const signInForm = document.getElementById('signin-form');

signInForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    console.log("Signin Click");

    if (validateForm()) {
        await checkUser();
    };
});

// === Validate Form ===
function validateForm() {
    let isValid = true;

    // Helper Function
    function setError(id, message) {
        document.getElementById(id).textContent = message || '';
        if (message) isValid = false;
    };

    // Clear All errors
    ['email-error', 'password-error']
        .forEach(id => setError(id, ''));

    // Patterns
    const emailPattern = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    const passwordPattern = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/;

    // Get field values
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();

    // Required field checks
    if (!email) setError('email-error', 'Email is required');
    else if (!emailPattern.test(email)) setError('email-error', 'Invalid Email Format');

    if (!password) setError('password-error', 'Password is required');
    else if (!passwordPattern.test(password))
        setError('password-error', '6–20 chars, include 1 digit, 1 uppercase, 1 lowercase');

    return isValid;
}

// === Find & Match Users ===
async function checkUser() {
    console.log("check user fn");

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();

    try {
        const response = await fetch(
            `http://localhost:3000/users?email=${encodeURIComponent(email)}`
        );

        if (!response.ok) {
            throw new Error("Network response was not ok");
        }

        const users = await response.json();
        console.log("users:", users);

        if (users.length > 0 && users[0].password === password) {
            console.log("Login successful");

            // Save login status
            setSession(users[0].id, email);

            window.location.href = "dashboard.html";
        } else {
            document.getElementById("password-error").textContent = "Email or password is invalid";
        }
    } catch (error) {
        console.error("Error checking user:", error);
        document.getElementById("email-error").textContent = "Something went wrong. Please try again.";
    }
}

