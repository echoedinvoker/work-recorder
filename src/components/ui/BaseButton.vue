<template>
  <button
    :type="type as 'submit' | 'button' | 'reset'"
    :class="[
      'text-nowrap px-4 py-2 text-white rounded-lg transition-colors text-sm',
      `bg-${color}-500 hover:bg-${color}-600`
    ]"
    @click="$emit('click', $event)"
  >
    <slot>{{ text }}</slot>
  </button>
</template>

<script setup lang="ts">
defineProps({
  // 按鈕類型：submit, button, reset
  type: {
    type: String,
    default: 'button'
  },
  // 按鈕顏色：blue, green, red 等 Tailwind 顏色
  color: {
    type: String,
    default: 'blue'
  },
  // 按鈕文字
  text: {
    type: String,
    default: ''
  }
});

// 定義事件
defineEmits(['click']);
</script>

