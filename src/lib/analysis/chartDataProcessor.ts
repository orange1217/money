import { HistoricalDraw } from '@/types/analysis';

/**
 * Data point for charts
 */
export interface ChartDataPoint {
  name: string | number;
  value: number;
  [key: string]: any;
}

/**
 * Pie data point
 */
export interface PieDataPoint {
  name: string;
  value: number;
  color: string;
}

/**
 * Trend data point
 */
export interface TrendDataPoint {
  date: string;
  sum: number;
  rollingAvg: number;
}

/**
 * Heat map cell
 */
export interface HeatmapCell {
  number: number;
  count: number;
  misses: number;
  intensity: 'low' | 'medium' | 'high' | 'very-high';
}

/**
 * Color constants for charts
 */
export const CHART_COLORS = {
  hot: '#ef4444',
  medium: '#eab308',
  cold: '#3b82f6',
  odd: '#ef4444',
  even: '#3b82f6',
  heatLow: '#86efac',
  heatMed: '#fde047',
  heatHigh: '#fdba74',
  heatVeryHigh: '#fca5a5'
} as const;

/**
 * Chart data processor
 */
export class ChartDataProcessor {
  /**
   * Prepare frequency data for bar chart
   */
  static prepareFrequencyData(frequency: Array<{ number: number; count: number }>): ChartDataPoint[] {
    return frequency.map(item => ({
      name: item.number,
      value: item.count
    }));
  }

  /**
   * Get color for frequency bar
   */
  static getFrequencyColor(count: number, maxCount: number): string {
    const percentage = count / maxCount;
    if (percentage >= 0.8) return CHART_COLORS.hot;
    if (percentage >= 0.4) return CHART_COLORS.medium;
    return CHART_COLORS.cold;
  }

  /**
   * Prepare sum trend data for line chart
   */
  static prepareSumTrendData(draws: HistoricalDraw[]): TrendDataPoint[] {
    if (draws.length === 0) return [];

    // Sort by date
    const sortedDraws = [...draws].sort((a, b) =>
      new Date(a.drawDate).getTime() - new Date(b.drawDate).getTime()
    );

    const sums = sortedDraws.map(draw => ({
      date: draw.drawDate,
      drawNumber: draw.drawNumber,
      sum: draw.numbers.reduce((s, n) => s + n, 0)
    }));

    // Calculate 10-draw rolling average
    const windowSize = 10;
    const result: TrendDataPoint[] = [];

    for (let i = 0; i < sums.length; i++) {
      const start = Math.max(0, i - windowSize + 1);
      const window = sums.slice(start, i + 1);
      const rollingAvg = window.reduce((s, d) => s + d.sum, 0) / window.length;

      result.push({
        date: sums[i].date,
        sum: sums[i].sum,
        rollingAvg: Math.round(rollingAvg * 10) / 10
      });
    }

    return result;
  }

  /**
   * Prepare odd/even data for pie chart
   */
  static prepareOddEvenData(odd: number, even: number): PieDataPoint[] {
    return [
      { name: '奇数', value: odd, color: CHART_COLORS.odd },
      { name: '偶数', value: even, color: CHART_COLORS.even }
    ];
  }

  /**
   * Prepare heat map data for missing numbers
   */
  static prepareHeatmapData(
    missing: Array<{ number: number; misses: number }>,
    maxMisses: number
  ): HeatmapCell[] {
    return missing.map(item => {
      const percentage = item.misses / maxMisses;
      let intensity: HeatmapCell['intensity'];

      if (percentage >= 0.75) intensity = 'very-high';
      else if (percentage >= 0.5) intensity = 'high';
      else if (percentage >= 0.25) intensity = 'medium';
      else intensity = 'low';

      return {
        number: item.number,
        count: item.misses,
        misses: item.misses,
        intensity
      };
    });
  }

  /**
   * Get heat map color by intensity
   */
  static getHeatmapColor(intensity: HeatmapCell['intensity']): string {
    switch (intensity) {
      case 'low':
        return CHART_COLORS.heatLow;
      case 'medium':
        return CHART_COLORS.heatMed;
      case 'high':
        return CHART_COLORS.heatHigh;
      case 'very-high':
        return CHART_COLORS.heatVeryHigh;
    }
  }

  /**
   * Prepare data for high/low pie chart
   */
  static prepareHighLowData(high: number, low: number): PieDataPoint[] {
    return [
      { name: '大号', value: high, color: '#f97316' },
      { name: '小号', value: low, color: '#22c55e' }
    ];
  }
}
