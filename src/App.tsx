/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Trade } from './types/trade';
import {
  loadTradesFromStorage,
  saveTradesToStorage,
  loadInitialCapital,
  saveInitialCapital,
  resetToDemoData,
  clearAllTrades,
} from './utils/storage';
import { calculateTradingStats } from './utils/calculations';
import { exportTradesToCSV } from './utils/csvExport';
import { exportBackupJSON, parseBackupJSON } from './utils/backup';

import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { BottomNav } from './components/BottomNav';
import { DashboardView } from './components/DashboardView';
import { JournalView } from './components/JournalView';
import { CalendarView } from './components/CalendarView';
import { AnalyticsView } from './components/AnalyticsView';
import { TradeModal } from './components/TradeModal';
import { DeleteConfirmModal } from './components/DeleteConfirmModal';
import { ClearConfirmModal } from './components/ClearConfirmModal';
import { SettingsModal } from './components/SettingsModal';
import { AboutView } from './components/AboutView';

export default function App() {
  const [trades, setTrades] = useState<Trade[]>(() => loadTradesFromStorage());
  const [initialCapital, setInitialCapital] = useState<number>(() => loadInitialCapital());
  const [currentView, setCurrentView] = useState<string>('dashboard');

  // Modal states
  const [isTradeModalOpen, setIsTradeModalOpen] = useState(false);
  const [editingTrade, setEditingTrade] = useState<Trade | null>(null);
  const [deleteModalTrade, setDeleteModalTrade] = useState<Trade | null>(null);
  const [clearModalMode, setClearModalMode] = useState<'clear' | 'reset-demo' | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Toast notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  };

  // Sync state to localStorage whenever trades change
  useEffect(() => {
    saveTradesToStorage(trades);
  }, [trades]);

  // Sync initial capital to localStorage
  useEffect(() => {
    saveInitialCapital(initialCapital);
  }, [initialCapital]);

  // Derived statistics
  const stats = useMemo(
    () => calculateTradingStats(trades, initialCapital),
    [trades, initialCapital]
  );

  // Save (Create or Edit) trade handler
  const handleSaveTrade = (tradeData: Omit<Trade, 'id' | 'createdAt'> & { id?: string }) => {
    if (tradeData.id) {
      // Editing existing trade
      setTrades((prev) =>
        prev.map((t) =>
          t.id === tradeData.id
            ? {
                ...t,
                ...tradeData,
                id: tradeData.id!,
              }
            : t
        )
      );
      showToast('Trade entry updated successfully.');
    } else {
      // Creating new trade
      const newTrade: Trade = {
        ...tradeData,
        id: `trade-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        createdAt: Date.now(),
      };
      setTrades((prev) => [newTrade, ...prev]);
      showToast('New simulated trade recorded.');
    }
    setIsTradeModalOpen(false);
    setEditingTrade(null);
  };

  // Delete trade handler
  const handleConfirmDelete = () => {
    if (!deleteModalTrade) return;
    setTrades((prev) => prev.filter((t) => t.id !== deleteModalTrade.id));
    setDeleteModalTrade(null);
    showToast('Trade record deleted.');
  };

  // Reset or clear data handlers
  const handleConfirmClearOrReset = () => {
    if (clearModalMode === 'reset-demo') {
      const resetTrades = resetToDemoData();
      setTrades(resetTrades);
      showToast('Demo trade data loaded.');
    } else if (clearModalMode === 'clear') {
      const emptyTrades = clearAllTrades();
      setTrades(emptyTrades);
      showToast('Journal data cleared.');
    }
    setClearModalMode(null);
  };

  // CSV export handler
  const handleExportCSV = () => {
    exportTradesToCSV(trades);
    showToast('Exported trade history to CSV.');
  };

  // Backup and Restore handlers
  const handleExportBackup = () => {
    exportBackupJSON(trades, initialCapital);
    showToast('Downloaded full journal backup JSON.');
  };

  const handleImportBackup = (jsonStr: string) => {
    const result = parseBackupJSON(jsonStr);
    if (!result) {
      showToast('Invalid backup file. Could not restore.');
      return;
    }
    setTrades(result.trades);
    if (result.initialCapital) {
      setInitialCapital(result.initialCapital);
    }
    showToast(`Restored ${result.trades.length} trades from backup.`);
  };

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col md:flex-row antialiased selection:bg-cyan-500/30 selection:text-cyan-200 relative">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 bg-[#0c1322] border border-cyan-500/40 text-cyan-300 px-4 py-2.5 rounded-xl shadow-2xl text-xs font-mono flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Desktop Sidebar */}
      <Sidebar
        currentView={currentView}
        onSelectView={setCurrentView}
        stats={stats}
        onResetDemo={() => setClearModalMode('reset-demo')}
        onClearData={() => setClearModalMode('clear')}
        onExportCSV={handleExportCSV}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          currentView={currentView}
          onOpenTradeModal={() => {
            setEditingTrade(null);
            setIsTradeModalOpen(true);
          }}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onSelectView={setCurrentView}
          currentBalance={stats.currentBalance}
          initialCapital={initialCapital}
        />

        <main className="flex-1 p-3.5 sm:p-6 md:p-8 max-w-7xl w-full mx-auto">
          {currentView === 'dashboard' && (
            <DashboardView
              trades={trades}
              stats={stats}
              initialCapital={initialCapital}
              onNavigateToJournal={() => setCurrentView('journal')}
              onOpenTradeModal={() => {
                setEditingTrade(null);
                setIsTradeModalOpen(true);
              }}
              onEditTrade={(trade) => {
                setEditingTrade(trade);
                setIsTradeModalOpen(true);
              }}
            />
          )}

          {currentView === 'journal' && (
            <JournalView
              trades={trades}
              onOpenTradeModal={() => {
                setEditingTrade(null);
                setIsTradeModalOpen(true);
              }}
              onEditTrade={(trade) => {
                setEditingTrade(trade);
                setIsTradeModalOpen(true);
              }}
              onRequestDelete={(trade) => setDeleteModalTrade(trade)}
              onExportCSV={handleExportCSV}
              onExportBackupJSON={handleExportBackup}
              onImportBackupJSON={handleImportBackup}
              onResetDemo={() => setClearModalMode('reset-demo')}
              onClearData={() => setClearModalMode('clear')}
            />
          )}

          {currentView === 'calendar' && (
            <CalendarView
              trades={trades}
              onOpenTradeModal={() => {
                setEditingTrade(null);
                setIsTradeModalOpen(true);
              }}
              onEditTrade={(trade) => {
                setEditingTrade(trade);
                setIsTradeModalOpen(true);
              }}
            />
          )}

          {currentView === 'analytics' && (
            <AnalyticsView
              trades={trades}
              stats={stats}
              initialCapital={initialCapital}
            />
          )}

          {currentView === 'about' && (
            <AboutView
              stats={stats}
              initialCapital={initialCapital}
              onOpenSettings={() => setIsSettingsOpen(true)}
              onResetDemo={() => setClearModalMode('reset-demo')}
              onClearData={() => setClearModalMode('clear')}
              onExportCSV={handleExportCSV}
              onExportBackupJSON={handleExportBackup}
              onNavigateToJournal={() => setCurrentView('journal')}
            />
          )}
        </main>
      </div>

      {/* Mobile Navigation */}
      <BottomNav
        currentView={currentView}
        onSelectView={setCurrentView}
        onOpenTradeModal={() => {
          setEditingTrade(null);
          setIsTradeModalOpen(true);
        }}
        totalTrades={trades.length}
      />

      {/* Trade Log / Edit Modal */}
      <TradeModal
        isOpen={isTradeModalOpen}
        onClose={() => {
          setIsTradeModalOpen(false);
          setEditingTrade(null);
        }}
        onSave={handleSaveTrade}
        editingTrade={editingTrade}
        accountBalance={stats.currentBalance}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={!!deleteModalTrade}
        trade={deleteModalTrade}
        onClose={() => setDeleteModalTrade(null)}
        onConfirm={handleConfirmDelete}
      />

      {/* Clear/Reset Confirmation Modal */}
      <ClearConfirmModal
        isOpen={!!clearModalMode}
        mode={clearModalMode || 'clear'}
        onClose={() => setClearModalMode(null)}
        onConfirm={handleConfirmClearOrReset}
      />

      {/* Settings Modal (Initial Capital) */}
      <SettingsModal
        isOpen={isSettingsOpen}
        initialCapital={initialCapital}
        onSaveCapital={(val) => setInitialCapital(val)}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  );
}
