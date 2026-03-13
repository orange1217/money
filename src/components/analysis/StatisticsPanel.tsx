import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { HistoricalDraw } from '@/types/analysis';
import { LotteryType } from '@/lib/lottery/types';
import { StatisticsAnalyzer } from '@/lib/analysis/statisticsAnalyzer';
import { TrendingUp, TrendingDown, Minus, Activity, Thermometer, Snowflake } from 'lucide-react';
import { useMemo } from 'react';

interface StatisticsPanelProps {
  draws: HistoricalDraw[];
  filterType: LotteryType | 'all';
}

export function StatisticsPanel({ draws, filterType }: StatisticsPanelProps) {
  const stats = useMemo(
    () => StatisticsAnalyzer.generateSummary(draws, filterType),
    [draws, filterType]
  );

  // Warning for small dataset
  const showWarning = stats.totalDraws > 0 && stats.totalDraws < 10;

  if (stats.totalDraws === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Activity className="w-12 h-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">暂无统计数据</h3>
          <p className="text-muted-foreground text-center text-sm">
            添加历史数据后将显示统计分析
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Warning Banner */}
      {showWarning && (
        <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg flex items-start gap-3">
          <span className="text-yellow-500 text-lg">⚠️</span>
          <div>
            <p className="text-sm font-medium text-yellow-700 dark:text-yellow-400">
              数据量较少
            </p>
            <p className="text-xs text-yellow-600/70 dark:text-yellow-400/70 mt-1">
              当前仅有 {stats.totalDraws} 期数据，统计可能不够准确。建议至少添加 10 期数据。
            </p>
          </div>
        </div>
      )}

      {/* Data Overview Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">数据概览</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-muted/20 rounded-lg">
              <div className="text-2xl font-bold">{stats.totalDraws}</div>
              <div className="text-xs text-muted-foreground mt-1">总期数</div>
            </div>
            <div className="text-center p-3 bg-muted/20 rounded-lg">
              <div className="text-lg font-bold">{stats.dateRange.start}</div>
              <div className="text-xs text-muted-foreground mt-1">起始日期</div>
            </div>
            <div className="text-center p-3 bg-muted/20 rounded-lg">
              <div className="text-lg font-bold">{stats.dateRange.end}</div>
              <div className="text-xs text-muted-foreground mt-1">结束日期</div>
            </div>
            <div className="text-center p-3 bg-muted/20 rounded-lg">
              <div className="text-2xl font-bold">
                {stats.hotNumbers.length > 0 ? stats.hotNumbers[0].count : 0}
              </div>
              <div className="text-xs text-muted-foreground mt-1">最高出现次数</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-4">
        {/* Hot Numbers Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Thermometer className="w-5 h-5 text-red-500" />
              热号排行
            </CardTitle>
            <CardDescription>出现频率最高的号码</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {stats.hotNumbers.map((item) => (
                <div key={item.number} className="flex items-center gap-3">
                  <div className="w-8 h-8 flex items-center justify-center bg-red-500 text-white rounded-full font-bold text-sm">
                    {item.number}
                  </div>
                  <div className="flex-1">
                    <div className="h-4 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-red-500 to-orange-500 rounded-full"
                        style={{ width: `${Math.min(item.percentage * 3, 100)}%` }}
                      />
                    </div>
                  </div>
                  <div className="text-sm font-medium min-w-[80px] text-right">
                    {item.count}次 <span className="text-muted-foreground">({item.percentage}%)</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Cold Numbers Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Snowflake className="w-5 h-5 text-blue-500" />
              冷号排行
            </CardTitle>
            <CardDescription>长期未出现的号码</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {stats.coldNumbers.map((item) => (
                <div key={item.number} className="flex items-center justify-between p-2 bg-muted/20 rounded-lg">
                  <div className="w-8 h-8 flex items-center justify-center bg-blue-500 text-white rounded-full font-bold text-sm">
                    {item.number}
                  </div>
                  <div className="text-sm">
                    <span className="text-muted-foreground">出现</span>{' '}
                    <span className="font-medium">{item.count}次</span>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    遗漏 {item.consecutiveMisses} 期
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {/* Odd/Even Distribution Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">奇偶分布</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm">奇数</span>
                  <span className="font-bold">{stats.oddEvenRatio.odd}</span>
                </div>
                <div className="h-6 bg-red-500 rounded-lg flex items-center justify-center text-white font-bold">
                  {stats.totalDraws > 0
                    ? Math.round((stats.oddEvenRatio.odd / (stats.oddEvenRatio.odd + stats.oddEvenRatio.even)) * 100)
                    : 0}
                  %
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm">偶数</span>
                  <span className="font-bold">{stats.oddEvenRatio.even}</span>
                </div>
                <div className="h-6 bg-blue-500 rounded-lg flex items-center justify-center text-white font-bold">
                  {stats.totalDraws > 0
                    ? Math.round((stats.oddEvenRatio.even / (stats.oddEvenRatio.odd + stats.oddEvenRatio.even)) * 100)
                    : 0}
                  %
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* High/Low Distribution Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">大小分布</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm">大号</span>
                  <span className="font-bold">{stats.highLowRatio.high}</span>
                </div>
                <div className="h-6 bg-orange-500 rounded-lg flex items-center justify-center text-white font-bold">
                  {stats.totalDraws > 0
                    ? Math.round((stats.highLowRatio.high / (stats.highLowRatio.high + stats.highLowRatio.low)) * 100)
                    : 0}
                  %
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm">小号</span>
                  <span className="font-bold">{stats.highLowRatio.low}</span>
                </div>
                <div className="h-6 bg-green-500 rounded-lg flex items-center justify-center text-white font-bold">
                  {stats.totalDraws > 0
                    ? Math.round((stats.highLowRatio.low / (stats.highLowRatio.high + stats.highLowRatio.low)) * 100)
                    : 0}
                  %
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sum Statistics Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">和值统计</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-500">{stats.sumStats.min}</div>
              <div className="text-xs text-muted-foreground mt-1">最小和值</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{stats.sumStats.avg}</div>
              <div className="text-xs text-muted-foreground mt-1">平均和值</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-500">{stats.sumStats.max}</div>
              <div className="text-xs text-muted-foreground mt-1">最大和值</div>
            </div>
          </div>

          {/* Trend Indicator */}
          {stats.totalDraws >= 10 && (
            <div className="mt-4 p-3 bg-muted/20 rounded-lg flex items-center justify-center gap-2">
              {stats.sumTrend === 'up' && (
                <>
                  <TrendingUp className="w-5 h-5 text-green-500" />
                  <span className="text-sm">近期和值呈上升趋势</span>
                </>
              )}
              {stats.sumTrend === 'down' && (
                <>
                  <TrendingDown className="w-5 h-5 text-red-500" />
                  <span className="text-sm">近期和值呈下降趋势</span>
                </>
              )}
              {stats.sumTrend === 'flat' && (
                <>
                  <Minus className="w-5 h-5 text-muted-foreground" />
                  <span className="text-sm">近期和值保持平稳</span>
                </>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
