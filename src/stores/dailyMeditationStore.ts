import { ref, computed } from 'vue';
import { defineStore } from 'pinia';
import { formatDateToKey, getTodayKey } from '../utils/dateUtils';

// 定義冥想記錄的類型
interface MeditationRecord {
  id: string;
  date: string;
  duration: number;
  notes?: string;
}

// 定義單位
const UNIT = '時間(分鐘)';

export const useDailyMeditationStore = defineStore('dailyMeditation', () => {
  // 存儲冥想記錄
  const meditationRecords = ref<MeditationRecord[]>([]);
  
  // 狀態管理
  const isRecording = ref(false);
  const isDisplayingResult = ref(false);
  const startTime = ref<Date | null>(null);
  const endTime = ref<Date | null>(null);

  // 添加冥想記錄
  const addMeditationRecord = (record: Omit<MeditationRecord, 'id'>) => {
    const id = Date.now().toString();
    meditationRecords.value.push({
      id,
      ...record
    });
    
    // 按日期排序
    meditationRecords.value.sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  };

  // 刪除冥想記錄
  const deleteMeditationRecord = (id: string) => {
    const index = meditationRecords.value.findIndex(record => record.id === id);
    if (index !== -1) {
      meditationRecords.value.splice(index, 1);
    }
  };

  // 添加冥想時間到今日
  const addMeditationTime = (minutes: number) => {
    const today = getTodayKey();
    const existingRecord = meditationRecords.value.find(r => r.date === today);
    
    if (existingRecord) {
      existingRecord.duration += minutes;
    } else {
      addMeditationRecord({
        date: today,
        duration: minutes,
        notes: '自動記錄'
      });
    }
  };

  // 實現 ScoreProvider 接口的 getScoreByDate 方法
  const getScoreByDate = (date: Date) => {
    const dateString = formatDateToKey(date);
    const record = meditationRecords.value.find(r => r.date === dateString);
    return record ? record.duration : 0;
  };

  return {
    meditationRecords,
    isRecording,
    isDisplayingResult,
    startTime,
    endTime,
    addMeditationRecord,
    deleteMeditationRecord,
    addMeditationTime,
    getScoreByDate,
    UNIT
  };
}, {
  persist: {
    serializer: {
      serialize: (state) => {
        return JSON.stringify({
          ...state,
          startTime: state.startTime?.toISOString() || null,
          endTime: state.endTime?.toISOString() || null
        });
      },
      deserialize: (value) => {
        const parsed = JSON.parse(value);
        return {
          ...parsed,
          startTime: parsed.startTime ? new Date(parsed.startTime) : null,
          endTime: parsed.endTime ? new Date(parsed.endTime) : null
        };
      }
    }
  }
});

