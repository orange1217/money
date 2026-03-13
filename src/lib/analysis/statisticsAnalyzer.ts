import { LotteryType } from '@/lib/lottery/types';
import type { HistoricalDraw, NumberFrequency, StatisticsSummary } from '@/types/analysis';

/**
 * Number range configuration for analysis
 */
const NUMBER_RANGES: Record<LotteryType, { min: number; max: number; median: number }> = {
  [LotteryType.DOUBLE_COLOR]: { min: 1, max: 33, median: 17 },
  [LotteryType.SUPER_LOTTO]: { min: 1, max: 35, median: 18 },
  [LotteryType.HAPPY_8]: { min: 1, max: 80, median: 40 },
  [LotteryType.FUCAI_3D]: { min: 0, max: 9, median: 4.5 }
};

/**
 * Statistics analyzer for historical lottery data
 */
export class StatisticsAnalyzer {
  /**
   * Calculate frequency of each number across all draws
   */
  static calculateFrequency(draws: HistoricalDraw[], type: LotteryType | 'all' = 'all'): NumberFrequency[] {
    const frequencyMap = new Map<number, number>();
    const lastSeenMap = new Map<number, string>();
    const totalDraws = type === 'all' ? draws.length : draws.filter(d => d.lotteryType === type).  length;

    const drawsToAnalyze = type === 'all'
      ? draws
      : draws.filter(d => d.lotteryType === type);

    // Count occurrences and track last seen
    drawsToAnalyze.forEach(draw => {
      [...draw.numbers, ...(draw.specialNumbers || [])].forEach(num => {
        frequencyMap.set(num, (frequencyMap.get(num) || 0) + 1);
        lastSeenMap.set(num, draw.drawDate);
      });
    });

    // Calculate consecutive misses
    const allNumbers = this.getNumberRange(type === 'all' ? LotteryType.DOUBLE_COLOR : type);
    const result: NumberFrequency[] = [];

    allNumbers.forEach(num => {
      const count = frequencyMap.get(num) || 0;
      const percentage = totalDraws > 0 ? (count / totalDraws) * 100 : 0;
      const lastSeen = lastSeenMap.get(num);

      // Calculate consecutive misses
      let consecutiveMisses = 0;
      for (let i = drawsToAnalyze.length - 1; i >= 0; i--) {
        const draw = drawsToAnalyze[i];
        const hasNumber = draw.numbers.includes(num) || (draw.specialNumbers?.includes(num) ?? false);
        if (hasNumber) break;
        consecutiveMisses++;
      }

      result.push({
        number: num,
        count,
        percentage: Math.round(percentage * 10) / 10,
        lastSeen,
        consecutiveMisses
      });
    });

    return result.sort((a, b) => b.count - a.count);
  }

  /**
   * Get hot numbers (most frequent)
   */
  static getHotNumbers(frequency: NumberFrequency[], count: number = 10): NumberFrequency[] {
    return [...frequency].sort((a, b) => b.count - a.count).slice(0, count);
  }

  /**
   * Get cold numbers (least frequent)
   */
  static getColdNumbers(frequency: NumberFrequency[], count: number = 10): NumberFrequency[] {
    return [...frequency]
      .sort((a, b) => {
        if (a.count !== b.count) return a.count - b.count;
        return b.consecutiveMisses - a.consecutiveMisses; // Higher miss count = colder
      })
      .slice(0, count);
  }

  /**
   * Calculate odd/even ratio
   */
  static calculateOddEvenRatio(numbers: number[]): { odd: number; even: number } {
    const odd = numbers.filter(n => n % 2 === 1).length;
    const even = numbers.length - odd;
    return { odd, even };
  }

  /**
   * Calculate high/low ratio based on median
   */
  static calculateHighLowRatio(numbers: number[], max: number): { high: number; low: number } {
    const median = Math.floor(max / 2);
    const high = numbers.filter(n => n > median).length;
    const low = numbers.length - high;
    return { high, low };
  }

  /**
   * Calculate sum statistics
   */
  static calculateSumStats(draws: HistoricalDraw[]): { min: number; max: number; avg: number; sums: number[] } {
    const sums = draws.map(draw =>
      draw.numbers.reduce((sum, n) => sum + n, 0)
    );

    if (sums.length === 0) {
      return { min: 0, max: 0, avg: 0, sums: [] };
    }

    const min = Math.min(...sums);
    const max = Math.max(...sums);
    const avg = Math.round((sums.reduce((a, b) => a + b, 0) / sums.length) * 10) / 10;

    return { min, max, avg, sums };
  }

  /**
   * Calculate sum trend direction
   */
  static getSumTrend(sums: number[]): 'up' | 'down' | 'flat' {
    if (sums.length < 10) return 'flat';

    const recent = sums.slice(-5);
    const historical = sums.slice(0, -5);
    const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
    const historicalAvg = historical.reduce((a, b) => a + b, 0) / historical.length;

    const diff = recentAvg - historicalAvg;
    const threshold = historicalAvg * 0.05; // 5% threshold

    if (Math.abs(diff) < threshold) return 'flat';
    return diff > 0 ? 'up' : 'down';
  }

  /**
   * Generate complete statistics summary
   */
  static generateSummary(draws: HistoricalDraw[], filterType: LotteryType | 'all' = 'all'): StatisticsSummary {
    if (draws.length === 0) {
      return {
        totalDraws: 0,
        dateRange: { start: '', end: '' },
        hotNumbers: [],
        coldNumbers: [],
        oddEvenRatio: { odd: 0, even: 0 },
        highLowRatio: { high: 0, low: 0 },
        sumStats: { min: 0, max: 0, avg: 0 },
        sumTrend: 'flat'
      };
    }

    const filteredDraws = filterType === 'all'
      ? draws
      : draws.filter(d => d.lotteryType === filterType);

    // Calculate date range
    const dates = filteredDraws.map(d => new Date(d.drawDate).getTime()).sort((a, b) => a - b);
    const dateRange = {
      start: new Date(dates[0]).toISOString().split('T')[0],
      end: new Date(dates[dates.length - 1]).toISOString().split('T')[0]
    };

    // Get frequency data
    const frequency = this.calculateFrequency(filteredDraws, filterType);
    const hotNumbers = this.getHotNumbers(frequency, 10);
    const coldNumbers = this.getColdNumbers(frequency, 10);

    // Calculate ratios
    const allNumbers = filteredDraws.flatMap(d => d.numbers);
    const oddEvenRatio = this.calculateOddEvenRatio(allNumbers);

    // Get max number for high/low calculation
    const type = filterType === 'all' ? LotteryType.DOUBLE_COLOR : filterType;
    const { max } = NUMBER_RANGES[type];
    const highLowRatio = this.calculateHighLowRatio(allNumbers, max);

    // Calculate sum stats
    const { min, max: sumMax, avg, sums } = this.calculateSumStats(filteredDraws);
    const sumTrend = this.getSumTrend(sums);

    return {
      totalDraws: filteredDraws.length,
      dateRange,
      hotNumbers,
      coldNumbers,
      oddEvenRatio,
      highLowRatio,
      sumStats: { min, max: sumMax, avg },
      sumTrend
    };
  }

  /**
   * Get number range for a lottery type
   */
  private static getNumberRange(type: LotteryType): number[] {
    const config = NUMBER_RANGES[type];
    const range: number[] = [];
    for (let i = config.min; i <= config.max; i++) {
      range.push(i);
    }
    return range;
  }
}
