<template>
  <div class="space-y-6">
    <WaterButton />
    <AProgressBar :data-provider="store" class="mb-4" />
    <LineChart :data-provider="store" /> 
  </div>
</template>

<script setup lang="ts">
import WaterButton from '@/components/water/WaterButton.vue';
import AProgressBar from '../ui/AProgressBar.vue';
import LineChart from '../ui/LineChart.vue';
import { useDailyWaterStore } from '@/stores/dailyWaterStore';

const store = useDailyWaterStore()
</script>

