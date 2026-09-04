import React from 'react';
import {
  OPENING_STATION_BREAKDOWNS,
  CLOSING_STATION_BREAKDOWNS,
  STATION_OFFSETS,
} from '../constants';

interface MeterBreakdownProps {
  label: string;
  actualMeter: number;
  station: string;
  isOpening: boolean;
}

export const MeterBreakdown: React.FC<MeterBreakdownProps> = ({
  label,
  actualMeter,
  station,
  isOpening,
}) => {
  const steps = isOpening
    ? OPENING_STATION_BREAKDOWNS[station] || []
    : CLOSING_STATION_BREAKDOWNS[station] || [];
  const offset = STATION_OFFSETS[station] ?? 0;
  const result = isOpening ? actualMeter - offset : actualMeter + offset;

  return (
    <div className="bg-[#F0F4FB] border border-[#C8D5EB] rounded p-3 text-sm mt-2">
      <div
        className="text-[#003087] font-semibold text-xs uppercase tracking-widest mb-2"
        style={{ fontFamily: "'Work Sans', sans-serif" }}
      >
        {label}
      </div>
      <div className="space-y-1">
        <div className="flex justify-between">
          <span
            className="text-[#5A6A82]"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            Actual Meter
          </span>
          <span
            className="font-mono font-medium text-[#1A2A4A]"
            style={{ fontFamily: "'JetBrains Mono', monospace" }}
          >
            {actualMeter} KM
          </span>
        </div>
        {steps.map((step, idx) => (
          <div key={idx} className="flex justify-between">
            <span
              className="text-[#5A6A82]"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              {step.label}
            </span>
            <span
              className="font-mono text-[#1A2A4A]"
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
            >
              {isOpening ? '−' : '+'} {step.km} KM
            </span>
          </div>
        ))}
        <div className="border-t border-[#C8D5EB] pt-1 flex justify-between font-semibold">
          <span
            className="text-[#003087]"
            style={{ fontFamily: "'Work Sans', sans-serif" }}
          >
            Logbook {isOpening ? 'OMR' : 'CMR'}
          </span>
          <span
            className="text-[#003087]"
            style={{ fontFamily: "'JetBrains Mono', monospace" }}
          >
            {result} KM
          </span>
        </div>
      </div>
    </div>
  );
};
