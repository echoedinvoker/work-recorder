<template>
  <div class="space-y-6">
    <SwimmingButton />
    <AProgressBar :data-provider="store" class="mb-4" />
    <LineChart :data-provider="store" /> 
  </div>
</template>

<script setup lang="ts">
import SwimmingButton from '@/components/swimming/SwimmingButton.vue';
import LineChart from '../ui/LineChart.vue';
import AProgressBar from '../ui/AProgressBar.vue';
import { useDailySwimmingStore } from '@/stores/dailySwimmingStore';

const store = useDailySwimmingStore()
</script>

