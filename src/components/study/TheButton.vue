<template>
  <BaseButton 
    :color="isRecording ? 'red' : 'green'" 
    :text="isRecording ? '結束學習' : '開始學習'" 
    @click="toggleTimer" 
  />
</template>

<script setup lang="ts">
import { useRecorder } from '@/composables/useRecorder';
import BaseButton from '@/components/ui/BaseButton.vue';

const {
  toggleTimer,
  isRecording,
} = useRecorder();
</script>
