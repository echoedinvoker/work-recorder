<template>
  <div class="flex flex-col space-y-4">
    <h3 class="text-lg font-semibold">今日不自己動手結果</h3>
    <div class="mx-auto flex space-x-4">
      <BaseButton 
        color="green" 
        text="今日成功" 
        @click="recordSuccess" 
      />
      <BaseButton 
        color="red" 
        text="今日破功" 
        @click="recordFailure" 
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useDailyNoDIYStore } from '@/stores/dailyNoDIYStore';
import BaseButton from '@/components/ui/BaseButton.vue';

const store = useDailyNoDIYStore();

// 記錄成功
const recordSuccess = () => {
  store.recordResult(true);
};

// 記錄失敗
const recordFailure = () => {
  store.recordResult(false);
};
</script>

