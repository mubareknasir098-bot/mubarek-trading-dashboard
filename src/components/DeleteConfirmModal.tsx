import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';
import { Trade } from '../types/trade';
import { formatCurrency } from '../utils/calculations';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  trade: Trade | null;
  onClose: () => void;
  onConfirm: () => void;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  trade,
  onClose,
  onConfirm,
}) => {
  if (!isOpen || !trade) return null;

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
            <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Delete Trade Entry</h3>
              <p className="text-xs text-slate-400">This action cannot be undone.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-xs space-y-1.5 font-mono">
          <div className="flex justify-between text-slate-300">
            <span className="text-slate-500">Symbol & Date:</span>
            <span className="font-semibold text-slate-200">{trade.symbol} · {trade.date.split('T')[0]}</span>
          </div>
          <div className="flex justify-between text-slate-300">
            <span className="text-slate-500">Direction & Result:</span>
            <span>{trade.direction} · {trade.result}</span>
          </div>
          <div className="flex justify-between text-slate-300">
            <span className="text-slate-500">Simulated PnL:</span>
            <span className={trade.pnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
              {formatCurrency(trade.pnl)}
            </span>
          </div>
        </div>

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
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-rose-600 rounded-lg hover:bg-rose-500 transition-colors shadow-sm active:scale-95"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Confirm Delete</span>
          </button>
        </div>
      </div>
    </div>
  );
};
