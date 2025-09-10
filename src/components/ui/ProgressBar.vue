<template>
  <div class="flex items-center justify-center gap-2">
    <div class="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 overflow-hidden relative">
      <!-- 基本進度條 -->
      <div 
        class="bg-blue-600 h-2.5 rounded-full transition-all duration-300" 
        :style="{ width: `${baseValue}%` }"
      ></div>
      <!-- 增加的部分 -->
      <div 
        v-if="increase > 0"
        class="bg-green-500 h-2.5 absolute top-0 right-0 transition-all duration-300" 
        :style="{ width: `${increase}%`, right: `${100 - value}%` }"
      ></div>
    </div>
    <span class="text-left min-w-[80px] text-md font-semibold text-gray-600">
      {{ formattedValue }}%
      <span v-if="increase > 0" class="text-green-500">(+{{ formattedIncrease }}%)</span>
    </span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  value: number;
  increase?: number;
  max?: number;
  decimals?: number;
}

const props = withDefaults(defineProps<Props>(), {
  max: 100,
  decimals: 2,
  increase: 0
});

// 計算基本值（不包含增加部分）
const baseValue = computed(() => {
  return props.value - props.increase;
});

// 計算格式化後的值
const formattedValue = computed(() => {
  const percentage = (props.value / props.max) * 100;
  return percentage.toFixed(props.decimals);
});

// 計算格式化後的增加值
const formattedIncrease = computed(() => {
  const percentage = (props.increase / props.max) * 100;
  return percentage.toFixed(props.decimals);
});
</script>

