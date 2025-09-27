import { defineStore } from "pinia";
import { computed } from "vue";
import { useDailyNoSugarStore } from "./dailyNoSugarStore";
import { useDailyEarlySleepStore } from "./dailyEarlySleepStore";
import { useDailyHungryStore } from "./dailyHungryStore";
import { useDailySwimmingStore } from "./dailySwimmingStore";
import { useDailyWorkoutStore } from "./dailyWorkoutStore";
import { formatDateToKey } from "@/utils/dateUtils";

interface FatLossMetrics {
  totalScore: number;           // 總分數 (0-100)
  dietScore: number;           // 飲食控制分數 (0-100)
  exerciseScore: number;       // 運動分數 (0-100)
  lifestyleScore: number;      // 生活習慣分數 (0-100)
  consistency: number;         // 一致性指標 (0-100)
  trend: 'improving' | 'stable' | 'declining'; // 趨勢
}

export const useFatLossStore = defineStore("fatLoss", () => {
  // 引入各個子 store
  const noSugarStore = useDailyNoSugarStore();
  const earlySleepStore = useDailyEarlySleepStore();
  const hungryStore = useDailyHungryStore();
  const swimmingStore = useDailySwimmingStore();
  const workoutStore = useDailyWorkoutStore();

  // 權重配置 (總和為 100)
  const WEIGHTS = {
    DIET: 40,      // 飲食控制 40%
    EXERCISE: 35,  // 運動 35%
    LIFESTYLE: 25  // 生活習慣 25%
  } as const;

  // 將原始分數標準化為 0-100 分
  const normalizeScore = (score: number, minScore: number = 0, maxScore: number = 100): number => {
    return Math.max(0, Math.min(100, ((score - minScore) / (maxScore - minScore)) * 100));
  };

  // 計算飲食控制分數 (戒糖 + 飢餓感)
  const calculateDietScore = (date: Date): number => {
    const noSugarScore = noSugarStore.getScoreByDate(date) || 0;
    const hungryScore = hungryStore.getScoreByDate(date) || 0;
    
    // 標準化分數並加權平均
    const normalizedNoSugar = normalizeScore(noSugarScore, -50, 100);
    const normalizedHungry = normalizeScore(hungryScore, -50, 100);
    
    return (normalizedNoSugar * 0.6 + normalizedHungry * 0.4);
  };

  // 計算運動分數 (游泳 + 重訓)
  const calculateExerciseScore = (date: Date): number => {
    const swimmingScore = swimmingStore.getScoreByDate(date) || 0;
    const workoutScore = workoutStore.getScoreByDate(date) || 0;
    
    // 標準化分數並加權平均
    const normalizedSwimming = normalizeScore(swimmingScore, -50, 150);
    const normalizedWorkout = normalizeScore(workoutScore, -50, 150);
    
    return (normalizedSwimming * 0.5 + normalizedWorkout * 0.5);
  };

  // 計算生活習慣分數 (早睡)
  const calculateLifestyleScore = (date: Date): number => {
    const earlySleepScore = earlySleepStore.getScoreByDate(date) || 0;
    return normalizeScore(earlySleepScore, -50, 100);
  };

  // 計算總分數
  const calculateTotalScore = (date: Date): number => {
    const dietScore = calculateDietScore(date);
    const exerciseScore = calculateExerciseScore(date);
    const lifestyleScore = calculateLifestyleScore(date);
    
    return (
      (dietScore * WEIGHTS.DIET + 
       exerciseScore * WEIGHTS.EXERCISE + 
       lifestyleScore * WEIGHTS.LIFESTYLE) / 100
    );
  };

  // 計算一致性指標 (過去7天的標準差)
  const calculateConsistency = (endDate: Date): number => {
    const scores: number[] = [];
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(endDate);
      date.setDate(date.getDate() - i);
      scores.push(calculateTotalScore(date));
    }
    
    if (scores.length === 0) return 0;
    
    const mean = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    const variance = scores.reduce((sum, score) => sum + Math.pow(score - mean, 2), 0) / scores.length;
    const standardDeviation = Math.sqrt(variance);
    
    // 將標準差轉換為一致性分數 (標準差越小，一致性越高)
    return Math.max(0, 100 - (standardDeviation * 2));
  };

  // 計算趨勢 (比較過去3天與前3天的平均分數)
  const calculateTrend = (endDate: Date): 'improving' | 'stable' | 'declining' => {
    const recentScores: number[] = [];
    const previousScores: number[] = [];
    
    // 最近3天
    for (let i = 0; i < 3; i++) {
      const date = new Date(endDate);
      date.setDate(date.getDate() - i);
      recentScores.push(calculateTotalScore(date));
    }
    
    // 前3天
    for (let i = 3; i < 6; i++) {
      const date = new Date(endDate);
      date.setDate(date.getDate() - i);
      previousScores.push(calculateTotalScore(date));
    }
    
    const recentAvg = recentScores.reduce((sum, score) => sum + score, 0) / recentScores.length;
    const previousAvg = previousScores.reduce((sum, score) => sum + score, 0) / previousScores.length;
    
    const difference = recentAvg - previousAvg;
    
    if (difference > 5) return 'improving';
    if (difference < -5) return 'declining';
    return 'stable';
  };

  // 獲取指定日期的減脂指標
  const getFatLossMetrics = (date: Date = new Date()): FatLossMetrics => {
    const dietScore = calculateDietScore(date);
    const exerciseScore = calculateExerciseScore(date);
    const lifestyleScore = calculateLifestyleScore(date);
    const totalScore = calculateTotalScore(date);
    const consistency = calculateConsistency(date);
    const trend = calculateTrend(date);
    
    return {
      totalScore: Math.round(totalScore),
      dietScore: Math.round(dietScore),
      exerciseScore: Math.round(exerciseScore),
      lifestyleScore: Math.round(lifestyleScore),
      consistency: Math.round(consistency),
      trend
    };
  };

  // 獲取週度減脂指標
  const getWeeklyFatLossMetrics = (week: Date): FatLossMetrics => {
    const weekScores: FatLossMetrics[] = [];
    
    // 計算該週每天的指標
    for (let i = 0; i < 7; i++) {
      const date = new Date(week);
      date.setDate(date.getDate() - date.getDay() + i); // 調整到週的第i天
      weekScores.push(getFatLossMetrics(date));
    }
    
    // 計算週平均
    const avgTotal = weekScores.reduce((sum, metrics) => sum + metrics.totalScore, 0) / weekScores.length;
    const avgDiet = weekScores.reduce((sum, metrics) => sum + metrics.dietScore, 0) / weekScores.length;
    const avgExercise = weekScores.reduce((sum, metrics) => sum + metrics.exerciseScore, 0) / weekScores.length;
    const avgLifestyle = weekScores.reduce((sum, metrics) => sum + metrics.lifestyleScore, 0) / weekScores.length;
    const avgConsistency = weekScores.reduce((sum, metrics) => sum + metrics.consistency, 0) / weekScores.length;
    
    // 週趨勢基於週末的趨勢
    const weekEndDate = new Date(week);
    weekEndDate.setDate(weekEndDate.getDate() - weekEndDate.getDay() + 6);
    
    return {
      totalScore: Math.round(avgTotal),
      dietScore: Math.round(avgDiet),
      exerciseScore: Math.round(avgExercise),
      lifestyleScore: Math.round(avgLifestyle),
      consistency: Math.round(avgConsistency),
      trend: calculateTrend(weekEndDate)
    };
  };

  // 獲取月度減脂指標
  const getMonthlyFatLossMetrics = (month: Date): FatLossMetrics => {
    const monthScores: FatLossMetrics[] = [];
    const year = month.getFullYear();
    const monthNum = month.getMonth();
    const daysInMonth = new Date(year, monthNum + 1, 0).getDate();
    
    // 計算該月每天的指標
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, monthNum, day);
      monthScores.push(getFatLossMetrics(date));
    }
    
    // 計算月平均
    const avgTotal = monthScores.reduce((sum, metrics) => sum + metrics.totalScore, 0) / monthScores.length;
    const avgDiet = monthScores.reduce((sum, metrics) => sum + metrics.dietScore, 0) / monthScores.length;
    const avgExercise = monthScores.reduce((sum, metrics) => sum + metrics.exerciseScore, 0) / monthScores.length;
    const avgLifestyle = monthScores.reduce((sum, metrics) => sum + metrics.lifestyleScore, 0) / monthScores.length;
    const avgConsistency = monthScores.reduce((sum, metrics) => sum + metrics.consistency, 0) / monthScores.length;
    
    // 月趨勢基於月末的趨勢
    const monthEndDate = new Date(year, monthNum, daysInMonth);
    
    return {
      totalScore: Math.round(avgTotal),
      dietScore: Math.round(avgDiet),
      exerciseScore: Math.round(avgExercise),
      lifestyleScore: Math.round(avgLifestyle),
      consistency: Math.round(avgConsistency),
      trend: calculateTrend(monthEndDate)
    };
  };

  // 圖表配置
  const chartConfig = {
    left: {
      unit: '分',
      data: {
        '總分數': {
          getValueByDate: (date: Date) => getFatLossMetrics(date).totalScore,
          getValueByWeek: (week: Date) => getWeeklyFatLossMetrics(week).totalScore,
          getValueByMonth: (month: Date) => getMonthlyFatLossMetrics(month).totalScore
        },
        '飲食分數': {
          getValueByDate: (date: Date) => getFatLossMetrics(date).dietScore,
          getValueByWeek: (week: Date) => getWeeklyFatLossMetrics(week).dietScore,
          getValueByMonth: (month: Date) => getMonthlyFatLossMetrics(month).dietScore
        },
        '運動分數': {
          getValueByDate: (date: Date) => getFatLossMetrics(date).exerciseScore,
          getValueByWeek: (week: Date) => getWeeklyFatLossMetrics(week).exerciseScore,
          getValueByMonth: (month: Date) => getMonthlyFatLossMetrics(month).exerciseScore
        },
        '生活分數': {
          getValueByDate: (date: Date) => getFatLossMetrics(date).lifestyleScore,
          getValueByWeek: (week: Date) => getWeeklyFatLossMetrics(week).lifestyleScore,
          getValueByMonth: (month: Date) => getMonthlyFatLossMetrics(month).lifestyleScore
        }
      }
    },
    right: {
      unit: '一致性',
      data: {
        '一致性指標': {
          getValueByDate: (date: Date) => getFatLossMetrics(date).consistency,
          getValueByWeek: (week: Date) => getWeeklyFatLossMetrics(week).consistency,
          getValueByMonth: (month: Date) => getMonthlyFatLossMetrics(month).consistency
        }
      }
    }
  };

  // 進度條閾值配置
  const thresholds = [
    { value: 0, color: '#ef4444', message: '需要加油' },    // 紅色 0-40
    { value: 40, color: '#f59e0b', message: '持續努力' },   // 橙色 40-60
    { value: 60, color: '#10b981', message: '表現良好' },   // 綠色 60-80
    { value: 80, color: '#3b82f6', message: '表現優秀' },   // 藍色 80-100
  ];

  return {
    // 核心方法
    getFatLossMetrics,
    getWeeklyFatLossMetrics,
    getMonthlyFatLossMetrics,
    
    // 圖表配置
    chartConfig,
    thresholds,
    
    // 權重配置 (供外部參考)
    WEIGHTS,
    
    // 工具方法
    calculateDietScore,
    calculateExerciseScore,
    calculateLifestyleScore,
    calculateTotalScore,
    calculateConsistency,
    calculateTrend
  };
});
