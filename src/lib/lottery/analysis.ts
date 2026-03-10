import { LotteryType, NumberBall, ProbabilityAnalysis } from './types';
import { LOTTERY_RULES } from './rules';
import {
  calculateCombinations,
  binomialProbability,
  analyzeOddEvenRatio,
  analyzeHighLowRatio,
  analyzeConsecutiveNumbers,
  calculateSum,
  calculateACValue
} from '../math/combinatorics';
import { weightedSample } from '../math/random';

/**
 * 彩票号码分析器
 * 基于数学原理提供号码推荐
 */
export class LotteryAnalyzer {
  /**
   * 分析号码的奇偶比例
   * @param numbers 号码数组
   * @returns 奇偶比例
   */
  static analyzeOddEvenRatio(numbers: number[]): number {
    return analyzeOddEvenRatio(numbers);
  }

  /**
   * 分析号码的大小比例（以中位数为界）
   * @param numbers 号码数组
   * @param max 最大值
   * @returns 大小比例
   */
  static analyzeHighLowRatio(numbers: number[], max: number): number {
    return analyzeHighLowRatio(numbers, max);
  }

  /**
   * 分析连号数量
   * @param numbers 已排序的号码数组
   * @returns 连号对数
   */
  static analyzeConsecutiveNumbers(numbers: number[]): number {
    return analyzeConsecutiveNumbers(numbers);
  }

  /**
   * 计算号码的和值
   * @param numbers 号码数组
   * @returns 和值
   */
  static calculateSum(numbers: number[]): number {
    return calculateSum(numbers);
  }

  /**
   * 计算号码的AC值（数字复杂指数）
   * @param numbers 号码数组
   * @returns AC值
   */
  static calculateACValue(numbers: number[]): number {
    return calculateACValue(numbers);
  }

  /**
   * 基于概率论推荐幸运号码
   * @param type 彩票类型
   * @returns 推荐的号码数组
   */
  static recommendLuckyNumbers(type: LotteryType): number[] {
    switch (type) {
      case LotteryType.DOUBLE_COLOR:
        return this.recommendDoubleColor();
      case LotteryType.SUPER_LOTTO:
        return this.recommendSuperLotto();
      case LotteryType.HAPPY_8:
        return this.recommendHappy8();
      case LotteryType.FUCAI_3D:
        return this.recommendFucai3D();
      default:
        throw new Error('Unsupported lottery type');
    }
  }

  /**
   * 双色球推荐策略
   * 基于黄金分割率和历史统计
   */
  private static recommendDoubleColor(): number[] {
    // 红球推荐：选择奇偶平衡、大小平衡的号码
    const redPool = Array.from({ length: 33 }, (_, i) => i + 1);

    // 权重：基于黄金分割率
    const goldenRatio = 0.618;
    const weights = redPool.map(num => {
      const position = num / 33;
      // 接近黄金分割率的权重更高
      const distanceFromGolden = Math.abs(position - goldenRatio);
      return Math.max(0.1, 1 - distanceFromGolden);
    });

    const redBalls = weightedSample(redPool, weights, 6);

    // 蓝球：随机选择
    const blueBall = Math.floor(Math.random() * 16) + 1;

    return [...redBalls.sort((a, b) => a - b), blueBall];
  }

  /**
   * 大乐透推荐策略
   */
  private static recommendSuperLotto(): number[] {
    const frontPool = Array.from({ length: 35 }, (_, i) => i + 1);
    const backPool = Array.from({ length: 12 }, (_, i) => i + 1);

    // 前区：使用正弦函数创建波动权重
    const frontWeights = frontPool.map(num => {
      const position = num / 35;
      return 0.5 + 0.5 * Math.sin(position * Math.PI * 4);
    });

    const frontBalls = weightedSample(frontPool, frontWeights, 5);

    // 后区：均匀随机
    const backWeights = backPool.map(() => 1);
    const backBalls = weightedSample(backPool, backWeights, 2);

    return [...frontBalls.sort((a, b) => a - b), ...backBalls.sort((a, b) => a - b)];
  }

  /**
   * 快乐8推荐策略
   */
  private static recommendHappy8(): number[] {
    const pool = Array.from({ length: 80 }, (_, i) => i + 1);

    // 使用正态分布权重，集中在中段
    const mean = 40;
    const stdDev = 20;
    const weights = pool.map(num => {
      const z = (num - mean) / stdDev;
      return Math.exp(-(z * z) / 2);
    });

    return weightedSample(pool, weights, 10).sort((a, b) => a - b);
  }

  /**
   * 福彩3D推荐策略
   */
  private static recommendFucai3D(): number[] {
    // 基于概率均匀分布
    return Array.from({ length: 3 }, () => Math.floor(Math.random() * 10));
  }

  /**
   * 生成完整的概率分析报告
   * @param type 彩票类型
   * @returns 概率分析对象
   */
  static generateProbabilityAnalysis(type: LotteryType): ProbabilityAnalysis {
    const rule = LOTTERY_RULES[type];

    // 计算理论统计值
    const statistics = {
      oddEvenRatio: 0.5,  // 理论奇偶比
      highLowRatio: 0.5,  // 理论大小比
      consecutiveRatio: 0.3  // 经验值
    };

    return {
      lotteryType: type,
      totalCombinations: rule.totalCombinations,
      winProbability: rule.winProbability,
      expectedValue: rule.winProbability * 1000000,  // 假设一等奖100万
      statistics,
      recommendations: this.recommendLuckyNumbers(type)
    };
  }

  /**
   * 分析已生成的号码组合
   * @param balls 号码球数组
   * @returns 分析结果
   */
  static analyzeNumberCombination(balls: NumberBall[]): {
    oddEvenRatio: number;
    highLowRatio: number;
    consecutiveCount: number;
    sum: number;
    acValue: number;
    description: string;
  } {
    const numbers = balls
      .filter(b => !b.isSpecial)
      .map(b => typeof b.value === 'number' ? b.value : parseInt(b.value as string))
      .sort((a, b) => a - b);

    const max = Math.max(...numbers, 33);  // 默认最大值
    const oddEvenRatio = this.analyzeOddEvenRatio(numbers);
    const highLowRatio = this.analyzeHighLowRatio(numbers, max);
    const consecutiveCount = this.analyzeConsecutiveNumbers(numbers);
    const sum = this.calculateSum(numbers);
    const acValue = this.calculateACValue(numbers);

    // 生成描述
    const oddCount = numbers.filter(n => n % 2 === 1).length;
    const evenCount = numbers.length - oddCount;
    const description = `奇偶比 ${oddCount}:${evenCount}，和值 ${sum}，AC值 ${acValue}`;

    return {
      oddEvenRatio,
      highLowRatio,
      consecutiveCount,
      sum,
      acValue,
      description
    };
  }

  /**
   * 计算号码组合的"热度"评分
   * 评分越高，表示该组合在历史上出现频率越高（模拟）
   * @param balls 号码球数组
   * @returns 热度评分 (0-100)
   */
  static calculateHotness(balls: NumberBall[]): number {
    const numbers = balls
      .filter(b => !b.isSpecial)
      .map(b => typeof b.value === 'number' ? b.value : parseInt(b.value as string));

    // 基于数学特征计算热度（模拟算法）
    const sum = this.calculateSum(numbers);
    const avg = sum / numbers.length;
    const variance = numbers.reduce((acc, n) => acc + Math.pow(n - avg, 2), 0) / numbers.length;

    // 使用方差和和值计算热度
    // 较低的方差表示号码分布较为集中，可能"更热"
    const normalizedVariance = Math.min(variance / 100, 1);
    const normalizedSum = Math.min(sum / 200, 1);

    const hotness = Math.round((1 - normalizedVariance * 0.5) * normalizedSum * 100);
    return Math.max(0, Math.min(100, hotness));
  }

  /**
   * 获取彩票难度评级
   * @param type 彩票类型
   * @returns 难度星级 (1-5)
   */
  static getDifficultyRating(type: LotteryType): number {
    const difficultyMap: Record<LotteryType, number> = {
      [LotteryType.FUCAI_3D]: 2,      // 1/1000
      [LotteryType.HAPPY_8]: 4,       // ~1/891万
      [LotteryType.DOUBLE_COLOR]: 5,  // ~1/1772万
      [LotteryType.SUPER_LOTTO]: 5    // ~1/2142万
    };

    return difficultyMap[type];
  }

  /**
   * 获取理性购彩建议
   * @param type 彩票类型
   * @returns 建议文本
   */
  static getResponsibleGamingAdvice(type: LotteryType): string[] {
    const rule = LOTTERY_RULES[type];
    const probability = rule.winProbability;
    const oneInN = Math.round(1 / probability);

    return [
      `中奖概率约为 ${oneInN.toLocaleString()} 分之一`,
      '请理性购彩，量力而行',
      '彩票是娱乐方式，不是投资手段',
      '建议设定预算，不要超出承受能力',
      '好运属于每个人，但不必期待中大奖'
    ];
  }
}

/**
 * 默认导出 - 便捷函数
 */
export function recommendLuckyNumbers(type: LotteryType): number[] {
  return LotteryAnalyzer.recommendLuckyNumbers(type);
}

export function analyzeNumbers(balls: NumberBall[]) {
  return LotteryAnalyzer.analyzeNumberCombination(balls);
}

export function getProbabilityAnalysis(type: LotteryType): ProbabilityAnalysis {
  return LotteryAnalyzer.generateProbabilityAnalysis(type);
}
