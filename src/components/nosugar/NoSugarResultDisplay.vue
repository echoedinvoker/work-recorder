<template>
  <div class="bg-white rounded-lg shadow-md p-6">
    <h3 class="text-lg font-semibold text-gray-800 mb-4">戒糖統計</h3>
    
    <div class="grid grid-cols-2 gap-4">
      <div class="bg-blue-50 p-4 rounded-lg">
        <div class="text-sm text-gray-600">總分數</div>
        <div class="text-2xl font-bold text-blue-600">{{ currentScore }}分</div>
      </div>
      
      <div class="bg-green-50 p-4 rounded-lg">
        <div class="text-sm text-gray-600">成功次數</div>
        <div class="text-2xl font-bold text-green-600">{{ successCount }}次</div>
      </div>
      
      <div class="bg-red-50 p-4 rounded-lg">
        <div class="text-sm text-gray-600">失敗次數</div>
        <div class="text-2xl font-bold text-red-600">{{ failureCount }}次</div>
      </div>
      
      <div class="bg-purple-50 p-4 rounded-lg">
        <div class="text-sm text-gray-600">成功率</div>
        <div class="text-2xl font-bold text-purple-600">{{ successRate }}%</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useDailyNoSugarStore } from '@/stores/dailyNoSugarStore';

const store = useDailyNoSugarStore();

// 獲取當前總分
const currentScore = computed(() => {
  return store.getCurrentScore();
});

// 計算成功次數
const successCount = computed(() => {
  return Object.values(store.dailyNoSugarResults).filter(result => result === true).length;
});

// 計算失敗次數
const failureCount = computed(() => {
  return Object.values(store.dailyNoSugarResults).filter(result => result === false).length;
});

// 計算成功率
const successRate = computed(() => {
  const total = successCount.value + failureCount.value;
  if (total === 0) return 0;
  return Math.round((successCount.value / total) * 100);
});
</script>

