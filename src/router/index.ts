import { createRouter, createWebHashHistory } from 'vue-router'
import OverviewPage from '@/components/pages/OverviewPage.vue'
import StudyPage from '@/components/pages/StudyPage.vue'
import WorkoutPage from '@/components/pages/WorkoutPage.vue'
import SwimmingPage from '@/components/pages/SwimmingPage.vue'
import NoSugarPage from '@/components/pages/NoSugarPage.vue'
import SingPracticePage from '@/components/pages/SingPracticePage.vue'
import EarlySleepPage from '@/components/pages/EarlySleepPage.vue'
import FaceSportPage from '@/components/pages/FaceSportPage.vue'
import NoDIYPage from '@/components/pages/NoDIYPage.vue'
import WorkPage from '@/components/pages/WorkPage.vue'
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
      path: '/study',
      name: 'study',
      component: StudyPage,
      meta: { title: '學習紀錄' }
    },
    {
      path: '/work',
      name: 'work',
      component: WorkPage,
      meta: { title: '工作紀錄' }
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
      path: '/sing-practice',
      name: 'singPractice',
      component: SingPracticePage,
      meta: { title: '歌唱練習紀錄' }
    },
    {
      path: '/early-sleep',
      name: 'earlySleep',
      component: EarlySleepPage,
      meta: { title: '早睡紀錄' }
    },
    {
      path: '/face-sport',
      name: 'faceSport',
      component: FaceSportPage,
      meta: { title: '臉部運動紀錄' }
    },
    {
      path: '/no-diy',
      name: 'noDIY',
      component: NoDIYPage,
      meta: { title: 'NO DIY' }
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

