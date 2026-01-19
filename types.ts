
export type AssetType = 'Business' | 'Real Estate' | 'Paper Asset' | 'Side Hustle';
export type LiabilityType = 'Loan' | 'Expense' | 'Family Obligation';
export type Currency = 'NGN' | 'USD';
export type LifestyleTier = 'Low' | 'Middle' | 'High';

export interface DreamItem {
  id: string;
  name: string;
  description: string;
  cost: number;
  iconName: string;
}

export interface Asset {
  id: string;
  name: string;
  type: AssetType;
  cost: number;
  cashFlow: number; // Monthly passive income generated
  currency: Currency; // NGN or USD
  resaleValue?: number;
  description?: string;
}

export interface Liability {
  id: string;
  name: string;
  type: LiabilityType;
  totalOwed: number;
  monthlyPayment: number;
  termRemaining?: number; // Months left to pay off
}

export interface Archetype {
  id: string;
  name: string;
  description: string;
  profession: string;
  salary: number;
  savings: number;
  expenses: {
    tax: number;
    rent: number;
    food: number;
    transport: number;
    other: number;
  };
  liabilities: Liability[];
  difficulty: string; // Changed from union to string to allow flexibility
  startingSocialCapital: number;
  // New UI specific fields
  iconName: string;
  previewStats: {
    cash: string;
    flow: string;
    debt: string;
    rep: string;
  };
}

export interface Player {
  name: string;
  profession: string;
  cash: number;
  socialCapital: number; // Reputation metric
  health: number; // 0-100
  mood: number;   // 0-100
  salary: number;
  assets: Asset[];
  liabilities: Liability[];
  baseExpenses: { // Renamed from expenses to baseExpenses
    tax: number;
    rent: number;
    food: number;
    transport: number;
    other: number;
  };
  expenses: { // Calculated expenses based on lifestyle
    tax: number;
    rent: number;
    food: number;
    transport: number;
    other: number;
  };
  children: number;
  lifestyle: LifestyleTier; // Current lifestyle tier
  dreamItem: DreamItem; // Selected dream goal
  hasPurchasedDream: boolean;
}

export type EventType = 'Opportunity' | 'Shock' | 'Market' | 'Social' | 'Economic' | 'Career';

export type ExpenseCategory = 'rent' | 'food' | 'transport' | 'tax' | 'other';

// New: Defines the outcome of a choice
export interface EventResult {
  message: string;
  cashChange?: number;
  socialCapitalChange?: number;
  healthChange?: number; // New: Impact on Health
  moodChange?: number;   // New: Impact on Mood
  asset?: Asset; // Gain an asset
  assetLostId?: string; // Lose an asset by ID
  expenseChange?: number; // Monthly expense change
  expenseCategory?: ExpenseCategory; // Which expense to change (default: other)
  salaryChange?: number; // Promotion or Pay cut
  flagsSet?: string[]; // Set global flags
  moveMonth?: boolean; // Force month advance (optional)
}

// New: Defines a clickable choice in an event
export interface EventChoice {
  id: string;
  label: string;
  description?: string;
  cost?: number; // Upfront cost to take this action
  
  // Requirements to see/take this choice
  reqCash?: number;
  reqSocial?: number;
  reqAssetType?: AssetType;
  reqFlag?: string;
  
  // Risk Mechanics
  successChance?: number; // 0.0 to 1.0. If undefined, 100% success.
  
  onSuccess: EventResult;
  onFailure?: EventResult; // Required if successChance < 1.0
}

export interface GameEvent {
  id: string;
  title: string;
  description: string;
  type: EventType;
  choices: EventChoice[]; // List of available actions
  
  // Event Triggers (Conditions for the event to appear)
  weight?: number; // Probability weight
  requiresFlag?: string; 
  requiresAssetType?: AssetType;
  requiresAssetId?: string; // New: Checks if player has asset with ID starting with this string
  minSocialCapital?: number;
  maxMood?: number; // New: Event only triggers if mood is below this value
}

export interface MarketItem {
  id: string;
  name: string;
  description: string;
  cost: number;
  cashFlow: number;
  type: AssetType;
  tier: 'Low' | 'Middle' | 'High'; // New field for classification
  risk: number; // 0 to 1 (Failure chance)
  riskDescription: string;
  onFailureMessage: string;
}

export interface GameState {
  month: number;
  phase: 'SETUP' | 'PLAYING' | 'EVENT_MODAL' | 'GAME_OVER' | 'VICTORY' | 'INSOLVENCY';
  log: string[];
  exchangeRate: number; // NGN per USD
  flags: Record<string, boolean>; // Global event flags (e.g., "subsidy_removed")
  netWorthHistory: { month: number; value: number }[]; // Track history for graph
}
