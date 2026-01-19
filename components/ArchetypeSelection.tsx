
import React, { useState } from 'react';
import { ARCHETYPES } from '../constants';
import { Archetype } from '../types';

interface ArchetypeSelectionProps {
  onSelect: (archetype: Archetype) => void;
}

export const ArchetypeSelection: React.FC<ArchetypeSelectionProps> = ({ onSelect }) => {
  const [selectedId, setSelectedId] = useState<string>('tech_bro');

  const activeArchetype = ARCHETYPES.find(a => a.id === selectedId) || ARCHETYPES[0];

  const getDifficultyColor = (diff: string) => {
      switch(diff) {
          case 'Very Easy': return { bg: 'bg-nigeria-green/20', text: 'text-nigeria-green', border: 'border-nigeria-green/30' };
          case 'Normal': return { bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500/30' };
          case 'Hard': return { bg: 'bg-orange-500/20', text: 'text-orange-400', border: 'border-orange-500/30' };
          case 'Very Hard': return { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/30' };
          case 'Extreme': return { bg: 'bg-purple-500/20', text: 'text-purple-400', border: 'border-purple-500/30' };
          case 'Impossible': return { bg: 'bg-black/60', text: 'text-white', border: 'border-white/20' };
          default: return { bg: 'bg-nigeria-green/20', text: 'text-nigeria-green', border: 'border-nigeria-green/30' };
      }
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col bg-pattern overflow-x-hidden">
        
        {/* Header */}
        <header className="flex items-center p-6 justify-between z-10 shrink-0">
            <button className="flex size-10 items-center justify-center rounded-full bg-white/5 border border-white/10 backdrop-blur-md active:scale-90 transition-transform">
                <span className="material-symbols-outlined text-white text-2xl">chevron_left</span>
            </button>
            <div className="flex flex-col items-center">
                <span className="text-[10px] tracking-[0.2em] text-nigeria-gold font-bold uppercase">Game Start</span>
                <h2 className="text-white text-lg font-extrabold leading-tight">CHOOSE PATH</h2>
            </div>
            <div className="size-10"></div>
        </header>

        {/* Title Section */}
        <section className="px-6 py-2 z-10 shrink-0">
            <h3 className="text-3xl font-extrabold leading-tight mb-2">Select Your <span className="text-nigeria-gold">Archetype</span></h3>
            <p className="text-white/60 text-sm leading-relaxed max-w-[300px]">
                The Nigerian economy reacts differently to each player. Choose your struggle wisely.
            </p>
        </section>

        {/* Horizontal Scroll List */}
        <main className="flex-1 overflow-x-auto custom-scrollbar flex items-center z-10 snap-x snap-mandatory py-4">
            <div className="flex px-6 gap-4 py-12 h-full items-center">
                {ARCHETYPES.map((arch) => {
                    const isActive = selectedId === arch.id;
                    const diffColors = getDifficultyColor(arch.difficulty);

                    return (
                        <div 
                            key={arch.id}
                            onClick={() => setSelectedId(arch.id)}
                            className={`snap-center flex flex-col bg-card-dark rounded-3xl min-w-[280px] max-w-[280px] h-[480px] p-6 border border-white/5 relative transition-all cursor-pointer overflow-hidden ${isActive ? 'active-card' : 'opacity-70 grayscale-[0.5] hover:opacity-100 hover:grayscale-0'}`}
                        >
                            <div className={`absolute top-6 right-6 px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase ${diffColors.bg} ${diffColors.text} ${diffColors.border} border`}>
                                {arch.difficulty}
                            </div>
                            
                            <div className="archetype-icon-wrapper w-full h-40 rounded-2xl flex items-center justify-center mb-6 border border-white/10">
                                <span className={`material-symbols-outlined text-6xl ${isActive ? 'text-nigeria-gold' : 'text-white/40'}`}>
                                    {arch.iconName}
                                </span>
                            </div>

                            <div className="mb-6">
                                <h4 className="text-xl font-black text-white">{arch.name}</h4>
                                <p className="text-white/50 text-xs mt-1 leading-relaxed line-clamp-2">{arch.description}</p>
                            </div>

                            <div className="mt-auto space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <p className="text-[10px] text-white/40 uppercase font-bold tracking-wider">Cash</p>
                                        <div className="flex items-center gap-1.5">
                                            <span className={`material-symbols-outlined text-lg ${isActive ? 'text-nigeria-green' : 'opacity-50 text-nigeria-green'}`}>account_balance_wallet</span>
                                            <span className="text-sm font-bold">{arch.previewStats.cash}</span>
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] text-white/40 uppercase font-bold tracking-wider">Flow</p>
                                        <div className="flex items-center gap-1.5">
                                            <span className={`material-symbols-outlined text-lg ${isActive ? 'text-nigeria-green' : 'opacity-50 text-nigeria-green'}`}>payments</span>
                                            <span className="text-sm font-bold">{arch.previewStats.flow}</span>
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] text-white/40 uppercase font-bold tracking-wider">Debt</p>
                                        <div className="flex items-center gap-1.5">
                                            <span className={`material-symbols-outlined text-lg ${isActive ? 'text-accent-red' : 'opacity-50 text-accent-red'}`}>credit_card_off</span>
                                            <span className="text-sm font-bold">{arch.previewStats.debt}</span>
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] text-white/40 uppercase font-bold tracking-wider">Rep</p>
                                        <div className="flex items-center gap-1.5">
                                            <span className={`material-symbols-outlined text-lg ${isActive ? 'text-nigeria-gold' : 'opacity-50 text-nigeria-gold'}`}>verified_user</span>
                                            <span className="text-sm font-bold">{arch.previewStats.rep}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </main>

        {/* Footer / Confirm Button */}
        <div className="p-6 pb-12 bg-gradient-to-t from-background-dark via-background-dark/90 to-transparent pt-12 shrink-0 z-20">
            <button 
                onClick={() => onSelect(activeArchetype)}
                className="w-full bg-nigeria-green hover:bg-nigeria-green/90 text-white h-16 rounded-2xl font-black text-lg shadow-[0_8px_30px_rgb(0,135,81,0.3)] flex items-center justify-center gap-3 transition-all active:scale-95 border-b-4 border-black/20"
            >
                CONFIRM SELECTION
                <span className="material-symbols-outlined font-bold">arrow_forward</span>
            </button>
        </div>

        {/* Background Ambient Lights */}
        <div className="absolute top-1/4 -right-20 w-64 h-64 bg-nigeria-green/5 rounded-full blur-[100px] pointer-events-none z-0"></div>
        <div className="absolute bottom-1/4 -left-20 w-64 h-64 bg-nigeria-gold/5 rounded-full blur-[100px] pointer-events-none z-0"></div>
    </div>
  );
};
