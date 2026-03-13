# Historical Lottery Analysis Feature - Design Document

**Date:** 2026-03-13
**Status:** Design Approved
**Author:** Claude Code

## 1. Overview

Add a historical winning number analysis feature to the lottery generator application. Users can manually input historical draw data, view statistical analysis, visualize trends with charts, and receive smart number recommendations based on historical patterns.

## 2. Requirements

### 2.1 Functional Requirements

- **FR-1:** Users can manually input historical winning numbers by draw
- **FR-2:** Display basic statistics (hot/cold numbers, odd/even ratio, high/low ratio, sum trends)
- **FR-3:** Display advanced analysis (consecutive patterns, AC value distribution, repeat analysis, missing numbers)
- **FR-4:** Visualize data with charts (frequency bars, trend lines, pie charts, heat maps)
- **FR-5:** Generate smart recommendations based on historical patterns
- **FR-6:** Optional localStorage persistence with user toggle

### 2.2 Non-Functional Requirements

- **NFR-1:** Responsive design (mobile, tablet, desktop)
- **NFR-2:** Performance with up to 1000 historical draws
- **NFR-3:** Client-side only (no backend required)
- **NFR-4:** TypeScript with full type safety

## 3. Architecture

### 3.1 Component Structure

```
src/
  components/
    analysis/
      HistoricalAnalysisPage.tsx     # Main page component
      DrawInputForm.tsx               # Form for entering historical draws
      DrawList.tsx                    # List of entered historical draws
      StatisticsPanel.tsx             # Basic stats display
      AdvancedAnalysisPanel.tsx       # Advanced analysis display
      ChartsPanel.tsx                 # Visual charts
      RecommendationsPanel.tsx        # Smart recommendations
  lib/
    analysis/
      historicalStorage.ts            # localStorage management
      statisticsAnalyzer.ts           # Analysis algorithms
      chartDataProcessor.ts           # Process data for charts
  types/
    analysis.ts                       # New types for historical analysis
```

### 3.2 Component Hierarchy

```
HistoricalAnalysisPage
├── DrawInputForm (期号, 日期, 号码 input)
├── DrawList (list of entered draws with delete option)
└── AnalysisDashboard
    ├── StatisticsPanel (basic stats)
    ├── AdvancedAnalysisPanel (advanced metrics)
    ├── ChartsPanel (visual charts)
    └── RecommendationsPanel (smart picks)
```

### 3.3 Routing

Add React Router routes:
- `/` - Existing LotteryGenerator
- `/analysis` - New HistoricalAnalysisPage

## 4. Data Structures

### 4.1 Core Types

```typescript
// Historical draw record
interface HistoricalDraw {
  id: string;
  lotteryType: LotteryType;
  drawNumber: string;            // e.g., "2024001"
  drawDate: string;              // YYYY-MM-DD
  numbers: number[];
  specialNumbers?: number[];
  createdAt: number;
}

// Number frequency analysis
interface NumberFrequency {
  number: number;
  count: number;
  percentage: number;
  lastSeen?: string;
  consecutiveMisses: number;
}

// Statistics summary
interface StatisticsSummary {
  totalDraws: number;
  dateRange: { start: string; end: string };
  hotNumbers: NumberFrequency[];
  coldNumbers: NumberFrequency[];
  oddEvenRatio: { odd: number; even: number };
  highLowRatio: { high: number; low: number };
  sumStats: { min: number; max: number; avg: number };
}

// Advanced metrics
interface AdvancedMetrics {
  consecutivePatterns: number[];
  acValueDistribution: Record<number, number>;
  repeatNumberRate: number;
  missingNumbers: { number: number; misses: number }[];
}

// Recommendation result
interface RecommendationResult {
  strategy: string;
  reasoning: string;
  numbers: number[];
  specialNumbers?: number[];
  confidence: number;  // 0-100
}
```

### 4.2 Storage Schema

```typescript
localStorage key: "lottery_historical_data"
value: {
  enabled: boolean;
  draws: HistoricalDraw[];
}
```

## 5. Component Specifications

### 5.1 DrawInputForm

Form fields:
- **彩票类型** (Lottery Type) - Dropdown selector
- **期号** (Draw Number) - Text input, e.g., "2024001"
- **开奖日期** (Draw Date) - Date picker
- **号码输入** (Number Input) - Dynamic based on lottery type
  - 双色球: 6红 + 1蓝
  - 大乐透: 5前 + 2后
  - 快乐8: 10个号码
  - 福彩3D: 3个号码
- **保存到本地存储** - Toggle switch

Validation:
- Numbers within valid range
- No duplicates (except 福彩3D)
- Required fields check

### 5.2 StatisticsPanel

Card-based layout showing:
1. **数据概览** - Total draws, date range
2. **热号排行榜** - Top 10 frequent numbers
3. **冷号排行榜** - Top 10 least frequent with miss count
4. **奇偶分布** - Pie chart or ratio
5. **大小分布** - High/low ratio
6. **和值统计** - Min/Max/Average with trend

### 5.3 AdvancedAnalysisPanel

Advanced metrics display:
1. **连号分析** - Frequency of consecutive patterns
2. **AC值分布** - AC value frequency
3. **重号分析** - Repeat rate from previous draw
4. **遗漏号码** - Numbers by miss count
5. **区间分布** - Zone-based distribution

### 5.4 ChartsPanel

Using Recharts library:

1. **号码频率柱状图** - Bar chart of number frequency
2. **和值趋势折线图** - Sum values over time with rolling average
3. **奇偶占比饼图** - Odd/even distribution pie chart
4. **遗漏热力图** - Heat map of miss counts

Responsive: 2x2 grid (desktop), 2 columns (tablet), stacked (mobile)

### 5.5 RecommendationsPanel

Four recommendation strategies:

1. **热号推荐** - Based on most frequent numbers
2. **冷号追号** - Based on high miss counts
3. **平衡组合** - Mix of hot/cold with optimized ratios
4. **AC值优化** - Based on AC value patterns

Each card includes: strategy name, reasoning, suggested numbers, copy button, use button

## 6. Error Handling

### 6.1 Input Validation
- Invalid draw number format → Error message
- Numbers out of range → Inline error
- Duplicate numbers → Inline error
- Missing fields → Disabled submit

### 6.2 Edge Cases
- **Empty state** → Friendly prompt to add data
- **Single draw** → Limited analysis
- **Small dataset** (<10) → Warning about statistical significance
- **Large dataset** (>1000) → Performance handling

### 6.3 Storage Issues
- localStorage full → Error notification
- Corrupted data → Reset with notification
- Schema versioning → Migration handling

## 7. Dependencies

```json
{
  "recharts": "^2.x"  // Chart library
}
```

Note: `react-router-dom` already installed.

## 8. Implementation Phases

1. **Phase 1:** Core infrastructure (types, storage, routing)
2. **Phase 2:** Input form and draw list
3. **Phase 3:** Basic statistics panel
4. **Phase 4:** Advanced analysis
5. **Phase 5:** Charts and recommendations

## 9. Design Decisions Summary

| Aspect | Decision | Rationale |
|--------|----------|-----------|
| UI Pattern | New separate page | Feature is substantial enough |
| Input Method | Form-based, one draw at a time | Clear, validated input |
| Storage | Optional localStorage | User control, privacy |
| Charts | Recharts | React-friendly, lightweight |
| Architecture | Independent component | Clean separation, easy maintenance |
| Analysis Scope | All features included | Comprehensive user request |

## 10. Open Questions

None at this time.
