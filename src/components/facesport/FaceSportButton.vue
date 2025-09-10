<template>
  <div class="flex flex-col space-y-4">
    <h3 class="text-lg font-semibold">今日臉部運動結果</h3>
    <div class="flex space-x-4">
      <BaseButton 
        color="green" 
        text="成功" 
        @click="recordSuccess" 
      />
      <BaseButton 
        color="red" 
        text="失敗" 
        @click="recordFailure" 
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useDailyFaceSportStore } from '@/stores/dailyFaceSportStore';
import BaseButton from '@/components/ui/BaseButton.vue';

const store = useDailyFaceSportStore();

// 記錄成功
const recordSuccess = () => {
  store.recordResult(true);
};

// 記錄失敗
const recordFailure = () => {
  store.recordResult(false);
};
</script>

