import React from 'react';
import {
  LayoutDashboard,
  BookOpen,
  CalendarDays,
  BarChart3,
  TrendingUp,
  RefreshCw,
  Trash2,
  FileSpreadsheet,
  Info,
  Flame,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import { TradingStats } from '../types/trade';
import { formatPercent } from '../utils/calculations';

interface SidebarProps {
  currentView: string;
  onSelectView: (view: string) => void;
  stats: TradingStats;
  onResetDemo: () => void;
  onClearData: () => void;
  onExportCSV: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onSelectView,
  stats,
  onResetDemo,
  onClearData,
  onExportCSV,
}) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'journal', label: 'Trade Journal', icon: BookOpen, badge: stats.totalTrades },
    { id: 'calendar', label: 'Trading Calendar', icon: CalendarDays },
    { id: 'analytics', label: 'Performance Analytics', icon: BarChart3 },
    { id: 'about', label: 'About & Guide', icon: Info },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 shrink-0 border-r border-slate-800/80 bg-[#080d19] text-slate-300 min-h-screen justify-between select-none shadow-xl">
      <div>
        {/* Brand Lockup with Ambient Glow */}
        <div className="px-6 py-5 border-b border-slate-800/80 bg-gradient-to-b from-cyan-950/20 to-transparent">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-400 via-cyan-500 to-blue-600 flex items-center justify-center shadow-md shadow-cyan-500/25 text-slate-950 ring-1 ring-cyan-300/30">
              <TrendingUp className="w-5 h-5 stroke-[2.75]" />
            </div>
            <div>
              <div className="text-sm font-bold tracking-tight text-white flex items-center gap-1.5">
                <span>Mubarek</span>
                <span className="text-cyan-400 font-semibold">Trading</span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono tracking-tight">Fintech Practice Journal</p>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="p-3 space-y-1">
          <div className="px-3 py-2 text-[10px] font-semibold tracking-wider text-slate-400 font-mono">
            PORTFOLIO VIEWS
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectView(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                  active
                    ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 font-semibold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${active ? 'text-cyan-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span
                    className={`font-mono text-[10px] tabular-nums px-2 py-0.5 rounded-md ${
                      active
                        ? 'bg-cyan-400/20 text-cyan-300 font-semibold'
                        : 'bg-slate-800/90 text-slate-400'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Data Tools */}
        <div className="p-3 pt-1">
          <div className="px-3 py-2 text-[10px] font-semibold tracking-wider text-slate-400 font-mono">
            JOURNAL OPERATIONS
          </div>
          <div className="space-y-1">
            <button
              onClick={onExportCSV}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-slate-400 hover:text-white hover:bg-slate-800/40 transition-colors"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              <span>Export CSV Journal</span>
            </button>
            <button
              onClick={onResetDemo}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-slate-400 hover:text-white hover:bg-slate-800/40 transition-colors"
            >
              <RefreshCw className="w-4 h-4 text-cyan-400" />
              <span>Restore Demo Data</span>
            </button>
            <button
              onClick={onClearData}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
            >
              <Trash2 className="w-4 h-4 text-rose-400" />
              <span>Clear Paper Ledger</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mini Performance Pulse Card in Sidebar */}
      <div className="p-4 border-t border-slate-800/80 space-y-3 bg-gradient-to-t from-slate-950/60 to-transparent">
        {/* Streak & Direction snapshot */}
        <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2.5 shadow-sm">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400 flex items-center gap-1.5">
              <Flame className={`w-3.5 h-3.5 ${stats.currentStreak > 0 ? 'text-amber-400' : 'text-slate-500'}`} />
              <span>Current Streak</span>
            </span>
            <span
              className={`font-mono font-bold text-xs tabular-nums ${
                stats.currentStreak > 0
                  ? 'text-emerald-400'
                  : stats.currentStreak < 0
                  ? 'text-rose-400'
                  : 'text-slate-400'
              }`}
            >
              {stats.currentStreak > 0
                ? `${stats.currentStreak} Wins 🔥`
                : stats.currentStreak < 0
                ? `${Math.abs(stats.currentStreak)} Losses`
                : 'Neutral'}
            </span>
          </div>

          {/* Win Rate Bar */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[11px] font-mono">
              <span className="text-slate-400">Win Rate</span>
              <span className="text-cyan-400 font-semibold">{formatPercent(stats.winRate, false)}</span>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-cyan-400 to-blue-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, Math.max(0, stats.winRate))}%` }}
              />
            </div>
          </div>

          {/* Direction win rates */}
          <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-800/80 text-[10px] font-mono">
            <div className="flex items-center gap-1 text-slate-400">
              <ArrowUpRight className="w-3 h-3 text-emerald-400" />
              <span>Long: <strong className="text-slate-200">{stats.longWinRate.toFixed(0)}%</strong></span>
            </div>
            <div className="flex items-center gap-1 text-slate-400">
              <ArrowDownRight className="w-3 h-3 text-rose-400" />
              <span>Short: <strong className="text-slate-200">{stats.shortWinRate.toFixed(0)}%</strong></span>
            </div>
          </div>
        </div>

        {/* Regulatory & Educational notice */}
        <div className="flex items-start gap-2 text-[10px] text-slate-400 leading-snug">
          <Info className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
          <span>Educational paper practice journal. No broker connection or live trades.</span>
        </div>
      </div>
    </aside>
  );
};
