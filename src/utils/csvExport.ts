import { Trade } from '../types/trade';

function escapeCSV(field: unknown): string {
  if (field === null || field === undefined) return '""';
  const str = String(field).replace(/"/g, '""');
  return `"${str}"`;
}

export function exportTradesToCSV(trades: Trade[]): void {
  const headers = [
    'Trade ID',
    'Date & Time',
    'Symbol',
    'Direction',
    'Entry Price',
    'Exit Price',
    'Quantity/Lots',
    'Risk Amount (USD)',
    'Risk Percent (%)',
    'Risk:Reward (R:R)',
    'Simulated PnL (USD)',
    'Result',
    'Trading Session',
    'Strategy',
    'Tags',
    'Notes',
  ];

  const rows = trades.map((t) => {
    let rr = '';
    if (t.riskAmount && t.riskAmount > 0) {
      rr = (t.pnl / t.riskAmount).toFixed(2) + 'R';
    }

    return [
      escapeCSV(t.id),
      escapeCSV(t.date),
      escapeCSV(t.symbol),
      escapeCSV(t.direction),
      escapeCSV(t.entryPrice),
      escapeCSV(t.exitPrice),
      escapeCSV(t.quantity ?? ''),
      escapeCSV(t.riskAmount !== undefined ? t.riskAmount.toFixed(2) : ''),
      escapeCSV(t.riskPercent !== undefined ? `${t.riskPercent}%` : ''),
      escapeCSV(rr),
      escapeCSV(t.pnl.toFixed(2)),
      escapeCSV(t.result),
      escapeCSV(t.session),
      escapeCSV(t.strategy ?? ''),
      escapeCSV(t.tags ? t.tags.join('; ') : ''),
      escapeCSV(t.notes),
    ];
  });

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');

  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  const nowStr = new Date().toISOString().split('T')[0];
  link.setAttribute('href', url);
  link.setAttribute('download', `mubarek_trading_journal_${nowStr}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
