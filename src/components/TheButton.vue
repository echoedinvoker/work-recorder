<template>
  <button @click="toggleTimer" :class="[
    'px-8 py-4 text-lg font-semibold rounded-lg transition-all duration-300 transform hover:scale-105',
    isRecording
      ? 'bg-red-500 hover:bg-red-600 text-white shadow-lg'
      : 'bg-green-500 hover:bg-green-600 text-white shadow-lg'
  ]">
    {{ isRecording ? '結束工作' : '開始工作' }}
  </button>
</template>

<script setup lang="ts">
import { useRecorder } from '@/composables/useRecorder';

const {
  toggleTimer,
  isRecording,
} = useRecorder()
</script>
