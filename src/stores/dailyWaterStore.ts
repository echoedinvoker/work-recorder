import { useActivityStore } from "@/composables/useActivityStore";
import { getTodayKey } from "@/utils/dateUtils";
import { defineStore } from "pinia";
import type { Ref } from "vue";

interface WaterRecord {
  id: number;
  amount: number; // in milliliters
}

export const useDailyWaterStore = defineStore("dailyWater", () => {
  const updateRecord = (
    records: Ref<{ [date: string]: WaterRecord[] }>,
    amount: number,
    dateKey: string = getTodayKey()
  ) => {
    if (!records.value[dateKey]) {
      records.value[dateKey] = [] as WaterRecord[];
    }

    const newRecord = {
      id: Date.now(), // 使用時間戳作為唯一ID
      amount: Number(amount)  // 記錄輸入的水量（毫升）
    };

    (records.value[dateKey]).push(newRecord);
  }
  const calculateFromRecords = (
    records: Ref<{ [date: string]: WaterRecord[] }>,
    weightedRecords: Ref<{ [date: string]: number }>,
    scores: Ref<{ [date: string]: number }>,
    ratios: Ref<{ [date: string]: number }>,
    ratioIncrements: Ref<{ [date: string]: number }>,
    todayKey: string = getTodayKey()
  ) => {
    // Placeholder for future calculations
    Object.keys(records.value).forEach(dateKey => {
      const totalAmount = records.value[dateKey].reduce((sum, entry) => sum + entry.amount, 0);
      weightedRecords.value[dateKey] = totalAmount;
    });
  }

  const baseStore = useActivityStore<WaterRecord[]>({
    title: "喝水",
    initialScore: 0,
    absencePenalty: -5,
    getScoreChange: () => 0,
    calculateWeightedRecord: () => 0,
    updateRecord,
    calculateFromRecords,
    chartConfig: {
      left: {
        unit: "ml",
        data: {
          '喝水量': {
            getValueByDate: (date: Date) => baseStore.getWeightedRecordByDate(date),
            getValueByWeek: (week: Date) => baseStore.getWeightedRecordByWeek(week),
            getValueByMonth: (month: Date) => baseStore.getWeightedRecordByMonth(month)
          }
        }
      }
    },
    thresholds: [],
  });

  return {
    ...baseStore,
  }
});

