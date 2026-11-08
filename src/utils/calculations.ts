import {
  Trade,
  TradingStats,
  EquityPoint,
  MonthlyPerformance,
  WeeklyPerformance,
  DailyPerformance,
} from '../types/trade';

export function calculateTradingStats(trades: Trade[], initialCapital: number): TradingStats {
  const totalTrades = trades.length;

  if (totalTrades === 0) {
    return {
      totalTrades: 0,
      winningTrades: 0,
      losingTrades: 0,
      breakevenTrades: 0,
      winRate: 0,
      totalPnL: 0,
      averagePnL: 0,
      averageWin: 0,
      averageLoss: 0,
      profitFactor: 0,
      bestTrade: 0,
      worstTrade: 0,
      maxDrawdown: 0,
      maxDrawdownPercent: 0,
      currentBalance: initialCapital,
      netReturnPercent: 0,
      currentStreak: 0,
      maxWinStreak: 0,
      maxLossStreak: 0,
      longTradesCount: 0,
      shortTradesCount: 0,
      longWinRate: 0,
      shortWinRate: 0,
    };
  }

  let totalPnL = 0;
  let winningTrades = 0;
  let losingTrades = 0;
  let breakevenTrades = 0;
  let totalWinPnL = 0;
  let totalLossPnL = 0;
  let bestTrade = -Infinity;
  let worstTrade = Infinity;

  let longTradesCount = 0;
  let longWins = 0;
  let shortTradesCount = 0;
  let shortWins = 0;

  // Chronological sort for equity curve & drawdown
  const sorted = [...trades].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  let runningEquity = initialCapital;
  let peakEquity = initialCapital;
  let maxDrawdown = 0;
  let maxDrawdownPercent = 0;

  // Streak calculations
  let currWinStreak = 0;
  let currLossStreak = 0;
  let maxWinStreak = 0;
  let maxLossStreak = 0;

  for (const t of sorted) {
    const pnl = Number(t.pnl) || 0;
    totalPnL += pnl;

    const isWin = pnl > 0 || t.result === 'Win';
    const isLoss = pnl < 0 || t.result === 'Loss';

    if (t.direction === 'Long') {
      longTradesCount++;
      if (isWin) longWins++;
    } else {
      shortTradesCount++;
      if (isWin) shortWins++;
    }

    if (isWin) {
      winningTrades++;
      totalWinPnL += pnl;
      currWinStreak++;
      currLossStreak = 0;
      if (currWinStreak > maxWinStreak) maxWinStreak = currWinStreak;
    } else if (isLoss) {
      losingTrades++;
      totalLossPnL += Math.abs(pnl);
      currLossStreak++;
      currWinStreak = 0;
      if (currLossStreak > maxLossStreak) maxLossStreak = currLossStreak;
    } else {
      breakevenTrades++;
      currWinStreak = 0;
      currLossStreak = 0;
    }

    if (pnl > bestTrade) bestTrade = pnl;
    if (pnl < worstTrade) worstTrade = pnl;

    runningEquity += pnl;
    if (runningEquity > peakEquity) {
      peakEquity = runningEquity;
    }
    const currentDrawdown = peakEquity - runningEquity;
    if (currentDrawdown > maxDrawdown) {
      maxDrawdown = currentDrawdown;
      maxDrawdownPercent = peakEquity > 0 ? (currentDrawdown / peakEquity) * 100 : 0;
    }
  }

  // Calculate current streak from newest trade backwards
  let currentStreak = 0;
  const reverseSorted = [...sorted].reverse();
  if (reverseSorted.length > 0) {
    const firstTrade = reverseSorted[0];
    const isFirstWin = firstTrade.pnl > 0 || firstTrade.result === 'Win';
    const isFirstLoss = firstTrade.pnl < 0 || firstTrade.result === 'Loss';

    if (isFirstWin) {
      let streak = 0;
      for (const t of reverseSorted) {
        if (t.result === 'Win' || t.pnl > 0) streak++;
        else break;
      }
      currentStreak = streak;
    } else if (isFirstLoss) {
      let streak = 0;
      for (const t of reverseSorted) {
        if (t.result === 'Loss' || t.pnl < 0) streak++;
        else break;
      }
      currentStreak = -streak;
    }
  }

  if (bestTrade === -Infinity) bestTrade = 0;
  if (worstTrade === Infinity) worstTrade = 0;

  // Strict mathematical formulations:
  const winRate = totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0;
  const averagePnL = totalTrades > 0 ? totalPnL / totalTrades : 0;
  const averageWin = winningTrades > 0 ? totalWinPnL / winningTrades : 0;
  const averageLoss = losingTrades > 0 ? totalLossPnL / losingTrades : 0;
  const profitFactor = totalLossPnL > 0 ? totalWinPnL / totalLossPnL : totalWinPnL > 0 ? 99.99 : 0;
  const currentBalance = initialCapital + totalPnL;
  const netReturnPercent = initialCapital > 0 ? (totalPnL / initialCapital) * 100 : 0;

  const longWinRate = longTradesCount > 0 ? (longWins / longTradesCount) * 100 : 0;
  const shortWinRate = shortTradesCount > 0 ? (shortWins / shortTradesCount) * 100 : 0;

  return {
    totalTrades,
    winningTrades,
    losingTrades,
    breakevenTrades,
    winRate: Math.round(winRate * 10) / 10,
    totalPnL: Math.round(totalPnL * 100) / 100,
    averagePnL: Math.round(averagePnL * 100) / 100,
    averageWin: Math.round(averageWin * 100) / 100,
    averageLoss: Math.round(averageLoss * 100) / 100,
    profitFactor: Math.round(profitFactor * 100) / 100,
    bestTrade: Math.round(bestTrade * 100) / 100,
    worstTrade: Math.round(worstTrade * 100) / 100,
    maxDrawdown: Math.round(maxDrawdown * 100) / 100,
    maxDrawdownPercent: Math.round(maxDrawdownPercent * 10) / 10,
    currentBalance: Math.round(currentBalance * 100) / 100,
    netReturnPercent: Math.round(netReturnPercent * 10) / 10,
    currentStreak,
    maxWinStreak,
    maxLossStreak,
    longTradesCount,
    shortTradesCount,
    longWinRate: Math.round(longWinRate * 10) / 10,
    shortWinRate: Math.round(shortWinRate * 10) / 10,
  };
}

export function generateEquityCurve(trades: Trade[], initialCapital: number): EquityPoint[] {
  const sorted = [...trades].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const points: EquityPoint[] = [
    {
      index: 0,
      date: sorted.length > 0 ? 'Start' : 'Initial',
      pnl: 0,
      equity: initialCapital,
      drawdown: 0,
    },
  ];

  let currentEquity = initialCapital;
  let peakEquity = initialCapital;

  sorted.forEach((trade, i) => {
    currentEquity += trade.pnl;
    if (currentEquity > peakEquity) {
      peakEquity = currentEquity;
    }
    const drawdown = peakEquity - currentEquity;

    points.push({
      index: i + 1,
      tradeId: trade.id,
      date: formatShortDate(trade.date),
      symbol: trade.symbol,
      pnl: trade.pnl,
      equity: Math.round(currentEquity * 100) / 100,
      drawdown: Math.round(drawdown * 100) / 100,
    });
  });

  return points;
}

export function calculateMonthlyPerformance(trades: Trade[]): MonthlyPerformance[] {
  const map = new Map<string, { pnl: number; count: number; wins: number; losses: number }>();

  trades.forEach((trade) => {
    const d = new Date(trade.date);
    if (isNaN(d.getTime())) return;
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const key = `${year}-${month}`;

    const existing = map.get(key) || { pnl: 0, count: 0, wins: 0, losses: 0 };
    existing.pnl += trade.pnl;
    existing.count += 1;
    if (trade.pnl > 0 || trade.result === 'Win') {
      existing.wins += 1;
    } else if (trade.pnl < 0 || trade.result === 'Loss') {
      existing.losses += 1;
    }
    map.set(key, existing);
  });

  const sortedKeys = Array.from(map.keys()).sort();

  return sortedKeys.map((key) => {
    const data = map.get(key)!;
    const [year, month] = key.split('-');
    const dateObj = new Date(parseInt(year, 10), parseInt(month, 10) - 1, 1);
    const monthLabel = dateObj.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    const winRate = data.count > 0 ? (data.wins / data.count) * 100 : 0;

    return {
      monthKey: key,
      monthLabel,
      pnl: Math.round(data.pnl * 100) / 100,
      tradesCount: data.count,
      wins: data.wins,
      losses: data.losses,
      winRate: Math.round(winRate * 10) / 10,
    };
  });
}

// Calculate Weekly Performance (Monday through Sunday)
export function calculateWeeklyPerformance(trades: Trade[]): WeeklyPerformance[] {
  const map = new Map<string, { pnl: number; count: number; wins: number; losses: number; startTimestamp: number }>();

  trades.forEach((trade) => {
    const d = new Date(trade.date);
    if (isNaN(d.getTime())) return;

    // Get Monday of the trade's week
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Sunday
    const monday = new Date(d.setDate(diff));
    monday.setHours(0, 0, 0, 0);

    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);

    const year = monday.getFullYear();
    const month = String(monday.getMonth() + 1).padStart(2, '0');
    const dayOfMonth = String(monday.getDate()).padStart(2, '0');
    const key = `${year}-${month}-${dayOfMonth}`;

    const existing = map.get(key) || {
      pnl: 0,
      count: 0,
      wins: 0,
      losses: 0,
      startTimestamp: monday.getTime(),
    };

    existing.pnl += trade.pnl;
    existing.count += 1;
    if (trade.pnl > 0 || trade.result === 'Win') {
      existing.wins += 1;
    } else if (trade.pnl < 0 || trade.result === 'Loss') {
      existing.losses += 1;
    }
    map.set(key, existing);
  });

  const sortedKeys = Array.from(map.keys()).sort(
    (a, b) => (map.get(a)?.startTimestamp || 0) - (map.get(b)?.startTimestamp || 0)
  );

  return sortedKeys.map((key) => {
    const data = map.get(key)!;
    const start = new Date(data.startTimestamp);
    const end = new Date(data.startTimestamp);
    end.setDate(start.getDate() + 6);

    const weekLabel = `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
    const winRate = data.count > 0 ? (data.wins / data.count) * 100 : 0;

    return {
      weekKey: key,
      weekLabel,
      pnl: Math.round(data.pnl * 100) / 100,
      tradesCount: data.count,
      wins: data.wins,
      losses: data.losses,
      winRate: Math.round(winRate * 10) / 10,
    };
  });
}

// Calculate Daily Performance list sorted chronologically
export function calculateDailyPerformanceList(trades: Trade[]): DailyPerformance[] {
  const map = groupTradesByDay(trades);
  const sortedDates = Array.from(map.keys()).sort();

  return sortedDates.map((dateStr) => {
    const d = map.get(dateStr)!;
    return d;
  });
}

export function groupTradesByDay(trades: Trade[]): Map<string, DailyPerformance> {
  const map = new Map<string, DailyPerformance>();

  trades.forEach((trade) => {
    const datePart = trade.date.split('T')[0];
    if (!datePart) return;

    const existing = map.get(datePart) || {
      date: datePart,
      label: formatShortDate(datePart),
      tradesCount: 0,
      pnl: 0,
      wins: 0,
      losses: 0,
      breakevens: 0,
      winRate: 0,
      trades: [],
    };

    existing.tradesCount += 1;
    existing.pnl += trade.pnl;
    existing.trades.push(trade);

    if (trade.pnl > 0 || trade.result === 'Win') {
      existing.wins += 1;
    } else if (trade.pnl < 0 || trade.result === 'Loss') {
      existing.losses += 1;
    } else {
      existing.breakevens += 1;
    }

    existing.winRate = existing.tradesCount > 0
      ? Math.round((existing.wins / existing.tradesCount) * 1000) / 10
      : 0;

    map.set(datePart, existing);
  });

  return map;
}

export function formatCurrency(val: number, showSign = true): string {
  const abs = Math.abs(val);
  const formatted = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(abs);

  if (val > 0) {
    return showSign ? `+${formatted}` : formatted;
  }
  if (val < 0) {
    return `-${formatted}`;
  }
  return formatted;
}

export function formatPercent(val: number, showSign = true): string {
  const abs = Math.abs(val);
  const formatted = `${abs.toFixed(1)}%`;
  if (val > 0) return showSign ? `+${formatted}` : formatted;
  if (val < 0) return `-${formatted}`;
  return formatted;
}

export function formatShortDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  } catch {
    return dateStr;
  }
}

export function formatFullDateTime(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateStr;
  }
}
