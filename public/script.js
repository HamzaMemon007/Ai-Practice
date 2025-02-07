// Global Variables for Typing State
let stopTyping = false;
let currentTypingIndex = 0;
let currentText = "";
let currentCallback = null;
let typingTimer = null;

// Theme Switching Logic
const themeSwitchButton = document.getElementById("themeSwitch");
let currentTheme = localStorage.getItem("theme") || "dark";
document.documentElement.setAttribute("data-theme", currentTheme);
themeSwitchButton.innerText = currentTheme === "dark" ? "🌙" : "☀️"; // Update button text

themeSwitchButton.addEventListener("click", () => {
    currentTheme = currentTheme === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", currentTheme);
    localStorage.setItem("theme", currentTheme);
    themeSwitchButton.innerText = currentTheme === "dark" ? "🌙" : "☀️";
});

// Load chat history from localStorage and display as cards
function loadHistory() {
    const historyContainer = document.getElementById("historyContainer");
    historyContainer.innerHTML = "";
    const history = JSON.parse(localStorage.getItem("chatHistory")) || [];

    history.forEach((item, index) => {
        const shortQuestion = item.question.length > 20 
            ? item.question.substring(0, 20) + "..." 
            : item.question;

        const card = document.createElement("div");
        card.classList.add("card");
        card.textContent = shortQuestion; // Display a shortened version of the question

        // Show full conversation on card click
        card.onclick = () => showFullConversation(item.question, item.answer);

        // Create and append a delete button to each card
        const deleteButton = document.createElement("button");
        deleteButton.classList.add("delete-btn");
        deleteButton.textContent = "X";
        deleteButton.onclick = (event) => {
            event.stopPropagation(); // Prevent card click event
            deleteCard(index);
        };

        card.appendChild(deleteButton);
        historyContainer.appendChild(card);
    });
}

// Function to show full conversation with a hide button
function showFullConversation(question, answer) {
    const fullDisplay = document.getElementById("fullConversation");

    // Build conversation content
    fullDisplay.innerHTML = `
        <p><strong>Q:</strong> ${question}</p>
        <p><strong>A:</strong> ${answer}</p>
    `;

    // Create a hide button to close the full conversation display
    const hideButton = document.createElement("button");
    hideButton.textContent = "Hide";
    hideButton.classList.add("hide-btn");
    hideButton.onclick = () => fullDisplay.style.display = "none";

    fullDisplay.appendChild(hideButton);
    fullDisplay.style.display = "block";
    fullDisplay.classList.add("hidden-content");
}

// Save the conversation to history in localStorage and reload history
function saveToHistory(question, answer) {
    const history = JSON.parse(localStorage.getItem("chatHistory")) || [];
    history.unshift({ question, answer }); // Add new conversation to the beginning
    if (history.length > 10) history.pop(); // Limit history to last 10 items

    localStorage.setItem("chatHistory", JSON.stringify(history));
    loadHistory();
}

// Delete a single card from history
function deleteCard(index) {
    const history = JSON.parse(localStorage.getItem("chatHistory")) || [];
    history.splice(index, 1);
    localStorage.setItem("chatHistory", JSON.stringify(history));
    loadHistory();
}

// Clear all chat history
function clearAllHistory() {
    localStorage.removeItem("chatHistory");
    loadHistory();
}

// Ask Gemini (simulate API call) and start typing the response
async function askGemini() {
    const userQuery = document.getElementById("userQuery").value;
    const responseDiv = document.getElementById("response");
    const stopButton = document.getElementById("stopButton");

    if (!userQuery) {
        alert("Please enter a question!");
        return;
    }

    // Reset typing state
    stopTyping = false;
    currentTypingIndex = 0;
    currentText = "";
    currentCallback = null;
    clearTimeout(typingTimer);

    // Indicate that the system is thinking
    responseDiv.innerText = "Thinking";
    responseDiv.classList.add("dot-animation");
    stopButton.disabled = true; // Disable stop/resume while waiting for response

    try {
        const res = await fetch("/ask-gemini", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userPrompt: userQuery })
        });
        console.log(res);
        
        if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);

        const data = await res.json();
        responseDiv.classList.remove("dot-animation");
        responseDiv.innerText = "";
        // Enable the stop/resume button for typing
        stopButton.disabled = false;
        stopButton.textContent = "Stop";
        typeResponse(responseDiv, data.response, () => {
            saveToHistory(userQuery, data.response);
        });
    } catch (error) {
        responseDiv.innerText = "Error getting response!";
        console.error("Fetch error:", error);
    }
}

// Modified typeResponse: prints one character at a time and supports pause/resume.
function typeResponse(element, text, callback, i = 0) {
    // Store the current state for later resumption
    currentText = text;
    currentCallback = callback;
    currentTypingIndex = i;
    
    // If typing is paused, exit early
    if (stopTyping) return;

    if (i < text.length) {
        element.innerHTML += text[i];
        currentTypingIndex = i + 1;
        typingTimer = setTimeout(() => typeResponse(element, text, callback, i + 1), 15);
    } else {
        // When finished, disable the stop/resume button and execute the callback
        document.getElementById("stopButton").disabled = true;
        callback();
    }
}

// Toggle function to pause/resume the typing animation
function toggleTyping() {
    const stopButton = document.getElementById("stopButton");
    const responseDiv = document.getElementById("response");

    if (!stopTyping) {
        // Pause the typing animation
        stopTyping = true;
        clearTimeout(typingTimer);
        stopButton.textContent = "Resume";
    } else {
        // Resume the typing animation
        stopTyping = false;
        stopButton.textContent = "Pause";
        typeResponse(responseDiv, currentText, currentCallback, currentTypingIndex);
    }
}

// Optional: If you want to trigger askGemini() on pressing the Enter key
function handleKeyPress(event) {
    if (event.key === "Enter") askGemini();
}

loadHistory();
