
import React, { useState } from 'react';
import { Player } from '../types';
import { formatCurrency, calculateBankCreditLimit, calculateUsedBankCredit, calculateSharkLimit } from '../services/gameEngine';
import { Building2, AlertTriangle, Wallet, Lock, TrendingUp, Info } from 'lucide-react';

interface BankProps {
  player: Player;
  month: number;
  onTakeSharkLoan: (amount: number) => void;
}

export const Bank: React.FC<BankProps> = ({ player, month, onTakeSharkLoan }) => {
  const [loanAmount, setLoanAmount] = useState<number>(50000);
  
  const bankLimit = calculateBankCreditLimit(player, month);
  const usedCredit = calculateUsedBankCredit(player);
  const availableCredit = Math.max(0, bankLimit - usedCredit);
  
  const sharkLimit = calculateSharkLimit(player);
  const maxSharkTake = Math.min(sharkLimit, 10000000); // Hard cap 10M

  const sharkInterestRate = 0.4; // 40% flat interest
  const sharkRepaymentMonths = 4;
  
  const totalRepayment = loanAmount * (1 + sharkInterestRate);
  const monthlyRepayment = totalRepayment / sharkRepaymentMonths;

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLoanAmount(Number(e.target.value));
  };

  return (
    <div className="pb-24 md:pb-10 space-y-8">
      
      {/* Header */}
      <div className="bg-[#1a2321] rounded-3xl p-8 border border-[#2d3a35] shadow-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
            <h1 className="text-4xl font-black text-white mb-2">Financial Services</h1>
            <p className="text-slate-400 text-sm max-w-lg">Manage your leverage. Use "Good Debt" to acquire assets via the Bank, or "Bad Debt" for emergencies via lenders.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* SAFE OPTION: BANK FINANCING */}
        <div className="bg-[#1a2321] rounded-3xl overflow-hidden border border-emerald-900/30 flex flex-col h-full">
            <div className="bg-emerald-900/20 p-6 border-b border-emerald-900/30">
                <div className="flex items-center space-x-3 mb-2">
                    <div className="bg-emerald-500/20 p-2 rounded-lg text-emerald-400">
                        <Building2 className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white">NaijaQuest Bank</h2>
                        <span className="text-[10px] text-emerald-400 uppercase font-bold tracking-widest">Asset Financing Partner</span>
                    </div>
                </div>
            </div>

            <div className="p-6 flex-grow flex flex-col justify-between">
                <div className="space-y-6">
                    <div className="bg-[#0f1715] rounded-xl p-4 border border-[#2d3a35]">
                        <p className="text-slate-400 text-xs font-bold uppercase mb-1">Asset Financing Limit</p>
                        <div className="flex items-end gap-2">
                            <span className="text-3xl font-mono font-bold text-white">{formatCurrency(availableCredit)}</span>
                            <span className="text-slate-500 text-sm mb-1">available</span>
                        </div>
                        <div className="w-full bg-[#2d3a35] h-1.5 rounded-full mt-3 overflow-hidden">
                            <div 
                                className="bg-emerald-500 h-full rounded-full" 
                                style={{ width: `${(usedCredit / bankLimit) * 100}%` }}
                            ></div>
                        </div>
                        <div className="flex justify-between mt-2 text-[10px] text-slate-500 font-medium">
                            <span>Used: {formatCurrency(usedCredit)}</span>
                            <span>Total Limit: {formatCurrency(bankLimit)}</span>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <div className="flex items-start gap-3">
                            <TrendingUp className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                            <div>
                                <p className="text-sm font-bold text-slate-200">0% Interest Financing</p>
                                <p className="text-xs text-slate-500">We buy the asset, you pay us back monthly. No interest charged.</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <Lock className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                            <div>
                                <p className="text-sm font-bold text-slate-200">Asset Backed</p>
                                <p className="text-xs text-slate-500">Only available for purchasing assets in the Market.</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-8 bg-emerald-500/5 rounded-xl p-4 border border-emerald-500/10 flex items-center gap-3">
                    <Info className="w-5 h-5 text-emerald-400 shrink-0" />
                    <p className="text-xs text-emerald-100">
                        To use this credit, go to the <strong>Market</strong> tab and select "Finance with Bank" when buying an asset.
                    </p>
                </div>
            </div>
        </div>

        {/* RISKY OPTION: LOAN SHARK */}
        <div className="bg-[#1a2321] rounded-3xl overflow-hidden border border-red-900/30 flex flex-col h-full relative">
            {/* Warning Overlay for Sapa */}
            <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                 <AlertTriangle className="w-64 h-64 text-red-500" />
            </div>

            <div className="bg-red-900/20 p-6 border-b border-red-900/30 z-10">
                <div className="flex items-center space-x-3 mb-2">
                    <div className="bg-red-500/20 p-2 rounded-lg text-red-400">
                        <Wallet className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white">Quick Cash (Loan Shark)</h2>
                        <span className="text-[10px] text-red-400 uppercase font-bold tracking-widest">Emergency Funds Only</span>
                    </div>
                </div>
            </div>

            <div className="p-6 flex-grow flex flex-col z-10">
                <p className="text-slate-400 text-sm mb-6">
                    Need cash now? We don't ask questions. Just make sure you pay back... or else.
                </p>

                <div className="bg-[#0f1715] rounded-xl p-6 border border-[#2d3a35] mb-6">
                    <div className="flex justify-between text-sm font-bold text-slate-300 mb-4">
                        <span>Loan Amount</span>
                        <span className="text-white font-mono">{formatCurrency(loanAmount)}</span>
                    </div>
                    <input 
                        type="range" 
                        min="50000" 
                        max={maxSharkTake} 
                        step="50000" 
                        value={loanAmount}
                        onChange={handleSliderChange}
                        className="w-full h-2 bg-[#2d3a35] rounded-lg appearance-none cursor-pointer accent-red-500 mb-6"
                    />

                    <div className="grid grid-cols-2 gap-4 text-center">
                        <div className="bg-[#1a2321] p-3 rounded-lg border border-[#2d3a35]">
                            <span className="text-[10px] text-slate-500 uppercase block font-bold">Total Payback</span>
                            <span className="text-red-400 font-mono font-bold">{formatCurrency(totalRepayment)}</span>
                        </div>
                        <div className="bg-[#1a2321] p-3 rounded-lg border border-[#2d3a35]">
                            <span className="text-[10px] text-slate-500 uppercase block font-bold">Monthly</span>
                            <span className="text-white font-mono font-bold">{formatCurrency(monthlyRepayment)}</span>
                        </div>
                    </div>
                </div>

                <div className="mt-auto space-y-4">
                    <div className="flex items-center justify-between text-xs text-slate-500 px-2">
                         <span>Interest Rate</span>
                         <span className="text-red-400 font-bold">40% Flat</span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-500 px-2">
                         <span>Duration</span>
                         <span className="text-white font-bold">4 Months</span>
                    </div>

                    <button 
                        onClick={() => onTakeSharkLoan(loanAmount)}
                        className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-red-900/20 transition-all active:scale-95 flex items-center justify-center gap-2"
                    >
                        <AlertTriangle className="w-5 h-5" />
                        Take Cash Loan
                    </button>
                </div>
            </div>
        </div>

      </div>
    </div>
  );
};
