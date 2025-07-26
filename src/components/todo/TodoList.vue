<template>
  <div class="h-96 bg-white rounded-lg shadow-md p-4 max-h-[70vh] overflow-y-auto todo-list-container">
    <div v-if="sortedTodos.length === 0" class="text-gray-500 text-center py-4">
      沒有任何任務
    </div>
    <div v-else class="flex flex-col gap-3">
      <!-- 已開始的任務 -->
      <div v-for="todo in sortedTodos" :key="todo.id" 
           @click="selectTodo(todo.id)"
           class="cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors">
        <div class="flex items-center justify-between mb-1">
          <span class="font-medium truncate" :class="getTextColorClass(todo)">{{ todo.title }}</span>
          <span class="text-xs" :class="getTextColorClass(todo)">
            {{ todo.isActive ? formatTimeRemaining(todo) : '尚未開始' }}
          </span>
        </div>
        <div class="w-full bg-gray-200 rounded-full h-2.5">
          <div class="h-2.5 rounded-full" 
               :style="{ width: `${getProgressPercentage(todo)}%`, backgroundColor: getProgressColor(todo) }">
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useTodo, type Todo } from '@/composables/useTodo';

const {
  todos,
  currentTodoIndex,
  getPeriodMs,
} = useTodo();

// 計算每個 todo 的剩餘時間
const getRemainingTime = (todo: Todo) => {
  if (!todo.isActive || !todo.nextDue) return Infinity;
  return Math.max(0, todo.nextDue.getTime() - Date.now());
};

// 計算進度百分比
const getProgressPercentage = (todo: Todo) => {
  if (!todo.isActive || !todo.nextDue) return 0;
  const remaining = getRemainingTime(todo);
  const total = getPeriodMs(todo.period);
  return Math.max(0, (remaining / total) * 100);
};

// 根據剩餘時間排序的 todos
const sortedTodos = computed(() => {
  return [...todos.value].sort((a, b) => {
    // 已開始的任務優先，按剩餘時間排序
    if (a.isActive && b.isActive) {
      return getRemainingTime(a) - getRemainingTime(b);
    }
    // 已開始的任務排在未開始的前面
    if (a.isActive && !b.isActive) return -1;
    if (!a.isActive && b.isActive) return 1;
    // 都未開始，按 ID 排序
    return a.id.localeCompare(b.id);
  });
});

// 獲取進度條顏色
const getProgressColor = (todo: Todo) => {
  if (!todo.isActive) return '#9ca3af'; // 灰色
  
  const percentage = getProgressPercentage(todo);
  if (percentage > 50) return '#10b981'; // 綠色
  if (percentage > 20) return '#eab308'; // 黃色
  return '#ef4444'; // 紅色
};

// 獲取文字顏色類
const getTextColorClass = (todo: Todo) => {
  if (!todo.isActive) return 'text-gray-500';
  
  const percentage = getProgressPercentage(todo);
  if (percentage > 50) return 'text-green-600';
  if (percentage > 20) return 'text-yellow-600';
  return 'text-red-600';
};

// 格式化剩餘時間
const formatTimeRemaining = (todo: Todo) => {
  const ms = getRemainingTime(todo);
  if (ms <= 0) return '已過期';

  const days = Math.floor(ms / (24 * 60 * 60 * 1000));
  const hours = Math.floor((ms % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
  const minutes = Math.floor((ms % (60 * 60 * 1000)) / (60 * 1000));

  if (days > 0) return `${days}天 ${hours}小時`;
  if (hours > 0) return `${hours}小時 ${minutes}分鐘`;
  return `${minutes}分鐘`;
};

// 選擇 todo 並切換到該 todo
const selectTodo = (id: string) => {
  const index = todos.value.findIndex(t => t.id === id);
  if (index !== -1) {
    currentTodoIndex.value = index;
  }
};
</script>

<style scoped>
.todo-list-container {
  overflow-y: auto;
  scrollbar-width: thin; /* Firefox */
  scrollbar-color: rgba(156, 163, 175, 0.5) transparent; /* Firefox */
}

/* Webkit (Chrome, Safari, Edge) 捲軸樣式 */
.todo-list-container::-webkit-scrollbar {
  width: 6px;
}

.todo-list-container::-webkit-scrollbar-track {
  background: transparent;
}

.todo-list-container::-webkit-scrollbar-thumb {
  background-color: rgba(156, 163, 175, 0.5);
  border-radius: 3px;
}

.todo-list-container::-webkit-scrollbar-thumb:hover {
  background-color: rgba(156, 163, 175, 0.7);
}
</style>
