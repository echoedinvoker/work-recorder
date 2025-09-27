<template>
  <div>
    <NoSugarButton class="mb-12" />
    <LineChart :data-provider="store" />
  </div>
</template>

<script setup lang="ts">
import { useDailyNoSugarStore } from '@/stores/dailyNoSugarStore';
import NoSugarButton from '../nosugar/NoSugarButton.vue';
import LineChart from '../ui/LineChart.vue';

const store = useDailyNoSugarStore();  
</script>

