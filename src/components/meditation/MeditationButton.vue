<template>
  <BaseButton 
    :color="isRecording ? 'red' : 'green'" 
    :text="isRecording ? '結束冥想' : '開始冥想'" 
    @click="toggleTimer" 
  />
</template>

<script setup lang="ts">
import { useMeditationRecorder } from '@/composables/useMeditationRecorder';
import BaseButton from '@/components/ui/BaseButton.vue';

const {
  toggleTimer,
  isRecording,
} = useMeditationRecorder();
</script>

