<template>
  <div>
    <component 
      :is="componentType"
      :type="inputType"
      :value="modelValue"
      @input="handleInput"
      @change="handleChange"
      :placeholder="placeholder"
      :required="required"
      :rows="rows"
      class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
    >
      <!-- 只有當是 select 元素時才渲染選項 -->
      <option v-if="type === 'select'" v-for="option in options" :key="option.value" :value="option.value">
        {{ option.label }}
      </option>
    </component>
  </div>
</template>

<script setup lang="ts">

import { computed } from 'vue';

// 定義組件的屬性
interface Option {
  value: string;
  label: string;
}

const props = defineProps({
  // 輸入類型：text, textarea, select 等
  type: {
    type: String,
    default: 'text',
    validator: (value: string) => ['text', 'textarea', 'select', 'number', 'email', 'password', 'date'].includes(value)
  },
  // v-model 綁定值
  modelValue: {
    type: [String, Number],
    default: ''
  },
  // 佔位符文字
  placeholder: {
    type: String,
    default: ''
  },
  // 是否必填
  required: {
    type: Boolean,
    default: false
  },
  // textarea 的行數
  rows: {
    type: Number,
    default: 2
  },
  // select 的選項
  options: {
    type: Array as () => Option[],
    default: () => []
  }
});

const emit = defineEmits(['update:modelValue']);

// 根據 type 決定要渲染的組件類型
const componentType = computed(() => {
  return props.type === 'textarea' ? 'textarea' : 
         props.type === 'select' ? 'select' : 'input';
});

// 只有當是 input 元素時才需要設置 type 屬性
const inputType = computed(() => {
  return props.type !== 'textarea' && props.type !== 'select' ? props.type : undefined;
});

// 處理 input 和 textarea 的輸入事件
const handleInput = (event: Event) => {
  emit('update:modelValue', (event.target as HTMLInputElement | HTMLTextAreaElement).value);
};

// 處理 select 的變更事件
const handleChange = (event: Event) => {
  emit('update:modelValue', (event.target as HTMLSelectElement).value);
};
</script>

