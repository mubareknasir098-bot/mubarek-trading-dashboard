import React, { useState, useEffect } from 'react';
import { X, Calculator, AlertCircle, ArrowUpRight, ArrowDownRight, Tag, ShieldAlert } from 'lucide-react';
import { Trade, TradeDirection, TradeResult, TradingSession } from '../types/trade';

interface TradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (trade: Omit<Trade, 'id' | 'createdAt'> & { id?: string }) => void;
  editingTrade?: Trade | null;
  accountBalance?: number;
}

const COMMON_SYMBOLS = ['XAU/USD', 'EUR/USD', 'GBP/JPY', 'BTC/USD', 'ETH/USD', 'SPY', 'NVDA', 'AAPL', 'TSLA'];
const COMMON_STRATEGIES = [
  'Breakout & Retest',
  'Liquidity Sweep',
  'Fair Value Gap',
  'Trend Following',
  'Supply & Demand',
  'Range Scalp',
];
const SESSIONS: TradingSession[] = ['London', 'New York', 'Asian', 'London/NY Overlap'];
const PSYCHOLOGY_TAGS = ['Followed Plan', 'A+ Setup', 'Patience', 'Risk Respected', 'FOMO Avoided', 'Early Cut'];

export const TradeModal: React.FC<TradeModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingTrade,
  accountBalance = 10000,
}) => {
  const [symbol, setSymbol] = useState('');
  const [date, setDate] = useState('');
  const [direction, setDirection] = useState<TradeDirection>('Long');
  const [entryPrice, setEntryPrice] = useState('');
  const [exitPrice, setExitPrice] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [riskAmount, setRiskAmount] = useState('');
  const [riskPercent, setRiskPercent] = useState('');
  const [pnl, setPnl] = useState('');
  const [result, setResult] = useState<TradeResult>('Win');
  const [session, setSession] = useState<TradingSession>('New York');
  const [strategy, setStrategy] = useState('');
  const [notes, setNotes] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (editingTrade) {
      setSymbol(editingTrade.symbol);
      setDate(editingTrade.date);
      setDirection(editingTrade.direction);
      setEntryPrice(editingTrade.entryPrice.toString());
      setExitPrice(editingTrade.exitPrice.toString());
      setQuantity(editingTrade.quantity?.toString() || '1');
      setRiskAmount(editingTrade.riskAmount !== undefined ? editingTrade.riskAmount.toString() : '');
      setRiskPercent(editingTrade.riskPercent !== undefined ? editingTrade.riskPercent.toString() : '');
      setPnl(editingTrade.pnl.toString());
      setResult(editingTrade.result);
      setSession(editingTrade.session);
      setStrategy(editingTrade.strategy || '');
      setNotes(editingTrade.notes || '');
      setTags(editingTrade.tags || []);
      setErrors({});
    } else {
      const now = new Date();
      const localIso = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 16);
      setSymbol('XAU/USD');
      setDate(localIso);
      setDirection('Long');
      setEntryPrice('');
      setExitPrice('');
      setQuantity('1');
      setRiskAmount('100');
      setRiskPercent('1.0');
      setPnl('');
      setResult('Win');
      setSession('New York');
      setStrategy('Liquidity Sweep');
      setNotes('');
      setTags(['Followed Plan']);
      setErrors({});
    }
  }, [editingTrade, isOpen]);

  if (!isOpen) return null;

  const toggleTag = (t: string) => {
    setTags((prev) =>
      prev.includes(t) ? prev.filter((item) => item !== t) : [...prev, t]
    );
  };

  // Synchronize risk percent and risk amount
  const handleRiskPercentChange = (val: string) => {
    setRiskPercent(val);
    const p = parseFloat(val);
    if (!isNaN(p) && p >= 0 && accountBalance > 0) {
      const amt = Math.round(((accountBalance * p) / 100) * 100) / 100;
      setRiskAmount(amt.toString());
    }
  };

  const handleRiskAmountChange = (val: string) => {
    setRiskAmount(val);
    const amt = parseFloat(val);
    if (!isNaN(amt) && amt >= 0 && accountBalance > 0) {
      const p = Math.round(((amt / accountBalance) * 100) * 10) / 10;
      setRiskPercent(p.toString());
    }
  };

  const handleAutoCalculatePnL = () => {
    const entry = parseFloat(entryPrice);
    const exit = parseFloat(exitPrice);
    const qty = parseFloat(quantity) || 1;

    if (isNaN(entry) || isNaN(exit)) {
      setErrors((prev) => ({ ...prev, pnl: 'Please input valid Entry and Exit prices first.' }));
      return;
    }

    let diff = 0;
    if (direction === 'Long') {
      diff = (exit - entry) * qty;
    } else {
      diff = (entry - exit) * qty;
    }

    const calculatedPnL = Math.round(diff * 100) / 100;
    setPnl(calculatedPnL.toString());

    if (calculatedPnL > 0) {
      setResult('Win');
    } else if (calculatedPnL < 0) {
      setResult('Loss');
    } else {
      setResult('Breakeven');
    }

    setErrors((prev) => {
      const copy = { ...prev };
      delete copy.pnl;
      return copy;
    });
  };

  const handlePnlChange = (val: string) => {
    setPnl(val);
    const num = parseFloat(val);
    if (!isNaN(num)) {
      if (num > 0) setResult('Win');
      else if (num < 0) setResult('Loss');
      else setResult('Breakeven');
    }
  };

  // Live Risk:Reward calculation
  const parsedRiskAmount = parseFloat(riskAmount);
  const parsedPnL = parseFloat(pnl);
  const calculatedRR =
    !isNaN(parsedRiskAmount) && parsedRiskAmount > 0 && !isNaN(parsedPnL)
      ? (parsedPnL / parsedRiskAmount).toFixed(2)
      : null;

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!symbol.trim()) {
      newErrors.symbol = 'Trading symbol is required.';
    }

    if (!date) {
      newErrors.date = 'Execution date is required.';
    }

    const entry = parseFloat(entryPrice);
    if (isNaN(entry) || entry <= 0) {
      newErrors.entryPrice = 'Entry price must be positive.';
    }

    const exit = parseFloat(exitPrice);
    if (isNaN(exit) || exit <= 0) {
      newErrors.exitPrice = 'Exit price must be positive.';
    }

    const pnlNum = parseFloat(pnl);
    if (isNaN(pnlNum)) {
      newErrors.pnl = 'Simulated PnL in USD is required.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    onSave({
      id: editingTrade?.id,
      symbol: symbol.trim().toUpperCase(),
      date,
      direction,
      entryPrice: parseFloat(entryPrice),
      exitPrice: parseFloat(exitPrice),
      quantity: parseFloat(quantity) || 1,
      riskAmount: !isNaN(parsedRiskAmount) ? parsedRiskAmount : undefined,
      riskPercent: !isNaN(parseFloat(riskPercent)) ? parseFloat(riskPercent) : undefined,
      pnl: Math.round(parseFloat(pnl) * 100) / 100,
      result,
      session,
      strategy: strategy.trim(),
      notes: notes.trim(),
      tags,
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-xl my-auto rounded-2xl border border-slate-800 bg-[#0c1322] text-slate-100 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 px-5 py-4 bg-slate-900/60">
          <div>
            <h2 className="text-base font-bold text-white tracking-tight">
              {editingTrade ? 'Edit Simulated Execution' : 'Log New Paper Trade'}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Practice journal entry with risk modeling and psychology tags.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Direction Toggle */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Direction</label>
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-900 rounded-xl border border-slate-800">
              <button
                type="button"
                onClick={() => setDirection('Long')}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs font-bold transition-all ${
                  direction === 'Long'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <ArrowUpRight className="w-4 h-4 text-emerald-400" />
                <span>LONG (Buy)</span>
              </button>
              <button
                type="button"
                onClick={() => setDirection('Short')}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs font-bold transition-all ${
                  direction === 'Short'
                    ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <ArrowDownRight className="w-4 h-4 text-rose-400" />
                <span>SHORT (Sell)</span>
              </button>
            </div>
          </div>

          {/* Symbol & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Symbol <span className="text-cyan-400">*</span>
              </label>
              <input
                type="text"
                value={symbol}
                onChange={(e) => setSymbol(e.target.value)}
                placeholder="e.g. XAU/USD, EUR/USD, NVDA"
                className={`w-full px-3.5 py-2.5 text-xs font-mono font-bold rounded-xl bg-slate-900 border text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 ${
                  errors.symbol ? 'border-rose-500' : 'border-slate-800'
                }`}
              />
              <div className="flex flex-wrap gap-1 mt-1.5">
                {COMMON_SYMBOLS.slice(0, 6).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSymbol(s)}
                    className="text-[10px] font-mono text-slate-400 hover:text-cyan-300 hover:bg-slate-800/80 px-2 py-0.5 rounded-md transition-colors"
                  >
                    {s}
                  </button>
                ))}
              </div>
              {errors.symbol && (
                <p className="text-[11px] text-rose-400 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.symbol}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Date & Time <span className="text-cyan-400">*</span>
              </label>
              <input
                type="datetime-local"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className={`w-full px-3.5 py-2.5 text-xs font-mono rounded-xl bg-slate-900 border text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 ${
                  errors.date ? 'border-rose-500' : 'border-slate-800'
                }`}
              />
              {errors.date && (
                <p className="text-[11px] text-rose-400 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.date}
                </p>
              )}
            </div>
          </div>

          {/* Entry, Exit, Size */}
          <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Entry <span className="text-cyan-400">*</span>
              </label>
              <input
                type="number"
                step="any"
                value={entryPrice}
                onChange={(e) => setEntryPrice(e.target.value)}
                placeholder="2735.40"
                className={`w-full px-3 py-2 text-xs font-mono font-medium rounded-xl bg-slate-900 border text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 ${
                  errors.entryPrice ? 'border-rose-500' : 'border-slate-800'
                }`}
              />
              {errors.entryPrice && (
                <p className="text-[10px] text-rose-400 mt-1">{errors.entryPrice}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Exit <span className="text-cyan-400">*</span>
              </label>
              <input
                type="number"
                step="any"
                value={exitPrice}
                onChange={(e) => setExitPrice(e.target.value)}
                placeholder="2754.20"
                className={`w-full px-3 py-2 text-xs font-mono font-medium rounded-xl bg-slate-900 border text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 ${
                  errors.exitPrice ? 'border-rose-500' : 'border-slate-800'
                }`}
              />
              {errors.exitPrice && (
                <p className="text-[10px] text-rose-400 mt-1">{errors.exitPrice}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Size / Lots
              </label>
              <input
                type="number"
                step="any"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="1.0"
                className="w-full px-3 py-2 text-xs font-mono rounded-xl bg-slate-900 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
              />
            </div>
          </div>

          {/* RISK FIELDS: Risk % and Risk Amount (USD) */}
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
              <span className="flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-cyan-400" />
                <span>Risk Management Parameters</span>
              </span>
              {calculatedRR !== null && (
                <span className={`text-[11px] font-mono px-2 py-0.5 rounded font-bold ${
                  parseFloat(calculatedRR) >= 2
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : parseFloat(calculatedRR) > 0
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                    : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                }`}>
                  R:R = {calculatedRR}R
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">
                  Risk % of Capital
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    value={riskPercent}
                    onChange={(e) => handleRiskPercentChange(e.target.value)}
                    placeholder="1.0"
                    className="w-full px-3 py-2 text-xs font-mono font-medium rounded-xl bg-slate-900 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 pr-7"
                  />
                  <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-500 font-mono">%</span>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">
                  Risk Amount (USD)
                </label>
                <div className="relative">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-500 font-mono">$</span>
                  <input
                    type="number"
                    step="any"
                    min="0"
                    value={riskAmount}
                    onChange={(e) => handleRiskAmountChange(e.target.value)}
                    placeholder="100.00"
                    className="w-full pl-6 pr-3 py-2 text-xs font-mono font-medium rounded-xl bg-slate-900 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* PnL and Result */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 pt-1">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  Simulated PnL (USD) <span className="text-cyan-400">*</span>
                </label>
                <button
                  type="button"
                  onClick={handleAutoCalculatePnL}
                  className="flex items-center gap-1 text-[11px] font-semibold text-cyan-400 hover:text-cyan-300"
                >
                  <Calculator className="w-3.5 h-3.5" />
                  <span>Auto Calculate</span>
                </button>
              </div>
              <input
                type="number"
                step="any"
                value={pnl}
                onChange={(e) => handlePnlChange(e.target.value)}
                placeholder="+1880.00 or -250.00"
                className={`w-full px-3 py-2 text-xs font-mono font-bold rounded-xl bg-slate-900 border placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 ${
                  parseFloat(pnl) > 0
                    ? 'text-emerald-400 border-emerald-900/60'
                    : parseFloat(pnl) < 0
                    ? 'text-rose-400 border-rose-900/60'
                    : 'text-slate-100 border-slate-800'
                } ${errors.pnl ? 'border-rose-500' : ''}`}
              />
              {errors.pnl && (
                <p className="text-[11px] text-rose-400 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.pnl}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Result Outcome</label>
              <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-900 rounded-xl border border-slate-800">
                {(['Win', 'Loss', 'Breakeven'] as TradeResult[]).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setResult(r)}
                    className={`py-2 text-xs font-bold rounded-lg transition-all ${
                      result === r
                        ? r === 'Win'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-sm'
                          : r === 'Loss'
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40 shadow-sm'
                          : 'bg-slate-700 text-slate-200 border border-slate-600 shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Session and Strategy */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Trading Session</label>
              <select
                value={session}
                onChange={(e) => setSession(e.target.value as TradingSession)}
                className="w-full px-3 py-2 text-xs font-medium rounded-xl bg-slate-900 border border-slate-800 text-slate-100 focus:outline-none focus:ring-1 focus:ring-cyan-500"
              >
                {SESSIONS.map((s) => (
                  <option key={s} value={s}>
                    {s} Session
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Strategy / Setup</label>
              <input
                type="text"
                list="strategies"
                value={strategy}
                onChange={(e) => setStrategy(e.target.value)}
                placeholder="e.g. Liquidity Sweep"
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-900 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
              />
              <datalist id="strategies">
                {COMMON_STRATEGIES.map((s) => (
                  <option key={s} value={s} />
                ))}
              </datalist>
            </div>
          </div>

          {/* Psychology & Discipline Tags */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-cyan-400" />
              <span>Psychology & Discipline Checklist</span>
            </label>
            <div className="flex flex-wrap gap-1.5">
              {PSYCHOLOGY_TAGS.map((t) => {
                const isSelected = tags.includes(t);
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => toggleTag(t)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-mono transition-colors ${
                      isSelected
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
                        : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-200'
                    }`}
                  >
                    #{t}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Trader Journal & Reflection
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Why did you take this trade? Did you adhere to your risk rules? What did you do well or need to improve?"
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-900 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 resize-none leading-relaxed"
            />
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800/80 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 text-xs font-bold text-slate-950 bg-gradient-to-r from-cyan-400 via-cyan-300 to-blue-400 rounded-xl hover:from-cyan-300 hover:to-blue-300 transition-all shadow-md shadow-cyan-500/25 active:scale-95"
            >
              {editingTrade ? 'Update Execution' : 'Save Paper Trade'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
