/**
 * 组合数学工具函数
 * 用于计算彩票概率和组合数
 */

/**
 * 计算阶乘 n!
 * @param n 非负整数
 * @returns 阶乘结果
 */
export function factorial(n: number): number {
  if (n < 0) throw new Error('Factorial is not defined for negative numbers');
  if (n === 0 || n === 1) return 1;

  let result = 1;
  for (let i = 2; i <= n; i++) {
    result *= i;
  }
  return result;
}

/**
 * 计算组合数 C(n, k) = n! / (k!(n-k)!)
 * 使用优化的算法避免大数计算
 * @param n 总数
 * @param k 选择数
 * @returns 组合数
 */
export function calculateCombinations(n: number, k: number): number {
  if (k < 0 || k > n) return 0;
  if (k === 0 || k === n) return 1;

  // 优化：使用较小的 k
  k = Math.min(k, n - k);

  let result = 1;
  for (let i = 0; i < k; i++) {
    result = result * (n - i) / (i + 1);
  }

  return Math.round(result);
}

/**
 * 计算排列数 P(n, k) = n! / (n-k)!
 * @param n 总数
 * @param k 排列数
 * @returns 排列数
 */
export function calculatePermutations(n: number, k: number): number {
  if (k < 0 || k > n) return 0;
  if (k === 0) return 1;

  let result = 1;
  for (let i = 0; i < k; i++) {
    result *= (n - i);
  }

  return result;
}

/**
 * 计算中奖概率
 * @param totalNumbers 总号码数
 * @param selectedNumbers 选中的号码数
 * @param winningNumbers 中奖所需的号码数
 * @returns 中奖概率（0-1之间）
 */
export function calculateWinProbability(
  totalNumbers: number,
  selectedNumbers: number,
  winningNumbers: number
): number {
  const totalCombinations = calculateCombinations(totalNumbers, selectedNumbers);
  const winningCombinations = calculateCombinations(selectedNumbers, winningNumbers);
  const remainingCombinations = calculateCombinations(
    totalNumbers - selectedNumbers,
    selectedNumbers - winningNumbers
  );

  return (winningCombinations * remainingCombinations) / totalCombinations;
}

/**
 * 生成所有可能的组合（用于小规模数据）
 * @param array 原始数组
 * @param k 组合大小
 * @returns 所有组合的数组
 */
export function generateCombinations<T>(array: T[], k: number): T[][] {
  const result: T[][] = [];

  function combine(start: number, chosen: T[]) {
    if (chosen.length === k) {
      result.push([...chosen]);
      return;
    }

    for (let i = start; i < array.length; i++) {
      chosen.push(array[i]);
      combine(i + 1, chosen);
      chosen.pop();
    }
  }

  combine(0, []);
  return result;
}

/**
 * 计算期望值
 * @param probabilities 概率数组
 * @param values 对应的值数组
 * @returns 期望值
 */
export function calculateExpectedValue(
  probabilities: number[],
  values: number[]
): number {
  if (probabilities.length !== values.length) {
    throw new Error('Probabilities and values must have the same length');
  }

  return probabilities.reduce(
    (sum, prob, i) => sum + prob * values[i],
    0
  );
}

/**
 * 计算二项分布概率
 * @param n 试验次数
 * @param k 成功次数
 * @param p 每次成功的概率
 * @returns 二项分布概率
 */
export function binomialProbability(n: number, k: number, p: number): number {
  return (
    calculateCombinations(n, k) *
    Math.pow(p, k) *
    Math.pow(1 - p, n - k)
  );
}

/**
 * 计算号码的和值
 * @param numbers 号码数组
 * @returns 和值
 */
export function calculateSum(numbers: number[]): number {
  return numbers.reduce((sum, n) => sum + n, 0);
}

/**
 * 计算号码的AC值（数字复杂指数）
 * AC值反映号码组合的复杂程度
 * @param numbers 号码数组（需排序）
 * @returns AC值
 */
export function calculateACValue(numbers: number[]): number {
  const differences: number[] = [];

  for (let i = 0; i < numbers.length; i++) {
    for (let j = i + 1; j < numbers.length; j++) {
      differences.push(Math.abs(numbers[i] - numbers[j]));
    }
  }

  const uniqueDifferences = new Set(differences);
  return uniqueDifferences.size - (numbers.length - 1);
}

/**
 * 分析号码的奇偶比例
 * @param numbers 号码数组
 * @returns 奇数比例（0-1）
 */
export function analyzeOddEvenRatio(numbers: number[]): number {
  const oddCount = numbers.filter(n => n % 2 === 1).length;
  return oddCount / numbers.length;
}

/**
 * 分析号码的大小比例（以中位数为界）
 * @param numbers 号码数组
 * @param max 最大值
 * @returns 大数比例（0-1）
 */
export function analyzeHighLowRatio(numbers: number[], max: number): number {
  const mid = Math.floor(max / 2);
  const highCount = numbers.filter(n => n > mid).length;
  return highCount / numbers.length;
}

/**
 * 分析连号数量
 * @param numbers 已排序的号码数组
 * @returns 连号对数
 */
export function analyzeConsecutiveNumbers(numbers: number[]): number {
  let consecutive = 0;
  for (let i = 1; i < numbers.length; i++) {
    if (numbers[i] === numbers[i - 1] + 1) {
      consecutive++;
    }
  }
  return consecutive;
}
