<template>
  <h2 class="text-xl font-bold text-gray-800 mb-3">新增週期性任務</h2>
  <form @submit.prevent="handleAddTodo" class="space-y-3">
    <div>
      <input v-model="newTodo.title" type="text" placeholder="任務標題"
        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
        required />
    </div>
    <div>
      <textarea v-model="newTodo.description" placeholder="任務描述（可選）"
        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
        rows="2"></textarea>
    </div>
    <div class="flex gap-3">
      <select v-model="newTodo.period"
        class="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm">
        <option value="daily">每日</option>
        <option value="weekly">每週</option>
        <option value="monthly">每月</option>
      </select>
      <button type="submit"
        class="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm">
        新增任務
      </button>
    </div>
  </form>
</template>

<script setup lang="ts">
import { useTodo } from '@/composables/useTodo';
import { onMounted, onUnmounted } from 'vue';

const {
  handleAddTodo,
  newTodo
} = useTodo();

// 處理鍵盤彈出和收回的問題
onMounted(() => {
  // 添加視窗大小變化監聽器
  window.addEventListener('resize', handleResize);
  
  // 如果是iOS設備，添加特殊處理
  if (/iPad|iPhone|iPod/.test(navigator.userAgent)) {
    document.addEventListener('focusin', handleFocusIn);
    document.addEventListener('focusout', handleFocusOut);
  }
});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
  
  if (/iPad|iPhone|iPod/.test(navigator.userAgent)) {
    document.removeEventListener('focusin', handleFocusIn);
    document.removeEventListener('focusout', handleFocusOut);
  }
});

// 處理視窗大小變化
const handleResize = () => {
  // 強制頁面重新計算高度
  window.scrollTo(0, 0);
};

// 處理輸入框獲得焦點（鍵盤彈出）
const handleFocusIn = (e: FocusEvent) => {
  // 確保頁面不會被鍵盤推上去太多
  const target = e.target as HTMLElement;
  if (target && (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement)) {
    setTimeout(() => {
      target.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 300);
  }
};

// 處理輸入框失去焦點（鍵盤收回）
const handleFocusOut = () => {
  // 確保頁面回到正確位置
  setTimeout(() => {
    window.scrollTo(0, 0);
  }, 100);
};
</script>

<style scoped>
/* 確保頁面內容在鍵盤彈出時不會被永久推上去 */
@media (max-width: 767px) {
  form {
    position: relative;
    z-index: 1;
  }
}
</style>
