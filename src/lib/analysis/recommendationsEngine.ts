import { LotteryType } from '@/lib/lottery/types';
import { HistoricalDraw, RecommendationResult } from '@/types/analysis';
import { StatisticsAnalyzer } from './statisticsAnalyzer';

/**
 * Number range configuration
 */
const NUMBER_CONFIG: Record<LotteryType | 'all', {
  mainRange: readonly [number, number];
  mainCount: number;
  specialRange?: readonly [number, number];
  specialCount?: number;
}> = {
  ['all']: {
    mainRange: [1, 33] as const,
    mainCount: 6,
    specialRange: [1, 16] as const,
    specialCount: 1
  },
  [LotteryType.DOUBLE_COLOR]: {
    mainRange: [1, 33] as const,
    mainCount: 6,
    specialRange: [1, 16] as const,
    specialCount: 1
  },
  [LotteryType.SUPER_LOTTO]: {
    mainRange: [1, 35] as const,
    mainCount: 5,
    specialRange: [1, 12] as const,
    specialCount: 2
  },
  [LotteryType.HAPPY_8]: {
    mainRange: [1, 80] as const,
    mainCount: 10
  },
  [LotteryType.FUCAI_3D]: {
    mainRange: [0, 9] as const,
    mainCount: 3
  }
};

/**
 * Recommendation strategies engine
 */
export class RecommendationsEngine {
  /**
   * Calculate confidence score based on data size
   */
  static calculateConfidence(draws: HistoricalDraw[]): number {
    const baseScore = 50;
    const dataBonus = Math.min(draws.length * 0.5, 30);
    return Math.min(Math.round(baseScore + dataBonus), 100);
  }

  /**
   * Generate hot number strategy recommendation
   */
  static generateHotNumbers(draws: HistoricalDraw[], type: LotteryType | 'all'): RecommendationResult {
    const config = NUMBER_CONFIG[type];
    const frequency = StatisticsAnalyzer.calculateFrequency(draws, type);
    const hotNumbers = StatisticsAnalyzer.getHotNumbers(frequency, config.mainCount * 2);

    // Select from hot numbers with some randomness
    const selected = this.selectNumbersWithWeights(
      hotNumbers.map(n => n.number),
      hotNumbers.map(n => n.count),
      config.mainCount
    );

    const specialNumbers = config.specialRange
      ? this.selectRandomNumbers(config.specialRange[0], config.specialRange[1], config.specialCount!)
      : undefined;

    return {
      strategy: '热号推荐',
      reasoning: `基于历史出现频率最高的 ${config.mainCount} 个号码，适合追逐热门号码策略。`,
      numbers: selected.sort((a, b) => a - b),
      specialNumbers,
      confidence: this.calculateConfidence(draws)
    };
  }

  /**
   * Generate cold number strategy recommendation
   */
  static generateColdNumbers(draws: HistoricalDraw[], type: LotteryType | 'all'): RecommendationResult {
    const config = NUMBER_CONFIG[type];
    const frequency = StatisticsAnalyzer.calculateFrequency(draws, type);
    const coldNumbers = StatisticsAnalyzer.getColdNumbers(frequency, config.mainCount * 3)
      .filter(n => n.consecutiveMisses > 10);

    // Select from cold numbers with bias toward high miss counts
    const selected = this.selectNumbersWithWeights(
      coldNumbers.map(n => n.number),
      coldNumbers.map(n => n.consecutiveMisses),
      config.mainCount
    );

    const specialNumbers = config.specialRange
      ? this.selectRandomNumbers(config.specialRange[0], config.specialRange[1], config.specialCount!)
      : undefined;

    return {
      strategy: '冷号追号',
      reasoning: `选择长期未出现的号码，适合"追号"策略。注意：冷号可能继续遗漏。`,
      numbers: selected.sort((a, b) => a - b),
      specialNumbers,
      confidence: Math.round(this.calculateConfidence(draws) * 0.7) // Lower confidence for cold strategy
    };
  }

  /**
   * Generate balanced strategy recommendation
   */
  static generateBalanced(draws: HistoricalDraw[], type: LotteryType | 'all'): RecommendationResult {
    const config = NUMBER_CONFIG[type];
    const frequency = StatisticsAnalyzer.calculateFrequency(draws, type);
    const hotNumbers = StatisticsAnalyzer.getHotNumbers(frequency, config.mainCount * 2);
    const coldNumbers = StatisticsAnalyzer.getColdNumbers(frequency, config.mainCount * 2);

    // Mix: 40% hot, 40% medium, 20% cold
    const hotCount = Math.ceil(config.mainCount * 0.4);
    const coldCount = Math.ceil(config.mainCount * 0.2);
    const mediumCount = config.mainCount - hotCount - coldCount;

    const selected = [
      ...this.selectNumbersWithWeights(
        hotNumbers.map(n => n.number),
        hotNumbers.map(n => n.count),
        hotCount
      ),
      ...this.selectNumbersFromMiddle(
        frequency.map(n => n.number),
        mediumCount
      ),
      ...this.selectNumbersWithWeights(
        coldNumbers.map(n => n.number),
        coldNumbers.map(n => n.consecutiveMisses),
        coldCount
      )
    ];

    // Ensure uniqueness and correct count
    const uniqueSelected = [...new Set(selected)].slice(0, config.mainCount);

    // Fill remaining with random if needed
    while (uniqueSelected.length < config.mainCount) {
      const randomNum = Math.floor(Math.random() * (config.mainRange[1] - config.mainRange[0] + 1)) + config.mainRange[0];
      if (!uniqueSelected.includes(randomNum)) {
        uniqueSelected.push(randomNum);
      }
    }

    const specialNumbers = config.specialRange
      ? this.selectRandomNumbers(config.specialRange[0], config.specialRange[1], config.specialCount!)
      : undefined;

    return {
      strategy: '平衡组合',
      reasoning: `综合热号、温号和冷号的平衡组合，兼顾历史数据和分布均匀性。`,
      numbers: uniqueSelected.sort((a, b) => a - b),
      specialNumbers,
      confidence: Math.round(this.calculateConfidence(draws) * 0.85)
    };
  }

  /**
   * Generate AC value optimized recommendation
   */
  static generateACOptimized(draws: HistoricalDraw[], type: LotteryType | 'all'): RecommendationResult {
    const config = NUMBER_CONFIG[type];

    // Get AC value distribution
    const acDistribution = StatisticsAnalyzer.getACValueDistribution(draws);
    const commonACValues = Object.entries(acDistribution)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([ac]) => parseInt(ac));

    // Generate multiple combinations and select one with good AC value
    let bestCombination: number[] = [];
    let bestAC = -1;

    for (let i = 0; i < 100; i++) {
      const numbers = this.selectRandomNumbers(
        config.mainRange[0],
        config.mainRange[1],
        config.mainCount
      );
      const ac = StatisticsAnalyzer.calculateACValue(numbers);

      // Prefer AC values that are common in history
      const acScore = commonACValues.includes(ac) ? 1 : 0.5;

      if (ac * acScore > bestAC) {
        bestAC = ac * acScore;
        bestCombination = numbers;
      }
    }

    const specialNumbers = config.specialRange
      ? this.selectRandomNumbers(config.specialRange[0], config.specialRange[1], config.specialCount!)
      : undefined;

    const finalAC = StatisticsAnalyzer.calculateACValue(bestCombination);

    return {
      strategy: 'AC值优化',
      reasoning: `基于历史AC值分布优化，当前组合AC值为${finalAC}，数字分布较为复杂。`,
      numbers: bestCombination.sort((a, b) => a - b),
      specialNumbers,
      confidence: Math.round(this.calculateConfidence(draws) * 0.75)
    };
  }

  /**
   * Generate all recommendations
   */
  static generateAll(draws: HistoricalDraw[], type: LotteryType | 'all'): RecommendationResult[] {
    if (draws.length === 0) {
      return [];
    }

    const filteredDraws = type === 'all' || draws.every(d => d.lotteryType === type)
      ? draws
      : draws.filter(d => d.lotteryType === type);

    if (filteredDraws.length === 0) {
      return [];
    }

    return [
      this.generateHotNumbers(filteredDraws, type),
      this.generateColdNumbers(filteredDraws, type),
      this.generateBalanced(filteredDraws, type),
      this.generateACOptimized(filteredDraws, type)
    ];
  }

  // ==================== HELPER METHODS ====================

  /**
   * Select numbers using weighted random selection
   */
  private static selectNumbersWithWeights(
    numbers: number[],
    weights: number[],
    count: number
  ): number[] {
    const selected: number[] = [];
    const available = numbers.map((n, i) => ({ number: n, weight: weights[i] || 1 }));

    for (let i = 0; i < count && available.length > 0; i++) {
      const totalWeight = available.reduce((sum, item) => sum + item.weight, 0);
      let random = Math.random() * totalWeight;

      for (let j = 0; j < available.length; j++) {
        random -= available[j].weight;
        if (random <= 0) {
          selected.push(available[j].number);
          available.splice(j, 1);
          break;
        }
      }
    }

    return selected;
  }

  /**
   * Select numbers from the middle of frequency distribution
   */
  private static selectNumbersFromMiddle(numbers: number[], count: number): number[] {
    const start = Math.floor(numbers.length * 0.3);
    const end = Math.floor(numbers.length * 0.7);
    const middle = numbers.slice(start, end);

    const selected: number[] = [];
    while (selected.length < count && middle.length > 0) {
      const index = Math.floor(Math.random() * middle.length);
      selected.push(middle.splice(index, 1)[0]);
    }

    return selected;
  }

  /**
   * Select random unique numbers from range
   */
  private static selectRandomNumbers(min: number, max: number, count: number): number[] {
    const selected: number[] = [];
    const available = Array.from({ length: max - min + 1 }, (_, i) => i + min);

    while (selected.length < count && available.length > 0) {
      const index = Math.floor(Math.random() * available.length);
      selected.push(available.splice(index, 1)[0]);
    }

    return selected.sort((a, b) => a - b);
  }
}
