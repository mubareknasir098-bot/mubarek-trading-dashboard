import React from 'react';
import {
  ShieldCheck,
  TrendingUp,
  Target,
  BarChart3,
  Calendar,
  FileSpreadsheet,
  Download,
  RefreshCw,
  Trash2,
  SlidersHorizontal,
  Mail,
  AlertTriangle,
  Scale,
  Brain,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import { TradingStats } from '../types/trade';
import { formatCurrency, formatPercent } from '../utils/calculations';

interface AboutViewProps {
  stats: TradingStats;
  initialCapital: number;
  onOpenSettings: () => void;
  onResetDemo: () => void;
  onClearData: () => void;
  onExportCSV: () => void;
  onExportBackupJSON: () => void;
  onNavigateToJournal: () => void;
}

export const AboutView: React.FC<AboutViewProps> = ({
  stats,
  initialCapital,
  onOpenSettings,
  onResetDemo,
  onClearData,
  onExportCSV,
  onExportBackupJSON,
  onNavigateToJournal,
}) => {
  return (
    <div className="space-y-6 pb-24 md:pb-8 max-w-5xl mx-auto">
      {/* Hero Card */}
      <div className="fintech-card rounded-2xl p-5 sm:p-8 relative overflow-hidden shadow-xl border-cyan-500/30">
        <div className="absolute top-0 right-0 w-96 h-60 bg-gradient-to-bl from-cyan-500/15 via-blue-600/10 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-mono font-semibold">
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
              <span>EDUCATIONAL PAPER-TRADING SYSTEM</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Mubarek Trading Dashboard
            </h1>

            <p className="text-sm text-slate-300 leading-relaxed font-sans">
              A high-precision simulated trading journal and performance analytics platform engineered to help traders build edge, refine risk management discipline, and eliminate emotional decision-making through rigorous data tracking.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2 text-xs font-mono text-slate-400">
              <span className="flex items-center gap-1.5 text-slate-300">
                <Lock className="w-3.5 h-3.5 text-emerald-400" />
                <span>100% Client-Side Storage</span>
              </span>
              <span>·</span>
              <span className="text-cyan-300">Zero Cloud Data Leaks</span>
              <span>·</span>
              <span className="text-slate-300">No Broker Execution</span>
            </div>
          </div>

          {/* Quick Account Snapshot Card */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3 shrink-0 md:min-w-[240px]">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider block">
              Active Simulation Account
            </span>
            <div className="space-y-1 font-mono">
              <div className="text-2xl font-bold text-cyan-300 tabular-nums">
                {formatCurrency(stats.currentBalance, false)}
              </div>
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Baseline:</span>
                <span className="text-slate-200">{formatCurrency(initialCapital, false)}</span>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Net Growth:</span>
                <span
                  className={`font-semibold tabular-nums ${
                    stats.totalPnL >= 0 ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {formatPercent(stats.netReturnPercent)}
                </span>
              </div>
            </div>
            <button
              onClick={onOpenSettings}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 text-xs font-semibold text-slate-200 hover:text-white bg-slate-800 hover:bg-slate-700/80 rounded-xl transition-colors"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-cyan-400" />
              <span>Configure Capital</span>
            </button>
          </div>
        </div>
      </div>

      {/* Feature Capabilities Grid */}
      <div className="space-y-3">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-cyan-400" />
          <span>Core Platform Capabilities</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 sm:gap-4">
          {/* Feature 1 */}
          <div className="fintech-card rounded-2xl p-4 sm:p-5 space-y-2.5">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/25 flex items-center justify-center text-cyan-400">
              <Target className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white">Simulated Trade Journal</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Log executions across Forex, Crypto, Indices, and Equities. Record entry, exit, position size, session, setup strategy, and psychological reflections.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="fintech-card rounded-2xl p-4 sm:p-5 space-y-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/25 flex items-center justify-center text-blue-400">
              <Scale className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white">Dynamic Risk & R:R Engine</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Automatic Risk-to-Reward calculation and risk % allocation based on simulated portfolio balance. Protects against overleveraging.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="fintech-card rounded-2xl p-4 sm:p-5 space-y-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/25 flex items-center justify-center text-indigo-400">
              <BarChart3 className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white">Multi-Timeframe Analytics</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Analyze statistical edge across Daily, Weekly, and Monthly cycles. Monitor rolling win streaks, directional bias (Long vs Short), and drawdowns.
            </p>
          </div>

          {/* Feature 4 */}
          <div className="fintech-card rounded-2xl p-4 sm:p-5 space-y-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400">
              <Calendar className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white">Trading Calendar Heatmap</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Visual monthly calendar showing green and red performance days, execution counts, and an interactive single-click Day Inspector drawer.
            </p>
          </div>

          {/* Feature 5 */}
          <div className="fintech-card rounded-2xl p-4 sm:p-5 space-y-2.5">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/25 flex items-center justify-center text-cyan-300">
              <Brain className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white">Psychology & Discipline</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Tag trades with execution discipline flags (#Followed Plan, #FOMO Avoided, #Risk Respected) to identify mental habits that impact PnL.
            </p>
          </div>

          {/* Feature 6 */}
          <div className="fintech-card rounded-2xl p-4 sm:p-5 space-y-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/25 flex items-center justify-center text-purple-400">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white">Data Freedom & Privacy</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              All journal entries are saved in your browser's private localStorage. Export formatted CSV spreadsheets or download complete JSON backup files anytime.
            </p>
          </div>
        </div>
      </div>

      {/* Trading Philosophy & Rules */}
      <div className="fintech-card rounded-2xl p-5 sm:p-6 space-y-4">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-cyan-400" />
          <span>Core Paper-Trading Rules for Strategy Development</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-sans">
          <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 space-y-1.5">
            <span className="font-mono font-bold text-cyan-400 text-sm">01. The 1% Risk Rule</span>
            <p className="text-slate-300 leading-relaxed">
              Never risk more than 1% to 2% of total simulated balance on a single execution. This ensures you can survive a 10-trade losing streak without blowing up.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 space-y-1.5">
            <span className="font-mono font-bold text-cyan-400 text-sm">02. Asymmetrical R:R</span>
            <p className="text-slate-300 leading-relaxed">
              Target minimum 1.5R to 3R setups. A trader with a 40% win rate and a 2:1 reward-to-risk ratio remains consistently profitable mathematically.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 space-y-1.5">
            <span className="font-mono font-bold text-cyan-400 text-sm">03. Journal Every Trade</span>
            <p className="text-slate-300 leading-relaxed">
              The purpose of paper trading is not to boast fictional profits, but to collect clean statistical data on your setups, slippage, and psychological tendencies.
            </p>
          </div>
        </div>
      </div>

      {/* Quick Action Operations */}
      <div className="fintech-card rounded-2xl p-5 sm:p-6 space-y-4">
        <h2 className="text-base font-bold text-white flex items-center justify-between">
          <span className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-cyan-400" />
            <span>Database & Ledger Tools</span>
          </span>
          <span className="text-xs font-mono text-slate-400">
            {stats.totalTrades} Recorded Paper Trades
          </span>
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
          <button
            onClick={onResetDemo}
            className="flex flex-col items-center justify-center p-3 sm:p-4 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/40 text-slate-200 transition-colors group"
          >
            <RefreshCw className="w-5 h-5 text-cyan-400 mb-2 group-hover:rotate-180 transition-transform duration-500" />
            <span className="text-xs font-bold text-white">Reset Demo Data</span>
            <span className="text-[10px] text-slate-400 font-mono mt-0.5">Load 10 sample trades</span>
          </button>

          <button
            onClick={onExportCSV}
            className="flex flex-col items-center justify-center p-3 sm:p-4 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-emerald-500/40 text-slate-200 transition-colors group"
          >
            <FileSpreadsheet className="w-5 h-5 text-emerald-400 mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold text-white">Export CSV</span>
            <span className="text-[10px] text-slate-400 font-mono mt-0.5">Spreadsheet download</span>
          </button>

          <button
            onClick={onExportBackupJSON}
            className="flex flex-col items-center justify-center p-3 sm:p-4 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-blue-500/40 text-slate-200 transition-colors group"
          >
            <Download className="w-5 h-5 text-blue-400 mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold text-white">JSON Backup</span>
            <span className="text-[10px] text-slate-400 font-mono mt-0.5">Save full database</span>
          </button>

          <button
            onClick={onClearData}
            className="flex flex-col items-center justify-center p-3 sm:p-4 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 transition-colors group"
          >
            <Trash2 className="w-5 h-5 text-rose-400 mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold text-rose-300">Clear Ledger</span>
            <span className="text-[10px] text-rose-400/80 font-mono mt-0.5">Wipe all entries</span>
          </button>
        </div>
      </div>

      {/* Creator & Contact Details */}
      <div className="fintech-card rounded-2xl p-5 sm:p-6 space-y-3">
        <h2 className="text-sm font-bold text-white flex items-center gap-2">
          <Mail className="w-4 h-4 text-cyan-400" />
          <span>Creator & Feedback</span>
        </h2>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div>
            <p className="text-slate-300 font-medium">Developed by Mubarek</p>
            <p className="text-slate-400 font-mono text-[11px] mt-0.5">
              Trading educator and financial markets research engineer.
            </p>
          </div>
          <a
            href="mailto:mubarekforx@gmail.com"
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-cyan-300 hover:text-cyan-200 hover:border-cyan-500/40 font-mono text-xs transition-colors self-start sm:self-auto"
          >
            <Mail className="w-3.5 h-3.5" />
            <span>mubarekforx@gmail.com</span>
          </a>
        </div>
      </div>

      {/* Regulatory & Risk Disclaimer */}
      <div className="rounded-2xl p-4 sm:p-5 bg-amber-500/5 border border-amber-500/20 space-y-2 text-xs">
        <div className="flex items-center gap-2 text-amber-300 font-bold">
          <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
          <span>Educational Simulation & Paper-Trading Disclaimer</span>
        </div>
        <p className="text-slate-400 leading-relaxed text-[11px]">
          Mubarek Trading Dashboard is strictly an educational paper-trading journal application. It does not place live orders, execute financial transactions, or connect to brokerage accounts. All financial metrics, simulated PnL figures, balance figures, and charts are practice simulations recorded locally on your device. Nothing contained within this software constitutes financial, investment, legal, or tax advice. Trading financial markets carries substantial risk of loss and is not suitable for every individual.
        </p>
      </div>
    </div>
  );
};
