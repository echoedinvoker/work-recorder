<template>
  <div
    class="bg-white rounded-lg shadow-md p-6 cursor-pointer select-none"
    @click="toggleChartPeriod"
  >
    <h3 class="text-lg font-semibold text-gray-800 mb-4">
      {{ chartTitle }}
      <span class="text-sm text-gray-500 ml-2">(點擊切換)</span>
    </h3>
    
    <!-- 使用抽離出來的圖表容器組件 -->
    <ChartContainer
      :chartData="chartData"
      :yAxisMax="yAxisMax"
      :chartHeight="chartHeight"
      :showCumulativeLabel="currentPeriod !== 'day'"
    />
    
    <ProgressBar 
      :value="todayProgress || 0"
      :increase="todayProgressIncrease" 
    />
  </div>
</template>

<script setup lang="ts">
import { useChart } from '@/composables/useChart';
import { useDailyWorkoutStore } from '@/stores/dailyWorkoutStore';
import ChartContainer from '@/components/ui/ChartContainer.vue';
import ProgressBar from '@/components/ui/ProgressBar.vue'

const dailyWorkoutStore = useDailyWorkoutStore();

const {
  chartHeight,
  currentPeriod,
  toggleChartPeriod,
  chartTitle,
  chartData,
  yAxisMax,
  todayProgress,
  todayProgressIncrease
} = useChart(dailyWorkoutStore);
</script>

