<template>
  <div class="flex flex-col space-y-4">
    <div class="flex justify-center">
      <BaseButton 
        :color="todayStatus ? 'green' : 'red'" 
        :text="buttonText"
        @click="toggleStatus" 
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useDailyFaceSportStore } from '@/stores/dailyFaceSportStore';
import BaseButton from '@/components/ui/BaseButton.vue';
import { computed } from 'vue';
import { getTodayKey } from '@/utils/dateUtils';

const store = useDailyFaceSportStore();

// 獲取今天的狀態
const todayStatus = computed(() => {
  return store.dailyFaceSportResults[getTodayKey()];
});

// 根據當前狀態決定按鈕文字
const buttonText = computed(() => {
  return todayStatus.value ? '臉部瑜伽完成 ✓' : '未完成臉部瑜伽 ✗';
});

// 切換今天的狀態
const toggleStatus = () => {
  // 切換狀態 (true -> false 或 false -> true)
  store.recordResult(!todayStatus.value);
};
</script>

