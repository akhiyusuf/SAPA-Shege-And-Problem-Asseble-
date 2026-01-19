import React, { useState } from 'react';
import { Player } from '../types';
import { calculateMonthlyCashFlow, calculatePassiveIncome, calculateTotalExpenses, formatCurrency, calculateProgressToFreedom } from '../services/gameEngine';
import { Wallet, Globe, Users, TrendingUp, Home, Briefcase, ShoppingBag, Truck, AlertCircle, ArrowRight, Heart, Smile } from 'lucide-react';

interface DashboardProps {
  player: Player;
  month: number;
  exchangeRate: number;
  onNextMonth: () => void;
  isActionPhase: boolean;
}

export const Dashboard: React.FC<DashboardProps> = ({ player, month, exchangeRate, onNextMonth, isActionPhase }) => {
  const [viewMode, setViewMode] = useState<'income' | 'expenses'>('expenses');
  
  const monthlyCashFlow = calculateMonthlyCashFlow(player, exchangeRate);
  const passiveIncome = calculatePassiveIncome(player.assets, exchangeRate);
  const totalExpenses = calculateTotalExpenses(player.expenses, player.liabilities);
  const progress = calculateProgressToFreedom(player, exchangeRate);
  
  const totalIncome = player.salary + passiveIncome;

  const getHealthColor = (val: number) => {
    if (val > 70) return 'text-emerald-400';
    if (val > 30) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="relative">
      
      {/* Top Bar Indicators */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-2 md:space-x-3 overflow-x-auto scrollbar-hide">
            <div className="bg-[#1a2321] rounded-lg px-2 md:px-3 py-2 flex items-center border border-[#2d3a35] whitespace-nowrap">
                <Globe className="w-4 h-4 text-emerald-500 mr-2" />
                <span className="text-xs font-mono text-emerald-100">{formatCurrency(exchangeRate).replace('NGN', '₦')}/$</span>
            </div>
            
            {/* Stats Indicators */}
            <div className="flex items-center space-x-2">
                 <div className="bg-[#1a2321] rounded-lg p-2 flex items-center border border-[#2d3a35]" title="Health">
                     <Heart className={`w-4 h-4 ${getHealthColor(player.health)} ${player.health < 30 ? 'animate-pulse' : ''} mr-1.5`} fill="currentColor" />
                     <span className={`text-xs font-bold ${getHealthColor(player.health)}`}>{player.health}%</span>
                 </div>
                 <div className="bg-[#1a2321] rounded-lg p-2 flex items-center border border-[#2d3a35]" title="Mood">
                     <Smile className={`w-4 h-4 ${getHealthColor(player.mood)} mr-1.5`} />
                     <span className={`text-xs font-bold ${getHealthColor(player.mood)}`}>{player.mood}%</span>
                 </div>
                 <div className="bg-[#1a2321] rounded-lg p-2 flex items-center border border-[#2d3a35]" title="Reputation">
                    <Users className="w-4 h-4 text-blue-500 mr-1.5" />
                    <span className="text-xs font-bold text-blue-100">{player.socialCapital}</span>
                </div>
            </div>
        </div>
      </div>

      {/* Financial Freedom Progress */}
      <div className="mb-8">
        <div className="flex justify-between items-end mb-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Financial Freedom</span>
            <span className="text-sm font-bold text-white">{progress}%</span>
        </div>
        <div className="h-2 w-full bg-[#1a2321] rounded-full overflow-hidden border border-[#2d3a35]">
            <div 
              className="h-full bg-emerald-500 transition-all duration-700 ease-out shadow-[0_0_10px_rgba(16,185,129,0.5)]"
              style={{ width: `${progress}%` }}
            ></div>
        </div>
      </div>

      {/* Desktop Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-24">
        
        {/* Left Column: Hero Card */}
        <div className="space-y-6">
            <div className="bg-[#1a2321] rounded-3xl p-8 border border-[#2d3a35] shadow-lg relative overflow-hidden h-full min-h-[300px] flex flex-col justify-between">
                <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/5 rounded-full blur-3xl -mr-16 -mt-16"></div>
                
                <div>
                    <div className="flex items-center space-x-2 mb-2">
                        <Wallet className="w-5 h-5 text-emerald-500" />
                        <p className="text-slate-400 text-sm font-bold uppercase tracking-widest">Monthly Cash Flow</p>
                    </div>
                    <h1 className={`text-6xl font-black tracking-tight mb-2 ${monthlyCashFlow >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {monthlyCashFlow > 0 ? '+' : ''}{formatCurrency(monthlyCashFlow)}
                    </h1>
                    <p className="text-slate-500 text-sm">Liquid capital available after all monthly expenses.</p>
                </div>

                {/* Secondary Metric: Cash on Hand */}
                <div className="mt-8 bg-[#0f1715]/50 rounded-2xl p-4 flex items-center justify-between border border-white/5 backdrop-blur-sm">
                    <div>
                        <span className={`text-xs font-bold uppercase tracking-wide block mb-1 ${player.cash < 0 ? 'text-red-400' : 'text-slate-400'}`}>
                           {player.cash < 0 ? 'Bank Overdraft' : 'Cash on Hand'}
                        </span>
                        <span className={`font-mono font-bold text-2xl ${player.cash < 0 ? 'text-red-500' : 'text-white'}`}>
                           {formatCurrency(player.cash)}
                        </span>
                    </div>
                    {/* Visual cue for negative cash */}
                    {player.cash < 0 && (
                        <div className="px-3 py-1 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-xs font-bold animate-pulse">
                           SAPA ALERT
                        </div>
                    )}
                </div>
            </div>
        </div>

        {/* Right Column: Breakdown */}
        <div className="bg-[#1a2321] rounded-3xl p-6 border border-[#2d3a35] h-full">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-white">Income vs Expenses</h3>
                <div className="flex bg-[#0f1715] p-1 rounded-lg border border-[#2d3a35]">
                    <button 
                        onClick={() => setViewMode('income')}
                        className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${viewMode === 'income' ? 'bg-[#2d3a35] text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                        Income
                    </button>
                    <button 
                        onClick={() => setViewMode('expenses')}
                        className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${viewMode === 'expenses' ? 'bg-[#2d3a35] text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                        Expenses
                    </button>
                </div>
            </div>

            <div className="space-y-3 h-[320px] overflow-y-auto scrollbar-hide pr-2">
                {viewMode === 'expenses' ? (
                    <>
                        <ListItem icon={<Home />} label="Rent" sub="Monthly" amount={-player.expenses.rent} />
                        <ListItem icon={<Users />} label="Black Tax" sub="Family Support" amount={-player.expenses.other} isInfo />
                        <ListItem icon={<ShoppingBag />} label="Food" sub="Groceries" amount={-player.expenses.food} />
                        <ListItem icon={<Truck />} label="Transport" sub="Commute" amount={-player.expenses.transport} />
                        <ListItem icon={<AlertCircle />} label="Taxes" sub="Govt" amount={-player.expenses.tax} />
                        {player.liabilities.length > 0 && (
                            <ListItem icon={<Wallet />} label="Debt Payments" sub="Loans" amount={-player.liabilities.reduce((sum, l) => sum + l.monthlyPayment, 0)} />
                        )}
                    </>
                ) : (
                    <>
                        <ListItem icon={<Briefcase />} label="Salary" sub={player.profession} amount={player.salary} isPositive />
                        {player.assets.filter(a => a.cashFlow > 0).map((asset, i) => (
                            <ListItem 
                                key={i} 
                                icon={<TrendingUp />} 
                                label={asset.name} 
                                sub={asset.type} 
                                amount={asset.currency === 'USD' ? asset.cashFlow * exchangeRate : asset.cashFlow} 
                                isPositive 
                            />
                        ))}
                        {player.assets.length === 0 && (
                            <div className="flex flex-col items-center justify-center py-10 text-slate-600">
                                <TrendingUp className="w-8 h-8 mb-2 opacity-50" />
                                <span className="text-xs italic">No passive income sources yet.</span>
                            </div>
                        )}
                    </>
                )}
            </div>
             
             <div className="mt-4 pt-4 border-t border-[#2d3a35] flex justify-between items-center">
                <span className="text-slate-400 text-xs font-bold uppercase">Total {viewMode}</span>
                <span className={`font-mono font-bold text-lg ${viewMode === 'income' ? 'text-emerald-400' : 'text-white'}`}>
                    {formatCurrency(viewMode === 'income' ? totalIncome : totalExpenses)}
                </span>
             </div>
        </div>
      </div>

      {/* Sticky Action Button - Responsive Positioning */}
      <div className="fixed bottom-[80px] left-0 right-0 md:left-64 md:bottom-10 z-30 flex justify-center pointer-events-none">
          <div className="w-full max-w-lg md:max-w-md px-4 pointer-events-auto">
             <button
                onClick={onNextMonth}
                disabled={!isActionPhase}
                className="w-full bg-[#15803d] hover:bg-[#166534] disabled:bg-slate-800 disabled:text-slate-600 disabled:border-slate-700 text-white font-bold text-lg py-4 rounded-2xl flex items-center justify-center transition-all shadow-2xl shadow-black/50 border border-emerald-500/20 active:scale-95 backdrop-blur-xl"
              >
                Start Next Month
                <ArrowRight className="ml-2 w-5 h-5" />
              </button>
          </div>
      </div>

    </div>
  );
};

const ListItem: React.FC<{ icon: React.ReactNode, label: string, sub: string, amount: number, isInfo?: boolean, isPositive?: boolean }> = ({ icon, label, sub, amount, isInfo, isPositive }) => (
    <div className="bg-[#0f1715] p-3 rounded-xl flex items-center justify-between border border-[#2d3a35] hover:border-emerald-500/20 transition-colors">
        <div className="flex items-center">
            <div className="w-8 h-8 rounded-lg bg-[#232d2a] flex items-center justify-center text-slate-400 mr-3">
                {React.cloneElement(icon as React.ReactElement<any>, { className: "w-4 h-4" })}
            </div>
            <div>
                <div className="flex items-center">
                    <p className="text-white font-bold text-sm">{label}</p>
                    {isInfo && <div className="ml-1 w-3 h-3 rounded-full bg-slate-600 text-[8px] flex items-center justify-center text-white">i</div>}
                </div>
                <p className="text-slate-500 text-[10px]">{sub}</p>
            </div>
        </div>
        <p className={`font-mono font-bold text-sm ${isPositive ? 'text-emerald-400' : 'text-white'}`}>
            {amount > 0 && isPositive ? '+' : ''}{formatCurrency(amount)}
        </p>
    </div>
);
