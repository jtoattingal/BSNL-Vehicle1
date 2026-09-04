import React from 'react';
import { StatCard } from './StatCard';
import { DEFAULT_MONTHLY_ALLOWANCE } from '../constants';

interface KmProgressProps {
  used: number;
  allowance?: number;
}

export const KmProgress: React.FC<KmProgressProps> = ({
  used,
  allowance = DEFAULT_MONTHLY_ALLOWANCE,
}) => {
  const percentage = Math.min((used / allowance) * 100, 100);
  const remaining = Math.max(allowance - used, 0);
  const isApproaching = used >= 1700 && used < allowance;
  const isExceeded = used >= allowance;

  return (
    <div>
      <div className="flex gap-3 flex-wrap mb-3">
        <StatCard label="Allowance" value={allowance.toLocaleString()} />
        <StatCard
          label="Used"
          value={used.toLocaleString()}
          accent={
            isExceeded
              ? 'text-red-600'
              : isApproaching
              ? 'text-amber-600'
              : 'text-[#003087]'
          }
        />
        <StatCard
          label="Remaining"
          value={remaining.toLocaleString()}
          accent={isExceeded ? 'text-red-600' : 'text-green-700'}
        />
      </div>

      <div className="bg-[#D4DEF0] rounded-full h-2 overflow-hidden">
        <div
          className={`h-2 rounded-full transition-all duration-300 ${
            isExceeded
              ? 'bg-red-500'
              : isApproaching
              ? 'bg-amber-500'
              : 'bg-[#003087]'
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>

      <div
        className="flex justify-between text-xs text-[#8A99AE] mt-1"
        style={{ fontFamily: "'Inter', sans-serif" }}
      >
        <span>{used} KM used</span>
        <span>{allowance} KM allowance</span>
      </div>

      {isExceeded && (
        <div
          className="mt-2 text-xs text-red-600 font-medium bg-red-50 border border-red-200 rounded px-2 py-1"
          style={{ fontFamily: "'Work Sans', sans-serif" }}
        >
          ⚠ Monthly KM allowance exceeded
        </div>
      )}

      {isApproaching && (
        <div
          className="mt-2 text-xs text-amber-700 font-medium bg-amber-50 border border-amber-200 rounded px-2 py-1"
          style={{ fontFamily: "'Work Sans', sans-serif" }}
        >
          ⚠ Approaching monthly KM limit
        </div>
      )}
    </div>
  );
};
