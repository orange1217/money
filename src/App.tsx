import { LotteryGenerator } from './components/lottery/LotteryGenerator'

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50 dark:from-slate-950 dark:via-purple-950 dark:to-pink-950">
      <LotteryGenerator />

      {/* 页脚 */}
      <footer className="mt-8 sm:mt-12 lg:mt-16 py-6 sm:py-8 border-t border-border/40 bg-background/50 backdrop-blur-sm">
        <div className="container mx-auto px-3 sm:px-4 text-center">
          <p className="text-xs sm:text-sm text-muted-foreground mb-1 sm:mb-2">
            🔐 使用 Web Crypto API 加密级随机数生成，确保公平性
          </p>
          <p className="text-xs text-muted-foreground/80">
            ⚠️ 本工具仅供娱乐参考，请理性购彩，量力而行
          </p>
        </div>
      </footer>
    </div>
  )
}

export default App
