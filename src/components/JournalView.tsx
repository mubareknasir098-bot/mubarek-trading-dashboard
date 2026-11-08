import React, { useState, useMemo, useRef } from 'react';
import {
  Search,
  ArrowUpDown,
  FileSpreadsheet,
  Download,
  Upload,
  Plus,
  Trash2,
  Edit2,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Calendar,
  X,
  ShieldAlert,
} from 'lucide-react';
import { Trade, TradeFilter } from '../types/trade';
import { formatCurrency, formatFullDateTime } from '../utils/calculations';

interface JournalViewProps {
  trades: Trade[];
  onOpenTradeModal: () => void;
  onEditTrade: (trade: Trade) => void;
  onRequestDelete: (trade: Trade) => void;
  onExportCSV: () => void;
  onExportBackupJSON: () => void;
  onImportBackupJSON: (jsonString: string) => void;
  onResetDemo: () => void;
  onClearData: () => void;
}

export const JournalView: React.FC<JournalViewProps> = ({
  trades,
  onOpenTradeModal,
  onEditTrade,
  onRequestDelete,
  onExportCSV,
  onExportBackupJSON,
  onImportBackupJSON,
  onResetDemo,
  onClearData,
}) => {
  const [filter, setFilter] = useState<TradeFilter>({
    search: '',
    symbol: 'All',
    result: 'All',
    session: 'All',
    direction: 'All',
    dateFrom: '',
    dateTo: '',
    sortBy: 'date-desc',
  });

  const [expandedTradeId, setExpandedTradeId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Derive unique symbols from recorded trades
  const uniqueSymbols = useMemo(() => {
    const set = new Set<string>();
    trades.forEach((t) => {
      if (t.symbol) set.add(t.symbol);
    });
    return Array.from(set).sort();
  }, [trades]);

  // Handle JSON file upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        onImportBackupJSON(content);
      }
    };
    reader.readAsText(file);
    // Reset input
    e.target.value = '';
  };

  // Filter & sort logic
  const filteredTrades = useMemo(() => {
    return trades
      .filter((trade) => {
        // Keyword Search check
        if (filter.search) {
          const q = filter.search.toLowerCase();
          const matchSymbol = trade.symbol.toLowerCase().includes(q);
          const matchNotes = trade.notes?.toLowerCase().includes(q);
          const matchStrategy = trade.strategy?.toLowerCase().includes(q);
          const matchSession = trade.session?.toLowerCase().includes(q);
          if (!matchSymbol && !matchNotes && !matchStrategy && !matchSession) {
            return false;
          }
        }

        // Dedicated Symbol filter
        if (filter.symbol && filter.symbol !== 'All' && trade.symbol !== filter.symbol) {
          return false;
        }

        // Date Range: dateFrom
        if (filter.dateFrom) {
          const tradeDateOnly = trade.date.split('T')[0];
          if (tradeDateOnly < filter.dateFrom) return false;
        }

        // Date Range: dateTo
        if (filter.dateTo) {
          const tradeDateOnly = trade.date.split('T')[0];
          if (tradeDateOnly > filter.dateTo) return false;
        }

        // Result check
        if (filter.result !== 'All' && trade.result !== filter.result) {
          return false;
        }

        // Session check
        if (filter.session !== 'All' && trade.session !== filter.session) {
          return false;
        }

        // Direction check
        if (filter.direction !== 'All' && trade.direction !== filter.direction) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (filter.sortBy === 'date-desc') {
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        }
        if (filter.sortBy === 'date-asc') {
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        }
        if (filter.sortBy === 'pnl-desc') {
          return b.pnl - a.pnl;
        }
        if (filter.sortBy === 'pnl-asc') {
          return a.pnl - b.pnl;
        }
        return 0;
      });
  }, [trades, filter]);

  const filteredPnL = useMemo(() => {
    return filteredTrades.reduce((sum, t) => sum + t.pnl, 0);
  }, [filteredTrades]);

  const hasActiveDateFilters = Boolean(filter.dateFrom || filter.dateTo || filter.symbol !== 'All');

  const handleResetAllFilters = () => {
    setFilter({
      search: '',
      symbol: 'All',
      result: 'All',
      session: 'All',
      direction: 'All',
      dateFrom: '',
      dateTo: '',
      sortBy: 'date-desc',
    });
  };

  return (
    <div className="space-y-4 pb-24 md:pb-8">
      {/* Hidden file input for JSON restore */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".json"
        className="hidden"
      />

      {/* Top Filter and Action Bar */}
      <div className="fintech-card rounded-2xl p-3.5 sm:p-5 space-y-3.5">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={filter.search}
              onChange={(e) => setFilter({ ...filter, search: e.target.value })}
              placeholder="Search symbol, notes, strategy, tags..."
              className="w-full pl-10 pr-3.5 py-2.5 text-xs rounded-xl bg-slate-900/90 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-all font-mono"
            />
          </div>

          {/* Action buttons (CSV, JSON Backup, JSON Restore, Demo, Clear, Log Trade) */}
          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap shrink-0">
            <button
              onClick={onExportCSV}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-900/90 hover:bg-slate-800 border border-slate-800 rounded-xl transition-colors shadow-sm"
              title="Download CSV spreadsheet"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
              <span>CSV</span>
            </button>

            <button
              onClick={onExportBackupJSON}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-900/90 hover:bg-slate-800 border border-slate-800 rounded-xl transition-colors shadow-sm"
              title="Backup entire journal data as JSON"
            >
              <Download className="w-3.5 h-3.5 text-blue-400" />
              <span>Backup</span>
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-900/90 hover:bg-slate-800 border border-slate-800 rounded-xl transition-colors shadow-sm"
              title="Restore journal data from JSON file"
            >
              <Upload className="w-3.5 h-3.5 text-indigo-400" />
              <span>Restore</span>
            </button>

            <button
              onClick={onClearData}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 rounded-xl transition-colors shadow-sm"
              title="Clear all demo/stored trades"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Clear Data</span>
            </button>

            <button
              onClick={onOpenTradeModal}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-slate-950 bg-gradient-to-r from-cyan-400 via-cyan-300 to-blue-400 rounded-xl hover:from-cyan-300 hover:to-blue-300 transition-all shadow-md shadow-cyan-500/20 active:scale-95"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Log Trade</span>
            </button>
          </div>
        </div>

        {/* Filters Row: Symbol, Date From, Date To, Result, Direction, Session, Sort */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 pt-3 border-t border-slate-800/80 text-xs font-mono">
          {/* Symbol Filter */}
          <div>
            <label className="block text-[10px] text-slate-400 uppercase tracking-wider mb-1">
              Symbol Filter
            </label>
            <select
              value={filter.symbol}
              onChange={(e) => setFilter({ ...filter, symbol: e.target.value })}
              className="w-full px-2.5 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 text-slate-200 focus:outline-none focus:ring-1 focus:ring-cyan-500"
            >
              <option value="All">All Symbols ({trades.length})</option>
              {uniqueSymbols.map((sym) => (
                <option key={sym} value={sym}>
                  {sym}
                </option>
              ))}
            </select>
          </div>

          {/* Date Range: From */}
          <div>
            <label className="block text-[10px] text-slate-400 uppercase tracking-wider mb-1">
              Date From
            </label>
            <input
              type="date"
              value={filter.dateFrom}
              onChange={(e) => setFilter({ ...filter, dateFrom: e.target.value })}
              className="w-full px-2.5 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 text-slate-200 focus:outline-none focus:ring-1 focus:ring-cyan-500"
            />
          </div>

          {/* Date Range: To */}
          <div>
            <label className="block text-[10px] text-slate-400 uppercase tracking-wider mb-1">
              Date To
            </label>
            <input
              type="date"
              value={filter.dateTo}
              onChange={(e) => setFilter({ ...filter, dateTo: e.target.value })}
              className="w-full px-2.5 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 text-slate-200 focus:outline-none focus:ring-1 focus:ring-cyan-500"
            />
          </div>

          {/* Sort By */}
          <div>
            <label className="block text-[10px] text-slate-400 uppercase tracking-wider mb-1">
              Sort Order
            </label>
            <select
              value={filter.sortBy}
              onChange={(e) => setFilter({ ...filter, sortBy: e.target.value as any })}
              className="w-full px-2.5 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 text-slate-200 focus:outline-none focus:ring-1 focus:ring-cyan-500"
            >
              <option value="date-desc">Newest First</option>
              <option value="date-asc">Oldest First</option>
              <option value="pnl-desc">Highest PnL</option>
              <option value="pnl-asc">Lowest PnL</option>
            </select>
          </div>
        </div>

        {/* Quick Result & Direction Segmented Pill Bar */}
        <div className="flex items-center gap-2 pt-2 border-t border-slate-800/60 overflow-x-auto no-scrollbar text-xs">
          {/* Result Segmented Filter */}
          <div className="flex items-center gap-1 p-0.5 bg-slate-900/90 rounded-xl border border-slate-800 text-[11px] shrink-0 font-mono">
            {(['All', 'Win', 'Loss', 'Breakeven'] as const).map((res) => (
              <button
                key={res}
                onClick={() => setFilter({ ...filter, result: res })}
                className={`px-3 py-1 rounded-lg transition-colors whitespace-nowrap ${
                  filter.result === res
                    ? 'bg-slate-800 text-cyan-300 font-bold shadow-sm border border-slate-700/80'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {res}
              </button>
            ))}
          </div>

          {/* Direction Filter */}
          <div className="flex items-center gap-1 p-0.5 bg-slate-900/90 rounded-xl border border-slate-800 text-[11px] shrink-0 font-mono">
            {(['All', 'Long', 'Short'] as const).map((dir) => (
              <button
                key={dir}
                onClick={() => setFilter({ ...filter, direction: dir })}
                className={`px-2.5 py-1 rounded-lg transition-colors whitespace-nowrap ${
                  filter.direction === dir
                    ? 'bg-slate-800 text-cyan-300 font-bold shadow-sm border border-slate-700/80'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {dir}
              </button>
            ))}
          </div>

          {/* Session Dropdown */}
          <select
            value={filter.session}
            onChange={(e) => setFilter({ ...filter, session: e.target.value as any })}
            className="px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 text-[11px] text-slate-300 focus:outline-none focus:ring-1 focus:ring-cyan-500 shrink-0 font-mono"
          >
            <option value="All">All Sessions</option>
            <option value="London">London</option>
            <option value="New York">New York</option>
            <option value="Asian">Asian</option>
            <option value="London/NY Overlap">London/NY Overlap</option>
          </select>

          {/* Active Filter Clear Tag */}
          {hasActiveDateFilters && (
            <button
              onClick={handleResetAllFilters}
              className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-mono font-semibold text-rose-400 hover:text-rose-300 bg-rose-500/10 rounded-lg shrink-0 ml-auto"
            >
              <X className="w-3 h-3" />
              <span>Clear Filter</span>
            </button>
          )}
        </div>
      </div>

      {/* Summary status indicator */}
      <div className="flex items-center justify-between text-xs text-slate-400 px-1 font-mono">
        <div>
          <span>Showing </span>
          <strong className="text-slate-200">{filteredTrades.length}</strong>
          <span> of {trades.length} recorded executions</span>
        </div>
        <div className="flex items-center gap-2">
          <span>Filtered PnL:</span>
          <span
            className={`font-bold tabular-nums ${
              filteredPnL > 0
                ? 'text-emerald-400'
                : filteredPnL < 0
                ? 'text-rose-400'
                : 'text-slate-300'
            }`}
          >
            {formatCurrency(filteredPnL)}
          </span>
        </div>
      </div>

      {/* Desktop Data Grid Table with Risk Fields & R:R */}
      <div className="hidden md:block fintech-card rounded-2xl overflow-hidden shadow-md">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-800/90 bg-slate-900/70 text-slate-400 font-mono text-[11px]">
              <th className="py-3 px-4 font-semibold">Date & Time</th>
              <th className="py-3 px-4 font-semibold">Symbol & Direction</th>
              <th className="py-3 px-4 font-semibold">Session</th>
              <th className="py-3 px-4 font-semibold text-right">Entry / Exit</th>
              <th className="py-3 px-4 font-semibold text-right">Risk ($ / %)</th>
              <th className="py-3 px-4 font-semibold text-right">Simulated PnL</th>
              <th className="py-3 px-4 font-semibold text-center">Result</th>
              <th className="py-3 px-4 font-semibold">Strategy & Reflection</th>
              <th className="py-3 px-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-mono">
            {filteredTrades.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-12 text-center text-slate-500">
                  <div className="space-y-2">
                    <p className="text-sm">No trades matching your filters.</p>
                    <button
                      onClick={handleResetAllFilters}
                      className="text-cyan-400 hover:underline text-xs font-semibold"
                    >
                      Reset all filters
                    </button>
                  </div>
                </td>
              </tr>
            ) : (
              filteredTrades.map((trade) => {
                const isExpanded = expandedTradeId === trade.id;
                const rr =
                  trade.riskAmount && trade.riskAmount > 0
                    ? (trade.pnl / trade.riskAmount).toFixed(2)
                    : null;

                return (
                  <React.Fragment key={trade.id}>
                    <tr
                      className="hover:bg-slate-800/40 transition-colors group cursor-pointer"
                      onClick={() => setExpandedTradeId(isExpanded ? null : trade.id)}
                    >
                      {/* Date */}
                      <td className="py-3.5 px-4 text-slate-300 whitespace-nowrap">
                        {formatFullDateTime(trade.date)}
                      </td>

                      {/* Symbol & Direction */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold ${
                              trade.direction === 'Long'
                                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                                : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                            }`}
                          >
                            {trade.direction.toUpperCase()}
                          </span>
                          <span className="font-bold text-white tracking-wide">
                            {trade.symbol}
                          </span>
                        </div>
                      </td>

                      {/* Session */}
                      <td className="py-3.5 px-4 text-slate-400 whitespace-nowrap font-sans">
                        {trade.session}
                      </td>

                      {/* Entry & Exit Prices */}
                      <td className="py-3.5 px-4 text-right tabular-nums whitespace-nowrap">
                        <div className="text-slate-100 font-semibold">{trade.entryPrice.toFixed(2)}</div>
                        <div className="text-slate-500 text-[11px]">{trade.exitPrice.toFixed(2)}</div>
                      </td>

                      {/* Risk Amount & Risk % */}
                      <td className="py-3.5 px-4 text-right tabular-nums whitespace-nowrap">
                        <div className="text-slate-300 font-medium">
                          {trade.riskAmount !== undefined ? `$${trade.riskAmount.toFixed(0)}` : '—'}
                        </div>
                        <div className="text-slate-500 text-[10px]">
                          {trade.riskPercent !== undefined ? `${trade.riskPercent}%` : ''}
                          {rr !== null && <span className="text-cyan-400 ml-1">({rr}R)</span>}
                        </div>
                      </td>

                      {/* Simulated PnL */}
                      <td className="py-3.5 px-4 text-right tabular-nums whitespace-nowrap">
                        <span
                          className={`font-bold text-sm ${
                            trade.pnl > 0
                              ? 'text-emerald-400'
                              : trade.pnl < 0
                              ? 'text-rose-400'
                              : 'text-slate-300'
                          }`}
                        >
                          {formatCurrency(trade.pnl)}
                        </span>
                      </td>

                      {/* Result */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <span
                          className={`inline-block px-2.5 py-0.5 text-[11px] font-bold rounded-md ${
                            trade.result === 'Win'
                              ? 'text-emerald-300 bg-emerald-500/15 border border-emerald-500/25'
                              : trade.result === 'Loss'
                              ? 'text-rose-300 bg-rose-500/15 border border-rose-500/25'
                              : 'text-slate-300 bg-slate-800 border border-slate-700'
                          }`}
                        >
                          {trade.result}
                        </span>
                      </td>

                      {/* Strategy & Notes snippet */}
                      <td className="py-3.5 px-4 max-w-xs font-sans">
                        <div className="text-slate-200 font-medium truncate text-xs">
                          {trade.strategy || 'Discretionary'}
                        </div>
                        <div className="text-slate-400 text-[11px] truncate mt-0.5">
                          {trade.notes || 'No reflections logged.'}
                        </div>
                      </td>

                      {/* Actions */}
                      <td
                        className="py-3.5 px-4 text-right whitespace-nowrap"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onEditTrade(trade)}
                            className="p-1.5 text-slate-400 hover:text-cyan-400 hover:bg-slate-800 rounded-lg transition-colors"
                            title="Edit trade"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onRequestDelete(trade)}
                            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/15 rounded-lg transition-colors"
                            title="Delete trade"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>

                    {/* Expandable row for notes detail */}
                    {isExpanded && (
                      <tr className="bg-slate-900/50">
                        <td colSpan={9} className="p-4 border-t border-slate-800/80 font-sans">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                            <div className="space-y-1">
                              <span className="text-slate-400 font-mono text-[11px]">Execution Details:</span>
                              <p className="text-slate-100 font-mono font-bold">
                                {trade.quantity || 1} lots/units · Risk: {trade.riskAmount ? `$${trade.riskAmount}` : 'N/A'} ({trade.riskPercent ? `${trade.riskPercent}%` : 'N/A'})
                              </p>
                              {trade.tags && trade.tags.length > 0 && (
                                <div className="pt-2">
                                  <span className="text-slate-400 font-mono text-[11px] block mb-1">Execution Tags:</span>
                                  <div className="flex flex-wrap gap-1">
                                    {trade.tags.map((t) => (
                                      <span key={t} className="text-[11px] text-cyan-300 font-mono">
                                        #{t}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>

                            <div className="md:col-span-2 space-y-1">
                              <span className="text-slate-400 font-mono text-[11px]">Trader Reflection:</span>
                              <p className="text-slate-200 leading-relaxed bg-[#070b14] p-3 rounded-xl border border-slate-800">
                                {trade.notes || 'No reflections logged for this paper trade.'}
                              </p>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Card List: Optimized for one-thumb mobile experience */}
      <div className="md:hidden space-y-3">
        {filteredTrades.length === 0 ? (
          <div className="fintech-card rounded-2xl p-8 text-center text-slate-500 text-xs space-y-2">
            <p>No trades match your filters.</p>
            <button
              onClick={handleResetAllFilters}
              className="text-cyan-400 hover:underline font-semibold"
            >
              Reset all filters
            </button>
          </div>
        ) : (
          filteredTrades.map((trade) => {
            const isExpanded = expandedTradeId === trade.id;
            const rr =
              trade.riskAmount && trade.riskAmount > 0
                ? (trade.pnl / trade.riskAmount).toFixed(2)
                : null;

            return (
              <div
                key={trade.id}
                className="fintech-card rounded-2xl p-4 space-y-3 shadow-md"
              >
                {/* Header Row: Symbol, Direction, PnL, Result */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${
                        trade.direction === 'Long'
                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                          : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                      }`}
                    >
                      {trade.direction === 'Long' ? (
                        <ArrowUpRight className="w-5 h-5 stroke-[2.5]" />
                      ) : (
                        <ArrowDownRight className="w-5 h-5 stroke-[2.5]" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-base font-mono">{trade.symbol}</span>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                          {trade.session}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {formatFullDateTime(trade.date)}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div
                      className={`text-base font-bold font-mono tabular-nums ${
                        trade.pnl > 0
                          ? 'text-emerald-400'
                          : trade.pnl < 0
                          ? 'text-rose-400'
                          : 'text-slate-300'
                      }`}
                    >
                      {formatCurrency(trade.pnl)}
                    </div>
                    <span
                      className={`inline-block text-[10px] font-bold font-mono px-2 py-0.5 rounded ${
                        trade.result === 'Win'
                          ? 'text-emerald-300 bg-emerald-500/15'
                          : trade.result === 'Loss'
                          ? 'text-rose-300 bg-rose-500/15'
                          : 'text-slate-400 bg-slate-800'
                      }`}
                    >
                      {trade.result}
                    </span>
                  </div>
                </div>

                {/* Price & Risk Details Grid */}
                <div className="grid grid-cols-2 gap-2 p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs font-mono">
                  <div>
                    <span className="text-slate-400 text-[10px] block">Entry → Exit:</span>
                    <span className="text-slate-100 font-semibold">{trade.entryPrice.toFixed(2)} → {trade.exitPrice.toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block">Risk / R:R:</span>
                    <span className="text-slate-100 font-semibold">
                      {trade.riskAmount ? `$${trade.riskAmount}` : '—'}
                      {rr !== null && <span className="text-cyan-400 ml-1">({rr}R)</span>}
                    </span>
                  </div>
                </div>

                {/* Strategy & Notes Snippet */}
                {trade.notes && (
                  <div
                    onClick={() => setExpandedTradeId(isExpanded ? null : trade.id)}
                    className="cursor-pointer"
                  >
                    <p
                      className={`text-xs text-slate-300 bg-[#070b14] p-2.5 rounded-xl border border-slate-800/90 leading-relaxed ${
                        isExpanded ? '' : 'line-clamp-2'
                      }`}
                    >
                      {trade.notes}
                    </p>
                    <div className="flex items-center justify-end text-[10px] text-cyan-400 font-mono mt-1">
                      <span>{isExpanded ? 'Collapse reflection' : 'Read reflection'}</span>
                    </div>
                  </div>
                )}

                {/* Card Footer: Strategy label + Touch Actions */}
                <div className="flex items-center justify-between pt-1 border-t border-slate-800/70 text-xs">
                  <span className="text-slate-400 font-mono text-[11px] font-medium">
                    {trade.strategy || 'Discretionary'}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => onEditTrade(trade)}
                      className="p-2 text-slate-300 hover:text-cyan-300 bg-slate-800/60 rounded-lg active:scale-90 transition-transform"
                      aria-label="Edit trade"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onRequestDelete(trade)}
                      className="p-2 text-rose-400 hover:text-rose-300 bg-rose-500/10 rounded-lg active:scale-90 transition-transform"
                      aria-label="Delete trade"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
