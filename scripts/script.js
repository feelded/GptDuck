

const apiUrl = "https://duckgpt.iriszarox.workers.dev/chat/";
const chatBox = document.getElementById("chat-box");
const chatInput = document.getElementById("chat-input");
const sendButton = document.getElementById("send-button");
const newChatButton = document.getElementById("new-chat-button");
const introCardsContainer = document.getElementById("intro-cards-container");

document.addEventListener("DOMContentLoaded", () => {
    loadMessages();

    const history = JSON.parse(sessionStorage.getItem("chatHistory") || "[]");
    if (history.length > 0) {
        hideIntroCards();
    }
});

sendButton.addEventListener("click", () => sendMessage());

chatInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        sendMessage();
    }
});

newChatButton.addEventListener("click", () => {
    sessionStorage.clear();
    chatBox.innerHTML = "";
    introCardsContainer.classList.remove("hidden") ;
});

function loadMessages() {
    const history = JSON.parse(sessionStorage.getItem("chatHistory") || "[]");
    history.forEach((message) => addMessageToChatBox(message.content, message.role));
}

function hideIntroCards() {
    introCardsContainer.classList.add("hidden");
}

function addMessageToChatBox(content, role) {
    const messageContainer = document.createElement("div");
    messageContainer.classList.add("message-container");

    if (role === "api") {
        const profilePic = document.createElement("div");
        profilePic.classList.add("profile-pic");
        messageContainer.appendChild(profilePic); 
    }
    else {
        messageContainer.classList.add("user")
    }

    const messageCard = document.createElement("div");
    messageCard.classList.add("message-card", role);
    messageCard.innerText = content;

    messageContainer.appendChild(messageCard); 
    chatBox.insertBefore(messageContainer, chatBox.firstChild); 
}

async function sendMessage() {
    const prompt = chatInput.value.trim();
    if (!prompt) return;

    addMessageToChatBox(prompt, "user");
    chatInput.value = "";

    hideIntroCards();

    const history = JSON.parse(sessionStorage.getItem("chatHistory") || "[]");
    const model = "gpt-4o-mini";
    const userHistory = history.filter(message => message.role === "user")

    const params = new URLSearchParams({
        prompt: prompt,
        model: model,
        history: JSON.stringify(userHistory),
    });
    
    try {
        const response = await fetch(`${apiUrl}?${params.toString()}`);
        saveMessage(prompt, "user");
        if (!response.ok) {
            throw new Error("Network response was not ok");
        }

        const data = await response.json();

        if (data.status === 200) {
            const responseText = data.response;
            addMessageToChatBox(responseText, "api");
            saveMessage(responseText, "api");
        } else {
            console.error("API error:", data);
        }
    } catch (error) {
        console.error("Fetch error:", error);
    }
}

function saveMessage(content, role) {
    const history = JSON.parse(sessionStorage.getItem("chatHistory") || "[]");
    history.push({ role: role, content: content });
    sessionStorage.setItem("chatHistory", JSON.stringify(history));
}
