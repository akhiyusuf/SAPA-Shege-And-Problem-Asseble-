
import React, { useState } from 'react';
import { formatCurrency } from '../services/gameEngine';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StatsChartProps {
  history: { month: number; value: number }[];
  currentNetWorth: number;
}

export const StatsChart: React.FC<StatsChartProps> = ({ history, currentNetWorth }) => {
  const [range, setRange] = useState<'6M' | '1Y' | '2Y' | '5Y' | 'ALL'>('ALL');

  // Filter Data based on range
  const getData = () => {
    if (history.length === 0) return [{ month: 1, value: currentNetWorth }];
    
    const lastMonth = history[history.length - 1].month;
    
    switch(range) {
        case '6M': return history.filter(h => h.month > lastMonth - 6);
        case '1Y': return history.filter(h => h.month > lastMonth - 12);
        case '2Y': return history.filter(h => h.month > lastMonth - 24);
        case '5Y': return history.filter(h => h.month > lastMonth - 60);
        default: return history;
    }
  };

  const data = getData();
  // Ensure we have at least 2 points for a line, if not add a dummy start point
  const displayData = data.length === 1 ? [{month: data[0].month - 1, value: data[0].value}, ...data] : data;

  const values = displayData.map(d => d.value);
  const minVal = Math.min(...values);
  const maxVal = Math.max(...values, 100000); 
  // Add some padding to range so graph isn't touching edges vertically
  const rangeVal = (maxVal - minVal) * 1.1 || 1; 
  const baseVal = minVal - (rangeVal * 0.05);

  // SVG Dimensions
  const width = 1000;
  const height = 400;
  const paddingX = 0;
  const paddingY = 20;

  const getX = (index: number) => {
      return (index / (displayData.length - 1 || 1)) * (width - paddingX * 2) + paddingX;
  };

  const getY = (val: number) => {
      return height - paddingY - ((val - baseVal) / rangeVal) * (height - paddingY * 2);
  };

  // Build Polyline points
  const points = displayData.map((d, i) => `${getX(i)},${getY(d.value)}`).join(' ');
  
  // Build Area Path (close the loop at bottom)
  const areaPath = `${points} ${width},${height} 0,${height}`;

  // Calculate Growth
  const startVal = displayData[0].value;
  const endVal = displayData[displayData.length - 1].value;
  const growth = endVal - startVal;
  const isPositive = growth >= 0;

  // Generate Grid Lines (5 horizontal lines)
  const gridLines = [0, 0.25, 0.5, 0.75, 1].map(ratio => {
      const y = height - paddingY - ratio * (height - paddingY * 2);
      return (
          <line 
            key={ratio} 
            x1="0" 
            y1={y} 
            x2={width} 
            y2={y} 
            stroke="#2d3a35" 
            strokeWidth="2" 
            strokeDasharray="5,5" 
          />
      );
  });

  return (
    <div className="bg-[#1a2321] rounded-2xl p-6 border border-[#2d3a35] w-full">
        
        <div className="flex flex-col md:flex-row justify-between items-end md:items-end mb-6 gap-4">
            <div>
                <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">Net Worth History</p>
                <div className="flex items-center gap-3 flex-wrap">
                    <h3 className="text-2xl md:text-3xl font-mono font-bold text-white tracking-tight">
                        {formatCurrency(currentNetWorth)}
                    </h3>
                    {displayData.length > 1 && (
                         <div className={`flex items-center text-xs font-bold px-2 py-1 rounded-full border ${isPositive ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                             {isPositive ? <TrendingUp className="w-3 h-3 mr-1"/> : <TrendingDown className="w-3 h-3 mr-1"/>}
                             {formatCurrency(Math.abs(growth))}
                         </div>
                    )}
                </div>
            </div>
            
            <div className="flex bg-[#0f1715] p-1 rounded-lg border border-[#2d3a35] overflow-x-auto max-w-full">
                {(['6M', '1Y', '2Y', '5Y', 'ALL'] as const).map(r => (
                    <button
                        key={r}
                        onClick={() => setRange(r)}
                        className={`px-3 py-1.5 rounded-md text-[10px] font-bold transition-all whitespace-nowrap ${range === r ? 'bg-[#2d3a35] text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                        {r}
                    </button>
                ))}
            </div>
        </div>

        {/* SVG CHART CONTAINER */}
        <div className="w-full aspect-[2.5/1] md:aspect-[3/1] relative">
            <svg 
                viewBox={`0 0 ${width} ${height}`} 
                className="w-full h-full overflow-visible" 
                preserveAspectRatio="none"
            >
                <defs>
                    <linearGradient id="chartGradient" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor="#10b981" stopOpacity="0.2" />
                        <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                    </linearGradient>
                    <linearGradient id="chartGradientNeg" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor="#ef4444" stopOpacity="0.2" />
                        <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
                    </linearGradient>
                </defs>

                {/* Grid */}
                {gridLines}

                {/* Zero Line */}
                {minVal < 0 && maxVal > 0 && (
                     <line 
                        x1="0" 
                        y1={getY(0)} 
                        x2={width} 
                        y2={getY(0)} 
                        stroke="#ffffff" 
                        strokeOpacity="0.2"
                        strokeWidth="2" 
                    />
                )}
                
                {/* Area Fill */}
                <polygon 
                    points={areaPath} 
                    fill={`url(#${isPositive ? 'chartGradient' : 'chartGradientNeg'})`}
                />
                
                {/* The Line */}
                <polyline 
                    fill="none" 
                    stroke={isPositive ? "#10b981" : "#ef4444"} 
                    strokeWidth="4" 
                    points={points} 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    vectorEffect="non-scaling-stroke"
                />

                {/* Data Points (Only if less than 20 points to avoid clutter) */}
                {displayData.length < 20 && displayData.map((d, i) => (
                    <circle 
                        key={i}
                        cx={getX(i)}
                        cy={getY(d.value)}
                        r="6"
                        fill="#1a2321"
                        stroke={isPositive ? "#10b981" : "#ef4444"}
                        strokeWidth="3"
                    />
                ))}
            </svg>
            
            {/* Axis Labels */}
            <div className="flex justify-between mt-2 text-[10px] font-mono text-slate-500">
                <span>Month {displayData[0]?.month}</span>
                <span>Month {displayData[displayData.length - 1]?.month}</span>
            </div>
        </div>
    </div>
  );
};
