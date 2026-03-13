import { useState, useEffect } from 'react';
import { LotteryType } from '@/lib/lottery/types';
import { HistoricalDraw } from '@/types/analysis';
import { historicalStorage } from '@/lib/analysis/historicalStorage';
import { DrawInputForm } from './DrawInputForm';
import { DrawList } from './DrawList';

export function HistoricalAnalysisPage() {
  const [draws, setDraws] = useState<HistoricalDraw[]>([]);
  const [filterType, setFilterType] = useState<LotteryType | 'all'>('all');
  const [isStorageEnabled, setIsStorageEnabled] = useState(true);

  // Load data from storage on mount
  useEffect(() => {
    const data = historicalStorage.load();
    setIsStorageEnabled(data.enabled);
    if (data.enabled) {
      setDraws(data.draws);
    }
  }, []);

  // Handle adding a new draw
  const handleAddDraw = (draw: HistoricalDraw) => {
    if (isStorageEnabled) {
      historicalStorage.addDraw(draw);
    }
    setDraws(prev => [draw, ...prev]);
  };

  // Handle deleting a draw
  const handleDeleteDraw = (id: string) => {
    if (isStorageEnabled) {
      historicalStorage.removeDraw(id);
    }
    setDraws(prev => prev.filter(d => d.id !== id));
  };

  // Handle clearing all draws
  const handleClearAll = () => {
    if (isStorageEnabled) {
      historicalStorage.clearAll();
    }
    setDraws([]);
  };

  // Handle storage toggle
  const handleStorageToggle = (enabled: boolean) => {
    historicalStorage.setEnabled(enabled);
    setIsStorageEnabled(enabled);
  };

  // Filter draws by lottery type
  const filteredDraws = filterType === 'all'
    ? draws
    : draws.filter(d => d.lotteryType === filterType);

  return (
    <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 max-w-7xl">
      {/* Header */}
      <div className="text-center mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 sm:mb-3 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
          历史开奖分析
        </h1>
        <p className="text-muted-foreground text-xs sm:text-sm md:text-base">
          添加历史开奖数据，查看统计分析与号码推荐
        </p>
      </div>

      {/* Input Form */}
      <DrawInputForm
        onSubmit={handleAddDraw}
        storageEnabled={isStorageEnabled}
        onStorageToggle={handleStorageToggle}
      />

      {/* Draw List */}
      <DrawList
        draws={filteredDraws}
        filterType={filterType}
        onFilterChange={setFilterType}
        onDelete={handleDeleteDraw}
        onClearAll={handleClearAll}
      />

      {/* Analysis Dashboard - will be added in Phase 3 */}
      {draws.length >= 1 && (
        <div className="mt-6 p-6 bg-muted/20 rounded-xl border border-dashed border-muted-foreground/30 text-center">
          <p className="text-muted-foreground">
            统计分析功能将在后续阶段实现
          </p>
          <p className="text-sm text-muted-foreground/70 mt-1">
            当前已添加 {draws.length} 期数据
          </p>
        </div>
      )}
    </div>
  );
}
