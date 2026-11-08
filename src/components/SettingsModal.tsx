import React, { useState } from 'react';
import { X, DollarSign, Shield, Check } from 'lucide-react';
import { formatCurrency } from '../utils/calculations';

interface SettingsModalProps {
  isOpen: boolean;
  initialCapital: number;
  onSaveCapital: (val: number) => void;
  onClose: () => void;
}

const PRESET_AMOUNTS = [5000, 10000, 25000, 50000, 100000];

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  initialCapital,
  onSaveCapital,
  onClose,
}) => {
  const [amount, setAmount] = useState(initialCapital.toString());

  React.useEffect(() => {
    if (isOpen) {
      setAmount(initialCapital.toString());
    }
  }, [initialCapital, isOpen]);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseFloat(amount);
    if (!isNaN(parsed) && parsed > 0) {
      onSaveCapital(parsed);
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-xl border border-slate-800 bg-[#0c1322] p-6 text-slate-100 shadow-2xl space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Simulated Practice Capital</h3>
              <p className="text-xs text-slate-400">Configure starting paper-trading balance</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Initial Capital (USD)
            </label>
            <input
              type="number"
              step="100"
              min="100"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-3 py-2 text-sm font-mono rounded-lg bg-slate-900 border border-slate-800 text-slate-100 focus:outline-none focus:ring-1 focus:ring-cyan-500"
            />
          </div>

          <div>
            <span className="block text-[11px] text-slate-400 mb-2">Preset Account Sizes:</span>
            <div className="grid grid-cols-5 gap-1.5">
              {PRESET_AMOUNTS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setAmount(preset.toString())}
                  className={`py-1.5 px-1 text-[11px] font-mono rounded-md border text-center transition-colors ${
                    parseFloat(amount) === preset
                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 font-semibold'
                      : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                  }`}
                >
                  ${preset >= 1000 ? `${preset / 1000}k` : preset}
                </button>
              ))}
            </div>
          </div>

          <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800/80 flex items-start gap-2.5 text-xs text-slate-300">
            <Shield className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              Paper trading simulation baseline: All metrics like ROI %, Maximum Drawdown, and Equity Curves are calculated against this initial amount ({formatCurrency(parseFloat(amount) || initialCapital, false)}).
            </p>
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
              type="submit"
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-950 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-lg hover:from-cyan-300 hover:to-blue-400 transition-all shadow-md shadow-cyan-500/20 active:scale-95"
            >
              <Check className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Update Capital</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
