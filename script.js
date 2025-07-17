const toggleInput = document.getElementById('toggle-theme');
const body = document.body;
const icon = document.querySelector('.slider .icon');

function setTheme(dark) {
    if (dark) {
        body.classList.add('dark-mode');
        icon.textContent = '🌑'; // or '●'
        toggleInput.checked = true;
        localStorage.setItem('theme', 'dark');
    } else {
        body.classList.remove('dark-mode');
        icon.textContent = '☀️';
        toggleInput.checked = false;
        localStorage.setItem('theme', 'light');
    }
}

// On page load
document.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('theme');
    setTheme(savedTheme === 'dark');

    toggleInput.addEventListener('change', () => {
        setTheme(toggleInput.checked);
    });
});
