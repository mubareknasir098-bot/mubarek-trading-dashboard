import React from 'react';
import { Plus, ShieldAlert, SlidersHorizontal, TrendingUp, Info } from 'lucide-react';
import { formatCurrency } from '../utils/calculations';

interface HeaderProps {
  currentView: string;
  onOpenTradeModal: () => void;
  onOpenSettings: () => void;
  onSelectView?: (view: string) => void;
  currentBalance: number;
  initialCapital: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onOpenTradeModal,
  onOpenSettings,
  onSelectView,
  currentBalance,
  initialCapital,
}) => {
  const pnlTotal = currentBalance - initialCapital;

  const viewTitles: Record<string, string> = {
    dashboard: 'Executive Dashboard',
    journal: 'Trade Journal & Ledger',
    calendar: 'Trading Calendar Heatmap',
    analytics: 'Performance & Edge Analytics',
    about: 'About & Operating Guide',
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-800/80 bg-[#070b14]/85 px-3.5 sm:px-6 md:px-8 backdrop-blur-xl transition-all">
      {/* Zone 1: Brand & View Context */}
      <div className="flex items-center gap-3 min-w-0">
        {/* Mobile brand mark */}
        <div className="flex md:hidden items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-blue-600 text-slate-950 font-bold shadow-md shadow-cyan-500/20 shrink-0">
          <TrendingUp className="w-4 h-4 stroke-[2.5]" />
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="text-sm sm:text-base md:text-lg font-bold text-white tracking-tight truncate">
              {viewTitles[currentView] || 'Mubarek Trading'}
            </h1>
            <span className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono font-medium text-cyan-400 bg-cyan-500/10 border border-cyan-500/20">
              <ShieldAlert className="w-3 h-3 text-cyan-400" />
              <span>Simulated</span>
            </span>
          </div>
          <p className="text-[10px] sm:text-[11px] text-slate-400 truncate md:hidden">
            Practice Account · {formatCurrency(currentBalance, false)}
          </p>
        </div>
      </div>

      {/* Zone 2: Account Snapshot (Desktop & Tablet) */}
      <div className="hidden md:flex items-center gap-5 text-xs text-slate-400 font-mono">
        <div
          onClick={onOpenSettings}
          className="flex items-center gap-2 px-2.5 py-1 rounded-md bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 cursor-pointer transition-colors"
          title="Click to configure practice capital"
        >
          <span className="text-slate-400 text-[11px]">Capital:</span>
          <span className="font-semibold text-slate-100 tabular-nums">
            {formatCurrency(currentBalance, false)}
          </span>
        </div>
        <span aria-hidden="true" className="text-slate-700">·</span>
        <div className="flex items-center gap-2">
          <span className="text-slate-400 text-[11px]">Net Gain:</span>
          <span
            className={`font-semibold tabular-nums ${
              pnlTotal > 0 ? 'text-emerald-400' : pnlTotal < 0 ? 'text-rose-400' : 'text-slate-300'
            }`}
          >
            {formatCurrency(pnlTotal)}
          </span>
        </div>
      </div>

      {/* Zone 3: Primary Action CTA & Quick Settings */}
      <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
        {onSelectView && (
          <button
            onClick={() => onSelectView('about')}
            title="About & Trading Guide"
            className={`p-2 rounded-lg border transition-colors ${
              currentView === 'about'
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/80 border-slate-800/90'
            }`}
            aria-label="About"
          >
            <Info className="w-4 h-4" />
          </button>
        )}

        <button
          onClick={onOpenSettings}
          title="Account settings & practice capital"
          className="p-2 text-slate-400 hover:text-white hover:bg-slate-800/80 rounded-lg border border-slate-800/90 transition-colors"
          aria-label="Settings"
        >
          <SlidersHorizontal className="w-4 h-4" />
        </button>

        <button
          onClick={onOpenTradeModal}
          className="flex items-center gap-1.5 px-3 sm:px-4 py-2 text-xs font-bold text-slate-950 bg-gradient-to-r from-cyan-400 via-cyan-300 to-blue-400 rounded-lg hover:from-cyan-300 hover:to-blue-300 transition-all shadow-md shadow-cyan-500/25 active:scale-95 whitespace-nowrap"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span className="font-sans">Log Trade</span>
        </button>
      </div>
    </header>
  );
};
