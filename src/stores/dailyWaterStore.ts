import { useActivityStore } from "@/composables/useActivityStore";
import { formatDateToKey, getTodayKey } from "@/utils/dateUtils";
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
    // Calculate weighted records (total water intake per day)
    Object.keys(records.value).forEach(dateKey => {
      const totalAmount = records.value[dateKey].reduce((sum, entry) => sum + entry.amount, 0);
      weightedRecords.value[dateKey] = totalAmount;
    });
    // Calculate scores based on weighted records
    for (
      let date = new Date(Object.keys(records.value).sort()[0]);
      formatDateToKey(date) <= todayKey;
      date.setDate(date.getDate() + 1)
    ) {
      const yesterday = new Date(date).setDate(date.getDate() - 1)
      const yesterdayKey = formatDateToKey(new Date(yesterday))
      const todayKey = formatDateToKey(date)
      const todayWeightedRecord = weightedRecords.value[todayKey] || 0
      // first day
      if (!scores.value[yesterdayKey]) scores.value[yesterdayKey] = 0
      // absence
      if (!records.value[todayKey]) {
        scores.value[todayKey] = Math.max(0, scores.value[yesterdayKey] - 5)
        ratios.value[todayKey] = 0
        ratioIncrements.value[todayKey] = 0
        continue
      }
      // record exists
      if (todayWeightedRecord >= 3000) { // 3000ml or more
        scores.value[todayKey] =
          scores.value[yesterdayKey] + 10
      } else if (todayWeightedRecord >= 2500) { // 2500ml or more
          scores.value[yesterdayKey] + 7
      } else if (todayWeightedRecord >= 2000) { // 2000ml or more
        scores.value[todayKey] =
          scores.value[yesterdayKey] + 5
      } else {
        scores.value[todayKey] = Math.max(0, scores.value[yesterdayKey] - 5)
      }
    }
    // Calculate ratios and ratio increments, based on 3000ml goal
    Object.keys(weightedRecords.value).forEach(dateKey => {
      const amount = weightedRecords.value[dateKey];
      const ratio = Math.min(amount / 3000, 1); // Cap ratio at 1 (3000ml or more)
      ratios.value[dateKey] = ratio;
      // use last record of the day to calculate ratio increment
      const finalDrink = records.value[dateKey].slice(-1)[0].amount;
      ratioIncrements.value[dateKey] = Math.min(finalDrink / 3000, 1);
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
        unit: "分",
        data: {
          '分數': {
            getValueByDate: (date: Date) => baseStore.getScoreByDate(date),
            getValueByWeek: (week: Date) => baseStore.getScoreByWeek(week),
            getValueByMonth: (month: Date) => baseStore.getScoreByMonth(month)
          }
        }
      },
      right: {
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
    thresholds: [
      { value: 0.0, color: '#ef4444', message: '需要努力' },   // red-500 - 0% 開始為紅色 (差)
      { value: 2000/3000, color: '#f59e0b', message: '已達標準量' },   // amber-500 - 60% 一般表現
      { value: 2500/3000, color: '#10b981', message: '超越標準量' },   // green-500 - 80% 良好表現
      { value: 1, color: '#3b82f6', message: '大幅超標!' },   // blue-500 - 100% 優秀表現
    ],
  });

  return {
    ...baseStore,
  }
}, {
  persist: {
    serializer: {
      serialize: (state) => JSON.stringify(state),
      deserialize: (value) => JSON.parse(value)
    }
  }
})

