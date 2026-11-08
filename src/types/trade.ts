export type TradeDirection = 'Long' | 'Short';
export type TradeResult = 'Win' | 'Loss' | 'Breakeven';
export type TradingSession = 'London' | 'New York' | 'Asian' | 'London/NY Overlap';

export interface Trade {
  id: string;
  symbol: string;
  date: string; // YYYY-MM-DD or YYYY-MM-DDTHH:mm
  direction: TradeDirection;
  entryPrice: number;
  exitPrice: number;
  quantity?: number; // Lots, contracts or shares
  riskAmount?: number; // Risk in USD (e.g. $150.00)
  riskPercent?: number; // Risk in % of balance (e.g. 1.5%)
  pnl: number; // Simulated USD PnL
  result: TradeResult;
  session: TradingSession;
  strategy?: string;
  notes: string;
  tags?: string[];
  createdAt: number;
}

export interface TradeFilter {
  search: string;
  symbol: string; // 'All' or specific symbol
  result: 'All' | TradeResult;
  session: 'All' | TradingSession;
  direction: 'All' | TradeDirection;
  dateFrom: string; // YYYY-MM-DD
  dateTo: string; // YYYY-MM-DD
  sortBy: 'date-desc' | 'date-asc' | 'pnl-desc' | 'pnl-asc';
}

export interface TradingStats {
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  breakevenTrades: number;
  winRate: number; // Percentage 0 - 100
  totalPnL: number;
  averagePnL: number;
  averageWin: number;
  averageLoss: number;
  profitFactor: number;
  bestTrade: number;
  worstTrade: number;
  maxDrawdown: number;
  maxDrawdownPercent: number;
  currentBalance: number;
  netReturnPercent: number;
  currentStreak: number;
  maxWinStreak: number;
  maxLossStreak: number;
  longTradesCount: number;
  shortTradesCount: number;
  longWinRate: number;
  shortWinRate: number;
}

export interface DailyPerformance {
  date: string; // YYYY-MM-DD
  label: string; // e.g. "Nov 06"
  tradesCount: number;
  pnl: number;
  wins: number;
  losses: number;
  breakevens: number;
  winRate: number;
  trades: Trade[];
}

export interface WeeklyPerformance {
  weekKey: string; // YYYY-Www
  weekLabel: string; // e.g. "Nov 02 - Nov 08"
  tradesCount: number;
  pnl: number;
  wins: number;
  losses: number;
  winRate: number;
}

export interface MonthlyPerformance {
  monthKey: string; // YYYY-MM
  monthLabel: string; // "Nov 2026"
  pnl: number;
  tradesCount: number;
  wins: number;
  losses: number;
  winRate: number;
}

export interface EquityPoint {
  index: number;
  tradeId?: string;
  date: string;
  symbol?: string;
  pnl: number;
  equity: number;
  drawdown: number;
  displayValue?: number;
}
