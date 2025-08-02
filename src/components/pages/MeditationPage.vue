<template>
  <div class="space-y-6">
    <MeditationButton />
    <MeditationResultDisplay />
    <MeditationRecordingDisplay />
    <MeditationChart />
  </div>
</template>

<script setup lang="ts">
import MeditationButton from '@/components/meditation/MeditationButton.vue';
import MeditationResultDisplay from '@/components/meditation/MeditationResultDisplay.vue';
import MeditationRecordingDisplay from '@/components/meditation/MeditationRecordingDisplay.vue';
import MeditationChart from '@/components/meditation/MeditationChart.vue';
</script>

