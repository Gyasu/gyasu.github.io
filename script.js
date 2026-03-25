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
  
  // Navigation
  navToggle: document.getElementById('nav-toggle'),
  sidebarClose: document.getElementById('sidebar-close'),
  sidebar: document.getElementById('sidebar'),
  sidebarOverlay: document.getElementById('sidebar-overlay')
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

// Theme toggle — persist preference in localStorage, default to dark
const savedTheme = localStorage.getItem('theme') ?? 'dark';
const applyTheme = (theme) => {
  document.body.classList.toggle('dark-mode', theme === 'dark');
  if (elements.themeToggle) elements.themeToggle.textContent = theme === 'dark' ? '☾' : '☀️';
};
applyTheme(savedTheme);

if (elements.themeToggle) {
  elements.themeToggle.addEventListener('click', () => {
    const isDark = document.body.classList.toggle('dark-mode');
    const theme = isDark ? 'dark' : 'light';
    localStorage.setItem('theme', theme);
    elements.themeToggle.textContent = isDark ? '☾' : '☀️';
  });
}

// Sidebar navigation
function openSidebar() {
  if (elements.sidebar) elements.sidebar.classList.add('open');
  if (elements.sidebarOverlay) elements.sidebarOverlay.classList.add('active');
}
function closeSidebar() {
  if (elements.sidebar) elements.sidebar.classList.remove('open');
  if (elements.sidebarOverlay) elements.sidebarOverlay.classList.remove('active');
}

if (elements.navToggle) elements.navToggle.addEventListener('click', openSidebar);
if (elements.sidebarClose) elements.sidebarClose.addEventListener('click', closeSidebar);
if (elements.sidebarOverlay) elements.sidebarOverlay.addEventListener('click', closeSidebar);

if (elements.sidebar) {
  elements.sidebar.querySelectorAll('.sidebar-links a').forEach(link => {
    link.addEventListener('click', closeSidebar);
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

// Scroll fade-in
document.addEventListener('DOMContentLoaded', () => {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));
});

// Read more toggle
function toggleAbout() {
  const more = document.getElementById('about-more');
  const btn = document.getElementById('read-more-btn');
  const isOpen = more.classList.toggle('open');
  btn.textContent = isOpen ? 'Read less' : 'Read more';
}

// Fun section toggle
function toggleFun() {
  const content = document.getElementById('fun-content');
  const arrow = document.getElementById('fun-arrow');
  const isOpen = content.classList.toggle('open');
  arrow.textContent = isOpen ? '↑' : '↓';
}

// === PAGE TRANSITIONS ===
const pageTransition = document.getElementById('page-transition');

// Fade in on page load
if (pageTransition) {
  window.addEventListener('load', () => {
    requestAnimationFrame(() => {
      pageTransition.style.opacity = '0';
    });
  });

  // Fade out on internal page navigation
  document.addEventListener('click', (e) => {
    const link = e.target.closest('a[href]');
    if (!link) return;
    const href = link.getAttribute('href');
    // Only intercept same-origin .html links (not anchors, mailto, or external)
    if (href && !href.startsWith('#') && !href.startsWith('http') && !href.startsWith('mailto') && href.includes('.html')) {
      e.preventDefault();
      pageTransition.style.opacity = '1';
      pageTransition.style.pointerEvents = 'all';
      setTimeout(() => { window.location.href = href; }, 420);
    }
  });
}

// Sync Spotify embed theme
const spotifyEmbed = document.getElementById('spotify-embed');
if (spotifyEmbed) {
  const syncSpotifyTheme = () => {
    const isDark = document.body.classList.contains('dark-mode');
    const base = 'https://open.spotify.com/embed/artist/2x71wNaoMEGl7eIvOEO7nV?utm_source=generator&theme=';
    spotifyEmbed.src = base + (isDark ? '0' : '1');
  };
  syncSpotifyTheme();
  if (elements.themeToggle) {
    elements.themeToggle.addEventListener('click', syncSpotifyTheme);
  }
}

// Hide logo + theme toggle on scroll
const header = document.querySelector('header');
if (header) {
  window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 40);
  });
}

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