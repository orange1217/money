import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { HistoricalDraw } from '@/types/analysis';
import { LotteryType } from '@/lib/lottery/types';
import { StatisticsAnalyzer } from '@/lib/analysis/statisticsAnalyzer';
import { BarChart3, PieChart as PieChartIcon } from 'lucide-react';
import { useMemo, useState } from 'react';

interface ChartsPanelProps {
  draws: HistoricalDraw[];
  filterType: LotteryType | 'all';
}

export function ChartsPanel({ draws, filterType }: ChartsPanelProps) {
  const [mounted, setMounted] = useState(false);

  // Ensure charts render after client-side mount
  useMemo(() => setMounted(true), []);

  if (!mounted || draws.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <BarChart3 className="w-12 h-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">暂无图表数据</h3>
          <p className="text-muted-foreground text-center text-sm">
            添加历史数据后将显示可视化图表
          </p>
        </CardContent>
      </Card>
    );
  }

  // Calculate data for charts
  const summary = useMemo(
    () => StatisticsAnalyzer.generateSummary(draws, filterType),
    [draws, filterType]
  );

  return (
    <div className="space-y-4">
      {/* Frequency Bar Chart - Simple CSS Version */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-500" />
            号码频率分布
          </CardTitle>
          <CardDescription>各号码出现次数统计（Top 20）</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {summary.hotNumbers.slice(0, 20).map((item) => {
              const maxCount = summary.hotNumbers[0]?.count || 1;
              const percentage = (item.count / maxCount) * 100;
              const color = percentage >= 80 ? 'bg-red-500' : percentage >= 40 ? 'bg-yellow-500' : 'bg-blue-500';

              return (
                <div key={item.number} className="flex items-center gap-3">
                  <span className="w-8 text-center text-sm font-medium">{item.number}</span>
                  <div className="flex-1 h-6 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full ${color} rounded-full transition-all`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium min-w-[60px] text-right">
                    {item.count}次
                  </span>
                </div>
              );
            })}
          </div>
          <div className="flex justify-center gap-6 mt-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-red-500" />
              <span>热号 (≥80%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-yellow-500" />
              <span>温号 (40-80%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-blue-500" />
              <span>冷号 (&lt;40%)</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Odd/Even and High/Low Distribution */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <PieChartIcon className="w-5 h-5 text-purple-500" />
              奇偶分布
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm">奇数</span>
                  <span className="font-bold">{summary.oddEvenRatio.odd}</span>
                </div>
                <div className="h-8 bg-red-500 rounded-lg flex items-center justify-center text-white font-bold">
                  {Math.round((summary.oddEvenRatio.odd / (summary.oddEvenRatio.odd + summary.oddEvenRatio.even)) * 100)}%
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm">偶数</span>
                  <span className="font-bold">{summary.oddEvenRatio.even}</span>
                </div>
                <div className="h-8 bg-blue-500 rounded-lg flex items-center justify-center text-white font-bold">
                  {Math.round((summary.oddEvenRatio.even / (summary.oddEvenRatio.odd + summary.oddEvenRatio.even)) * 100)}%
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">大小分布</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm">大号</span>
                  <span className="font-bold">{summary.highLowRatio.high}</span>
                </div>
                <div className="h-8 bg-orange-500 rounded-lg flex items-center justify-center text-white font-bold">
                  {Math.round((summary.highLowRatio.high / (summary.highLowRatio.high + summary.highLowRatio.low)) * 100)}%
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm">小号</span>
                  <span className="font-bold">{summary.highLowRatio.low}</span>
                </div>
                <div className="h-8 bg-green-500 rounded-lg flex items-center justify-center text-white font-bold">
                  {Math.round((summary.highLowRatio.low / (summary.highLowRatio.high + summary.highLowRatio.low)) * 100)}%
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Note about charts */}
      <div className="p-4 bg-muted/20 rounded-lg border border-muted-foreground/20">
        <p className="text-sm text-muted-foreground text-center">
          💡 更多图表功能将在依赖安装后启用
        </p>
      </div>
    </div>
  );
}
