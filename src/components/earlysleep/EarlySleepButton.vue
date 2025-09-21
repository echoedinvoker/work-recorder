<template>
  <div class="flex flex-col space-y-4">
    <div class="flex justify-center">
      <BaseButton 
        :color="store.isTodayRecorded ? 'gray' : 'green'" 
        :text="store.isTodayRecorded ? '取消紀錄' : '紀錄時間'"
        @click="store.recordResult" 
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useDailyEarlySleepStore } from '@/stores/dailyEarlySleepStore';
import BaseButton from '@/components/ui/BaseButton.vue';

const store = useDailyEarlySleepStore();
</script>
