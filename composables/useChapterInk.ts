import { onBeforeUnmount, onMounted, ref } from 'vue';
import type { Ref } from 'vue';

const DEFAULT_BG = '#e6e0d2';
const DEFAULT_INK = '#1a1a1a';

interface ChapterInk {
  bg: Ref<string>;
  ink: Ref<string>;
}

// Tracks which [data-chapter] section sits under the top of the viewport and
// exposes its ground and ink so the sticky header can take them.
export const useChapterInk = (): ChapterInk => {
  const bg = ref(DEFAULT_BG);
  const ink = ref(DEFAULT_INK);
  let observer: IntersectionObserver | null = null;

  onMounted(() => {
    if (!('IntersectionObserver' in window)) return;
    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const target = entry.target as HTMLElement;
          bg.value = target.dataset.bg ?? DEFAULT_BG;
          ink.value = target.dataset.ink ?? DEFAULT_INK;
        });
      },
      // A thin band at the top of the viewport, where the header sits
      { rootMargin: '0px 0px -92% 0px' }
    );
    document
      .querySelectorAll('[data-chapter]')
      .forEach((chapter) => observer?.observe(chapter));
  });

  onBeforeUnmount(() => observer?.disconnect());

  return { bg, ink };
};
