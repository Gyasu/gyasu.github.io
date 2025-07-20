// === CORE CHATBOT FUNCTIONALITY ===
const MODEL = "google/gemma-2-9b-it:free";
const KNOWLEDGE_BASE = `Your knowledge base content here...`;

let conversation = [];
let modalConversation = [];

const isChatbotPage = document.body.classList.contains('chatbot-page');

// Get DOM elements
const elements = {
  // Main page elements
  messagesDiv: document.getElementById("messages"),
  form: document.getElementById("chat-form"),
  input: document.getElementById("input"),
  sendBtn: document.getElementById("send-btn"),
  
  // Modal elements
  modalMessagesDiv: document.getElementById("modal-messages"),
  modalForm: document.getElementById("modal-chat-form"),
  modalInput: document.getElementById("modal-input"),
  modalSendBtn: document.getElementById("modal-send-btn"),
  
  // Modal controls
  chatbotToggle: document.getElementById('chatbot-toggle'),
  chatbotModal: document.getElementById('chatbot-modal'),
  chatbotClose: document.getElementById('chatbot-close'),
  
  // Theme toggle
  themeToggle: document.getElementById('toggle-theme'),
  themeIcon: document.getElementById('theme-icon'),
  
  // Navigation
  navToggle: document.getElementById('nav-toggle'),
  navLinks: document.querySelector('.nav-links')
};

// === IMPROVED SCROLL FUNCTION ===
function scrollToBottom(isModal = false) {
  const targetDiv = isModal ? elements.modalMessagesDiv : elements.messagesDiv;
  if (!targetDiv) return;

  // Use requestAnimationFrame to ensure DOM is updated
  requestAnimationFrame(() => {
    targetDiv.scrollTop = targetDiv.scrollHeight;
  });
}

// === CHAT FUNCTIONS ===
function appendMessage(role, content, isModal = false) {
  const targetDiv = isModal ? elements.modalMessagesDiv : elements.messagesDiv;
  if (!targetDiv) return;

  const msgDiv = document.createElement("div");
  msgDiv.className = `chatbot-msg ${role}`;
  msgDiv.textContent = content;
  targetDiv.appendChild(msgDiv);
  
  // Improved scrolling with multiple fallbacks
  setTimeout(() => scrollToBottom(isModal), 10);
  requestAnimationFrame(() => scrollToBottom(isModal));
  
  return msgDiv;
}

function showTyping(isModal = false) {
  const typingDiv = appendMessage("bot", "Thinking about Gyasu...", isModal);
  if (typingDiv) typingDiv.classList.add("typing");
  return typingDiv;
}

async function sendMessage(text, isModal = false) {
  const conversationArray = isModal ? modalConversation : conversation;
  const sendBtn = isModal ? elements.modalSendBtn : elements.sendBtn;
  const input = isModal ? elements.modalInput : elements.input;

  if (!input || !sendBtn) return;

  appendMessage("user", text, isModal);
  input.value = "";
  sendBtn.disabled = true;

  const typingDiv = showTyping(isModal);
  const enhancedPrompt = `You are Gyasu's AI assistant... ${text}`;
  
  conversationArray.push({ role: "user", content: enhancedPrompt });

  try {
    const response = await fetch('https://gyasu-github-io.vercel.app/api/chat', {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: MODEL,
        messages: conversationArray,
        temperature: 0.7
      })
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    
    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content?.trim() || "[Empty response]";

    if (typingDiv) typingDiv.remove();
    conversationArray.push({ role: "assistant", content: reply });
    
    // Add bot message and ensure scrolling
    const botMsg = appendMessage("bot", reply, isModal);
    
    // Additional scroll after bot message
    setTimeout(() => scrollToBottom(isModal), 100);

  } catch (err) {
    console.error('Chat error:', err);
    if (typingDiv) typingDiv.remove();
    appendMessage("bot", "⚠️ Sorry, I'm having trouble connecting. Please try again later.", isModal);
  } finally {
    sendBtn.disabled = false;
    input.focus();
  }
}

// === EVENT LISTENERS ===
// Chat forms
if (elements.form) {
  elements.form.addEventListener("submit", (e) => {
    e.preventDefault();
    const text = elements.input.value.trim();
    if (text) sendMessage(text, false);
  });
}

if (elements.modalForm) {
  elements.modalForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const text = elements.modalInput.value.trim();
    if (text) sendMessage(text, true);
  });
}

// Modal controls with improved scrolling
if (elements.chatbotToggle && elements.chatbotModal) {
  elements.chatbotToggle.addEventListener('click', () => {
    const wasActive = elements.chatbotModal.classList.contains('active');
    elements.chatbotModal.classList.toggle('active');
    
    if (!wasActive && elements.chatbotModal.classList.contains('active')) {
      // Modal just opened
      if (elements.modalInput) {
        elements.modalInput.focus();
      }
      // Scroll to bottom when modal opens
      setTimeout(() => scrollToBottom(true), 100);
    }
  });
}

if (elements.chatbotClose) {
  elements.chatbotClose.addEventListener('click', () => {
    elements.chatbotModal.classList.remove('active');
  });
}

// Close modal when clicking outside
if (elements.chatbotModal) {
  elements.chatbotModal.addEventListener('click', (e) => {
    if (e.target === elements.chatbotModal) {
      elements.chatbotModal.classList.remove('active');
    }
  });
}

// Theme toggle
if (elements.themeToggle) {
  elements.themeToggle.addEventListener('change', () => {
    const isDark = elements.themeToggle.checked;
    document.body.classList.toggle('dark-mode', isDark);
    if (elements.themeIcon) {
      elements.themeIcon.textContent = isDark ? '☾' : '☀︎';
    }
  });
}

// Mobile navigation
if (elements.navToggle && elements.navLinks) {
  elements.navToggle.addEventListener('click', () => {
    elements.navLinks.classList.toggle('active');
  });
}

// === MUTATION OBSERVER FOR AUTO-SCROLL ===
// This ensures scrolling happens whenever messages are added/removed
function setupAutoScroll() {
  const observeContainer = (container, isModal) => {
    if (!container) return;
    
    const observer = new MutationObserver(() => {
      scrollToBottom(isModal);
    });
    
    observer.observe(container, {
      childList: true,
      subtree: true,
      characterData: true
    });
  };
  
  // Setup observers for both containers
  observeContainer(elements.messagesDiv, false);
  observeContainer(elements.modalMessagesDiv, true);
}

// Initialize auto-scroll on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  setupAutoScroll();
});

// Initial messages
if (isChatbotPage && elements.messagesDiv) {
  setTimeout(() => {
    appendMessage("bot", "Hi! I'm Gyasu's AI assistant. What would you like to know?", false);
  }, 500);
} else if (elements.modalMessagesDiv) {
  setTimeout(() => {
    appendMessage("bot", "Hello! Ask me about Gyasu's work!", true);
  }, 1000);
}

// === KEYBOARD SHORTCUTS ===
document.addEventListener('keydown', (e) => {
  // Escape to close modal
  if (e.key === 'Escape' && elements.chatbotModal.classList.contains('active')) {
    elements.chatbotModal.classList.remove('active');
  }
  
  // Ctrl/Cmd + Enter to toggle modal
  if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
    elements.chatbotToggle.click();
  }
});