import { defineStore } from "pinia";
import { ref } from "vue";
export const useDailyWaterStore = defineStore("dailyWaterSleep", () => {
  const todayScoreIncrement = ref(0);
  return {
    todayScoreIncrement,
  }
});

