<template>
  <div
    class="bg-white rounded-lg shadow-md p-6 cursor-pointer select-none"
    @click="toggleChartPeriod"
    v-if="!store.isRecording && !store.isDisplayingResult"
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
    
    <!-- 統計資訊 -->
    <div class="flex justify-between text-sm text-gray-600 pt-4 border-t">
      <div>
        <span class="text-gray-500">平均時間:</span>
        <span class="font-medium ml-1">{{ avgScore }}分鐘</span>
      </div>
      <div>
        <span class="text-gray-500">最高{{ currentPeriod === 'day' ? '時間' : '累積' }}:</span>
        <span class="font-medium ml-1">{{ maxScore }}分鐘</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useChart } from '@/composables/useChart';
import ChartContainer from '@/components/ui/ChartContainer.vue';
import { useDailyMeditationStore } from '@/stores/dailyMeditationStore';

const store = useDailyMeditationStore();

const {
  chartHeight,
  currentPeriod,
  toggleChartPeriod,
  chartTitle,
  chartData,
  yAxisMax,
  avgScore,
  maxScore
} = useChart(store);
</script>

