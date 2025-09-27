<template>
  <div 
    class="p-3 rounded-lg border-2 transition-all cursor-pointer hover:shadow-md"
    :class="cardClass"
    @click="handleClick"
  >
    <div class="text-sm font-medium flex items-center">
      <span class="mr-1">{{ activity.icon }}</span>
      {{ activity.title }}
    </div>
    <div class="text-lg font-bold mt-1">
      {{ displayScore }}
    </div>
    <div class="text-xs text-gray-500 mt-1">
      {{ activity.category }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useDailyNoSugarStore } from '@/stores/dailyNoSugarStore';
import { useDailyEarlySleepStore } from '@/stores/dailyEarlySleepStore';
import { useDailyHungryStore } from '@/stores/dailyHungryStore';
import { useDailySwimmingStore } from '@/stores/dailySwimmingStore';
import { useDailyWorkoutStore } from '@/stores/dailyWorkoutStore';

// Props 只需要 activity name
interface Props {
  activityName: string;
}

const props = defineProps<Props>();
const router = useRouter();

// 引入各個 store
const noSugarStore = useDailyNoSugarStore();
const earlySleepStore = useDailyEarlySleepStore();
const hungryStore = useDailyHungryStore();
const swimmingStore = useDailySwimmingStore();
const workoutStore = useDailyWorkoutStore();

// 活動配置
const activityConfig = {
  nosugar: {
    title: '無糖飲食',
    icon: '🚫',
    category: '飲食控制',
    store: noSugarStore,
    routeName: 'NoSugar'
  },
  earlysleep: {
    title: '早睡',
    icon: '😴',
    category: '生活習慣',
    store: earlySleepStore,
    routeName: 'EarlySleep'
  },
  hungry: {
    title: '飢餓感',
    icon: '🍽️',
    category: '飲食控制',
    store: hungryStore,
    routeName: 'Hungry'
  },
  swimming: {
    title: '游泳',
    icon: '🏊',
    category: '運動',
    store: swimmingStore,
    routeName: 'Swimming'
  },
  workout: {
    title: '健身',
    icon: '💪',
    category: '運動',
    store: workoutStore,
    routeName: 'Workout'
  }
};

// 取得當前活動配置
const activity = computed(() => {
  return activityConfig[props.activityName as keyof typeof activityConfig];
});

// 取得今日分數
const todayScore = computed(() => {
  if (!activity.value) return null;
  const today = new Date();
  return activity.value.store.getScoreByDate(today);
});

// 計算顯示分數
const displayScore = computed(() => {
  if (todayScore.value === null || todayScore.value === undefined || todayScore.value === 0) {
    return '--';
  }
  return todayScore.value > 0 ? `+${todayScore.value}` : `${todayScore.value}`;
});

// 計算卡片樣式
const cardClass = computed(() => {
  const score = todayScore.value;
  if (!score || score === 0) return 'border-gray-300 bg-gray-50 text-gray-700';
  
  if (score > 0) {
    return 'border-green-300 bg-green-50 text-green-800';
  } else if (score < 0) {
    return 'border-red-300 bg-red-50 text-red-800';
  } else {
    return 'border-gray-300 bg-gray-50 text-gray-700';
  }
});

// 處理點擊事件
const handleClick = () => {
  if (activity.value?.routeName) {
    router.push({ name: activity.value.routeName });
  }
};
</script>

