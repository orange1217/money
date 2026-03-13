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

**Form Fields:**
- **彩票类型** (Lottery Type) - Dropdown selector with icons
  - Changing lottery type clears existing number inputs and re-renders with appropriate count
  - Transition animation: inputs fade out, new inputs fade in (300ms)
- **期号** (Draw Number) - Text input, pattern: YYYY + number (e.g., "2024001")
- **开奖日期** (Draw Date) - HTML date picker, defaults to today
- **号码输入** (Number Input) - Dynamic count based on lottery type
  - **双色球:** 6 red ball inputs (range 1-33) + 1 blue ball input (range 1-16)
  - **大乐透:** 5 front zone inputs (range 1-35) + 2 back zone inputs (range 1-12)
  - **快乐8:** 10 inputs (range 1-80)
  - **福彩3D:** 3 inputs (range 0-9), allows duplicates
- **保存到本地存储** (Persist) - Toggle switch, default: on

**Number Input UI Pattern:**
- Each number input is a small input box (2 digits max)
- Auto-advance to next input after entering valid number
- Backspace returns to previous input
- Visual separator between main numbers and special numbers
- Invalid numbers show red border and shake animation

**Number Ranges by Lottery Type:**
| Lottery Type | Main Numbers | Special Numbers | Allow Duplicates |
|--------------|--------------|-----------------|------------------|
| 双色球 | 1-33 (6个) | 1-16 (1个) | No |
| 大乐透 | 1-35 (5个) | 1-12 (2个) | No |
| 快乐8 | 1-80 (10个) | None | No |
| 福彩3D | 0-9 (3个) | None | Yes |

**Validation:**
- Numbers within valid range (see table above)
- No duplicates except 福彩3D
- All required fields filled
- Invalid inputs show inline error message below the field
- Submit button disabled when validation fails

### 5.2 DrawList

**Purpose:** Display all entered historical draws with delete functionality.

**Display Format:**
- Table layout with columns: 期号, 日期, 号码, 操作
- Each row shows one historical draw
- Numbers displayed as colored balls matching lottery type colors
- Hover effect on rows highlights the entry
- Responsive: card layout on mobile, table on desktop

**Delete Behavior:**
- Delete button (trash icon) on each row
- Confirmation dialog: "确认删除期号 {drawNumber} 的记录吗？"
- Bulk delete option: "清空全部" button with confirmation
- Empty state: "暂无历史数据，请先添加开奖记录"

**Filtering:**
- Filter by lottery type dropdown (全部/双色球/大乐透/快乐8/福彩3D)
- Sort by date (newest/oldest) toggle
- Search by draw number input

### 5.3 StatisticsPanel

**Card-based layout showing:**

1. **数据概览** (Data Overview)
   - Total draws count
   - Date range: "2024-01-01 至 2024-03-13"
   - Draws per lottery type breakdown

2. **热号排行榜** (Hot Numbers)
   - Top 10 most frequent numbers
   - Each entry: number, count, percentage bar
   - Color gradient: red (hot) to yellow (medium)

3. **冷号排行榜** (Cold Numbers)
   - Top 10 least frequent numbers
   - Each entry: number, count, consecutive misses
   - Shows last seen date

4. **奇偶分布** (Odd/Even Distribution)
   - Pie chart or simple ratio display
   - Shows: "奇数: 52% | 偶数: 48%"

5. **大小分布** (High/Low Distribution)
   - High: numbers > median, Low: numbers ≤ median
   - Ratio display with progress bar

6. **和值统计** (Sum Statistics)
   - Min/Max/Average values
   - **Trend indicator:** Arrow icon showing if recent sums are trending up or down compared to historical average
     - Green up arrow: last 5 draws avg > historical avg
     - Red down arrow: last 5 draws avg < historical avg
     - Gray flat: within 5% of historical avg

### 5.4 AdvancedAnalysisPanel

**Advanced metrics display:**

1. **连号分析** (Consecutive Number Analysis)
   - Table showing frequency of consecutive patterns
   - Example: "2连号: 45次, 3连号: 12次, 4连号: 2次"
   - Highlight most common pattern

2. **AC值分布** (AC Value Distribution)
   - Bar chart showing AC value frequency
   - AC value definition: count of differences between all pairs minus (n-1)
   - Common AC ranges highlighted

3. **重号分析** (Repeat Number Analysis)
   - Percentage of draws with at least one number repeated from previous draw
   - List of most commonly repeated numbers
   - "上期重号率: 23%"

4. **遗漏号码** (Missing Numbers)
   - Table sorted by consecutive miss count
   - Each entry: number, miss count, last seen date
   - Highlight numbers missing >20 draws

5. **区间分布** (Zone Distribution)
   - Fixed zones based on lottery type:
     - **双色球:** 3 zones [1-11], [12-22], [23-33]
     - **大乐透:** 3 zones [1-11], [12-23], [24-35]
     - **快乐8:** 4 zones [1-20], [21-40], [41-60], [61-80]
     - **福彩3D:** 3 zones [0-3], [4-6], [7-9]
   - Percentage bar showing distribution across zones
   - "一区: 35% | 二区: 33% | 三区: 32%"

### 5.5 ChartsPanel

**Using Recharts library with following specifications:**

1. **号码频率柱状图** (Number Frequency Bar Chart)
   - X-axis: Individual numbers (1-33 for 双色球 red balls)
   - Y-axis: Frequency count
   - Color coding by frequency tier:
     - Hot (top 20%): #ef4444 (red)
     - Medium (middle 60%): #eab308 (yellow)
     - Cold (bottom 20%): #3b82f6 (blue)
   - Hover tooltip: shows number, count, percentage
   - Bar height animated on load

2. **和值趋势折线图** (Sum Trend Line Chart)
   - X-axis: Draw dates (last 50 draws max)
   - Y-axis: Sum values with min/max indicators
   - Two lines:
     - Blue: actual sum values
     - Gray dashed: 10-draw rolling average
   - Hover tooltip: shows date, sum, vs average

3. **奇偶占比饼图** (Odd/Even Pie Chart)
   - Two segments: odd (red), even (blue)
   - Center label: shows percentage
   - Legend on right side
   - Hover expands segment slightly

4. **遗漏热力图** (Miss Count Heat Map)
   - Grid layout: numbers arranged in rows of 10
   - Cell color intensity based on miss count:
     - 0-5 misses: light green (#86efac)
     - 6-10 misses: yellow (#fde047)
     - 11-20 misses: orange (#fdba74)
     - 20+ misses: red (#fca5a5)
   - Hover tooltip: number, miss count, last seen

**Responsive Layout:**
- Desktop (>1024px): 2x2 grid
- Tablet (768-1024px): 2 columns, stacked rows
- Mobile (<768px): Single column, full width charts

**Chart Interactions:**
- All charts: Loading spinner during data processing
- All charts: Empty state with "添加更多数据以显示图表" message
- Export button: Download chart as PNG (1024x768)

### 5.6 RecommendationsPanel

**Four recommendation strategies:**

1. **热号推荐** (Hot Number Strategy)
   - Selects top 50% from most frequent numbers
   - Ensures balanced odd/even and high/low ratios
   - Reasoning: "基于历史出现频率最高的号码"
   - Confidence: based on data size (higher with more draws)

2. **冷号追号** (Cold Number Strategy)
   - Selects from numbers with highest miss counts (>15)
   - Balances with some medium-frequency numbers
   - Reasoning: "追号长期未出现的号码"
   - Confidence: 40-60 (lower due to unpredictability)

3. **平衡组合** (Balanced Strategy)
   - Mix: 40% hot, 40% medium, 20% cold
   - Optimizes for historical odd/even and high/low ratios
   - Matches historical AC value distribution
   - Reasoning: "综合热冷号码的平衡推荐"
   - Confidence: 60-80

4. **AC值优化** (AC Value Strategy)
   - Generates combinations targeting common AC values (6-10)
   - Ensures number spread across different zones
   - Reasoning: "基于AC值优化的号码分布"
   - Confidence: 50-70

**Card Layout:**
- Strategy name with icon
- Confidence badge: 0-100 score (color: green >70, yellow 50-70, red <50)
- Reasoning text
- Suggested numbers as NumberBall components
- Two buttons:
  - **一键复制** (Copy): Copies numbers to clipboard as comma-separated string
  - **使用这组号码** (Use): Navigates to `/` (generator page) and pre-fills the numbers

**"Use" Button Integration:**
- On click: navigate to `/` with state: `{ prefillNumbers: numbers, lotteryType: type }`
- LotteryGenerator reads this state on mount and auto-fills the display
- Toast notification: "已填入推荐号码"

**Confidence Score Formula:**
```
confidence = baseScore + dataBonus - variancePenalty

baseScore = 50 (default)
dataBonus = min(draws * 0.5, 30)  // Max 30 points for data size
variancePenalty = abs(currentRatio - historicalRatio) * 10

Final confidence = clamp(baseScore + dataBonus - variancePenalty, 0, 100)
```

**Minimum Data Requirement:**
- Show "数据不足，至少需要10期历史数据" warning when draws < 10
- Recommendations still generated but with low confidence and warning badge

## 6. Error Handling

### 6.1 Input Validation
| Scenario | Validation | Error Display |
|----------|-----------|---------------|
| Invalid draw number format | Must match pattern: `^\d{4}\d{3,4}$` | "期号格式错误，应为：2024001" |
| Numbers out of range | See Section 5.1 number ranges table | "号码超出有效范围 (1-33)" |
| Duplicate numbers | Check for duplicates within array (except 福彩3D) | "号码不能重复" |
| Missing required fields | All fields must have values | Submit button disabled, "请填写完整" |
| Date in future | Date cannot be after today | "开奖日期不能是未来" |

### 6.2 Edge Cases

| Scenario | Behavior | Display |
|----------|----------|---------|
| Empty state (0 draws) | Show empty state UI | "暂无历史数据，请先添加开奖记录" |
| Single draw (1 draw) | Show limited stats (no percentages, no trends) | "数据较少，部分分析不可用" |
| Small dataset (<10 draws) | Show all stats with warning | "⚠️ 数据量较少，统计可能不够准确" |
| Large dataset (>1000 draws) | Paginate draw list (50 per page) | Lazy load charts for performance |
| Single lottery type | Filter shows only that type | Normal display, filter disabled |
| All dates same | Date range shows single date | "日期: 2024-01-01" |

### 6.3 Storage Issues

**localStorage Full:**
- Detect: try-catch on setItem
- Action: Disable persistence toggle, show error
- Message: "本地存储已满，数据将不会保存到本地"

**Corrupted Data:**
- Detect: JSON parse error on load
- Action: Reset to empty array, log error
- Message: "数据已损坏，已重置为空"
- Fallback: Start fresh session

**Schema Versioning:**
```typescript
interface StorageData {
  version: number;  // Current: 1
  enabled: boolean;
  draws: HistoricalDraw[];
}

// Migration strategy
const migrations = {
  1: (data: any) => data  // No-op, current version
};

function migrate(rawData: string): StorageData {
  const data = JSON.parse(rawData);
  const version = data.version || 0;

  // Apply migrations sequentially
  let migrated = data;
  for (let v = version + 1; v <= CURRENT_VERSION; v++) {
    migrated = migrations[v](migrated);
  }

  return migrated;
}
```

**Version History:**
- v0 (unversioned): Initial format
- v1 (current): Added version field, standardized HistoricalDraw interface

## 7. Dependencies

```json
{
  "recharts": "^2.x"  // Chart library
}
```

Note: `react-router-dom` already installed.

## 8. Page Integration

### 8.1 Navigation

Add navigation to existing app:
```tsx
// App.tsx structure
<Routes>
  <Route path="/" element={<LotteryGenerator />} />
  <Route path="/analysis" element={<HistoricalAnalysisPage />} />
</Routes>
```

Add navigation links in header or tabs:
```
[号码生成] [历史分析]
```

### 8.2 Data Flow Between Pages

**From Analysis to Generator (Recommendations):**
1. User clicks "使用这组号码" in RecommendationsPanel
2. Navigate to `/` with state: `{ prefillNumbers: numbers[], lotteryType: type }`
3. LotteryGenerator checks `location.state` on mount
4. If present, display numbers in result area
5. Show toast: "已填入推荐号码"

**No reverse flow needed** - Generator remains independent

## 9. Implementation Phases

### Phase 1: Core Infrastructure
**Deliverables:**
- `src/types/analysis.ts` with all interfaces
- `src/lib/analysis/historicalStorage.ts` with CRUD operations
- React Router setup with `/analysis` route
- Navigation tabs in App.tsx

**Acceptance:**
- Can navigate between `/` and `/analysis`
- localStorage read/write works
- Page loads without errors

### Phase 2: Input Form and Draw List
**Deliverables:**
- `DrawInputForm.tsx` with validation
- `DrawList.tsx` with table/card layout
- Form state management
- Delete functionality with confirmation

**Acceptance:**
- Can add a historical draw (all lottery types)
- Validation prevents invalid inputs
- Draw list displays entries correctly
- Delete works with confirmation

### Phase 3: Basic Statistics Panel
**Deliverables:**
- `StatisticsPanel.tsx` with all 6 sections
- `statisticsAnalyzer.ts` with analysis algorithms
- Hot/cold number calculations
- Empty state handling

**Acceptance:**
- Stats display correctly with sample data
- Hot numbers sorted by frequency
- Cold numbers show miss counts
- Empty state shows when no data
- Warning shows for <10 draws

### Phase 4: Advanced Analysis
**Deliverables:**
- `AdvancedAnalysisPanel.tsx` with 5 analysis sections
- Consecutive pattern detection
- AC value calculation
- Zone distribution logic
- Repeat number analysis

**Acceptance:**
- All 5 sections render correctly
- Zone definitions match spec
- AC values calculated accurately
- Missing numbers tracked correctly

### Phase 5: Charts and Recommendations
**Deliverables:**
- Install `recharts` dependency
- `ChartsPanel.tsx` with 4 chart types
- `RecommendationsPanel.tsx` with 4 strategies
- Confidence scoring algorithm
- Copy and Use buttons functional

**Acceptance:**
- All 4 chart types render with sample data
- Charts responsive on mobile/tablet
- Recommendations generate for all strategies
- Confidence scores calculate correctly
- Copy button copies to clipboard
- Use button navigates to generator with prefill

## 10. Design Decisions Summary

| Aspect | Decision | Rationale |
|--------|----------|-----------|
| UI Pattern | New separate page | Feature is substantial enough |
| Input Method | Form-based, one draw at a time | Clear, validated input |
| Storage | Optional localStorage | User control, privacy |
| Charts | Recharts | React-friendly, lightweight |
| Architecture | Independent component | Clean separation, easy maintenance |
| Analysis Scope | All features included | Comprehensive user request |
| Page Integration | One-way flow (analysis → generator) | Generator remains independent |

## 11. Open Questions

None at this time.
