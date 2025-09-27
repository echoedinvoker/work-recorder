import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { formatDateToKey, getTodayKey } from '../utils/dateUtils'

const UNIT = '分數'

const generateMockData = () => {
  const mockData: Record<string, string> = {}
  const today = new Date()

  for (let i = 13; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    const dateKey = formatDateToKey(date)

    // 隨機生成時間字符串 (21:00 - 23:59)
    const hour = Math.floor(Math.random() * 3) + 21
    const minute = Math.floor(Math.random() * 60)
    mockData[dateKey] = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
  }

  return mockData
}

const useMockData = import.meta.env.VITE_USE_MOCK_DATA === 'true'

export const useDailyEarlySleepStore = defineStore("dailyEarlySleep", () => {
  // 記錄每天是否成功早睡 (true = 成功, false = 失敗)
  const dailyEarlySleepResults = ref<Record<string, string>>(useMockData ? generateMockData() : {});

  const isTodayRecorded = computed(() => {
    const today = getTodayKey();
    return !!dailyEarlySleepResults.value[today];
  });

  const recordResult = () => {
    const today = getTodayKey();
    if (dailyEarlySleepResults.value[today]) {
      delete dailyEarlySleepResults.value[today];
    } else {
      const now = new Date();
      const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      dailyEarlySleepResults.value[today] = currentTime;
    }
  };

  const earliestDateKey = computed(() => {
    const dateKeys = Object.keys(dailyEarlySleepResults.value)
    if (dateKeys.length === 0) {
      return getTodayKey()
    }
    return dateKeys.sort()[0]
  })

  const accDailyScore = computed(() => {
    const scores: { [key: string]: number } = {}
    let currentScore = 0
    let currentDate = new Date(earliestDateKey.value)
    while (formatDateToKey(currentDate) <= getTodayKey()) {
      const dateKey = formatDateToKey(currentDate)
      if (dailyEarlySleepResults.value[dateKey]) {
        // 9點前睡覺 +2分, 10點前 +1分, 11點前 -1分, 11點後 -2分
        const sleepTime = dailyEarlySleepResults.value[dateKey];
        const [hours, minutes] = sleepTime.split(':').map(Number);

        if (hours < 21) {
          // 9點前睡覺 +2分
          currentScore += 2;
        } else if (hours < 22) {
          // 10點前睡覺 +1分
          currentScore += 1;
        } else if (hours < 23) {
          // 11點前睡覺 -1分
          currentScore = Math.max(0, currentScore - 1);
        } else {
          // 11點後睡覺 -2分
          currentScore = Math.max(0, currentScore - 2);
        }
      } else {
        currentScore = Math.max(0, currentScore - 3)
      }
      scores[dateKey] = currentScore
      currentDate.setDate(currentDate.getDate() + 1)
    }
    return scores
  });

  const scoreDifference = computed(() => {
    const scoreEntries = Object.entries(accDailyScore.value);

    // 按日期排序
    scoreEntries.sort((a, b) => a[0].localeCompare(b[0]));

    // 取得最後兩個分數
    const latestScore = scoreEntries[scoreEntries.length - 1][1];
    const previousScore = scoreEntries.length < 2 ? 0 : scoreEntries[scoreEntries.length - 2][1];

    // 計算差距
    return latestScore - previousScore;
  });

  const getScoreByDate = (date: Date): number => {
    const dateKey = formatDateToKey(date);
    return accDailyScore.value[dateKey] || 0;
  };
  const clearAllHistory = () => {
    dailyEarlySleepResults.value = {};
  }

  return {
    dailyEarlySleepResults,
    recordResult,
    isTodayRecorded,
    accDailyScore,
    scoreDifference,
    getScoreByDate,
    clearAllHistory,
    UNIT
  };
},
  {
    persist: useMockData ? false : { // 不使用假資料時啟用持久化存儲
      serializer: {
        serialize: (state) => {
          return JSON.stringify({
            ...state,
            startTime: state.startTime?.toISOString() || null,
            endTime: state.endTime?.toISOString() || null
          })
        },
        deserialize: (value) => {
          const parsed = JSON.parse(value)
          return {
            ...parsed,
            startTime: parsed.startTime ? new Date(parsed.startTime) : null,
            endTime: parsed.endTime ? new Date(parsed.endTime) : null
          }
        }
      }
    }
  }
);

