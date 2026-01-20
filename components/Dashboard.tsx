
import React, { useState } from 'react';
import { Player, LifestyleTier, Gig, Skill } from '../types';
import { GIGS, SKILLS } from '../constants';
import { calculateMonthlyCashFlow, calculatePassiveIncome, calculateTotalExpenses, formatCurrency, calculateProgressToFreedom } from '../services/gameEngine';
import { Wallet, Globe, Users, TrendingUp, Home, Briefcase, ShoppingBag, Truck, AlertCircle, ArrowRight, Heart, Smile, Hammer, Star, ChevronDown, BookOpen, X, Check, Laptop } from 'lucide-react';

interface DashboardProps {
  player: Player;
  month: number;
  exchangeRate: number;
  onNextMonth: () => void;
  onPerformGig: (gig: Gig) => void;
  onLearnSkill: (skill: Skill) => void;
  onLifestyleChange: (tier: LifestyleTier) => void;
  onBuyDream: () => void;
  isActionPhase: boolean;
}

export const Dashboard: React.FC<DashboardProps> = ({ player, month, exchangeRate, onNextMonth, onPerformGig, onLearnSkill, onLifestyleChange, onBuyDream, isActionPhase }) => {
  const [viewMode, setViewMode] = useState<'income' | 'expenses'>('expenses');
  const [showLifestyleMenu, setShowLifestyleMenu] = useState(false);
  const [showGigsModal, setShowGigsModal] = useState(false);
  const [gigsTab, setGigsTab] = useState<'work' | 'learn'>('work');
  
  const monthlyCashFlow = calculateMonthlyCashFlow(player, exchangeRate);
  const passiveIncome = calculatePassiveIncome(player.assets, exchangeRate);
  const totalExpenses = calculateTotalExpenses(player.expenses, player.liabilities);
  const progress = calculateProgressToFreedom(player, exchangeRate);
  
  const totalIncome = player.salary + passiveIncome;
  const canAffordDream = player.cash >= player.dreamItem.cost;
  
  const freeGigsRemaining = Math.max(0, 5 - player.gigsPerformedThisMonth);

  const getHealthColor = (val: number) => {
    if (val > 70) return 'text-emerald-400';
    if (val > 30) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getLifestyleLabel = (tier: LifestyleTier) => {
      switch(tier) {
          case 'Low': return 'Low Profile';
          case 'Middle': return 'Soft Life';
          case 'High': return 'Lavish';
      }
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

      {/* Hero Card & Active Hustle */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        
        {/* Left Column: Hero Card */}
        <div className="space-y-4">
            <div className="bg-[#1a2321] rounded-3xl p-8 border border-[#2d3a35] shadow-lg relative overflow-hidden flex flex-col justify-between h-64">
                <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/5 rounded-full blur-3xl -mr-16 -mt-16"></div>
                
                <div>
                    <div className="flex items-center space-x-2 mb-2">
                        <Wallet className="w-5 h-5 text-emerald-500" />
                        <p className="text-slate-400 text-sm font-bold uppercase tracking-widest">Monthly Cash Flow</p>
                    </div>
                    <h1 className={`text-5xl font-black tracking-tight mb-2 ${monthlyCashFlow >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {monthlyCashFlow > 0 ? '+' : ''}{formatCurrency(monthlyCashFlow)}
                    </h1>
                </div>

                {/* Secondary Metric: Cash on Hand */}
                <div className="bg-[#0f1715]/50 rounded-2xl p-4 flex items-center justify-between border border-white/5 backdrop-blur-sm mt-auto">
                    <div>
                        <span className={`text-xs font-bold uppercase tracking-wide block mb-1 ${player.cash < 0 ? 'text-red-400' : 'text-slate-400'}`}>
                           {player.cash < 0 ? 'Bank Overdraft' : 'Cash on Hand'}
                        </span>
                        <span className={`font-mono font-bold text-2xl ${player.cash < 0 ? 'text-red-500' : 'text-white'}`}>
                           {formatCurrency(player.cash)}
                        </span>
                    </div>
                </div>
            </div>

            {/* QUICK GIG BUTTON */}
            <div className="bg-[#1a2321] p-4 rounded-2xl border border-orange-500/30 flex items-center justify-between group hover:border-orange-500/60 transition-colors cursor-pointer" onClick={() => isActionPhase && setShowGigsModal(true)}>
                <div>
                    <div className="flex items-center text-orange-400 mb-1">
                        <Hammer className="w-4 h-4 mr-2" />
                        <span className="font-bold text-sm uppercase tracking-wide">Side Hustles</span>
                    </div>
                    <p className="text-[10px] text-slate-500">Work gigs or learn new skills to earn more.</p>
                </div>
                <button 
                    disabled={!isActionPhase}
                    className="bg-orange-600 group-hover:bg-orange-700 text-white font-bold text-xs px-4 py-3 rounded-xl transition-all shadow-lg shadow-orange-900/20"
                >
                   Open Menu
                </button>
            </div>
            
            {/* DREAM ITEM TRACKER */}
            <div className={`bg-[#1a2321] p-4 rounded-2xl border ${player.hasPurchasedDream ? 'border-emerald-500/50 bg-emerald-900/10' : 'border-[#2d3a35]'}`}>
                <div className="flex justify-between items-start mb-2">
                     <div>
                        <div className="flex items-center text-purple-400 mb-1">
                            <Star className={`w-4 h-4 mr-2 ${player.hasPurchasedDream ? 'fill-purple-400' : ''}`} />
                            <span className="font-bold text-sm uppercase tracking-wide">Dream Goal</span>
                        </div>
                        <p className="text-white font-bold">{player.dreamItem.name}</p>
                     </div>
                     <span className="font-mono text-xs text-slate-400">{formatCurrency(player.dreamItem.cost)}</span>
                </div>
                
                {!player.hasPurchasedDream ? (
                    <button 
                        onClick={onBuyDream}
                        disabled={!canAffordDream || !isActionPhase}
                        className={`w-full py-3 rounded-xl font-bold text-xs mt-2 transition-all ${
                            canAffordDream 
                            ? 'bg-purple-600 text-white hover:bg-purple-500 shadow-lg shadow-purple-900/20' 
                            : 'bg-[#232d2a] text-slate-500 cursor-not-allowed'
                        }`}
                    >
                        {canAffordDream ? 'Purchase Dream Item' : `Need ${formatCurrency(Math.max(0, player.dreamItem.cost - player.cash))} more`}
                    </button>
                ) : (
                    <div className="w-full py-2 bg-emerald-500/20 text-emerald-400 rounded-lg text-center font-bold text-xs mt-2 border border-emerald-500/30">
                        ACHIEVED
                    </div>
                )}
            </div>

        </div>

        {/* Right Column: Breakdown */}
        <div className="bg-[#1a2321] rounded-3xl p-6 border border-[#2d3a35] h-full flex flex-col">
            <div className="flex items-center justify-between mb-6 shrink-0">
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

            {viewMode === 'expenses' && (
                <div className="relative mb-4 z-20">
                    <button 
                        onClick={() => setShowLifestyleMenu(!showLifestyleMenu)}
                        className="w-full flex items-center justify-between bg-[#0f1715] p-3 rounded-xl border border-[#2d3a35] hover:border-emerald-500/30 transition-colors"
                    >
                        <div>
                            <span className="text-[10px] text-slate-500 uppercase font-bold block">Current Lifestyle</span>
                            <span className="text-white font-bold">{getLifestyleLabel(player.lifestyle)}</span>
                        </div>
                        <ChevronDown className="w-4 h-4 text-slate-400" />
                    </button>
                    
                    {showLifestyleMenu && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-[#1a2321] border border-[#2d3a35] rounded-xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                            {(['Low', 'Middle', 'High'] as LifestyleTier[]).map(tier => (
                                <button
                                    key={tier}
                                    onClick={() => {
                                        onLifestyleChange(tier);
                                        setShowLifestyleMenu(false);
                                    }}
                                    className={`w-full text-left p-3 text-xs font-bold hover:bg-[#2d3a35] flex justify-between ${player.lifestyle === tier ? 'text-emerald-400 bg-[#2d3a35]/50' : 'text-slate-300'}`}
                                >
                                    <span>{getLifestyleLabel(tier)}</span>
                                    {player.lifestyle === tier && <span className="text-[10px] uppercase">Active</span>}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            )}

            <div className="space-y-3 overflow-y-auto scrollbar-hide pr-2 flex-grow max-h-[250px]">
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
             
             <div className="mt-4 pt-4 border-t border-[#2d3a35] flex justify-between items-center shrink-0">
                <span className="text-slate-400 text-xs font-bold uppercase">Total {viewMode}</span>
                <span className={`font-mono font-bold text-lg ${viewMode === 'income' ? 'text-emerald-400' : 'text-white'}`}>
                    {formatCurrency(viewMode === 'income' ? totalIncome : totalExpenses)}
                </span>
             </div>
        </div>
      </div>

      {/* Sticky Action Button */}
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

      {/* GIGS & SKILLS MODAL */}
      {showGigsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md p-4 animate-in fade-in duration-200">
            <div className="w-full max-w-lg bg-[#1a2321] border border-[#2d3a35] rounded-3xl shadow-2xl overflow-hidden flex flex-col h-[85dvh]">
                
                <div className="p-4 border-b border-[#2d3a35] flex justify-between items-center bg-[#151c1a]">
                    <h2 className="text-xl font-bold text-white">Side Hustles</h2>
                    <button onClick={() => setShowGigsModal(false)} className="p-2 hover:bg-slate-800 rounded-full text-slate-400">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex p-2 bg-[#151c1a] border-b border-[#2d3a35]">
                    <button 
                        onClick={() => setGigsTab('work')}
                        className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${gigsTab === 'work' ? 'bg-[#2d3a35] text-white shadow' : 'text-slate-500 hover:bg-[#2d3a35]/50'}`}
                    >
                        Work Gigs
                    </button>
                    <button 
                        onClick={() => setGigsTab('learn')}
                        className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${gigsTab === 'learn' ? 'bg-[#2d3a35] text-emerald-400 shadow' : 'text-slate-500 hover:bg-[#2d3a35]/50'}`}
                    >
                        Learn Skills
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                    
                    {gigsTab === 'work' && (
                        <div className="space-y-4">
                            <div className="bg-orange-500/10 border border-orange-500/20 p-4 rounded-xl mb-6">
                                <h3 className="text-orange-400 font-bold text-xs uppercase tracking-wide mb-1">Energy Quota</h3>
                                <p className="text-xs text-orange-200 mb-2">First 5 gigs per month are free. Afterward, they cost Health & Mood.</p>
                                <div className="flex items-center gap-2">
                                    <div className="flex-1 h-2 bg-[#1a2321] rounded-full overflow-hidden">
                                        <div className="h-full bg-orange-500" style={{ width: `${Math.min(100, (player.gigsPerformedThisMonth / 5) * 100)}%` }}></div>
                                    </div>
                                    <span className="text-xs font-mono font-bold text-orange-400">{freeGigsRemaining} Free Left</span>
                                </div>
                            </div>

                            {GIGS.map(gig => {
                                const hasSkill = !gig.reqSkillId || player.skills.includes(gig.reqSkillId);
                                const isFree = freeGigsRemaining > 0;
                                const actualEnergyCost = isFree ? 0 : gig.energyCost;
                                const actualMoodCost = isFree ? 0 : gig.moodCost;
                                
                                return (
                                    <div key={gig.id} className={`p-4 rounded-2xl border ${hasSkill ? 'border-[#2d3a35] bg-[#0f1715]' : 'border-red-900/30 bg-red-900/5 opacity-80'}`}>
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <h4 className="font-bold text-white text-base">{gig.name}</h4>
                                                <p className="text-xs text-slate-500">{gig.description}</p>
                                            </div>
                                            <span className="font-mono text-emerald-400 font-bold bg-emerald-500/10 px-2 py-1 rounded text-sm">+{formatCurrency(gig.pay)}</span>
                                        </div>
                                        
                                        {!hasSkill && (
                                            <div className="mb-3 text-[10px] text-red-400 font-bold uppercase tracking-wider bg-red-900/10 p-2 rounded inline-block">
                                                Requires: {SKILLS.find(s => s.id === gig.reqSkillId)?.name}
                                            </div>
                                        )}

                                        <div className="flex justify-between items-center mt-3">
                                            <div className="flex gap-3 text-xs text-slate-500">
                                                <span className={`${actualEnergyCost > 0 ? 'text-red-400' : 'text-slate-500'} font-bold`}>-{actualEnergyCost} HP</span>
                                                <span className={`${actualMoodCost > 0 ? 'text-yellow-500' : 'text-slate-500'} font-bold`}>-{actualMoodCost} Mood</span>
                                            </div>
                                            <button
                                                onClick={() => onPerformGig(gig)}
                                                disabled={!hasSkill || (player.health <= actualEnergyCost && !isFree)}
                                                className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors ${
                                                    hasSkill && (player.health > actualEnergyCost || isFree)
                                                    ? 'bg-white text-black hover:bg-slate-200'
                                                    : 'bg-[#2d3a35] text-slate-500 cursor-not-allowed'
                                                }`}
                                            >
                                                Do Work
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {gigsTab === 'learn' && (
                        <div className="space-y-4">
                            <p className="text-xs text-slate-400 text-center mb-4">Invest in yourself to unlock higher paying gigs.</p>
                            
                            {SKILLS.map(skill => {
                                const hasLearned = player.skills.includes(skill.id);
                                const hasReqAsset = !skill.reqAssetId || player.assets.some(a => a.marketId === skill.reqAssetId || a.id.startsWith(skill.reqAssetId + '_'));
                                const canAfford = player.cash >= skill.cost;
                                const isActionable = !hasLearned && hasReqAsset && canAfford;

                                return (
                                    <div key={skill.id} className="p-4 rounded-2xl border border-[#2d3a35] bg-[#0f1715] flex flex-col">
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-[#232d2a] flex items-center justify-center text-emerald-500">
                                                    <BookOpen className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-white">{skill.name}</h4>
                                                    <p className="text-xs text-slate-500">{skill.description}</p>
                                                </div>
                                            </div>
                                            {hasLearned && <Check className="w-5 h-5 text-emerald-500" />}
                                        </div>

                                        {!hasReqAsset && !hasLearned && (
                                            <div className="mt-2 text-[10px] text-red-400 font-bold bg-red-900/10 px-2 py-1 rounded inline-block w-fit flex items-center gap-1">
                                                <Laptop className="w-3 h-3" /> Requires: Laptop (Buy in Marketplace)
                                            </div>
                                        )}
                                        
                                        {!hasLearned ? (
                                            <div className="mt-4 flex justify-between items-center border-t border-[#2d3a35] pt-3">
                                                <span className="font-mono text-white font-bold">{skill.cost === 0 ? 'FREE (Self-Paced)' : formatCurrency(skill.cost)}</span>
                                                <button
                                                    onClick={() => onLearnSkill(skill)}
                                                    disabled={!isActionable}
                                                    className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors ${
                                                        isActionable 
                                                        ? 'bg-emerald-600 text-white hover:bg-emerald-500' 
                                                        : 'bg-[#2d3a35] text-slate-500 cursor-not-allowed'
                                                    }`}
                                                >
                                                    {skill.cost === 0 ? 'Start Learning' : 'Pay & Learn'}
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="mt-2 text-xs font-bold text-emerald-500 uppercase tracking-wider text-center bg-emerald-500/10 py-2 rounded-lg">
                                                Learned
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}

                </div>
            </div>
        </div>
      )}

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
                <p className="text-slate-500 text-xs">{sub}</p>
            </div>
        </div>
        <p className={`font-mono font-bold text-sm ${isPositive ? 'text-emerald-400' : 'text-white'}`}>
            {amount > 0 && isPositive ? '+' : ''}{formatCurrency(amount)}
        </p>
    </div>
);
