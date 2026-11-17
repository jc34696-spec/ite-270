/* ==========================================================================
   Krispy Delights interaction logic
   JavaScript decides when; CSS decides how.
   ========================================================================== */

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

const toast = $('#toast');
let toastTimer;
function announce(message) {
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2400);
}

const revealCards = $$('.reveal');
if (!reduced) {
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.remove('pending');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });

  revealCards.forEach((card) => {
    const aboveFold = card.getBoundingClientRect().top > window.innerHeight;
    if (aboveFold) card.classList.add('pending');
    revealObserver.observe(card);
  });
}

const STORY_MARGIN = '-45% 0px -45% 0px';
const stage = $('#stage');
const stageLabel = $('#stageLabel');
const storySteps = $$('.step');
if (window.motionXray) window.motionXray.zone(STORY_MARGIN);

const storyObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    const step = entry.target.dataset.step;
    stage.dataset.step = step;
    stageLabel.textContent = entry.target.querySelector('h3').textContent.replace(/\d+\.\s*/, '');
    storySteps.forEach((item) => item.classList.toggle('is-active', item === entry.target));
  });
}, { rootMargin: STORY_MARGIN });

storySteps.forEach((step) => storyObserver.observe(step));

const zoom = $('#zoom');
if (zoom && !reduced) {
  let rafId = null;
  const applyZoom = () => {
    const r = zoom.getBoundingClientRect();
    const p = Math.min(1, Math.max(0, -r.top / (r.height - window.innerHeight)));
    zoom.style.setProperty('--p', p.toFixed(3));
    rafId = null;
  };

  const onScroll = () => {
    if (rafId !== null) return;
    rafId = requestAnimationFrame(applyZoom);
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  applyZoom();
} else if (zoom) {
  zoom.style.setProperty('--p', '1');
}

let count = 0;
const countEl = $('#count');
const cart = $('#cart');
const addButtons = $$('.add');

addButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const card = button.closest('.card');
    const name = card?.dataset.name || 'Donut';
    count += 1;
    countEl.hidden = false;
    countEl.textContent = String(count);

    const pressAnim = button.animate([
      { transform: 'scale(1)' },
      { transform: 'scale(.96)' },
      { transform: 'scale(1)' }
    ], {
      duration: 220,
      easing: 'cubic-bezier(.34, 1.56, .64, 1)'
    });

    if (!reduced) {
      const cartAnim = cart.animate([
        { transform: 'translateY(0)' },
        { transform: 'translateY(-6px)' },
        { transform: 'translateY(0)' }
      ], {
        duration: 320,
        easing: 'cubic-bezier(.2, .8, .2, 1)'
      });

      cartAnim.finished.then(() => {
        countEl.animate([
          { transform: 'scale(1)' },
          { transform: 'scale(1.35)' },
          { transform: 'scale(1)' }
        ], {
          duration: 260,
          easing: 'cubic-bezier(.22, 1, .36, 1)'
        });
      });
    }

    announce(`${name} added. ${count} in your order.`);
    pressAnim.finished.finally(() => button.blur());
  });
});

const pauseBtn = $('#pauseBtn');
pauseBtn.addEventListener('click', () => {
  const isPaused = document.documentElement.classList.toggle('paused');
  pauseBtn.setAttribute('aria-pressed', String(isPaused));
  pauseBtn.textContent = isPaused ? 'Play motion' : 'Pause motion';
});

