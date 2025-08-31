import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { formatDateToKey, getTodayKey } from '../utils/dateUtils'

const UNIT = '分數'

// 唱歌練習成功/失敗的分數變化
const SUCCESS_SCORE = 10
const FAILURE_SCORE = -5
const MIN_SCORE = 0

const generateMockData = () => {
  const mockData: Record<string, boolean> = {}
  const today = new Date()

  for (let i = 13; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    const dateKey = formatDateToKey(date)

    // 隨機成功或失敗
    mockData[dateKey] = Math.random() > 0.3
  }

  return mockData
}

const useMockData = import.meta.env.VITE_USE_MOCK_DATA === 'true'

export const useDailyFaceSportStore = defineStore("dailyFaceSport", () => {
  // 記錄每天是否完成唱歌練習 (true = 成功, false = 失敗)
  const dailyFaceSportResults = ref<Record<string, boolean>>(useMockData ? generateMockData() : {});
  
  // 計算當前總分 - 從所有結果計算
  const totalScore = computed(() => {
    return calculateTotalScore(dailyFaceSportResults.value);
  });

  // 計算總分的輔助函數
  const calculateTotalScore = (results: Record<string, boolean>) => {
    let score = 0;
    // 按日期排序，確保按時間順序計算
    const sortedDates = Object.keys(results).sort();
    
    for (const date of sortedDates) {
      const success = results[date];
      score += success ? SUCCESS_SCORE : FAILURE_SCORE;
      // 確保分數不低於最小值
      score = Math.max(MIN_SCORE, score);
    }
    
    return score;
  };

  // 記錄當天唱歌練習結果
  const recordResult = (success: boolean) => {
    const today = getTodayKey();
    dailyFaceSportResults.value[today] = success;
    // 不需要手動更新分數，因為它是計算屬性
  };

  // 獲取特定日期的唱歌練習結果
  const getResultByDate = (date: Date) => {
    const dateKey = formatDateToKey(date);
    return dailyFaceSportResults.value[dateKey];
  };

  // 計算特定日期的分數貢獻
  const getScoreContributionByDate = (date: Date) => {
    const result = getResultByDate(date);
    if (result === undefined) return 0;
    return result ? SUCCESS_SCORE : FAILURE_SCORE;
  };

  // 獲取當前總分
  const getCurrentScore = () => {
    return totalScore.value;
  };

  // 清除所有歷史記錄
  const clearAllHistory = () => {
    dailyFaceSportResults.value = {};
    // 不需要重置 totalScore，因為它是計算屬性
  };

  // 計算特定日期的累計分數
  const getScoreByDate = (targetDate: Date) => {
    let cumulativeScore = 0;
    const targetDateKey = formatDateToKey(targetDate);
    
    // 獲取所有日期並排序
    const dates = Object.keys(dailyFaceSportResults.value).sort();
    
    // 計算目標日期（含）之前的所有分數
    for (const dateKey of dates) {
      // 如果日期大於目標日期，則跳過
      if (dateKey > targetDateKey) continue;
      
      // 累加分數
      const success = dailyFaceSportResults.value[dateKey];
      cumulativeScore += success ? SUCCESS_SCORE : FAILURE_SCORE;
      // 確保分數不低於最小值
      cumulativeScore = Math.max(MIN_SCORE, cumulativeScore);
    }
    
    return cumulativeScore;
  };

  // 獲取一段時間內的每日累計分數
  const getScoreHistory = (startDate: Date, endDate: Date) => {
    const history: Record<string, number> = {};
    const currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      const dateKey = formatDateToKey(currentDate);
      history[dateKey] = getScoreByDate(currentDate);
      
      // 移至下一天
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return history;
  };

  return {
    dailyFaceSportResults,
    recordResult,
    getResultByDate,
    getScoreContributionByDate,
    getCurrentScore,
    clearAllHistory,
    getScoreByDate,
    getScoreHistory,
    UNIT
  };
},
  {
    persist: useMockData ? false : { // 不使用假資料時啟用持久化存儲
      serializer: {
        serialize: (state) => {
          return JSON.stringify({
            ...state,
            startTime: state.startTime?.toISOString() || null,
            endTime: state.endTime?.toISOString() || null
          })
        },
        deserialize: (value) => {
          const parsed = JSON.parse(value)
          return {
            ...parsed,
            startTime: parsed.startTime ? new Date(parsed.startTime) : null,
            endTime: parsed.endTime ? new Date(parsed.endTime) : null
          }
        }
      }
    }
  }
);

