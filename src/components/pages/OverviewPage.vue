<template>
  <div class="space-y-6">
    <!-- 減脂綜合指標 -->
    <div class="bg-gradient-to-r from-blue-50 to-green-50 rounded-lg shadow-md p-4 border border-blue-200">
      <h2 class="text-lg font-semibold mb-4 text-gray-700 flex items-center">
        <span class="mr-2">🎯</span>
        減脂綜合指標
      </h2>
      
      <!-- 總分數和趨勢 -->
      <div class="grid grid-cols-2 gap-4 mb-4">
        <div class="text-center">
          <div class="text-3xl font-bold mb-1" :class="getTotalScoreClass()">
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
          <div class="text-xs text-gray-500">戒糖+飢餓</div>
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

      <!-- 進度條 -->
      <div class="mt-4">
        <div class="flex justify-between text-xs text-gray-600 mb-1">
          <span>記錄進度</span>
          <span>{{ getProgressMessage() }}</span>
        </div>
        <div class="w-full bg-gray-200 rounded-full h-2">
          <div 
            class="h-2 rounded-full transition-all duration-500 bg-blue-500"
            :style="{ width: `${(fatLossMetrics.recordCount / 5) * 100}%` }"
          ></div>
        </div>
      </div>
    </div>

    <!-- 減脂相關活動快速檢視 -->
    <div class="bg-white rounded-lg shadow-md p-4">
      <h2 class="text-lg font-semibold mb-4 text-gray-700 flex items-center">
        <span class="mr-2">🔥</span>
        今日活動概況
      </h2>
      <div class="grid grid-cols-2 gap-3">
        <div 
          v-for="activity in fatLossActivities" 
          :key="activity.name"
          class="p-3 rounded-lg border-2 transition-all cursor-pointer hover:shadow-md"
          :class="getActivityCardClass(activity)"
          @click="navigateToActivity(activity.name)"
        >
          <div class="text-sm font-medium flex items-center">
            <span class="mr-1">{{ activity.icon }}</span>
            {{ activity.title }}
          </div>
          <div class="text-lg font-bold mt-1">
            {{ getActivityScore(activity.name)! > 0 ? '+' : '' }}{{ getActivityScore(activity.name) ?? '--' }}
          </div>
          <div class="text-xs text-gray-500 mt-1">
            {{ activity.category }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useDailyNoSugarStore } from '@/stores/dailyNoSugarStore';
import { useDailyWorkoutStore } from '@/stores/dailyWorkoutStore';
import { useDailySwimmingStore } from '@/stores/dailySwimmingStore';
import { useDailyEarlySleepStore } from '@/stores/dailyEarlySleepStore';
import { useDailyHungryStore } from '@/stores/dailyHungryStore';
import { useFatLossStore } from '@/stores/fatLossStore';

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

// 活動列表
const fatLossActivities = [
  { name: 'noSugar', title: '飲控紀錄', icon: '🚫', category: '飲食控制' },
  { name: 'hungry', title: '飢餓紀錄', icon: '😋', category: '飲食控制' },
  { name: 'workout', title: '重訓紀錄', icon: '💪', category: '運動表現' },
  { name: 'swimming', title: '游泳紀錄', icon: '🏊', category: '運動表現' },
  { name: 'earlySleep', title: '早睡紀錄', icon: '😴', category: '生活習慣' }
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

// 樣式和文字方法
const getTotalScoreClass = () => {
  const score = fatLossMetrics.value.totalScore;
  if (score > 0) return 'text-green-600';
  if (score < 0) return 'text-red-600';
  return 'text-gray-600';
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

const getTrendText = () => {
  const trend = fatLossMetrics.value.trend;
  if (trend === 'improving') return '📈 持續改善';
  if (trend === 'declining') return '📉 需要注意';
  return '📊 保持穩定';
};

const getProgressMessage = () => {
  const count = fatLossMetrics.value.recordCount;
  if (count === 5) return '全部完成';
  if (count >= 3) return '進度良好';
  if (count >= 1) return '繼續加油';
  return '尚未開始';
};

// 導航到活動頁面
const navigateToActivity = (activityName: string) => {
  router.push({ name: activityName });
};
</script>

