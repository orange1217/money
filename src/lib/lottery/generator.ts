import { LotteryType, NumberBall, LotteryResult, Fucai3DMode, Happy8Count } from './types';
import { LOTTERY_RULES } from './rules';
import {
  secureRandomUniqueInts,
  secureRandomIntsWithRepeat
} from '../math/random';

/**
 * 彩票号码生成器类
 * 使用加密级安全的随机数生成算法
 */
export class LotteryGenerator {
  /**
   * 生成单组彩票号码
   * @param type 彩票类型
   * @returns 号码球数组
   */
  static generate(type: LotteryType): NumberBall[] {
    const rule = LOTTERY_RULES[type];
    const result: NumberBall[] = [];

    for (const group of rule.groups) {
      const numbers = group.allowRepeat
        ? secureRandomIntsWithRepeat(group.range[0], group.range[1], group.count)
        : secureRandomUniqueInts(group.range[0], group.range[1], group.count);

      for (const num of numbers) {
        result.push({
          value: num,
          color: group.color,
          isSpecial: group.isSpecial
        });
      }
    }

    return result;
  }

  /**
   * 批量生成多组彩票号码
   * @param type 彩票类型
   * @param count 组数
   * @returns 二维号码球数组
   */
  static generateMultiple(type: LotteryType, count: number): NumberBall[][] {
    return Array.from({ length: count }, () => this.generate(type));
  }

  /**
   * 生成完整的彩票结果对象
   * @param type 彩票类型
   * @param count 组数
   * @returns 彩票结果
   */
  static generateResult(type: LotteryType, count: number = 1): LotteryResult {
    return {
      type,
      numbers: this.generateMultiple(type, count),
      timestamp: Date.now(),
      id: crypto.randomUUID?.() || Math.random().toString(36).substring(2, 15)
    };
  }

  /**
   * 快乐8特殊处理：可选择1-10个号
   * @param count 选择的号码数量（1-10）
   * @returns 号码球数组
   */
  static generateHappy8(count: Happy8Count = 10): NumberBall[] {
    if (count < 1 || count > 10) {
      throw new Error('Happy8 requires selecting 1-10 numbers');
    }

    const numbers = secureRandomUniqueInts(1, 80, count);

    return numbers.map(num => ({
      value: num,
      color: 'green' as const
    }));
  }

  /**
   * 福彩3D特殊处理：支持直选和组选
   * @param mode 'direct' | 'group3' | 'group6'
   * @returns 号码球数组
   */
  static generateFucai3D(mode: Fucai3DMode = 'direct'): NumberBall[] {
    if (mode === 'direct') {
      // 直选：任何三位数都有效
      const numbers = secureRandomIntsWithRepeat(0, 9, 3);
      return numbers.map(num => ({
        value: num,
        color: 'yellow' as const
      }));
    }

    // 组选：需要确保符合组选规则
    let valid = false;
    let attempts = 0;
    let result: number[] = [];

    while (!valid && attempts < 100) {
      result = secureRandomIntsWithRepeat(0, 9, 3);
      const unique = new Set(result).size;

      if (mode === 'group3' && unique === 2) {
        valid = true; // 两个数字相同
      } else if (mode === 'group6' && unique === 3) {
        valid = true; // 三个数字都不同
      }

      attempts++;
    }

    // 如果100次尝试后仍无效，使用直选
    if (!valid) {
      result = secureRandomIntsWithRepeat(0, 9, 3);
    }

    return result.map(num => ({
      value: num,
      color: 'yellow' as const
    }));
  }

  /**
   * 验证生成的号码是否有效
   * @param type 彩票类型
   * @param balls 号码球数组
   * @returns 是否有效
   */
  static validate(type: LotteryType, balls: NumberBall[]): boolean {
    const rule = LOTTERY_RULES[type];

    // 检查总数量
    if (balls.length !== rule.groups.reduce((sum, g) => sum + g.count, 0)) {
      return false;
    }

    let ballIndex = 0;

    for (const group of rule.groups) {
      const groupBalls = balls.slice(ballIndex, ballIndex + group.count);

      // 检查数量
      if (groupBalls.length !== group.count) {
        return false;
      }

      // 检查范围
      for (const ball of groupBalls) {
        const value = typeof ball.value === 'number' ? ball.value : parseInt(ball.value as string);
        if (isNaN(value) || value < group.range[0] || value > group.range[1]) {
          return false;
        }
      }

      // 检查重复
      if (!group.allowRepeat) {
        const values = groupBalls.map(b => typeof b.value === 'number' ? b.value : parseInt(b.value as string));
        const unique = new Set(values);
        if (unique.size !== values.length) {
          return false;
        }
      }

      ballIndex += group.count;
    }

    return true;
  }
}

/**
 * 默认导出 - 便捷函数
 */
export function generateLotteryNumbers(type: LotteryType, count: number = 1): NumberBall[][] {
  return LotteryGenerator.generateMultiple(type, count);
}

export function generateHappy8(count: Happy8Count = 10): NumberBall[] {
  return LotteryGenerator.generateHappy8(count);
}

export function generateFucai3D(mode: Fucai3DMode = 'direct'): NumberBall[] {
  return LotteryGenerator.generateFucai3D(mode);
}
