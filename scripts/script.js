import { marked } from "https://cdn.jsdelivr.net/npm/marked@5.1.0/lib/marked.esm.js";

marked.setOptions({
  mangle: false,
  headerIds: false,
});

console.log(window.navigator.platform)

const apiUrl = "https://duckgpt.iriszarox.workers.dev/chat/";
const chatBox = document.getElementById("chat-box");
const chatInput = document.getElementById("chat-input");
const placeholder = document.getElementById("placeholder");
const sendButton = document.getElementById("send-button");
const dailog = document.getElementById('dailog');
const newChatButton = document.getElementById("new-chat-button");
const settingButton = document.getElementById("setting-button");
const particlesToggle = document.getElementById('particles-toggle');
const themeToggle = document.getElementById('theme-toggle');
const introCardsContainer = document.getElementById("intro-cards-container");
const particlejs = document.getElementById('particles-js');
const lightParticles = {"particles": {"color": {"value": "#87CEEB"},"line_linked": {"color": "#000000",},}}

document.addEventListener("DOMContentLoaded", () => {
  loadMessages();

  const history = JSON.parse(sessionStorage.getItem("chatHistory") || "[]");
  if (history.length == 0) {
    introCardsContainer.classList.remove("hidden");
  }
  chatBox.scrollTo({
    top: chatBox.scrollHeight,
    behavior: 'smooth'
  });

  let settings = localStorage.getItem("setting")
  if (settings === null) {
    localStorage.setItem("setting", JSON.stringify({ "particle": true, "light": false }));
  };
  settings = JSON.parse(localStorage.getItem("setting"))
  const particles = settings['particle'];
  const light = settings['light']

  if (light) {
    themeToggle.checked = true;
    applyLightTheme()
    if (particles) {
      particlesToggle.checked = true;
      addParticles("#particles-js", lightParticles)
    }
  }
  else {
    if (particles) {
      particlesToggle.checked = true;
      addParticles("#particles-js")
  }}
  
  const link = document.createElement('link');
  link.href = 'styles/styles.css';
  link.rel = 'stylesheet';
  document.head.appendChild(link);
});

sendButton.addEventListener("click", () => { sendMessage(); chatInput.innerText = ""; updatePlaceholder() });

chatInput.addEventListener("keydown", (event) => {

  if (!('ontouchstart' in window) || navigator.maxTouchPoints < 1) {
    if (event.key === "Enter" && !event.ctrlKey) {
      event.preventDefault();
      sendMessage();
      chatInput.innerText = ""; 
      updatePlaceholder()
    }
  }
  
  if (event.key === "Enter" && event.ctrlKey) {
    chatInput.innerText = chatInput.innerText + "\n"
    const range = document.createRange();
    const selection = window.getSelection();

    range.selectNodeContents(chatInput);
    range.collapse(false);

    selection.removeAllRanges();
    selection.addRange(range);
    updatePlaceholder();
  }
});

chatInput.addEventListener('input', updatePlaceholder);
chatInput.addEventListener('focus', updatePlaceholder);
chatInput.addEventListener('blur', updatePlaceholder);

newChatButton.addEventListener("click", () => {
  document.getElementById('popup-overlay').classList.remove('hidden');
  document.getElementById('clearchat-popup').classList.remove('hidden');
});

settingButton.addEventListener("click", () => {
  document.getElementById('popup-overlay').classList.remove('hidden');
  document.getElementById('setting-popup').classList.remove('hidden');
});

document.getElementById('close-popup').addEventListener('click', function () {
  document.getElementById('popup-overlay').classList.add('hidden');
  document.getElementById('clearchat-popup').classList.add('hidden');
  document.getElementById('setting-popup').classList.add('hidden');
});

document.getElementById('no-button').addEventListener('click', function () {
  document.getElementById('popup-overlay').classList.add('hidden');
  document.getElementById('clearchat-popup').classList.add('hidden');
});

document.getElementById('yes-button').addEventListener('click', function () {
  sessionStorage.clear();
  chatBox.innerHTML = "";
  updatePlaceholder();
  introCardsContainer.classList.remove("hidden");
  document.getElementById('popup-overlay').classList.add('hidden');
  document.getElementById('clearchat-popup').classList.add('hidden');
});

// Toggle Particle Effects
particlesToggle.addEventListener('change', function () {
  if (this.checked) {
    const settings = JSON.parse(localStorage.getItem('setting'))
    settings['particle'] = true
    localStorage.setItem('setting', JSON.stringify(settings));
    if (settings['light']) {
      addParticles('#particle-js', lightParticles)
    }
    else {
      addParticles('#particle-js')

    }
  } else {
    const settings = JSON.parse(localStorage.getItem('setting'))
    settings['particle'] = false
    localStorage.setItem('setting', JSON.stringify(settings));
    particlejs.innerHTML = ''
    pJSDom = []
  }
});

themeToggle.addEventListener('change', function () {
  if (this.checked) {
    const settings = JSON.parse(localStorage.getItem('setting'))
    settings['light'] = true
    localStorage.setItem('setting', JSON.stringify(settings));
    applyLightTheme();
    if (settings['particle']) {
      addParticles('#particle-js', lightParticles)
    }
  } else {
    const settings = JSON.parse(localStorage.getItem('setting'))
    settings['light'] = false
    localStorage.setItem('setting', JSON.stringify(settings));
    applyDarkTheme();
    if (settings['particle']) {
      addParticles('#particle-js')
    }
  }
});


document.querySelectorAll('.headerIcon').forEach(icon => {
  icon.addEventListener('mousemove', (event) => {
    const dailogText = icon.getAttribute('alt');
    const cords = icon.getBoundingClientRect();
    const dSize = dailog.getBoundingClientRect();
    dailog.textContent = dailogText;

    dailog.style.opacity = '0.4';
    dailog.style.visibility = 'visible';
    if (icon.alt != "Settings") {dailog.style.left = cords.right + 'px';}
    else if (icon.alt == "Send") {icon.removeEventListener('mousemove')}
    else {dailog.style.left = cords.left-dSize.width + 'px';}
    dailog.style.top = cords.bottom + 'px';
  });

  icon.addEventListener('mouseleave', () => {
    dailog.style.opacity = '0';
    dailog.style.visibility = 'hidden';
  });
});

function addParticles(element, pColors){
  particlejs.innerHtml = ''
  pJSDom = []
  particlesJS(element, pColors)
}

function applyLightTheme() {
  const link = document.createElement('link');
  link.href = 'styles/light.css'; 
  link.rel = 'stylesheet';
  link.id = 'lightThemeCss';
  document.head.appendChild(link);
}

function applyDarkTheme() {
  const link = document.getElementById('lightThemeCss');
  if (link) {
    link.remove();
  }
}

function updatePlaceholder() {
  if (chatInput.innerText === '') {
    placeholder.style.opacity = '1';
  } else {
    placeholder.style.opacity = '0';
  }
}

async function renderMarkdown(content) {
  try {
    const htmlContent = marked(content.replace(/\\\(/g, '=$=').replace(/\\\[/g, '=#=').replace(/\\\)/g, '$=$').replace(/\\\]/g, '#=#'));
    return htmlContent.replace(/=\$=/g, '\\(').replace(/=#=/g, '\\[').replace(/\$=\$/g, '\\)').replace(/#=#/g, '\\]');
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
    Prism.highlightElement(pre.querySelector("code"));
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
  messageContainer.appendChild(messageCard);
  chatBox.insertBefore(enhanceCodeBlocks(messageContainer), chatBox.firstChild);
  try {
    await MathJax.typesetPromise(['.message-card'])
  } catch (error){
    console.log("MathJax failed to load "+error)
  }

  chatBox.scrollTo({
    top: chatBox.scrollHeight,
    behavior: 'smooth'
  });

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
  if (!prompt) {
    return
  };

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
