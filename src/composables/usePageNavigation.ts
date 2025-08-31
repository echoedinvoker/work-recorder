import type { Component } from 'vue'
import { ref } from 'vue'
import StudyPage from '@/components/pages/StudyPage.vue'
import TodoPage from '@/components/pages/TodoPage.vue'
import WorkoutPage from '@/components/pages/WorkoutPage.vue'
import SwimmingPage from '@/components/pages/SwimmingPage.vue'
import NoSugarPage from '@/components/pages/NoSugarPage.vue'
import SingPracticePage from '@/components/pages/SingPracticePage.vue'
import EarlySleepPage from '@/components/pages/EarlySleepPage.vue'
import NoDIYPage from '@/components/pages/NoDIYPage.vue'
import FaceSportPage from '@/components/pages/FaceSportPage.vue'

export interface PageConfig {
  name: string
  component: Component
}

// 頁面配置
const pages: PageConfig[] = [
  { name: '學習紀錄', component: StudyPage },
  { name: '重訓紀錄', component: WorkoutPage },
  { name: '游泳紀錄', component: SwimmingPage },
  { name: '戒糖紀錄', component: NoSugarPage },
  { name: '歌唱練習紀錄', component: SingPracticePage },
  { name: '早睡紀錄', component: EarlySleepPage },
  { name: '臉部運動紀錄', component: FaceSportPage },
  { name: 'NO DIY', component: NoDIYPage }
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

