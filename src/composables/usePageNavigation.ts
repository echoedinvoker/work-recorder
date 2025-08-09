import type { Component } from 'vue'
import { ref } from 'vue'
import StudyPage from '@/components/pages/StudyPage.vue'
import TodoPage from '@/components/pages/TodoPage.vue'
import WorkoutPage from '@/components/pages/WorkoutPage.vue'
import SwimmingPage from '@/components/pages/SwimmingPage.vue'
import MeditationPage from '@/components/pages/MeditationPage.vue';
import AaaPage from '@/components/pages/AaaPage.vue'
import LipTremoloPage from '@/components/pages/LipTremoloPage.vue'

export interface PageConfig {
  name: string
  component: Component
}

// 頁面配置
const pages: PageConfig[] = [
  { name: '學習紀錄', component: StudyPage },
  { name: '任務紀錄', component: TodoPage },
  { name: '重訓紀錄', component: WorkoutPage },
  { name: '游泳紀錄', component: SwimmingPage },
  {
    name: '冥想',
    component: MeditationPage
  },
  { name: '發聲訓練', component: AaaPage },
  { name: '顫唇練習', component: LipTremoloPage }
]

const currentPageIndex = ref(0)

// 觸控相關變數
const touchStartX = ref(0)
const touchEndX = ref(0)
const minSwipeDistance = 50

export function usePageNavigation() {
  

  // 觸控事件處理
  const handleTouchStart = (e: TouchEvent) => {
    touchStartX.value = e.touches[0].clientX
  }

  const handleTouchMove = (e: TouchEvent) => {
    // 防止頁面滾動
    e.preventDefault()
  }

  const handleTouchEnd = (e: TouchEvent) => {
    touchEndX.value = e.changedTouches[0].clientX
    handleSwipe()
  }

  // 處理滑動邏輯
  const handleSwipe = () => {
    const swipeDistance = touchStartX.value - touchEndX.value
    
    // 向左滑動（下一頁）
    if (swipeDistance > minSwipeDistance && currentPageIndex.value < pages.length - 1) {
      currentPageIndex.value++
    }
    // 向右滑動（上一頁）
    else if (swipeDistance < -minSwipeDistance && currentPageIndex.value > 0) {
      currentPageIndex.value--
    }
  }

  // 程式化導航
  const goToPage = (index: number) => {
    if (index >= 0 && index < pages.length) {
      currentPageIndex.value = index
    }
  }

  const nextPage = () => {
    if (currentPageIndex.value < pages.length - 1) {
      currentPageIndex.value++
    }
  }

  const prevPage = () => {
    if (currentPageIndex.value > 0) {
      currentPageIndex.value--
    }
  }

  return {
    currentPageIndex,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    goToPage,
    nextPage,
    prevPage,
    pages
  }
}

