<template>
  <h2 class="text-xl font-bold text-gray-800 mb-3">{{ title }}</h2>
  <form @submit.prevent="handleSubmit" class="space-y-3">
    <slot />
  </form>
</template>

<script setup lang="ts">
defineProps<{
  title: string;
  handleSubmit: () => void;
}>();
</script>
