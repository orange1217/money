import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { HistoricalDraw } from '@/types/analysis';
import { LotteryType } from '@/lib/lottery/types';
import { Trash2, Search, SortAsc, SortDesc } from 'lucide-react';
import { useState, useMemo } from 'react';

interface DrawListProps {
  draws: HistoricalDraw[];
  filterType: LotteryType | 'all';
  onFilterChange: (type: LotteryType | 'all') => void;
  onDelete: (id: string) => void;
  onClearAll: () => void;
}

const LOTTERY_TYPE_LABELS: Record<LotteryType, string> = {
  [LotteryType.DOUBLE_COLOR]: '双色球',
  [LotteryType.SUPER_LOTTO]: '大乐透',
  [LotteryType.HAPPY_8]: '快乐8',
  [LotteryType.FUCAI_3D]: '福彩3D'
};

const LOTTERY_TYPE_ICONS: Record<LotteryType, string> = {
  [LotteryType.DOUBLE_COLOR]: '🔴🔵',
  [LotteryType.SUPER_LOTTO]: '🔵🟢',
  [LotteryType.HAPPY_8]: '🟢',
  [LotteryType.FUCAI_3D]: '🟡'
};

export function DrawList({ draws, filterType, onFilterChange, onDelete, onClearAll }: DrawListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [clearAllConfirm, setClearAllConfirm] = useState(false);

  // Filter and sort draws
  const filteredDraws = useMemo(() => {
    let result = [...draws];

    // Filter by type
    if (filterType !== 'all') {
      result = result.filter(d => d.lotteryType === filterType);
    }

    // Filter by search query
    if (searchQuery) {
      result = result.filter(d => d.drawNumber.includes(searchQuery));
    }

    // Sort by date
    result.sort((a, b) => {
      const dateCompare = new Date(a.drawDate).getTime() - new Date(b.drawDate).getTime();
      return sortOrder === 'newest' ? -dateCompare : dateCompare;
    });

    return result;
  }, [draws, filterType, searchQuery, sortOrder]);

  const handleDelete = (id: string) => {
    if (deleteConfirmId === id) {
      onDelete(id);
      setDeleteConfirmId(null);
    } else {
      setDeleteConfirmId(id);
    }
  };

  const handleClearAll = () => {
    onClearAll();
    setClearAllConfirm(false);
  };

  // Get ball colors based on lottery type
  const getBallColor = (_num: number, isSpecial: boolean, type: LotteryType): string => {
    switch (type) {
      case LotteryType.DOUBLE_COLOR:
        return isSpecial ? 'bg-blue-500' : 'bg-red-500';
      case LotteryType.SUPER_LOTTO:
        return isSpecial ? 'bg-green-500' : 'bg-blue-500';
      case LotteryType.HAPPY_8:
        return 'bg-green-500';
      case LotteryType.FUCAI_3D:
        return 'bg-yellow-500';
      default:
        return 'bg-gray-500';
    }
  };

  // Empty state
  if (draws.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
            <span className="text-2xl">📊</span>
          </div>
          <h3 className="text-lg font-semibold mb-2">暂无历史数据</h3>
          <p className="text-muted-foreground text-center text-sm max-w-md">
            请先添加开奖记录以查看统计分析
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mt-4">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle>历史记录</CardTitle>
            <CardDescription>
              共 {filteredDraws.length} 条记录
              {filterType !== 'all' && ` (${LOTTERY_TYPE_LABELS[filterType]})`}
            </CardDescription>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            {sortOrder === 'newest' ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSortOrder('oldest')}
              >
                <SortAsc className="w-4 h-4 mr-1" />
                日期↑
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSortOrder('newest')}
              >
                <SortDesc className="w-4 h-4 mr-1" />
                日期↓
              </Button>
            )}
            {draws.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => clearAllConfirm ? handleClearAll() : setClearAllConfirm(true)}
                className={clearAllConfirm ? 'bg-destructive text-destructive-foreground' : ''}
              >
                <Trash2 className="w-4 h-4 mr-1" />
                {clearAllConfirm ? '确认清空?' : '清空全部'}
              </Button>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mt-4">
          {/* Type Filter */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => onFilterChange('all')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                filterType === 'all'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted hover:bg-muted/80'
              }`}
            >
              全部
            </button>
            {(Object.keys(LOTTERY_TYPE_LABELS) as LotteryType[]).map(type => (
              <button
                key={type}
                onClick={() => onFilterChange(type)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                  filterType === type
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted hover:bg-muted/80'
                }`}
              >
                {LOTTERY_TYPE_ICONS[type]} {LOTTERY_TYPE_LABELS[type]}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索期号..."
              className="w-full pl-9 pr-3 py-2 text-sm rounded-md border bg-background"
            />
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {/* Desktop Table View */}
        <div className="hidden md:block">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">期号</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">类型</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">日期</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">号码</th>
                <th className="text-right py-3 px-4 font-medium text-muted-foreground">操作</th>
              </tr>
            </thead>
            <tbody>
              {filteredDraws.map(draw => (
                <tr key={draw.id} className="border-b hover:bg-muted/30">
                  <td className="py-3 px-4 font-medium">{draw.drawNumber}</td>
                  <td className="py-3 px-4">
                    <Badge variant="outline">
                      {LOTTERY_TYPE_ICONS[draw.lotteryType]} {LOTTERY_TYPE_LABELS[draw.lotteryType]}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-muted-foreground">{draw.drawDate}</td>
                  <td className="py-3 px-4">
                    <div className="flex gap-1.5">
                      {draw.numbers.map((num, i) => (
                        <span
                          key={i}
                          className={`inline-flex w-7 h-7 items-center justify-center text-xs font-semibold rounded-full text-white ${getBallColor(num, false, draw.lotteryType)}`}
                        >
                          {num}
                        </span>
                      ))}
                      {draw.specialNumbers?.map((num, i) => (
                        <span
                          key={`special-${i}`}
                          className={`inline-flex w-7 h-7 items-center justify-center text-xs font-semibold rounded-full text-white ${getBallColor(num, true, draw.lotteryType)}`}
                        >
                          {num}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(draw.id)}
                      className={deleteConfirmId === draw.id ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90' : ''}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden space-y-3">
          {filteredDraws.map(draw => (
            <div key={draw.id} className="p-4 bg-muted/20 rounded-xl border">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="font-semibold">{draw.drawNumber}</div>
                  <div className="text-xs text-muted-foreground">{draw.drawDate}</div>
                </div>
                <Badge variant="outline">
                  {LOTTERY_TYPE_ICONS[draw.lotteryType]}
                </Badge>
              </div>
              <div className="flex gap-1.5 mb-3">
                {draw.numbers.map((num, i) => (
                  <span
                    key={i}
                    className={`inline-flex w-8 h-8 items-center justify-center text-sm font-semibold rounded-full text-white ${getBallColor(num, false, draw.lotteryType)}`}
                  >
                    {num}
                  </span>
                ))}
                {draw.specialNumbers?.map((num, i) => (
                  <span
                    key={`special-${i}`}
                    className={`inline-flex w-8 h-8 items-center justify-center text-sm font-semibold rounded-full text-white ${getBallColor(num, true, draw.lotteryType)}`}
                  >
                    {num}
                  </span>
                ))}
              </div>
              <div className="flex justify-end">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(draw.id)}
                  className={deleteConfirmId === draw.id ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90' : ''}
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  {deleteConfirmId === draw.id ? '确认删除?' : '删除'}
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* No results message */}
        {filteredDraws.length === 0 && draws.length > 0 && (
          <div className="text-center py-8 text-muted-foreground">
            没有找到匹配的记录
          </div>
        )}
      </CardContent>
    </Card>
  );
}
