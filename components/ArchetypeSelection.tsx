
import React, { useState } from 'react';
import { ARCHETYPES, DREAM_ITEMS } from '../constants';
import { Archetype, DreamItem } from '../types';
import { formatCurrency } from '../services/gameEngine';

interface ArchetypeSelectionProps {
  onSelect: (archetype: Archetype, dream: DreamItem) => void;
}

export const ArchetypeSelection: React.FC<ArchetypeSelectionProps> = ({ onSelect }) => {
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedArchetypeId, setSelectedArchetypeId] = useState<string>('tech_bro');
  const [selectedDreamId, setSelectedDreamId] = useState<string>(DREAM_ITEMS[0].id);

  const activeArchetype = ARCHETYPES.find(a => a.id === selectedArchetypeId) || ARCHETYPES[0];
  const activeDream = DREAM_ITEMS.find(d => d.id === selectedDreamId) || DREAM_ITEMS[0];

  const getDifficultyColor = (diff: string) => {
      switch(diff) {
          case 'Very Easy': return { bg: 'bg-emerald-500/20', text: 'text-emerald-400', border: 'border-emerald-500/30' };
          case 'Normal': return { bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500/30' };
          case 'Hard': return { bg: 'bg-orange-500/20', text: 'text-orange-400', border: 'border-orange-500/30' };
          case 'Very Hard': return { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/30' };
          case 'Extreme': return { bg: 'bg-purple-500/20', text: 'text-purple-400', border: 'border-purple-500/30' };
          case 'Impossible': return { bg: 'bg-slate-700/50', text: 'text-slate-200', border: 'border-slate-600/50' };
          default: return { bg: 'bg-emerald-500/20', text: 'text-emerald-400', border: 'border-emerald-500/30' };
      }
  };

  const handleNext = () => {
    if (step === 1) {
        setStep(2);
    } else {
        onSelect(activeArchetype, activeDream);
    }
  };

  return (
    <div className="relative flex h-[100dvh] w-full flex-col bg-pattern overflow-hidden font-sans">
        
        {/* Modern Header */}
        <header className="flex items-center px-6 py-2 justify-between z-30 shrink-0 h-20 bg-background-dark/80 backdrop-blur-md border-b border-white/5">
            {step === 2 ? (
                <button onClick={() => setStep(1)} className="flex size-10 items-center justify-center rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                    <span className="material-symbols-outlined text-white text-2xl">arrow_back</span>
                </button>
            ) : <div className="size-10"></div>}
            
            <div className="flex flex-col items-center">
                {/* Progress Indicators */}
                <div className="flex items-center gap-1.5 mb-1.5">
                    <div className={`h-1.5 w-8 rounded-full transition-colors duration-300 ${step >= 1 ? 'bg-nigeria-green' : 'bg-white/10'}`}></div>
                    <div className={`h-1.5 w-8 rounded-full transition-colors duration-300 ${step >= 2 ? 'bg-nigeria-green' : 'bg-white/10'}`}></div>
                </div>
                <h2 className="text-white text-xl md:text-2xl font-black uppercase tracking-tight leading-none text-center drop-shadow-lg">
                    {step === 1 ? 'Select Character' : 'Choose Your Dream'}
                </h2>
            </div>
            <div className="size-10"></div>
        </header>

        {/* STEP 1: ARCHETYPE */}
        {step === 1 && (
            <>
                <section className="px-6 py-4 z-10 shrink-0 text-center">
                    <p className="text-slate-400 text-sm md:text-base leading-relaxed max-w-md mx-auto">
                        Your starting point determines your struggle. 
                        <br/>
                        <span className="text-nigeria-gold font-bold">Choose wisely.</span>
                    </p>
                </section>

                <main className="flex-1 overflow-x-auto custom-scrollbar flex items-center z-10 snap-x snap-mandatory py-2 pb-6 px-6">
                    <div className="flex gap-5 h-full items-center mx-auto">
                        {ARCHETYPES.map((arch) => {
                            const isActive = selectedArchetypeId === arch.id;
                            const diffColors = getDifficultyColor(arch.difficulty);

                            return (
                                <div 
                                    key={arch.id}
                                    onClick={() => setSelectedArchetypeId(arch.id)}
                                    className={`snap-center flex flex-col bg-card-dark rounded-[2rem] min-w-[280px] max-w-[280px] h-[420px] md:h-[480px] p-5 md:p-6 border border-white/5 relative transition-all duration-300 cursor-pointer overflow-hidden group ${isActive ? 'active-card shadow-2xl shadow-nigeria-gold/10' : 'opacity-60 scale-95 hover:opacity-100 hover:scale-100'}`}
                                >
                                    {/* Difficulty Badge - Enhanced Visibility */}
                                    <div className={`absolute top-4 right-4 z-20 px-3 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase backdrop-blur-md shadow-lg ${diffColors.bg} ${diffColors.text} ${diffColors.border} border`}>
                                        {arch.difficulty}
                                    </div>
                                    
                                    <div className="archetype-icon-wrapper w-full h-32 md:h-40 rounded-2xl flex items-center justify-center mb-5 md:mb-6 border border-white/5 relative overflow-hidden group-hover:border-white/10 transition-colors">
                                        <div className={`absolute inset-0 bg-gradient-to-b from-transparent to-black/40 z-0`}></div>
                                        <span className={`material-symbols-outlined text-6xl md:text-7xl relative z-10 transition-transform duration-500 ${isActive ? 'text-nigeria-gold scale-110' : 'text-slate-600 group-hover:text-slate-400'}`}>
                                            {arch.iconName}
                                        </span>
                                    </div>

                                    <div className="mb-4 text-center">
                                        <h4 className="text-2xl font-black text-white tracking-tight mb-1">{arch.name}</h4>
                                        <p className="text-slate-400 text-xs leading-relaxed line-clamp-2 h-8">{arch.description}</p>
                                    </div>

                                    <div className="mt-auto bg-black/20 rounded-xl p-3 border border-white/5">
                                        <div className="grid grid-cols-2 gap-y-3 gap-x-2">
                                            <StatItem label="Cash" value={arch.previewStats.cash} icon="account_balance_wallet" color="text-emerald-400" />
                                            <StatItem label="Flow" value={arch.previewStats.flow} icon="payments" color="text-emerald-400" />
                                            <StatItem label="Debt" value={arch.previewStats.debt} icon="credit_card_off" color="text-red-400" />
                                            <StatItem label="Rep" value={arch.previewStats.rep} icon="verified_user" color="text-yellow-400" />
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </main>
            </>
        )}

        {/* STEP 2: DREAM */}
        {step === 2 && (
            <>
                <section className="px-6 py-4 z-10 shrink-0 text-center">
                    <p className="text-slate-400 text-sm md:text-base leading-relaxed max-w-md mx-auto">
                        What is your ultimate financial goal?
                        <br/>
                        <span className="text-nigeria-gold font-bold">This is your victory condition.</span>
                    </p>
                </section>

                <main className="flex-1 overflow-x-auto custom-scrollbar flex items-center z-10 snap-x snap-mandatory py-2 pb-6 px-6">
                    <div className="flex gap-5 h-full items-center mx-auto">
                        {DREAM_ITEMS.map((dream) => {
                            const isActive = selectedDreamId === dream.id;
                            
                            return (
                                <div 
                                    key={dream.id}
                                    onClick={() => setSelectedDreamId(dream.id)}
                                    className={`snap-center flex flex-col bg-card-dark rounded-[2rem] min-w-[280px] max-w-[280px] h-[380px] md:h-[420px] p-6 border border-white/5 relative transition-all duration-300 cursor-pointer overflow-hidden group ${isActive ? 'active-card shadow-2xl shadow-purple-500/10' : 'opacity-60 scale-95 hover:opacity-100 hover:scale-100'}`}
                                >
                                    <div className="w-full h-32 md:h-40 bg-gradient-to-br from-purple-900/20 to-blue-900/20 rounded-2xl flex items-center justify-center mb-6 border border-white/5 group-hover:border-white/10 transition-colors relative overflow-hidden">
                                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                                        <span className={`material-symbols-outlined text-6xl md:text-7xl transition-transform duration-500 ${isActive ? 'text-purple-400 scale-110' : 'text-slate-600 group-hover:text-slate-400'}`}>
                                            {dream.iconName}
                                        </span>
                                    </div>

                                    <div className="mb-4 text-center">
                                        <h4 className="text-xl md:text-2xl font-black text-white mb-2 leading-tight">{dream.name}</h4>
                                        <p className="text-slate-400 text-xs leading-relaxed line-clamp-3">{dream.description}</p>
                                    </div>

                                    <div className="mt-auto text-center bg-black/20 p-3 rounded-xl border border-white/5">
                                        <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block mb-1">Target Cost</span>
                                        <span className="text-xl md:text-2xl font-mono font-bold text-nigeria-gold">{formatCurrency(dream.cost)}</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </main>
            </>
        )}

        {/* Footer / Confirm Button */}
        <div className="p-6 pb-8 md:pb-12 bg-gradient-to-t from-background-dark via-background-dark/95 to-transparent pt-8 shrink-0 z-30">
            <button 
                onClick={handleNext}
                className="w-full bg-nigeria-green hover:bg-emerald-600 text-white h-14 md:h-16 rounded-2xl font-black text-lg shadow-lg shadow-emerald-900/30 flex items-center justify-center gap-3 transition-all active:scale-95 border-t border-white/10"
            >
                {step === 1 ? 'NEXT STEP' : 'START GAME'}
                <span className="material-symbols-outlined font-bold">arrow_forward</span>
            </button>
        </div>

        {/* Background Ambient Lights */}
        <div className="absolute top-1/4 -right-20 w-80 h-80 bg-nigeria-green/10 rounded-full blur-[100px] pointer-events-none z-0 mix-blend-screen"></div>
        <div className="absolute bottom-1/4 -left-20 w-80 h-80 bg-purple-900/10 rounded-full blur-[100px] pointer-events-none z-0 mix-blend-screen"></div>
    </div>
  );
};

const StatItem: React.FC<{ label: string, value: string, icon: string, color: string }> = ({ label, value, icon, color }) => (
    <div className="flex flex-col items-start pl-2">
        <span className="text-[9px] text-slate-500 uppercase font-bold tracking-wider mb-0.5">{label}</span>
        <div className="flex items-center gap-1.5">
            <span className={`material-symbols-outlined text-sm ${color}`}>{icon}</span>
            <span className="text-xs font-bold text-slate-200">{value}</span>
        </div>
    </div>
);
