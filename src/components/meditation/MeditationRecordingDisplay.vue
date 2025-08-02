<template>
  <div v-if="isRecording" class="bg-white rounded-lg shadow-md p-6">
    <h3 class="text-xl font-semibold text-gray-800 mb-4">正在冥想中...</h3>
    
    <div class="flex justify-between mb-4">
      <div>
        <p class="text-gray-600">開始時間</p>
        <p class="text-lg font-medium">{{ formatTime(startTime) }}</p>
      </div>
      <div>
        <p class="text-gray-600">已冥想時間</p>
        <p class="text-2xl font-bold text-indigo-600">{{ meditationDuration }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useMeditationRecorder } from '@/composables/useMeditationRecorder';

const {
  isRecording,
  startTime,
  meditationDuration,
  formatTime
} = useMeditationRecorder();
</script>

