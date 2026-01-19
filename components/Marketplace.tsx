
import React from 'react';
import { Player, MarketItem } from '../types';
import { MARKET_ITEMS } from '../constants';
import { formatCurrency, calculateUsedBankCredit } from '../services/gameEngine';
import { ShoppingCart, Briefcase, Car, Coins, AlertTriangle, Building2, Wallet } from 'lucide-react';

interface MarketplaceProps {
  player: Player;
  onBuy: (item: MarketItem, method: 'cash' | 'bank') => void;
  isActionPhase: boolean;
}

export const Marketplace: React.FC<MarketplaceProps> = ({ player, onBuy, isActionPhase }) => {
  // Re-defined locally for now to calculate visual state, ideally passed from parent
  const bankLimit = 200000 + (player.socialCapital * 10000) + (player.salary * 3) + (1 * 100000); 
  // Note: Actual logic in App.tsx checks real limit. Visual estimate only.

  const getIcon = (type: string) => {
    switch(type) {
      case 'Business': return <Briefcase className="w-5 h-5" />;
      case 'Side Hustle': return <Coins className="w-5 h-5" />;
      case 'Real Estate': return <Building2 className="w-5 h-5" />;
      case 'Asset': return <Car className="w-5 h-5" />;
      default: return <ShoppingCart className="w-5 h-5" />;
    }
  };

  const getRiskColor = (risk: number) => {
    if (risk < 0.15) return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
    if (risk < 0.35) return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
    return 'text-red-400 bg-red-500/10 border-red-500/20';
  };

  const getRiskLabel = (risk: number) => {
     if (risk < 0.15) return 'Low Risk';
     if (risk < 0.35) return 'Medium Risk';
     return 'High Risk';
  };
  
  const getTierColor = (tier: string) => {
      switch(tier) {
          case 'High': return 'border-purple-500/50 bg-purple-900/10';
          case 'Middle': return 'border-blue-500/50 bg-blue-900/10';
          default: return 'border-[#2d3a35]';
      }
  };

  const sortedItems = [...MARKET_ITEMS].sort((a,b) => a.cost - b.cost);

  return (
    <div className="pb-24 md:pb-10">
      <div className="bg-[#1a2321] rounded-3xl p-8 border border-[#2d3a35] shadow-lg mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
            <h1 className="text-4xl font-black text-white mb-2">Marketplace</h1>
            <p className="text-slate-400 text-sm max-w-md">Start a hustle, buy equipment, or invest in paper assets. Use Cash or Bank Financing.</p>
        </div>
        <div className="flex gap-4">
            <div className="flex items-center bg-[#0f1715] rounded-xl px-4 py-3 border border-white/5 shadow-inner min-w-[140px]">
                <Wallet className="w-5 h-5 text-emerald-400 mr-3" />
                <div>
                    <span className="text-slate-500 text-[10px] font-bold uppercase block">Cash</span>
                    <span className="text-white font-mono font-bold text-lg">{formatCurrency(player.cash)}</span>
                </div>
            </div>
            {/* We show a generic "Credit Available" indicator here, though exact calculation depends on month */}
            <div className="flex items-center bg-[#0f1715] rounded-xl px-4 py-3 border border-white/5 shadow-inner min-w-[140px]">
                <Building2 className="w-5 h-5 text-blue-400 mr-3" />
                <div>
                    <span className="text-slate-500 text-[10px] font-bold uppercase block">Financing</span>
                    <span className="text-blue-100 font-mono font-bold text-lg">Active</span>
                </div>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedItems.map((item) => {
          const canAffordCash = player.cash >= item.cost;

          return (
            <div key={item.id} className={`bg-[#1a2321] rounded-2xl border overflow-hidden flex flex-col hover:border-emerald-500/30 transition-colors group ${getTierColor(item.tier)}`}>
              <div className="p-6 flex-grow">
                 <div className="flex justify-between items-start mb-4">
                    <div className="p-3 rounded-xl bg-[#232d2a] text-slate-300 group-hover:text-emerald-400 group-hover:bg-emerald-500/10 transition-colors">
                        {getIcon(item.type)}
                    </div>
                    <div className={`px-2 py-1 rounded text-[10px] font-bold uppercase flex items-center border ${getRiskColor(item.risk)}`}>
                        <AlertTriangle className="w-3 h-3 mr-1" />
                        {getRiskLabel(item.risk)}
                    </div>
                 </div>

                 <h3 className="font-bold text-white text-xl mb-1">{item.name}</h3>
                 <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-4 block">{item.type} • {item.tier} Class</span>
                 
                 <p className="text-slate-400 text-xs mb-6 leading-relaxed line-clamp-2 min-h-[2.5em]">{item.description}</p>
                 
                 <div className="bg-[#0f1715] rounded-xl p-3 space-y-2">
                     <div className="flex justify-between text-xs">
                         <span className="text-slate-500 font-medium">Startup Cost</span>
                         <span className="text-white font-mono font-bold">{formatCurrency(item.cost)}</span>
                     </div>
                     <div className="flex justify-between text-xs">
                         <span className="text-slate-500 font-medium">Est. Monthly</span>
                         <span className="text-emerald-400 font-mono font-bold">+{formatCurrency(item.cashFlow)}</span>
                     </div>
                 </div>
              </div>

              <div className="p-4 bg-[#151c1a] border-t border-[#2d3a35] grid grid-cols-2 gap-3">
                  <button
                    onClick={() => onBuy(item, 'cash')}
                    disabled={!canAffordCash || !isActionPhase}
                    className={`rounded-lg font-bold text-xs py-3 transition-all flex flex-col items-center justify-center ${
                        canAffordCash 
                        ? 'bg-[#232d2a] text-white hover:bg-emerald-600 border border-[#2d3a35]' 
                        : 'bg-[#1a2321] text-slate-600 cursor-not-allowed border border-[#2d3a35]'
                    }`}
                  >
                     <span>Buy Cash</span>
                  </button>
                  
                  <button
                    onClick={() => onBuy(item, 'bank')}
                    disabled={!isActionPhase}
                    className="rounded-lg font-bold text-xs py-3 transition-all flex flex-col items-center justify-center bg-blue-900/20 text-blue-400 border border-blue-900/40 hover:bg-blue-600 hover:text-white"
                  >
                     <span>Finance (0%)</span>
                  </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
