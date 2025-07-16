// script.js

document.addEventListener('DOMContentLoaded', () => {
  // 1. Smooth scroll for nav links
  document.querySelectorAll('nav a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
      e.preventDefault();
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  // 3. Dynamically generate highlight cards
  const highlightsData = [
    {
      title: "Protein Evolution",
      description: "Studying constraints across species...",
      link: "#research"
    },
    {
      title: "Machine Learning Models",
      description: "Developing PLMs for protein function prediction...",
      link: "#research"
    },
    {
      title: "Music Journey",
      description: "Classical pianist and lifelong musician.",
      link: "#music"
    }
  ];

  const grid = document.querySelector('.highlight-grid');
  if (grid) {
    grid.innerHTML = ''; // clear existing cards if any

    highlightsData.forEach(item => {
      const card = document.createElement('div');
      card.className = 'highlight-card';
      card.innerHTML = `
        <h3>${item.title}</h3>
        <p>${item.description}</p>
        <a href="${item.link}" class="btn">View</a>
      `;
      grid.appendChild(card);
    });
  }

  // 4. Mobile nav toggle (hamburger menu)
  const navLinks = document.querySelector('.nav-links');
  const toggleButton = document.getElementById('nav-toggle');

  if (toggleButton && navLinks) {
    toggleButton.addEventListener('click', () => {
      navLinks.classList.toggle('active');
    });
  }
});
