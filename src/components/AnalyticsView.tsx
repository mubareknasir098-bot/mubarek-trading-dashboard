import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  Cell,
} from 'recharts';
import {
  BarChart3,
  TrendingUp,
  Target,
  Scale,
  ShieldCheck,
  Flame,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Calendar,
  Clock,
} from 'lucide-react';
import { Trade, TradingStats, EquityPoint } from '../types/trade';
import {
  calculateMonthlyPerformance,
  calculateWeeklyPerformance,
  calculateDailyPerformanceList,
  generateEquityCurve,
  formatCurrency,
  formatPercent,
} from '../utils/calculations';

interface AnalyticsViewProps {
  trades: Trade[];
  stats: TradingStats;
  initialCapital?: number;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  trades,
  stats,
  initialCapital = 10000,
}) => {
  // Sub-tab for periodicity: 'daily' | 'weekly' | 'monthly'
  const [periodicity, setPeriodicity] = useState<'daily' | 'weekly' | 'monthly'>('monthly');

  // Chart timeframe state for analytics equity curve
  const [equityTimeframe, setEquityTimeframe] = useState<'ALL' | '30D' | '90D'>('ALL');
  const [equityMetricMode, setEquityMetricMode] = useState<'balance' | 'pnl'>('balance');

  // Filter trades for equity curve based on timeframe
  const filteredTradesForEquity = useMemo(() => {
    if (equityTimeframe === 'ALL') return trades;
    const now = Date.now();
    const days = equityTimeframe === '30D' ? 30 : 90;
    const cutoff = now - days * 24 * 60 * 60 * 1000;
    return trades.filter((t) => new Date(t.date).getTime() >= cutoff);
  }, [trades, equityTimeframe]);

  const equityPoints = useMemo(() => {
    const raw = generateEquityCurve(filteredTradesForEquity, initialCapital);
    if (equityMetricMode === 'pnl') {
      return raw.map((pt) => ({
        ...pt,
        displayValue: pt.equity - initialCapital,
      }));
    }
    return raw.map((pt) => ({
      ...pt,
      displayValue: pt.equity,
    }));
  }, [filteredTradesForEquity, initialCapital, equityMetricMode]);

  // Periodic performance datasets: Daily, Weekly, and Monthly
  const dailyData = useMemo(() => calculateDailyPerformanceList(trades), [trades]);
  const weeklyData = useMemo(() => calculateWeeklyPerformance(trades), [trades]);
  const monthlyData = useMemo(() => calculateMonthlyPerformance(trades), [trades]);

  // Strategy breakdown
  const strategyData = useMemo(() => {
    const map = new Map<
      string,
      { count: number; wins: number; losses: number; pnl: number }
    >();

    trades.forEach((t) => {
      const strat = t.strategy?.trim() || 'Discretionary';
      const curr = map.get(strat) || { count: 0, wins: 0, losses: 0, pnl: 0 };
      curr.count += 1;
      curr.pnl += t.pnl;
      if (t.pnl > 0 || t.result === 'Win') curr.wins += 1;
      else if (t.pnl < 0 || t.result === 'Loss') curr.losses += 1;
      map.set(strat, curr);
    });

    return Array.from(map.entries())
      .map(([name, val]) => ({
        name,
        count: val.count,
        wins: val.wins,
        losses: val.losses,
        winRate: val.count > 0 ? (val.wins / val.count) * 100 : 0,
        pnl: Math.round(val.pnl * 100) / 100,
      }))
      .sort((a, b) => b.pnl - a.pnl);
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

  // Rolling 5-Trade Win Rate Series (momentum/trend)
  const rollingWinRateData = useMemo(() => {
    const sorted = [...trades].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    if (sorted.length < 3) return [];

    const windowSize = Math.min(5, sorted.length);
    const series = [];

    for (let i = windowSize - 1; i < sorted.length; i++) {
      const windowTrades = sorted.slice(i - windowSize + 1, i + 1);
      const wins = windowTrades.filter((t) => t.result === 'Win' || t.pnl > 0).length;
      const rate = (wins / windowSize) * 100;
      series.push({
        tradeIndex: i + 1,
        tradeDate: sorted[i].date.split('T')[0],
        symbol: sorted[i].symbol,
        winRate: Math.round(rate),
      });
    }

    return series;
  }, [trades]);

  // Mathematical Expectancy per trade: (Win% * AvgWin) - (Loss% * AvgLoss)
  const expectancy = useMemo(() => {
    if (stats.totalTrades === 0) return 0;
    const winRateFrac = stats.winRate / 100;
    const lossRateFrac = (100 - stats.winRate) / 100;
    return winRateFrac * stats.averageWin - lossRateFrac * stats.averageLoss;
  }, [stats]);

  // Recovery factor: Total PnL / Max Drawdown
  const recoveryFactor = useMemo(() => {
    if (stats.maxDrawdown <= 0) return stats.totalPnL > 0 ? 99.99 : 0;
    return stats.totalPnL > 0 ? stats.totalPnL / stats.maxDrawdown : 0;
  }, [stats]);

  return (
    <div className="space-y-5 sm:space-y-6 pb-24 md:pb-8">
      {/* Top Statistical Pulse Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        {/* Card 1: Win Rate & Outcome */}
        <div className="fintech-card rounded-2xl p-3.5 sm:p-5 relative group">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold text-slate-300">Win Rate %</span>
            <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400">
              <Target className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-xl sm:text-2xl font-bold font-mono text-cyan-300 tabular-nums">
              {formatPercent(stats.winRate, false)}
            </span>
          </div>
          <div className="mt-1.5 flex items-center gap-1.5 text-[11px] font-mono text-slate-400 truncate">
            <span className="text-emerald-400 font-semibold">{stats.winningTrades}W</span>
            <span>·</span>
            <span className="text-rose-400 font-semibold">{stats.losingTrades}L</span>
            <span>·</span>
            <span className="text-slate-400">{stats.breakevenTrades}BE</span>
          </div>
        </div>

        {/* Card 2: Profit Factor */}
        <div className="fintech-card rounded-2xl p-3.5 sm:p-5 relative group">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold text-slate-300">Profit Factor</span>
            <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-xl sm:text-2xl font-bold font-mono text-white tabular-nums">
              {stats.profitFactor.toFixed(2)}
            </span>
          </div>
          <div className="mt-1.5 flex items-center gap-1 text-[11px] font-mono text-slate-400 truncate">
            <span>Avg Win:</span>
            <span className="text-emerald-400 font-semibold">+{formatCurrency(stats.averageWin, false)}</span>
          </div>
        </div>

        {/* Card 3: Mathematical Expectancy */}
        <div className="fintech-card rounded-2xl p-3.5 sm:p-5 relative group">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold text-slate-300">Edge / Expectancy</span>
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
              <Scale className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <span
              className={`text-xl sm:text-2xl font-bold font-mono tabular-nums ${
                expectancy >= 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {formatCurrency(expectancy)}
            </span>
          </div>
          <div className="mt-1.5 text-[11px] font-mono text-slate-400 truncate">
            <span>Avg loss: -{formatCurrency(stats.averageLoss, false)}</span>
          </div>
        </div>

        {/* Card 4: Max Drawdown */}
        <div className="fintech-card rounded-2xl p-3.5 sm:p-5 relative group">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold text-slate-300">Max Drawdown</span>
            <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-xl sm:text-2xl font-bold font-mono text-amber-400 tabular-nums">
              -{formatCurrency(stats.maxDrawdown, false)}
            </span>
          </div>
          <div className="mt-1.5 flex items-center gap-1.5 text-[11px] font-mono text-slate-400 truncate">
            <span>{stats.maxDrawdownPercent.toFixed(1)}% peak drop</span>
          </div>
        </div>
      </div>

      {/* SECTION 1: DETAILED EQUITY CURVE & CAPITAL TRAJECTORY */}
      <div className="fintech-card rounded-2xl p-4 sm:p-6 space-y-4 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-cyan-400" />
                <span>Simulated Equity & Capital Curve</span>
              </h2>
              <span className="text-[10px] sm:text-xs font-mono px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 font-semibold">
                {equityMetricMode === 'balance' ? 'PORTFOLIO BALANCE' : 'CUMULATIVE PNL'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Interactive trajectory from starting balance baseline with drawdown tracking.
            </p>
          </div>

          {/* Controls: Mode Switcher + Timeframe Filters */}
          <div className="flex items-center gap-2 flex-wrap self-start sm:self-auto">
            {/* Metric Mode Toggle */}
            <div className="flex items-center p-0.5 bg-slate-900 rounded-lg border border-slate-800 text-[11px] font-mono">
              <button
                onClick={() => setEquityMetricMode('balance')}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  equityMetricMode === 'balance'
                    ? 'bg-slate-800 text-cyan-300 font-bold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Balance ($)
              </button>
              <button
                onClick={() => setEquityMetricMode('pnl')}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  equityMetricMode === 'pnl'
                    ? 'bg-slate-800 text-cyan-300 font-bold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Net PnL ($)
              </button>
            </div>

            {/* Timeframe Filter */}
            <div className="flex items-center p-0.5 bg-slate-900 rounded-lg border border-slate-800 text-[11px] font-mono">
              {(['ALL', '30D', '90D'] as const).map((tf) => (
                <button
                  key={tf}
                  onClick={() => setEquityTimeframe(tf)}
                  className={`px-2.5 py-1 rounded-md transition-colors ${
                    equityTimeframe === tf
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {tf}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Equity Curve Chart */}
        <div className="h-64 sm:h-80 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={equityPoints} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="analyticsEquityGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.45} />
                  <stop offset="50%" stopColor="#2563eb" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
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
                tickFormatter={(v) =>
                  equityMetricMode === 'balance'
                    ? `$${(v / 1000).toFixed(1)}k`
                    : `$${v}`
                }
                domain={['auto', 'auto']}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="rounded-xl border border-slate-700/80 bg-[#0a101d]/95 p-3 text-xs shadow-2xl backdrop-blur-md">
                        <div className="font-bold text-white mb-1.5 flex items-center justify-between gap-4">
                          <span>{data.symbol ? `${data.symbol}` : 'Starting Capital'}</span>
                          <span className="text-[10px] text-slate-400 font-normal">{data.date}</span>
                        </div>
                        <div className="space-y-1 font-mono">
                          <div className="flex justify-between gap-5 text-slate-400">
                            <span>{equityMetricMode === 'balance' ? 'Current Balance:' : 'Cumulative PnL:'}</span>
                            <span className="text-cyan-300 font-bold">
                              {formatCurrency(data.displayValue, false)}
                            </span>
                          </div>
                          {data.pnl !== undefined && data.index > 0 && (
                            <div className="flex justify-between gap-5 text-slate-400">
                              <span>Execution PnL:</span>
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
                              <span>Current Drawdown:</span>
                              <span className="text-amber-400 font-semibold">
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
                y={equityMetricMode === 'balance' ? initialCapital : 0}
                stroke="#64748b"
                strokeDasharray="3 3"
                label={{
                  value: equityMetricMode === 'balance' ? 'Capital Baseline' : 'Breakeven',
                  position: 'insideBottomRight',
                  fill: '#64748b',
                  fontSize: 10,
                }}
              />
              <Area
                type="monotone"
                dataKey="displayValue"
                stroke="#06b6d4"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#analyticsEquityGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Equity Curve Metric Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-800/80 text-xs font-mono">
          <div>
            <span className="text-slate-400 block text-[10px] mb-0.5">Peak Balance</span>
            <span className="font-bold text-slate-100 tabular-nums">
              {formatCurrency(initialCapital + stats.totalPnL + stats.maxDrawdown, false)}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] mb-0.5">Current Balance</span>
            <span className="font-bold text-cyan-300 tabular-nums">
              {formatCurrency(stats.currentBalance, false)}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] mb-0.5">Net Portfolio Return</span>
            <span
              className={`font-bold tabular-nums ${
                stats.netReturnPercent >= 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {formatPercent(stats.netReturnPercent)}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] mb-0.5">Recovery Factor</span>
            <span className="font-bold text-blue-400 tabular-nums">
              {recoveryFactor.toFixed(2)}x
            </span>
          </div>
        </div>
      </div>

      {/* SECTION 2: DAILY, WEEKLY & MONTHLY PERFORMANCE ANALYTICS */}
      <div className="fintech-card rounded-2xl p-4 sm:p-6 space-y-4 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-cyan-400" />
              <span>Periodic Performance Analytics</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Multi-timeframe performance breakdown across Daily, Weekly, and Monthly cycles.
            </p>
          </div>

          {/* Periodicity Selector: Daily | Weekly | Monthly */}
          <div className="flex items-center p-1 bg-slate-900 rounded-xl border border-slate-800 text-xs font-mono self-start sm:self-auto">
            <button
              onClick={() => setPeriodicity('daily')}
              className={`px-3 py-1.5 rounded-lg transition-colors font-bold ${
                periodicity === 'daily'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Daily
            </button>
            <button
              onClick={() => setPeriodicity('weekly')}
              className={`px-3 py-1.5 rounded-lg transition-colors font-bold ${
                periodicity === 'weekly'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Weekly
            </button>
            <button
              onClick={() => setPeriodicity('monthly')}
              className={`px-3 py-1.5 rounded-lg transition-colors font-bold ${
                periodicity === 'monthly'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Monthly
            </button>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 text-xs font-mono text-slate-400 pt-1">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-cyan-400 inline-block" />
            <span>Profitable Period</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-rose-500 inline-block" />
            <span>Losing Period</span>
          </span>
        </div>

        {/* 1. DAILY VIEW */}
        {periodicity === 'daily' && (
          <div className="space-y-4">
            {dailyData.length === 0 ? (
              <div className="py-10 text-center text-slate-500 text-xs">No daily records logged yet.</div>
            ) : (
              <>
                <div className="h-60 sm:h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={dailyData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                      <XAxis dataKey="label" stroke="#475569" fontSize={10} tickLine={false} axisLine={{ stroke: '#1e293b' }} />
                      <YAxis stroke="#475569" fontSize={10} tickLine={false} axisLine={{ stroke: '#1e293b' }} tickFormatter={(v) => `$${v}`} />
                      <Tooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const d = payload[0].payload;
                            return (
                              <div className="rounded-xl border border-slate-700 bg-slate-900/95 p-3 text-xs font-mono shadow-xl backdrop-blur-md">
                                <div className="font-bold text-white mb-1">{d.date}</div>
                                <div className="space-y-1">
                                  <div className="flex justify-between gap-5 text-slate-400">
                                    <span>Daily Net PnL:</span>
                                    <span className={`font-bold ${d.pnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                      {formatCurrency(d.pnl)}
                                    </span>
                                  </div>
                                  <div className="flex justify-between gap-5 text-slate-400">
                                    <span>Executions:</span>
                                    <span className="text-white">{d.tradesCount} trades</span>
                                  </div>
                                  <div className="flex justify-between gap-5 text-slate-400">
                                    <span>Win Rate:</span>
                                    <span className="text-cyan-300">{d.winRate}%</span>
                                  </div>
                                </div>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <ReferenceLine y={0} stroke="#334155" />
                      <Bar dataKey="pnl" radius={[4, 4, 0, 0]}>
                        {dailyData.map((entry, index) => (
                          <Cell key={`cell-d-${index}`} fill={entry.pnl >= 0 ? '#06b6d4' : '#f43f5e'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Daily Table */}
                <div className="overflow-x-auto no-scrollbar">
                  <table className="w-full text-left text-xs font-mono border-collapse">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400 text-[11px]">
                        <th className="py-2.5 font-semibold">Date</th>
                        <th className="py-2.5 text-center font-semibold">Trades</th>
                        <th className="py-2.5 text-center font-semibold">Wins / Losses</th>
                        <th className="py-2.5 text-center font-semibold">Win Rate</th>
                        <th className="py-2.5 text-right font-semibold">Daily PnL</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {[...dailyData].reverse().map((d) => (
                        <tr key={d.date} className="hover:bg-slate-800/30 transition-colors">
                          <td className="py-2.5 font-sans font-semibold text-slate-200">{d.date}</td>
                          <td className="py-2.5 text-center text-slate-400">{d.tradesCount}t</td>
                          <td className="py-2.5 text-center text-slate-400">
                            <span className="text-emerald-400">{d.wins}W</span> · <span className="text-rose-400">{d.losses}L</span>
                          </td>
                          <td className="py-2.5 text-center text-cyan-300 font-bold">{d.winRate}%</td>
                          <td className={`py-2.5 text-right font-bold tabular-nums ${d.pnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {formatCurrency(d.pnl)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        )}

        {/* 2. WEEKLY VIEW */}
        {periodicity === 'weekly' && (
          <div className="space-y-4">
            {weeklyData.length === 0 ? (
              <div className="py-10 text-center text-slate-500 text-xs">No weekly records logged yet.</div>
            ) : (
              <>
                <div className="h-60 sm:h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={weeklyData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                      <XAxis dataKey="weekLabel" stroke="#475569" fontSize={10} tickLine={false} axisLine={{ stroke: '#1e293b' }} />
                      <YAxis stroke="#475569" fontSize={10} tickLine={false} axisLine={{ stroke: '#1e293b' }} tickFormatter={(v) => `$${v}`} />
                      <Tooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const d = payload[0].payload;
                            return (
                              <div className="rounded-xl border border-slate-700 bg-slate-900/95 p-3 text-xs font-mono shadow-xl backdrop-blur-md">
                                <div className="font-bold text-white mb-1">Week: {d.weekLabel}</div>
                                <div className="space-y-1">
                                  <div className="flex justify-between gap-5 text-slate-400">
                                    <span>Weekly Net PnL:</span>
                                    <span className={`font-bold ${d.pnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                      {formatCurrency(d.pnl)}
                                    </span>
                                  </div>
                                  <div className="flex justify-between gap-5 text-slate-400">
                                    <span>Executions:</span>
                                    <span className="text-white">{d.tradesCount} trades</span>
                                  </div>
                                  <div className="flex justify-between gap-5 text-slate-400">
                                    <span>Win Rate:</span>
                                    <span className="text-cyan-300 font-bold">{d.winRate.toFixed(1)}%</span>
                                  </div>
                                </div>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <ReferenceLine y={0} stroke="#334155" />
                      <Bar dataKey="pnl" radius={[5, 5, 0, 0]}>
                        {weeklyData.map((entry, index) => (
                          <Cell key={`cell-w-${index}`} fill={entry.pnl >= 0 ? '#06b6d4' : '#f43f5e'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Weekly Table */}
                <div className="overflow-x-auto no-scrollbar">
                  <table className="w-full text-left text-xs font-mono border-collapse">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400 text-[11px]">
                        <th className="py-2.5 font-semibold">Week Interval</th>
                        <th className="py-2.5 text-center font-semibold">Executions</th>
                        <th className="py-2.5 text-center font-semibold">Wins / Losses</th>
                        <th className="py-2.5 text-center font-semibold">Win Rate</th>
                        <th className="py-2.5 text-right font-semibold">Weekly Net PnL</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {[...weeklyData].reverse().map((w) => (
                        <tr key={w.weekKey} className="hover:bg-slate-800/30 transition-colors">
                          <td className="py-2.5 font-sans font-semibold text-slate-200">{w.weekLabel}</td>
                          <td className="py-2.5 text-center text-slate-400">{w.tradesCount} trades</td>
                          <td className="py-2.5 text-center text-slate-400">
                            <span className="text-emerald-400">{w.wins}W</span> · <span className="text-rose-400">{w.losses}L</span>
                          </td>
                          <td className="py-2.5 text-center text-cyan-300 font-bold">{w.winRate.toFixed(1)}%</td>
                          <td className={`py-2.5 text-right font-bold tabular-nums ${w.pnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {formatCurrency(w.pnl)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        )}

        {/* 3. MONTHLY VIEW */}
        {periodicity === 'monthly' && (
          <div className="space-y-4">
            {monthlyData.length === 0 ? (
              <div className="py-10 text-center text-slate-500 text-xs">No monthly records logged yet.</div>
            ) : (
              <>
                <div className="h-60 sm:h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                      <XAxis dataKey="monthLabel" stroke="#475569" fontSize={10} tickLine={false} axisLine={{ stroke: '#1e293b' }} />
                      <YAxis stroke="#475569" fontSize={10} tickLine={false} axisLine={{ stroke: '#1e293b' }} tickFormatter={(v) => `$${v}`} />
                      <Tooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const d = payload[0].payload;
                            return (
                              <div className="rounded-xl border border-slate-700 bg-slate-900/95 p-3 text-xs font-mono shadow-xl backdrop-blur-md">
                                <div className="font-bold text-white mb-1">{d.monthLabel}</div>
                                <div className="space-y-1">
                                  <div className="flex justify-between gap-5 text-slate-400">
                                    <span>Monthly Net PnL:</span>
                                    <span className={`font-bold ${d.pnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                      {formatCurrency(d.pnl)}
                                    </span>
                                  </div>
                                  <div className="flex justify-between gap-5 text-slate-400">
                                    <span>Executions:</span>
                                    <span className="text-white">{d.tradesCount} trades</span>
                                  </div>
                                  <div className="flex justify-between gap-5 text-slate-400">
                                    <span>Win Rate:</span>
                                    <span className="text-cyan-300 font-bold">{d.winRate.toFixed(1)}%</span>
                                  </div>
                                </div>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <ReferenceLine y={0} stroke="#334155" />
                      <Bar dataKey="pnl" radius={[6, 6, 0, 0]}>
                        {monthlyData.map((entry, index) => (
                          <Cell key={`cell-m-${index}`} fill={entry.pnl >= 0 ? '#06b6d4' : '#f43f5e'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Monthly Table */}
                <div className="overflow-x-auto no-scrollbar">
                  <table className="w-full text-left text-xs font-mono border-collapse">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400 text-[11px]">
                        <th className="py-2.5 font-semibold">Month</th>
                        <th className="py-2.5 text-center font-semibold">Volume</th>
                        <th className="py-2.5 text-center font-semibold">Wins / Losses</th>
                        <th className="py-2.5 text-center font-semibold">Win Rate</th>
                        <th className="py-2.5 text-right font-semibold">Net PnL</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {[...monthlyData].reverse().map((m) => (
                        <tr key={m.monthKey} className="hover:bg-slate-800/30 transition-colors">
                          <td className="py-2.5 font-sans font-semibold text-slate-200">{m.monthLabel}</td>
                          <td className="py-2.5 text-center text-slate-400">{m.tradesCount} executions</td>
                          <td className="py-2.5 text-center text-slate-400">
                            <span className="text-emerald-400 font-medium">{m.wins}W</span> · <span className="text-rose-400 font-medium">{m.losses}L</span>
                          </td>
                          <td className="py-2.5 text-center text-cyan-300 font-bold">{m.winRate.toFixed(1)}%</td>
                          <td className={`py-2.5 text-right font-bold tabular-nums ${m.pnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {formatCurrency(m.pnl)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* SECTION 3: WIN RATE DEEP DIVE & MOMENTUM */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Win Rate by Direction (Long vs Short) */}
        <div className="fintech-card rounded-2xl p-4 sm:p-5 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-white flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-400" />
              <span>Directional Win Rate (Long vs Short)</span>
            </span>
            <span className="text-xs text-slate-400 font-mono font-normal">Execution Edge</span>
          </h2>

          <div className="grid grid-cols-2 gap-3 font-mono">
            {/* Long Stats */}
            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-emerald-500/30 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400 flex items-center gap-1 font-sans font-semibold">
                  <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400" />
                  <span>LONG</span>
                </span>
                <span className="text-emerald-400 font-bold text-sm">
                  {stats.longWinRate.toFixed(0)}%
                </span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-400 h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, Math.max(0, stats.longWinRate))}%` }}
                />
              </div>
              <div className="text-[10px] text-slate-400 flex justify-between pt-1">
                <span>Trades: {stats.longTradesCount}</span>
                <span>Wins: {Math.round((stats.longWinRate / 100) * stats.longTradesCount)}</span>
              </div>
            </div>

            {/* Short Stats */}
            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-rose-500/30 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400 flex items-center gap-1 font-sans font-semibold">
                  <ArrowDownRight className="w-3.5 h-3.5 text-rose-400" />
                  <span>SHORT</span>
                </span>
                <span className="text-rose-400 font-bold text-sm">
                  {stats.shortWinRate.toFixed(0)}%
                </span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-rose-400 h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, Math.max(0, stats.shortWinRate))}%` }}
                />
              </div>
              <div className="text-[10px] text-slate-400 flex justify-between pt-1">
                <span>Trades: {stats.shortTradesCount}</span>
                <span>Wins: {Math.round((stats.shortWinRate / 100) * stats.shortTradesCount)}</span>
              </div>
            </div>
          </div>

          {/* Session Win Rate Breakdown */}
          <div className="space-y-3 pt-2 border-t border-slate-800/80">
            <span className="text-xs font-semibold text-slate-300 block">Session Win Rates</span>
            {sessionBreakdown.map((s) => (
              <div key={s.session} className="space-y-1">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-300 font-sans">{s.session} Session</span>
                  <div className="flex items-center gap-2">
                    <span className={s.pnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                      {formatCurrency(s.pnl)}
                    </span>
                    <span className="text-cyan-300 font-bold">{s.winRate.toFixed(0)}% Win</span>
                  </div>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-cyan-400 to-blue-500 h-full rounded-full"
                    style={{ width: `${Math.min(100, Math.max(0, s.winRate))}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Rolling 5-Trade Win Rate Momentum */}
        <div className="fintech-card rounded-2xl p-4 sm:p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-blue-400" />
              <span>Rolling 5-Trade Win Consistency</span>
            </h2>
            <span className="text-xs text-slate-400 font-mono">Rolling Average</span>
          </div>
          <p className="text-xs text-slate-400">
            Visualizes momentum and win percentage consistency across consecutive executions.
          </p>

          {rollingWinRateData.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-xs">
              Log at least 3 trades to view rolling win consistency.
            </div>
          ) : (
            <div className="h-56 w-full pt-1">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={rollingWinRateData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis
                    dataKey="tradeIndex"
                    stroke="#475569"
                    fontSize={10}
                    tickLine={false}
                    axisLine={{ stroke: '#1e293b' }}
                    label={{ value: 'Trade #', position: 'insideBottom', offset: -5, fill: '#475569', fontSize: 10 }}
                  />
                  <YAxis
                    stroke="#475569"
                    fontSize={10}
                    tickLine={false}
                    axisLine={{ stroke: '#1e293b' }}
                    domain={[0, 100]}
                    tickFormatter={(v) => `${v}%`}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const d = payload[0].payload;
                        return (
                          <div className="rounded-xl border border-slate-700 bg-slate-900/95 p-2.5 text-xs font-mono shadow-xl backdrop-blur-md">
                            <div className="text-white font-bold mb-1">
                              Trade #{d.tradeIndex} · {d.symbol}
                            </div>
                            <div className="text-cyan-300 font-bold">
                              Rolling Win Rate: {d.winRate}%
                            </div>
                            <div className="text-slate-400 text-[10px] mt-0.5">{d.tradeDate}</div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <ReferenceLine y={50} stroke="#64748b" strokeDasharray="3 3" />
                  <Line
                    type="monotone"
                    dataKey="winRate"
                    stroke="#38bdf8"
                    strokeWidth={2.5}
                    dot={{ fill: '#0284c7', r: 3 }}
                    activeDot={{ r: 5, fill: '#38bdf8' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono text-slate-400">
            <span>Peak Win Streak: <strong className="text-emerald-400">{stats.maxWinStreak} wins</strong></span>
            <span>Max Loss Streak: <strong className="text-rose-400">{stats.maxLossStreak} losses</strong></span>
          </div>
        </div>
      </div>

      {/* SECTION 4: STRATEGY & SETUP ANALYSIS */}
      <div className="fintech-card rounded-2xl p-4 sm:p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-cyan-400" />
            <span>Setup & Strategy Edge Ranking</span>
          </h2>
          <span className="text-xs text-slate-400 font-mono font-normal">Ranked by Profitability</span>
        </div>

        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left text-xs font-mono border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 text-[11px]">
                <th className="py-2.5 font-semibold">Strategy</th>
                <th className="py-2.5 text-center font-semibold">Trades</th>
                <th className="py-2.5 text-center font-semibold">Win Rate</th>
                <th className="py-2.5 text-right font-semibold">Net Simulated PnL</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {strategyData.map((strat) => (
                <tr key={strat.name} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-2.5 font-sans font-semibold text-slate-200">
                    {strat.name}
                  </td>
                  <td className="py-2.5 text-center text-slate-400">
                    {strat.count}
                  </td>
                  <td className="py-2.5 text-center text-cyan-300 font-bold">
                    {formatPercent(strat.winRate, false)}
                  </td>
                  <td
                    className={`py-2.5 text-right font-bold tabular-nums ${
                      strat.pnl >= 0 ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {formatCurrency(strat.pnl)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
