import React from 'react';
import { AlertOctagon, X, Trash2, RefreshCw } from 'lucide-react';

interface ClearConfirmModalProps {
  isOpen: boolean;
  mode: 'clear' | 'reset-demo';
  onClose: () => void;
  onConfirm: () => void;
}

export const ClearConfirmModal: React.FC<ClearConfirmModalProps> = ({
  isOpen,
  mode,
  onClose,
  onConfirm,
}) => {
  if (!isOpen) return null;

  const isClear = mode === 'clear';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-xl border border-slate-800 bg-[#0c1322] p-6 text-slate-100 shadow-2xl space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`p-2.5 rounded-lg border ${
                isClear
                  ? 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                  : 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400'
              }`}
            >
              {isClear ? <AlertOctagon className="w-5 h-5" /> : <RefreshCw className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">
                {isClear ? 'Clear All Journal Data?' : 'Restore Demo Trades?'}
              </h3>
              <p className="text-xs text-slate-400">
                {isClear
                  ? 'This will delete all current trade records stored in your browser.'
                  : 'This will replace your current practice log with the initial realistic demo data set.'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/60 p-3 rounded-lg border border-slate-800">
          {isClear
            ? 'All recorded trades, simulated PnL stats, and reflections will be cleared from localStorage. You can re-populate with demo data anytime.'
            : 'Useful for exploring realistic statistics, calendar distributions, and equity curves without manually inputting each trade.'}
        </p>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800/80 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white rounded-lg transition-all shadow-sm active:scale-95 ${
              isClear
                ? 'bg-rose-600 hover:bg-rose-500'
                : 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold hover:from-cyan-400 hover:to-blue-500'
            }`}
          >
            {isClear ? <Trash2 className="w-3.5 h-3.5" /> : <RefreshCw className="w-3.5 h-3.5" />}
            <span>{isClear ? 'Clear Everything' : 'Load Demo Data'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
