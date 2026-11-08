import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Target,
  BarChart2,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Layers,
  Sparkles,
  Flame,
  Award,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
} from 'recharts';
import { Trade, TradingStats } from '../types/trade';
import {
  formatCurrency,
  formatPercent,
  generateEquityCurve,
  formatFullDateTime,
} from '../utils/calculations';

interface DashboardViewProps {
  trades: Trade[];
  stats: TradingStats;
  initialCapital: number;
  onNavigateToJournal: () => void;
  onOpenTradeModal: () => void;
  onEditTrade: (trade: Trade) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  trades,
  stats,
  initialCapital,
  onNavigateToJournal,
  onOpenTradeModal,
  onEditTrade,
}) => {
  const [timeframe, setTimeframe] = useState<'ALL' | '30D' | '90D'>('ALL');

  // Filter trades based on timeframe for the equity curve
  const filteredForChart = useMemo(() => {
    if (timeframe === 'ALL') return trades;
    const now = Date.now();
    const days = timeframe === '30D' ? 30 : 90;
    const cutoff = now - days * 24 * 60 * 60 * 1000;
    return trades.filter((t) => new Date(t.date).getTime() >= cutoff);
  }, [trades, timeframe]);

  const equityPoints = useMemo(
    () => generateEquityCurve(filteredForChart, initialCapital),
    [filteredForChart, initialCapital]
  );

  const recentTrades = useMemo(() => {
    return [...trades]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
  }, [trades]);

  // Session stats calculation
  const sessionBreakdown = useMemo(() => {
    const map = new Map<string, { wins: number; total: number; pnl: number }>();
    trades.forEach((t) => {
      const sess = t.session || 'Other';
      const existing = map.get(sess) || { wins: 0, total: 0, pnl: 0 };
      existing.total += 1;
      existing.pnl += t.pnl;
      if (t.pnl > 0 || t.result === 'Win') existing.wins += 1;
      map.set(sess, existing);
    });
    return Array.from(map.entries()).map(([session, data]) => ({
      session,
      total: data.total,
      wins: data.wins,
      winRate: data.total > 0 ? (data.wins / data.total) * 100 : 0,
      pnl: data.pnl,
    }));
  }, [trades]);

  const isNetProfit = stats.totalPnL >= 0;

  return (
    <div className="space-y-4 sm:space-y-6 pb-24 md:pb-8">
      {/* Top Banner: Account Health & Paper Status */}
      <div className="fintech-card rounded-2xl p-3.5 sm:p-5 relative overflow-hidden">
        {/* Subtle radial ambient light */}
        <div className="absolute top-0 right-0 w-80 h-32 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500/20 to-blue-600/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0 shadow-sm">
              <Sparkles className="w-5 h-5 text-cyan-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm sm:text-base font-bold text-white tracking-tight">
                  Educational Paper Simulation
                </span>
                <span className="text-[10px] sm:text-xs font-mono font-semibold px-2 py-0.5 rounded-full bg-cyan-400/10 text-cyan-300 border border-cyan-400/25">
                  LIVE LOCAL DATA
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Real-time metrics, risk modeling, and psychology journal for paper execution.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4 text-xs font-mono text-slate-400 self-stretch sm:self-auto justify-between sm:justify-end bg-slate-900/60 p-2 sm:p-0 rounded-lg sm:bg-transparent border sm:border-0 border-slate-800">
            <div>
              <span className="text-slate-400 block text-[10px]">Baseline:</span>
              <strong className="text-slate-200">{formatCurrency(initialCapital, false)}</strong>
            </div>
            <span className="text-slate-700">|</span>
            <div>
              <span className="text-slate-400 block text-[10px]">Simulated Balance:</span>
              <strong className="text-cyan-300">{formatCurrency(stats.currentBalance, false)}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        {/* Card 1: Total Simulated PnL */}
        <div className="fintech-card rounded-2xl p-3.5 sm:p-5 relative group">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-medium truncate">Simulated Net PnL</span>
            <div
              className={`p-1.5 rounded-lg ${
                isNetProfit ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
              }`}
            >
              {isNetProfit ? (
                <TrendingUp className="w-3.5 h-3.5" />
              ) : (
                <TrendingDown className="w-3.5 h-3.5" />
              )}
            </div>
          </div>
          <div className="mt-2">
            <span
              className={`text-lg sm:text-2xl font-bold font-mono tabular-nums tracking-tight ${
                isNetProfit ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {formatCurrency(stats.totalPnL)}
            </span>
          </div>
          <div className="mt-1.5 flex items-center gap-1.5 text-[11px] font-mono text-slate-400 truncate">
            <span className={stats.netReturnPercent >= 0 ? 'text-emerald-400 font-semibold' : 'text-rose-400 font-semibold'}>
              {formatPercent(stats.netReturnPercent)}
            </span>
            <span>growth</span>
          </div>
        </div>

        {/* Card 2: Win Rate */}
        <div className="fintech-card rounded-2xl p-3.5 sm:p-5 relative group">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-medium truncate">Win Rate</span>
            <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400">
              <Target className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-lg sm:text-2xl font-bold font-mono text-cyan-300 tabular-nums tracking-tight">
              {formatPercent(stats.winRate, false)}
            </span>
          </div>
          <div className="mt-1.5 flex items-center gap-1 text-[11px] font-mono text-slate-400 truncate">
            <span className="text-emerald-400">{stats.winningTrades}W</span>
            <span>·</span>
            <span className="text-rose-400">{stats.losingTrades}L</span>
            <span>·</span>
            <span className="text-slate-400">{stats.breakevenTrades}BE</span>
          </div>
        </div>

        {/* Card 3: Total Trades & Profit Factor */}
        <div className="fintech-card rounded-2xl p-3.5 sm:p-5 relative group">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-medium truncate">Profit Factor</span>
            <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400">
              <Award className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-lg sm:text-2xl font-bold font-mono text-white tabular-nums tracking-tight">
              {stats.profitFactor.toFixed(2)}
            </span>
          </div>
          <div className="mt-1.5 flex items-center gap-1.5 text-[11px] font-mono text-slate-400 truncate">
            <span>{stats.totalTrades} Executions</span>
            <span>·</span>
            <span className="text-slate-300">
              {stats.currentStreak > 0 ? `+${stats.currentStreak} streak` : `${stats.currentStreak} streak`}
            </span>
          </div>
        </div>

        {/* Card 4: Average PnL */}
        <div className="fintech-card rounded-2xl p-3.5 sm:p-5 relative group">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-medium truncate">Avg Trade PnL</span>
            <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400">
              <BarChart2 className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2">
            <span
              className={`text-lg sm:text-2xl font-bold font-mono tabular-nums tracking-tight ${
                stats.averagePnL >= 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {formatCurrency(stats.averagePnL)}
            </span>
          </div>
          <div className="mt-1.5 flex items-center gap-1 text-[11px] font-mono text-slate-400 truncate">
            <span className="text-emerald-400">+{formatCurrency(stats.averageWin, false)}</span>
            <span>avg win</span>
          </div>
        </div>
      </div>

      {/* Win / Loss / Breakeven Segmented Ratio Bar */}
      {stats.totalTrades > 0 && (
        <div className="fintech-card rounded-2xl p-4 sm:p-5 space-y-2.5">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="font-semibold text-slate-200">Outcome Distribution</span>
            <div className="flex items-center gap-3 text-[11px]">
              <span className="text-emerald-400 font-semibold">{stats.winningTrades} Wins ({((stats.winningTrades / stats.totalTrades) * 100).toFixed(0)}%)</span>
              <span className="text-rose-400 font-semibold">{stats.losingTrades} Losses ({((stats.losingTrades / stats.totalTrades) * 100).toFixed(0)}%)</span>
              {stats.breakevenTrades > 0 && (
                <span className="text-slate-400">{stats.breakevenTrades} BE</span>
              )}
            </div>
          </div>

          <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden flex p-0.5 gap-0.5">
            <div
              className="bg-emerald-500 h-full rounded-sm transition-all duration-700"
              style={{ width: `${(stats.winningTrades / stats.totalTrades) * 100}%` }}
              title={`Wins: ${stats.winningTrades}`}
            />
            <div
              className="bg-rose-500 h-full rounded-sm transition-all duration-700"
              style={{ width: `${(stats.losingTrades / stats.totalTrades) * 100}%` }}
              title={`Losses: ${stats.losingTrades}`}
            />
            {stats.breakevenTrades > 0 && (
              <div
                className="bg-slate-600 h-full rounded-sm transition-all duration-700"
                style={{ width: `${(stats.breakevenTrades / stats.totalTrades) * 100}%` }}
                title={`Breakeven: ${stats.breakevenTrades}`}
              />
            )}
          </div>
        </div>
      )}

      {/* Equity Curve Chart Section */}
      <div className="fintech-card rounded-2xl p-4 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
              <span>Simulated Equity Curve</span>
              <span className="text-xs font-mono font-normal text-cyan-400">
                ({equityPoints.length - 1} records)
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Cumulative paper balance trajectory over execution sequence.
            </p>
          </div>

          {/* Timeframe selector tabs */}
          <div className="flex items-center gap-1 p-1 bg-slate-900/90 rounded-lg border border-slate-800 text-[11px] font-mono self-start sm:self-auto">
            {(['ALL', '30D', '90D'] as const).map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-3 py-1 rounded-md transition-colors ${
                  timeframe === tf
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-semibold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>
        </div>

        {/* Recharts Area Curve */}
        <div className="h-64 sm:h-72 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={equityPoints} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="equityGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                  <stop offset="50%" stopColor="#2563eb" stopOpacity={0.15} />
                  <stop offset="100%" stopColor="#06b6d4" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="date"
                stroke="#475569"
                fontSize={10}
                tickLine={false}
                axisLine={{ stroke: '#1e293b' }}
              />
              <YAxis
                stroke="#475569"
                fontSize={10}
                tickLine={false}
                axisLine={{ stroke: '#1e293b' }}
                tickFormatter={(v) => `$${(v / 1000).toFixed(1)}k`}
                domain={['auto', 'auto']}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="rounded-xl border border-slate-700/80 bg-[#0a101d]/95 p-3 text-xs shadow-2xl backdrop-blur-md">
                        <div className="font-bold text-white mb-1.5 flex items-center justify-between gap-3">
                          <span>{data.symbol ? `${data.symbol}` : 'Starting Capital'}</span>
                          <span className="text-[10px] text-slate-400 font-normal">{data.date}</span>
                        </div>
                        <div className="space-y-1 font-mono">
                          <div className="flex justify-between gap-5 text-slate-400">
                            <span>Balance:</span>
                            <span className="text-cyan-300 font-bold">
                              {formatCurrency(data.equity, false)}
                            </span>
                          </div>
                          {data.pnl !== undefined && data.index > 0 && (
                            <div className="flex justify-between gap-5 text-slate-400">
                              <span>Trade Result:</span>
                              <span
                                className={`font-semibold ${
                                  data.pnl >= 0 ? 'text-emerald-400' : 'text-rose-400'
                                }`}
                              >
                                {formatCurrency(data.pnl)}
                              </span>
                            </div>
                          )}
                          {data.drawdown > 0 && (
                            <div className="flex justify-between gap-5 text-slate-400">
                              <span>Drawdown:</span>
                              <span className="text-amber-400">
                                -{formatCurrency(data.drawdown, false)}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <ReferenceLine
                y={initialCapital}
                stroke="#475569"
                strokeDasharray="3 3"
                label={{
                  value: 'Baseline',
                  position: 'insideBottomRight',
                  fill: '#64748b',
                  fontSize: 10,
                }}
              />
              <Area
                type="monotone"
                dataKey="equity"
                stroke="#06b6d4"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#equityGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Secondary metrics strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-slate-800/80 text-xs">
          <div>
            <span className="text-slate-400 block text-[11px] mb-0.5">Best Execution</span>
            <span className="font-mono font-bold text-emerald-400 tabular-nums">
              +{formatCurrency(stats.bestTrade, false)}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px] mb-0.5">Worst Execution</span>
            <span className="font-mono font-bold text-rose-400 tabular-nums">
              {formatCurrency(stats.worstTrade)}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px] mb-0.5">Max Drawdown</span>
            <span className="font-mono font-bold text-amber-400 tabular-nums">
              -{formatCurrency(stats.maxDrawdown, false)} ({stats.maxDrawdownPercent.toFixed(1)}%)
            </span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px] mb-0.5">Long vs Short Win</span>
            <span className="font-mono font-bold text-slate-200 tabular-nums">
              {stats.longWinRate.toFixed(0)}% / {stats.shortWinRate.toFixed(0)}%
            </span>
          </div>
        </div>
      </div>

      {/* Two Column Section: Session Breakdown & Recent Executions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Session Performance Card */}
        <div className="fintech-card rounded-2xl p-4 sm:p-5 shadow-sm">
          <h2 className="text-sm font-bold text-white flex items-center justify-between mb-4">
            <span className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              <span>Session Performance</span>
            </span>
            <span className="text-xs text-slate-400 font-mono font-normal">Win %</span>
          </h2>

          <div className="space-y-4">
            {sessionBreakdown.map((item) => (
              <div key={item.session} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-slate-200">{item.session}</span>
                    <span className="text-slate-400 font-mono text-[11px]">
                      ({item.total}t)
                    </span>
                  </div>
                  <div className="flex items-center gap-2 font-mono">
                    <span
                      className={`text-[11px] font-semibold ${
                        item.pnl >= 0 ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {formatCurrency(item.pnl)}
                    </span>
                    <span className="text-cyan-400 font-bold">
                      {formatPercent(item.winRate, false)}
                    </span>
                  </div>
                </div>
                <div className="w-full bg-slate-800/80 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-cyan-400 to-blue-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, Math.max(0, item.winRate))}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Trades Preview */}
        <div className="lg:col-span-2 fintech-card rounded-2xl p-4 sm:p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3.5">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-400" />
              <span>Recent Executions</span>
            </h2>
            <button
              onClick={onNavigateToJournal}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-medium flex items-center gap-1 transition-colors"
            >
              <span>View All ({trades.length})</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {recentTrades.length === 0 ? (
            <div className="text-center py-8 text-slate-500 text-xs space-y-2">
              <p>No simulated trades recorded yet.</p>
              <button
                onClick={onOpenTradeModal}
                className="text-cyan-400 hover:underline font-semibold"
              >
                Log your first practice trade
              </button>
            </div>
          ) : (
            <div className="divide-y divide-slate-800/70">
              {recentTrades.map((trade) => (
                <div
                  key={trade.id}
                  onClick={() => onEditTrade(trade)}
                  className="py-2.5 sm:py-3 flex items-center justify-between hover:bg-slate-800/40 px-2.5 -mx-2.5 rounded-xl cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 shadow-sm ${
                        trade.direction === 'Long'
                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                          : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                      }`}
                    >
                      {trade.direction === 'Long' ? (
                        <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
                      ) : (
                        <ArrowDownRight className="w-4 h-4 stroke-[2.5]" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-xs sm:text-sm font-mono">
                          {trade.symbol}
                        </span>
                        <span className="text-[10px] sm:text-[11px] text-slate-400 font-mono">
                          {trade.session}
                        </span>
                      </div>
                      <div className="text-[10px] sm:text-[11px] text-slate-400 font-mono">
                        {formatFullDateTime(trade.date)}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div
                      className={`text-xs sm:text-sm font-bold font-mono tabular-nums ${
                        trade.pnl > 0
                          ? 'text-emerald-400'
                          : trade.pnl < 0
                          ? 'text-rose-400'
                          : 'text-slate-400'
                      }`}
                    >
                      {formatCurrency(trade.pnl)}
                    </div>
                    <div className="text-[10px] sm:text-[11px] font-mono font-medium text-slate-400">
                      {trade.result}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
