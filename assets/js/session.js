// ===== Session Helper Functions =====

// Save session details
export function setSession(userId,email) {
    localStorage.setItem("isLoggedIn", "true");
    localStorage.setItem("userId", userId);
    localStorage.setItem("userEmail", email);
    localStorage.setItem("loginTime", Date.now().toString());
}

// Get current session details
export function getSession() {
    return {
        isLoggedIn: localStorage.getItem("isLoggedIn") === "true",
        userEmail: localStorage.getItem("userEmail"),
        loginTime: parseInt(localStorage.getItem("loginTime"), 10) || null
    };
}

// Check if session is still valid
export function isSessionValid(maxSessionTime = 3600000) { // default 1 hour
    const { isLoggedIn, loginTime } = getSession();
    return isLoggedIn && loginTime && Date.now() - loginTime < maxSessionTime;
}

// Clear session (Logout)
export function clearSession() {
    localStorage.clear();
}
