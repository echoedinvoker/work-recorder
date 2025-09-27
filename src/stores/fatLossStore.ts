import { defineStore } from "pinia";
import { computed } from "vue";
import { useDailyNoSugarStore } from "./dailyNoSugarStore";
import { useDailyEarlySleepStore } from "./dailyEarlySleepStore";
import { useDailyHungryStore } from "./dailyHungryStore";
import { useDailySwimmingStore } from "./dailySwimmingStore";
import { useDailyWorkoutStore } from "./dailyWorkoutStore";

interface FatLossMetrics {
  totalScore: number;           // 總分數 (直接加總)
  dietScore: number;           // 飲食控制分數
  exerciseScore: number;       // 運動分數
  lifestyleScore: number;      // 生活習慣分數
  recordCount: number;         // 有記錄的項目數量
  trend: 'improving' | 'stable' | 'declining'; // 趨勢
}

export const useFatLossStore = defineStore("fatLoss", () => {
  // 引入各個子 store
  const noSugarStore = useDailyNoSugarStore();
  const earlySleepStore = useDailyEarlySleepStore();
  const hungryStore = useDailyHungryStore();
  const swimmingStore = useDailySwimmingStore();
  const workoutStore = useDailyWorkoutStore();

  // 今日減脂指標 (使用 computed 實現響應式)
  const todayMetrics = computed((): FatLossMetrics => {
    const today = new Date();
    
    // 直接取得各 store 的分數
    const noSugarScore = noSugarStore.getScoreByDate(today) || 0;
    const hungryScore = hungryStore.getScoreByDate(today) || 0;
    const swimmingScore = swimmingStore.getScoreByDate(today) || 0;
    const workoutScore = workoutStore.getScoreByDate(today) || 0;
    const earlySleepScore = earlySleepStore.getScoreByDate(today) || 0;
    
    // 分類分數
    const dietScore = noSugarScore + hungryScore;
    const exerciseScore = swimmingScore + workoutScore;
    const lifestyleScore = earlySleepScore;
    
    // 總分數 = 所有分數直接加總
    const totalScore = dietScore + exerciseScore + lifestyleScore;
    
    // 計算有記錄的項目數量 (更有意義的指標)
    const recordCount = [
      noSugarScore !== 0,
      hungryScore !== 0,
      swimmingScore !== 0,
      workoutScore !== 0,
      earlySleepScore !== 0
    ].filter(Boolean).length;
    
    return {
      totalScore,
      dietScore,
      exerciseScore,
      lifestyleScore,
      recordCount,
      trend: calculateTrend(today)
    };
  });

  // 計算趨勢 (比較過去3天與前3天的平均分數)
  const calculateTrend = (endDate: Date): 'improving' | 'stable' | 'declining' => {
    const getDateScore = (date: Date) => {
      const noSugar = noSugarStore.getScoreByDate(date) || 0;
      const hungry = hungryStore.getScoreByDate(date) || 0;
      const swimming = swimmingStore.getScoreByDate(date) || 0;
      const workout = workoutStore.getScoreByDate(date) || 0;
      const earlySleep = earlySleepStore.getScoreByDate(date) || 0;
      return noSugar + hungry + swimming + workout + earlySleep;
    };

    const recentScores: number[] = [];
    const previousScores: number[] = [];
    
    // 最近3天
    for (let i = 0; i < 3; i++) {
      const date = new Date(endDate);
      date.setDate(date.getDate() - i);
      recentScores.push(getDateScore(date));
    }
    
    // 前3天
    for (let i = 3; i < 6; i++) {
      const date = new Date(endDate);
      date.setDate(date.getDate() - i);
      previousScores.push(getDateScore(date));
    }
    
    const recentAvg = recentScores.reduce((sum, score) => sum + score, 0) / recentScores.length;
    const previousAvg = previousScores.reduce((sum, score) => sum + score, 0) / previousScores.length;
    
    const difference = recentAvg - previousAvg;
    
    if (difference > 10) return 'improving';
    if (difference < -10) return 'declining';
    return 'stable';
  };

  // 獲取指定日期的減脂指標
  const getMetricsByDate = (date: Date): FatLossMetrics => {
    const noSugarScore = noSugarStore.getScoreByDate(date) || 0;
    const hungryScore = hungryStore.getScoreByDate(date) || 0;
    const swimmingScore = swimmingStore.getScoreByDate(date) || 0;
    const workoutScore = workoutStore.getScoreByDate(date) || 0;
    const earlySleepScore = earlySleepStore.getScoreByDate(date) || 0;
    
    const dietScore = noSugarScore + hungryScore;
    const exerciseScore = swimmingScore + workoutScore;
    const lifestyleScore = earlySleepScore;
    const totalScore = dietScore + exerciseScore + lifestyleScore;
    
    const recordCount = [
      noSugarScore !== 0,
      hungryScore !== 0,
      swimmingScore !== 0,
      workoutScore !== 0,
      earlySleepScore !== 0
    ].filter(Boolean).length;
    
    return {
      totalScore,
      dietScore,
      exerciseScore,
      lifestyleScore,
      recordCount,
      trend: calculateTrend(date)
    };
  };

  // 圖表配置
  const chartConfig = {
    left: {
      unit: '分',
      data: {
        '總分數': {
          getValueByDate: (date: Date) => getMetricsByDate(date).totalScore,
          getValueByWeek: (week: Date) => {
            // 計算該週每天的總分數平均
            let totalScore = 0;
            for (let i = 0; i < 7; i++) {
              const date = new Date(week);
              date.setDate(date.getDate() - date.getDay() + i);
              totalScore += getMetricsByDate(date).totalScore;
            }
            return Math.round(totalScore / 7);
          },
          getValueByMonth: (month: Date) => {
            // 計算該月每天的總分數平均
            const year = month.getFullYear();
            const monthNum = month.getMonth();
            const daysInMonth = new Date(year, monthNum + 1, 0).getDate();
            let totalScore = 0;
            
            for (let day = 1; day <= daysInMonth; day++) {
              const date = new Date(year, monthNum, day);
              totalScore += getMetricsByDate(date).totalScore;
            }
            return Math.round(totalScore / daysInMonth);
          }
        },
        '飲食分數': {
          getValueByDate: (date: Date) => getMetricsByDate(date).dietScore,
          getValueByWeek: (week: Date) => {
            let totalScore = 0;
            for (let i = 0; i < 7; i++) {
              const date = new Date(week);
              date.setDate(date.getDate() - date.getDay() + i);
              totalScore += getMetricsByDate(date).dietScore;
            }
            return Math.round(totalScore / 7);
          },
          getValueByMonth: (month: Date) => {
            const year = month.getFullYear();
            const monthNum = month.getMonth();
            const daysInMonth = new Date(year, monthNum + 1, 0).getDate();
            let totalScore = 0;
            
            for (let day = 1; day <= daysInMonth; day++) {
              const date = new Date(year, monthNum, day);
              totalScore += getMetricsByDate(date).dietScore;
            }
            return Math.round(totalScore / daysInMonth);
          }
        },
        '運動分數': {
          getValueByDate: (date: Date) => getMetricsByDate(date).exerciseScore,
          getValueByWeek: (week: Date) => {
            let totalScore = 0;
            for (let i = 0; i < 7; i++) {
              const date = new Date(week);
              date.setDate(date.getDate() - date.getDay() + i);
              totalScore += getMetricsByDate(date).exerciseScore;
            }
            return Math.round(totalScore / 7);
          },
          getValueByMonth: (month: Date) => {
            const year = month.getFullYear();
            const monthNum = month.getMonth();
            const daysInMonth = new Date(year, monthNum + 1, 0).getDate();
            let totalScore = 0;
            
            for (let day = 1; day <= daysInMonth; day++) {
              const date = new Date(year, monthNum, day);
              totalScore += getMetricsByDate(date).exerciseScore;
            }
            return Math.round(totalScore / daysInMonth);
          }
        },
        '生活分數': {
          getValueByDate: (date: Date) => getMetricsByDate(date).lifestyleScore,
          getValueByWeek: (week: Date) => {
            let totalScore = 0;
            for (let i = 0; i < 7; i++) {
              const date = new Date(week);
              date.setDate(date.getDate() - date.getDay() + i);
              totalScore += getMetricsByDate(date).lifestyleScore;
            }
            return Math.round(totalScore / 7);
          },
          getValueByMonth: (month: Date) => {
            const year = month.getFullYear();
            const monthNum = month.getMonth();
            const daysInMonth = new Date(year, monthNum + 1, 0).getDate();
            let totalScore = 0;
            
            for (let day = 1; day <= daysInMonth; day++) {
              const date = new Date(year, monthNum, day);
              totalScore += getMetricsByDate(date).lifestyleScore;
            }
            return Math.round(totalScore / daysInMonth);
          }
        }
      }
    },
    right: {
      unit: '項',
      data: {
        '記錄項目數': {
          getValueByDate: (date: Date) => getMetricsByDate(date).recordCount,
          getValueByWeek: (week: Date) => {
            let totalCount = 0;
            for (let i = 0; i < 7; i++) {
              const date = new Date(week);
              date.setDate(date.getDate() - date.getDay() + i);
              totalCount += getMetricsByDate(date).recordCount;
            }
            return Math.round(totalCount / 7);
          },
          getValueByMonth: (month: Date) => {
            const year = month.getFullYear();
            const monthNum = month.getMonth();
            const daysInMonth = new Date(year, monthNum + 1, 0).getDate();
            let totalCount = 0;
            
            for (let day = 1; day <= daysInMonth; day++) {
              const date = new Date(year, monthNum, day);
              totalCount += getMetricsByDate(date).recordCount;
            }
            return Math.round(totalCount / daysInMonth);
          }
        }
      }
    }
  };

  return {
    // 響應式的今日指標
    todayMetrics,
    
    // 工具方法
    getMetricsByDate,
    
    // 圖表配置
    chartConfig
  };
});

