<template>
  <div class="flex flex-col space-y-4">
    <div class="flex justify-center">
      <BaseButton 
        :color="todayNoSugarStatus ? 'green' : 'red'" 
        :text="buttonText"
        @click="toggleNoSugarStatus"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useDailyNoSugarStore } from '@/stores/dailyNoSugarStore';
import BaseButton from '@/components/ui/BaseButton.vue';
import { computed } from 'vue';
import { getTodayKey } from '@/utils/dateUtils';

const store = useDailyNoSugarStore();

// 獲取今天的戒糖狀態
const todayNoSugarStatus = computed(() => {
  return store.dailyNoSugarResults[getTodayKey()];
});

// 根據當前狀態決定按鈕文字
const buttonText = computed(() => {
  return todayNoSugarStatus.value ? '今日戒糖成功 ✓' : '今日戒糖失敗 ✗';
});

// 切換今天的戒糖狀態
const toggleNoSugarStatus = () => {
  // 切換狀態 (true -> false 或 false -> true)
  store.recordResult(!todayNoSugarStatus.value);
};
</script>

