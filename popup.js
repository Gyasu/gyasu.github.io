// Preprint Popup Functionality

function closePopup() {
  const popup = document.getElementById('preprint-popup');
  popup.classList.add('hidden');
  // Store in session so it doesn't show again this session
  sessionStorage.setItem('preprintPopupShown', 'true');
}

function trackPreprintClick() {
  console.log('Preprint link clicked');
  // You can add analytics tracking here if needed
}

// Show popup on page load if not shown this session
window.addEventListener('load', () => {
  if (!sessionStorage.getItem('preprintPopupShown')) {
    const popup = document.getElementById('preprint-popup');
    if (popup) {
      popup.classList.remove('hidden');
    }
  }
});

// Close on escape key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    const popup = document.getElementById('preprint-popup');
    if (popup && !popup.classList.contains('hidden')) {
      closePopup();
    }
  }
});