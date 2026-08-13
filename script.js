const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Fade the greeting in once the page has settled.
const header = document.querySelector('header');
requestAnimationFrame(() => {
  setTimeout(() => header.classList.add('is-visible'), 150);
});

// Reveal the note card as it scrolls into view.
const card = document.querySelector('.card');
if ('IntersectionObserver' in window && !prefersReducedMotion) {
  const cardObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        card.classList.add('is-visible');
        cardObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.35 });
  cardObserver.observe(card);
} else {
  card.classList.add('is-visible');
}

// Gentle parallax on the ambient glows, following the cursor.
if (!prefersReducedMotion) {
  const glows = document.querySelectorAll('.glow');
  window.addEventListener('mousemove', (event) => {
    const xRatio = event.clientX / window.innerWidth - 0.5;
    const yRatio = event.clientY / window.innerHeight - 0.5;
    glows.forEach((glow, i) => {
      const strength = (i + 1) * 10;
      glow.style.translate = `${xRatio * strength}px ${yRatio * strength}px`;
    });
  });
}
