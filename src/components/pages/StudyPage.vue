<template>
  <div class="space-y-6">
    <TheButton />
    <ResultDisplay />
    <RecordingDisplay />
    <ScoreDisplay />
    <ScoreChart />
  </div>
</template>

<script setup lang="ts">
import TheButton from '@/components/TheButton.vue'
import ResultDisplay from '@/components/ResultDisplay.vue'
import RecordingDisplay from '@/components/RecordingDisplay.vue'
import ScoreDisplay from '@/components/ScoreDisplay.vue'
import ScoreChart from '@/components/ScoreChart.vue'
</script>

