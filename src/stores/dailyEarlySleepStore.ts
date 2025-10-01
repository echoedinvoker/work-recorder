import { defineStore } from "pinia";
import { formatDateToKey, getTodayKey } from '../utils/dateUtils';
import { useActivityStore } from '@/composables/useActivityStore';
import {
  SCORING_CONSTANTS,
  getEarlySleepScoreChange
} from '../constants/scoringConstants';
import { computed } from "vue";

// 上床時間記錄類型 (以分鐘為單位，例如 21:30 = 21*60+30 = 1290)
type BedtimeRecord = number;

export const useDailyEarlySleepStore = defineStore("dailyEarlySleep", () => {
  // 使用通用 composable
  const baseStore = useActivityStore<BedtimeRecord>({
    title: '早睡',
    initialScore: SCORING_CONSTANTS.EARLY_SLEEP.INITIAL_SCORE,
    absencePenalty: SCORING_CONSTANTS.EARLY_SLEEP.ABSENCE_PENALTY,
    getScoreChange: (ratio: number) => {
      // 對於早睡，我們不使用 ratio，而是直接根據時間計算
      return 0;
    },
    calculateWeightedRecord: (bedtimeMinutes: number) => {
      // 將上床時間轉換為權重記錄
      // 越早睡覺權重越高，我們用 (24*60 - bedtimeMinutes) 來計算
      return Math.max(0, 24 * 60 - bedtimeMinutes);
    },
    chartConfig: {
      left: {
        unit: '分',
        data: {
          '分數': {
            getValueByDate: (date: Date) => baseStore.getScoreByDate(date),
            getValueByWeek: (week: Date) => baseStore.getScoreByWeek(week),
            getValueByMonth: (month: Date) => baseStore.getScoreByMonth(month)
          }
        }
      },
      right: {
        unit: '時間',
        data: {
          '上床時間': {
            getValueByDate: (date: Date) => baseStore.getWeightedRecordByDate(date),
            getValueByWeek: (week: Date) => baseStore.getWeightedRecordByWeek(week),
            getValueByMonth: (month: Date) => baseStore.getWeightedRecordByMonth(month)
          }
        },
        formatValue: (minutes: number) => {
          if (minutes === 0) return '';

          // 對於右軸的時間數據，需要轉換回實際時間
          const actualMinutes = 24 * 60 - minutes;
          const hours = Math.floor(actualMinutes / 60);
          const mins = actualMinutes % 60;
          return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
        }
      }
    },
    thresholds: [], // 早睡不需要進度條
    // 自定義格式化函數，將分鐘轉換為時間格式
  });

  // Helper function: 取得週數
  const getWeekNumber = (date: Date): number => {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  };

  // 睡眠專用：週平均權重記錄 (取平均值而非加總)
  const weeklyAverageWeightedRecord = computed<{ [weekKey: string]: number }>(() => {
    const weekly: { [weekKey: string]: { total: number; count: number } } = {};

    Object.entries(baseStore.weightedRecords.value).forEach(([dateKey, weightedRecord]) => {
      const date = new Date(dateKey);
      const year = date.getFullYear();
      const weekNumber = getWeekNumber(date);
      const weekKey = `${year}-W${weekNumber.toString().padStart(2, '0')}`;

      if (!weekly[weekKey]) {
        weekly[weekKey] = { total: 0, count: 0 };
      }
      weekly[weekKey].total += weightedRecord;
      weekly[weekKey].count += 1;
    });

    // 計算平均值
    const result: { [weekKey: string]: number } = {};
    Object.entries(weekly).forEach(([weekKey, { total, count }]) => {
      result[weekKey] = Math.round(total / count);
    });

    return result;
  });

  // 睡眠專用：月平均權重記錄 (取平均值而非加總)
  const monthlyAverageWeightedRecord = computed<{ [monthKey: string]: number }>(() => {
    const monthly: { [monthKey: string]: { total: number; count: number } } = {};

    Object.entries(baseStore.weightedRecords.value).forEach(([dateKey, weightedRecord]) => {
      const date = new Date(dateKey);
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const monthKey = `${year}-${month.toString().padStart(2, '0')}`;

      if (!monthly[monthKey]) {
        monthly[monthKey] = { total: 0, count: 0 };
      }
      monthly[monthKey].total += weightedRecord;
      monthly[monthKey].count += 1;
    });

    // 計算平均值
    const result: { [monthKey: string]: number } = {};
    Object.entries(monthly).forEach(([monthKey, { total, count }]) => {
      result[monthKey] = Math.round(total / count);
    });

    return result;
  });

  // 睡眠專用：取得週平均權重記錄
  const getAverageWeightedRecordByWeek = (week: Date): number => {
    const year = week.getFullYear();
    const weekNumber = getWeekNumber(week);
    const weekKey = `${year}-W${weekNumber.toString().padStart(2, '0')}`;
    return weeklyAverageWeightedRecord.value[weekKey] || 0;
  };

  // 睡眠專用：取得月平均權重記錄
  const getAverageWeightedRecordByMonth = (month: Date): number => {
    const year = month.getFullYear();
    const monthNumber = month.getMonth() + 1;
    const monthKey = `${year}-${monthNumber.toString().padStart(2, '0')}`;
    return monthlyAverageWeightedRecord.value[monthKey] || 0;
  };
  const recordBedtime = (bedtimeMinutes: number) => {
    const todayKey = getTodayKey();

    // 更新記錄
    baseStore.records.value[todayKey] = bedtimeMinutes;

    // 計算權重記錄
    const weightedRecord = Math.max(0, 24 * 60 - bedtimeMinutes);
    baseStore.weightedRecords.value[todayKey] = weightedRecord;

    // 直接計算分數變化（不使用 ratio 邏輯）
    const scoreChange = getEarlySleepScoreChange(bedtimeMinutes);

    // 填補缺失的分數記錄
    const lastScoreDateKey = Object.keys(baseStore.scores.value)
      .filter(key => key !== todayKey)
      .sort()
      .pop()

    if (lastScoreDateKey) {
      let startScore = baseStore.scores.value[lastScoreDateKey]
      for (let date = new Date(lastScoreDateKey); formatDateToKey(date) < todayKey; date.setDate(date.getDate() + 1)) {
        const dateKey = formatDateToKey(date)
        if (!baseStore.scores.value[dateKey]) {
          baseStore.scores.value[dateKey] = Math.max(
            SCORING_CONSTANTS.COMMON.MIN_SCORE,
            startScore + SCORING_CONSTANTS.EARLY_SLEEP.ABSENCE_PENALTY
          )
        }
      }
    } else {
      // 設置昨日分數0
      const yesterdayKey = formatDateToKey(new Date(new Date(todayKey).getTime() - 24 * 60 * 60 * 1000))
      baseStore.scores.value[yesterdayKey] = 0;
    }

    const lastDateKey = formatDateToKey(new Date(new Date(todayKey).getTime() - 24 * 60 * 60 * 1000))
    const baseScore = baseStore.scores.value[lastDateKey] || 0

    baseStore.scores.value[todayKey] = Math.max(
      SCORING_CONSTANTS.COMMON.MIN_SCORE,
      baseScore + scoreChange
    )
  };

  return {
    ...baseStore,
    // 覆蓋 baseStore 的週/月權重記錄 computed
    weeklyWeightedRecord: weeklyAverageWeightedRecord,
    monthlyWeightedRecord: monthlyAverageWeightedRecord,
    // 覆蓋 baseStore 的週/月權重記錄方法
    getWeightedRecordByWeek: getAverageWeightedRecordByWeek,
    getWeightedRecordByMonth: getAverageWeightedRecordByMonth,
    // 早睡特定的方法
    recordBedtime
  };
}, {
  persist: {
    serializer: {
      serialize: (state) => JSON.stringify(state),
      deserialize: (value) => JSON.parse(value)
    }
  }
});

