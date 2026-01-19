
import React, { useState } from 'react';
import { GameEvent, Player, EventChoice, EventResult } from '../types';
import { formatCurrency } from '../services/gameEngine';
import { AlertTriangle, TrendingUp, Users, DollarSign, Activity, Percent, ArrowRight, CheckCircle, XCircle, Wallet, Building2, Scissors } from 'lucide-react';

interface EventModalProps {
  event: GameEvent;
  player: Player;
  bankLimit: number;
  usedBankCredit: number;
  onClose: () => void;
  onAction: (result: EventResult, cost: number, isSuccess: boolean, paymentMethod: 'cash' | 'bank') => void;
  onTakeLoan: (amount: number) => void;
  onAusterity: () => void;
}

export const EventModal: React.FC<EventModalProps> = ({ 
  event, 
  player, 
  bankLimit,
  usedBankCredit,
  onClose, 
  onAction, 
  onTakeLoan,
  onAusterity
}) => {
  const [outcome, setOutcome] = useState<{
    result: EventResult;
    success: boolean;
    cost: number;
    paymentMethod: 'cash' | 'bank';
  } | null>(null);

  const [showEmergencyOptions, setShowEmergencyOptions] = useState(false);

  const availableCredit = bankLimit - usedBankCredit;

  const handleChoiceClick = (choice: EventChoice, method: 'cash' | 'bank') => {
    const cost = choice.cost || 0;
    
    // Dice Roll Logic
    let result = choice.onSuccess;
    let isSuccess = true;

    if (choice.successChance !== undefined && choice.successChance < 1) {
       const roll = Math.random();
       if (roll > choice.successChance) {
         isSuccess = false;
         result = choice.onFailure || { message: "Action failed with no specific consequence." };
       }
    }

    setOutcome({ result, success: isSuccess, cost, paymentMethod: method });
  };

  const handleContinue = () => {
    if (outcome) {
      onAction(outcome.result, outcome.cost, outcome.success, outcome.paymentMethod);
    }
  };

  const handleEmergencyLoan = () => {
      onTakeLoan(50000); 
      setShowEmergencyOptions(false);
  };

  const handleAusterityClick = () => {
      onAusterity();
      setShowEmergencyOptions(false);
  };
  
  const getIcon = () => {
    switch (event.type) {
      case 'Opportunity': return <TrendingUp className="w-12 h-12 text-emerald-400" />;
      case 'Shock': return <AlertTriangle className="w-12 h-12 text-red-400" />;
      case 'Social': return <Users className="w-12 h-12 text-blue-400" />;
      case 'Economic': return <Activity className="w-12 h-12 text-purple-400" />;
      default: return <DollarSign className="w-12 h-12 text-yellow-400" />;
    }
  };

  const getHeaderStyle = () => {
    switch (event.type) {
      case 'Opportunity': return 'bg-emerald-900/30 text-emerald-100';
      case 'Shock': return 'bg-red-900/30 text-red-100';
      case 'Social': return 'bg-blue-900/30 text-blue-100';
      case 'Economic': return 'bg-purple-900/30 text-purple-100';
      default: return 'bg-slate-800 text-slate-100';
    }
  };

  // Determine if player is stuck (cannot afford ANY choice via CASH)
  const affordableChoices = event.choices.filter(c => {
      if (!c.cost) return true;
      const canPayCash = player.cash >= c.cost;
      const canPayBank = c.cost <= availableCredit;
      return canPayCash || canPayBank;
  });
  
  const isStuck = affordableChoices.length === 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in duration-200 overflow-y-auto">
      
      {/* Content Container */}
      <div className="relative w-full max-w-lg bg-[#1a2321] border border-[#2d3a35] rounded-3xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[95dvh]">
        
        {/* --- VIEW 1: EVENT CHOICES --- */}
        {!outcome && (
            <>
                {/* Header */}
                <div className={`p-6 flex flex-col items-center justify-center ${getHeaderStyle()} flex-shrink-0 relative`}>
                    <div className="bg-[#0f1715] p-3 rounded-full shadow-lg mb-3 border border-white/5">
                    {React.cloneElement(getIcon() as React.ReactElement<any>, { className: "w-8 h-8" })}
                    </div>
                    <span className="inline-block px-3 py-0.5 rounded-full text-[10px] font-black tracking-widest uppercase mb-1 bg-black/20">
                    {event.type}
                    </span>
                    <h3 className="text-xl font-black text-center leading-tight">{event.title}</h3>

                    {/* Cash Indicator */}
                    <div className="absolute top-4 right-4 flex flex-col items-end">
                        <div className="bg-black/40 px-3 py-1 rounded-lg border border-white/10 backdrop-blur-md mb-1">
                            <span className={`text-xs font-mono font-bold ${player.cash < 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                                {formatCurrency(player.cash)}
                            </span>
                        </div>
                        <span className="text-[9px] text-slate-400 uppercase font-bold tracking-wider">
                            Credit: {formatCurrency(availableCredit)}
                        </span>
                    </div>
                </div>

                {/* Scrollable Content */}
                <div className="p-5 overflow-y-auto flex-grow custom-scrollbar">
                    <p className="text-slate-300 mb-6 text-center text-sm leading-relaxed">{event.description}</p>

                    <div className="space-y-3">
                    {event.choices.map((choice) => {
                        const cost = choice.cost || 0;
                        const canAffordCash = cost <= player.cash;
                        const canAffordBank = cost > 0 && cost <= availableCredit;
                        
                        const hasReqAsset = choice.reqAssetType ? player.assets.some(a => a.type === choice.reqAssetType) : true;
                        
                        const isActionable = !choice.cost ? hasReqAsset : (canAffordCash || canAffordBank) && hasReqAsset;
                        
                        const isRisky = choice.successChance && choice.successChance < 1;

                        return (
                        <div 
                            key={choice.id}
                            className={`w-full group relative flex flex-col p-4 rounded-2xl border-2 transition-all duration-200 text-left ${
                                !isActionable
                                ? 'border-[#2d3a35] bg-[#151c1a] opacity-50' 
                                : 'border-[#2d3a35] bg-[#0f1715]'
                            }`}
                        >
                            <div className="flex justify-between items-start w-full mb-1">
                                <span className={`font-bold text-base ${!isActionable ? 'text-slate-500' : 'text-slate-100'}`}>
                                    {choice.label}
                                </span>
                                {cost > 0 && (
                                    <span className="font-mono text-[10px] font-bold px-2 py-1 rounded bg-[#232d2a] text-slate-300">
                                    -{formatCurrency(cost)}
                                    </span>
                                )}
                                {!cost && (
                                    <span className="font-mono text-[10px] font-bold px-2 py-1 rounded bg-emerald-500/10 text-emerald-400">
                                        Free
                                    </span>
                                )}
                            </div>
                            
                            {choice.description && (
                            <p className="text-xs text-slate-400 pr-8 leading-normal mb-3">{choice.description}</p>
                            )}

                            {isRisky && isActionable && (
                            <div className="mb-3 flex items-center text-[10px] font-bold text-orange-400 bg-orange-400/10 w-fit px-2 py-0.5 rounded">
                                <Percent className="w-3 h-3 mr-1" />
                                Risk: {Math.round((1 - (choice.successChance || 0)) * 100)}%
                            </div>
                            )}

                            {/* Action Buttons */}
                            <div className="flex gap-2 mt-auto">
                                {/* Cash Button */}
                                {cost > 0 && (
                                    <button
                                        onClick={() => handleChoiceClick(choice, 'cash')}
                                        disabled={!canAffordCash}
                                        className={`flex-1 py-2 px-2 rounded-lg text-xs font-bold border transition-colors flex items-center justify-center gap-1 ${
                                            canAffordCash
                                            ? 'bg-emerald-600 border-emerald-500 text-white hover:bg-emerald-500'
                                            : 'bg-transparent border-[#2d3a35] text-slate-600 cursor-not-allowed'
                                        }`}
                                    >
                                        <Wallet className="w-3 h-3" /> Pay Cash
                                    </button>
                                )}

                                {/* Bank Button (Only if cost > 0) */}
                                {cost > 0 && (
                                    <button
                                        onClick={() => handleChoiceClick(choice, 'bank')}
                                        disabled={!canAffordBank}
                                        className={`flex-1 py-2 px-2 rounded-lg text-xs font-bold border transition-colors flex items-center justify-center gap-1 ${
                                            canAffordBank
                                            ? 'bg-blue-900/30 border-blue-800 text-blue-300 hover:bg-blue-800 hover:text-white'
                                            : 'bg-transparent border-[#2d3a35] text-slate-600 cursor-not-allowed'
                                        }`}
                                    >
                                        <Building2 className="w-3 h-3" /> Finance
                                    </button>
                                )}

                                {/* Free/No Cost Button */}
                                {!cost && (
                                    <button
                                        onClick={() => handleChoiceClick(choice, 'cash')}
                                        disabled={!hasReqAsset}
                                        className={`w-full py-2 px-2 rounded-lg text-xs font-bold border transition-colors ${
                                            hasReqAsset
                                            ? 'bg-white text-black hover:bg-slate-200'
                                            : 'bg-[#232d2a] text-slate-500 cursor-not-allowed'
                                        }`}
                                    >
                                        Select Option
                                    </button>
                                )}
                            </div>
                        </div>
                        );
                    })}
                    </div>

                    {/* Emergency Section */}
                    {(isStuck || showEmergencyOptions) && (
                        <div className="mt-6 space-y-3 animate-in fade-in slide-in-from-bottom-2 pb-2">
                             <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest text-center">Emergency Options</h4>
                             
                             {/* Shark Loan */}
                             <div className="p-3 bg-red-900/10 border border-red-900/30 rounded-xl flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-red-500/20 rounded-lg text-red-400">
                                        <Wallet className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <h5 className="text-xs font-bold text-white">Shark Loan</h5>
                                        <p className="text-[10px] text-slate-400">Get ₦50,000. Pay back ₦70,000.</p>
                                    </div>
                                </div>
                                <button 
                                    onClick={handleEmergencyLoan}
                                    className="bg-red-600 hover:bg-red-700 text-white text-[10px] font-bold px-3 py-2 rounded-lg transition-colors"
                                >
                                    Take Cash
                                </button>
                             </div>

                             {/* Austerity Measures */}
                             <div className="p-3 bg-orange-900/10 border border-orange-900/30 rounded-xl flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-orange-500/20 rounded-lg text-orange-400">
                                        <Scissors className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <h5 className="text-xs font-bold text-white">Austerity Measures</h5>
                                        <p className="text-[10px] text-slate-400">Cut expenses by 30%. Suffer Mood.</p>
                                    </div>
                                </div>
                                <button 
                                    onClick={handleAusterityClick}
                                    className="bg-orange-600 hover:bg-orange-700 text-white text-[10px] font-bold px-3 py-2 rounded-lg transition-colors"
                                >
                                    Cut Costs
                                </button>
                             </div>
                        </div>
                    )}
                    
                    {!isStuck && !showEmergencyOptions && (
                        <button 
                            onClick={() => setShowEmergencyOptions(true)}
                            className="mt-6 mb-2 w-full text-center text-[10px] text-slate-500 hover:text-white transition-colors uppercase font-bold tracking-widest"
                        >
                            Open Emergency Menu
                        </button>
                    )}

                </div>
            </>
        )}

        {/* --- VIEW 2: OUTCOME --- */}
        {outcome && (
            <div className="flex flex-col h-full animate-in fade-in zoom-in duration-300">
              <div className={`flex-grow flex flex-col items-center justify-center p-6 text-center space-y-4 ${outcome.success ? 'bg-gradient-to-b from-emerald-900/20 to-transparent' : 'bg-gradient-to-b from-red-900/20 to-transparent'}`}>
                
                <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-2 ${outcome.success ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                   {outcome.success ? <CheckCircle className="w-10 h-10" /> : <XCircle className="w-10 h-10" />}
                </div>

                <h2 className={`text-2xl font-black uppercase tracking-wide ${outcome.success ? 'text-emerald-400' : 'text-red-400'}`}>
                  {outcome.success ? 'Success!' : 'Failed!'}
                </h2>

                <p className="text-white text-base leading-relaxed font-medium px-4">
                  {outcome.result.message}
                </p>

                <div className="bg-black/30 p-4 rounded-xl border border-white/5 w-full max-w-xs space-y-2 mt-4">
                   {outcome.cost > 0 && (
                     <div className="flex justify-between text-xs">
                       <span className="text-slate-400">Cost</span>
                       <span className="text-red-400 font-mono">-{formatCurrency(outcome.cost)}</span>
                     </div>
                   )}
                   {outcome.cost > 0 && (
                     <div className="flex justify-between text-xs">
                       <span className="text-slate-400">Payment Method</span>
                       <span className={`font-bold uppercase ${outcome.paymentMethod === 'bank' ? 'text-blue-400' : 'text-emerald-400'}`}>
                           {outcome.paymentMethod === 'bank' ? 'Bank Credit' : 'Cash'}
                       </span>
                     </div>
                   )}
                   {outcome.result.cashChange && (
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-400">Cash Impact</span>
                        <span className={`font-mono ${outcome.result.cashChange > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                           {outcome.result.cashChange > 0 ? '+' : ''}{formatCurrency(outcome.result.cashChange)}
                        </span>
                      </div>
                   )}
                   {outcome.result.socialCapitalChange && (
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-400">Reputation</span>
                        <span className={`font-bold ${outcome.result.socialCapitalChange > 0 ? 'text-blue-400' : 'text-orange-400'}`}>
                           {outcome.result.socialCapitalChange > 0 ? '+' : ''}{outcome.result.socialCapitalChange}
                        </span>
                      </div>
                   )}
                   {outcome.result.healthChange && (
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-400">Health</span>
                        <span className={`font-bold ${outcome.result.healthChange > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                           {outcome.result.healthChange > 0 ? '+' : ''}{outcome.result.healthChange}
                        </span>
                      </div>
                   )}
                   {outcome.result.moodChange && (
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-400">Mood</span>
                        <span className={`font-bold ${outcome.result.moodChange > 0 ? 'text-yellow-400' : 'text-slate-400'}`}>
                           {outcome.result.moodChange > 0 ? '+' : ''}{outcome.result.moodChange}
                        </span>
                      </div>
                   )}
                </div>

              </div>
              
              <div className="p-4 border-t border-[#2d3a35] bg-[#0f1715]">
                 <button 
                  onClick={handleContinue}
                  className="w-full bg-white text-black font-black text-base py-3 rounded-xl hover:bg-slate-200 transition-colors flex items-center justify-center"
                 >
                   Continue <ArrowRight className="ml-2 w-4 h-4" />
                 </button>
              </div>
            </div>
        )}

      </div>
    </div>
  );
};
