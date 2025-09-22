<template>
  <div class="space-y-4">
    <!-- 未開始計時時顯示開始按鈕 -->
    <BaseButton 
      v-if="!isRecording" 
      color="green" 
      text="開始游泳" 
      @click="startTimer" 
    />
    
    <!-- 計時中顯示計時資訊和輸入欄位 -->
    <div v-else class="space-y-4">
      <div class="text-lg font-semibold">
        開始時間: {{ formatTime(startTime) }}
      </div>
      <div class="text-lg font-semibold">
        已游泳時間: {{ swimmingDuration }}
      </div>
      
      <FormInput v-model="distance" type="number" placeholder="輸入里程數(公尺)" />
      
      <BaseButton 
        color="red" 
        text="結束游泳" 
        @click="stopTimer" 
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import BaseButton from '@/components/ui/BaseButton.vue';
import FormInput from '@/components/ui/FormInput.vue';
import { useSwimmingRecorder } from '@/composables/useSwimmingRecorder';

const {
  isRecording,
  startTime,
  distance,
  startTimer,
  stopTimer,
  swimmingDuration,
  formatTime,
} = useSwimmingRecorder();
</script>

