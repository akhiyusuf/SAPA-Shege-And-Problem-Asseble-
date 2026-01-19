
import React from 'react';
import { Player, Asset, Liability } from '../types';
import { formatCurrency, calculateNetWorth } from '../services/gameEngine';
import { Briefcase, Building, Coins, Car, CheckCircle, PiggyBank, ArrowRight, Clock } from 'lucide-react';

interface FinancialStatementProps {
  player: Player;
  onRepayLiability: (liability: Liability) => void;
  onSellAsset: (asset: Asset) => void;
  isActionPhase: boolean;
  gameLog: string[];
}

interface AssetGroup {
  asset: Asset;
  count: number;
  totalFlow: number;
  instances: Asset[];
}

export const FinancialStatement: React.FC<FinancialStatementProps> = ({ player, onRepayLiability, onSellAsset, isActionPhase, gameLog }) => {
  const netWorth = calculateNetWorth(player);

  const getAssetIcon = (type: Asset['type']) => {
    switch (type) {
        case 'Real Estate': return <Building className="w-5 h-5" />;
        case 'Business': return <Briefcase className="w-5 h-5" />;
        case 'Side Hustle': return <Car className="w-5 h-5" />;
        case 'Paper Asset': return <Coins className="w-5 h-5" />;
        default: return <Coins className="w-5 h-5" />;
    }
  };

  // Group assets by name/type
  const groupedAssets = player.assets.reduce((acc, asset) => {
      const key = `${asset.name}-${asset.type}`;
      if (!acc[key]) {
          acc[key] = {
              asset: asset, // Store one instance for display info
              count: 0,
              totalFlow: 0,
              instances: []
          };
      }
      acc[key].count += 1;
      acc[key].totalFlow += asset.cashFlow;
      acc[key].instances.push(asset);
      return acc;
  }, {} as Record<string, AssetGroup>);

  return (
    <div className="pb-24 md:pb-10">
      
      {/* Net Worth Header */}
      <div className="bg-[#1a2321] rounded-3xl p-8 border border-[#2d3a35] shadow-lg mb-8">
        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-2">Total Net Worth</p>
        <div className="flex items-end gap-4 mb-4">
            <h1 className="text-5xl font-black text-white tracking-tight">
                {formatCurrency(netWorth)}
            </h1>
        </div>
        <div className="h-px w-full bg-[#2d3a35] mb-4"></div>
        <div className="flex gap-8">
            <div>
                <span className="text-slate-500 text-xs font-bold uppercase block">Cash</span>
                <span className="text-white font-mono font-bold">{formatCurrency(player.cash)}</span>
            </div>
            <div>
                <span className="text-slate-500 text-xs font-bold uppercase block">Assets</span>
                <span className="text-white font-mono font-bold">{formatCurrency(player.assets.reduce((a,b)=>a+b.cost, 0))}</span>
            </div>
            <div>
                <span className="text-slate-500 text-xs font-bold uppercase block">Debts</span>
                <span className="text-red-400 font-mono font-bold">{formatCurrency(player.liabilities.reduce((a,b)=>a+b.totalOwed, 0))}</span>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Left Col: Assets */}
        <div>
            <div className="flex justify-between items-center mb-4 px-1">
                <h2 className="text-xl font-bold text-white">Your Assets</h2>
                <button className="text-xs font-bold text-[#eab308] uppercase tracking-wider hover:text-yellow-300 transition-colors">Go to Market</button>
            </div>

            {player.assets.length === 0 ? (
                <div className="bg-[#1a2321] rounded-2xl p-8 border border-dashed border-[#2d3a35] text-center hover:bg-[#1f2927] transition-colors cursor-pointer group">
                    <div className="w-16 h-16 bg-[#232d2a] rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:bg-[#2d3a35]">
                        <PiggyBank className="w-8 h-8 text-slate-500 group-hover:text-emerald-500 transition-colors" />
                    </div>
                    <h3 className="text-slate-300 font-bold mb-2">Portfolio is Empty</h3>
                    <p className="text-slate-500 text-sm mb-6 max-w-xs mx-auto">Assets put money in your pocket. Start investing to build your wealth column.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {Object.values(groupedAssets).map((group: AssetGroup, idx) => (
                        <div key={`group-${idx}`} className="bg-[#1a2321] p-4 rounded-2xl border border-[#2d3a35] flex items-center justify-between hover:border-emerald-500/30 transition-colors">
                            <div className="flex items-center">
                                <div className="w-12 h-12 rounded-xl bg-[#232d2a] flex items-center justify-center text-emerald-500 mr-4 border border-white/5 relative">
                                    {getAssetIcon(group.asset.type)}
                                    {group.count > 1 && (
                                        <div className="absolute -top-2 -right-2 bg-emerald-600 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-[#1a2321]">
                                            {group.count}
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h4 className="font-bold text-white text-sm">{group.asset.name}</h4>
                                        {group.count > 1 && <span className="text-[10px] text-slate-500 font-bold">x{group.count}</span>}
                                    </div>
                                    <p className="text-emerald-500 text-xs font-mono font-bold">+{formatCurrency(group.totalFlow, group.asset.currency)}/mo</p>
                                </div>
                            </div>
                            <button 
                                onClick={() => onSellAsset(group.instances[0])} // Sell one instance
                                disabled={!isActionPhase}
                                className="text-xs bg-[#232d2a] hover:bg-red-900/20 hover:text-red-400 text-slate-400 px-3 py-1.5 rounded-lg border border-[#2d3a35] transition-colors"
                            >
                                Sell 1
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>

        {/* Right Col: Liabilities */}
        <div>
            <h2 className="text-xl font-bold text-white mb-4 px-1">Outstanding Debts</h2>
            
            <div className="space-y-3">
                {player.liabilities.map((liab, idx) => {
                    const canAfford = player.cash >= liab.totalOwed;
                    
                    return (
                        <div key={`liab-${idx}`} className="bg-[#1a2321] p-5 rounded-2xl border border-[#2d3a35]">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center">
                                    <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 mr-4">
                                        <Car className="w-5 h-5" /> 
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-white text-sm">{liab.name}</h4>
                                        <p className="text-slate-500 text-xs">Payment: -{formatCurrency(liab.monthlyPayment)}/mo</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className="text-[10px] text-slate-500 font-bold uppercase block">Remaining</span>
                                    <p className="text-white font-bold font-mono">{formatCurrency(liab.totalOwed)}</p>
                                </div>
                            </div>

                            {/* Term Progress Bar */}
                            {liab.termRemaining !== undefined && (
                                <div className="mb-4">
                                    <div className="flex justify-between text-[10px] text-slate-500 font-bold mb-1">
                                        <span className="flex items-center"><Clock className="w-3 h-3 mr-1"/> Loan Term</span>
                                        <span>{liab.termRemaining} months left</span>
                                    </div>
                                    <div className="w-full h-1.5 bg-[#0f1715] rounded-full overflow-hidden">
                                        <div className="h-full bg-red-500/50 rounded-full" style={{ width: '100%' }}></div> 
                                        {/* Ideally width is proportional to paid amount, but we track remaining. */}
                                    </div>
                                </div>
                            )}

                            <div className="flex items-center justify-between mt-4 pt-4 border-t border-[#2d3a35]">
                                <span className="text-xs text-slate-500">Early Payoff</span>
                                <button
                                    onClick={() => onRepayLiability(liab)}
                                    disabled={!canAfford || !isActionPhase}
                                    className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center transition-all ${
                                        canAfford 
                                        ? 'bg-[#15803d] text-white hover:bg-emerald-600' 
                                        : 'bg-[#232d2a] text-slate-500 cursor-not-allowed'
                                    }`}
                                >
                                    Pay {formatCurrency(liab.totalOwed)}
                                </button>
                            </div>
                        </div>
                    );
                })}
                {player.liabilities.length === 0 && (
                    <div className="bg-[#1a2321] p-6 rounded-2xl border border-[#2d3a35] flex flex-col items-center justify-center text-emerald-500 h-40">
                        <CheckCircle className="w-10 h-10 mb-2" />
                        <span className="font-bold text-lg">Debt Free!</span>
                        <span className="text-xs text-slate-500">You have no outstanding liabilities.</span>
                    </div>
                )}
            </div>
        </div>

      </div>

      {/* History Section */}
      <div className="mt-8">
         <h2 className="text-xl font-bold text-white mb-4 px-1">Activity Log</h2>
         <div className="bg-[#1a2321] rounded-3xl p-6 border border-[#2d3a35]">
            <div className="space-y-6 relative">
                <div className="absolute left-1.5 top-2 bottom-2 w-0.5 bg-[#2d3a35]"></div>

                {gameLog.slice(0, 5).map((log, i) => (
                    <div key={i} className="relative pl-6">
                        <div className={`absolute left-0 top-1.5 w-3.5 h-3.5 rounded-full border-2 border-[#1a2321] ${i===0 ? 'bg-emerald-500' : 'bg-[#52525b]'}`}></div>
                        <p className="text-[10px] text-slate-500 font-bold uppercase mb-0.5">
                            {i === 0 ? 'TODAY' : i === 1 ? 'YESTERDAY' : `PREVIOUS`}
                        </p>
                        <p className="text-slate-200 text-sm font-medium leading-snug">{log}</p>
                    </div>
                ))}
            </div>
         </div>
      </div>

    </div>
  );
};
