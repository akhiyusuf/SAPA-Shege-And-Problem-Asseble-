
import { Archetype, GameEvent, MarketItem, DreamItem, LifestyleTier } from './types';

export const VICTORY_MULTIPLIER = 1.0; // Passive Income must be > Total Expenses
export const INITIAL_EXCHANGE_RATE = 1500;

export const LIFESTYLE_MULTIPLIERS: Record<LifestyleTier, number> = {
  'Low': 1,
  'Middle': 2.5,
  'High': 6
};

export const DREAM_ITEMS: DreamItem[] = [
  {
    id: 'dream_japa',
    name: 'Japa to Canada',
    description: 'Relocate permanently with full family visa and settlement funds.',
    cost: 15000000,
    iconName: 'flight_takeoff'
  },
  {
    id: 'dream_house',
    name: 'Mansion in Lekki',
    description: 'A 5-bedroom fully detached duplex in a secure estate.',
    cost: 120000000,
    iconName: 'villa'
  },
  {
    id: 'dream_car',
    name: 'Brand New G-Wagon',
    description: 'The ultimate status symbol on Nigerian roads.',
    cost: 65000000,
    iconName: 'directions_car'
  },
  {
    id: 'dream_philanthropy',
    name: 'Build a School',
    description: 'Give back to the community by building a free school.',
    cost: 40000000,
    iconName: 'school'
  }
];

export const ARCHETYPES: Archetype[] = [
  {
    id: 'tech_bro',
    name: 'The Tech Bro',
    description: 'Remote USD earner. Inflation is just a number to you.',
    profession: 'Senior Backend Engineer',
    salary: 2500000,
    savings: 8000000,
    expenses: {
      tax: 150000,
      rent: 400000,
      food: 200000,
      transport: 100000,
      other: 150000,
    },
    liabilities: [],
    difficulty: 'Very Easy',
    startingSocialCapital: 40,
    iconName: 'terminal',
    previewStats: {
        cash: '₦8M',
        flow: '₦1.5M',
        debt: '₦0',
        rep: 'Low'
    }
  },
  {
    id: 'civil_servant',
    name: 'The Civil Servant',
    description: 'Job security is high, but the extended family demands are higher.',
    profession: 'Level 12 Officer',
    salary: 250000,
    savings: 400000,
    expenses: {
      tax: 25000,
      rent: 60000,
      food: 50000,
      transport: 30000,
      other: 60000, // Heavy Black Tax
    },
    liabilities: [
      { id: 'l_coop', name: 'Cooperative Loan', type: 'Loan', totalOwed: 500000, monthlyPayment: 20000 }
    ],
    difficulty: 'Normal',
    startingSocialCapital: 70,
    iconName: 'business_center',
    previewStats: {
        cash: '₦400k',
        flow: '₦5k',
        debt: '₦500k',
        rep: 'High'
    }
  },
  {
    id: 'trader',
    name: 'The Market Trader',
    description: 'Cash rich but asset poor. You move millions but sleep with one eye open.',
    profession: 'Electronics Importer',
    salary: 800000,
    savings: 2500000, // Working Capital
    expenses: {
      tax: 20000, // Informal sector
      rent: 200000, // Shop + House
      food: 100000,
      transport: 100000,
      other: 100000,
    },
    liabilities: [],
    difficulty: 'Hard',
    startingSocialCapital: 85,
    iconName: 'storefront',
    previewStats: {
        cash: '₦2.5M',
        flow: '₦280k',
        debt: '₦0',
        rep: 'Elite'
    }
  },
  {
    id: 'corper',
    name: 'The Corper',
    description: 'Federal Allawee + PPA. It is not much, but it is honest work.',
    profession: 'NYSC Member',
    salary: 55000, // 33k Allawee + 22k PPA
    savings: 50000,
    expenses: {
      tax: 0,
      rent: 0, // Usually provided or squatter
      food: 30000,
      transport: 15000,
      other: 5000,
    },
    liabilities: [],
    difficulty: 'Very Hard',
    startingSocialCapital: 30,
    iconName: 'military_tech',
    previewStats: {
        cash: '₦50k',
        flow: '₦5k',
        debt: '₦0',
        rep: 'Basic'
    }
  },
  {
    id: 'hustler',
    name: 'The Hustler',
    description: 'Multiple side gigs, debt is choking you. You must grind to survive.',
    profession: 'Gig Worker',
    salary: 100000,
    savings: 20000,
    expenses: {
      tax: 0,
      rent: 30000,
      food: 30000,
      transport: 20000,
      other: 0,
    },
    liabilities: [
        { id: 'l_shark', name: 'Loan Shark (Interest Only)', type: 'Loan', totalOwed: 1500000, monthlyPayment: 60000 }
    ],
    difficulty: 'Extreme',
    startingSocialCapital: 10,
    iconName: 'running_with_errors',
    previewStats: {
        cash: '₦20k',
        flow: '-₦40k',
        debt: '₦1.5M',
        rep: 'Risky'
    }
  },
  {
    id: 'student',
    name: 'The Student',
    description: 'Allowances are late. Fees are due. Welcome to the trenches.',
    profession: 'Undergraduate',
    salary: 30000, // Allowance
    savings: 10000,
    expenses: {
      tax: 0,
      rent: 0,
      food: 20000,
      transport: 10000,
      other: 5000,
    },
    liabilities: [
        { id: 'l_school', name: 'School Fees Arrears', type: 'Loan', totalOwed: 250000, monthlyPayment: 0 }
    ],
    difficulty: 'Impossible',
    startingSocialCapital: 15,
    iconName: 'school',
    previewStats: {
        cash: '₦10k',
        flow: '-₦5k',
        debt: '₦250k',
        rep: 'None'
    }
  }
];

// --- MARKET OPPORTUNITIES ---

export const MARKET_ITEMS: MarketItem[] = [
  // --- LOW CLASS (ROI approx 15-20%) ---
  {
    id: 'mkt_pos',
    name: 'POS Business',
    description: 'Setup a Point of Sale stand at a busy junction. High volume.',
    cost: 80000,
    cashFlow: 12000, // 15% ROI
    type: 'Business',
    tier: 'Low',
    risk: 0.15,
    riskDescription: '15% chance the agent runs away with your startup capital.',
    onFailureMessage: 'The "Agent" you hired disappeared with the machine and your cash on day one.'
  },
  {
    id: 'mkt_okrika',
    name: 'Okrika Bale',
    description: 'Import and sell thrift clothes. Very high margins.',
    cost: 150000,
    cashFlow: 25000, // 16.6% ROI
    type: 'Business',
    tier: 'Low',
    risk: 0.25,
    riskDescription: '25% chance of buying a "bad bale" (rags).',
    onFailureMessage: 'You opened the bale and it was full of rags. Complete loss.'
  },
  {
    id: 'mkt_perfume',
    name: 'Perfume Oils',
    description: 'Resell oil perfumes. Low barrier to entry.',
    cost: 20000,
    cashFlow: 4000, // 20% ROI
    type: 'Side Hustle',
    tier: 'Low',
    risk: 0.05,
    riskDescription: '5% chance bottles break during shipping.',
    onFailureMessage: 'The delivery guy smashed the package. Oils everywhere.'
  },

  // --- MIDDLE CLASS (ROI Buffed to 15-20% to match Low Class but with scale) ---
  {
    id: 'mkt_pharmacy',
    name: 'Community Pharmacy',
    description: 'Open a registered pharmacy store in a residential area.',
    cost: 3500000,
    cashFlow: 600000, // ~17% ROI (Was 250k/7%)
    type: 'Business',
    tier: 'Middle',
    risk: 0.1,
    riskDescription: '10% chance of NAFDAC sealing the premises.',
    onFailureMessage: 'NAFDAC sealed the shop due to "improper documentation". Heavy fines.'
  },
  {
    id: 'mkt_uber',
    name: 'Uber Car Fleet',
    description: 'Buy a used Corolla for e-hailing. Weekly remittance.',
    cost: 4500000,
    cashFlow: 800000, // ~17.7% ROI (Was 180k/4%)
    type: 'Business',
    tier: 'Middle',
    risk: 0.3,
    riskDescription: '30% chance the driver wrecks the car.',
    onFailureMessage: 'The driver crashed the car and vanished. Insurance was expired.'
  },
  {
    id: 'mkt_logistics',
    name: 'Logistics Bikes (3x)',
    description: 'Fleet of 3 delivery bikes servicing e-commerce vendors.',
    cost: 1800000,
    cashFlow: 270000, // 15% ROI (Was 120k/6.6%)
    type: 'Business',
    tier: 'Middle',
    risk: 0.2,
    riskDescription: '20% chance of seizure by local govt.',
    onFailureMessage: 'LG officials seized the bikes for "sticker violation".'
  },

  // --- HIGH CLASS (ROI Buffed to 18-25% to make wealth acceleration possible) ---
  {
    id: 'mkt_gas',
    name: 'Cooking Gas Plant',
    description: 'Medium sized LPG refill station. Essential commodity.',
    cost: 25000000,
    cashFlow: 5000000, // 20% ROI (Was 1.8M/7.2%)
    type: 'Business',
    tier: 'High',
    risk: 0.15,
    riskDescription: '15% chance of fire hazard or regulatory shutdown.',
    onFailureMessage: 'DPR revoked the license due to safety proximity violations.'
  },
  {
    id: 'mkt_realestate',
    name: 'Rental Apartment Block',
    description: 'Block of 4 flats in a developing area. Steady yearly rent.',
    cost: 65000000,
    cashFlow: 9000000, // ~13.8% ROI (Was 3.5M/5.3%) - Lower ROI but asset appreciates mentally
    type: 'Real Estate',
    tier: 'High',
    risk: 0.05,
    riskDescription: '5% chance of Omo-Onile issues.',
    onFailureMessage: 'Omo-Onile came with court injunction claiming the land.'
  },
  {
    id: 'mkt_tech',
    name: 'Angel Invest in Fintech',
    description: 'Seed funding for a promising payment gateway.',
    cost: 15000000,
    cashFlow: 0, // No cashflow, capital gains play
    type: 'Paper Asset',
    tier: 'High',
    risk: 0.7,
    riskDescription: '70% chance startup fails. 10x return if successful upon exit.',
    onFailureMessage: 'The founders pivoted to selling shoes, then shut down.'
  }
];


// --- EVENTS ---

export const EVENTS: GameEvent[] = [
  // --- LOW MOOD EVENTS (New) ---
  {
    id: 'shock_burnout',
    title: 'Mental Burnout',
    description: 'You have been grinding too hard. Your mind is foggy and you cannot focus.',
    type: 'Shock',
    weight: 10, // High weight if mood is low
    maxMood: 20, // Only appears if Mood <= 20
    choices: [
      {
        id: 'burnout_rest',
        label: 'Take Forced Rest',
        description: 'Sleep for 3 days. Lose side hustle income this month.',
        onSuccess: {
          message: 'You slept like a baby. Energy restored, but wallet suffered.',
          moodChange: 30,
          healthChange: 10,
          cashChange: -10000 // Lost potential income
        }
      },
      {
        id: 'burnout_push',
        label: 'Push Through with Energy Drinks',
        description: 'Refuse to stop. High health risk.',
        onSuccess: {
          message: 'You survived the month on caffeine.',
          healthChange: -15,
          moodChange: -5
        }
      }
    ]
  },
  {
    id: 'shock_retail_therapy',
    title: 'Impulsive Spending',
    description: 'You are depressed and need a dopamine hit. You find yourself at Shoprite.',
    type: 'Shock',
    weight: 8,
    maxMood: 30, // Mood <= 30
    choices: [
      {
        id: 'retail_buy',
        label: 'Buy Comfort Items',
        description: 'Spend ₦25,000 on unnecessary things.',
        cost: 25000,
        onSuccess: {
          message: 'It felt good for 5 minutes.',
          moodChange: 15
        }
      },
      {
        id: 'retail_resist',
        label: 'Resist the Urge',
        description: 'Go home and stare at the ceiling.',
        onSuccess: {
          message: 'You saved money but feel miserable.',
          moodChange: -5
        }
      }
    ]
  },

  // --- ASSET SPECIFIC PROBLEMS ---
  {
    id: 'prob_pos_robbery',
    title: 'POS Robbery',
    description: 'Two guys on a bike snatched your POS machine and the daily cash.',
    type: 'Shock',
    requiresAssetId: 'mkt_pos',
    weight: 4,
    choices: [
      {
        id: 'pos_replace',
        label: 'Replace Everything',
        cost: 60000,
        onSuccess: {
          message: 'You replaced the machine and cash. Business continues.',
          moodChange: -5,
        }
      },
      {
        id: 'pos_close',
        label: 'Close the Business',
        description: 'Cut your losses. You lose the asset.',
        onSuccess: {
          message: 'You shut down the stand.',
          assetLostId: 'mkt_pos',
          moodChange: -10
        }
      }
    ]
  },
  {
    id: 'prob_okrika_rain',
    title: 'Rain Storm',
    description: 'Heavy rain fell while you were at the market. Your Okrika clothes are soaked and ruined.',
    type: 'Shock',
    requiresAssetId: 'mkt_okrika',
    weight: 3,
    choices: [
      {
        id: 'okrika_wash',
        label: 'Wash and Iron',
        description: 'Pay for laundry to salvage stock.',
        cost: 20000,
        onSuccess: {
          message: 'You saved most of the stock.',
          healthChange: -5 // Stress
        }
      },
      {
        id: 'okrika_loss',
        label: 'Sell as Rags',
        description: 'Sell cheap to mechanics.',
        onSuccess: {
          message: 'You sold them for peanuts. Lost income this month.',
          cashChange: 5000,
          assetLostId: 'mkt_okrika',
          moodChange: -15
        }
      }
    ]
  },

  // --- CAREER / SALARY ---
  {
    id: 'career_promo',
    title: 'Performance Review',
    description: 'Your boss is impressed with your recent work. A promotion is on the table.',
    type: 'Career',
    weight: 2,
    choices: [
      {
        id: 'promo_take',
        label: 'Accept Promotion',
        description: 'More responsibility, higher pay.',
        onSuccess: {
          message: 'You are now a Team Lead! Salary increased.',
          salaryChange: 50000,
          socialCapitalChange: 5,
          moodChange: 10,
          healthChange: -5 // More stress
        }
      },
      {
        id: 'promo_side',
        label: 'Decline (Focus on Side Hustle)',
        description: 'Keep your current low-stress role to focus on business.',
        onSuccess: {
          message: 'You declined. Your boss was confused but agreed. You have more time.',
          socialCapitalChange: -2,
          healthChange: 5
        }
      }
    ]
  },
  {
    id: 'career_negotiate',
    title: 'Salary Negotiation',
    description: 'Inflation is eating your income. You decide to ask for a raise.',
    type: 'Career',
    weight: 2,
    choices: [
      {
        id: 'neg_aggressive',
        label: 'Demand 30% Raise',
        description: 'Risky. 40% chance of success.',
        successChance: 0.4,
        onSuccess: {
          message: 'They folded! Your salary increased significantly.',
          salaryChange: 75000,
          moodChange: 10
        },
        onFailure: {
          message: 'HR laughed. "Be happy you have a job". Relationship soured.',
          socialCapitalChange: -5,
          moodChange: -10
        }
      },
      {
        id: 'neg_safe',
        label: 'Ask for Cost of Living Adj.',
        description: 'Safe bet. 10% raise.',
        onSuccess: {
          message: 'They approved a small adjustment.',
          salaryChange: 25000
        }
      }
    ]
  },

  // --- RENT & HOUSING ---
  {
    id: 'rent_hike',
    title: 'Landlord Notice',
    description: 'Your landlord, Chief Obi, says "Material cost has gone up". He wants to increase rent by ₦200,000/year (approx ₦17k/month).',
    type: 'Economic',
    weight: 3,
    choices: [
      {
        id: 'rent_pay',
        label: 'Accept Increase',
        description: 'Stay in your current apartment.',
        onSuccess: {
          message: 'You signed the new agreement. Your monthly expenses increased.',
          expenseChange: 17000,
          expenseCategory: 'rent'
        }
      },
      {
        id: 'rent_move',
        label: 'Move to "Trenches" (Cheaper)',
        description: 'Move to a cheaper area. Costs ₦100k to move, but Rent drops ₦10k/mo.',
        cost: 100000,
        onSuccess: {
          message: 'You moved. The road is bad, but you save money monthly.',
          expenseChange: -10000,
          expenseCategory: 'rent',
          socialCapitalChange: -10,
          moodChange: -5
        }
      }
    ]
  },
  {
    id: 'rent_repair',
    title: 'Leaking Roof',
    description: 'Rainy season is here and your roof is leaking badly. Landlord says "It\'s tenant liability".',
    type: 'Shock',
    weight: 3,
    choices: [
      {
        id: 'fix_roof',
        label: 'Fix it Properly',
        cost: 40000,
        onSuccess: {
          message: 'You fixed the roof. Dry and happy.',
          socialCapitalChange: 2,
          moodChange: 5
        }
      },
      {
        id: 'manage_bucket',
        label: 'Use Buckets',
        description: 'Put buckets everywhere. Free.',
        onSuccess: {
          message: 'It is stressful, but you saved money. A visitor saw the buckets though.',
          socialCapitalChange: -5,
          healthChange: -5 // Dampness
        }
      }
    ]
  },

  // --- TRANSPORT ---
  {
    id: 'fuel_scarcity',
    title: 'Fuel Scarcity',
    description: 'Queues are everywhere. Black market fuel is ₦1,200/liter.',
    type: 'Economic',
    weight: 4,
    choices: [
      {
        id: 'fuel_black',
        label: 'Buy Black Market',
        description: 'Expensive but convenient.',
        cost: 25000,
        onSuccess: {
          message: 'You have fuel, but your wallet is crying.',
        }
      },
      {
        id: 'fuel_queue',
        label: 'Queue at NNPC',
        description: 'Spend 6 hours. Save cash, lose productivity.',
        successChance: 0.8,
        onSuccess: {
          message: 'You got cheap fuel after 6 hours.',
          healthChange: -5
        },
        onFailure: {
          message: 'They stopped selling when it was your turn! You had to buy black market anyway.',
          cashChange: -25000,
          moodChange: -20
        }
      }
    ]
  },
  {
    id: 'transport_hike',
    title: 'Transport Union Strike',
    description: 'Danfo drivers increased fares permanently due to "Agbero" levies.',
    type: 'Economic',
    weight: 2,
    choices: [
      {
        id: 'trans_accept',
        label: 'Pay Higher Fares',
        description: 'Transport budget increases by ₦5k/mo.',
        onSuccess: {
          message: 'You adjusted your budget.',
          expenseChange: 5000,
          expenseCategory: 'transport'
        }
      },
      {
        id: 'trans_trek',
        label: 'Start Trekking Part-way',
        description: 'Walk the first mile. Save money, sweat more.',
        onSuccess: {
          message: 'You are saving money, but you arrive at work tired.',
          socialCapitalChange: -3,
          healthChange: 2 // Exercise?
        }
      }
    ]
  },

  // --- OPPORTUNITIES (Random) ---
  {
    id: 'opp_pos',
    title: 'POS Deal (Flash Sale)',
    description: 'A friend is selling a POS terminal setup cheap because he is relocating.',
    type: 'Opportunity',
    weight: 2, // Lower weight now that market exists
    choices: [
      {
        id: 'pos_buy',
        label: 'Buy at Asking Price',
        cost: 50000,
        onSuccess: {
          message: 'You bought the POS terminal. It is now generating cash.',
          asset: { id: 'mkt_pos_deal', name: 'POS Terminal (Deal)', type: 'Business', cost: 50000, cashFlow: 8000, currency: 'NGN' }
        }
      },
      {
        id: 'pos_negotiate',
        label: 'Negotiate Price',
        description: 'Offer ₦35,000. 60% chance they accept.',
        cost: 35000,
        successChance: 0.6,
        onSuccess: {
          message: 'Success! They were desperate to sell. You got a bargain.',
          asset: { id: 'mkt_pos_cheap', name: 'POS Terminal (Deal)', type: 'Business', cost: 35000, cashFlow: 8000, currency: 'NGN' },
          moodChange: 5
        },
        onFailure: {
          message: 'They sold it to someone else. Refund processed.',
          cashChange: 35000,
          moodChange: -5
        }
      },
      { id: 'pos_pass', label: 'Pass', onSuccess: { message: 'Opportunity skipped.' } }
    ]
  },
  {
    id: 'opp_crypto',
    title: 'Crypto Airdrop',
    description: 'A new protocol is launching. Farm the airdrop or invest.',
    type: 'Opportunity',
    weight: 3,
    choices: [
      {
        id: 'crypto_farm',
        label: 'Farm Airdrop',
        description: 'Cost: ₦20k (Data). Low Risk.',
        cost: 20000,
        onSuccess: {
          message: 'You farmed steady tokens.',
          asset: { id: 'a_crypto_farm', name: 'Crypto Staking', type: 'Paper Asset', cost: 20000, cashFlow: 5, currency: 'USD' }
        }
      },
      {
        id: 'crypto_degen',
        label: 'Degen Presale',
        description: 'Cost: ₦100k. 50% Chance of Rug Pull (Loss), 50% Moon.',
        cost: 100000,
        successChance: 0.5,
        onSuccess: {
          message: 'To the Moon! The token 10x upon launch.',
          asset: { id: 'a_crypto_moon', name: 'Moonbag Token', type: 'Paper Asset', cost: 100000, cashFlow: 150, currency: 'USD' },
          moodChange: 20
        },
        onFailure: {
          message: 'Rug Pull! The devs deleted the Telegram group.',
          cashChange: 0,
          moodChange: -20,
          healthChange: -5 // Shock
        }
      },
      { id: 'crypto_pass', label: 'Ignore', onSuccess: { message: 'Crypto is a scam anyway.' } }
    ]
  },

  // --- SHOCKS ---
  {
    id: 'shock_police',
    title: 'Police Roadblock',
    description: 'SARS/Police stop you. "Your vehicle papers are incomplete".',
    type: 'Shock',
    weight: 5,
    choices: [
      {
        id: 'police_settle',
        label: 'Settle Them',
        description: 'Pay ₦10,000 to leave immediately.',
        cost: 10000,
        onSuccess: {
          message: 'You paid and left. Frustrating.',
          socialCapitalChange: -2,
          moodChange: -5
        }
      },
      {
        id: 'police_argue',
        label: 'Argue/Call Lawyer',
        description: 'Refuse to pay. 70% chance success.',
        cost: 0,
        successChance: 0.7,
        onSuccess: {
          message: 'They saw you knew your rights and let you go.',
          socialCapitalChange: 5,
          moodChange: 10
        },
        onFailure: {
          message: 'They detained you. Paid higher "bail".',
          cashChange: -30000,
          socialCapitalChange: -5,
          moodChange: -15
        }
      }
    ]
  },
  {
    id: 'shock_gen',
    title: 'Generator Failure',
    description: 'The "I better pass my neighbor" generator knocked.',
    type: 'Shock',
    weight: 4,
    choices: [
      {
        id: 'gen_fix_cheap',
        label: 'Manage It (Patch)',
        description: 'Cost: ₦10,000. 50% chance it works.',
        cost: 10000,
        successChance: 0.5,
        onSuccess: { message: 'The patch held. We have light.' },
        onFailure: { 
          message: 'It smoked immediately. Money wasted. Bought new coil.',
          cashChange: -25000,
          moodChange: -10
        }
      },
      {
        id: 'gen_fix_proper',
        label: 'Full Service',
        description: 'Cost: ₦35,000. Guaranteed fix.',
        cost: 35000,
        onSuccess: { message: 'Generator is humming nicely.', moodChange: 5 }
      }
    ]
  },
  {
    id: 'shock_health',
    title: 'Sudden Illness',
    description: 'You are feeling symptoms of Malaria/Typhoid.',
    type: 'Shock',
    weight: 4,
    choices: [
      {
        id: 'health_pharmacy',
        label: 'Chemist Mix',
        description: 'Cost: ₦5,000. 60% chance success.',
        cost: 5000,
        successChance: 0.6,
        onSuccess: { message: 'The Mix worked. You are strong.', healthChange: -5 },
        onFailure: { 
          message: 'It got worse. Hospital admission.',
          cashChange: -80000,
          healthChange: -20
        }
      },
      {
        id: 'health_hospital',
        label: 'Private Hospital',
        description: 'Cost: ₦45,000. Proper tests.',
        cost: 45000,
        onSuccess: { message: 'You recovered fully.' }
      }
    ]
  },

  // --- SOCIAL ---
  {
    id: 'soc_wedding',
    title: 'Best Friend\'s Wedding',
    description: 'It is the wedding of the year. Expectations are high.',
    type: 'Social',
    weight: 3,
    choices: [
      {
        id: 'wed_full',
        label: 'Full Aso-Ebi & Spray',
        description: 'Cost: ₦100,000. Gain Social Capital.',
        cost: 100000,
        onSuccess: {
          message: 'You were the life of the party!',
          socialCapitalChange: 15,
          moodChange: 15
        }
      },
      {
        id: 'wed_attend',
        label: 'Just Attend',
        description: 'Cost: ₦20,000.',
        cost: 20000,
        onSuccess: {
          message: 'You showed up. Duty done.',
          socialCapitalChange: 5,
          moodChange: 5
        }
      },
      {
        id: 'wed_decline',
        label: 'Send Apologies',
        onSuccess: {
          message: 'They were disappointed.',
          socialCapitalChange: -10,
          moodChange: -5
        }
      }
    ]
  },
  {
    id: 'soc_blacktax',
    title: 'Family Emergency',
    description: 'Uncle in the village needs money for "Urgent 2k".',
    type: 'Social',
    weight: 3,
    choices: [
      {
        id: 'tax_pay',
        label: 'Send the Money',
        cost: 50000,
        onSuccess: {
          message: 'Blessings received.',
          socialCapitalChange: 5,
          moodChange: 5
        }
      },
      {
        id: 'tax_half',
        label: 'Send Half (₦25k)',
        cost: 25000,
        onSuccess: {
          message: 'They grumbled but took it.',
          socialCapitalChange: 2
        }
      },
      {
        id: 'tax_ignore',
        label: 'Ignore',
        onSuccess: {
          message: 'Family meeting will discuss your stinginess.',
          socialCapitalChange: -5,
          moodChange: -5
        }
      }
    ]
  },
  {
    id: 'soc_title',
    title: 'Chieftaincy Title',
    description: 'Your village wants to confer a title on you. "Otunba of Cashflow".',
    type: 'Social',
    weight: 1,
    minSocialCapital: 50,
    choices: [
      {
        id: 'title_take',
        label: 'Accept Title',
        description: 'Costs ₦500k for the ceremony.',
        cost: 500000,
        onSuccess: {
          message: 'Kabiyesi! You are now a Chief. Respect is maximum.',
          socialCapitalChange: 50,
          moodChange: 25
        }
      },
      {
        id: 'title_defer',
        label: 'Decline for Now',
        onSuccess: { message: 'Maybe next year.' }
      }
    ]
  },

  // --- ECONOMIC ---
  {
    id: 'eco_inflation',
    title: 'Food Inflation',
    description: 'Price of Rice has doubled.',
    type: 'Economic',
    weight: 3,
    choices: [
      {
        id: 'inf_absorb',
        label: 'Keep Standard of Living',
        description: 'Increase monthly food budget by ₦30,000.',
        onSuccess: {
          message: 'You maintained your diet, but your wallet bleeds.',
          expenseChange: 30000,
          expenseCategory: 'food'
        }
      },
      {
        id: 'inf_cut',
        label: 'Cut Costs',
        description: 'Switch to cheaper brands.',
        onSuccess: {
          message: 'Garri is now the main course.',
          socialCapitalChange: -2,
          healthChange: -5, // Poor diet
          moodChange: -5
        }
      }
    ]
  }
];
