import { LotteryRule, LotteryType } from './types';
import { calculateCombinations } from '../math/combinatorics';

/**
 * 彩票规则配置
 * 根据中国彩票官方规则配置
 */
export const LOTTERY_RULES: Record<LotteryType, LotteryRule> = {
  [LotteryType.DOUBLE_COLOR]: {
    type: LotteryType.DOUBLE_COLOR,
    name: '双色球',
    description: '6个红球(33选6) + 1个蓝球(16选1)',
    groups: [
      {
        name: '红球',
        count: 6,
        range: [1, 33],
        color: 'red',
        allowRepeat: false
      },
      {
        name: '蓝球',
        count: 1,
        range: [1, 16],
        color: 'blue',
        allowRepeat: false,
        isSpecial: true
      }
    ],
    totalCombinations: calculateCombinations(33, 6) * 16,
    winProbability: 1 / (calculateCombinations(33, 6) * 16),
    price: 2
  },

  [LotteryType.SUPER_LOTTO]: {
    type: LotteryType.SUPER_LOTTO,
    name: '超级大乐透',
    description: '5个前区(35选5) + 2个后区(12选2)',
    groups: [
      {
        name: '前区',
        count: 5,
        range: [1, 35],
        color: 'red',
        allowRepeat: false
      },
      {
        name: '后区',
        count: 2,
        range: [1, 12],
        color: 'blue',
        allowRepeat: false,
        isSpecial: true
      }
    ],
    totalCombinations: calculateCombinations(35, 5) * calculateCombinations(12, 2),
    winProbability: 1 / (calculateCombinations(35, 5) * calculateCombinations(12, 2)),
    price: 2
  },

  [LotteryType.HAPPY_8]: {
    type: LotteryType.HAPPY_8,
    name: '快乐8',
    description: '80个号开20个，选1-10个号投注',
    groups: [
      {
        name: '选号',
        count: 10,  // 默认选10个
        range: [1, 80],
        color: 'green',
        allowRepeat: false
      }
    ],
    totalCombinations: calculateCombinations(80, 20),
    winProbability: 1 / calculateCombinations(80, 10),
    price: 2
  },

  [LotteryType.FUCAI_3D]: {
    type: LotteryType.FUCAI_3D,
    name: '福彩3D',
    description: '选3位数字(000-999)，分直选/组选',
    groups: [
      {
        name: '三位数字',
        count: 3,
        range: [0, 9],
        color: 'yellow',
        allowRepeat: true  // 允许重复
      }
    ],
    totalCombinations: 1000,  // 000-999
    winProbability: 1 / 1000,
    price: 2
  }
};

/**
 * 获取彩票规则
 * @param type 彩票类型
 * @returns 彩票规则
 */
export function getLotteryRule(type: LotteryType): LotteryRule {
  return LOTTERY_RULES[type];
}

/**
 * 获取所有彩票类型列表
 * @returns 彩票类型数组
 */
export function getAllLotteryTypes(): LotteryType[] {
  return Object.values(LotteryType);
}

/**
 * 获取彩票类型的中文名称
 * @param type 彩票类型
 * @returns 中文名称
 */
export function getLotteryTypeName(type: LotteryType): string {
  return LOTTERY_RULES[type].name;
}

/**
 * 格式化中奖概率显示
 * @param probability 概率值（0-1）
 * @returns 格式化的概率字符串
 */
export function formatProbability(probability: number): string {
  if (probability === 0) return '0%';
  if (probability === 1) return '100%';

  const oneInN = Math.round(1 / probability);
  if (oneInN >= 100000000) {
    return `约 ${ (oneInN / 100000000).toFixed(1) } 亿分之一`;
  } else if (oneInN >= 10000) {
    return `约 ${ (oneInN / 10000).toFixed(1) } 万分之一`;
  } else if (oneInN >= 1000) {
    return `约 ${ (oneInN / 1000).toFixed(1) } 千分之一`;
  }
  return `约 ${ oneInN } 分之一`;
}

/**
 * 格式化组合数显示（带千分位）
 * @param num 数字
 * @returns 格式化后的字符串
 */
export function formatNumber(num: number): string {
  return num.toLocaleString('zh-CN');
}
