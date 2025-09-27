import { createRouter, createWebHashHistory } from 'vue-router'
import OverviewPage from '@/components/pages/OverviewPage.vue'
import WorkoutPage from '@/components/pages/WorkoutPage.vue'
import SwimmingPage from '@/components/pages/SwimmingPage.vue'
import NoSugarPage from '@/components/pages/NoSugarPage.vue'
import EarlySleepPage from '@/components/pages/EarlySleepPage.vue'
import HungryPage from '@/components/pages/HungryPage.vue'

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
      meta: { title: '重訓紀錄' }
    },
    {
      path: '/swimming',
      name: 'swimming',
      component: SwimmingPage,
      meta: { title: '游泳紀錄' }
    },
    {
      path: '/no-sugar',
      name: 'noSugar',
      component: NoSugarPage,
      meta: { title: '戒糖紀錄' }
    },
    {
      path: '/early-sleep',
      name: 'earlySleep',
      component: EarlySleepPage,
      meta: { title: '早睡紀錄' }
    },
    {
      path: '/hungry',
      name: 'hungry',
      component: HungryPage,
      meta: { title: '飢餓紀錄' }
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'NotFound',
      component: () => import('@/components/pages/NotFoundPage.vue')
    }
  ]
})

export default router

