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
          <div class="text-3xl font-bold mb-1" :class="getConsistencyClass()">
            {{ fatLossMetrics.consistency }}
          </div>
          <div class="text-sm text-gray-600">一致性</div>
          <div class="text-xs mt-1 text-gray-500">
            過去7天穩定度
          </div>
        </div>
      </div>

      <!-- 分類分數 -->
      <div class="grid grid-cols-3 gap-3">
        <div class="bg-white rounded-lg p-3 text-center shadow-sm">
          <div class="text-lg font-bold text-orange-600">{{ fatLossMetrics.dietScore }}</div>
          <div class="text-xs text-gray-600">飲食控制</div>
          <div class="text-xs text-gray-500">40%</div>
        </div>
        <div class="bg-white rounded-lg p-3 text-center shadow-sm">
          <div class="text-lg font-bold text-blue-600">{{ fatLossMetrics.exerciseScore }}</div>
          <div class="text-xs text-gray-600">運動表現</div>
          <div class="text-xs text-gray-500">35%</div>
        </div>
        <div class="bg-white rounded-lg p-3 text-center shadow-sm">
          <div class="text-lg font-bold text-purple-600">{{ fatLossMetrics.lifestyleScore }}</div>
          <div class="text-xs text-gray-600">生活習慣</div>
          <div class="text-xs text-gray-500">25%</div>
        </div>
      </div>

      <!-- 進度條 -->
      <div class="mt-4">
        <div class="flex justify-between text-xs text-gray-600 mb-1">
          <span>進度</span>
          <span>{{ getProgressMessage() }}</span>
        </div>
        <div class="w-full bg-gray-200 rounded-full h-2">
          <div 
            class="h-2 rounded-full transition-all duration-500"
            :class="getProgressBarClass()"
            :style="{ width: `${fatLossMetrics.totalScore}%` }"
          ></div>
        </div>
      </div>
    </div>

    <!-- 今日活動狀況 -->
    <div class="bg-white rounded-lg shadow-md p-4">
      <h2 class="text-lg font-semibold mb-4 text-gray-700">今日活動狀況</h2>
      <div class="grid grid-cols-2 gap-3">
        <div 
          v-for="activity in activities" 
          :key="activity.name"
          class="p-3 rounded-lg border-2 transition-all cursor-pointer hover:shadow-md"
          :class="getActivityCardClass(activity)"
          @click="navigateToActivity(activity.name)"
        >
          <div class="text-sm font-medium">{{ activity.title }}</div>
          <div class="text-lg font-bold mt-1">
            {{ getActivityScore(activity.name)! > 0 ? '+' : '' }}{{ getActivityScore(activity.name) ?? '--' }}
          </div>
        </div>
      </div>
    </div>

    <!-- 減脂相關活動快速檢視 -->
    <div class="bg-white rounded-lg shadow-md p-4">
      <h2 class="text-lg font-semibold mb-4 text-gray-700 flex items-center">
        <span class="mr-2">🔥</span>
        減脂相關活動
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
import { useDailyScoreStore } from '@/stores/dailyScore';
import { useDailyWorkStore } from '@/stores/dailyWorkStore';
import { useDailyNoSugarStore } from '@/stores/dailyNoSugarStore';
import { useDailyWorkoutStore } from '@/stores/dailyWorkoutStore';
import { useDailyFaceSportStore } from '@/stores/dailyFaceSportStore';
import { useDailySwimmingStore } from '@/stores/dailySwimmingStore';
import { useDailyNoDIYStore } from '@/stores/dailyNoDIYStore';
import { useDailyEarlySleepStore } from '@/stores/dailyEarlySleepStore';
import { useDailySingPracticeStore } from '@/stores/dailySingPracticeStore';
import { useDailyHungryStore } from '@/stores/dailyHungryStore';
import { useFatLossStore } from '@/stores/fatLossStore';

const router = useRouter();

// Store 實例
const dailyScoreStore = useDailyScoreStore();
const workStore = useDailyWorkStore();
const noSugarStore = useDailyNoSugarStore();
const workoutStore = useDailyWorkoutStore();
const faceSportStore = useDailyFaceSportStore();
const swimmingStore = useDailySwimmingStore();
const noDIYStore = useDailyNoDIYStore();
const earlySleepStore = useDailyEarlySleepStore();
const singPracticeStore = useDailySingPracticeStore();
const hungryStore = useDailyHungryStore();
const fatLossStore = useFatLossStore();

const today = new Date();
const yesterday = new Date().setDate(today.getDate() - 1);

// 減脂綜合指標
const fatLossMetrics = computed(() => {
  return fatLossStore.getFatLossMetrics(today);
});

// 活動列表
const activities = [
  { name: 'study', title: '學習紀錄' },
  { name: 'work', title: '工作紀錄' },
  { name: 'workout', title: '重訓紀錄' },
  { name: 'swimming', title: '游泳紀錄' },
  { name: 'noSugar', title: '飲控紀錄' },
  { name: 'singPractice', title: '歌唱練習' },
  { name: 'earlySleep', title: '早睡紀錄' },
  { name: 'faceSport', title: '臉部運動' },
  { name: 'noDIY', title: 'NO DIY' },
  { name: 'hungry', title: '飢餓紀錄' }
];

// 減脂相關活動
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
    case 'study':
      return dailyScoreStore.getScoreByDate(new Date()) - (dailyScoreStore.getScoreByDate(new Date(yesterday)) || 0);
    case 'work':
      return workStore.getScoreByDate(new Date()) - (workStore.getScoreByDate(new Date(yesterday)) || 0);
    case 'noSugar':
      return noSugarStore.scoreDiffFromYesterday;
    case 'workout':
      return workoutStore.scoreDiffFromYesterday;
    case 'faceSport':
      return faceSportStore.getScoreByDate(new Date()) - (faceSportStore.getScoreByDate(new Date(yesterday)) || 0);
    case 'swimming':
      return swimmingStore.scoreDiffFromYesterday;
    case 'noDIY':
      return noDIYStore.getScoreByDate(new Date()) - (noDIYStore.getScoreByDate(new Date(yesterday)) || 0);
    case 'earlySleep':
      return earlySleepStore.scoreDiffFromYesterday;
    case 'hungry':
      return hungryStore.scoreDiffFromYesterday;
    case 'singPractice':
      return singPracticeStore.getScoreByDate(new Date()) - (singPracticeStore.getScoreByDate(new Date(yesterday)) || 0);
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

// 減脂指標相關樣式和文字
const getTotalScoreClass = () => {
  const score = fatLossMetrics.value.totalScore;
  if (score >= 80) return 'text-blue-600';
  if (score >= 60) return 'text-green-600';
  if (score >= 40) return 'text-orange-600';
  return 'text-red-600';
};

const getConsistencyClass = () => {
  const consistency = fatLossMetrics.value.consistency;
  if (consistency >= 80) return 'text-blue-600';
  if (consistency >= 60) return 'text-green-600';
  if (consistency >= 40) return 'text-orange-600';
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
  const score = fatLossMetrics.value.totalScore;
  if (score >= 80) return '表現優秀';
  if (score >= 60) return '表現良好';
  if (score >= 40) return '持續努力';
  return '需要加油';
};

const getProgressBarClass = () => {
  const score = fatLossMetrics.value.totalScore;
  if (score >= 80) return 'bg-blue-500';
  if (score >= 60) return 'bg-green-500';
  if (score >= 40) return 'bg-orange-500';
  return 'bg-red-500';
};

// 本週總分
const weeklyTotal = computed(() => {
  return activities.reduce((total, activity) => {
    const activityScore = getActivityScore(activity.name);
    if (activityScore) {
      return total + activityScore;
    }
    return total;
  }, 0);
});

const weeklyTotalClass = computed(() => {
  if (weeklyTotal.value > 0) return 'text-green-600';
  if (weeklyTotal.value < 0) return 'text-red-600';
  return 'text-gray-600';
});

// 熱門活動（分數變化最大的前4個）
const topActivities = computed(() => {
  return activities
    .map(activity => {
      const activityScore = getActivityScore(activity.name);
      return {
        ...activity,
        score: activityScore ? Math.abs(activityScore) : 0
      }
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 4);
});

// 導航到活動頁面
const navigateToActivity = (activityName: string) => {
  router.push({ name: activityName });
};
</script>

