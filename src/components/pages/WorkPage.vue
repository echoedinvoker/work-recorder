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
import TheButton from '@/components/work/TheButton.vue'
import ResultDisplay from '@/components/work/ResultDisplay.vue'
import RecordingDisplay from '@/components/work/RecordingDisplay.vue'
import ScoreDisplay from '@/components/work/ScoreDisplay.vue'
import ScoreChart from '@/components/work/ScoreChart.vue'
</script>

