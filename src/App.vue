<template>
  <div class="max-w-md mx-auto mt-8 p-6 text-center">
    <h1 class="text-3xl font-bold text-gray-800 mb-8">工作時間記錄器</h1>
    
    <div class="space-y-6">

      <TheButton />
      
      <ScoreDisplay />

      <ResultDisplay />
      
      <RecordingDisplay />

      <ScoreChart />

    </div>
  </div>
</template>

<script setup lang="ts">
import TheButton from '@/components/TheButton.vue';
import ResultDisplay from '@/components/ResultDisplay.vue';
import RecordingDisplay from '@/components/RecordingDisplay.vue';
import ScoreDisplay from '@/components/ScoreDisplay.vue';
import ScoreChart from '@/components/ScoreChart.vue';
</script>
