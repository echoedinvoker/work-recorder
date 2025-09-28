import { SCORING_CONSTANTS } from '@/constants/scoringConstants'

export interface UsageInstruction {
  title: string
  description: string
  scoringRules: string[]
  tips: string[]
}

export const getWorkoutUsageInstruction = (): UsageInstruction => {
  const { RATIO_THRESHOLDS, SCORE_CHANGES, ABSENCE_PENALTY, INITIAL_SCORE } = SCORING_CONSTANTS.WORKOUT
  
  return {
    title: '重訓使用說明',
    description: '記錄每日重訓動作的組數、次數和重量，系統會根據加權運動量計算表現比例並給予相應分數。',
    scoringRules: [
      `初始分數：${INITIAL_SCORE} 分`,
      `表現優秀 (≥${RATIO_THRESHOLDS.EXCELLENT * 100}%)：+${SCORE_CHANGES.EXCELLENT_BONUS} 分`,
      `表現良好 (≥${RATIO_THRESHOLDS.GOOD * 100}%)：+${SCORE_CHANGES.GOOD_BONUS} 分`,
      `表現一般 (≥${RATIO_THRESHOLDS.FAIR * 100}%)：+${SCORE_CHANGES.FAIR_BONUS} 分`,
      `表現不佳 (<${RATIO_THRESHOLDS.FAIR * 100}%)：${SCORE_CHANGES.POOR_PENALTY} 分`,
      `未訓練：每日 ${ABSENCE_PENALTY} 分`
    ],
    tips: [
      '系統會根據歷史平均重量計算各動作的權重',
      '重量越重的動作權重越低，確保平衡發展',
      '建議每日進行多種不同動作的訓練',
      '持續記錄有助於系統更準確計算權重',
      '⚠️ 加權數值是根據每個動作每下的平均重量計算，不同動作每組次數最好相近才會比較有意義',
      '⚠️ 新動作出現時會帶入當日數據計算加權數值，這會導致 progress bar 的增量變動看起來可能比較奇怪，但這是正常的', 
      '⚠️ 第一次記錄時 progress bar 不會變動，需要第二次記錄才會有變化'
    ]
  }
}

export const getSwimmingUsageInstruction = (): UsageInstruction => {
  const { RATIO_THRESHOLDS, SCORE_CHANGES, ABSENCE_PENALTY, INITIAL_SCORE } = SCORING_CONSTANTS.SWIMMING
  
  return {
    title: '游泳使用說明',
    description: '記錄每日游泳的距離和時間，系統會根據游泳速度計算加權里程數並評估表現。',
    scoringRules: [
      `初始分數：${INITIAL_SCORE} 分`,
      `表現優秀 (≥${RATIO_THRESHOLDS.EXCELLENT * 100}%)：+${SCORE_CHANGES.EXCELLENT_BONUS} 分`,
      `表現良好 (≥${RATIO_THRESHOLDS.GOOD * 100}%)：+${SCORE_CHANGES.GOOD_BONUS} 分`,
      `表現一般 (≥${RATIO_THRESHOLDS.FAIR * 100}%)：+${SCORE_CHANGES.FAIR_BONUS} 分`,
      `表現不佳 (<${RATIO_THRESHOLDS.FAIR * 100}%)：${SCORE_CHANGES.POOR_PENALTY} 分`,
      `未游泳：每日 ${ABSENCE_PENALTY} 分`
    ],
    tips: [
      '游泳速度 ≥30 m/min：距離 × 1.2 倍權重',
      '游泳速度 ≥25 m/min：距離 × 1.0 倍權重',
      '游泳速度 ≥20 m/min：距離 × 0.8 倍權重',
      '游泳速度 <20 m/min：距離 × 0.5 倍權重',
      '提高游泳速度可獲得更高的加權里程數',
      '⚠️ 第一次記錄時 progress bar 不會變動，需要第二次記錄才會有變化'
    ]
  }
}

export const getNoSugarUsageInstruction = (): UsageInstruction => {
  const { SUCCESS_BONUS, FAILURE_PENALTY } = SCORING_CONSTANTS.NO_SUGAR.SCORE_CHANGES
  
  return {
    title: '飲控使用說明',
    description: '記錄每日的飲食控制狀況，根據當天飲食控管的程度給予相應的分數變化。',
    scoringRules: [
      `初始分數：${SCORING_CONSTANTS.COMMON.DEFAULT_SUCCESS_BONUS} 分`,
      '嚴守紀律 (+2)：+10 分',
      '大致遵守 (+1)：+5 分',
      '偶爾放縱 (-1)：-5 分',
      '完全失控 (-2)：-10 分',
      `未記錄：每日 ${SCORING_CONSTANTS.COMMON.DEFAULT_DAILY_PENALTY} 分`
    ],
    tips: [
      '每個等級變化對應 5 分的分數變化',
      '建議每日記錄以維持良好的飲食習慣',
      '長期堅持戒糖有助於健康管理',
      '偶爾的放縱是正常的，重要的是整體趨勢',
      '💡 建議自行制定更細節的規則來判斷四種等級的落點，每個人的標準可能不同，app 僅做粗分類' // 新增說明
    ]
  }
}

export const getEarlySleepUsageInstruction = (): UsageInstruction => {
  const { TIME_THRESHOLDS, SCORE_CHANGES, ABSENCE_PENALTY, INITIAL_SCORE } = SCORING_CONSTANTS.EARLY_SLEEP
  
  return {
    title: '早睡使用說明',
    description: '記錄每日的就寢時間，根據睡眠時間的早晚給予相應的分數獎勵或懲罰。',
    scoringRules: [
      `初始分數：${INITIAL_SCORE} 分`,
      `21:00 前就寢：+${SCORE_CHANGES.EXCELLENT_BONUS} 分`,
      `22:00 前就寢：+${SCORE_CHANGES.GOOD_BONUS} 分`,
      `22:00 後就寢：${SCORE_CHANGES.POOR_PENALTY} 分`,
      `未記錄：每日 ${ABSENCE_PENALTY} 分`
    ],
    tips: [
      '建議在 21:00 前就寢以獲得最高分數',
      '規律的睡眠時間有助於身體健康',
      '避免在睡前使用電子設備',
      '創造良好的睡眠環境'
    ]
  }
}

export const getHungryUsageInstruction = (): UsageInstruction => {
  const { INITIAL_SCORE, ABSENCE_PENALTY } = SCORING_CONSTANTS.HUNGRY
  
  return {
    title: '飢餓使用說明',
    description: '記錄每日睡前的飢餓感受程度，幫助了解和管理飲食節奏。', // 修改描述強調睡前
    scoringRules: [
      `初始分數：${INITIAL_SCORE} 分`,
      '很餓 (+2)：+10 分',
      '偏餓 (+1)：+5 分',
      '偏飽 (-1)：-5 分',
      '很飽 (-2)：-10 分',
      `未記錄：每日 ${ABSENCE_PENALTY} 分`
    ],
    tips: [
      '每個飢餓等級變化對應 5 分的分數變化',
      '適度的飢餓感是健康的表現',
      '避免過度飽食或過度飢餓',
      '記錄有助於了解個人的飲食模式',
      '🌙 建議在睡前感受自己的飢餓感，每天帶著飢餓感入睡的人一定可以快速減脂，但這需要強大的意志力！' // 新增睡前飢餓感說明
    ]
  }
}

export const getOverviewUsageInstruction = (): UsageInstruction => {
  return {
    title: '概覽頁面使用說明',
    description: '綜合顯示所有減脂相關活動的表現指標，提供整體進度追蹤和快速導航功能。',
    scoringRules: [
      '總分數：所有活動分數的加權平均',
      '記錄完成度：當日已記錄活動數量 / 總活動數量',
      '飲食控制分數：飲控紀錄 + 飢餓紀錄',
      '運動表現分數：重訓紀錄 + 游泳紀錄',
      '生活習慣分數：早睡紀錄',
      '趨勢分析：與前一日表現比較'
    ],
    tips: [
      '🎯 總分數會根據各項活動的權重計算',
      '📊 進度條顏色反映當日完成度：紅色(<40%) → 橙色(40-70%) → 綠色(≥70%)',
      '📈 趨勢指標幫助了解整體改善方向',
      '🔥 點擊活動卡片可快速導航到對應頁面',
      '💡 建議每日至少完成 3 項活動記錄以維持良好表現',
      '⚡ 各項活動的詳細說明請點擊對應頁面的說明按鈕',
      '⚠️ 頂部問號與垃圾桶按鈕會根據不同頁面有不同功能與內容'
    ]
  }
}

// 根據路由名稱獲取對應的使用說明
export const getUsageInstructionByRoute = (routeName: string): UsageInstruction | null => {
  switch (routeName) {
    case 'workout':
      return getWorkoutUsageInstruction()
    case 'swimming':
      return getSwimmingUsageInstruction()
    case 'noSugar':
      return getNoSugarUsageInstruction()
    case 'earlySleep':
      return getEarlySleepUsageInstruction()
    case 'hungry':
      return getHungryUsageInstruction()
    case 'overview':
      return getOverviewUsageInstruction()
    default:
      return null
  }
}

