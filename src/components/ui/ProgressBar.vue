<template>
  <div class="flex items-center justify-center gap-2">
    <div class="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 overflow-hidden">
      <div 
        class="bg-blue-600 h-2.5 rounded-full transition-all duration-300" 
        :style="{ width: `${value}%` }"
      ></div>
    </div>
    <span class="text-left min-w-[60px] text-sm">{{ formattedValue }}%</span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  value: number;
  max?: number;
  decimals?: number;
}

const props = withDefaults(defineProps<Props>(), {
  max: 100,
  decimals: 2
});

// 計算格式化後的值
const formattedValue = computed(() => {
  const percentage = (props.value / props.max) * 100;
  return percentage.toFixed(props.decimals);
});
</script>

