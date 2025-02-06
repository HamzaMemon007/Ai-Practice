let stopTyping = false;

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
        card.textContent = shortQuestion; // Show only the short name

        // Show full conversation on click
        card.onclick = () => showFullConversation(item.question, item.answer);

        // Delete button
        const deleteButton = document.createElement("button");
        deleteButton.classList.add("delete-btn");
        deleteButton.textContent = "X";
        deleteButton.onclick = (event) => {
            event.stopPropagation(); // Prevent triggering the click event on card
            deleteCard(index);
        };

        card.appendChild(deleteButton);
        historyContainer.appendChild(card);
    });
}

// Function to show full conversation with a hide button
function showFullConversation(question, answer) {
    const fullDisplay = document.getElementById("fullConversation");

    // Create full conversation content
    fullDisplay.innerHTML = `
        <p><strong>Q:</strong> ${question}</p>
        <p><strong>A:</strong> ${answer}</p>
    `;

    // Create hide button dynamically
    const hideButton = document.createElement("button");
    hideButton.textContent = "Hide";
    hideButton.classList.add("hide-btn");
    hideButton.onclick = () => fullDisplay.style.display = "none";

    fullDisplay.appendChild(hideButton); // Add hide button to full conversation
    fullDisplay.style.display = "block"; // Show the conversation section
}

function saveToHistory(question, answer) {
    const shortQuestion = question.length > 20 ? question.substring(0, 20) + "..." : question;
    const history = JSON.parse(localStorage.getItem("chatHistory")) || [];
    
    history.unshift({ question, answer }); // Save full question but display short name
    if (history.length > 10) history.pop(); // Limit history to last 10 items

    localStorage.setItem("chatHistory", JSON.stringify(history));
    loadHistory();
}

// Delete function
function deleteCard(index) {
    let history = JSON.parse(localStorage.getItem("chatHistory")) || [];
    history.splice(index, 1);
    localStorage.setItem("chatHistory", JSON.stringify(history));
    loadHistory();
}


function deleteCard(index) {
    const history = JSON.parse(localStorage.getItem("chatHistory")) || [];
    history.splice(index, 1);
    localStorage.setItem("chatHistory", JSON.stringify(history));
    loadHistory();
}

function clearAllHistory() {
    localStorage.removeItem("chatHistory");
    loadHistory();
}

async function askGemini() {
    const userQuery = document.getElementById("userQuery").value;
    const responseDiv = document.getElementById("response");
    const stopButton = document.getElementById("stopButton");

    if (!userQuery) {
        alert("Please enter a question!");
        return;
    }

    stopTyping = false;
    responseDiv.innerText = "Thinking...";
    responseDiv.classList.add("dot-animation");
    stopButton.disabled = true;

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
        stopButton.disabled = false;
        typeResponse(responseDiv, data.response, () => saveToHistory(userQuery, data.response));
    } catch (error) {
        responseDiv.innerText = "Error getting response!";
        console.error("Fetch error:", error);
    }
}



function typeResponse(element, text, callback, i = 0) {
    if (stopTyping) return;

    if (i < text.length) {
        element.innerHTML += text[i];
        setTimeout(() => typeResponse(element, text, callback, i + 1), 30);
    } else {
        document.getElementById("stopButton").disabled = true;
        callback();
    }
}

function stopResponse() {
    stopTyping = true;
    document.getElementById("stopButton").disabled = true;
}

function handleKeyPress(event) {
    if (event.key === "Enter") askGemini();
}

loadHistory();