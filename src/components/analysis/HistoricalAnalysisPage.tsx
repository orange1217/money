import { useState, useEffect } from 'react';
import { LotteryType } from '@/lib/lottery/types';
import { HistoricalDraw } from '@/types/analysis';
import { historicalStorage } from '@/lib/analysis/historicalStorage';
import { DrawInputForm } from './DrawInputForm';
import { DrawList } from './DrawList';
import { StatisticsPanel } from './StatisticsPanel';
import { AdvancedAnalysisPanel } from './AdvancedAnalysisPanel';
import { ChartsPanel } from './ChartsPanel';
import { RecommendationsPanel } from './RecommendationsPanel';
import { Button } from '@/components/ui/button';
import { addSampleData } from '@/lib/analysis/sampleData';
import { Database } from 'lucide-react';

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

  // Handle adding sample data
  const handleAddSampleData = () => {
    const newDraws = addSampleData();
    setDraws(newDraws);
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
        <p className="text-muted-foreground text-xs sm:text-sm md:text-base mb-4">
          添加历史开奖数据，查看统计分析与号码推荐
        </p>
        {draws.length < 5 && (
          <Button
            onClick={handleAddSampleData}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <Database className="w-4 h-4" />
            添加示例数据 (共32期)
          </Button>
        )}
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

      {/* Analysis Dashboard - Statistics Panel */}
      {draws.length >= 1 && (
        <div className="mt-6">
          <div className="mb-4">
            <h2 className="text-xl sm:text-2xl font-bold">统计分析</h2>
          </div>
          <StatisticsPanel draws={filteredDraws} filterType={filterType} />
        </div>
      )}

      {/* Advanced Analysis Panel */}
      {draws.length >= 1 && (
        <div className="mt-6">
          <div className="mb-4">
            <h2 className="text-xl sm:text-2xl font-bold">高级分析</h2>
          </div>
          <AdvancedAnalysisPanel draws={filteredDraws} filterType={filterType} />
        </div>
      )}

      {/* Charts Panel */}
      {draws.length >= 1 && (
        <div className="mt-6">
          <div className="mb-4">
            <h2 className="text-xl sm:text-2xl font-bold">数据图表</h2>
          </div>
          <ChartsPanel draws={filteredDraws} filterType={filterType} />
        </div>
      )}

      {/* Recommendations Panel */}
      {draws.length >= 1 && (
        <div className="mt-6">
          <RecommendationsPanel draws={filteredDraws} filterType={filterType} />
        </div>
      )}
    </div>
  );
}
