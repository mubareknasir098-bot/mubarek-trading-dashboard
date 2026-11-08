import { Trade } from '../types/trade';
import { SAMPLE_TRADES } from '../data/sampleTrades';

const TRADES_STORAGE_KEY = 'mubarek_trading_journal_trades';
const CAPITAL_STORAGE_KEY = 'mubarek_trading_initial_capital';
const DEFAULT_INITIAL_CAPITAL = 10000;

// In-memory fallback in case localStorage is blocked by iframe or browser privacy modes
let memoryTradesCache: Trade[] | null = null;
let memoryCapitalCache: number | null = null;

function sanitizeTrades(rawList: unknown[]): Trade[] {
  return rawList
    .filter((t): t is Trade => typeof t === 'object' && t !== null && 'id' in t && 'symbol' in t)
    .map((t) => ({
      id: String(t.id),
      symbol: String(t.symbol || 'UNKNOWN').toUpperCase(),
      date: String(t.date || new Date().toISOString()),
      direction: t.direction === 'Short' ? 'Short' : 'Long',
      entryPrice: Number(t.entryPrice) || 0,
      exitPrice: Number(t.exitPrice) || 0,
      quantity: Number(t.quantity) || 1,
      pnl: Number(t.pnl) || 0,
      result: t.result === 'Loss' ? 'Loss' : t.result === 'Breakeven' ? 'Breakeven' : 'Win',
      session: t.session || 'New York',
      strategy: t.strategy || 'Discretionary',
      notes: t.notes || '',
      tags: Array.isArray(t.tags) ? t.tags.map(String) : [],
      createdAt: Number(t.createdAt) || Date.now(),
    }));
}

export function loadTradesFromStorage(): Trade[] {
  try {
    const raw = typeof window !== 'undefined' ? localStorage.getItem(TRADES_STORAGE_KEY) : null;
    if (raw === null) {
      if (memoryTradesCache !== null) return memoryTradesCache;
      saveTradesToStorage(SAMPLE_TRADES);
      memoryTradesCache = SAMPLE_TRADES;
      return SAMPLE_TRADES;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      const sanitized = sanitizeTrades(parsed);
      memoryTradesCache = sanitized;
      return sanitized;
    }
    return SAMPLE_TRADES;
  } catch (err) {
    console.warn('Storage read failed or disabled, falling back to memory cache:', err);
    return memoryTradesCache || SAMPLE_TRADES;
  }
}

export function saveTradesToStorage(trades: Trade[]): void {
  memoryTradesCache = trades;
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem(TRADES_STORAGE_KEY, JSON.stringify(trades));
    }
  } catch (err) {
    console.warn('Storage write failed (e.g. quota or privacy mode):', err);
  }
}

export function loadInitialCapital(): number {
  try {
    const raw = typeof window !== 'undefined' ? localStorage.getItem(CAPITAL_STORAGE_KEY) : null;
    if (!raw) {
      return memoryCapitalCache ?? DEFAULT_INITIAL_CAPITAL;
    }
    const num = parseFloat(raw);
    const valid = isNaN(num) || num <= 0 ? DEFAULT_INITIAL_CAPITAL : num;
    memoryCapitalCache = valid;
    return valid;
  } catch {
    return memoryCapitalCache ?? DEFAULT_INITIAL_CAPITAL;
  }
}

export function saveInitialCapital(capital: number): void {
  memoryCapitalCache = capital;
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem(CAPITAL_STORAGE_KEY, capital.toString());
    }
  } catch (err) {
    console.warn('Capital storage write failed:', err);
  }
}

export function resetToDemoData(): Trade[] {
  saveTradesToStorage(SAMPLE_TRADES);
  return SAMPLE_TRADES;
}

export function clearAllTrades(): Trade[] {
  saveTradesToStorage([]);
  return [];
}
