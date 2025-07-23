<template>
  <button
    :type="type as 'submit' | 'button' | 'reset'"
    :class="[
      'px-8 py-4 text-lg font-semibold rounded-lg transition-all duration-300 transform hover:scale-105 text-white shadow-lg',
      {
        'bg-red-500 hover:bg-red-600': color === 'red',
        'bg-green-500 hover:bg-green-600': color === 'green',
        'bg-blue-500 hover:bg-blue-600': color === 'blue',
        'bg-gray-500 hover:bg-gray-600': color === 'gray'
      }
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

