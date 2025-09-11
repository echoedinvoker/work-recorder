<template>
  <div class="bg-white rounded-lg shadow-md p-6 cursor-pointer select-none" @click="toggleChartPeriod">
    <h3 class="text-lg font-semibold text-gray-800 mb-4">
      {{ chartTitle }}
      <span class="text-sm text-gray-500 ml-2">(點擊切換)</span>
    </h3>

    <!-- 使用抽離出來的圖表容器組件 -->
    <ChartContainer :chartData="chartData" :yAxisMax="yAxisMax" :chartHeight="chartHeight"
      :showCumulativeLabel="currentPeriod !== 'day'" />

    <ProgressBar :value="todayProgress" :increase="todayProgressIncrease" v-if="todayProgress" />

    <!-- 統計資訊 -->
    <div class="flex justify-between text-sm text-gray-600 pt-4">
      <div>
        <span class="text-gray-500">平均里程數:</span>
        <span class="font-medium ml-1">{{ avgScore }}公尺</span>
      </div>
      <div>
        <span class="text-gray-500">最高{{ currentPeriod === 'day' ? '里程數' : '累積' }}:</span>
        <span class="font-medium ml-1">{{ maxScore }}公尺</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useChart } from '@/composables/useChart';
import { useDailySwimmingStore } from '@/stores/dailySwimmingStore';
import ChartContainer from '@/components/ui/ChartContainer.vue';
import ProgressBar from '@/components/ui/ProgressBar.vue'

const store = useDailySwimmingStore()


const {
  chartHeight,
  currentPeriod,
  toggleChartPeriod,
  chartTitle,
  chartData,
  yAxisMax,
  avgScore,
  maxScore,
  todayProgress,
  todayProgressIncrease
} = useChart(store);
</script>
