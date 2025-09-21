<template>
  <div class="max-w-md mx-auto p-6 text-center">
    <!-- 導航菜單 -->
    <nav class="mb-8">
      <ul class="flex flex-wrap justify-center gap-2 space-y-2">
        <li v-for="route in routes" :key="String(route.name)">
          <router-link 
            :to="{ name: route.name }" 
            class="px-3 py-1 rounded-full text-sm transition-all"
            :class="[
              // 使用 border 來區分當前頁面
              $route.name === route.name 
                ? 'border-2 border-blue-500 font-bold' 
                : 'border-2 border-transparent',
              // 使用背景色來顯示分數是正數還是負數
              route.name && getScoreForRoute(String(route.name)) > 0 
                ? 'bg-green-100 text-green-800' 
                : route.name && getScoreForRoute(String(route.name)) < 0 
                  ? 'bg-red-100 text-red-800' 
                  : 'bg-gray-200 text-gray-700'
            ]"
          >
            {{ route.meta?.title || route.name }}
          </router-link>
        </li>
      </ul>
    </nav>

    <!-- 路由視圖 -->
    <router-view v-slot="{ Component }">
      <transition name="fade" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useDailyScoreStore } from './stores/dailyScore';
import { useDailyNoSugarStore } from './stores/dailyNoSugarStore';
import { useDailyWorkoutStore } from './stores/dailyWorkoutStore';
import { useDailyFaceSportStore } from './stores/dailyFaceSportStore';
import { useDailySwimmingStore } from './stores/dailySwimmingStore';
import { useDailyNoDIYStore } from './stores/dailyNoDIYStore';
import { useDailyEarlySleepStore } from './stores/dailyEarlySleepStore';
import { useDailySingPracticeStore } from './stores/dailySingPracticeStore';
import { useDailyHungryStore } from './stores/dailyHungryStore';
// 根據需要導入其他 store

const router = useRouter();
const routes = router.options.routes.filter(route => route.name !== 'NotFound');

const dailyScoreStore = useDailyScoreStore();
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

// 根據路由名稱獲取對應的分數
const getScoreForRoute = (routeName: string) => {
  // 根據不同的路由名稱返回對應 store 的分數
  switch (routeName) {
    case 'study':
      return dailyScoreStore.getScoreByDate(new Date()) - (dailyScoreStore.getScoreByDate(new Date(yesterday)) || 0);
    case 'noSugar':
      return noSugarStore.getScoreByDate(new Date()) - (noSugarStore.getScoreByDate(new Date(yesterday)) || 0);
    case 'workout':
      return workoutStore.getScoreByDate(new Date()) - (workoutStore.getScoreByDate(new Date(yesterday)) || 0);
    case 'faceSport':
      return faceSportStore.getScoreByDate(new Date()) - (faceSportStore.getScoreByDate(new Date(yesterday)) || 0);
    case 'swimming':
      return swimmingStore.getScoreByDate(new Date()) - (swimmingStore.getScoreByDate(new Date(yesterday)) || 0);
    case 'noDIY':
      return noDIYStore.getScoreByDate(new Date()) - (noDIYStore.getScoreByDate(new Date(yesterday)) || 0);
    case 'earlySleep':
      return earlySleepStore.scoreDifference;
    case 'hungry':
      return hungryStore.scoreDifference;
    case 'singPractice':
      return singPracticeStore.getScoreByDate(new Date()) - (singPracticeStore.getScoreByDate(new Date(yesterday)) || 0);
    default:
      return 0; // 默認返回 0
  }
};
</script>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>

