import React from 'react';

interface StatCardProps {
  label: string;
  value: string | number;
  accent?: string;
}

export const StatCard: React.FC<StatCardProps> = ({ label, value, accent }) => {
  return (
    <div className="bg-white border border-[#D4DEF0] rounded p-4 flex flex-col gap-1 min-w-[120px] flex-1">
      <div
        className="text-[#5A6A82] text-xs font-medium uppercase tracking-widest"
        style={{ fontFamily: "'Work Sans', sans-serif" }}
      >
        {label}
      </div>
      <div
        className={`text-2xl font-bold ${accent || 'text-[#003087]'}`}
        style={{ fontFamily: "'JetBrains Mono', monospace" }}
      >
        {value}
      </div>
      <div
        className="text-[#8A99AE] text-xs"
        style={{ fontFamily: "'Inter', sans-serif" }}
      >
        KM
      </div>
    </div>
  );
};
