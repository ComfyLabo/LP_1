(() => {
  const navToggle = document.querySelector('.nav-toggle');
  const navList = document.getElementById('nav-list');

  if (navToggle && navList) {
    navToggle.addEventListener('click', () => {
      const isExpanded = navToggle.getAttribute('aria-expanded') === 'true';
      navToggle.setAttribute('aria-expanded', String(!isExpanded));
      navList.classList.toggle('is-open', !isExpanded);
    });

    navList.addEventListener('click', (event) => {
      if (event.target instanceof HTMLElement && event.target.tagName === 'A') {
        navToggle.setAttribute('aria-expanded', 'false');
        navList.classList.remove('is-open');
      }
    });
  }
})();

(() => {
  const sliderEls = document.querySelectorAll('[data-slider]');

  sliderEls.forEach((slider) => {
    const track = slider.querySelector('[data-slider-track]');
    const prevBtn = slider.querySelector('[data-slider-prev]');
    const nextBtn = slider.querySelector('[data-slider-next]');

    if (!(track instanceof HTMLElement) || !(prevBtn instanceof HTMLButtonElement) || !(nextBtn instanceof HTMLButtonElement)) {
      return;
    }

    const cards = Array.from(track.children);
    if (!cards.length) return;

    let currentIndex = 0;
    let resizeTimer = 0;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

    const getVisibleCount = () => {
      if (window.innerWidth >= 1200) return 2;
      return 1;
    };

    const getGapSize = () => {
      const styles = window.getComputedStyle(track);
      const gapValue = parseFloat(styles.columnGap || styles.gap || '0');
      return Number.isNaN(gapValue) ? 0 : gapValue;
    };

    const getStepSize = () => {
      const firstCard = track.children[0];
      if (!(firstCard instanceof HTMLElement)) return 0;
      return firstCard.getBoundingClientRect().width + getGapSize();
    };

    const clampIndex = (index) => {
      const maxIndex = Math.max(0, cards.length - getVisibleCount());
      return Math.min(Math.max(index, 0), maxIndex);
    };

    const updateButtons = () => {
      const visibleCount = getVisibleCount();
      const maxIndex = Math.max(0, cards.length - visibleCount);
      const isScrollable = cards.length > visibleCount;

      prevBtn.disabled = !isScrollable || currentIndex <= 0;
      nextBtn.disabled = !isScrollable || currentIndex >= maxIndex;

      prevBtn.setAttribute('aria-disabled', String(prevBtn.disabled));
      nextBtn.setAttribute('aria-disabled', String(nextBtn.disabled));
    };

    const updatePosition = () => {
      const visibleCount = getVisibleCount();
      currentIndex = clampIndex(currentIndex);
      const step = getStepSize();
      const offset = step * currentIndex;

      if (reduceMotion.matches) {
        track.style.transition = 'none';
      } else {
        track.style.transition = '';
      }

      track.style.transform = `translateX(-${offset}px)`;
      updateButtons();
    };

    const goTo = (nextIndex) => {
      currentIndex = clampIndex(nextIndex);
      updatePosition();
    };

    prevBtn.addEventListener('click', () => {
      goTo(currentIndex - 1);
    });

    nextBtn.addEventListener('click', () => {
      goTo(currentIndex + 1);
    });

    window.addEventListener('resize', () => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => {
        updatePosition();
      }, 150);
    });

    window.addEventListener('load', updatePosition);
    updatePosition();
  });
})();

(() => {
  const fadeTargets = document.querySelectorAll('.fade-in');
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!fadeTargets.length) return;

  if (prefersReducedMotion) {
    fadeTargets.forEach((el) => el.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        obs.unobserve(entry.target);
      }
    });
  }, {
    rootMargin: '0px 0px -80px 0px',
    threshold: 0.2,
  });

  fadeTargets.forEach((el) => observer.observe(el));
})();
