import { createRouter, createWebHashHistory } from 'vue-router'
import OverviewPage from '@/components/pages/OverviewPage.vue'
import WorkoutPage from '@/components/pages/WorkoutPage.vue'
import SwimmingPage from '@/components/pages/SwimmingPage.vue'
import NoSugarPage from '@/components/pages/NoSugarPage.vue'
import EarlySleepPage from '@/components/pages/EarlySleepPage.vue'
import HungryPage from '@/components/pages/HungryPage.vue'
import { 
  Ban,           // 替代 🚫 (無糖)
  Moon,          // 替代 😴 (早睡)
  UtensilsCrossed, // 替代 🍽️ (飢餓)
  Waves,         // 替代 🏊 (游泳)
  Dumbbell       // 替代 💪 (健身)
} from 'lucide-vue-next';

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      name: 'overview',
      component: OverviewPage,
      meta: { title: '活動概要' }
    },
    {
      path: '/workout',
      name: 'workout',
      component: WorkoutPage,
      meta: {
        title: '重訓紀錄',
        icon: Dumbbell
      }
    },
    {
      path: '/swimming',
      name: 'swimming',
      component: SwimmingPage,
      meta: {
        title: '游泳紀錄',
        icon: Waves
      }
    },
    {
      path: '/no-sugar',
      name: 'noSugar',
      component: NoSugarPage,
      meta: {
        title: '飲控紀錄',
        icon: Ban
      }
    },
    {
      path: '/early-sleep',
      name: 'earlySleep',
      component: EarlySleepPage,
      meta: { title: '早睡紀錄', icon: Moon }
    },
    {
      path: '/hungry',
      name: 'hungry',
      component: HungryPage,
      meta: { title: '飢餓紀錄', icon: UtensilsCrossed }
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'NotFound',
      component: () => import('@/components/pages/NotFoundPage.vue')
    }
  ]
})

export default router

