# Historical Lottery Analysis - Implementation Plan

**Based on:** 2026-03-13-historical-analysis-design.md
**Created:** 2026-03-13
**Estimated Effort:** ~3-5 days

## Overview

This plan breaks down the historical lottery analysis feature into 5 phases, each with specific file changes and implementation tasks.

## Phase 1: Core Infrastructure

### 1.1 Install Dependencies

```bash
npm install recharts
```

**Files to modify:** `package.json`

### 1.2 Add Type Definitions

**Create:** `src/types/analysis.ts`

```typescript
// Copy from spec Section 4.1
export interface HistoricalDraw { ... }
export interface NumberFrequency { ... }
export interface StatisticsSummary { ... }
export interface AdvancedMetrics { ... }
export interface RecommendationResult { ... }
export interface StorageData { ... }
```

### 1.3 Setup Routing

**Modify:** `src/main.tsx`
- Add BrowserRouter wrapper

**Modify:** `src/App.tsx`
- Add Routes and Route components
- Add navigation tabs between generator and analysis

**New structure:**
```tsx
<BrowserRouter>
  <div className="min-h-screen ...">
    <nav className="nav-tabs">
      <Link to="/">号码生成</Link>
      <Link to="/analysis">历史分析</Link>
    </nav>
    <Routes>
      <Route path="/" element={<LotteryGenerator />} />
      <Route path="/analysis" element={<HistoricalAnalysisPage />} />
    </Routes>
  </div>
</BrowserRouter>
```

### 1.4 Create Storage Module

**Create:** `src/lib/analysis/historicalStorage.ts`

```typescript
const STORAGE_KEY = "lottery_historical_data";
const CURRENT_VERSION = 1;

export const historicalStorage = {
  load(): StorageData { ... }
  save(data: StorageData): void { ... }
  addDraw(draw: HistoricalDraw): void { ... }
  removeDraw(id: string): void { ... }
  clearAll(): void { ... }
  setEnabled(enabled: boolean): void { ... }
  migrate(rawData: string): StorageData { ... }
};
```

**Acceptance:**
- [ ] localStorage read/write works
- [ ] Migration handles v0 to v1
- [ ] Can navigate between `/` and `/analysis`

---

## Phase 2: Input Form and Draw List

### 2.1 Create Historical Analysis Page Shell

**Create:** `src/components/analysis/HistoricalAnalysisPage.tsx`

```tsx
export function HistoricalAnalysisPage() {
  const [draws, setDraws] = useState<HistoricalDraw[]>([]);
  const [selectedType, setSelectedType] = useState<LotteryType | 'all'>('all');

  useEffect(() => {
    // Load from storage on mount
    const data = historicalStorage.load();
    if (data.enabled) {
      setDraws(data.draws);
    }
  }, []);

  return (
    <div className="container mx-auto ...">
      <h1>历史开奖分析</h1>
      <DrawInputForm onSubmit={handleAddDraw} />
      <DrawList draws={filteredDraws} onDelete={handleDelete} />
      {draws.length >= 1 && <AnalysisDashboard draws={filteredDraws} />}
    </div>
  );
}
```

### 2.2 Create Draw Input Form

**Create:** `src/components/analysis/DrawInputForm.tsx`

**Components:**
- Lottery type dropdown
- Draw number text input
- Date picker
- Dynamic number inputs based on type
- Persist toggle
- Submit button

**Validation logic:**
```typescript
const validateDraw = (
  type: LotteryType,
  drawNumber: string,
  numbers: number[],
  specialNumbers?: number[]
): ValidationResult => {
  // Check draw number format: ^\d{4}\d{3,4}$
  // Check number ranges per type (see spec Section 5.1)
  // Check for duplicates (except 福彩3D)
  // Check date not in future
};
```

**State:**
```typescript
interface FormState {
  lotteryType: LotteryType;
  drawNumber: string;
  drawDate: string;
  numbers: number[];
  specialNumbers?: number[];
  persistEnabled: boolean;
  errors: Record<string, string>;
}
```

**Acceptance:**
- [ ] Form validates all inputs correctly
- [ ] Dynamic inputs update when lottery type changes
- [ ] Submit adds draw to list
- [ ] Errors show inline
- [ ] Works for all 4 lottery types

### 2.3 Create Draw List

**Create:** `src/components/analysis/DrawList.tsx`

**Features:**
- Table layout (desktop) / card layout (mobile)
- Columns: 期号, 日期, 号码, 操作
- Delete button per row with confirmation
- Bulk delete button
- Filter by lottery type
- Sort by date toggle
- Search by draw number
- Empty state

**Props:**
```typescript
interface DrawListProps {
  draws: HistoricalDraw[];
  onDelete: (id: string) => void;
  onClearAll: () => void;
  filterType: LotteryType | 'all';
  onFilterChange: (type: LotteryType | 'all') => void;
}
```

**Acceptance:**
- [ ] Table displays draws correctly
- [ ] Delete works with confirmation
- [ ] Filter by lottery type works
- [ ] Sort and search work
- [ ] Responsive on mobile

---

## Phase 3: Basic Statistics Panel

### 3.1 Create Statistics Analyzer Module

**Create:** `src/lib/analysis/statisticsAnalyzer.ts`

```typescript
export class StatisticsAnalyzer {
  static calculateFrequency(draws: HistoricalDraw[]): NumberFrequency[] { ... }
  static getHotNumbers(frequency: NumberFrequency[], count: number): NumberFrequency[] { ... }
  static getColdNumbers(frequency: NumberFrequency[], count: number): NumberFrequency[] { ... }
  static calculateOddEvenRatio(numbers: number[]): { odd: number; even: number } { ... }
  static calculateHighLowRatio(numbers: number[], max: number): { high: number; low: number } { ... }
  static calculateSumStats(numbers: number[][]): { min: number; max: number; avg: number } { ... }
  static getTrendIndicator(recentSums: number[], historicalAvg: number): 'up' | 'down' | 'flat' { ... }
  static generateSummary(draws: HistoricalDraw[]): StatisticsSummary { ... }
}
```

### 3.2 Create Statistics Panel Component

**Create:** `src/components/analysis/StatisticsPanel.tsx`

**Sub-components (internal):**
- DataOverviewCard
- HotNumbersCard
- ColdNumbersCard
- OddEvenDistributionCard
- HighLowDistributionCard
- SumStatsCard

**Props:**
```typescript
interface StatisticsPanelProps {
  draws: HistoricalDraw[];
}
```

**Display logic:**
- Calculate stats from analyzer
- Show warning if draws < 10
- Empty state if no draws

**Acceptance:**
- [ ] All 6 sections render correctly
- [ ] Hot numbers sorted by frequency
- [ ] Cold numbers show miss counts
- [ ] Trend indicator displays correctly
- [ ] Warning shows for <10 draws
- [ ] Empty state shows when no data

---

## Phase 4: Advanced Analysis

### 4.1 Extend Statistics Analyzer

**Modify:** `src/lib/analysis/statisticsAnalyzer.ts`

Add methods:
```typescript
static analyzeConsecutivePatterns(draws: HistoricalDraw[]): number[] { ... }
static calculateACValue(numbers: number[]): number { ... }
static getACValueDistribution(draws: HistoricalDraw[]): Record<number, number> { ... }
static calculateRepeatRate(draws: HistoricalDraw[]): number { ... }
static getMissingNumbers(draws: HistoricalDraw[]): { number: number; misses: number }[] { ... }
static getZoneDistribution(draws: HistoricalDraw[], type: LotteryType): ZoneDistribution { ... }
static generateAdvancedMetrics(draws: HistoricalDraw[]): AdvancedMetrics { ... }
```

### 4.2 Create Advanced Analysis Panel

**Create:** `src/components/analysis/AdvancedAnalysisPanel.tsx`

**Sub-components (internal):**
- ConsecutivePatternsCard
- ACValueDistributionCard
- RepeatAnalysisCard
- MissingNumbersCard
- ZoneDistributionCard

**Zone definitions** (from spec):
```typescript
const ZONES = {
  [LotteryType.DOUBLE_COLOR]: [
    { name: '一区', range: [1, 11] },
    { name: '二区', range: [12, 22] },
    { name: '三区', range: [23, 33] }
  ],
  // ... other types
};
```

**Acceptance:**
- [ ] All 5 sections render correctly
- [ ] Zone definitions match spec
- [ ] AC values calculate correctly
- [ ] Missing numbers tracked correctly

---

## Phase 5: Charts and Recommendations

### 5.1 Create Chart Data Processor

**Create:** `src/lib/analysis/chartDataProcessor.ts`

```typescript
export class ChartDataProcessor {
  static prepareFrequencyData(frequency: NumberFrequency[]): ChartDataPoint[] { ... }
  static prepareSumTrendData(draws: HistoricalDraw[]): { date: string; sum: number; rollingAvg: number }[] { ... }
  static prepareOddEvenData(stats: StatisticsSummary): PieDataPoint[] { ... }
  static prepareHeatmapData(draws: HistoricalDraw[]): HeatmapCell[] { ... }
}
```

### 5.2 Create Charts Panel

**Create:** `src/components/analysis/ChartsPanel.tsx`

**Import Recharts components:**
```tsx
import { BarChart, LineChart, PieChart, Cell, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
```

**Charts:**
1. FrequencyBarChart
2. SumTrendLineChart
3. OddEvenPieChart
4. MissHeatmap (custom grid component)

**Color constants:**
```typescript
const CHART_COLORS = {
  hot: '#ef4444',
  medium: '#eab308',
  cold: '#3b82f6',
  odd: '#ef4444',
  even: '#3b82f6',
  heatLow: '#86efac',
  heatMed: '#fde047',
  heatHigh: '#fdba74',
  heatVeryHigh: '#fca5a5'
};
```

**Acceptance:**
- [ ] All 4 chart types render
- [ ] Charts responsive on mobile
- [ ] Tooltips show correct data
- [ ] Loading states work
- [ ] Empty states show correctly

### 5.3 Create Recommendations Module

**Create:** `src/lib/analysis/recommendationsEngine.ts`

```typescript
export class RecommendationsEngine {
  static generateHotNumbers(draws: HistoricalDraw[], type: LotteryType): RecommendationResult { ... }
  static generateColdNumbers(draws: HistoricalDraw[], type: LotteryType): RecommendationResult { ... }
  static generateBalanced(draws: HistoricalDraw[], type: LotteryType): RecommendationResult { ... }
  static generateACOptimized(draws: HistoricalDraw[], type: LotteryType): RecommendationResult { ... }
  static calculateConfidence(draws: HistoricalDraw[]): number {
    const baseScore = 50;
    const dataBonus = Math.min(draws.length * 0.5, 30);
    // ... rest of formula from spec
  }
}
```

### 5.4 Create Recommendations Panel

**Create:** `src/components/analysis/RecommendationsPanel.tsx`

**RecommendationCard component:**
```tsx
interface RecommendationCardProps {
  result: RecommendationResult;
  onCopy: (numbers: number[]) => void;
  onUse: (numbers: number[], type: LotteryType) => void;
}
```

**Integration with generator:**
```typescript
const handleUse = (numbers: number[], type: LotteryType) => {
  navigate('/', {
    state: { prefillNumbers: numbers, lotteryType: type }
  });
};
```

**Acceptance:**
- [ ] All 4 strategies generate recommendations
- [ ] Confidence scores calculate correctly
- [ ] Copy button copies to clipboard
- [ ] Use button navigates to generator
- [ ] Warning shows for <10 draws

---

## File Summary

### New Files to Create

| Path | Purpose |
|------|---------|
| `src/types/analysis.ts` | Type definitions |
| `src/lib/analysis/historicalStorage.ts` | Storage management |
| `src/lib/analysis/statisticsAnalyzer.ts` | Analysis algorithms |
| `src/lib/analysis/chartDataProcessor.ts` | Chart data processing |
| `src/lib/analysis/recommendationsEngine.ts` | Recommendation algorithms |
| `src/components/analysis/HistoricalAnalysisPage.tsx` | Main page |
| `src/components/analysis/DrawInputForm.tsx` | Input form |
| `src/components/analysis/DrawList.tsx` | Draw list/table |
| `src/components/analysis/StatisticsPanel.tsx` | Basic stats |
| `src/components/analysis/AdvancedAnalysisPanel.tsx` | Advanced metrics |
| `src/components/analysis/ChartsPanel.tsx` | Visual charts |
| `src/components/analysis/RecommendationsPanel.tsx` | Smart recommendations |

### Files to Modify

| Path | Changes |
|------|---------|
| `package.json` | Add recharts dependency |
| `src/main.tsx` | Add BrowserRouter |
| `src/App.tsx` | Add routes and navigation |

---

## Testing Checklist

### Unit Tests
- [ ] Storage module CRUD operations
- [ ] Statistics analyzer calculations
- [ ] Recommendation engine algorithms
- [ ] Chart data processor transformations

### Integration Tests
- [ ] Form submission → storage → list update
- [ ] Delete → storage → list update
- [ ] Filter → statistics update
- [ ] Recommendations → generator navigation

### Visual Regression
- [ ] All panels render correctly
- [ ] Charts display data accurately
- [ ] Responsive layouts work

---

## Order of Implementation

1. **Start with Phase 1** - Get routing and storage working
2. **Do Phase 2** - Build input form and list to enable data entry
3. **Do Phase 3** - Add basic statistics once data exists
4. **Do Phase 4** - Add advanced analysis
5. **Finish with Phase 5** - Add charts and recommendations

Each phase builds on the previous, allowing incremental testing and validation.
