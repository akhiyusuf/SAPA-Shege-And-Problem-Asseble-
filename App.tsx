
import React, { useState } from 'react';
import { GameState, Player, Archetype, GameEvent, EventResult, Liability, Asset, MarketItem } from './types';
import { INITIAL_EXCHANGE_RATE, VICTORY_MULTIPLIER } from './constants';
import { ArchetypeSelection } from './components/ArchetypeSelection';
import { Dashboard } from './components/Dashboard';
import { FinancialStatement } from './components/FinancialStatement';
import { EventModal } from './components/EventModal';
import { Marketplace } from './components/Marketplace';
import { Bank } from './components/Bank';
import { InsolvencyModal } from './components/InsolvencyModal';
import { 
  calculateMonthlyCashFlow, 
  formatCurrency, 
  calculatePassiveIncome, 
  calculateTotalExpenses, 
  getNextExchangeRate, 
  selectRandomEvent,
  calculateBankCreditLimit,
  calculateUsedBankCredit
} from './services/gameEngine';
import { Home, PieChart, ShoppingBag, User, Award, Wallet, HelpCircle, Bell, Menu, LogOut, Skull, Building2 } from 'lucide-react';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'home' | 'portfolio' | 'market' | 'bank' | 'profile'>('home');
  const [gameState, setGameState] = useState<GameState>({
    month: 1,
    phase: 'SETUP',
    log: [],
    exchangeRate: INITIAL_EXCHANGE_RATE,
    flags: {}
  });
  
  const [player, setPlayer] = useState<Player | null>(null);
  const [currentEvent, setCurrentEvent] = useState<GameEvent | null>(null);
  const [insolvencyDeficit, setInsolvencyDeficit] = useState<number>(0);

  // Initialize game with an archetype
  const handleStartGame = (archetype: Archetype) => {
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
      expenses: { ...archetype.expenses },
      children: 0,
    };
    
    setPlayer(newPlayer);
    setGameState({
      month: 1,
      phase: 'PLAYING',
      log: [`Started journey as a ${archetype.name}.`, `Exchange Rate: ${formatCurrency(INITIAL_EXCHANGE_RATE)} per $1`],
      exchangeRate: INITIAL_EXCHANGE_RATE,
      flags: {}
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
    
    let healthPenalty = 0;
    let moodPenalty = 0;

    // Apply Changes
    const nextCash = projectedCash; // verified above to be positive
    const nextHealth = Math.max(0, Math.min(100, player.health - healthPenalty));
    const nextMood = Math.max(0, Math.min(100, player.mood - moodPenalty));

    if (rateMsg) addLog(rateMsg);

    // Update Player
    setPlayer(prev => prev ? {
      ...prev,
      cash: nextCash,
      health: nextHealth,
      mood: nextMood
    } : null);

    // 4. Check for Death (Game Over)
    if (nextHealth <= 0) {
      setGameState(prev => ({ ...prev, phase: 'GAME_OVER' }));
      return; 
    }

    // 5. Advance Phase
    setGameState(prev => ({ 
      ...prev, 
      month: prev.month + 1, 
      phase: 'EVENT_MODAL',
      exchangeRate: newRate
    }));

    // 6. Trigger Event
    const randomEvent = selectRandomEvent(player, { ...gameState, exchangeRate: newRate });
    setCurrentEvent(randomEvent);
  };

  // --- INSOLVENCY HANDLERS ---
  const checkSolvencyAndProceed = (updatedPlayer: Player) => {
      const flow = calculateMonthlyCashFlow(updatedPlayer, gameState.exchangeRate);
      if (updatedPlayer.cash + flow >= 0) {
          setGameState(prev => ({ ...prev, phase: 'PLAYING' }));
          addLog("INSOLVENCY: You have stabilized your cash flow. Proceed when ready.");
      } else {
          // Still insolvent, update deficit
          setInsolvencyDeficit(Math.abs(updatedPlayer.cash + flow));
      }
  };

  const resolveInsolvencyLoan = (amount: number) => {
      handleTakeSharkLoan(amount);
      setGameState(prev => ({ ...prev, phase: 'PLAYING' }));
      // Do not auto-advance; let them verify stats then click Next Month again
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
     
     // 1. Calculate how much we are "saving" this month by skipping loans
     const loanLiabilities = player.liabilities.filter(l => l.type === 'Loan');
     const totalMonthlyPayments = loanLiabilities.reduce((sum, l) => sum + l.monthlyPayment, 0);

     if(totalMonthlyPayments === 0) {
         addLog("No loans to defer.");
         return;
     }

     // 2. Increase total owed by 10% penalty
     const updatedLiabilities = player.liabilities.map(l => {
         if (l.type === 'Loan') {
             return { ...l, totalOwed: Math.floor(l.totalOwed * 1.1) };
         }
         return l;
     });

     // 3. Give cash injection equal to payments (simulate skipping payment)
     // Since the monthly calculation SUBTRACTS payments, adding this amount effectively neutralizes the deduction for this month
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
      // Sapa Mode: Cash goes to 0 (we assume bills ate it all), but major stat hits
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
      
      // Advance month logic manually for this case
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
            // Create Bank Liability (0% interest model, essentially cost-plus fixed)
            const term = 12;
            const newLiability: Liability = {
                id: `bank_event_${Date.now()}`,
                name: `Financing: ${currentEvent?.title || 'Event'}`,
                type: 'Loan',
                totalOwed: cost,
                monthlyPayment: Math.ceil(cost / term)
            };
            updatedPlayer.liabilities = [...updatedPlayer.liabilities, newLiability];
        }
    }

    // Apply Cash Change (Refunds or Losses from event result)
    if (result.cashChange) {
      updatedPlayer.cash += result.cashChange;
    }

    // Asset Gain
    if (result.asset) {
      updatedPlayer.assets = [...updatedPlayer.assets, result.asset];
    }

    // Asset Loss
    if (result.assetLostId) {
      const indexToRemove = updatedPlayer.assets.findIndex(a => a.id.startsWith(result.assetLostId!));
      if (indexToRemove !== -1) {
          const newAssets = [...updatedPlayer.assets];
          newAssets.splice(indexToRemove, 1);
          updatedPlayer.assets = newAssets;
      }
    }

    // Expenses Logic
    if (result.expenseChange) {
      const category = result.expenseCategory || 'other';
      updatedPlayer.expenses[category] += result.expenseChange;
      if (updatedPlayer.expenses[category] < 0) updatedPlayer.expenses[category] = 0;
    }

    // Salary Change
    if (result.salaryChange) {
      updatedPlayer.salary += result.salaryChange;
    }

    // Social Capital
    if (result.socialCapitalChange) {
      updatedPlayer.socialCapital += result.socialCapitalChange;
    }

    // Health & Mood
    if (result.healthChange) {
      updatedPlayer.health = Math.max(0, Math.min(100, updatedPlayer.health + result.healthChange));
    }
    if (result.moodChange) {
      updatedPlayer.mood = Math.max(0, Math.min(100, updatedPlayer.mood + result.moodChange));
    }

    // Flags
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
     
     // Check for death immediately after event
     if (updatedPlayer.health <= 0) {
        setGameState(prev => ({ ...prev, phase: 'GAME_OVER' }));
     } else {
        checkWinCondition(updatedPlayer, gameState.exchangeRate);
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

    // Cost logic
    if (method === 'cash') {
        updatedPlayer.cash -= item.cost;
        addLog(`MARKET: Bought ${item.name} with CASH.`);
    } else {
        // Financing logic: Create a liability
        const loanTerm = 12; // 12 months standard
        const newLiability: Liability = {
            id: `bank_loan_${Date.now()}`,
            name: `Loan: ${item.name}`,
            type: 'Loan',
            totalOwed: item.cost,
            monthlyPayment: Math.ceil(item.cost / loanTerm)
        };
        updatedPlayer.liabilities = [...updatedPlayer.liabilities, newLiability];
        addLog(`MARKET: Financed ${item.name} via Bank. Liability added.`);
    }

    if (isSuccess) {
       const newAsset: Asset = {
         id: `${item.id}_${Date.now()}`,
         name: item.name,
         type: item.type,
         cost: item.cost,
         cashFlow: item.cashFlow,
         currency: 'NGN',
         description: item.description
       };
       updatedPlayer.assets = [...updatedPlayer.assets, newAsset];
    } else {
       addLog(`MARKET FAILED: ${item.name} - ${item.onFailureMessage}`);
       // Note: If financed, you still owe the money even if business failed!
       updatedPlayer.mood = Math.max(0, updatedPlayer.mood - 10);
    }

    setPlayer(updatedPlayer);
    checkWinCondition(updatedPlayer, gameState.exchangeRate);
  };

  const handleTakeSharkLoan = (amount: number) => {
    if (!player) return;

    // 40% Interest, 4 months term
    const interest = 0.4;
    const totalOwed = Math.floor(amount * (1 + interest));
    const term = 4;
    const monthlyPayment = Math.floor(totalOwed / term);

    const loan: Liability = {
        id: `shark_${Date.now()}`,
        name: 'Shark Loan',
        type: 'Loan',
        totalOwed: totalOwed,
        monthlyPayment: monthlyPayment
    };

    const updatedPlayer = {
        ...player,
        cash: player.cash + amount,
        liabilities: [...player.liabilities, loan]
    };

    setPlayer(updatedPlayer);
    addLog(`SHARK: Took ${formatCurrency(amount)} loan. You owe ${formatCurrency(totalOwed)}. Don't miss a payment.`);
    // Note: We don't force redirect to portfolio here, to keep them in the event flow if called from Modal
  };

  const handleAusterityMeasures = () => {
      if (!player) return;

      // Cut variable expenses by 30%
      const newExpenses = {
          ...player.expenses,
          food: Math.floor(player.expenses.food * 0.7),
          transport: Math.floor(player.expenses.transport * 0.7),
          other: Math.floor(player.expenses.other * 0.7)
      };

      const updatedPlayer = {
          ...player,
          expenses: newExpenses,
          mood: Math.max(0, player.mood - 20),
          socialCapital: Math.max(0, player.socialCapital - 15),
          cash: player.cash + 15000 // Scrounging/Selling clutter
      };

      setPlayer(updatedPlayer);
      addLog(`AUSTERITY: You cut expenses significantly. Mood and Reputation suffered, but cash flow improved.`);
  };

  const checkWinCondition = (currentPlayer: Player, currentRate: number) => {
     const passiveIncome = calculatePassiveIncome(currentPlayer.assets, currentRate);
     const totalExpenses = calculateTotalExpenses(currentPlayer.expenses, currentPlayer.liabilities);
     
     if (passiveIncome > totalExpenses * VICTORY_MULTIPLIER) {
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
    <div className="min-h-screen flex bg-[#0f1715] font-inter text-slate-200">
      
      {/* Victory Modal */}
      {gameState.phase === 'VICTORY' && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="bg-[#1a2321] rounded-3xl p-8 max-w-lg text-center shadow-2xl border-4 border-emerald-500 animate-in zoom-in duration-300">
             <Award className="w-24 h-24 text-emerald-500 mx-auto mb-6" />
             <h2 className="text-4xl font-black text-white mb-4">Financial Freedom!</h2>
             <p className="text-lg text-slate-300 mb-8">
               Congratulations! Your passive income of <span className="font-bold text-emerald-400">{formatCurrency(calculatePassiveIncome(player.assets, gameState.exchangeRate))}</span> now exceeds your expenses.
             </p>
             <button 
               onClick={() => setGameState({ phase: 'SETUP', month: 1, log: [], exchangeRate: INITIAL_EXCHANGE_RATE, flags: {} })}
               className="bg-emerald-600 text-white px-8 py-3 rounded-xl font-bold text-lg hover:bg-emerald-700 transition shadow-xl"
             >
               Start New Life
             </button>
          </div>
        </div>
      )}

      {/* Game Over (Death) Modal */}
      {gameState.phase === 'GAME_OVER' && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-lg p-4">
          <div className="bg-[#1a0505] rounded-3xl p-10 max-w-lg text-center shadow-2xl border-2 border-red-900 animate-in zoom-in duration-500">
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
                   <p className="text-2xl font-mono text-white">{formatCurrency(player.cash + player.assets.reduce((a,b)=>a+b.cost, 0) - player.liabilities.reduce((a,b)=>a+b.totalOwed, 0))}</p>
                </div>
             </div>
             <button 
               onClick={() => setGameState({ phase: 'SETUP', month: 1, log: [], exchangeRate: INITIAL_EXCHANGE_RATE, flags: {} })}
               className="w-full bg-red-800 text-white px-8 py-4 rounded-xl font-black text-lg hover:bg-red-700 transition shadow-[0_0_20px_rgba(220,38,38,0.4)] uppercase tracking-wider"
             >
               Try Again
             </button>
          </div>
        </div>
      )}

      {/* --- SIDEBAR (DESKTOP) --- */}
      <aside className="hidden md:flex flex-col w-64 fixed inset-y-0 left-0 border-r border-[#2d3a35] bg-[#1a2321] z-50">
        
        {/* Logo */}
        <div className="p-8 flex items-center">
            <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center mr-3 shadow-lg shadow-emerald-900/50">
                <Wallet className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-black tracking-tight text-white">NaijaQuest</span>
        </div>

        {/* Navigation */}
        <nav className="flex-grow py-4">
           <SidebarItem id="home" icon={<Home />} label="Home" />
           <SidebarItem id="portfolio" icon={<PieChart />} label="Portfolio" />
           <SidebarItem id="market" icon={<ShoppingBag />} label="Market" />
           {/* Bank routes to new Bank Component */}
           <SidebarItem id="bank" icon={<Building2 />} label="Bank" />
           <SidebarItem id="profile" icon={<User />} label="Profile" />
        </nav>

        {/* User Footer */}
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
      <div className="flex-1 flex flex-col md:pl-64 min-h-screen relative w-full">
        
        {/* Desktop Header */}
        <header className="hidden md:flex justify-between items-center py-5 px-8 border-b border-[#2d3a35] bg-[#0f1715]/80 backdrop-blur-md sticky top-0 z-40">
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
        <header className="md:hidden flex justify-between items-center p-4 border-b border-[#2d3a35] bg-[#1a2321] sticky top-0 z-40">
            <div className="flex items-center">
                <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center mr-3">
                    <Wallet className="w-5 h-5 text-white" />
                </div>
                <span className="text-lg font-black text-white">NaijaQuest</span>
            </div>
            <button className="text-slate-400"><Menu className="w-6 h-6" /></button>
        </header>

        <main className="flex-grow w-full max-w-5xl mx-auto px-4 md:px-8 pt-6 pb-24 md:pb-12">
          
          {activeTab === 'home' && (
             <Dashboard 
                player={player} 
                month={gameState.month} 
                exchangeRate={gameState.exchangeRate} 
                onNextMonth={handleNextMonth}
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
                             <span className="text-slate-400">Net Worth</span>
                             <span className="text-emerald-400 font-mono font-bold">{formatCurrency(player.cash + player.assets.reduce((a,b) => a + b.cost, 0) - player.liabilities.reduce((a,b) => a + b.totalOwed, 0))}</span>
                         </div>
                      </div>
                   </div>

                   <div className="bg-[#1a2321] rounded-2xl p-6 border border-[#2d3a35] flex flex-col justify-center items-center text-center">
                       <LogOut className="w-10 h-10 text-red-400 mb-4" />
                       <h3 className="text-white font-bold mb-2">Reset Game Data</h3>
                       <p className="text-xs text-slate-500 mb-6">This will wipe your current progress and start over.</p>
                       <button 
                         onClick={() => setGameState({ phase: 'SETUP', month: 1, log: [], exchangeRate: INITIAL_EXCHANGE_RATE, flags: {} })}
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

      {/* --- MOBILE NAVIGATION --- */}
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

      {/* Insolvency Modal (Precedence over Event Modal) */}
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

      {/* Event Modal */}
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
