import { LotteryType } from '@/lib/lottery/types';

/**
 * Historical draw record
 */
export interface HistoricalDraw {
  id: string;
  lotteryType: LotteryType;
  drawNumber: string;            // e.g., "2024001"
  drawDate: string;              // YYYY-MM-DD
  numbers: number[];
  specialNumbers?: number[];
  createdAt: number;
}

/**
 * Number frequency analysis result
 */
export interface NumberFrequency {
  number: number;
  count: number;
  percentage: number;
  lastSeen?: string;
  consecutiveMisses: number;
}

/**
 * Statistics summary for historical data
 */
export interface StatisticsSummary {
  totalDraws: number;
  dateRange: { start: string; end: string };
  hotNumbers: NumberFrequency[];
  coldNumbers: NumberFrequency[];
  oddEvenRatio: { odd: number; even: number };
  highLowRatio: { high: number; low: number };
  sumStats: { min: number; max: number; avg: number };
  sumTrend: 'up' | 'down' | 'flat';
}

/**
 * Advanced metrics for historical data
 */
export interface AdvancedMetrics {
  consecutivePatterns: number[];      // Frequency of 2-consecutive, 3-consecutive, etc.
  acValueDistribution: Record<number, number>;
  repeatNumberRate: number;           // % of draws with repeated numbers from previous
  missingNumbers: { number: number; misses: number }[];
  zoneDistribution: ZoneDistribution;
}

/**
 * Zone distribution for number ranges
 */
export interface ZoneDistribution {
  zones: { name: string; range: [number, number]; count: number; percentage: number }[];
}

/**
 * Recommendation result
 */
export interface RecommendationResult {
  strategy: string;
  reasoning: string;
  numbers: number[];
  specialNumbers?: number[];
  confidence: number;  // 0-100
}

/**
 * Storage data structure
 */
export interface StorageData {
  version: number;
  enabled: boolean;
  draws: HistoricalDraw[];
}

/**
 * Validation result for form inputs
 */
export interface ValidationResult {
  valid: boolean;
  errors: Record<string, string>;
}

/**
 * Number range configuration for each lottery type
 */
export interface NumberRangeConfig {
  mainRange: [number, number];
  mainCount: number;
  specialRange?: [number, number];
  specialCount?: number;
  allowDuplicates: boolean;
}
