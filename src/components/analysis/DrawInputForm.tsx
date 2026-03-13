import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LotteryType } from '@/lib/lottery/types';
import { HistoricalDraw, NumberRangeConfig, ValidationResult } from '@/types/analysis';
import { Plus } from 'lucide-react';

// Number range configuration for each lottery type
const NUMBER_RANGES: Record<LotteryType, NumberRangeConfig> = {
  [LotteryType.DOUBLE_COLOR]: {
    mainRange: [1, 33],
    mainCount: 6,
    specialRange: [1, 16],
    specialCount: 1,
    allowDuplicates: false
  },
  [LotteryType.SUPER_LOTTO]: {
    mainRange: [1, 35],
    mainCount: 5,
    specialRange: [1, 12],
    specialCount: 2,
    allowDuplicates: false
  },
  [LotteryType.HAPPY_8]: {
    mainRange: [1, 80],
    mainCount: 10,
    allowDuplicates: false
  },
  [LotteryType.FUCAI_3D]: {
    mainRange: [0, 9],
    mainCount: 3,
    allowDuplicates: true
  }
};

interface DrawInputFormProps {
  onSubmit: (draw: HistoricalDraw) => void;
  storageEnabled: boolean;
  onStorageToggle: (enabled: boolean) => void;
}

export function DrawInputForm({ onSubmit, storageEnabled, onStorageToggle }: DrawInputFormProps) {
  const [lotteryType, setLotteryType] = useState<LotteryType>(LotteryType.DOUBLE_COLOR);
  const [drawNumber, setDrawNumber] = useState('');
  const [drawDate, setDrawDate] = useState(new Date().toISOString().split('T')[0]);
  const [numbers, setNumbers] = useState<number[]>([]);
  const [specialNumbers, setSpecialNumbers] = useState<number[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Reset numbers when lottery type changes
  useEffect(() => {
    const config = NUMBER_RANGES[lotteryType];
    setNumbers(new Array(config.mainCount).fill(0));
    setSpecialNumbers(new Array(config.specialCount || 0).fill(0));
    setErrors({});
  }, [lotteryType]);

  const config = NUMBER_RANGES[lotteryType];

  // Validate form inputs
  const validateForm = (): ValidationResult => {
    const newErrors: Record<string, string> = {};

    // Validate draw number format: YYYY + number
    if (!drawNumber || !/^\d{4}\d{3,4}$/.test(drawNumber)) {
      newErrors.drawNumber = '期号格式错误，应为：2024001';
    }

    // Validate date not in future
    const selectedDate = new Date(drawDate);
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    if (selectedDate > today) {
      newErrors.drawDate = '开奖日期不能是未来';
    }

    // Validate main numbers
    const [minMain, maxMain] = config.mainRange;
    const validNumbers = numbers.filter(n => n >= minMain && n <= maxMain);

    if (validNumbers.length !== config.mainCount) {
      newErrors.numbers = `主号数量不足或超出范围 (${minMain}-${maxMain})`;
    }

    if (!config.allowDuplicates) {
      const uniqueNumbers = new Set(validNumbers);
      if (uniqueNumbers.size !== validNumbers.length) {
        newErrors.numbers = '号码不能重复';
      }
    }

    // Validate special numbers if required
    if (config.specialCount && config.specialRange) {
      const [minSpecial, maxSpecial] = config.specialRange;
      const validSpecial = specialNumbers.filter(n => n >= minSpecial && n <= maxSpecial);

      if (validSpecial.length !== config.specialCount) {
        newErrors.specialNumbers = `特别号数量不足或超出范围 (${minSpecial}-${maxSpecial})`;
      }

      const uniqueSpecial = new Set(validSpecial);
      if (uniqueSpecial.size !== validSpecial.length) {
        newErrors.specialNumbers = '特别号不能重复';
      }
    }

    return {
      valid: Object.keys(newErrors).length === 0,
      errors: newErrors
    };
  };

  // Handle number input change
  const handleNumberChange = (index: number, value: string, isSpecial: boolean = false) => {
    const num = parseInt(value) || 0;
    if (isSpecial) {
      const newSpecial = [...specialNumbers];
      newSpecial[index] = num;
      setSpecialNumbers(newSpecial);
    } else {
      const newNumbers = [...numbers];
      newNumbers[index] = num;
      setNumbers(newNumbers);
    }
    // Clear error for this field
    setErrors(prev => {
      const updated = { ...prev };
      if (isSpecial) {
        delete updated.specialNumbers;
      } else {
        delete updated.numbers;
      }
      return updated;
    });
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const validation = validateForm();
    if (!validation.valid) {
      setErrors(validation.errors);
      return;
    }

    const draw: HistoricalDraw = {
      id: crypto.randomUUID?.() || Math.random().toString(36).substring(2, 15),
      lotteryType,
      drawNumber,
      drawDate,
      numbers: [...numbers],
      specialNumbers: config.specialCount ? [...specialNumbers] : undefined,
      createdAt: Date.now()
    };

    onSubmit(draw);

    // Reset form
    setDrawNumber('');
    setDrawDate(new Date().toISOString().split('T')[0]);
    setNumbers(new Array(config.mainCount).fill(0));
    setSpecialNumbers(new Array(config.specialCount || 0).fill(0));
    setErrors({});
  };

  const lotteryTypeOptions = [
    { value: LotteryType.DOUBLE_COLOR, label: '双色球', icon: '🔴🔵' },
    { value: LotteryType.SUPER_LOTTO, label: '大乐透', icon: '🔵🟢' },
    { value: LotteryType.HAPPY_8, label: '快乐8', icon: '🟢' },
    { value: LotteryType.FUCAI_3D, label: '福彩3D', icon: '🟡' }
  ];

  const hasErrors = Object.keys(errors).length > 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="w-5 h-5" />
          添加开奖记录
        </CardTitle>
        <CardDescription>输入历史开奖号码以进行统计分析</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Lottery Type Selector */}
          <div>
            <label className="text-sm font-medium mb-2 block">彩票类型</label>
            <div className="flex flex-wrap gap-2">
              {lotteryTypeOptions.map(option => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setLotteryType(option.value)}
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                    lotteryType === option.value
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted hover:bg-muted/80'
                  }`}
                >
                  {option.icon} {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Draw Number and Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">期号</label>
              <input
                type="text"
                value={drawNumber}
                onChange={(e) => {
                  setDrawNumber(e.target.value);
                  setErrors(prev => {
                    const updated = { ...prev };
                    delete updated.drawNumber;
                    return updated;
                  });
                }}
                placeholder="2024001"
                className={`w-full px-3 py-2 rounded-lg border bg-background ${
                  errors.drawNumber ? 'border-destructive' : 'border-input'
                }`}
              />
              {errors.drawNumber && (
                <p className="text-xs text-destructive mt-1">{errors.drawNumber}</p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">开奖日期</label>
              <input
                type="date"
                value={drawDate}
                onChange={(e) => {
                  setDrawDate(e.target.value);
                  setErrors(prev => {
                    const updated = { ...prev };
                    delete updated.drawDate;
                    return updated;
                  });
                }}
                max={new Date().toISOString().split('T')[0]}
                className={`w-full px-3 py-2 rounded-lg border bg-background ${
                  errors.drawDate ? 'border-destructive' : 'border-input'
                }`}
              />
              {errors.drawDate && (
                <p className="text-xs text-destructive mt-1">{errors.drawDate}</p>
              )}
            </div>
          </div>

          {/* Main Numbers Input */}
          <div>
            <label className="text-sm font-medium mb-2 block">
              主号 ({config.mainRange[0]}-{config.mainRange[1]})
            </label>
            <div className="flex flex-wrap gap-2">
              {numbers.map((num, i) => (
                <input
                  key={i}
                  type="number"
                  min={config.mainRange[0]}
                  max={config.mainRange[1]}
                  value={num || ''}
                  onChange={(e) => handleNumberChange(i, e.target.value)}
                  className={`w-14 h-14 text-center text-lg font-semibold rounded-lg border bg-background ${
                    errors.numbers ? 'border-destructive' : 'border-input'
                  }`}
                />
              ))}
            </div>
            {errors.numbers && (
              <p className="text-xs text-destructive mt-1">{errors.numbers}</p>
            )}
          </div>

          {/* Special Numbers Input */}
          {config.specialCount && config.specialRange && (
            <div>
              <label className="text-sm font-medium mb-2 block">
                特别号 ({config.specialRange[0]}-{config.specialRange[1]})
              </label>
              <div className="flex flex-wrap gap-2">
                {specialNumbers.map((num, i) => (
                  <input
                    key={i}
                    type="number"
                    min={config.specialRange![0]}
                    max={config.specialRange![1]}
                    value={num || ''}
                    onChange={(e) => handleNumberChange(i, e.target.value, true)}
                    className={`w-14 h-14 text-center text-lg font-semibold rounded-lg border bg-background ${
                      errors.specialNumbers ? 'border-destructive' : 'border-input'
                    }`}
                  />
                ))}
              </div>
              {errors.specialNumbers && (
                <p className="text-xs text-destructive mt-1">{errors.specialNumbers}</p>
              )}
            </div>
          )}

          {/* Storage Toggle */}
          <div className="flex items-center justify-between py-2">
            <label className="text-sm font-medium">保存到本地存储</label>
            <button
              type="button"
              onClick={() => onStorageToggle(!storageEnabled)}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                storageEnabled ? 'bg-primary' : 'bg-muted'
              }`}
            >
              <span
                className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                  storageEnabled ? 'left-7' : 'left-1'
                }`}
              />
            </button>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full"
            disabled={hasErrors || !drawNumber}
          >
            <Plus className="w-4 h-4 mr-2" />
            添加记录
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
