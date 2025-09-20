<template>
  <div v-if="isRecording" class="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-left space-y-2">
    <p class="text-gray-700">
      <span class="font-medium">開始時間:</span> {{ formatTime(startTime!) }}
    </p>
    <p class="text-yellow-700 font-medium flex items-center">
      <span class="animate-pulse mr-2">●</span>
      正在記錄中...
    </p>
  </div>
</template>

<script setup lang="ts">
import { useRecorder } from '@/composables/useRecorder';

const {
  isRecording,
  startTime,
  formatTime,
} = useRecorder()
</script>
