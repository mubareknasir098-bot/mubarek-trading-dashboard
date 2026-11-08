import React from 'react';
import { LayoutDashboard, BookOpen, CalendarDays, BarChart3, Plus } from 'lucide-react';

interface BottomNavProps {
  currentView: string;
  onSelectView: (view: string) => void;
  onOpenTradeModal: () => void;
  totalTrades?: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentView,
  onSelectView,
  onOpenTradeModal,
  totalTrades,
}) => {
  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'journal', label: 'Journal', icon: BookOpen, badge: totalTrades },
    { id: 'calendar', label: 'Calendar', icon: CalendarDays },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#070b14]/90 border-t border-slate-800/90 backdrop-blur-2xl px-3 pt-1.5 pb-3 safe-area-bottom shadow-2xl">
      <div className="flex items-center justify-around relative max-w-md mx-auto">
        {/* First two tabs */}
        {tabs.slice(0, 2).map((tab) => {
          const Icon = tab.icon;
          const active = currentView === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onSelectView(tab.id)}
              className={`relative flex flex-col items-center justify-center py-1.5 px-3 rounded-xl transition-all duration-200 active:scale-95 ${
                active ? 'text-cyan-400' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${active ? 'text-cyan-400' : 'text-slate-400'}`} />
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span className="absolute -top-1 -right-2 bg-slate-800 text-cyan-300 border border-slate-700 text-[9px] font-mono px-1 rounded-full">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className={`text-[10px] mt-1 font-medium ${active ? 'font-semibold text-cyan-400' : ''}`}>
                {tab.label}
              </span>
              {active && (
                <span className="w-1 h-1 rounded-full bg-cyan-400 absolute bottom-0 shadow-sm shadow-cyan-400" />
              )}
            </button>
          );
        })}

        {/* Center Floating Action Button (FAB) */}
        <div className="relative -top-4 flex flex-col items-center">
          <button
            onClick={onOpenTradeModal}
            className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-tr from-cyan-400 via-cyan-300 to-blue-500 text-slate-950 shadow-lg shadow-cyan-500/40 active:scale-90 transition-transform ring-4 ring-[#070b14]"
            aria-label="Log Simulated Trade"
          >
            <Plus className="w-6 h-6 stroke-[2.75]" />
          </button>
          <span className="text-[9px] font-bold text-slate-300 mt-1 uppercase tracking-wider">Log</span>
        </div>

        {/* Last two tabs */}
        {tabs.slice(2, 4).map((tab) => {
          const Icon = tab.icon;
          const active = currentView === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onSelectView(tab.id)}
              className={`relative flex flex-col items-center justify-center py-1.5 px-3 rounded-xl transition-all duration-200 active:scale-95 ${
                active ? 'text-cyan-400' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className={`w-5 h-5 ${active ? 'text-cyan-400' : 'text-slate-400'}`} />
              <span className={`text-[10px] mt-1 font-medium ${active ? 'font-semibold text-cyan-400' : ''}`}>
                {tab.label}
              </span>
              {active && (
                <span className="w-1 h-1 rounded-full bg-cyan-400 absolute bottom-0 shadow-sm shadow-cyan-400" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
