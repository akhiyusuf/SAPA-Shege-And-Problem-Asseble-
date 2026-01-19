
import React, { useState } from 'react';
import { Player, Asset } from '../types';
import { formatCurrency } from '../services/gameEngine';
import { AlertTriangle, TrendingDown, Wallet, DollarSign, Ban, Skull, Users, Clock, Hammer } from 'lucide-react';

interface InsolvencyModalProps {
  player: Player;
  deficit: number;
  onTakeSharkLoan: (amount: number) => void;
  onSellAsset: (asset: Asset, distressValue: number) => void;
  onBegging: () => void;
  onDeferment: () => void;
  onLabor: () => void;
  onDefault: () => void;
}

export const InsolvencyModal: React.FC<InsolvencyModalProps> = ({ 
  player, 
  deficit, 
  onTakeSharkLoan,
  onSellAsset,
  onBegging,
  onDeferment,
  onLabor,
  onDefault 
}) => {
  const [activeView, setActiveView] = useState<'main' | 'sell'>('main');

  const distressFactor = 0.75; // Sell at 75% value
  const minSharkLoan = Math.ceil(deficit / 50000) * 50000; // Round up to nearest 50k
  
  // Calculate potential gains
  const beggingAmount = player.socialCapital * 1000; // e.g., 50 rep = 50k
  const laborAmount = 15000; // Fixed small amount

  // Check if user has loans to defer
  const hasLoans = player.liabilities.some(l => l.type === 'Loan');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md p-4 animate-in fade-in duration-300 overflow-y-auto">
      <div className="bg-[#1a0505] border-2 border-red-900 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl shadow-red-900/20 my-auto">
        
        {/* Header */}
        <div className="bg-red-900/20 p-6 flex flex-col items-center border-b border-red-900/30">
            <div className="w-16 h-16 bg-red-600/20 rounded-full flex items-center justify-center mb-4 animate-pulse">
                <Ban className="w-8 h-8 text-red-500" />
            </div>
            <h2 className="text-2xl font-black text-red-500 uppercase tracking-widest text-center">Insolvency Alert</h2>
            <p className="text-red-200 text-sm text-center mt-2 max-w-xs">
                Your projected expenses exceed your cash. You need <strong>{formatCurrency(deficit)}</strong> to survive this month.
            </p>
        </div>

        {/* Content */}
        <div className="p-6">
            
            {activeView === 'main' && (
                <div className="space-y-6">
                    
                    {/* SECTION 1: FINANCIAL TOOLS */}
                    <div className="space-y-3">
                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Financial Options</h4>
                        {/* Option 1: Shark Loan */}
                        <button 
                            onClick={() => onTakeSharkLoan(minSharkLoan)}
                            className="w-full bg-[#1a2321] hover:bg-[#232d2a] border border-[#2d3a35] hover:border-emerald-500/30 p-4 rounded-xl flex items-center justify-between group transition-all"
                        >
                            <div className="flex items-center gap-4">
                                <div className="bg-emerald-500/10 p-2 rounded-lg text-emerald-400 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                                    <Wallet className="w-5 h-5" />
                                </div>
                                <div className="text-left">
                                    <h3 className="font-bold text-white text-sm">Emergency Loan</h3>
                                    <p className="text-[10px] text-slate-400">Borrow {formatCurrency(minSharkLoan)} from Shark.</p>
                                </div>
                            </div>
                        </button>

                        {/* Option 2: Distress Sale */}
                        {player.assets.length > 0 && (
                            <button 
                                onClick={() => setActiveView('sell')}
                                className="w-full bg-[#1a2321] hover:bg-[#232d2a] border border-[#2d3a35] hover:border-yellow-500/30 p-4 rounded-xl flex items-center justify-between group transition-all"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="bg-yellow-500/10 p-2 rounded-lg text-yellow-400 group-hover:bg-yellow-500 group-hover:text-white transition-colors">
                                        <DollarSign className="w-5 h-5" />
                                    </div>
                                    <div className="text-left">
                                        <h3 className="font-bold text-white text-sm">Liquidate Assets</h3>
                                        <p className="text-[10px] text-slate-400">Sell assets instantly at 25% loss.</p>
                                    </div>
                                </div>
                            </button>
                        )}
                    </div>

                    {/* SECTION 2: SURVIVAL STRATEGIES */}
                    <div className="space-y-3">
                        <h4 className="text-xs font-bold text-blue-400 uppercase tracking-widest">Survival Strategies</h4>
                        
                        {/* Strategy A: Begging */}
                        <button 
                            onClick={onBegging}
                            disabled={player.socialCapital < 10}
                            className={`w-full p-4 rounded-xl flex items-center justify-between group transition-all border ${player.socialCapital >= 10 ? 'bg-blue-900/10 hover:bg-blue-900/20 border-blue-900/30' : 'bg-[#1a2321] opacity-50 border-[#2d3a35] cursor-not-allowed'}`}
                        >
                            <div className="flex items-center gap-4">
                                <div className="bg-blue-500/10 p-2 rounded-lg text-blue-400">
                                    <Users className="w-5 h-5" />
                                </div>
                                <div className="text-left">
                                    <h3 className="font-bold text-white text-sm">Beg "Village People"</h3>
                                    <p className="text-[10px] text-slate-400">
                                        Raise ~{formatCurrency(beggingAmount)}. Cost: -15 Reputation.
                                    </p>
                                </div>
                            </div>
                        </button>

                        {/* Strategy B: Deferment */}
                        <button 
                            onClick={onDeferment}
                            disabled={!hasLoans}
                            className={`w-full p-4 rounded-xl flex items-center justify-between group transition-all border ${hasLoans ? 'bg-purple-900/10 hover:bg-purple-900/20 border-purple-900/30' : 'bg-[#1a2321] opacity-50 border-[#2d3a35] cursor-not-allowed'}`}
                        >
                            <div className="flex items-center gap-4">
                                <div className="bg-purple-500/10 p-2 rounded-lg text-purple-400">
                                    <Clock className="w-5 h-5" />
                                </div>
                                <div className="text-left">
                                    <h3 className="font-bold text-white text-sm">Defer Payments</h3>
                                    <p className="text-[10px] text-slate-400">
                                        Skip this month's loan payments. Total debt increases +10%.
                                    </p>
                                </div>
                            </div>
                        </button>

                        {/* Strategy C: Menial Labor */}
                        <button 
                            onClick={onLabor}
                            className="w-full bg-orange-900/10 hover:bg-orange-900/20 border border-orange-900/30 p-4 rounded-xl flex items-center justify-between group transition-all"
                        >
                            <div className="flex items-center gap-4">
                                <div className="bg-orange-500/10 p-2 rounded-lg text-orange-400">
                                    <Hammer className="w-5 h-5" />
                                </div>
                                <div className="text-left">
                                    <h3 className="font-bold text-white text-sm">Menial Labor</h3>
                                    <p className="text-[10px] text-slate-400">
                                        Earn {formatCurrency(laborAmount)}. Cost: -10 Health/Mood.
                                    </p>
                                </div>
                            </div>
                        </button>
                    </div>

                    {/* Option 3: Default (Sapa) */}
                    <div className="pt-4 mt-2 border-t border-red-900/20">
                        <button 
                            onClick={onDefault}
                            className="w-full bg-red-900/10 hover:bg-red-900/20 border border-red-900/30 p-4 rounded-xl flex items-center justify-between group transition-all"
                        >
                            <div className="flex items-center gap-4">
                                <div className="bg-red-500/10 p-2 rounded-lg text-red-400 group-hover:bg-red-600 group-hover:text-white transition-colors">
                                    <Skull className="w-5 h-5" />
                                </div>
                                <div className="text-left">
                                    <h3 className="font-bold text-red-400 text-sm">Give Up (Sapa Mode)</h3>
                                    <p className="text-[10px] text-red-200/60">Bills eat your cash. Major Health/Mood damage.</p>
                                </div>
                            </div>
                        </button>
                    </div>
                </div>
            )}

            {activeView === 'sell' && (
                <div className="space-y-3">
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="text-sm font-bold text-slate-300">Select Asset to Liquidate</h3>
                        <button onClick={() => setActiveView('main')} className="text-xs text-slate-500 hover:text-white">Cancel</button>
                    </div>
                    <div className="max-h-60 overflow-y-auto pr-1 space-y-2 custom-scrollbar">
                        {player.assets.map((asset) => {
                             const value = asset.resaleValue || asset.cost;
                             const distressPrice = Math.floor(value * distressFactor);
                             return (
                                <button 
                                    key={asset.id}
                                    onClick={() => onSellAsset(asset, distressPrice)}
                                    className="w-full bg-[#0f1715] p-3 rounded-lg border border-[#2d3a35] flex justify-between items-center hover:bg-red-900/10 hover:border-red-500/30 transition-all"
                                >
                                    <div className="text-left">
                                        <div className="text-sm font-bold text-white">{asset.name}</div>
                                        <div className="text-[10px] text-slate-500">Value: {formatCurrency(value)}</div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-sm font-bold text-emerald-400">+{formatCurrency(distressPrice)}</div>
                                        <div className="text-[10px] text-red-400 font-bold">(-25%)</div>
                                    </div>
                                </button>
                             );
                        })}
                    </div>
                </div>
            )}

        </div>
      </div>
    </div>
  );
};
