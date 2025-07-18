// === CHATBOT CONFIG ===
const MODEL = "google/gemma-3n-e2b-it:free";
const API_URL = "/api/chat"; // Ensure your API is accessible at this path

// === KNOWLEDGE BASE ABOUT GYASU ===
const KNOWLEDGE_BASE = `
DOCUMENT 1: About Gyasu Bajracharya
Gyasu Bajracharya is a researcher and musician with interests spanning multiple disciplines. He has a background in both academic research and creative pursuits, particularly music composition and performance.

DOCUMENT 2: Research Interests
Gyasu's research focuses on [add specific research areas here]. He has published work in [add publication details]. His academic work explores [add research topics and methodologies].

DOCUMENT 3: Musical Background
Gyasu is an active musician with experience in [add musical background - instruments, genres, compositions, performances]. He combines his analytical research skills with creative musical expression.

DOCUMENT 4: Academic Background
[Add educational background, degrees, institutions, notable achievements]

DOCUMENT 5: Current Projects
[Add information about current research projects, collaborations, ongoing work]

---
Note: Replace the bracketed sections above with Gyasu's actual information.
`.trim();

// === CHATBOT FUNCTIONALITY ===
let conversation = []; // For the full chatbot page
let modalConversation = []; // For the floating modal chatbot

// Determine if we are on the dedicated chatbot page or the main page
const isChatbotPage = document.body.classList.contains('chatbot-page');

// DOM Elements - conditionally selected based on the page
let messagesDiv, form, input, sendBtn, statusDiv;
let modalMessagesDiv, modalForm, modalInput, modalSendBtn;

if (isChatbotPage) {
  // Elements for the full chatbot page
  messagesDiv = document.getElementById("messages");
  form = document.getElementById("chat-form");
  input = document.getElementById("input");
  sendBtn = document.getElementById("send-btn");
  statusDiv = document.getElementById("knowledge-status");
} else {
  // Elements for the modal chatbot on the main page
  modalMessagesDiv = document.getElementById("modal-messages");
  modalForm = document.getElementById("modal-chat-form");
  modalInput = document.getElementById("modal-input");
  modalSendBtn = document.getElementById("modal-send-btn");
}

// Update status (only for the full chatbot page, if applicable)
if (isChatbotPage && statusDiv) {
  statusDiv.textContent = `Ready to share information about Gyasu`;
}

// Append message to chat window
function appendMessage(role, content, isModal) {
  const targetDiv = isModal ? modalMessagesDiv : messagesDiv;
  if (!targetDiv) return; // Exit if the target div doesn't exist on this page

  const msgDiv = document.createElement("div");
  msgDiv.className = "chatbot-msg " + (role === "user" ? "user" : "bot");
  msgDiv.textContent = content;
  targetDiv.appendChild(msgDiv);
  targetDiv.scrollTop = targetDiv.scrollHeight;
  return msgDiv;
}

// Show typing indicator
function showTyping(isModal) {
  const typingDiv = appendMessage("bot", "Thinking about Gyasu...", isModal);
  if (typingDiv) {
    typingDiv.classList.add("typing");
  }
  return typingDiv;
}

async function sendMessage(text, isModal) {
  const currentConversation = isModal ? modalConversation : conversation;
  const currentSendBtn = isModal ? modalSendBtn : sendBtn;
  const currentInput = isModal ? modalInput : input;

  // Only proceed if the elements exist for the current context
  if (!currentInput || !currentSendBtn) return;

  appendMessage("user", text, isModal);
  currentInput.value = "";
  currentSendBtn.disabled = true;

  const typingDiv = showTyping(isModal);

  // Create the enhanced prompt with Gyasu-specific knowledge base
  const enhancedPrompt = `You are Gyasu Bajracharya's personal AI assistant. Your role is to help visitors learn about Gyasu's work, research, musical background, and interests. You should be knowledgeable, friendly, and helpful in sharing information about Gyasu.

Use ONLY the information from the provided documents to answer questions about Gyasu. If someone asks about something not covered in the documents, politely explain that you don't have that specific information but encourage them to contact Gyasu directly or check his other materials.

Be conversational and engaging, as if you're representing Gyasu professionally but warmly. You can also answer general questions about research methods, academic topics, or music if they relate to Gyasu's work.

KNOWLEDGE BASE ABOUT GYASU:
${KNOWLEDGE_BASE}

USER QUESTION: ${text}

Please provide a helpful and informative response about Gyasu based on the available information. If referencing specific details, you can mention which document or area the information comes from.`;

  currentConversation.push({ role: "user", content: enhancedPrompt });

  const body = {
    model: MODEL,
    messages: currentConversation,
    temperature: 0.7 // Slightly higher for more conversational responses
  };

  try {
    // IMPORTANT: Replace 'YOUR_API_KEY_HERE' with your actual API key.
    // For GitHub Pages, you'd typically need a serverless function (like Netlify Functions, Vercel Serverless Functions)
    // to proxy your API calls and secure your API key, as exposing it directly in frontend JS is not recommended for production.
    // For a simple demo, you might include it directly, but be aware of the security implications.

    const res = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`${res.status} ${res.statusText}: ${errText}`);
    }

    const data = await res.json();
    const reply = data.choices?.[0]?.message?.content?.trim() || "[Empty response]";

    // Remove typing indicator and add actual response
    if (typingDiv) typingDiv.remove();
    currentConversation.push({ role: "assistant", content: reply });
    appendMessage("bot", reply, isModal);

  } catch (err) {
    console.error(err);
    if (typingDiv) typingDiv.remove();
    appendMessage("bot", `⚠️ Sorry, I'm having trouble connecting right now. Please try again later or contact Gyasu directly.`, isModal);
  } finally {
    if (currentSendBtn) currentSendBtn.disabled = false;
    if (currentInput) currentInput.focus();
  }
}

// Event Listeners - attached conditionally
if (isChatbotPage) {
  // Main chatbot form handler for chatbot.html
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const text = input.value.trim();
    if (text) sendMessage(text, false);
  });
  input.focus();
  setTimeout(() => {
    appendMessage("bot", "Hi! I'm Gyasu's AI assistant. I'm here to help you learn about his research, musical work, and background. What would you like to know about Gyasu?", false);
  }, 500);
} else {
  // Modal chatbot form handler for index.html
  modalForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const text = modalInput.value.trim();
    if (text) sendMessage(text, true);
  });
  setTimeout(() => {
    appendMessage("bot", "Hello! I'm here to help you learn about Gyasu Bajracharya. Feel free to ask me about his work!", true);
  }, 1000);
}


// === THEME TOGGLE FUNCTIONALITY (COMMON TO BOTH PAGES) ===
const toggle = document.getElementById('toggle-theme');
const bodyElement = document.body; // Renamed to avoid conflict with `body` in sendMessage
const icon = document.getElementById('theme-icon');

function setTheme(dark) {
  if (dark) {
    bodyElement.classList.add('dark-mode');
    icon.textContent = '☾';
    toggle.checked = true;
  } else {
    bodyElement.classList.remove('dark-mode');
    icon.textContent = '☀︎';
    toggle.checked = false;
  }
}

// On page load - removed localStorage to comply with restrictions
setTheme(false);

// On toggle
toggle.addEventListener('change', () => {
  setTheme(toggle.checked);
});

// === CHATBOT MODAL FUNCTIONALITY (ONLY ON INDEX.HTML) ===
if (!isChatbotPage) {
  const chatbotToggle = document.getElementById('chatbot-toggle');
  const chatbotModal = document.getElementById('chatbot-modal');
  const chatbotClose = document.getElementById('chatbot-close');

  chatbotToggle.addEventListener('click', () => {
    chatbotModal.classList.toggle('active');
    if (chatbotModal.classList.contains('active')) {
      modalInput.focus();
    }
  });

  chatbotClose.addEventListener('click', () => {
    chatbotModal.classList.remove('active');
  });

  // Close modal when clicking outside
  document.addEventListener('click', (e) => {
    if (chatbotModal && chatbotToggle && !chatbotModal.contains(e.target) && e.target !== chatbotToggle) {
      chatbotModal.classList.remove('active');
    }
  });
}


// === NAVIGATION FUNCTIONALITY (COMMON TO BOTH PAGES) ===
// Smooth scrolling for anchor links (adjusted for cross-page links)
document.querySelectorAll('a[href^="#"], a[href$=".html#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        const isInternalAnchor = href.startsWith('#') && href.length > 1;
        const isExternalPageAnchor = href.includes('.html#') && href.split('#')[0] === window.location.pathname.split('/').pop();

        if (isInternalAnchor || isExternalPageAnchor) {
            e.preventDefault();
            const targetId = href.split('#').pop();
            const target = document.getElementById(targetId);
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        }
        // For direct links like 'chatbot.html', let default behavior happen
    });
});


// Mobile navigation toggle
const navToggle = document.getElementById('nav-toggle');
const navLinks = document.querySelector('.nav-links');

if (navToggle && navLinks) {
  navToggle.addEventListener('click', () => {
    navLinks.classList.toggle('active');
  });

  // Close mobile nav when a link is clicked
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('active');
    });
  });
}