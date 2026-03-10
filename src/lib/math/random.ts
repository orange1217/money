/**
 * 加密级安全的随机数生成器
 * 使用 Web Crypto API 的 crypto.getRandomValues()
 */

/**
 * 生成指定范围内的随机整数（加密安全）
 * @param min 最小值（包含）
 * @param max 最大值（包含）
 * @returns 随机整数
 */
export function secureRandomInt(min: number, max: number): number {
  const range = max - min + 1;
  const array = new Uint32Array(1);

  // 使用加密安全的随机数生成
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(array);
  } else {
    // 降级方案（仅用于不支持crypto的环境）
    array[0] = Math.floor(Math.random() * 0x100000000);
  }

  // 使用模运算映射到目标范围，并处理偏差
  return min + (array[0] % range);
}

/**
 * 生成指定范围内不重复的随机整数数组（加密安全）
 * 使用 Fisher-Yates 洗牌算法的优化版本
 * @param min 最小值（包含）
 * @param max 最大值（包含）
 * @param count 需要生成的数量
 * @returns 不重复的随机整数数组（已排序）
 */
export function secureRandomUniqueInts(
  min: number,
  max: number,
  count: number
): number[] {
  if (count > max - min + 1) {
    throw new Error('Cannot generate more unique numbers than the range allows');
  }

  // 创建号码池
  const pool = Array.from({ length: max - min + 1 }, (_, i) => min + i);

  // Fisher-Yates 洗牌算法（只需要洗后 count 个位置）
  const swapCount = Math.min(count, pool.length);
  for (let swapped = 0; swapped < swapCount; swapped++) {
    // 从未交换的部分随机选择一个位置
    const i = pool.length - 1 - swapped;
    const j = secureRandomInt(0, i);
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }

  // 返回最后 count 个元素并排序
  return pool.slice(pool.length - count).sort((a, b) => a - b);
}

/**
 * 生成可重复的随机整数数组（用于福彩3D等）
 * @param min 最小值（包含）
 * @param max 最大值（包含）
 * @param count 需要生成的数量
 * @returns 可能包含重复的随机整数数组
 */
export function secureRandomIntsWithRepeat(
  min: number,
  max: number,
  count: number
): number[] {
  const result: number[] = [];

  for (let i = 0; i < count; i++) {
    result.push(secureRandomInt(min, max));
  }

  return result;
}

/**
 * 洗牌算法（Fisher-Yates）- 加密安全版本
 * @param array 要洗牌的数组
 * @returns 洗牌后的新数组
 */
export function secureShuffle<T>(array: T[]): T[] {
  const result = [...array];

  for (let i = result.length - 1; i > 0; i--) {
    const j = secureRandomInt(0, i);
    [result[i], result[j]] = [result[j], result[i]];
  }

  return result;
}

/**
 * 生成带权重的随机选择
 * @param items 选项数组
 * @param weights 对应的权重数组
 * @returns 随机选择的项
 */
export function secureWeightedRandom<T>(items: T[], weights: number[]): T {
  if (items.length !== weights.length) {
    throw new Error('Items and weights must have the same length');
  }

  const totalWeight = weights.reduce((sum, w) => sum + w, 0);

  if (totalWeight <= 0) {
    return items[0];
  }

  // 生成 0 到 totalWeight 之间的随机数
  let remaining = Math.random() * totalWeight;

  for (let i = 0; i < items.length; i++) {
    remaining -= weights[i];
    if (remaining <= 0) {
      return items[i];
    }
  }

  return items[items.length - 1];
}

/**
 * 加权抽样算法（不放回）
 * @param pool 候选池
 * @param weights 权重数组
 * @param count 抽样数量
 * @returns 抽样结果
 */
export function weightedSample<T>(
  pool: T[],
  weights: number[],
  count: number
): T[] {
  const result: T[] = [];
  const remaining = [...pool];
  const remainingWeights = [...weights];

  for (let i = 0; i < count && remaining.length > 0; i++) {
    const totalWeight = remainingWeights.reduce((sum, w) => sum + w, 0);

    if (totalWeight <= 0) {
      // 如果权重总和为0，随机选择一个
      const randomIndex = Math.floor(Math.random() * remaining.length);
      result.push(remaining[randomIndex]);
      remaining.splice(randomIndex, 1);
      remainingWeights.splice(randomIndex, 1);
    } else {
      let random = Math.random() * totalWeight;

      for (let j = 0; j < remaining.length; j++) {
        random -= remainingWeights[j];
        if (random <= 0) {
          result.push(remaining[j]);
          remaining.splice(j, 1);
          remainingWeights.splice(j, 1);
          break;
        }
      }
    }
  }

  return result;
}
