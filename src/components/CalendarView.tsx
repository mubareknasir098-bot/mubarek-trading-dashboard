import React, { useState, useMemo } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Sparkles,
} from 'lucide-react';
import { Trade, DailyPerformance } from '../types/trade';
import {
  groupTradesByDay,
  formatCurrency,
  formatFullDateTime,
} from '../utils/calculations';

interface CalendarViewProps {
  trades: Trade[];
  onOpenTradeModal: () => void;
  onEditTrade: (trade: Trade) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  trades,
  onOpenTradeModal,
  onEditTrade,
}) => {
  const initialDate = useMemo(() => {
    if (trades.length > 0) {
      const sorted = [...trades].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      const d = new Date(sorted[0].date);
      if (!isNaN(d.getTime())) return d;
    }
    return new Date();
  }, [trades]);

  const [currentDate, setCurrentDate] = useState<Date>(
    new Date(initialDate.getFullYear(), initialDate.getMonth(), 1)
  );
  const [selectedDateKey, setSelectedDateKey] = useState<string | null>(null);

  const dailyMap = useMemo(() => groupTradesByDay(trades), [trades]);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthName = currentDate.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
    setSelectedDateKey(null);
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
    setSelectedDateKey(null);
  };

  const handleToday = () => {
    const now = new Date();
    setCurrentDate(new Date(now.getFullYear(), now.getMonth(), 1));
    setSelectedDateKey(null);
  };

  // Build calendar matrix
  const { calendarDays, monthlyStats } = useMemo(() => {
    const daysInCurrMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();

    const cells: { dateStr: string; dayNum: number; isCurrentMonth: boolean }[] = [];

    // Previous month padding
    for (let i = firstDay - 1; i >= 0; i--) {
      const prevDate = new Date(year, month, -i);
      const py = prevDate.getFullYear();
      const pm = String(prevDate.getMonth() + 1).padStart(2, '0');
      const pd = String(prevDate.getDate()).padStart(2, '0');
      cells.push({
        dateStr: `${py}-${pm}-${pd}`,
        dayNum: prevDate.getDate(),
        isCurrentMonth: false,
      });
    }

    // Current month days
    for (let d = 1; d <= daysInCurrMonth; d++) {
      const currDate = new Date(year, month, d);
      const cy = currDate.getFullYear();
      const cm = String(currDate.getMonth() + 1).padStart(2, '0');
      const cd = String(currDate.getDate()).padStart(2, '0');
      cells.push({
        dateStr: `${cy}-${cm}-${cd}`,
        dayNum: d,
        isCurrentMonth: true,
      });
    }

    // Next month padding
    const totalSlots = cells.length > 35 ? 42 : 35;
    const remaining = totalSlots - cells.length;
    for (let d = 1; d <= remaining; d++) {
      const nextDate = new Date(year, month + 1, d);
      const ny = nextDate.getFullYear();
      const nm = String(nextDate.getMonth() + 1).padStart(2, '0');
      const nd = String(nextDate.getDate()).padStart(2, '0');
      cells.push({
        dateStr: `${ny}-${nm}-${nd}`,
        dayNum: nextDate.getDate(),
        isCurrentMonth: false,
      });
    }

    let mTrades = 0;
    let mPnL = 0;
    let greenDays = 0;
    let redDays = 0;

    for (let d = 1; d <= daysInCurrMonth; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const dayData = dailyMap.get(dateStr);
      if (dayData && dayData.tradesCount > 0) {
        mTrades += dayData.tradesCount;
        mPnL += dayData.pnl;
        if (dayData.pnl > 0) greenDays++;
        else if (dayData.pnl < 0) redDays++;
      }
    }

    return {
      calendarDays: cells,
      monthlyStats: {
        totalTrades: mTrades,
        totalPnL: mPnL,
        greenDays,
        redDays,
      },
    };
  }, [year, month, dailyMap]);

  const selectedDayData: DailyPerformance | undefined = selectedDateKey
    ? dailyMap.get(selectedDateKey)
    : undefined;

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="space-y-4 sm:space-y-6 pb-24 md:pb-8">
      {/* Month Navigator Header Card */}
      <div className="fintech-card rounded-2xl p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500/20 to-blue-600/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0 shadow-sm">
              <CalendarIcon className="w-5 h-5 text-cyan-300" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                {monthName}
              </h2>
              <p className="text-xs text-slate-400">
                Daily PnL heatmap. Tap any active day to inspect executed trades.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-center flex-wrap">
            <button
              onClick={handleToday}
              className="px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-900/90 border border-slate-800 rounded-xl hover:bg-slate-800 transition-colors"
            >
              Current
            </button>
            <div className="flex items-center gap-1 bg-slate-900/90 border border-slate-800 rounded-xl p-0.5">
              <button
                onClick={handlePrevMonth}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                aria-label="Previous month"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={handleNextMonth}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                aria-label="Next month"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <button
              onClick={onOpenTradeModal}
              className="px-3 py-1.5 text-xs font-bold text-slate-950 bg-gradient-to-r from-cyan-400 to-blue-400 rounded-xl hover:from-cyan-300 hover:to-blue-300 transition-all shadow-sm active:scale-95"
            >
              + Log Trade
            </button>
          </div>
        </div>

        {/* Month Summary KPI Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 mt-4 pt-4 border-t border-slate-800/80 text-xs font-mono">
          <div className="bg-slate-900/40 p-2.5 rounded-xl border border-slate-800/60">
            <span className="text-slate-400 block text-[10px]">Monthly Net PnL</span>
            <span
              className={`text-sm sm:text-base font-bold tabular-nums ${
                monthlyStats.totalPnL >= 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {formatCurrency(monthlyStats.totalPnL)}
            </span>
          </div>
          <div className="bg-slate-900/40 p-2.5 rounded-xl border border-slate-800/60">
            <span className="text-slate-400 block text-[10px]">Month Volume</span>
            <span className="text-sm sm:text-base font-bold text-white tabular-nums">
              {monthlyStats.totalTrades} Executions
            </span>
          </div>
          <div className="bg-slate-900/40 p-2.5 rounded-xl border border-slate-800/60">
            <span className="text-slate-400 block text-[10px]">Green Days</span>
            <span className="text-sm sm:text-base font-bold text-emerald-400 tabular-nums">
              {monthlyStats.greenDays} Days
            </span>
          </div>
          <div className="bg-slate-900/40 p-2.5 rounded-xl border border-slate-800/60">
            <span className="text-slate-400 block text-[10px]">Red Days</span>
            <span className="text-sm sm:text-base font-bold text-rose-400 tabular-nums">
              {monthlyStats.redDays} Days
            </span>
          </div>
        </div>
      </div>

      {/* Calendar Grid: Mobile-responsive card sizing */}
      <div className="fintech-card rounded-2xl p-3 sm:p-5 shadow-md overflow-hidden">
        {/* Day name headers */}
        <div className="grid grid-cols-7 gap-1 sm:gap-2 text-center text-[11px] sm:text-xs font-mono font-bold text-slate-400 pb-2.5 border-b border-slate-800">
          {dayNames.map((d) => (
            <div key={d} className="py-1">
              {d}
            </div>
          ))}
        </div>

        {/* Days grid */}
        <div className="grid grid-cols-7 gap-1 sm:gap-2 pt-2.5">
          {calendarDays.map((cell) => {
            const dayData = dailyMap.get(cell.dateStr);
            const hasTrades = dayData && dayData.tradesCount > 0;
            const isSelected = selectedDateKey === cell.dateStr;

            return (
              <div
                key={cell.dateStr}
                onClick={() => {
                  if (hasTrades) {
                    setSelectedDateKey(isSelected ? null : cell.dateStr);
                  }
                }}
                className={`min-h-[58px] sm:min-h-[82px] p-1.5 sm:p-2.5 rounded-xl border flex flex-col justify-between transition-all select-none ${
                  cell.isCurrentMonth
                    ? hasTrades
                      ? dayData.pnl > 0
                        ? 'bg-emerald-950/20 border-emerald-900/40 hover:border-emerald-500/60'
                        : dayData.pnl < 0
                        ? 'bg-rose-950/20 border-rose-900/40 hover:border-rose-500/60'
                        : 'bg-slate-900/80 border-slate-800'
                      : 'bg-slate-900/40 border-slate-800/60'
                    : 'bg-slate-950/30 border-slate-900/40 opacity-30'
                } ${
                  isSelected
                    ? 'ring-2 ring-cyan-400 border-cyan-400 shadow-lg shadow-cyan-500/20 z-10'
                    : ''
                } ${hasTrades ? 'cursor-pointer active:scale-95' : ''}`}
              >
                {/* Date header in cell */}
                <div className="flex items-center justify-between text-[11px] font-mono">
                  <span
                    className={`font-semibold ${
                      cell.isCurrentMonth ? 'text-slate-200' : 'text-slate-600'
                    }`}
                  >
                    {cell.dayNum}
                  </span>
                  {hasTrades && (
                    <span className="text-[9px] sm:text-[10px] text-cyan-400 font-bold hidden sm:inline">
                      {dayData.tradesCount}t
                    </span>
                  )}
                </div>

                {/* Performance Pill if trades exist */}
                {hasTrades ? (
                  <div className="mt-0.5 sm:mt-1">
                    <div
                      className={`text-[10px] sm:text-xs font-mono font-bold tabular-nums text-right truncate ${
                        dayData.pnl > 0
                          ? 'text-emerald-400'
                          : dayData.pnl < 0
                          ? 'text-rose-400'
                          : 'text-slate-300'
                      }`}
                    >
                      {dayData.pnl >= 0
                        ? `+$${Math.round(dayData.pnl)}`
                        : `-$${Math.abs(Math.round(dayData.pnl))}`}
                    </div>
                    <div className="hidden sm:flex justify-end gap-1 text-[9px] font-mono text-slate-400 mt-0.5">
                      {dayData.wins > 0 && <span className="text-emerald-400">{dayData.wins}W</span>}
                      {dayData.losses > 0 && <span className="text-rose-400">{dayData.losses}L</span>}
                    </div>
                  </div>
                ) : (
                  <div className="h-3 sm:h-4" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Day Inspector Drawer (When day is selected) */}
      {selectedDateKey && selectedDayData && (
        <div className="fintech-card rounded-2xl p-4 sm:p-5 shadow-2xl space-y-4 animate-in fade-in duration-200 border-cyan-500/40">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2.5">
              <Clock className="w-4 h-4 text-cyan-400" />
              <div>
                <h3 className="text-sm font-bold text-white">
                  Executed Trades on {selectedDateKey}
                </h3>
                <span className="text-xs text-slate-400 font-mono">
                  {selectedDayData.tradesCount} executions · Net Day:{' '}
                  <strong
                    className={
                      selectedDayData.pnl >= 0 ? 'text-emerald-400' : 'text-rose-400'
                    }
                  >
                    {formatCurrency(selectedDayData.pnl)}
                  </strong>
                </span>
              </div>
            </div>
            <button
              onClick={() => setSelectedDateKey(null)}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-medium px-2 py-1 rounded-lg bg-slate-800/60"
            >
              Close
            </button>
          </div>

          <div className="space-y-2.5">
            {selectedDayData.trades.map((trade) => (
              <div
                key={trade.id}
                onClick={() => onEditTrade(trade)}
                className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 hover:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                      trade.direction === 'Long'
                        ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                        : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                    }`}
                  >
                    {trade.direction === 'Long' ? (
                      <ArrowUpRight className="w-4 h-4" />
                    ) : (
                      <ArrowDownRight className="w-4 h-4" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-xs font-mono">
                        {trade.symbol}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {trade.direction} · {trade.session}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-300 font-sans mt-0.5 line-clamp-1">
                      {trade.notes || trade.strategy || 'No notes logged'}
                    </div>
                  </div>
                </div>

                <div className="text-right sm:self-center font-mono">
                  <div
                    className={`text-sm font-bold tabular-nums ${
                      trade.pnl > 0
                        ? 'text-emerald-400'
                        : trade.pnl < 0
                        ? 'text-rose-400'
                        : 'text-slate-300'
                    }`}
                  >
                    {formatCurrency(trade.pnl)}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    {trade.entryPrice} → {trade.exitPrice}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
