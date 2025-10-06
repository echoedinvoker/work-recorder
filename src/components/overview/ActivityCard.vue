<template>
  <div 
    class="p-3 rounded-lg border-2 transition-all cursor-pointer hover:shadow-md"
    :class="cardClass"
    @click="handleClick"
  >
    <div class="text-sm font-medium flex items-center">
      <!-- 使用 Lucide icon 替代 emoji -->
      <component :is="activity.iconComponent" class="w-4 h-4 mr-2" />
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
import { useDailyWaterStore } from '@/stores/dailyWaterStore';

// 導入 Lucide icons
import { 
  Ban,           // 替代 🚫 (無糖)
  Moon,          // 替代 😴 (早睡)
  UtensilsCrossed, // 替代 🍽️ (飢餓)
  Waves,         // 替代 🏊 (游泳)
  Dumbbell,       // 替代 💪 (健身)
  Droplet       // 替代 💧 (喝水)
} from 'lucide-vue-next';

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
const waterStore = useDailyWaterStore();

// 活動配置 - 使用 Lucide icon 組件
const activityConfig = {
  nosugar: {
    title: '飲控',
    iconComponent: Ban,
    category: '飲食控制',
    store: noSugarStore,
    routeName: 'noSugar'
  },
  earlysleep: {
    title: '早睡',
    iconComponent: Moon,
    category: '生活習慣',
    store: earlySleepStore,
    routeName: 'earlySleep'
  },
  hungry: {
    title: '飢餓感',
    iconComponent: UtensilsCrossed,
    category: '飲食控制',
    store: hungryStore,
    routeName: 'hungry'
  },
  swimming: {
    title: '游泳',
    iconComponent: Waves,
    category: '運動',
    store: swimmingStore,
    routeName: 'swimming'
  },
  workout: {
    title: '健身',
    iconComponent: Dumbbell,
    category: '運動',
    store: workoutStore,
    routeName: 'workout'
  },
  water: {
    title: '喝水',
    iconComponent: Droplet,
    category: '生活習慣',
    store: waterStore,
    routeName: 'water'
  }
};

// 取得當前活動配置
const activity = computed(() => {
  return activityConfig[props.activityName as keyof typeof activityConfig];
});

// 計算顯示分數
const displayScore = computed(() => {
  const scoreIncrement = activity.value.store.todayScoreIncrement;
  if (scoreIncrement === null) return '--';
  return scoreIncrement > 0 ? `+${scoreIncrement}` : `${scoreIncrement}`;
});

// 計算卡片樣式
const cardClass = computed(() => {
  const score = activity.value.store.todayScoreIncrement;
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

