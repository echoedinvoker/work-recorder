<template>
  <nav class="mb-6">
    <div class="flex justify-center gap-4">
      <!-- Toggle 概覽頁面按鈕 -->
      <button 
        @click="toggleOverview"
        :disabled="isOnOverviewPage"
        :class="[
          'group relative px-5 py-3 rounded-xl text-sm font-medium transition-all duration-200 flex items-center gap-2 shadow-md',
          isOnOverviewPage 
            ? 'bg-gray-400 text-gray-200 cursor-not-allowed opacity-60' 
            : 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 hover:shadow-lg hover:scale-105 active:scale-95'
        ]"
      >
        <span v-if="previousActivityName && !isOnOverviewPage" class="flex items-center gap-2">
          <!-- 返回活動頁面 -->
          <ArrowLeft :size="16" class="transition-transform group-hover:-translate-x-0.5" />
          <span class="hidden sm:inline">{{ previousActivityName }}</span>
        </span>
        <span v-else class="flex items-center gap-2">
          <!-- 切換到概覽頁面 -->
          <BarChart3 :size="16" :class="isOnOverviewPage ? '' : 'transition-transform group-hover:scale-110'" />
          <span class="hidden sm:inline">概覽</span>
        </span>
      </button>

      <!-- 使用說明按鈕 (只在非首頁顯示) -->
      <button 
        v-if="$route.path !== '/'"
        @click="$emit('showUsage')"
        class="group relative px-5 py-3 rounded-xl text-sm font-medium transition-all duration-200 
               bg-gradient-to-r from-emerald-500 to-emerald-600 text-white 
               hover:from-emerald-600 hover:to-emerald-700 hover:shadow-lg hover:scale-105
               active:scale-95 flex items-center gap-2 shadow-md"
      >
        <HelpCircle :size="16" class="transition-transform group-hover:scale-110" />
        <span class="hidden sm:inline">說明</span>
      </button>

      <!-- 清除資料按鈕 -->
      <button 
        @click="$emit('showClearDialog')"
        class="group relative px-5 py-3 rounded-xl text-sm font-medium transition-all duration-200 
               bg-gradient-to-r from-red-500 to-red-600 text-white 
               hover:from-red-600 hover:to-red-700 hover:shadow-lg hover:scale-105
               active:scale-95 flex items-center gap-2 shadow-md"
        :title="clearButtonTitle"
      >
        <Trash2 :size="16" class="transition-transform group-hover:scale-110" />
        <span class="hidden sm:inline">清除</span>
      </button>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { ArrowLeft, BarChart3, HelpCircle, Trash2 } from 'lucide-vue-next';

// Props - 將 previousActivityName 設為可選
interface Props {
  previousActivityName?: string;
}

const props = withDefaults(defineProps<Props>(), {
  previousActivityName: ''
});

// Emits
const emit = defineEmits<{
  showUsage: [];
  showClearDialog: [];
}>();

const router = useRouter();
const route = useRoute();
const routes = router.options.routes.filter(route => route.name !== 'NotFound');

// 檢查是否在概覽頁面 (根路徑 '/')
const isOnOverviewPage = computed(() => route.path === '/');

// Toggle 概覽頁面功能
const toggleOverview = () => {
  // 如果已經在概覽頁面，不執行任何操作
  if (isOnOverviewPage.value) {
    return;
  }
  
  if (route.name === 'overview') {
    // 如果在概覽頁面且有記錄的活動頁面，返回該頁面
    if (props.previousActivityName) {
      // 找到對應的路由名稱
      const targetRoute = routes.find(r => 
        r.meta?.title === props.previousActivityName || r.name === props.previousActivityName
      );
      if (targetRoute) {
        router.push({ name: targetRoute.name });
      }
    }
  } else {
    // 如果在活動頁面，切換到概覽頁面
    router.push({ name: 'overview' });
  }
};

// 清除按鈕標題
const clearButtonTitle = computed(() => {
  if (route.name === 'overview') {
    return '清除所有資料';
  }
  const currentRoute = routes.find(r => r.name === route.name);
  const pageTitle = currentRoute?.meta?.title || '當前頁面';
  return `清除${pageTitle}資料`;
});
</script>

