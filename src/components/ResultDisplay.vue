<template>
  <div v-if="startTime && !isRecording" class="bg-gray-50 rounded-lg p-6 text-left space-y-2">
    <p class="text-gray-700">
      <span class="font-medium">開始時間:</span> {{ formatTime(startTime) }}
    </p>
    <p class="text-gray-700">
      <span class="font-medium">結束時間:</span> {{ formatTime(endTime!) }}
    </p>
    <p class="text-gray-700">
      <span class="font-medium">工作時長:</span> {{ workDuration }}
    </p>
    <p class="text-2xl font-bold text-green-600 pt-2">
      獲得分數: {{ score }} 分
    </p>

    <!-- 顯示當日總分 -->
    <div class="border-t pt-3 mt-3">
      <p class="text-xl font-bold text-blue-600">
        今日總分: {{ todayTotalScore }} 分
      </p>
    </div>

  </div>
</template>

<script setup lang="ts">
import { useRecorder } from '@/composables/useRecorder';

const {
  isRecording,
  startTime,
  endTime,
  formatTime,
  workDuration,
  score,
  todayTotalScore
} = useRecorder()
</script>
