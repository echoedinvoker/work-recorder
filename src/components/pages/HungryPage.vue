<template>
  <div>
    <HungryButton class="mb-12" />
    <LineChart :data-provider="store" />
  </div>
</template>

<script setup lang="ts">
import { useDailyHungryStore } from '@/stores/dailyHungryStore';
import HungryButton from '../hungry/HungryButton.vue';
import LineChart from '../ui/LineChart.vue';

const store = useDailyHungryStore();  
</script>
