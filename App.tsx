
import React, { useState } from 'react';
import { GameState, Player, Archetype, GameEvent, EventResult, Liability, Asset, MarketItem, DreamItem, LifestyleTier, Skill, Gig } from './types';
import { INITIAL_EXCHANGE_RATE, VICTORY_MULTIPLIER, ARCHETYPES } from './constants';
import { ArchetypeSelection } from './components/ArchetypeSelection';
import { Dashboard } from './components/Dashboard';
import { FinancialStatement } from './components/FinancialStatement';
import { EventModal } from './components/EventModal';
import { Marketplace } from './components/Marketplace';
import { Bank } from './components/Bank';
import { InsolvencyModal } from './components/InsolvencyModal';
import { StatsChart } from './components/StatsChart';
import { 
  calculateMonthlyCashFlow, 
  formatCurrency, 
  calculatePassiveIncome, 
  calculateTotalExpenses, 
  getNextExchangeRate, 
  selectRandomEvent,
  calculateBankCreditLimit,
  calculateUsedBankCredit,
  recalculateLifestyleExpenses,
  checkIsVictorious,
  calculateNetWorth
} from './services/gameEngine';
import { Home, PieChart, ShoppingBag, User, Award, Wallet, HelpCircle, Bell, Menu, LogOut, Skull, Building2, Star, CheckCircle } from 'lucide-react';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'home' | 'portfolio' | 'market' | 'bank' | 'profile'>('home');
  const [gameState, setGameState] = useState<GameState>({
    month: 1,
    phase: 'SETUP',
    log: [],
    exchangeRate: INITIAL_EXCHANGE_RATE,
    flags: {},
    netWorthHistory: []
  });
  
  const [player, setPlayer] = useState<Player | null>(null);
  const [currentEvent, setCurrentEvent] = useState<GameEvent | null>(null);
  const [insolvencyDeficit, setInsolvencyDeficit] = useState<number>(0);

  // Initialize game with an archetype and dream
  const handleStartGame = (archetype: Archetype, dream: DreamItem) => {
    const newPlayer: Player = {
      name: 'John Doe',
      profession: archetype.profession,
      salary: archetype.salary,
      cash: archetype.savings,
      socialCapital: archetype.startingSocialCapital,
      health: 100, // Start with full health
      mood: 100,   // Start with full mood
      assets: [],
      liabilities: [...archetype.liabilities],
      baseExpenses: { ...archetype.expenses },
      expenses: { ...archetype.expenses }, // Initially same as base
      children: 0,
      lifestyle: 'Low',
      dreamItem: dream,
      hasPurchasedDream: false,
      skills: [],
      gigsPerformedThisMonth: 0
    };
    
    // Initial Net Worth for history
    const initialNetWorth = calculateNetWorth(newPlayer);
    
    setPlayer(newPlayer);
    setGameState({
      month: 1,
      phase: 'PLAYING',
      log: [`Started journey as a ${archetype.name}.`, `Target Dream: ${dream.name}`, `Exchange Rate: ${formatCurrency(INITIAL_EXCHANGE_RATE)} per $1`],
      exchangeRate: INITIAL_EXCHANGE_RATE,
      flags: {},
      netWorthHistory: [{ month: 1, value: initialNetWorth }]
    });
  };

  const addLog = (message: string) => {
    setGameState(prev => ({
      ...prev,
      log: [message, ...prev.log]
    }));
  };

  const handleNextMonth = () => {
    if (!player) return;

    // 1. Economic Fluctuation
    const newRate = getNextExchangeRate(gameState.exchangeRate, gameState.flags);
    const rateDiff = newRate - gameState.exchangeRate;
    
    // 2. Insolvency Check (Projected Cash Flow)
    const monthlyFlow = calculateMonthlyCashFlow(player, newRate);
    const projectedCash = player.cash + monthlyFlow;

    if (projectedCash < 0) {
        setInsolvencyDeficit(Math.abs(projectedCash));
        setGameState(prev => ({ ...prev, phase: 'INSOLVENCY', exchangeRate: newRate }));
        return; // Halt progress
    }

    // Proceed if solvent
    
    let rateMsg = '';
    if (Math.abs(rateDiff) > 50) {
      rateMsg = `Market Volatility! Naira is now ${formatCurrency(newRate)}/$ (was ${formatCurrency(gameState.exchangeRate)}).`;
    }

    // 3. Normal Month Processing
    
    // Recovery logic based on lifestyle
    let recoveryHealth = 20;
    let recoveryMood = 10;
    
    if (player.lifestyle === 'Middle') {
        recoveryMood = 15;
    } else if (player.lifestyle === 'High') {
        recoveryMood = 25;
        player.socialCapital += 1;
    }

    const nextCash = projectedCash; 
    const nextHealth = Math.min(100, player.health + recoveryHealth);
    const nextMood = Math.min(100, player.mood + recoveryMood);

    // LOAN AMORTIZATION LOGIC
    const updatedLiabilities = player.liabilities.reduce((acc: Liability[], liability) => {
        if (liability.type === 'Loan' && liability.termRemaining !== undefined) {
            const nextTerm = liability.termRemaining - 1;
            
            // If loan is paid off
            if (nextTerm <= 0) {
                addLog(`LOAN PAID OFF: ${liability.name} has been fully repaid! Cash flow increased.`);
                return acc; // Don't add to accumulator (remove it)
            }
            
            // Reduce total owed by monthly payment
            const nextTotalOwed = Math.max(0, liability.totalOwed - liability.monthlyPayment);
            
            acc.push({
                ...liability,
                termRemaining: nextTerm,
                totalOwed: nextTotalOwed
            });
            return acc;
        }
        acc.push(liability);
        return acc;
    }, []);

    // LOGGING
    const recoveryLog = `MONTHLY RECOVERY: Lifestyle (${player.lifestyle}) Grants +${recoveryHealth} HP, +${recoveryMood} Mood.`;
    addLog(recoveryLog);
    if (rateMsg) addLog(rateMsg);

    // Update Player - RESET GIGS COUNTER
    const updatedPlayer = {
      ...player,
      cash: nextCash,
      health: nextHealth,
      mood: nextMood,
      liabilities: updatedLiabilities,
      gigsPerformedThisMonth: 0 
    };

    setPlayer(updatedPlayer);

    // 4. Update History & Check Death
    if (nextHealth <= 0) {
      setGameState(prev => ({ ...prev, phase: 'GAME_OVER' }));
      return; 
    }

    // Advance Phase
    const nextMonth = gameState.month + 1;
    const currentNetWorth = calculateNetWorth(updatedPlayer);
    
    setGameState(prev => ({ 
      ...prev, 
      month: nextMonth, 
      phase: 'EVENT_MODAL',
      exchangeRate: newRate,
      netWorthHistory: [...prev.netWorthHistory, { month: nextMonth, value: currentNetWorth }]
    }));

    // 6. Trigger Event
    const tempUpdatedPlayer = { ...updatedPlayer }; // Use the fresh state
    const randomEvent = selectRandomEvent(tempUpdatedPlayer, { ...gameState, exchangeRate: newRate });
    setCurrentEvent(randomEvent);
  };

  const handlePerformGig = (gig: Gig) => {
    if(!player) return;
    
    // Threshold Logic: First 5 gigs are free of health/mood cost
    const isFree = player.gigsPerformedThisMonth < 5;
    
    const costHealth = isFree ? 0 : gig.energyCost;
    const costMood = isFree ? 0 : gig.moodCost;
    const earnAmount = gig.pay;

    if (!isFree && player.health <= costHealth) {
      addLog("Too exhausted to work! Rest needed.");
      return;
    }

    setPlayer({
      ...player,
      cash: player.cash + earnAmount,
      health: Math.max(0, player.health - costHealth),
      mood: Math.max(0, player.mood - costMood),
      gigsPerformedThisMonth: player.gigsPerformedThisMonth + 1
    });

    const costMsg = isFree ? "(Free Energy)" : `(-${costHealth} HP)`;
    addLog(`GIG: Did ${gig.name}. Earned ${formatCurrency(earnAmount)} ${costMsg}.`);
  };

  const handleLearnSkill = (skill: Skill) => {
    if(!player) return;
    
    // Check Requirement (Laptop)
    if (skill.reqAssetId) {
        const hasAsset = player.assets.some(a => a.marketId === skill.reqAssetId || a.id.startsWith(skill.reqAssetId + '_'));
        if (!hasAsset) {
            addLog(`Failed: You need a specific item (e.g. Laptop) to learn ${skill.name}.`);
            return;
        }
    }

    if(player.cash < skill.cost) {
      addLog(`Cannot afford ${skill.name}.`);
      return;
    }
    
    setPlayer({
      ...player,
      cash: player.cash - skill.cost,
      skills: [...player.skills, skill.id]
    });
    addLog(`SKILL: Learned ${skill.name}. New gigs unlocked!`);
  };

  const handleUpgradeAsset = (asset: Asset) => {
    if (!player) return;
    
    if (asset.level >= asset.maxLevel) return;
    if (player.cash < asset.upgradeCost) {
      addLog("Insufficient funds to upgrade.");
      return;
    }

    const updatedAssets = player.assets.map(a => {
      if (a.id === asset.id) {
        return {
          ...a,
          level: a.level + 1,
          cashFlow: a.cashFlow + asset.upgradeFlowIncrease
        };
      }
      return a;
    });

    setPlayer({
      ...player,
      cash: player.cash - asset.upgradeCost,
      assets: updatedAssets
    });
    addLog(`UPGRADE: ${asset.name} upgraded to Level ${asset.level + 1}. Cashflow increased!`);
  };

  const handleLifestyleChange = (tier: LifestyleTier) => {
      if(!player) return;
      const newExpenses = recalculateLifestyleExpenses(player.baseExpenses, tier);
      setPlayer({
          ...player,
          lifestyle: tier,
          expenses: newExpenses
      });
      addLog(`LIFESTYLE: Switched to ${tier} Class. Expenses updated.`);
  };

  const handleBuyDream = () => {
      if (!player) return;
      if (player.cash >= player.dreamItem.cost) {
          const updatedPlayer = {
              ...player,
              cash: player.cash - player.dreamItem.cost,
              hasPurchasedDream: true
          };
          setPlayer(updatedPlayer);
          addLog(`DREAM: You purchased the ${player.dreamItem.name}! Major milestone achieved.`);
          checkWin(updatedPlayer, gameState.exchangeRate);
      }
  };

  // --- INSOLVENCY HANDLERS ---
  const checkSolvencyAndProceed = (updatedPlayer: Player) => {
      const flow = calculateMonthlyCashFlow(updatedPlayer, gameState.exchangeRate);
      if (updatedPlayer.cash + flow >= 0) {
          setGameState(prev => ({ ...prev, phase: 'PLAYING' }));
          addLog("INSOLVENCY: You have stabilized your cash flow. Proceed when ready.");
      } else {
          setInsolvencyDeficit(Math.abs(updatedPlayer.cash + flow));
      }
  };

  const resolveInsolvencyLoan = (amount: number) => {
      handleTakeSharkLoan(amount);
      setGameState(prev => ({ ...prev, phase: 'PLAYING' }));
      addLog("INSOLVENCY: Loan taken. You can now proceed.");
  };

  const resolveInsolvencySell = (asset: Asset, value: number) => {
      if(!player) return;
      const updatedAssets = player.assets.filter(a => a.id !== asset.id);
      const updatedPlayer = {
          ...player,
          cash: player.cash + value,
          assets: updatedAssets
      };
      setPlayer(updatedPlayer);
      addLog(`INSOLVENCY: Distress sale of ${asset.name} for ${formatCurrency(value)}.`);
      checkSolvencyAndProceed(updatedPlayer);
  };

  const resolveInsolvencyBegging = () => {
     if(!player) return;
     const amount = player.socialCapital * 1000;
     const updatedPlayer = {
         ...player,
         cash: player.cash + amount,
         socialCapital: Math.max(0, player.socialCapital - 15)
     };
     setPlayer(updatedPlayer);
     addLog(`SURVIVAL: You begged friends and family. Raised ${formatCurrency(amount)}. Reputation damaged.`);
     checkSolvencyAndProceed(updatedPlayer);
  };

  const resolveInsolvencyDeferment = () => {
     if(!player) return;
     const loanLiabilities = player.liabilities.filter(l => l.type === 'Loan');
     const totalMonthlyPayments = loanLiabilities.reduce((sum, l) => sum + l.monthlyPayment, 0);

     if(totalMonthlyPayments === 0) {
         addLog("No loans to defer.");
         return;
     }

     const updatedLiabilities = player.liabilities.map(l => {
         if (l.type === 'Loan') {
             return { ...l, totalOwed: Math.floor(l.totalOwed * 1.1) };
         }
         return l;
     });

     const updatedPlayer = {
         ...player,
         cash: player.cash + totalMonthlyPayments,
         liabilities: updatedLiabilities
     };

     setPlayer(updatedPlayer);
     addLog(`SURVIVAL: Deferred ${formatCurrency(totalMonthlyPayments)} in payments. Total debt increased by 10%.`);
     checkSolvencyAndProceed(updatedPlayer);
  };

  const resolveInsolvencyLabor = () => {
     if(!player) return;
     const amount = 15000;
     const updatedPlayer = {
         ...player,
         cash: player.cash + amount,
         health: Math.max(0, player.health - 10),
         mood: Math.max(0, player.mood - 10)
     };
     setPlayer(updatedPlayer);
     addLog(`SURVIVAL: Did menial labor. Earned ${formatCurrency(amount)}. Body is paining you.`);
     checkSolvencyAndProceed(updatedPlayer);
  };

  const resolveInsolvencyDefault = () => {
      if(!player) return;
      const nextHealth = Math.max(0, player.health - 20);
      const nextMood = Math.max(0, player.mood - 25);
      const nextSocial = Math.max(0, player.socialCapital - 10);
      
      setPlayer({
          ...player,
          cash: 0,
          health: nextHealth,
          mood: nextMood,
          socialCapital: nextSocial
      });

      addLog("INSOLVENCY DEFAULT: You couldn't pay bills. Suffered major Health and Reputation loss.");
      
      if (nextHealth <= 0) {
          setGameState(prev => ({ ...prev, phase: 'GAME_OVER' }));
      } else {
          setGameState(prev => ({ 
              ...prev, 
              month: prev.month + 1, 
              phase: 'EVENT_MODAL' 
          }));
          const randomEvent = selectRandomEvent(player, gameState);
          setCurrentEvent(randomEvent);
      }
  };

  const applyResult = (result: EventResult, playerState: Player, cost: number, paymentMethod: 'cash' | 'bank') => {
    let updatedPlayer = { ...playerState };
    
    // Deduct cost OR Create Liability
    if (cost > 0) {
        if (paymentMethod === 'cash') {
            updatedPlayer.cash -= cost;
        } else {
            const term = 12; // Standard term for event loans
            const newLiability: Liability = {
                id: `bank_event_${Date.now()}`,
                name: `Financing: ${currentEvent?.title || 'Event'}`,
                type: 'Loan',
                totalOwed: cost,
                monthlyPayment: Math.ceil(cost / term),
                termRemaining: term
            };
            updatedPlayer.liabilities = [...updatedPlayer.liabilities, newLiability];
        }
    }

    if (result.cashChange) updatedPlayer.cash += result.cashChange;
    if (result.asset) updatedPlayer.assets = [...updatedPlayer.assets, result.asset];

    if (result.assetLostId) {
      const indexToRemove = updatedPlayer.assets.findIndex(a => a.id.startsWith(result.assetLostId!));
      if (indexToRemove !== -1) {
          const newAssets = [...updatedPlayer.assets];
          newAssets.splice(indexToRemove, 1);
          updatedPlayer.assets = newAssets;
      }
    }

    if (result.expenseChange) {
      const category = result.expenseCategory || 'other';
      updatedPlayer.baseExpenses[category] += result.expenseChange;
      if (updatedPlayer.baseExpenses[category] < 0) updatedPlayer.baseExpenses[category] = 0;
      // Recalculate total based on lifestyle
      updatedPlayer.expenses = recalculateLifestyleExpenses(updatedPlayer.baseExpenses, updatedPlayer.lifestyle);
    }

    if (result.salaryChange) updatedPlayer.salary += result.salaryChange;
    if (result.socialCapitalChange) updatedPlayer.socialCapital += result.socialCapitalChange;
    if (result.healthChange) updatedPlayer.health = Math.max(0, Math.min(100, updatedPlayer.health + result.healthChange));
    if (result.moodChange) updatedPlayer.mood = Math.max(0, Math.min(100, updatedPlayer.mood + result.moodChange));

    let updatedFlags = { ...gameState.flags };
    if (result.flagsSet) {
      result.flagsSet.forEach(flag => updatedFlags[flag] = true);
    }
    
    return { updatedPlayer, updatedFlags };
  };

  const handleEventCompletion = (result: EventResult, cost: number, isSuccess: boolean, paymentMethod: 'cash' | 'bank') => {
     if (!player) return;
     
     const { updatedPlayer, updatedFlags } = applyResult(result, player, cost, paymentMethod);
     
     const costStr = cost > 0 
        ? (paymentMethod === 'cash' ? `Paid ${formatCurrency(cost)}. ` : `Financed ${formatCurrency(cost)}. `) 
        : '';
     const outcomeLog = isSuccess ? `SUCCESS: ${result.message}` : `FAILED: ${result.message}`;
     addLog(`${costStr}${outcomeLog}`);

     setPlayer(updatedPlayer);
     setGameState(prev => ({ ...prev, phase: 'PLAYING', flags: updatedFlags }));
     setCurrentEvent(null);
     
     if (updatedPlayer.health <= 0) {
        setGameState(prev => ({ ...prev, phase: 'GAME_OVER' }));
     } else {
        checkWin(updatedPlayer, gameState.exchangeRate);
     }
  };

  const handleMarketPurchase = (item: MarketItem, method: 'cash' | 'bank') => {
    if (!player) return;

    if (method === 'cash') {
       if (player.cash < item.cost) {
           addLog(`Insufficient Cash to buy ${item.name}.`);
           return;
       }
    } else if (method === 'bank') {
       const bankLimit = calculateBankCreditLimit(player, gameState.month);
       const used = calculateUsedBankCredit(player);
       if (used + item.cost > bankLimit) {
           addLog(`Financing Declined! Credit limit exceeded. Try improving your Social Capital or wait.`);
           return;
       }
    }

    const roll = Math.random();
    const isSuccess = roll > item.risk;

    let updatedPlayer = { ...player };

    if (method === 'cash') {
        updatedPlayer.cash -= item.cost;
        addLog(`MARKET: Bought ${item.name} with CASH.`);
    } else {
        // Updated Logic: Longer loan terms for Business/Real Estate to ensure Cashflow Positive
        let term = 12;
        if (item.tier === 'Low') term = 12;
        if (item.tier === 'Middle') term = 24; // 2 years
        if (item.tier === 'High') term = 60; // 5 years

        const newLiability: Liability = {
            id: `bank_loan_${Date.now()}`,
            name: `Loan: ${item.name}`,
            type: 'Loan',
            totalOwed: item.cost,
            monthlyPayment: Math.ceil(item.cost / term),
            termRemaining: term
        };
        updatedPlayer.liabilities = [...updatedPlayer.liabilities, newLiability];
        addLog(`MARKET: Financed ${item.name} via Bank (${term} months). Liability added.`);
    }

    if (isSuccess) {
       const newAsset: Asset = {
         id: `${item.id}_${Date.now()}`,
         marketId: item.id, // Link to market item for upgrades
         name: item.name,
         type: item.type,
         cost: item.cost,
         cashFlow: item.cashFlow,
         currency: 'NGN',
         description: item.description,
         level: 1,
         maxLevel: item.maxLevel,
         upgradeCost: item.upgradeCost,
         upgradeFlowIncrease: item.upgradeFlowIncrease
       };
       updatedPlayer.assets = [...updatedPlayer.assets, newAsset];
    } else {
       addLog(`MARKET FAILED: ${item.name} - ${item.onFailureMessage}`);
       updatedPlayer.mood = Math.max(0, updatedPlayer.mood - 10);
    }

    setPlayer(updatedPlayer);
    checkWin(updatedPlayer, gameState.exchangeRate);
  };

  const handleTakeSharkLoan = (amount: number) => {
    if (!player) return;
    const interest = 0.4;
    const totalOwed = Math.floor(amount * (1 + interest));
    const term = 4;
    const monthlyPayment = Math.floor(totalOwed / term);

    const loan: Liability = {
        id: `shark_${Date.now()}`,
        name: 'Shark Loan',
        type: 'Loan',
        totalOwed: totalOwed,
        monthlyPayment: monthlyPayment,
        termRemaining: term
    };

    const updatedPlayer = {
        ...player,
        cash: player.cash + amount,
        liabilities: [...player.liabilities, loan]
    };

    setPlayer(updatedPlayer);
    addLog(`SHARK: Took ${formatCurrency(amount)} loan. You owe ${formatCurrency(totalOwed)}. Don't miss a payment.`);
  };

  const handleAusterityMeasures = () => {
      if (!player) return;
      const newBaseExpenses = {
          ...player.baseExpenses,
          food: Math.floor(player.baseExpenses.food * 0.7),
          transport: Math.floor(player.baseExpenses.transport * 0.7),
          other: Math.floor(player.baseExpenses.other * 0.7)
      };

      const updatedPlayer = {
          ...player,
          baseExpenses: newBaseExpenses,
          expenses: recalculateLifestyleExpenses(newBaseExpenses, player.lifestyle),
          mood: Math.max(0, player.mood - 20),
          socialCapital: Math.max(0, player.socialCapital - 15),
          cash: player.cash + 15000 
      };

      setPlayer(updatedPlayer);
      addLog(`AUSTERITY: You cut expenses significantly. Mood and Reputation suffered, but cash flow improved.`);
  };

  const checkWin = (currentPlayer: Player, currentRate: number) => {
     if (checkIsVictorious(currentPlayer, currentRate)) {
       setGameState(prev => ({ ...prev, phase: 'VICTORY' }));
     }
  };

  const handleRepayLiability = (liability: Liability) => {
    if (!player) return;
    if (player.cash < liability.totalOwed) {
      addLog("Cannot afford to pay off this debt yet.");
      return;
    }

    const updatedLiabilities = player.liabilities.filter(l => l.id !== liability.id);
    const updatedPlayer = {
      ...player,
      cash: player.cash - liability.totalOwed,
      liabilities: updatedLiabilities
    };

    setPlayer(updatedPlayer);
    addLog(`PAID OFF: ${liability.name}. Monthly cash flow improved by ${formatCurrency(liability.monthlyPayment)}.`);
    checkWin(updatedPlayer, gameState.exchangeRate);
  };

  const handleSellAsset = (asset: Asset) => {
    if (!player) return;
    const sellValue = asset.resaleValue || asset.cost;
    const updatedAssets = player.assets.filter(a => a.id !== asset.id);
    const updatedPlayer = {
      ...player,
      cash: player.cash + sellValue,
      assets: updatedAssets
    };
    setPlayer(updatedPlayer);
    addLog(`SOLD: ${asset.name} for ${formatCurrency(sellValue)}.`);
  };

  // Render Setup Phase
  if (gameState.phase === 'SETUP') {
    return <ArchetypeSelection onSelect={handleStartGame} />;
  }

  // Render Playing Game
  if (!player) return <div>Loading...</div>;

  const SidebarItem = ({ id, icon, label }: { id: typeof activeTab, icon: React.ReactNode, label: string }) => (
    <button 
      onClick={() => setActiveTab(id)}
      className={`w-full flex items-center px-6 py-4 transition-all duration-200 border-l-4 ${
        activeTab === id 
          ? 'border-emerald-500 bg-[#2d3a35]/30 text-emerald-400' 
          : 'border-transparent text-slate-500 hover:text-slate-300 hover:bg-[#2d3a35]/10'
      }`}
    >
      {React.cloneElement(icon as React.ReactElement<any>, { className: `w-5 h-5 mr-3 ${activeTab === id ? 'stroke-[2.5px]' : ''}` })}
      <span className="font-semibold text-sm tracking-wide">{label}</span>
    </button>
  );

  return (
    <div className="h-[100dvh] flex bg-[#0f1715] font-inter text-slate-200 overflow-hidden">
      
      {/* Victory Modal - Full Screen Mobile Responsive */}
      {gameState.phase === 'VICTORY' && (
        <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl animate-in fade-in duration-700 overflow-y-auto">
          <div className="min-h-full flex items-center justify-center p-4">
            <div className="bg-[#1a2321] rounded-3xl p-1 max-w-lg w-full text-center shadow-2xl border-4 border-emerald-500/50 relative">
              
              {/* Decorative Background */}
              <div className="absolute inset-0 bg-pattern opacity-10"></div>
              
              <div className="bg-[#0f1715] rounded-[22px] p-6 relative z-10">
                  <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-500/30">
                      <Award className="w-10 h-10 text-emerald-500" />
                  </div>
                  
                  <h2 className="text-4xl font-black text-white mb-1 tracking-tight">GAME BEATEN</h2>
                  <p className="text-emerald-500 font-bold uppercase tracking-widest text-xs mb-8">Financial Freedom Achieved</p>

                  {/* New Stats Chart Component */}
                  <div className="mb-8 text-left">
                      <StatsChart history={gameState.netWorthHistory} currentNetWorth={calculateNetWorth(player)} />
                  </div>

                  {/* The Stat Card Grid */}
                  <div className="grid grid-cols-2 gap-4 text-left mb-8">
                      <div className="bg-[#1a2321] p-4 rounded-xl border border-[#2d3a35]">
                          <p className="text-[10px] text-slate-500 uppercase font-bold">Passive Income</p>
                          <p className="text-lg md:text-xl font-mono font-bold text-emerald-400">{formatCurrency(calculatePassiveIncome(player.assets, gameState.exchangeRate))}</p>
                      </div>
                      <div className="bg-[#1a2321] p-4 rounded-xl border border-[#2d3a35]">
                          <p className="text-[10px] text-slate-500 uppercase font-bold">Dream Achieved</p>
                          <div className="flex items-center gap-1">
                              <CheckCircle className="w-3 h-3 text-emerald-500" />
                              <p className="text-sm font-bold text-white truncate">{player.dreamItem.name}</p>
                          </div>
                      </div>
                      <div className="bg-[#1a2321] p-4 rounded-xl border border-[#2d3a35]">
                          <p className="text-[10px] text-slate-500 uppercase font-bold">Time Taken</p>
                          <p className="text-lg md:text-xl font-bold text-white">{gameState.month} Months</p>
                      </div>
                      <div className="bg-[#1a2321] p-4 rounded-xl border border-[#2d3a35]">
                          <p className="text-[10px] text-slate-500 uppercase font-bold">Total Assets</p>
                          <p className="text-lg md:text-xl font-bold text-white">{player.assets.length}</p>
                      </div>
                  </div>

                  <button 
                    onClick={() => setGameState({ phase: 'SETUP', month: 1, log: [], exchangeRate: INITIAL_EXCHANGE_RATE, flags: {}, netWorthHistory: [] })}
                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-4 rounded-xl font-black text-sm uppercase tracking-wider shadow-lg transition-all active:scale-95"
                  >
                    Start New Life
                  </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Game Over Modal */}
      {gameState.phase === 'GAME_OVER' && (
        <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-lg overflow-y-auto">
          <div className="min-h-full flex items-center justify-center p-4">
            <div className="bg-[#1a0505] rounded-3xl p-8 max-w-lg w-full text-center shadow-2xl border-2 border-red-900 animate-in zoom-in duration-500">
              <Skull className="w-24 h-24 text-red-600 mx-auto mb-6 animate-pulse" />
              <h2 className="text-5xl font-black text-red-500 mb-2 uppercase tracking-tighter">Wasted</h2>
              <p className="text-xl text-red-200 mb-8 font-medium">
                You succumbed to the pressure. 
                <br/>
                <span className="text-sm opacity-60 mt-2 block">Cause of Death: Stress & Sapa</span>
              </p>
              <div className="bg-black/40 p-4 rounded-xl border border-red-900/50 mb-8 grid grid-cols-2 gap-4 text-left">
                  <div>
                    <span className="text-xs text-red-400 uppercase font-bold">Months Survived</span>
                    <p className="text-2xl font-mono text-white">{gameState.month}</p>
                  </div>
                  <div>
                    <span className="text-xs text-red-400 uppercase font-bold">Net Worth</span>
                    <p className="text-2xl font-mono text-white">{formatCurrency(calculateNetWorth(player))}</p>
                  </div>
              </div>
              <button 
                onClick={() => setGameState({ phase: 'SETUP', month: 1, log: [], exchangeRate: INITIAL_EXCHANGE_RATE, flags: {}, netWorthHistory: [] })}
                className="w-full bg-red-800 text-white px-8 py-4 rounded-xl font-black text-lg hover:bg-red-700 transition shadow-[0_0_20px_rgba(220,38,38,0.4)] uppercase tracking-wider"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- SIDEBAR (DESKTOP) --- */}
      <aside className="hidden md:flex flex-col w-64 fixed inset-y-0 left-0 border-r border-[#2d3a35] bg-[#1a2321] z-50">
        <div className="p-8 flex items-center">
            <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center mr-3 shadow-lg shadow-emerald-900/50">
                <Wallet className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-black tracking-tight text-white">NaijaQuest</span>
        </div>
        <nav className="flex-grow py-4">
           <SidebarItem id="home" icon={<Home />} label="Home" />
           <SidebarItem id="portfolio" icon={<PieChart />} label="Portfolio" />
           <SidebarItem id="market" icon={<ShoppingBag />} label="Market" />
           <SidebarItem id="bank" icon={<Building2 />} label="Bank" />
           <SidebarItem id="profile" icon={<User />} label="Profile" />
        </nav>
        <div className="p-4 border-t border-[#2d3a35] bg-[#0f1715]/30">
            <div className="bg-[#232d2a] rounded-xl p-3 flex items-center cursor-pointer hover:bg-[#2d3a35] transition-colors">
                <div className="w-10 h-10 rounded-full bg-emerald-900/50 flex items-center justify-center text-emerald-400 font-bold border border-emerald-500/20 mr-3">
                   {player.name.charAt(0)}
                </div>
                <div className="overflow-hidden">
                    <p className="text-sm font-bold text-white truncate">{player.name}</p>
                    <p className="text-[10px] text-slate-500 font-medium">Level 5 Investor</p>
                </div>
            </div>
        </div>
      </aside>

      {/* --- MAIN CONTENT --- */}
      <div className="flex-1 flex flex-col md:pl-64 h-full relative w-full overflow-hidden">
        
        {/* Desktop Header */}
        <header className="hidden md:flex justify-between items-center py-5 px-8 border-b border-[#2d3a35] bg-[#0f1715]/80 backdrop-blur-md sticky top-0 z-40 shrink-0">
           <h1 className="text-xl font-bold text-white">
               {activeTab === 'home' && 'Dashboard'}
               {activeTab === 'portfolio' && 'Portfolio & Debts'}
               {activeTab === 'market' && 'Marketplace'}
               {activeTab === 'bank' && 'Bank & Loans'}
               {activeTab === 'profile' && 'User Profile'}
           </h1>
           <div className="flex items-center space-x-4">
              <button className="p-2 text-slate-400 hover:text-white transition-colors"><HelpCircle className="w-5 h-5" /></button>
              <button className="p-2 text-slate-400 hover:text-white transition-colors relative">
                  <Bell className="w-5 h-5" />
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
           </div>
        </header>

        {/* Mobile Header */}
        <header className="md:hidden flex justify-between items-center p-4 border-b border-[#2d3a35] bg-[#1a2321] sticky top-0 z-40 shrink-0">
            <div className="flex items-center">
                <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center mr-3">
                    <Wallet className="w-5 h-5 text-white" />
                </div>
                <span className="text-lg font-black text-white">NaijaQuest</span>
            </div>
            <button className="text-slate-400"><Menu className="w-6 h-6" /></button>
        </header>

        <main className="flex-grow w-full max-w-5xl mx-auto px-4 md:px-8 pt-6 pb-40 md:pb-12 overflow-y-auto">
          
          {activeTab === 'home' && (
             <Dashboard 
                player={player} 
                month={gameState.month} 
                exchangeRate={gameState.exchangeRate} 
                onNextMonth={handleNextMonth}
                onPerformGig={handlePerformGig}
                onLearnSkill={handleLearnSkill}
                onLifestyleChange={handleLifestyleChange}
                onBuyDream={handleBuyDream}
                isActionPhase={gameState.phase === 'PLAYING'}
             />
          )}

          {activeTab === 'portfolio' && (
              <FinancialStatement 
                player={player} 
                onRepayLiability={handleRepayLiability}
                onSellAsset={handleSellAsset}
                isActionPhase={gameState.phase === 'PLAYING'}
                gameLog={gameState.log}
              />
          )}

          {activeTab === 'market' && (
            <Marketplace 
              player={player}
              onBuy={handleMarketPurchase}
              onUpgrade={handleUpgradeAsset}
              isActionPhase={gameState.phase === 'PLAYING'}
            />
          )}

          {activeTab === 'bank' && (
             <Bank 
                player={player}
                month={gameState.month}
                onTakeSharkLoan={handleTakeSharkLoan}
             />
          )}

          {activeTab === 'profile' && (
             <div className="flex flex-col items-center justify-center h-full pt-10">
                <div className="w-32 h-32 bg-emerald-900/30 rounded-full flex items-center justify-center text-emerald-400 font-bold text-4xl mb-6 border-4 border-[#2d3a35] shadow-2xl">
                    {player.name.charAt(0)}
                </div>
                <h2 className="text-3xl font-black text-white mb-2">{player.name}</h2>
                <span className="px-4 py-1 bg-[#232d2a] rounded-full text-xs font-bold text-slate-400 border border-[#2d3a35] mb-8">{player.profession}</span>
                
                {/* Updated Profile View with Stats Chart */}
                <div className="w-full max-w-2xl mb-8">
                    <StatsChart history={gameState.netWorthHistory} currentNetWorth={calculateNetWorth(player)} />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl">
                   <div className="bg-[#1a2321] rounded-2xl p-6 border border-[#2d3a35]">
                      <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Game Statistics</h3>
                      <div className="space-y-4">
                         <div className="flex justify-between border-b border-[#2d3a35] pb-3">
                             <span className="text-slate-400">Current Month</span>
                             <span className="text-white font-mono font-bold">Month {gameState.month}</span>
                         </div>
                         <div className="flex justify-between border-b border-[#2d3a35] pb-3">
                             <span className="text-slate-400">Social Capital</span>
                             <span className="text-yellow-400 font-bold flex items-center"><Award className="w-4 h-4 mr-1"/> {player.socialCapital}</span>
                         </div>
                         <div className="flex justify-between">
                             <span className="text-slate-400">Passive Income</span>
                             <span className="text-emerald-400 font-mono font-bold">{formatCurrency(calculatePassiveIncome(player.assets, gameState.exchangeRate))}</span>
                         </div>
                      </div>
                   </div>

                   <div className="bg-[#1a2321] rounded-2xl p-6 border border-[#2d3a35] flex flex-col justify-center items-center text-center">
                       <LogOut className="w-10 h-10 text-red-400 mb-4" />
                       <h3 className="text-white font-bold mb-2">Reset Game Data</h3>
                       <p className="text-xs text-slate-500 mb-6">This will wipe your current progress and start over.</p>
                       <button 
                         onClick={() => setGameState({ phase: 'SETUP', month: 1, log: [], exchangeRate: INITIAL_EXCHANGE_RATE, flags: {}, netWorthHistory: [] })}
                         className="px-6 py-2 bg-red-500/10 text-red-400 border border-red-500/20 rounded-lg text-sm font-bold hover:bg-red-500/20 transition-colors"
                       >
                         Quit Game
                       </button>
                   </div>
                </div>
             </div>
          )}
        </main>
      </div>

      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#1a2321] border-t border-[#2d3a35] pb-safe z-40">
        <div className="flex justify-around items-center px-2 py-3">
            <NavButton active={activeTab === 'home'} onClick={() => setActiveTab('home')} icon={<Home />} label="Home" />
            <div className="relative">
                <NavButton active={activeTab === 'portfolio'} onClick={() => setActiveTab('portfolio')} icon={<PieChart />} label="Portfolio" />
                {player.liabilities.length > 0 && <span className="absolute top-0 right-3 w-3 h-3 bg-red-500 rounded-full border-2 border-[#1a2321]"></span>}
            </div>
            <NavButton active={activeTab === 'market'} onClick={() => setActiveTab('market')} icon={<ShoppingBag />} label="Market" />
            <NavButton active={activeTab === 'bank'} onClick={() => setActiveTab('bank')} icon={<Building2 />} label="Bank" />
        </div>
      </nav>

      {gameState.phase === 'INSOLVENCY' && (
         <InsolvencyModal 
            player={player}
            deficit={insolvencyDeficit}
            onTakeSharkLoan={resolveInsolvencyLoan}
            onSellAsset={resolveInsolvencySell}
            onDefault={resolveInsolvencyDefault}
            onBegging={resolveInsolvencyBegging}
            onDeferment={resolveInsolvencyDeferment}
            onLabor={resolveInsolvencyLabor}
         />
      )}

      {gameState.phase === 'EVENT_MODAL' && currentEvent && (
        <EventModal 
          event={currentEvent} 
          player={player} 
          bankLimit={calculateBankCreditLimit(player, gameState.month)}
          usedBankCredit={calculateUsedBankCredit(player)}
          onClose={() => {/* Prevent closing */}} 
          onAction={handleEventCompletion}
          onTakeLoan={handleTakeSharkLoan}
          onAusterity={handleAusterityMeasures}
        />
      )}

    </div>
  );
};

const NavButton: React.FC<{ active: boolean, onClick: () => void, icon: React.ReactNode, label: string }> = ({ active, onClick, icon, label }) => (
    <button onClick={onClick} className={`flex flex-col items-center justify-center w-16 transition-colors ${active ? 'text-emerald-400' : 'text-slate-500 hover:text-slate-300'}`}>
        {React.cloneElement(icon as React.ReactElement<any>, { className: `w-6 h-6 mb-1 ${active ? 'fill-current' : ''}` })}
        <span className="text-[10px] font-medium">{label}</span>
    </button>
);

export default App;
