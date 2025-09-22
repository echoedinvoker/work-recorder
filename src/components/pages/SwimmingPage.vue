<template>
  <div class="space-y-6">
    <!-- 游泳計時按鈕 -->
    <SwimmingButton />
    <SwimmingChart v-if="!isRecording" />
  </div>
</template>

<script setup lang="ts">
import { useSwimmingRecorder } from '@/composables/useSwimmingRecorder';
import SwimmingChart from '../swimming/SwimmingChart.vue';
import SwimmingButton from '@/components/swimming/SwimmingButton.vue';
const { isRecording } = useSwimmingRecorder();
</script>

