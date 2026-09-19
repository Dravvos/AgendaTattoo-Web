<script setup lang="ts">
defineProps({
  size: {
    type: Number,
    default: 32,
  },
})
</script>

<template>
  <svg
    :width="size"
    :height="size"
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path
      d="M16 4c4.6 6.1 7.6 10.6 7.6 14.4A7.6 7.6 0 1 1 8.4 18.4C8.4 14.6 11.4 10.1 16 4Z"
      fill="currentColor"
    />
    <circle cx="16" cy="19.6" r="2.6" fill="var(--logo-dot, var(--ink-900))" />
  </svg>
</template>
