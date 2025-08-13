// Generic ID generator
function generateId(prefix = "") {
    const randomPart = Math.random().toString(36).substr(2, 9);
    return `${prefix}${randomPart}`;
}

// User Id generator
function generateUserId() {
    return generateId("user_");
}

// Todo's Id generator
function generateTodoId() {
    return generateId("todo_");
}

// Export functions
export { generateUserId, generateTodoId };
