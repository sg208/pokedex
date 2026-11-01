import type { Directive } from 'vue';

// v-reveal: lifts an element into place once it scrolls into view.
// Content is only hidden after the script runs and motion is allowed, and a
// scroll check plus a print hook make sure nothing is left hidden.
const STEP_MS = 75; // stagger between siblings, inside the 60-90ms house range

const prefersReducedMotion = (): boolean =>
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;

const pending = new Set<HTMLElement>();

const show = (element: HTMLElement): void => {
  element.classList.add('reveal-in');
  element.classList.remove('reveal-pending');
  pending.delete(element);
};

const showReached = (): void => {
  pending.forEach((element) => {
    // Anything at or above the bottom of the viewport has been reached,
    // including elements a fast scroll jumped straight past
    if (element.getBoundingClientRect().top < window.innerHeight) show(element);
  });
};

const showAll = (): void => {
  pending.forEach(show);
};

export default defineNuxtPlugin((nuxtApp) => {
  const canObserve = import.meta.client && 'IntersectionObserver' in window;
  const observer = canObserve
    ? new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) show(entry.target as HTMLElement);
        });
        showReached();
      })
    : null;

  if (observer) {
    let isQueued = false;
    const handleScroll = (): void => {
      if (isQueued) return;
      isQueued = true;
      requestAnimationFrame(() => {
        isQueued = false;
        showReached();
      });
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll, { passive: true });
    window.addEventListener('beforeprint', showAll);
  }

  const reveal: Directive<HTMLElement, number | undefined> = {
    getSSRProps: () => ({}),
    mounted: (element, binding) => {
      if (!observer || prefersReducedMotion()) return;
      const order = binding.value ?? 0;
      element.style.setProperty('--reveal-delay', `${order * STEP_MS}ms`);
      element.classList.add('reveal-pending');
      pending.add(element);
      observer.observe(element);
    },
    unmounted: (element) => {
      pending.delete(element);
      observer?.unobserve(element);
    },
  };

  nuxtApp.vueApp.directive('reveal', reveal);
});
