<template>
  <div v-if="isDisplayingResult" class="bg-white rounded-lg shadow-md p-6 text-center">
    <h3 class="text-xl font-semibold text-gray-800 mb-4">冥想結果</h3>
    
    <div class="flex justify-between mb-4">
      <div class="text-left">
        <p class="text-gray-600">開始時間</p>
        <p class="text-lg font-medium">{{ formatTime(startTime) }}</p>
      </div>
      <div class="text-right">
        <p class="text-gray-600">結束時間</p>
        <p class="text-lg font-medium">{{ formatTime(endTime) }}</p>
      </div>
    </div>
    
    <div class="mb-6">
      <p class="text-gray-600">冥想時長</p>
      <p class="text-2xl font-bold text-indigo-600">{{ meditationDuration }}</p>
    </div>
    
    <button 
      @click="disableResultDisplay" 
      class="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
    >
      關閉
    </button>
  </div>
</template>

<script setup lang="ts">
import { useMeditationRecorder } from '@/composables/useMeditationRecorder';

const {
  isDisplayingResult,
  startTime,
  endTime,
  meditationDuration,
  formatTime,
  disableResultDisplay
} = useMeditationRecorder();
</script>
