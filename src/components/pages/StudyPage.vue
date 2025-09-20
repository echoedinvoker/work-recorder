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
import TheButton from '@/components/study/TheButton.vue'
import ResultDisplay from '@/components/study/ResultDisplay.vue'
import RecordingDisplay from '@/components/study/RecordingDisplay.vue'
import ScoreDisplay from '@/components/study/ScoreDisplay.vue'
import ScoreChart from '@/components/study/ScoreChart.vue'
</script>

