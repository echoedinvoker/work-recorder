<template>
  <div v-if="todos.length === 0" class="text-gray-500 mt-8 mx-auto text-center">
    還沒有任何任務，開始新增第一個吧！
  </div>
  <div v-else class="flex-1 flex flex-col gap-4">
    <!-- 切換按鈕 -->
    <div class="flex justify-end mb-2">
      <button @click="toggleView" 
              class="text-sm px-3 py-1 rounded-md bg-gray-100 hover:bg-gray-200 transition-colors">
        {{ showTodoList ? '返回任務詳情' : '查看時間概覽' }}
      </button>
    </div>
    
    <!-- 根據狀態顯示 TodoItem 或 TodoList -->
    <div v-if="!showTodoList">
      <TodoItem :todo="currentTodo" @complete="completeTodo" @delete="deleteTodo" />
    </div>
    <div v-else>
      <TodoList />
    </div>
    
    <TodoSingleFooter v-if="!showTodoList" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useTodo } from '@/composables/useTodo';
import TodoItem from '@/components/todo/TodoItem.vue';
import TodoList from '@/components/todo/TodoList.vue';
import TodoSingleFooter from '@/components/todo/TodoSingleFooter.vue';

const {
  todos,
  currentTodo,
  completeTodo,
  deleteTodo,
} = useTodo();

// 控制視圖顯示 TodoItem 或 TodoList
const showTodoList = ref(true);

// 切換視圖
const toggleView = () => {
  showTodoList.value = !showTodoList.value;
};
</script>

