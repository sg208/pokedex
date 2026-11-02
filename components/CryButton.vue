<script setup lang="ts">
interface Props {
  src: string | null;
  name: string;
}

const props = defineProps<Props>();

const isSupported = ref(false);
const hasFailed = ref(false);

// Ogg playback varies by browser; only offer the cry where it can play
onMounted((): void => {
  isSupported.value =
    document.createElement('audio').canPlayType('audio/ogg') !== '';
});

const handlePlay = async (): Promise<void> => {
  if (!props.src) return;
  hasFailed.value = false;
  try {
    await new Audio(props.src).play();
  } catch {
    hasFailed.value = true;
  }
};
</script>

<template>
  <div v-if="src && isSupported">
    <button
      type="button"
      class="cry-button"
      :aria-label="`Play the cry of ${formatName(name)}`"
      @click="handlePlay"
    >
      Cry
    </button>
    <p v-if="hasFailed" role="status" class="mt-2 text-small">
      The cry could not play.
    </p>
  </div>
</template>

<style scoped>
.cry-button {
  min-height: 2.75rem;
  padding: 0 1.5rem;
  background: var(--ink);
  color: var(--bg);
  font-weight: 800;
}
</style>
