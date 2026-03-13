import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { HistoricalDraw } from '@/types/analysis';
import { LotteryType } from '@/lib/lottery/types';
import { RecommendationsEngine } from '@/lib/analysis/recommendationsEngine';
import { Sparkles, Copy, CheckCircle2, Circle } from 'lucide-react';
import { useState, useMemo } from 'react';

interface RecommendationsPanelProps {
  draws: HistoricalDraw[];
  filterType: LotteryType | 'all';
}

const STRATEGY_ICONS: Record<string, string> = {
  '热号推荐': '🔥',
  '冷号追号': '❄️',
  '平衡组合': '⚖️',
  'AC值优化': '🎯'
};

export function RecommendationsPanel({ draws, filterType }: RecommendationsPanelProps) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  // Determine which lottery type to analyze
  const analysisType = filterType === 'all' ? LotteryType.DOUBLE_COLOR : filterType;

  const recommendations = useMemo(
    () => RecommendationsEngine.generateAll(draws, analysisType),
    [draws, analysisType]
  );

  const handleCopy = async (numbers: number[], index: number, specialNumbers?: number[]) => {
    const allNumbers = specialNumbers ? [...numbers, ...specialNumbers] : numbers;
    const text = allNumbers.join(', ');

    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleUse = (numbers: number[], specialNumbers: number[] | undefined, type: LotteryType) => {
    // Store in sessionStorage for the generator page to pick up
    const data = { numbers, specialNumbers, lotteryType: type };
    sessionStorage.setItem('prefillNumbers', JSON.stringify(data));

    // Navigate to generator page
    window.location.href = '/';
  };

  const getConfidenceColor = (confidence: number): string => {
    if (confidence >= 70) return 'bg-green-500';
    if (confidence >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getConfidenceLabel = (confidence: number): string => {
    if (confidence >= 70) return '高';
    if (confidence >= 50) return '中';
    return '低';
  };

  if (draws.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Sparkles className="w-12 h-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">暂无推荐数据</h3>
          <p className="text-muted-foreground text-center text-sm">
            添加历史数据后将生成智能推荐
          </p>
        </CardContent>
      </Card>
    );
  }

  if (draws.length < 10) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Circle className="w-12 h-12 text-yellow-500 mb-4" />
          <h3 className="text-lg font-semibold mb-2">数据量不足</h3>
          <p className="text-muted-foreground text-center text-sm mb-4">
            当前仅有 {draws.length} 期数据，建议至少添加 10 期数据以获得更准确的推荐
          </p>
          <p className="text-xs text-muted-foreground">
            以下推荐仅供参考，可能不够准确
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-5 h-5 text-yellow-500" />
        <h2 className="text-xl sm:text-2xl font-bold">智能推荐</h2>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {recommendations.map((rec, index) => (
          <Card key={index} className="relative">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-base flex items-center gap-2">
                    <span className="text-xl">{STRATEGY_ICONS[rec.strategy]}</span>
                    {rec.strategy}
                  </CardTitle>
                  <CardDescription className="mt-2">{rec.reasoning}</CardDescription>
                </div>
                <Badge
                  className={`${getConfidenceColor(rec.confidence)} text-white border-0`}
                >
                  {getConfidenceLabel(rec.confidence)} {rec.confidence}%
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              {/* Main Numbers */}
              <div className="flex flex-wrap gap-2 mb-3">
                {rec.numbers.map((num) => (
                  <div
                    key={num}
                    className="w-10 h-10 flex items-center justify-center bg-gradient-to-br from-red-500 to-orange-500 text-white rounded-full font-bold text-sm"
                  >
                    {num}
                  </div>
                ))}
              </div>

              {/* Special Numbers */}
              {rec.specialNumbers && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {rec.specialNumbers.map((num) => (
                    <div
                      key={`special-${num}`}
                      className="w-10 h-10 flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-500 text-white rounded-full font-bold text-sm"
                    >
                      {num}
                    </div>
                  ))}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCopy(rec.numbers, index, rec.specialNumbers)}
                  className="flex-1"
                >
                  {copiedIndex === index ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 mr-1" />
                      已复制
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-1" />
                      复制
                    </>
                  )}
                </Button>
                <Button
                  size="sm"
                  onClick={() => handleUse(rec.numbers, rec.specialNumbers, analysisType)}
                  className="flex-1"
                >
                  <Sparkles className="w-4 h-4 mr-1" />
                  使用这组号码
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Disclaimer */}
      <div className="p-4 bg-muted/20 rounded-lg border border-muted-foreground/20">
        <p className="text-sm text-muted-foreground text-center">
          💡 以上推荐基于历史数据分析，仅供参考。彩票是随机事件，请理性购彩，量力而行。
        </p>
      </div>
    </div>
  );
}
