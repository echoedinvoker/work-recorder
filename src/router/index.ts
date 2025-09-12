import { createRouter, createWebHistory } from 'vue-router'
import WorkoutPage from '@/components/pages/WorkoutPage.vue'
import JumpPage from '@/components/pages/JumpPage.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/workout'
    },
    {
      path: '/workout',
      name: 'workout',
      component: WorkoutPage,
      meta: { title: '重訓紀錄' }
    },
    {
      path: '/jump',
      name: 'jump',
      component: JumpPage,
      meta: { title: '跳繩紀錄' }
    },
  ]
})

export default router

