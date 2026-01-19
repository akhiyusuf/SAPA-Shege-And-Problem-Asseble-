
import { Player, Asset, Liability, GameEvent, GameState } from '../types';
import { EVENTS, LIFESTYLE_MULTIPLIERS, VICTORY_MULTIPLIER } from '../constants';

export const formatCurrency = (amount: number, currency: 'NGN' | 'USD' = 'NGN'): string => {
  if (currency === 'USD') {
     return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 2,
    }).format(amount);
  }
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 0,
  }).format(amount);
};

export const calculateTotalAssets = (assets: Asset[]): number => {
  return assets.reduce((total, asset) => total + asset.cost, 0);
};

export const calculateTotalLiabilities = (liabilities: Liability[]): number => {
  return liabilities.reduce((total, liability) => total + liability.totalOwed, 0);
};

export const calculateNetWorth = (player: Player): number => {
  const assets = calculateTotalAssets(player.assets);
  const liabilities = calculateTotalLiabilities(player.liabilities);
  
  // IMPORTANT: Include Dream Item value if purchased
  const dreamValue = player.hasPurchasedDream ? player.dreamItem.cost : 0;
  
  return (assets + dreamValue + player.cash) - liabilities;
};

export const calculatePassiveIncome = (assets: Asset[], exchangeRate: number): number => {
  return assets.reduce((total, asset) => {
    let income = asset.cashFlow || 0;
    if (asset.currency === 'USD') {
      income = income * exchangeRate;
    }
    return total + income;
  }, 0);
};

export const calculateTotalExpenses = (expenses: Player['expenses'], liabilities: Liability[]): number => {
  const liabilityPayments = liabilities.reduce((total, item) => total + item.monthlyPayment, 0);
  const livingExpenses = Object.values(expenses).reduce((total, val) => total + val, 0);
  return livingExpenses + liabilityPayments;
};

// Applies multiplier to variable living expenses (Rent, Food, Transport, Other)
// Tax is usually a function of salary, but for simplicity here we scale it or leave it. 
// Let's scale everything except Tax for lifestyle.
export const recalculateLifestyleExpenses = (baseExpenses: Player['baseExpenses'], lifestyle: Player['lifestyle']): Player['expenses'] => {
    const multiplier = LIFESTYLE_MULTIPLIERS[lifestyle];
    return {
        tax: baseExpenses.tax, // Tax doesn't change with lifestyle directly (simplified)
        rent: Math.floor(baseExpenses.rent * multiplier),
        food: Math.floor(baseExpenses.food * multiplier),
        transport: Math.floor(baseExpenses.transport * multiplier),
        other: Math.floor(baseExpenses.other * multiplier)
    };
};

export const calculateMonthlyCashFlow = (player: Player, exchangeRate: number): number => {
  const passiveIncome = calculatePassiveIncome(player.assets, exchangeRate);
  const totalExpenses = calculateTotalExpenses(player.expenses, player.liabilities);
  return (player.salary + passiveIncome) - totalExpenses;
};

export const calculateProgressToFreedom = (player: Player, exchangeRate: number): number => {
  const passiveIncome = calculatePassiveIncome(player.assets, exchangeRate);
  const totalExpenses = calculateTotalExpenses(player.expenses, player.liabilities);
  if (totalExpenses === 0) return 100;
  return Math.min(100, Math.floor((passiveIncome / totalExpenses) * 100));
};

export const getNextExchangeRate = (currentRate: number, flags: Record<string, boolean>): number => {
  // Base volatility: +/- 2.5%
  let volatility = 0.025;
  // Trend: Slight devaluation bias (0.5% per month)
  let trend = 0.005;

  if (flags['naira_floated']) {
    volatility = 0.08; // High volatility if floated
    trend = 0.01;
  }
  
  if (flags['subsidy_removed']) {
     // Initial shock is usually factored into event, this is persistent drift
     trend = 0.008;
  }

  const change = (Math.random() * (volatility * 2)) - volatility; // range [-volatility, +volatility]
  const newRate = currentRate * (1 + change + trend);
  return Math.floor(newRate);
};

export const selectRandomEvent = (player: Player, state: GameState): GameEvent => {
  // Filter events based on conditions
  const possibleEvents = EVENTS.filter(event => {
    // 1. Check Flags
    if (event.requiresFlag && !state.flags[event.requiresFlag]) return false;
    
    // 2. Check Asset Type Requirements
    if (event.requiresAssetType) {
      const hasAsset = player.assets.some(a => a.type === event.requiresAssetType);
      if (!hasAsset) return false;
    }

    // 3. Check Specific Asset ID Requirements (New)
    if (event.requiresAssetId) {
        const hasSpecificAsset = player.assets.some(a => a.id.startsWith(event.requiresAssetId!));
        if (!hasSpecificAsset) return false;
    }

    // 4. Check Social Capital
    if (event.minSocialCapital && player.socialCapital < event.minSocialCapital) return false;

    // 5. Check Max Mood (New: For low mood events)
    if (event.maxMood !== undefined && player.mood > event.maxMood) return false;

    return true;
  });

  // Weighted random selection
  const totalWeight = possibleEvents.reduce((sum, event) => sum + (event.weight || 1), 0);
  let random = Math.random() * totalWeight;
  
  for (const event of possibleEvents) {
    const weight = event.weight || 1;
    if (random < weight) {
      return event;
    }
    random -= weight;
  }

  return possibleEvents[0]; // Fallback
};

// --- Credit System ---

export const calculateBankCreditLimit = (player: Player, month: number): number => {
  // Base limit that grows with time and reputation
  const base = 200000;
  const timeFactor = month * 100000; // +100k limit per month survived
  const socialFactor = player.socialCapital * 10000; // +10k per social point
  const salaryFactor = player.salary * 3; // 3x Salary

  return base + timeFactor + socialFactor + salaryFactor;
};

export const calculateUsedBankCredit = (player: Player): number => {
  return player.liabilities
    .filter(l => l.type === 'Loan' && l.id.startsWith('bank_'))
    .reduce((sum, l) => sum + l.totalOwed, 0);
};

export const calculateSharkLimit = (player: Player): number => {
  // Sharks give you whatever you want, but let's cap it at 50% of monthly income * 10 to prevent game breaking
  return (player.salary * 10) + 500000; 
};

// --- Win Condition ---
export const checkIsVictorious = (player: Player, exchangeRate: number): boolean => {
    const passiveIncome = calculatePassiveIncome(player.assets, exchangeRate);
    const totalExpenses = calculateTotalExpenses(player.expenses, player.liabilities);
    const hasEnoughIncome = passiveIncome > (totalExpenses * VICTORY_MULTIPLIER);
    
    // New Requirements:
    const isDebtFree = player.liabilities.length === 0;
    const hasDream = player.hasPurchasedDream;

    return hasEnoughIncome && isDebtFree && hasDream;
};
