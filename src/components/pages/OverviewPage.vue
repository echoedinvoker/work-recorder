<template>
  <div class="space-y-6">
    <!-- 減脂綜合指標 -->
    <div class="bg-gradient-to-r from-blue-50 to-green-50 rounded-lg shadow-md p-4 border border-blue-200">
      <h2 class="text-lg font-semibold mb-4 text-gray-700 flex items-center">
        <!-- 替換 🎯 為 Target icon -->
        <Target class="mr-2 w-5 h-5" />
        減脂綜合指標
      </h2>
      
      <!-- 總分數和趨勢 -->
      <div class="grid grid-cols-2 gap-4 mb-4">
        <div class="text-center">
          <!-- 使用與進度條相同的顏色邏輯 -->
          <div class="text-3xl font-bold mb-1" :style="{ color: getProgressColor() }">
            {{ fatLossMetrics.totalScore }}
          </div>
          <div class="text-sm text-gray-600">總分數</div>
          <div class="text-xs mt-1" :class="getTrendClass()">
            {{ getTrendText() }}
          </div>
        </div>
        <div class="text-center">
          <div class="text-3xl font-bold mb-1" :class="getRecordCountClass()">
            {{ fatLossMetrics.recordCount }}/5
          </div>
          <div class="text-sm text-gray-600">記錄完成度</div>
          <div class="text-xs mt-1 text-gray-500">
            今日已記錄項目
          </div>
        </div>
      </div>

      <!-- 分類分數 -->
      <div class="grid grid-cols-3 gap-3">
        <div class="bg-white rounded-lg p-3 text-center shadow-sm">
          <div class="text-lg font-bold text-orange-600">{{ fatLossMetrics.dietScore }}</div>
          <div class="text-xs text-gray-600">飲食控制</div>
          <div class="text-xs text-gray-500">飲控+飢餓</div>
        </div>
        <div class="bg-white rounded-lg p-3 text-center shadow-sm">
          <div class="text-lg font-bold text-blue-600">{{ fatLossMetrics.exerciseScore }}</div>
          <div class="text-xs text-gray-600">運動表現</div>
          <div class="text-xs text-gray-500">游泳+重訓</div>
        </div>
        <div class="bg-white rounded-lg p-3 text-center shadow-sm">
          <div class="text-lg font-bold text-purple-600">{{ fatLossMetrics.lifestyleScore }}</div>
          <div class="text-xs text-gray-600">生活習慣</div>
          <div class="text-xs text-gray-500">早睡</div>
        </div>
      </div>

      <!-- 進度條 - 使用與 AProgressBar 相同的樣式 -->
      <div class="mt-4 space-y-4">
        <!-- 數值顯示區域 -->
        <div class="flex items-center justify-between">
          <div class="flex items-baseline gap-2">
            <span class="text-2xl font-bold text-gray-800">
              {{ ((fatLossMetrics.recordCount / 5) * 100).toFixed(1) }}
            </span>
            <span class="text-sm text-gray-500">%</span>
          </div>

          <!-- 狀態指示器 -->
          <div class="flex items-center gap-2">
            <div class="w-3 h-3 rounded-full" :style="{ backgroundColor: getProgressColor() }"></div>
            <span class="text-sm text-gray-600">
              {{ getProgressStatusMessage() }}
            </span>
          </div>
        </div>

        <!-- 進度條容器 -->
        <div class="relative">
          <!-- 進度條背景 -->
          <div class="w-full bg-gray-100 rounded-r-full h-4 shadow-inner overflow-hidden">
            <!-- 基本進度條 -->
            <div 
              class="h-full transition-all duration-500 ease-out relative overflow-hidden rounded-r-full"
              :style="{
                width: `${(fatLossMetrics.recordCount / 5) * 100}%`,
                backgroundColor: getProgressColor()
              }"
            >
              <!-- 進度條光澤效果 -->
              <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-20 animate-pulse"></div>
            </div>

            <!-- 閾值標記 -->
            <div 
              v-for="threshold in progressThresholds" 
              :key="threshold.value"
              class="absolute top-0 w-1 h-full bg-white shadow-sm opacity-80 transition-opacity hover:opacity-100"
              :style="{ left: `${threshold.value * 100}%` }" 
              :title="`目標: ${(threshold.value * 100).toFixed(1)}%`"
            ></div>
          </div>
        </div>
      </div>
    </div>

    <!-- 減脂相關活動快速檢視 -->
    <div class="bg-white rounded-lg shadow-md p-4">
      <h2 class="text-lg font-semibold mb-4 text-gray-700 flex items-center">
        <!-- 替換 🔥 為 Flame icon -->
        <Flame class="mr-2 w-5 h-5" />
        今日活動概況
      </h2>
      <div class="grid grid-cols-2 gap-3">
        <ActivityCard
          v-for="activityName in fatLossActivityNames" 
          :key="activityName"
          :activity-name="activityName"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
// 導入 lucide icons
import { Target, Flame, TrendingUp, TrendingDown, BarChart3 } from 'lucide-vue-next';
import { useDailyNoSugarStore } from '@/stores/dailyNoSugarStore';
import { useDailyWorkoutStore } from '@/stores/dailyWorkoutStore';
import { useDailySwimmingStore } from '@/stores/dailySwimmingStore';
import { useDailyEarlySleepStore } from '@/stores/dailyEarlySleepStore';
import { useDailyHungryStore } from '@/stores/dailyHungryStore';
import { useFatLossStore } from '@/stores/fatLossStore';
import { SCORING_CONSTANTS } from '@/constants/scoringConstants';
import ActivityCard from '@/components/overview/ActivityCard.vue';

// 減脂相關活動名稱列表
const fatLossActivityNames = ['nosugar', 'earlysleep', 'hungry', 'swimming', 'workout', 'water'];

const router = useRouter();

// Store 實例
const noSugarStore = useDailyNoSugarStore();
const workoutStore = useDailyWorkoutStore();
const swimmingStore = useDailySwimmingStore();
const earlySleepStore = useDailyEarlySleepStore();
const hungryStore = useDailyHungryStore();
const fatLossStore = useFatLossStore();

// 減脂綜合指標 (使用 computed，具有響應性)
const fatLossMetrics = computed(() => {
  return fatLossStore.todayMetrics;
});

// 使用 WORKOUT.THRESHOLD_COLORS 作為進度條閾值
const progressThresholds = computed(() => {
  return SCORING_CONSTANTS.WORKOUT.THRESHOLD_COLORS.map(threshold => ({
    value: threshold.value,
    color: threshold.color,
    message: threshold.message
  }));
});

// 根據記錄完成度獲取進度條顏色
const getProgressColor = () => {
  const progress = fatLossMetrics.value.recordCount / 5; // 轉換為 0-1 範圍
  const thresholds = [...SCORING_CONSTANTS.WORKOUT.THRESHOLD_COLORS].sort((a, b) => b.value - a.value);
  
  // 找到符合當前進度的最高閾值
  for (const threshold of thresholds) {
    if (progress >= threshold.value) {
      return threshold.color;
    }
  }
  
  // 如果沒有找到匹配的閾值，返回第一個閾值的顏色
  return thresholds[thresholds.length - 1]?.color || '#ef4444';
};

// 根據當前進度獲取狀態訊息
const getProgressStatusMessage = () => {
  const progress = fatLossMetrics.value.recordCount / 5; // 轉換為 0-1 範圍
  const thresholds = [...SCORING_CONSTANTS.WORKOUT.THRESHOLD_COLORS].sort((a, b) => b.value - a.value);
  
  // 找到符合當前進度的最高閾值
  for (const threshold of thresholds) {
    if (progress >= threshold.value && threshold.message) {
      return threshold.message;
    }
  }
  
  // 如果沒有找到匹配的閾值，返回第一個閾值的訊息
  return thresholds[thresholds.length - 1]?.message || '未開始';
};

// 活動列表
const fatLossActivities = [
  { name: 'noSugar', title: '飲控紀錄', icon: '🚫', category: '飲食控制' },
  { name: 'hungry', title: '飢餓紀錄', icon: '😋', category: '飲食控制' },
  { name: 'workout', title: '重訓紀錄', icon: '💪', category: '運動表現' },
  { name: 'swimming', title: '游泳紀錄', icon: '🏊', category: '運動表現' },
  { name: 'earlySleep', title: '早睡紀錄', icon: '😴', category: '生活習慣' },
  { name: 'water', title: '喝水紀錄', icon: '💧', category: '生活習慣' }
];

// 獲取活動分數
const getActivityScore = (activityName: string) => {
  switch (activityName) {
    case 'noSugar':
      return noSugarStore.scoreDiffFromYesterday;
    case 'workout':
      return workoutStore.scoreDiffFromYesterday;
    case 'swimming':
      return swimmingStore.scoreDiffFromYesterday;
    case 'earlySleep':
      return earlySleepStore.scoreDiffFromYesterday;
    case 'hungry':
      return hungryStore.scoreDiffFromYesterday;
    default:
      return 0;
  }
};

// 獲取活動卡片樣式
const getActivityCardClass = (activity: any) => {
  const score = getActivityScore(activity.name);
  if (!score) return 'border-gray-300 bg-gray-50 text-gray-700';
  if (score > 0) {
    return 'border-green-300 bg-green-50 text-green-800';
  } else if (score < 0) {
    return 'border-red-300 bg-red-50 text-red-800';
  } else {
    return 'border-gray-300 bg-gray-50 text-gray-700';
  }
};

const getRecordCountClass = () => {
  const count = fatLossMetrics.value.recordCount;
  if (count >= 4) return 'text-green-600';
  if (count >= 2) return 'text-orange-600';
  return 'text-red-600';
};

const getTrendClass = () => {
  const trend = fatLossMetrics.value.trend;
  if (trend === 'improving') return 'text-green-600';
  if (trend === 'declining') return 'text-red-600';
  return 'text-gray-600';
};

// 修改 getTrendText 函數，使用 lucide icons
const getTrendText = () => {
  const trend = fatLossMetrics.value.trend;
  if (trend === 'improving') return '持續改善';
  if (trend === 'declining') return '需要注意';
  return '保持穩定';
};

// 新增獲取趨勢圖標的函數
const getTrendIcon = () => {
  const trend = fatLossMetrics.value.trend;
  if (trend === 'improving') return TrendingUp;
  if (trend === 'declining') return TrendingDown;
  return BarChart3;
};

// 導航到活動頁面
const navigateToActivity = (activityName: string) => {
  router.push({ name: activityName });
};
</script>

