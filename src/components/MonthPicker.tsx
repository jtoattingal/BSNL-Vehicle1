import React from 'react';
import { formatMonthIndian } from '../constants';

interface MonthPickerProps {
  year: number;
  month: number; // 0-indexed (0 = January)
  onChange: (year: number, month: number) => void;
}

export const MonthPicker: React.FC<MonthPickerProps> = ({ year, month, onChange }) => {
  function handlePrev() {
    if (month === 0) {
      onChange(year - 1, 11);
    } else {
      onChange(year, month - 1);
    }
  }

  function handleNext() {
    const now = new Date();
    if (year > now.getFullYear() || (year === now.getFullYear() && month >= now.getMonth())) {
      // Optional clamp or allow future; in Figma: e>r.getFullYear()||e===r.getFullYear()&&t>=r.getMonth()||(t===11?n(e+1,0):n(e,t+1))
      return;
    }
    if (month === 11) {
      onChange(year + 1, 0);
    } else {
      onChange(year, month + 1);
    }
  }

  const now = new Date();
  const isCurrentOrFuture = year > now.getFullYear() || (year === now.getFullYear() && month >= now.getMonth());

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={handlePrev}
        className="w-7 h-7 flex items-center justify-center rounded border border-[#D4DEF0] text-[#5A6A82] hover:border-[#003087] hover:text-[#003087] text-sm transition-colors cursor-pointer"
        title="Previous Month"
      >
        ‹
      </button>
      <span
        className="text-[#1A2A4A] font-semibold text-sm min-w-[140px] text-center select-none"
        style={{ fontFamily: "'Work Sans', sans-serif" }}
      >
        {formatMonthIndian(year, month)}
      </span>
      <button
        onClick={handleNext}
        disabled={isCurrentOrFuture}
        className={`w-7 h-7 flex items-center justify-center rounded border text-sm transition-colors ${
          isCurrentOrFuture
            ? 'border-[#EEF2F9] text-[#CBD5E1] cursor-not-allowed opacity-50'
            : 'border-[#D4DEF0] text-[#5A6A82] hover:border-[#003087] hover:text-[#003087] cursor-pointer'
        }`}
        title="Next Month"
      >
        ›
      </button>
    </div>
  );
};
