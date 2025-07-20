// === CHATBOT CONFIG ===
const MODEL = "google/gemma-2-9b-it:free";

// === KNOWLEDGE BASE ABOUT GYASU ===
const KNOWLEDGE_BASE = `
DOCUMENT: About Gyasu Bajracharya

Gyasu Bajracharya is a PhD student in Biophysics at UCSF, where he works at the intersection of AI and biology. He is currently a researcher in the Capra Lab, focusing on developing computational methods that improve our understanding of protein evolution and function. His projects include interpretable machine learning, fine-tuning protein language models, sparse autoencoders, and embedding-based tools for protein variant interpretation. His long-term goal is to develop ML/AI tools to accelerate therapeutics and make protein research accessible to low-resource communities worldwide.

Originally from Nepal, his move to the U.S. gave him the opportunity to pursue both science and classical music. He completed his undergraduate studies at Gettysburg College with honors, double-majoring in Biochemistry & Molecular Biology and Music. During college, he explored microbiology and molecular genetics through multiple summer research programs at Penn State. He later developed an interest in computational biology while working at NGM Biopharmaceuticals, where he engineered therapeutic antibodies, built analysis pipelines, and filed a patent (pending) for an anti-cancer antibody therapeutic.

Gyasu was awarded an Honorable Mention in the 2025 NSF Graduate Research Fellowship Program (GRFP). He is a strong advocate for mentorship and inclusion in science, having mentored interns through REU programs and summer students at UCSF. He also served as a Teaching Assistant in UCSF's core biophysics course, *Macromolecular Interactions*.

Musically, Gyasu is an experienced pianist, guitarist, and composer. He began studying piano at age 7 and has pursued his passion for classical music throughout his academic journey. His original composition, "La Da Di Da," is available on Spotify.

Outside of academia, Gyasu enjoys tennis, chess, working out, and is an avid supporter of Manchester United and Formula 1.
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

// === ENHANCED SCROLLING FUNCTIONALITY ===
// This function should match the one from your script.js
function scrollToBottom(container) {
  if (!container) return;
  
  // Use requestAnimationFrame for smooth scrolling
  requestAnimationFrame(() => {
    container.scrollTop = container.scrollHeight;
    
    // Double-check after a brief delay to ensure content is fully rendered
    setTimeout(() => {
      container.scrollTop = container.scrollHeight;
    }, 10);
  });
}

// Enhanced append message function with proper auto-scrolling
function appendMessage(role, content, isModal) {
  const targetDiv = isModal ? modalMessagesDiv : messagesDiv;
  if (!targetDiv) return; // Exit if the target div doesn't exist on this page

  const msgDiv = document.createElement("div");
  msgDiv.className = "chatbot-msg " + (role === "user" ? "user" : "bot");
  msgDiv.textContent = content;
  targetDiv.appendChild(msgDiv);
  
  // Use enhanced scrolling with multiple timing attempts
  scrollToBottom(targetDiv);
  
  // Additional scroll attempts to handle different rendering scenarios
  setTimeout(() => scrollToBottom(targetDiv), 50);
  setTimeout(() => scrollToBottom(targetDiv), 150);
  
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
  const targetDiv = isModal ? modalMessagesDiv : messagesDiv;

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

  const requestBody = {
    model: MODEL,
    messages: currentConversation,
    temperature: 0.7
  };

  try {
    const res = await fetch('https://gyasu-github-io.vercel.app/api/chat', {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(requestBody)
    });

    if (!res.ok) {
      let errorMessage;
      try {
        const errorData = await res.json();
        errorMessage = errorData.error || `HTTP ${res.status}: ${res.statusText}`;
      } catch {
        errorMessage = `HTTP ${res.status}: ${res.statusText}`;
      }
      throw new Error(errorMessage);
    }

    const data = await res.json();
    const reply = data.choices?.[0]?.message?.content?.trim() || "[Empty response]";

    // Remove typing indicator and add actual response
    if (typingDiv) typingDiv.remove();
    currentConversation.push({ role: "assistant", content: reply });
    
    // Add bot response with enhanced scrolling
    const botMsgDiv = appendMessage("bot", reply, isModal);
    
    // Extra scroll insurance for bot responses (they tend to be longer)
    setTimeout(() => scrollToBottom(targetDiv), 100);
    setTimeout(() => scrollToBottom(targetDiv), 300);

  } catch (err) {
    console.error('Chat error:', err);
    if (typingDiv) typingDiv.remove();
    
    let errorMessage = "Sorry, I'm having trouble connecting right now. ";
    if (err.message.includes('API key')) {
      errorMessage += "The API configuration needs to be set up. ";
    } else if (err.message.includes('404')) {
      errorMessage += "The chat service is not available. ";
    }
    errorMessage += "Please try again later or contact Gyasu directly.";
    
    appendMessage("bot", `⚠️ ${errorMessage}`, isModal);
  } finally {
    if (currentSendBtn) currentSendBtn.disabled = false;
    if (currentInput) currentInput.focus();
  }
}

// Event Listeners - attached conditionally with null checks
if (isChatbotPage) {
  // Main chatbot form handler for chatbot.html
  if (form && input) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const text = input.value.trim();
      if (text) sendMessage(text, false);
    });
    input.focus();
    setTimeout(() => {
      appendMessage("bot", "Hi! I'm Gyasu's AI assistant. I'm here to help you learn about his research, musical work, and background. What would you like to know about Gyasu?", false);
    }, 500);
  }
} else {
  // Modal chatbot form handler for index.html
  if (modalForm && modalInput) {
    modalForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const text = modalInput.value.trim();
      if (text) sendMessage(text, true);
    });
    setTimeout(() => {
      appendMessage("bot", "Hello! I'm here to help you learn about Gyasu Bajracharya. Feel free to ask me about his work!", true);
    }, 1000);
  }
}

// === THEME TOGGLE FUNCTIONALITY (COMMON TO BOTH PAGES) ===
const toggle = document.getElementById('toggle-theme');
const bodyElement = document.body;
const icon = document.getElementById('theme-icon');

function setTheme(dark) {
  if (dark) {
    bodyElement.classList.add('dark-mode');
    if (icon) icon.textContent = '☾';
    if (toggle) toggle.checked = true;
  } else {
    bodyElement.classList.remove('dark-mode');
    if (icon) icon.textContent = '☀︎';
    if (toggle) toggle.checked = false;
  }
}

// Set default theme
setTheme(false);

// Theme toggle event listener
if (toggle) {
  toggle.addEventListener('change', () => {
    setTheme(toggle.checked);
  });
}

// === CHATBOT MODAL FUNCTIONALITY (ONLY ON INDEX.HTML) ===
if (!isChatbotPage) {
  const chatbotToggle = document.getElementById('chatbot-toggle');
  const chatbotModal = document.getElementById('chatbot-modal');
  const chatbotClose = document.getElementById('chatbot-close');

  if (chatbotToggle && chatbotModal) {
    chatbotToggle.addEventListener('click', () => {
      chatbotModal.classList.toggle('active');
      if (chatbotModal.classList.contains('active') && modalInput) {
        modalInput.focus();
        // Scroll to bottom when modal opens (in case there are existing messages)
        setTimeout(() => {
          if (modalMessagesDiv) {
            scrollToBottom(modalMessagesDiv);
          }
        }, 100);
      }
    });
  }

  if (chatbotClose && chatbotModal) {
    chatbotClose.addEventListener('click', () => {
      chatbotModal.classList.remove('active');
    });
  }

  // Close modal when clicking outside
  if (chatbotModal && chatbotToggle) {
    document.addEventListener('click', (e) => {
      if (!chatbotModal.contains(e.target) && e.target !== chatbotToggle) {
        chatbotModal.classList.remove('active');
      }
    });
  }
}

// === NAVIGATION FUNCTIONALITY (COMMON TO BOTH PAGES) ===
// Smooth scrolling for anchor links
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