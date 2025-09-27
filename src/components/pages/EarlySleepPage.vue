<template>
  <div>
    <EarlySleepButton class="mb-12" />
    <LineChart :data-provider="store" />
  </div>
</template>

<script setup lang="ts">
import EarlySleepButton from '../earlysleep/EarlySleepButton.vue';
import LineChart from '../ui/LineChart.vue';
import { useDailyEarlySleepStore } from '@/stores/dailyEarlySleepStore';

const store = useDailyEarlySleepStore();
</script>
