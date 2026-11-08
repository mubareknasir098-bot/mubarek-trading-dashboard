import { Trade } from '../types/trade';

export interface BackupData {
  version: string;
  exportedAt: string;
  initialCapital: number;
  trades: Trade[];
}

export function exportBackupJSON(trades: Trade[], initialCapital: number): void {
  const backup: BackupData = {
    version: '2.0',
    exportedAt: new Date().toISOString(),
    initialCapital,
    trades,
  };

  const jsonStr = JSON.stringify(backup, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  const nowStr = new Date().toISOString().split('T')[0];
  link.setAttribute('href', url);
  link.setAttribute('download', `mubarek_trading_backup_${nowStr}.json`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function parseBackupJSON(jsonStr: string): { trades: Trade[]; initialCapital?: number } | null {
  try {
    const parsed = JSON.parse(jsonStr);
    let trades: unknown[] = [];
    let initialCapital: number | undefined;

    if (Array.isArray(parsed)) {
      trades = parsed;
    } else if (typeof parsed === 'object' && parsed !== null) {
      if (Array.isArray(parsed.trades)) {
        trades = parsed.trades;
      }
      if (typeof parsed.initialCapital === 'number' && parsed.initialCapital > 0) {
        initialCapital = parsed.initialCapital;
      }
    }

    const sanitizedTrades: Trade[] = trades
      .filter((t): t is any => typeof t === 'object' && t !== null && ('symbol' in t || 'entryPrice' in t))
      .map((t) => ({
        id: String(t.id || `trade-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`),
        symbol: String(t.symbol || 'UNKNOWN').toUpperCase(),
        date: String(t.date || new Date().toISOString()),
        direction: t.direction === 'Short' ? 'Short' : 'Long',
        entryPrice: Number(t.entryPrice) || 0,
        exitPrice: Number(t.exitPrice) || 0,
        quantity: Number(t.quantity) || 1,
        riskAmount: t.riskAmount !== undefined ? Number(t.riskAmount) : undefined,
        riskPercent: t.riskPercent !== undefined ? Number(t.riskPercent) : undefined,
        pnl: Number(t.pnl) || 0,
        result: t.result === 'Loss' ? 'Loss' : t.result === 'Breakeven' ? 'Breakeven' : 'Win',
        session: t.session || 'New York',
        strategy: t.strategy || 'Discretionary',
        notes: t.notes || '',
        tags: Array.isArray(t.tags) ? t.tags.map(String) : [],
        createdAt: Number(t.createdAt) || Date.now(),
      }));

    return {
      trades: sanitizedTrades,
      initialCapital,
    };
  } catch (err) {
    console.error('Failed to parse backup JSON:', err);
    return null;
  }
}
