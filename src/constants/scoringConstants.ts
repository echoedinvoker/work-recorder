export const SCORING_CONSTANTS = {
  // 重訓 (Workout) 相關常數
  WORKOUT: {
    // 比例閾值
    RATIO_THRESHOLDS: {
      EXCELLENT: 1.0,    // >= 100% 表現優秀
      GOOD: 0.8,         // >= 80% 表現良好  
      FAIR: 0.6,         // >= 60% 表現一般
    },
    // 進度條顏色配置
    THRESHOLD_COLORS: [
      { value: 0.0, color: '#ef4444', message: '需要努力' },   // red-500 - 0% 開始為紅色 (差)
      { value: 0.6, color: '#f59e0b', message: '表現一般' },   // amber-500 - 60% 一般表現
      { value: 0.8, color: '#10b981', message: '表現良好' },   // green-500 - 80% 良好表現
      { value: 1.0, color: '#3b82f6', message: '表現優秀' },   // blue-500 - 100% 優秀表現
    ],
    // 分數增減
    SCORE_CHANGES: {
      EXCELLENT_BONUS: 10,  // 優秀表現獎勵分數
      GOOD_BONUS: 5,        // 良好表現獎勵分數
      FAIR_BONUS: 2,        // 一般表現獎勵分數
      POOR_PENALTY: -5,     // 表現不佳扣分
    },
    // 缺席懲罰
    ABSENCE_PENALTY: -5,    // 每天未訓練扣分
    // 初始分數
    INITIAL_SCORE: 10,      // 首次達標的初始分數
  },

  // 工作 (Work) 相關常數
  WORK: {
    TARGET_SCORE: 6,           // 主要目標分數
    SECONDARY_TARGET: 4,       // 次要目標分數
    SCORE_CHANGES: {
      EXCELLENT_BONUS: 2,      // 達到主要目標獎勵
      GOOD_BONUS: 1,           // 達到次要目標獎勵
      POOR_PENALTY: -1,        // 未達次要目標扣分
    },
    MIN_SCORE: 0,              // 最低分數限制
  },

  // 戒糖 (No Sugar) 相關常數
  NO_SUGAR: {
    SCORE_CHANGES: {
      SUCCESS_BONUS: 10,       // 成功戒糖獎勵
      FAILURE_PENALTY: -15,    // 失敗戒糖懲罰
    },
    MIN_SCORE: 0,              // 最低分數限制
  },

  // 通用常數
  COMMON: {
    MIN_SCORE: 0,              // 通用最低分數
    DEFAULT_DAILY_PENALTY: -5, // 預設每日缺席懲罰
    DEFAULT_SUCCESS_BONUS: 10, // 預設成功獎勵
  }
} as const;

// 類型定義，確保類型安全
export type ScoringConstants = typeof SCORING_CONSTANTS;
export type WorkoutConstants = typeof SCORING_CONSTANTS.WORKOUT;
export type WorkConstants = typeof SCORING_CONSTANTS.WORK;
export type NoSugarConstants = typeof SCORING_CONSTANTS.NO_SUGAR;

// 輔助函數：根據比例獲取重訓分數變化
export const getWorkoutScoreChange = (ratio: number): number => {
  const { RATIO_THRESHOLDS, SCORE_CHANGES } = SCORING_CONSTANTS.WORKOUT;

  if (ratio >= RATIO_THRESHOLDS.EXCELLENT) {
    return SCORE_CHANGES.EXCELLENT_BONUS;
  } else if (ratio >= RATIO_THRESHOLDS.GOOD) {
    return SCORE_CHANGES.GOOD_BONUS;
  } else if (ratio >= RATIO_THRESHOLDS.FAIR) {
    return SCORE_CHANGES.FAIR_BONUS;
  } else {
    return SCORE_CHANGES.POOR_PENALTY;
  }
};

// 輔助函數：根據工作分數獲取累計分數變化
export const getWorkScoreChange = (dailyScore: number): number => {
  const { TARGET_SCORE, SECONDARY_TARGET, SCORE_CHANGES } = SCORING_CONSTANTS.WORK;

  if (dailyScore >= TARGET_SCORE) {
    return SCORE_CHANGES.EXCELLENT_BONUS;
  } else if (dailyScore >= SECONDARY_TARGET) {
    return SCORE_CHANGES.GOOD_BONUS;
  } else {
    return SCORE_CHANGES.POOR_PENALTY;
  }
};

// 輔助函數：獲取 workout 進度條配置
export const getWorkoutProgressConfig = (ratio: number, ratioIncrements: number = 0) => {
  return {
    ratio,
    ratioIncrememts: ratioIncrements,
    thresholds: SCORING_CONSTANTS.WORKOUT.THRESHOLD_COLORS
  };
};

// 輔助函數：根據比例獲取對應顏色
export const getWorkoutColor = (ratio: number): string => {
  const thresholds = [...SCORING_CONSTANTS.WORKOUT.THRESHOLD_COLORS].sort((a, b) => a.value - b.value);

  for (let i = thresholds.length - 1; i >= 0; i--) {
    if (ratio >= thresholds[i].value) {
      return thresholds[i].color;
    }
  }

  return thresholds[0]?.color || '#ef4444';
};
