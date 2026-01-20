
import React from 'react';
import { Player, MarketItem, Asset } from '../types';
import { MARKET_ITEMS } from '../constants';
import { formatCurrency, calculateBankCreditLimit, calculateUsedBankCredit } from '../services/gameEngine';
import { ShoppingCart, Briefcase, Car, Coins, AlertTriangle, Building2, Wallet, Lock, ArrowUpCircle, Laptop } from 'lucide-react';

interface MarketplaceProps {
  player: Player;
  onBuy: (item: MarketItem, method: 'cash' | 'bank') => void;
  onUpgrade: (asset: Asset) => void;
  isActionPhase: boolean;
}

export const Marketplace: React.FC<MarketplaceProps> = ({ player, onBuy, onUpgrade, isActionPhase }) => {

  const getIcon = (type: string) => {
    switch(type) {
      case 'Business': return <Briefcase className="w-5 h-5" />;
      case 'Side Hustle': return <Coins className="w-5 h-5" />;
      case 'Real Estate': return <Building2 className="w-5 h-5" />;
      case 'Asset': return <Car className="w-5 h-5" />;
      case 'Equipment': return <Laptop className="w-5 h-5" />;
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
            <p className="text-slate-400 text-sm max-w-md">Start a hustle, buy equipment, or invest in paper assets. Upgrade them to maximize returns.</p>
        </div>
        <div className="flex gap-4">
            <div className="flex items-center bg-[#0f1715] rounded-xl px-4 py-3 border border-white/5 shadow-inner min-w-[140px]">
                <Wallet className="w-5 h-5 text-emerald-400 mr-3" />
                <div>
                    <span className="text-slate-500 text-[10px] font-bold uppercase block">Cash</span>
                    <span className="text-white font-mono font-bold text-lg">{formatCurrency(player.cash)}</span>
                </div>
            </div>
            <div className="flex items-center bg-[#0f1715] rounded-xl px-4 py-3 border border-white/5 shadow-inner min-w-[140px]">
                <Building2 className="w-5 h-5 text-blue-400 mr-3" />
                <div>
                    <span className="text-slate-500 text-[10px] font-bold uppercase block">Financing</span>
                    <span className="text-blue-100 font-mono font-bold text-lg">Check Bank</span>
                </div>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedItems.map((item) => {
          // Check if player owns this asset
          // Logic: Find an asset of this type (marketId) that isn't maxed out yet.
          // If we find one that ISN'T maxed, we force the player to upgrade that one first.
          // If all instances are maxed (or none exist), allow buying a new one.
          const existingAssets = player.assets.filter(a => a.marketId === item.id || a.id.startsWith(item.id + '_'));
          const upgradableAsset = existingAssets.find(a => a.level < a.maxLevel);
          const isMaxedOut = existingAssets.length > 0 && !upgradableAsset;
          
          // If we have an asset that needs upgrading, we MUST upgrade it before buying new (Vertical Scaling first)
          const isUpgradeMode = !!upgradableAsset;
          
          const activeAsset = upgradableAsset || (existingAssets.length > 0 ? existingAssets[0] : null);
          
          const cost = isUpgradeMode && activeAsset ? item.upgradeCost : item.cost;
          const canAffordCash = player.cash >= cost;

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
                 
                 {activeAsset && (
                     <div className="bg-purple-900/20 border border-purple-500/30 rounded-xl p-3 mb-4">
                        <div className="flex justify-between items-center text-purple-200 text-xs font-bold mb-1">
                            <span>Current Level {activeAsset.level} / {item.maxLevel}</span>
                            {isMaxedOut ? <span className="text-emerald-400">MAXED</span> : <span>Scaling...</span>}
                        </div>
                        <div className="w-full bg-[#1a2321] h-1.5 rounded-full overflow-hidden">
                            <div className="h-full bg-purple-500" style={{ width: `${(activeAsset.level / item.maxLevel) * 100}%` }}></div>
                        </div>
                     </div>
                 )}

                 <div className="bg-[#0f1715] rounded-xl p-3 space-y-2">
                     <div className="flex justify-between text-xs">
                         <span className="text-slate-500 font-medium">{isUpgradeMode ? 'Upgrade Cost' : 'Startup Cost'}</span>
                         <span className="text-white font-mono font-bold">{formatCurrency(cost)}</span>
                     </div>
                     <div className="flex justify-between text-xs">
                         <span className="text-slate-500 font-medium">{isUpgradeMode ? 'Added Flow' : 'Est. Monthly'}</span>
                         <span className="text-emerald-400 font-mono font-bold">+{formatCurrency(isUpgradeMode ? item.upgradeFlowIncrease : item.cashFlow)}</span>
                     </div>
                 </div>
              </div>

              <div className="p-4 bg-[#151c1a] border-t border-[#2d3a35]">
                  {isUpgradeMode && activeAsset ? (
                      <button
                        onClick={() => onUpgrade(activeAsset)}
                        disabled={!canAffordCash || !isActionPhase}
                        className={`w-full rounded-lg font-bold text-xs py-3 transition-all flex items-center justify-center gap-2 ${
                            canAffordCash 
                            ? 'bg-purple-600 text-white hover:bg-purple-500 shadow-lg shadow-purple-900/20' 
                            : 'bg-[#232d2a] text-slate-600 cursor-not-allowed border border-[#2d3a35]'
                        }`}
                      >
                         <ArrowUpCircle className="w-4 h-4" />
                         <span>Upgrade to Level {activeAsset.level + 1}</span>
                      </button>
                  ) : (
                    <div className="grid grid-cols-2 gap-3">
                        <button
                            onClick={() => onBuy(item, 'cash')}
                            disabled={!canAffordCash || !isActionPhase}
                            className={`rounded-lg font-bold text-xs py-3 transition-all flex flex-col items-center justify-center ${
                                canAffordCash 
                                ? 'bg-[#232d2a] text-white hover:bg-emerald-600 border border-[#2d3a35]' 
                                : 'bg-[#1a2321] text-slate-600 cursor-not-allowed border border-[#2d3a35]'
                            }`}
                        >
                            <span>{isMaxedOut ? 'Buy Another (Scale)' : 'Buy Cash'}</span>
                        </button>
                        
                        <button
                            onClick={() => onBuy(item, 'bank')}
                            disabled={!isActionPhase}
                            className="rounded-lg font-bold text-xs py-3 transition-all flex flex-col items-center justify-center bg-blue-900/20 text-blue-400 border border-blue-900/40 hover:bg-blue-600 hover:text-white"
                        >
                            <span>Finance (Low Interest)</span>
                        </button>
                    </div>
                  )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
