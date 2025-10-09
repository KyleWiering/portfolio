// Simple Hello World TypeScript application
function displayMessage(): void {
    const message = "Hello World";
    const element = document.getElementById("app");
    if (element) {
        element.textContent = message;
    }
}

// Run when DOM is loaded
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", displayMessage);
} else {
    displayMessage();
}
