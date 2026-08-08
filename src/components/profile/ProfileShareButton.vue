<script setup lang="ts">
import { ref } from 'vue';

const copied = ref(false);

const copyProfileLink = async () => {
  const url = window.location.href;
  if (navigator.share) {
    try {
      await navigator.share({ title: 'Moodie 프로필', url });
      return;
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return;
    }
  }

  try {
    await navigator.clipboard.writeText(url);
  } catch {
    const input = document.createElement('textarea');
    input.value = url;
    input.style.position = 'fixed';
    input.style.opacity = '0';
    document.body.append(input);
    input.select();
    document.execCommand('copy');
    input.remove();
  }

  copied.value = true;
  window.setTimeout(() => {
    copied.value = false;
  }, 2600);
};
</script>

<template>
  <div class="relative">
    <button
      type="button"
      class="focus-ring corner-soft inline-flex min-h-11 items-center justify-center gap-2 border-2 border-[#174a77] bg-[#eef6ff] px-4 text-sm font-semibold text-[#174a77] transition-colors hover:bg-[#e6f2ff]"
      @click="copyProfileLink"
    >
      <span aria-hidden="true">↗</span>
      <span>프로필 공유</span>
    </button>
    <p
      v-if="copied"
      role="status"
      class="corner-soft absolute right-0 top-[calc(100%+0.5rem)] z-10 w-max border border-[#9bcda6] bg-[#f2fbf4] px-3 py-2 text-xs font-medium text-[#1e5d37]"
    >
      프로필 링크가 복사되었습니다.
    </p>
  </div>
</template>
