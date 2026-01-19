
import React, { useState } from 'react';
import { formatCurrency } from '../services/gameEngine';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StatsChartProps {
  history: { month: number; value: number }[];
  currentNetWorth: number;
}

export const StatsChart: React.FC<StatsChartProps> = ({ history, currentNetWorth }) => {
  const [range, setRange] = useState<'1M' | '6M' | '1Y' | 'ALL'>('ALL');

  // Filter Data based on range
  const getData = () => {
    if (history.length === 0) return [{ month: 1, value: currentNetWorth }];
    
    const lastMonth = history[history.length - 1].month;
    
    switch(range) {
        case '1M': return history.slice(-2); // Current and prev
        case '6M': return history.filter(h => h.month > lastMonth - 6);
        case '1Y': return history.filter(h => h.month > lastMonth - 12);
        default: return history;
    }
  };

  const data = getData();
  const values = data.map(d => d.value);
  const minVal = Math.min(...values, 0);
  const maxVal = Math.max(...values, 100000); // Default max 100k for empty states
  const rangeVal = maxVal - minVal || 1;

  // SVG Dimensions
  const width = 100;
  const height = 50;
  const padding = 2;

  // Helper to convert data point to SVG coordinate
  const getCoord = (index: number, val: number) => {
    const x = (index / (data.length - 1 || 1)) * (width - padding * 2) + padding;
    // Invert Y axis because SVG 0 is top
    const y = height - padding - ((val - minVal) / rangeVal) * (height - padding * 2);
    return `${x},${y}`;
  };

  // Build Polyline points
  const points = data.map((d, i) => getCoord(i, d.value)).join(' ');

  // Calculate Growth
  const startVal = data[0].value;
  const endVal = data[data.length - 1].value;
  const growth = endVal - startVal;
  const isPositive = growth >= 0;

  return (
    <div className="bg-[#1a2321] rounded-2xl p-6 border border-[#2d3a35]">
        
        <div className="flex justify-between items-end mb-6">
            <div>
                <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">Net Worth History</p>
                <div className="flex items-center gap-3">
                    <h3 className="text-2xl font-mono font-bold text-white">{formatCurrency(currentNetWorth)}</h3>
                    {data.length > 1 && (
                         <div className={`flex items-center text-xs font-bold px-2 py-0.5 rounded-full border ${isPositive ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                             {isPositive ? <TrendingUp className="w-3 h-3 mr-1"/> : <TrendingDown className="w-3 h-3 mr-1"/>}
                             {formatCurrency(Math.abs(growth))}
                         </div>
                    )}
                </div>
            </div>
            
            <div className="flex bg-[#0f1715] p-1 rounded-lg border border-[#2d3a35]">
                {(['1M', '6M', '1Y', 'ALL'] as const).map(r => (
                    <button
                        key={r}
                        onClick={() => setRange(r)}
                        className={`px-3 py-1 rounded-md text-[10px] font-bold transition-all ${range === r ? 'bg-[#2d3a35] text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                        {r}
                    </button>
                ))}
            </div>
        </div>

        {/* SVG CHART */}
        <div className="w-full h-32 relative">
            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible" preserveAspectRatio="none">
                {/* Zero Line */}
                {minVal < 0 && maxVal > 0 && (
                     <line 
                        x1="0" 
                        y1={height - padding - ((0 - minVal) / rangeVal) * (height - padding * 2)} 
                        x2={width} 
                        y2={height - padding - ((0 - minVal) / rangeVal) * (height - padding * 2)} 
                        stroke="#2d3a35" 
                        strokeWidth="0.5" 
                        strokeDasharray="2" 
                    />
                )}
                
                {/* Area Fill Gradient (Optional visual flair) */}
                <defs>
                    <linearGradient id="chartGradient" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor="#10b981" stopOpacity="0.2" />
                        <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                    </linearGradient>
                </defs>
                
                {/* The Line */}
                <polyline 
                    fill="none" 
                    stroke={isPositive ? "#10b981" : "#ef4444"} 
                    strokeWidth="2" 
                    points={points} 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    vectorEffect="non-scaling-stroke"
                />
            </svg>
        </div>
    </div>
  );
};
