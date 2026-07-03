const header = document.querySelector('[data-header]');
const toggle = document.querySelector('[data-menu-toggle]');
const nav = document.querySelector('[data-nav]');
const year = document.querySelector('[data-year]');

if (year) year.textContent = new Date().getFullYear();

function updateHeader() {
  if (!header) return;
  header.classList.toggle('is-scrolled', window.scrollY > 24);
}
updateHeader();
window.addEventListener('scroll', updateHeader, { passive: true });

if (toggle && nav) {
  toggle.addEventListener('click', () => {
    const open = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', String(!open));
    nav.classList.toggle('is-open', !open);
    document.body.classList.toggle('menu-open', !open);
  });

  nav.addEventListener('click', (event) => {
    if (event.target.matches('a')) {
      toggle.setAttribute('aria-expanded', 'false');
      nav.classList.remove('is-open');
      document.body.classList.remove('menu-open');
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      toggle.setAttribute('aria-expanded', 'false');
      nav.classList.remove('is-open');
      document.body.classList.remove('menu-open');
      toggle.focus();
    }
  });
}

const revealItems = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  revealItems.forEach((item) => observer.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add('is-visible'));
}

const introSection = document.querySelector('[data-intro-parallax]');
const parallaxRoot = document.querySelector('.intro-visual');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
let parallaxTicking = false;

function clampNumber(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function updateIntroParallax() {
  if ((!introSection && !parallaxRoot) || reduceMotion.matches) return;

  const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
  const viewportWidth = window.innerWidth || document.documentElement.clientWidth;
  const motionScale = viewportWidth < 700 ? 0.62 : viewportWidth < 1100 ? 0.82 : 1;

  if (introSection) {
    const sectionRect = introSection.getBoundingClientRect();
    const sectionProgress = clampNumber(
      (viewportHeight - sectionRect.top) / (viewportHeight + sectionRect.height),
      0,
      1
    );
    const centeredProgress = (sectionProgress - 0.5) * 2;
    const bgY = centeredProgress * -64 * motionScale;
    const bgScale = 1.08 + Math.abs(centeredProgress) * 0.035;

    introSection.style.setProperty('--intro-bg-y', `${bgY.toFixed(2)}px`);
    introSection.style.setProperty('--intro-bg-scale', bgScale.toFixed(3));
  }

  if (parallaxRoot) {
    const visualRect = parallaxRoot.getBoundingClientRect();
    const centerOffset = (viewportHeight / 2) - (visualRect.top + visualRect.height / 2);
    const clamped = clampNumber(centerOffset, -240, 240) * motionScale;

    parallaxRoot.style.setProperty('--intro-y', `${(-clamped * 0.055).toFixed(2)}px`);
    parallaxRoot.style.setProperty('--intro-portrait-x', `${(-clamped * 0.018).toFixed(2)}px`);
    parallaxRoot.style.setProperty('--intro-portrait-y', `${(-clamped * 0.032).toFixed(2)}px`);
    parallaxRoot.style.setProperty('--intro-flow-x', `${(clamped * 0.035).toFixed(2)}px`);
    parallaxRoot.style.setProperty('--intro-flow-y', `${(clamped * 0.07).toFixed(2)}px`);
  }
}

function requestIntroParallax() {
  if (parallaxTicking) return;
  parallaxTicking = true;
  window.requestAnimationFrame(() => {
    updateIntroParallax();
    parallaxTicking = false;
  });
}

if ((introSection || parallaxRoot) && !reduceMotion.matches) {
  updateIntroParallax();
  window.addEventListener('scroll', requestIntroParallax, { passive: true });
  window.addEventListener('resize', requestIntroParallax);
}

// Collapse long testimonial/review cards so homepage reviews stay balanced.
const testimonialQuotes = document.querySelectorAll('.testimonial-card blockquote');

testimonialQuotes.forEach((quote, index) => {
  const plainText = quote.textContent.trim();
  const shouldCollapse = plainText.length > 260;
  if (!shouldCollapse) return;

  const wrapper = document.createElement('div');
  wrapper.className = 'review-text-wrap has-fade';
  quote.parentNode.insertBefore(wrapper, quote);
  wrapper.appendChild(quote);

  quote.classList.add('review-collapsible', 'is-collapsed');
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'review-more-toggle';
  button.setAttribute('aria-expanded', 'false');
  button.setAttribute('aria-controls', `review-text-${index + 1}`);
  button.textContent = 'More';
  quote.id = `review-text-${index + 1}`;

  wrapper.insertAdjacentElement('afterend', button);

  button.addEventListener('click', () => {
    const expanded = button.getAttribute('aria-expanded') === 'true';
    button.setAttribute('aria-expanded', String(!expanded));
    button.textContent = expanded ? 'More' : 'Less';
    quote.classList.toggle('is-collapsed', expanded);
    wrapper.classList.toggle('is-expanded', !expanded);
    wrapper.classList.toggle('has-fade', expanded);
  });
});


const moreNav = document.querySelector('[data-nav-more]');
const moreToggle = document.querySelector('[data-nav-more-toggle]');
if (moreNav && moreToggle) {
  moreToggle.addEventListener('click', (event) => {
    event.stopPropagation();
    const open = moreNav.classList.toggle('is-open');
    moreToggle.setAttribute('aria-expanded', String(open));
  });
  document.addEventListener('click', (event) => {
    if (!moreNav.contains(event.target)) {
      moreNav.classList.remove('is-open');
      moreToggle.setAttribute('aria-expanded', 'false');
    }
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      moreNav.classList.remove('is-open');
      moreToggle.setAttribute('aria-expanded', 'false');
    }
  });
}
