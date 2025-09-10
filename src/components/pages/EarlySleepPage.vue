<template>
  <div class="space-y-6">
    <EarlySleepButton />
    <EarlySleepResultDisplay />
    <EarlySleepChart />
  </div>
</template>

<script setup lang="ts">
import EarlySleepButton from '@/components/earlysleep/EarlySleepButton.vue';
import EarlySleepResultDisplay from '@/components/earlysleep/EarlySleepResultDisplay.vue';
import EarlySleepChart from '@/components/earlysleep/EarlySleepChart.vue';
</script>

