import { useIntersectionObserver } from '@vueuse/core';
import type { Ref } from 'vue';

// Calls onEnter each time the target scrolls into view (with a head start)
export const useInView = (
  target: Ref<HTMLElement | null>,
  onEnter: () => void
) =>
  useIntersectionObserver(
    target,
    (entries) => {
      if (entries.some((entry) => entry.isIntersecting)) onEnter();
    },
    { rootMargin: '0px 0px 400px 0px' }
  );
