import { marked } from "https://cdn.jsdelivr.net/npm/marked@5.1.0/lib/marked.esm.js";
marked.setOptions({
  mangle: false,
  headerIds: false,
});

const apiUrl = "https://duckgpt.iriszarox.workers.dev/chat/";
const chatBox = document.getElementById("chat-box");
const chatInput = document.getElementById("chat-input");
const placeholder = document.getElementById("placeholder");
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

sendButton.addEventListener("click", () => {sendMessage();chatInput.innerText = "";updatePlaceholder()});

chatInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && event.ctrlKey) {
    sendMessage();
    chatInput.innerText = "";
  }
});

chatInput.addEventListener('input', updatePlaceholder);
chatInput.addEventListener('focus', updatePlaceholder);
chatInput.addEventListener('blur', updatePlaceholder);

newChatButton.addEventListener("click", () => {
  document.getElementById('popup-overlay').classList.remove('hidden');
  
});

document.getElementById('close-popup').addEventListener('click', function() {
  document.getElementById('popup-overlay').classList.add('hidden');
});

document.getElementById('no-button').addEventListener('click', function() {
  document.getElementById('popup-overlay').classList.add('hidden');
});

document.getElementById('yes-button').addEventListener('click', function() {
  sessionStorage.clear();
  chatBox.innerHTML = "";
  updatePlaceholder();
  introCardsContainer.classList.remove("hidden");
  document.getElementById('popup-overlay').classList.add('hidden');
});


function updatePlaceholder() {
if (chatInput.innerText.trim() === '') {
  placeholder.style.opacity = '1';
} else {
  placeholder.style.opacity = '0';
}
}

async function renderMarkdown(content) {
  try {
    const htmlContent = marked(content);
    return htmlContent;
  } catch (error) {
    console.error("Error fetching markdown:", error);
    return content;
  }
}

function enhanceCodeBlocks(element) {
  element.querySelectorAll("pre code").forEach((block) => {
    const pre = block.parentNode;

    const language = block.className.split("-")[1] || "";

    const codeHeader = document.createElement("div");
    codeHeader.classList.add("code-header");
    const langSpan = document.createElement("span");
    langSpan.innerText = language;
    codeHeader.appendChild(langSpan);
    const copyButton = document.createElement("button");
    copyButton.innerText = "📋 Copy";
    codeHeader.appendChild(copyButton);

    pre.insertBefore(codeHeader, pre.firstChild);
    copyButton.addEventListener("click", () => {
      copyToClipboard(block.innerText);
      copyButton.textContent = "📋 Copied!";
      setTimeout(() => {
        copyButton.textContent = "📋 Copy";
      }, 2000);
    });
    // Prism.highlightElement(block);
  });
  return element
}

function copyToClipboard(text) {
  const textArea = document.createElement("textarea");
  textArea.value = text;
  document.body.appendChild(textArea);
  textArea.select();
  document.execCommand("copy");
  document.body.removeChild(textArea);
}

async function loadMessages() {
  const history = JSON.parse(sessionStorage.getItem("chatHistory") || "[]");
  for (const message of history) {
    await addMessageToChatBox(message.content, message.role);
  }

}

function hideIntroCards() {
  introCardsContainer.classList.add("hidden");
}

async function addMessageToChatBox(content, role) {
  const messageContainer = document.createElement("div");
  messageContainer.classList.add("message-container");

  const messageCard = document.createElement("div");
  messageCard.classList.add("message-card", role);
  if (role === "api") {
    const profilePic = document.createElement("div");
    profilePic.classList.add("profile-pic");
    messageContainer.appendChild(profilePic);
    const htmlContent = await renderMarkdown(content);
    messageCard.innerHTML = htmlContent;
  } else {
    messageContainer.classList.add("user");
    messageCard.innerText = content;
  }
MathJax.typesetPromise([messageCard]).then(function() {
    console.log('MathJax finished typesetting');
}).catch(function(err) {
    console.error('MathJax typesetting error:', err);
});
  messageContainer.appendChild(messageCard);
  chatBox.insertBefore(enhanceCodeBlocks(messageContainer), chatBox.firstChild);

  
}

function loadingResponse() {
  const messageContainer = document.createElement("div");
  messageContainer.classList.add("message-container");

  const profilePic = document.createElement("div");
  profilePic.classList.add("profile-pic");
  messageContainer.appendChild(profilePic);

  chatBox.insertBefore(messageContainer, chatBox.firstChild);
  return messageContainer;
}

async function sendMessage() {
  const prompt = chatInput.innerText.trim();
  console.log(prompt)
  if (!prompt) return;

  await addMessageToChatBox(prompt, "user");
  chatInput.value = "";

  hideIntroCards();
  const loading = loadingResponse();
  const history = JSON.parse(sessionStorage.getItem("chatHistory") || "[]");
  const model = "gpt-4o-mini";
  const userHistory = history.filter((message) => message.role === "user");

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
      loading.remove();
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
