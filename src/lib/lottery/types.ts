/**
 * 彩票类型枚举
 */
export enum LotteryType {
  DOUBLE_COLOR = 'double_color',    // 双色球
  SUPER_LOTTO = 'super_lotto',      // 大乐透
  HAPPY_8 = 'happy_8',              // 快乐8
  FUCAI_3D = 'fucai_3d'             // 福彩3D
}

/**
 * 号码球颜色类型
 */
export type BallColor = 'red' | 'blue' | 'green' | 'yellow';

/**
 * 号码球接口
 */
export interface NumberBall {
  value: number | string;
  color?: BallColor;
  isSpecial?: boolean;  // 是否为特别号（如蓝球）
  animated?: boolean;
}

/**
 * 号码组配置
 */
export interface NumberGroup {
  name: string;              // 如"红球"、"蓝球"
  count: number;             // 需要选择的数量
  range: [number, number];   // 号码范围
  color?: BallColor;
  allowRepeat?: boolean;     // 是否允许重复（福彩3D）
  isSpecial?: boolean;       // 是否为特别号码组
}

/**
 * 彩票规则接口
 */
export interface LotteryRule {
  type: LotteryType;
  name: string;
  description: string;
  groups: NumberGroup[];
  totalCombinations: number;
  winProbability: number;
  price?: number;  // 单注价格（元）
}

/**
 * 彩票结果接口
 */
export interface LotteryResult {
  type: LotteryType;
  numbers: NumberBall[][];
  timestamp: number;
  id: string;
}

/**
 * 概率分析结果
 */
export interface ProbabilityAnalysis {
  lotteryType: LotteryType;
  totalCombinations: number;
  winProbability: number;
  expectedValue?: number;
  statistics: {
    oddEvenRatio: number;    // 奇偶比例
    highLowRatio: number;    // 大小比例
    consecutiveRatio: number; // 连号比例
  };
  recommendations: number[];
}

/**
 * 历史记录
 */
export interface GenerationHistory {
  id: string;
  lotteryType: LotteryType;
  results: NumberBall[][];
  timestamp: number;
  saved: boolean;
}

/**
 * 福彩3D投注模式
 */
export type Fucai3DMode = 'direct' | 'group3' | 'group6';

/**
 * 快乐8选号数量
 */
export type Happy8Count = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
