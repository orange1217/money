import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { NumberBall } from './NumberBall';
import { GenerationHistory } from '@/lib/lottery/types';
import { getLotteryTypeName } from '@/lib/lottery/rules';
import { Clock } from 'lucide-react';

interface HistoryPanelProps {
  history: GenerationHistory[];
  onClear?: () => void;
}

export const HistoryPanel = React.memo(function HistoryPanel({
  history,
  onClear
}: HistoryPanelProps) {
  if (history.length === 0) return null;

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();

    if (diff < 60000) return '刚刚';
    if (diff < 3600000) return `${Math.floor(diff / 60000)} 分钟前`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)} 小时前`;
    return date.toLocaleDateString('zh-CN');
  };

  return (
    <Card>
      <CardHeader className="pb-3 sm:pb-6">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base sm:text-lg flex items-center gap-2">
            <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
            历史记录
          </CardTitle>
          {onClear && (
            <button
              onClick={onClear}
              className="text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              清空
            </button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 sm:space-y-3 max-h-[200px] sm:max-h-[320px] overflow-y-auto">
          {history.map((item, index) => (
            <div
              key={item.id}
              className="p-2 sm:p-3 bg-muted/50 rounded-lg border border-border"
            >
              <div className="flex items-center justify-between mb-2">
                <Badge variant="outline" className="text-xs">
                  {getLotteryTypeName(item.lotteryType)}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {formatTime(item.timestamp)}
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                {item.results[0]?.map((ball, ballIndex) => (
                  <NumberBall
                    key={ballIndex}
                    ball={ball}
                    size="sm"
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
});
