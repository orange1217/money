import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { HistoricalDraw } from '@/types/analysis';
import { LotteryType } from '@/lib/lottery/types';
import { StatisticsAnalyzer } from '@/lib/analysis/statisticsAnalyzer';
import { Link, Hash, Repeat, ScanLine } from 'lucide-react';
import { useMemo } from 'react';

interface AdvancedAnalysisPanelProps {
  draws: HistoricalDraw[];
  filterType: LotteryType | 'all';
}

export function AdvancedAnalysisPanel({ draws, filterType }: AdvancedAnalysisPanelProps) {
  const metrics = useMemo(
    () => StatisticsAnalyzer.generateAdvancedMetrics(draws, filterType),
    [draws, filterType]
  );

  if (draws.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      {/* Consecutive Patterns Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Link className="w-5 h-5 text-purple-500" />
            连号分析
          </CardTitle>
          <CardDescription>连续号码出现频率统计</CardDescription>
        </CardHeader>
        <CardContent>
          {metrics.consecutivePatterns.length === 0 ? (
            <p className="text-muted-foreground text-sm">暂无数据</p>
          ) : (
            <div className="space-y-3">
              {metrics.consecutivePatterns.map((count, consecutive) => {
                if (count === 0 && consecutive === 0) {
                  return (
                    <div key="none" className="flex items-center justify-between">
                      <span className="text-sm">无连号</span>
                      <div className="flex items-center gap-2">
                        <div className="w-48 h-4 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gray-400 rounded-full"
                            style={{ width: `${(count / draws.length) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium min-w-[60px] text-right">
                          {count}次
                        </span>
                      </div>
                    </div>
                  );
                }
                if (count > 0) {
                  return (
                    <div key={consecutive} className="flex items-center justify-between">
                      <span className="text-sm">{consecutive}连号</span>
                      <div className="flex items-center gap-2">
                        <div className="w-48 h-4 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                            style={{ width: `${(count / draws.length) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium min-w-[60px] text-right">
                          {count}次
                        </span>
                      </div>
                    </div>
                  );
                }
                return null;
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* AC Value Distribution Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Hash className="w-5 h-5 text-indigo-500" />
            AC值分布
          </CardTitle>
          <CardDescription>数字复杂指数统计（值越高越复杂）</CardDescription>
        </CardHeader>
        <CardContent>
          {Object.keys(metrics.acValueDistribution).length === 0 ? (
            <p className="text-muted-foreground text-sm">暂无数据</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {Object.entries(metrics.acValueDistribution)
                .sort(([a], [b]) => parseInt(a) - parseInt(b))
                .map(([ac, count]) => {
                  const percentage = (count / draws.length) * 100;
                  const intensity = percentage > 20 ? 'high' : percentage > 10 ? 'medium' : 'low';
                  const bgColor = {
                    high: 'bg-green-500',
                    medium: 'bg-yellow-500',
                    low: 'bg-gray-400'
                  }[intensity];

                  return (
                    <div key={ac} className="text-center p-3 bg-muted/20 rounded-lg">
                      <div className={`w-10 h-10 mx-auto ${bgColor} text-white rounded-full flex items-center justify-center font-bold mb-2`}>
                        {ac}
                      </div>
                      <div className="text-sm font-medium">{count}次</div>
                      <div className="text-xs text-muted-foreground">{percentage.toFixed(1)}%</div>
                    </div>
                  );
                })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Repeat Analysis Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Repeat className="w-5 h-5 text-orange-500" />
            重号分析
          </CardTitle>
          <CardDescription>与上期重复号码的统计</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center">
            <div className="text-center">
              <div className="text-4xl font-bold text-orange-500 mb-2">
                {metrics.repeatNumberRate}%
              </div>
              <p className="text-sm text-muted-foreground">
                的开奖包含上期号码
              </p>
            </div>
          </div>
          {metrics.repeatNumberRate > 50 && (
            <div className="mt-4 p-3 bg-orange-500/10 border border-orange-500/30 rounded-lg">
              <p className="text-sm text-orange-700 dark:text-orange-400">
                💡 重号率较高，考虑在选择号码时包含部分上期号码
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Missing Numbers Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <ScanLine className="w-5 h-5 text-blue-500" />
            遗漏号码
          </CardTitle>
          <CardDescription>长期未出现的号码</CardDescription>
        </CardHeader>
        <CardContent>
          {metrics.missingNumbers.length === 0 ? (
            <p className="text-muted-foreground text-sm">暂无数据</p>
          ) : (
            <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
              {metrics.missingNumbers
                .filter(m => m.misses > 0)
                .slice(0, 20)
                .map((item) => {
                  const missLevel = item.misses > 20 ? 'high' : item.misses > 10 ? 'medium' : 'low';
                  const bgColor = {
                    high: 'bg-red-100 border-red-300 text-red-700 dark:bg-red-900/30 dark:border-red-700 dark:text-red-400',
                    medium: 'bg-yellow-100 border-yellow-300 text-yellow-700 dark:bg-yellow-900/30 dark:border-yellow-700 dark:text-yellow-400',
                    low: 'bg-green-100 border-green-300 text-green-700 dark:bg-green-900/30 dark:border-green-700 dark:text-green-400'
                  }[missLevel];

                  return (
                    <div
                      key={item.number}
                      className={`text-center p-2 rounded-lg border ${bgColor}`}
                    >
                      <div className="font-bold">{item.number}</div>
                      <div className="text-xs">{item.misses}期</div>
                    </div>
                  );
                })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Zone Distribution Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">区间分布</CardTitle>
          <CardDescription>
            号码在各区间的分布情况
            {filterType !== 'all' && ` (${filterType === LotteryType.DOUBLE_COLOR ? '双色球' : filterType === LotteryType.SUPER_LOTTO ? '大乐透' : filterType === LotteryType.HAPPY_8 ? '快乐8' : '福彩3D'})`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {metrics.zoneDistribution.zones.length === 0 ? (
            <p className="text-muted-foreground text-sm">暂无数据</p>
          ) : (
            <div className="space-y-4">
              {metrics.zoneDistribution.zones.map((zone) => (
                <div key={zone.name}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">
                      {zone.name} ({zone.range[0]}-{zone.range[1]})
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {zone.count}个 ({zone.percentage}%)
                    </span>
                  </div>
                  <div className="h-6 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-500"
                      style={{ width: `${zone.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
