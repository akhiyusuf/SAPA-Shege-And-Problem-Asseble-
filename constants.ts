
import { Archetype, GameEvent, MarketItem } from './types';

export const VICTORY_MULTIPLIER = 1.2; // Passive Income must be 1.2x Total Expenses
export const INITIAL_EXCHANGE_RATE = 1500;

export const ARCHETYPES: Archetype[] = [
  {
    id: 'tech_bro',
    name: 'The Tech Bro',
    description: 'Remote USD earner. High liquidity, zero liabilities. Living the dream.',
    profession: 'Software Engineer',
    salary: 1500000,
    savings: 4500000,
    expenses: {
      tax: 50000,
      rent: 300000,
      food: 150000,
      transport: 50000,
      other: 100000,
    },
    liabilities: [],
    difficulty: 'Very Easy',
    startingSocialCapital: 50,
    iconName: 'terminal',
    previewStats: {
        cash: '₦4.5M',
        flow: '₦850k',
        debt: '₦0',
        rep: 'Medium'
    }
  },
  {
    id: 'civil_servant',
    name: 'The Civil Servant',
    description: 'Steady flow but heavy family tax. Predictable but capped growth.',
    profession: 'Govt Administrator',
    salary: 200000,
    savings: 150000,
    expenses: {
      tax: 20000,
      rent: 50000,
      food: 40000,
      transport: 20000,
      other: 10000,
    },
    liabilities: [
      { id: 'l_car', name: 'Car Loan', type: 'Loan', totalOwed: 800000, monthlyPayment: 25000 }
    ],
    difficulty: 'Normal',
    startingSocialCapital: 80,
    iconName: 'business_center',
    previewStats: {
        cash: '₦150k',
        flow: '₦60k',
        debt: '₦800k',
        rep: 'High'
    }
  },
  {
    id: 'trader',
    name: 'The Market Trader',
    description: 'High daily volume but extreme price shocks. Street smarts required.',
    profession: 'Importer',
    salary: 600000,
    savings: 40000,
    expenses: {
      tax: 10000,
      rent: 150000,
      food: 100000,
      transport: 50000,
      other: 100000,
    },
    liabilities: [],
    difficulty: 'Hard',
    startingSocialCapital: 90,
    iconName: 'storefront',
    previewStats: {
        cash: '₦40k',
        flow: 'Volatile',
        debt: '₦0',
        rep: 'Elite'
    }
  },
  {
    id: 'corper',
    name: 'The Corper',
    description: 'Serving the nation on a shoestring budget. Uncertainty is the only constant.',
    profession: 'NYSC Member',
    salary: 33000,
    savings: 33000,
    expenses: {
      tax: 0,
      rent: 0,
      food: 20000,
      transport: 5000,
      other: 5000,
    },
    liabilities: [
        { id: 'l_loan', name: 'Personal Loan', type: 'Loan', totalOwed: 150000, monthlyPayment: 5000 }
    ],
    difficulty: 'Very Hard',
    startingSocialCapital: 20,
    iconName: 'military_tech',
    previewStats: {
        cash: '₦33k',
        flow: 'Low',
        debt: '₦150k',
        rep: 'Basic'
    }
  },
  {
    id: 'hustler',
    name: 'The Hustler',
    description: 'Multiple side gigs, but the debt collectors are faster than the income.',
    profession: 'Gig Worker',
    salary: 100000,
    savings: 12000,
    expenses: {
      tax: 0,
      rent: 40000,
      food: 30000,
      transport: 30000,
      other: 10000,
    },
    liabilities: [
        { id: 'l_shark', name: 'Loan Shark', type: 'Loan', totalOwed: 1500000, monthlyPayment: 150000 }
    ],
    difficulty: 'Extreme',
    startingSocialCapital: 10,
    iconName: 'running_with_errors',
    previewStats: {
        cash: '₦12k',
        flow: 'Tenuous',
        debt: '₦1.5M',
        rep: 'Risky'
    }
  },
  {
    id: 'student',
    name: 'The Student',
    description: 'ASUU strike looming, zero cash, and student loans piling up. Survival mode.',
    profession: 'Undergraduate',
    salary: 0,
    savings: 0,
    expenses: {
      tax: 0,
      rent: 0,
      food: 10000,
      transport: 5000,
      other: 5000,
    },
    liabilities: [
        { id: 'l_school', name: 'School Fees Debt', type: 'Loan', totalOwed: 400000, monthlyPayment: 0 }
    ],
    difficulty: 'Impossible',
    startingSocialCapital: 10,
    iconName: 'school',
    previewStats: {
        cash: '₦0',
        flow: '₦0',
        debt: '₦400k',
        rep: 'None'
    }
  }
];

// --- MARKET OPPORTUNITIES ---

export const MARKET_ITEMS: MarketItem[] = [
  {
    id: 'mkt_pos',
    name: 'POS Business',
    description: 'Setup a Point of Sale stand at a busy junction. High volume, high risk of theft.',
    cost: 80000,
    cashFlow: 12000,
    type: 'Business',
    risk: 0.15,
    riskDescription: '15% chance the agent runs away with your startup capital.',
    onFailureMessage: 'The "Agent" you hired disappeared with the machine and your cash on day one.'
  },
  {
    id: 'mkt_okrika',
    name: 'Okrika Bale (First Grade)',
    description: 'Import and sell thrift clothes. Very high margins if the quality is good.',
    cost: 150000,
    cashFlow: 25000,
    type: 'Business',
    risk: 0.25,
    riskDescription: '25% chance of buying a "bad bale" (rags).',
    onFailureMessage: 'You opened the bale and it was full of rags. Complete loss.'
  },
  {
    id: 'mkt_bike',
    name: 'Okada (Delivery Bike)',
    description: 'Buy a bike for logistics/delivery. Constant demand.',
    cost: 450000,
    cashFlow: 50000,
    type: 'Business',
    risk: 0.1,
    riskDescription: '10% chance of immediate seizure by Task Force during delivery.',
    onFailureMessage: 'The bike was seized by Task Force on the way from the showroom.'
  },
  {
    id: 'mkt_data',
    name: 'Data Reselling API',
    description: 'Automated data selling website.',
    cost: 50000,
    cashFlow: 5000,
    type: 'Side Hustle',
    risk: 0.4,
    riskDescription: '40% chance the API provider scams you.',
    onFailureMessage: 'The API provider shut down after taking your deposit.'
  },
  {
    id: 'mkt_perfume',
    name: 'Perfume Oils',
    description: 'Resell oil perfumes. Low barrier to entry.',
    cost: 20000,
    cashFlow: 3000,
    type: 'Side Hustle',
    risk: 0.05,
    riskDescription: '5% chance bottles break during shipping.',
    onFailureMessage: 'The delivery guy smashed the package. Oils everywhere.'
  }
];


// --- EVENTS ---

export const EVENTS: GameEvent[] = [
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
  {
    id: 'prob_bike_police',
    title: 'Task Force Raid',
    description: 'Your rider was caught in a restricted area. They want to crush the bike.',
    type: 'Shock',
    requiresAssetId: 'mkt_bike',
    weight: 4,
    choices: [
      {
        id: 'bike_bail',
        label: 'Bail the Bike',
        cost: 50000,
        onSuccess: {
          message: 'You paid the "fine". The bike is released.',
          moodChange: -5
        }
      },
      {
        id: 'bike_leave',
        label: 'Leave it',
        description: 'It is too expensive to release.',
        onSuccess: {
          message: 'The bike is gone. Asset lost.',
          assetLostId: 'mkt_bike',
          moodChange: -20
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
