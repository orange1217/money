import { LotteryType } from '@/lib/lottery/types';
import { HistoricalDraw } from '@/types/analysis';
import { historicalStorage } from './historicalStorage';

/**
 * Sample historical data for testing
 */
const SAMPLE_DRAWS: Omit<HistoricalDraw, 'id' | 'createdAt'>[] = [
  // 双色球 samples
  {
    lotteryType: LotteryType.DOUBLE_COLOR,
    drawNumber: '2024001',
    drawDate: '2024-01-01',
    numbers: [3, 8, 12, 17, 22, 28],
    specialNumbers: [5]
  },
  {
    lotteryType: LotteryType.DOUBLE_COLOR,
    drawNumber: '2024002',
    drawDate: '2024-01-04',
    numbers: [5, 11, 14, 19, 26, 31],
    specialNumbers: [12]
  },
  {
    lotteryType: LotteryType.DOUBLE_COLOR,
    drawNumber: '2024003',
    drawDate: '2024-01-08',
    numbers: [2, 9, 15, 20, 25, 30],
    specialNumbers: [8]
  },
  {
    lotteryType: LotteryType.DOUBLE_COLOR,
    drawNumber: '2024004',
    drawDate: '2024-01-11',
    numbers: [6, 13, 18, 23, 27, 32],
    specialNumbers: [3]
  },
  {
    lotteryType: LotteryType.DOUBLE_COLOR,
    drawNumber: '2024005',
    drawDate: '2024-01-15',
    numbers: [1, 10, 16, 21, 24, 29],
    specialNumbers: [15]
  },
  {
    lotteryType: LotteryType.DOUBLE_COLOR,
    drawNumber: '2024006',
    drawDate: '2024-01-18',
    numbers: [4, 12, 17, 22, 28, 33],
    specialNumbers: [7]
  },
  {
    lotteryType: LotteryType.DOUBLE_COLOR,
    drawNumber: '2024007',
    drawDate: '2024-01-22',
    numbers: [7, 14, 19, 25, 31, 2],
    specialNumbers: [11]
  },
  {
    lotteryType: LotteryType.DOUBLE_COLOR,
    drawNumber: '2024008',
    drawDate: '2024-01-25',
    numbers: [9, 13, 20, 26, 30, 5],
    specialNumbers: [4]
  },
  {
    lotteryType: LotteryType.DOUBLE_COLOR,
    drawNumber: '2024009',
    drawDate: '2024-01-29',
    numbers: [3, 11, 18, 24, 29, 32],
    specialNumbers: [9]
  },
  {
    lotteryType: LotteryType.DOUBLE_COLOR,
    drawNumber: '2024010',
    drawDate: '2024-02-01',
    numbers: [8, 15, 21, 27, 33, 6],
    specialNumbers: [14]
  },
  {
    lotteryType: LotteryType.DOUBLE_COLOR,
    drawNumber: '2024011',
    drawDate: '2024-02-05',
    numbers: [2, 10, 16, 23, 28, 31],
    specialNumbers: [1]
  },
  {
    lotteryType: LotteryType.DOUBLE_COLOR,
    drawNumber: '2024012',
    drawDate: '2024-02-08',
    numbers: [5, 12, 19, 25, 30, 4],
    specialNumbers: [13]
  },

  // 大乐透 samples
  {
    lotteryType: LotteryType.SUPER_LOTTO,
    drawNumber: '2024001',
    drawDate: '2024-01-02',
    numbers: [3, 12, 18, 25, 31],
    specialNumbers: [4, 9]
  },
  {
    lotteryType: LotteryType.SUPER_LOTTO,
    drawNumber: '2024002',
    drawDate: '2024-01-06',
    numbers: [7, 14, 22, 28, 35],
    specialNumbers: [2, 11]
  },
  {
    lotteryType: LotteryType.SUPER_LOTTO,
    drawNumber: '2024003',
    drawDate: '2024-01-10',
    numbers: [5, 11, 19, 26, 33],
    specialNumbers: [6, 8]
  },
  {
    lotteryType: LotteryType.SUPER_LOTTO,
    drawNumber: '2024004',
    drawDate: '2024-01-14',
    numbers: [2, 17, 24, 29, 32],
    specialNumbers: [3, 10]
  },
  {
    lotteryType: LotteryType.SUPER_LOTTO,
    drawNumber: '2024005',
    drawDate: '2024-01-18',
    numbers: [9, 15, 21, 27, 34],
    specialNumbers: [5, 12]
  },

  // 快乐8 samples
  {
    lotteryType: LotteryType.HAPPY_8,
    drawNumber: '2024001',
    drawDate: '2024-01-01',
    numbers: [3, 8, 15, 22, 31, 42, 53, 61, 74, 79]
  },
  {
    lotteryType: LotteryType.HAPPY_8,
    drawNumber: '2024002',
    drawDate: '2024-01-02',
    numbers: [5, 12, 19, 28, 35, 44, 56, 67, 73, 80]
  },
  {
    lotteryType: LotteryType.HAPPY_8,
    drawNumber: '2024003',
    drawDate: '2024-01-03',
    numbers: [7, 14, 23, 32, 41, 50, 59, 68, 76, 78]
  },
  {
    lotteryType: LotteryType.HAPPY_8,
    drawNumber: '2024004',
    drawDate: '2024-01-04',
    numbers: [2, 11, 20, 29, 38, 47, 58, 69, 72, 77]
  },
  {
    lotteryType: LotteryType.HAPPY_8,
    drawNumber: '2024005',
    drawDate: '2024-01-05',
    numbers: [6, 16, 25, 34, 43, 52, 63, 70, 75, 80]
  },

  // 福彩3D samples
  {
    lotteryType: LotteryType.FUCAI_3D,
    drawNumber: '2024001',
    drawDate: '2024-01-01',
    numbers: [3, 7, 2]
  },
  {
    lotteryType: LotteryType.FUCAI_3D,
    drawNumber: '2024002',
    drawDate: '2024-01-02',
    numbers: [8, 1, 5]
  },
  {
    lotteryType: LotteryType.FUCAI_3D,
    drawNumber: '2024003',
    drawDate: '2024-01-03',
    numbers: [4, 9, 6]
  },
  {
    lotteryType: LotteryType.FUCAI_3D,
    drawNumber: '2024004',
    drawDate: '2024-01-04',
    numbers: [2, 5, 8]
  },
  {
    lotteryType: LotteryType.FUCAI_3D,
    drawNumber: '2024005',
    drawDate: '2024-01-05',
    numbers: [7, 0, 3]
  }
];

/**
 * Add sample data to localStorage
 */
export function addSampleData(): HistoricalDraw[] {
  const data = historicalStorage.load();

  // Filter out draws that already exist (by draw number)
  const existingNumbers = new Set(data.draws.map(d => `${d.lotteryType}-${d.drawNumber}`));
  const newDraws = SAMPLE_DRAWS.filter(d => !existingNumbers.has(`${d.lotteryType}-${d.drawNumber}`));

  // Create full draw objects with id and timestamp
  const drawsToCreate: HistoricalDraw[] = newDraws.map(draw => ({
    ...draw,
    id: crypto.randomUUID?.() || Math.random().toString(36).substring(2, 15),
    createdAt: Date.now()
  }));

  // Add to storage
  drawsToCreate.forEach(draw => historicalStorage.addDraw(draw));

  return [...data.draws, ...drawsToCreate];
}

/**
 * Clear all sample data (and all other data)
 */
export function clearAllData(): void {
  historicalStorage.clearAll();
}

/**
 * Check if sample data exists
 */
export function hasSampleData(): boolean {
  const data = historicalStorage.load();
  const sampleNumbers = new Set(SAMPLE_DRAWS.map(d => `${d.lotteryType}-${d.drawNumber}`));
  return data.draws.some(d => sampleNumbers.has(`${d.lotteryType}-${d.drawNumber}`));
}
