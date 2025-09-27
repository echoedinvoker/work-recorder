<template>
  <div class="space-y-6">
    <!-- 今日總覽 -->
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
            {{ getActivityScore(activity.name)! > 0 ? '+' : '' }}{{ getActivityScore(activity.name) }}
          </div>
        </div>
      </div>
    </div>

    <!-- 本週趨勢 -->
    <div class="bg-white rounded-lg shadow-md p-4">
      <h2 class="text-lg font-semibold mb-4 text-gray-700">本週趨勢</h2>
      <div class="text-center text-gray-600">
        <div class="text-2xl font-bold" :class="weeklyTotalClass">
          {{ weeklyTotal > 0 ? '+' : '' }}{{ weeklyTotal }}
        </div>
        <div class="text-sm">本週總分變化</div>
      </div>
    </div>

    <!-- 快速操作 -->
    <div class="bg-white rounded-lg shadow-md p-4">
      <h2 class="text-lg font-semibold mb-4 text-gray-700">快速操作</h2>
      <div class="grid grid-cols-2 gap-3">
        <router-link 
          v-for="activity in topActivities" 
          :key="activity.name"
          :to="{ name: activity.name }"
          class="p-3 rounded-lg border-2 border-blue-200 bg-blue-50 text-blue-800 text-center font-medium hover:bg-blue-100 transition-all"
        >
          {{ activity.title }}
        </router-link>
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

const today = new Date();
const yesterday = new Date().setDate(today.getDate() - 1);

// 活動列表
const activities = [
  { name: 'study', title: '學習紀錄' },
  { name: 'work', title: '工作紀錄' },
  { name: 'workout', title: '重訓紀錄' },
  { name: 'swimming', title: '游泳紀錄' },
  { name: 'noSugar', title: '戒糖紀錄' },
  { name: 'singPractice', title: '歌唱練習' },
  { name: 'earlySleep', title: '早睡紀錄' },
  { name: 'faceSport', title: '臉部運動' },
  { name: 'noDIY', title: 'NO DIY' },
  { name: 'hungry', title: '飢餓紀錄' }
];

// 獲取活動分數
const getActivityScore = (activityName: string) => {
  switch (activityName) {
    case 'study':
      return dailyScoreStore.getScoreByDate(new Date()) - (dailyScoreStore.getScoreByDate(new Date(yesterday)) || 0);
    case 'work':
      return workStore.getScoreByDate(new Date()) - (workStore.getScoreByDate(new Date(yesterday)) || 0);
    case 'noSugar':
      return noSugarStore.getScoreByDate(new Date()) - (noSugarStore.getScoreByDate(new Date(yesterday)) || 0);
    case 'workout':
      return workoutStore.getScoreByDate(new Date()) - (workoutStore.getScoreByDate(new Date(yesterday)) || 0);
    case 'faceSport':
      return faceSportStore.getScoreByDate(new Date()) - (faceSportStore.getScoreByDate(new Date(yesterday)) || 0);
    case 'swimming':
      return swimmingStore.getScoreByDate(new Date()) - (workoutStore.getScoreByDate(new Date(yesterday)) || 0);
    case 'noDIY':
      return noDIYStore.getScoreByDate(new Date()) - (noDIYStore.getScoreByDate(new Date(yesterday)) || 0);
    case 'earlySleep':
      return earlySleepStore.scoreDiffFromYesterday;
    case 'hungry':
      return hungryStore.scoreDifference;
    case 'singPractice':
      return singPracticeStore.getScoreByDate(new Date()) - (singPracticeStore.getScoreByDate(new Date(yesterday)) || 0);
    default:
      return 0;
  }
};

// 獲取活動卡片樣式
const getActivityCardClass = (activity: any) => {
  const score = getActivityScore(activity.name);
  if (score > 0) {
    return 'border-green-300 bg-green-50 text-green-800';
  } else if (score < 0) {
    return 'border-red-300 bg-red-50 text-red-800';
  } else {
    return 'border-gray-300 bg-gray-50 text-gray-700';
  }
};

// 本週總分
const weeklyTotal = computed(() => {
  return activities.reduce((total, activity) => {
    return total + getActivityScore(activity.name);
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
    .map(activity => ({
      ...activity,
      score: Math.abs(getActivityScore(activity.name))
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 4);
});

// 導航到活動頁面
const navigateToActivity = (activityName: string) => {
  router.push({ name: activityName });
};
</script>

