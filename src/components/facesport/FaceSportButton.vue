<template>
  <div class="flex flex-col space-y-4">
    <h3 class="text-lg font-semibold">今日臉部運動結果</h3>
    <div class="flex space-x-4">
      <BaseButton 
        color="green" 
        text="今日完成 運動" 
        @click="recordSuccess" 
      />
      <BaseButton 
        color="red" 
        text="今日未能 運動" 
        @click="recordFailure" 
      />
    </div>
    <div v-if="todayResult !== undefined" class="text-lg font-medium">
      今日結果: 
      <span :class="todayResult ? 'text-green-600' : 'text-red-600'">
        {{ todayResult ? '完成 (+10分)' : '未完成 (-5分)' }}
      </span>
    </div>
    <div class="text-lg font-medium">
      當前總分: <span class="text-blue-600">{{ currentScore }}分</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useDailyFaceSportStore } from '@/stores/dailyFaceSportStore';
import BaseButton from '@/components/ui/BaseButton.vue';

const store = useDailyFaceSportStore();

// 獲取今日結果
const todayResult = computed(() => {
  return store.getResultByDate(new Date());
});

// 獲取當前總分
const currentScore = computed(() => {
  return store.getCurrentScore();
});

// 記錄成功
const recordSuccess = () => {
  store.recordResult(true);
};

// 記錄失敗
const recordFailure = () => {
  store.recordResult(false);
};
</script>

