import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { LotteryGenerator as LottoGen } from '@/lib/lottery/generator';
import { LotteryType, NumberBall as NumberBallType, GenerationHistory } from '@/lib/lottery/types';
import { NumberBall } from './NumberBall';
import { LotteryCard } from './LotteryCard';
import { HistoryPanel } from './HistoryPanel';
import { Shuffle, Sparkles, Dice1, Trash2 } from 'lucide-react';

export function LotteryGenerator() {
  const [selectedType, setSelectedType] = useState<LotteryType>(LotteryType.DOUBLE_COLOR);
  const [generatedNumbers, setGeneratedNumbers] = useState<NumberBallType[][]>([]);
  const [groupCount, setGroupCount] = useState([5]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [history, setHistory] = useState<GenerationHistory[]>([]);
  const [prefillNotice, setPrefillNotice] = useState(false);

  // Check for prefill numbers from recommendations
  useEffect(() => {
    const prefillData = sessionStorage.getItem('prefillNumbers');
    if (prefillData) {
      try {
        const data = JSON.parse(prefillData);
        setSelectedType(data.lotteryType);

        // Convert numbers to NumberBall format
        const balls: NumberBallType[] = data.numbers.map((n: number) => ({
          value: n,
          color: 'red'
        }));

        if (data.specialNumbers) {
          data.specialNumbers.forEach((n: number) => {
            balls.push({ value: n, color: 'blue', isSpecial: true });
          });
        }

        setGeneratedNumbers([balls]);
        setPrefillNotice(true);

        // Clear sessionStorage after using
        sessionStorage.removeItem('prefillNumbers');

        // Hide notice after 5 seconds
        setTimeout(() => setPrefillNotice(false), 5000);
      } catch (e) {
        console.error('Failed to parse prefill data:', e);
      }
    }
  }, []);

  const handleGenerate = () => {
    setIsAnimating(true);

    // 模拟动画延迟
    setTimeout(() => {
      const results = LottoGen.generateMultiple(selectedType, groupCount[0]);
      setGeneratedNumbers(results);

      // 添加到历史记录
      const newEntry: GenerationHistory = {
        id: crypto.randomUUID?.() || Math.random().toString(36).substring(2, 15),
        lotteryType: selectedType,
        results,
        timestamp: Date.now(),
        saved: true
      };

      setHistory(prev => [newEntry, ...prev].slice(0, 10));
      setIsAnimating(false);
    }, 400);
  };

  const handleClearHistory = () => {
    setHistory([]);
  };

  const lotteryTypes = [
    {
      type: LotteryType.DOUBLE_COLOR,
      name: '双色球',
      description: '6红+1蓝',
      icon: '🔴🔵'
    },
    {
      type: LotteryType.SUPER_LOTTO,
      name: '大乐透',
      description: '5前+2后',
      icon: '🔵🟢'
    },
    {
      type: LotteryType.HAPPY_8,
      name: '快乐8',
      description: '选1-10个',
      icon: '🟢'
    },
    {
      type: LotteryType.FUCAI_3D,
      name: '福彩3D',
      description: '3位数字',
      icon: '🟡'
    }
  ];

  const selectedLottery = lotteryTypes.find(l => l.type === selectedType);

  return (
    <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8 max-w-6xl">
      {/* 标题 */}
      <div className="text-center mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-2 sm:mb-3 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 bg-clip-text text-transparent">
          彩票号码生成器
        </h1>
        <p className="text-muted-foreground text-xs sm:text-sm md:text-base">
          基于 Web Crypto API 加密级随机数生成，公平公正
        </p>
      </div>

      {/* Prefill Notice */}
      {prefillNotice && (
        <div className="mb-4 p-3 bg-green-500/10 border border-green-500/30 rounded-lg flex items-center gap-3">
          <Sparkles className="w-5 h-5 text-green-500" />
          <p className="text-sm text-green-700 dark:text-green-400">
            已填入推荐号码！点击"生成号码"可生成新的随机号码。
          </p>
        </div>
      )}

      <div className="grid gap-4 sm:gap-6 lg:grid-cols-3">
        {/* 左侧：选择器和控制面板 */}
        <div className="lg:col-span-1 space-y-3 sm:space-y-4">
          <Card>
            <CardHeader className="pb-3 sm:pb-6">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <Dice1 className="w-4 h-4 sm:w-5 sm:h-5" />
                选择彩票类型
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">选择您要生成的彩票类型</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {lotteryTypes.map((lottery) => (
                <LotteryCard
                  key={lottery.type}
                  type={lottery.type}
                  selected={selectedType === lottery.type}
                  onClick={() => setSelectedType(lottery.type)}
                  icon={lottery.icon}
                  description={lottery.description}
                />
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3 sm:pb-6">
              <CardTitle className="text-base sm:text-lg">生成设置</CardTitle>
              <CardDescription className="text-xs sm:text-sm">设置生成组数</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 sm:space-y-5">
              <div>
                <div className="flex justify-between mb-2 sm:mb-3">
                  <label className="text-sm font-medium">生成组数</label>
                  <span className="text-sm font-semibold text-primary">{groupCount[0]} 组</span>
                </div>
                <div className="h-8 sm:h-auto">
                  <Slider
                    value={groupCount}
                    onValueChange={setGroupCount}
                    min={1}
                    max={10}
                    step={1}
                    className="w-full"
                  />
                </div>
                <div className="flex justify-between mt-1 text-xs text-muted-foreground">
                  <span>1组</span>
                  <span>5组</span>
                  <span>10组</span>
                </div>
              </div>

              <Button
                onClick={handleGenerate}
                disabled={isAnimating}
                className="w-full h-12 sm:h-auto"
                size="lg"
              >
                {isAnimating ? (
                  <>
                    <Shuffle className="mr-2 h-4 w-4 animate-spin" />
                    生成中...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    生成号码
                  </>
                )}
              </Button>

              {generatedNumbers.length > 0 && (
                <Button
                  onClick={() => setGeneratedNumbers([])}
                  variant="outline"
                  className="w-full h-10 sm:h-auto"
                  size="sm"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  清空结果
                </Button>
              )}
            </CardContent>
          </Card>
        </div>

        {/* 右侧：结果显示 */}
        <div className="lg:col-span-2 space-y-3 sm:space-y-4">
          {generatedNumbers.length > 0 ? (
            <Card className="border-primary/20">
              <CardHeader className="pb-3 sm:pb-6">
                <CardTitle className="flex items-center justify-between text-base sm:text-lg flex-wrap gap-2">
                  <span>生成结果</span>
                  <span className="text-xs sm:text-sm font-normal text-muted-foreground">
                    {selectedLottery?.name}
                    {groupCount[0] > 1 && ` - ${groupCount[0]}组号码`}
                  </span>
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  {generatedNumbers.length} 组号码，共 {generatedNumbers.flat().length} 个球
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 sm:space-y-4 max-h-[400px] sm:max-h-[500px] lg:max-h-[600px] overflow-y-auto pr-1 sm:pr-2">
                  {generatedNumbers.map((group, groupIndex) => (
                    <div
                      key={groupIndex}
                      className="p-3 sm:p-5 bg-gradient-to-br from-background via-background to-muted/20 rounded-xl border border-border/50"
                    >
                      <div className="flex items-center gap-2 mb-3 sm:mb-4">
                        <div className="px-2 sm:px-3 py-1 bg-primary/10 text-primary rounded-full text-xs sm:text-sm font-medium">
                          第 {groupIndex + 1} 组
                        </div>
                        <div className="text-xs sm:text-sm text-muted-foreground">
                          {group.filter(b => !b.isSpecial).length} 个主号
                          {group.filter(b => b.isSpecial).length > 0 && (
                            <> + {group.filter(b => b.isSpecial).length} 个特别号</>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 sm:gap-3 justify-center">
                        {group.map((ball, ballIndex) => (
                          <NumberBall
                            key={ballIndex}
                            ball={ball}
                            size="md"
                            animated={!isAnimating}
                            index={ballIndex}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-dashed border-2">
              <CardContent className="flex flex-col items-center justify-center py-12 sm:py-20">
                <div className="w-16 h-16 sm:w-20 sm:h-20 mb-4 sm:mb-5 rounded-full bg-primary/10 flex items-center justify-center">
                  <Shuffle className="w-8 h-8 sm:w-10 sm:h-10 text-primary" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold mb-2">准备生成</h3>
                <p className="text-muted-foreground text-center text-sm sm:text-base max-w-md px-4">
                  选择彩票类型和生成组数，然后点击"生成号码"按钮开始
                </p>
              </CardContent>
            </Card>
          )}

          {/* 历史记录 */}
          <HistoryPanel history={history} onClear={handleClearHistory} />
        </div>
      </div>
    </div>
  );
}
