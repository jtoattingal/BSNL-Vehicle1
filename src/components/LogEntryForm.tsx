import React, { useState } from 'react';
import { LogEntry, User } from '../types';
import { calculateLogbookOMR, calculateLogbookCMR, isMonthClosed, formatMonthYear } from '../constants';
import { MeterBreakdown } from './MeterBreakdown';

interface LogEntryFormProps {
  currentUser: User;
  onSave: (entry: LogEntry) => Promise<boolean | void> | boolean | void;
  onCancel: () => void;
  editEntry?: LogEntry;
  startDate?: string;
  closedMonths?: string[];
}

export const LogEntryForm: React.FC<LogEntryFormProps> = ({
  currentUser,
  onSave,
  onCancel,
  editEntry,
  startDate = '2026-08-01',
  closedMonths = [],
}) => {
  // Default to 2026-08-01 if today is before start date, otherwise editEntry date or start date
  const minDate = startDate || '2026-08-01';
  const initialDate = editEntry?.date || minDate;

  const [date, setDate] = useState(initialDate);
  const [startTime, setStartTime] = useState(editEntry?.startTime || '09:00');
  const [startStation, setStartStation] = useState(editEntry?.startStation || 'Attingal');
  const [actualOMR, setActualOMR] = useState(editEntry?.actualOMR?.toString() || '');
  const [placesVisited, setPlacesVisited] = useState(editEntry?.placesVisited || '');
  const [purpose, setPurpose] = useState(editEntry?.purpose || '');
  const [endStation, setEndStation] = useState(editEntry?.endStation || 'Attingal');
  const [actualCMR, setActualCMR] = useState(editEntry?.actualCMR?.toString() || '');
  const [remarks, setRemarks] = useState(editEntry?.remarks || '');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const numOMR = parseFloat(actualOMR);
  const numCMR = parseFloat(actualCMR);

  const calcOMR = isNaN(numOMR) ? null : calculateLogbookOMR(numOMR, startStation);
  const calcCMR = isNaN(numCMR) ? null : calculateLogbookCMR(numCMR, endStation);
  const totalKM = calcOMR !== null && calcCMR !== null ? calcCMR - calcOMR : null;

  const dateMonthKey = date.slice(0, 7);
  const isSelectedMonthClosed = isMonthClosed(date, closedMonths);

  async function handleSubmit() {
    setErrorMessage('');
    if (!date || !startTime || !actualOMR || !placesVisited.trim() || !purpose.trim() || !actualCMR) {
      setErrorMessage('Please fill in all required fields.');
      return;
    }

    if (date < minDate) {
      setErrorMessage(`Entry date cannot be earlier than ${minDate.split('-').reverse().join('.')} (Logbook start date).`);
      return;
    }

    if (isSelectedMonthClosed) {
      setErrorMessage(`Month ${dateMonthKey} is closed and locked. No entries can be added or edited.`);
      return;
    }

    if (isNaN(numOMR) || isNaN(numCMR)) {
      setErrorMessage('Meter readings must be valid numbers.');
      return;
    }
    if (numCMR <= numOMR) {
      setErrorMessage('Closing meter must be greater than opening meter.');
      return;
    }

    const finalLogbookOMR = calculateLogbookOMR(numOMR, startStation);
    const finalLogbookCMR = calculateLogbookCMR(numCMR, endStation);
    const tripKm = finalLogbookCMR - finalLogbookOMR;

    const entryToSave: LogEntry = {
      id: editEntry?.id || Date.now().toString(),
      date,
      startTime,
      startStation,
      actualOMR: numOMR,
      logbookOMR: finalLogbookOMR,
      placesVisited: placesVisited.trim(),
      purpose: purpose.trim(),
      endStation,
      actualCMR: numCMR,
      logbookCMR: finalLogbookCMR,
      km: tripKm,
      remarks: remarks.trim(),
      user: currentUser.username,
    };

    try {
      setIsSubmitting(true);
      await onSave(entryToSave);
      setSavedSuccess(true);
      setTimeout(() => {
        onCancel();
      }, 1200);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to save entry. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  const labelClass =
    'block text-[#5A6A82] text-xs font-medium mb-1 uppercase tracking-wider font-work';
  const inputClass =
    'w-full border border-[#C8D5EB] rounded px-3 py-2 text-sm text-[#1A2A4A] focus:outline-none focus:border-[#003087] focus:ring-1 focus:ring-[#003087]';

  return (
    <div className="bg-[#EEF2F9] min-h-screen">
      <div className="bg-white border-b border-[#D4DEF0] px-4 py-3 flex items-center justify-between">
        <h2
          className="text-[#003087] font-bold text-base"
          style={{ fontFamily: "'Work Sans', sans-serif" }}
        >
          {editEntry ? 'Edit Log Entry' : 'New Log Entry'}
        </h2>
        <button
          onClick={onCancel}
          className="text-[#5A6A82] text-sm hover:text-[#003087] cursor-pointer"
          style={{ fontFamily: "'Inter', sans-serif" }}
        >
          ✕ Cancel
        </button>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-5 space-y-4">
        {savedSuccess && (
          <div
            className="bg-green-50 border border-green-200 rounded p-3 text-green-700 text-sm font-medium text-center"
            style={{ fontFamily: "'Work Sans', sans-serif" }}
          >
            ✓ Logbook entry saved successfully.
          </div>
        )}

        {errorMessage && (
          <div
            className="bg-red-50 border border-red-200 rounded p-3 text-red-600 text-sm"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            {errorMessage}
          </div>
        )}

        {isSelectedMonthClosed && (
          <div
            className="bg-amber-50 border border-amber-300 rounded p-3.5 text-amber-800 text-sm flex items-start gap-2.5"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            <span className="text-lg leading-none">🔒</span>
            <div>
              <div className="font-semibold text-amber-900">Month Closed & Locked</div>
              <div className="text-xs text-amber-700 mt-0.5">
                The month of {formatMonthYear(date)} is already closed and finalized. Entries cannot be added or edited for a closed month.
              </div>
            </div>
          </div>
        )}

        {/* Journey Start */}
        <div className="bg-white border border-[#D4DEF0] rounded p-4 space-y-3">
          <h3
            className="text-[#003087] font-semibold text-xs uppercase tracking-widest border-b border-[#EEF2F9] pb-2"
            style={{ fontFamily: "'Work Sans', sans-serif" }}
          >
            Journey Start
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Date (From 01.08.2026) *</label>
              <input
                type="date"
                min={minDate}
                className={inputClass}
                style={{ fontFamily: "'Inter', sans-serif" }}
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
              <span className="text-[11px] text-[#8A99AE] block mt-0.5">Start: 01.08.2026</span>
            </div>
            <div>
              <label className={labelClass}>Start Time *</label>
              <input
                type="time"
                className={inputClass}
                style={{ fontFamily: "'Inter', sans-serif" }}
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className={labelClass}>Starting Station *</label>
            <select
              className={inputClass}
              style={{ fontFamily: "'Inter', sans-serif" }}
              value={startStation}
              onChange={(e) => setStartStation(e.target.value)}
            >
              <option value="Attingal">Attingal</option>
              <option value="Kallambalam">Kallambalam</option>
              <option value="Kilimanoor">Kilimanoor</option>
            </select>
          </div>

          <div>
            <label className={labelClass}>Actual Opening Meter Reading (KM) *</label>
            <input
              type="number"
              className={`${inputClass} font-mono`}
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
              value={actualOMR}
              onChange={(e) => setActualOMR(e.target.value)}
              placeholder="e.g. 12340"
            />
          </div>

          {!isNaN(numOMR) && actualOMR && (
            <MeterBreakdown
              label="Opening Calculation"
              actualMeter={numOMR}
              station={startStation}
              isOpening={true}
            />
          )}
        </div>

        {/* Journey Details */}
        <div className="bg-white border border-[#D4DEF0] rounded p-4 space-y-3">
          <h3
            className="text-[#003087] font-semibold text-xs uppercase tracking-widest border-b border-[#EEF2F9] pb-2"
            style={{ fontFamily: "'Work Sans', sans-serif" }}
          >
            Journey Details
          </h3>
          <div>
            <label className={labelClass}>Places Visited *</label>
            <textarea
              className={`${inputClass} resize-none`}
              style={{ fontFamily: "'Inter', sans-serif" }}
              rows={2}
              value={placesVisited}
              onChange={(e) => setPlacesVisited(e.target.value)}
              placeholder="e.g. Attingal, Varkala, Kallambalam, Chirayinkeezhu"
            />
          </div>
          <div>
            <label className={labelClass}>Purpose / Details *</label>
            <textarea
              className={`${inputClass} resize-none`}
              style={{ fontFamily: "'Inter', sans-serif" }}
              rows={3}
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              placeholder="e.g. Site inspection, battery reading, BTS maintenance, office work"
            />
          </div>
        </div>

        {/* Journey End */}
        <div className="bg-white border border-[#D4DEF0] rounded p-4 space-y-3">
          <h3
            className="text-[#003087] font-semibold text-xs uppercase tracking-widest border-b border-[#EEF2F9] pb-2"
            style={{ fontFamily: "'Work Sans', sans-serif" }}
          >
            Journey End
          </h3>
          <div>
            <label className={labelClass}>Ending Station *</label>
            <select
              className={inputClass}
              style={{ fontFamily: "'Inter', sans-serif" }}
              value={endStation}
              onChange={(e) => setEndStation(e.target.value)}
            >
              <option value="Attingal">Attingal</option>
              <option value="Kallambalam">Kallambalam</option>
              <option value="Kilimanoor">Kilimanoor</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Actual Closing Meter Reading (KM) *</label>
            <input
              type="number"
              className={`${inputClass} font-mono`}
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
              value={actualCMR}
              onChange={(e) => setActualCMR(e.target.value)}
              placeholder="e.g. 12412"
            />
          </div>

          {!isNaN(numCMR) && actualCMR && (
            <MeterBreakdown
              label="Closing Calculation"
              actualMeter={numCMR}
              station={endStation}
              isOpening={false}
            />
          )}

          {totalKM !== null && (
            <div className="bg-[#003087] text-white rounded p-3 flex justify-between items-center">
              <span
                className="text-sm font-semibold"
                style={{ fontFamily: "'Work Sans', sans-serif" }}
              >
                Logbook KM for this Trip
              </span>
              <span
                className={`text-2xl font-bold ${
                  totalKM < 0 ? 'text-red-300' : 'text-white'
                }`}
                style={{ fontFamily: "'JetBrains Mono', monospace" }}
              >
                {totalKM < 0 ? `⚠ ${totalKM}` : `${totalKM} KM`}
              </span>
            </div>
          )}

          <div>
            <label className={labelClass}>Remarks</label>
            <textarea
              className={`${inputClass} resize-none`}
              style={{ fontFamily: "'Inter', sans-serif" }}
              rows={2}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="Optional remarks or notes"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pb-8">
          <button
            onClick={handleSubmit}
            disabled={isSelectedMonthClosed || isSubmitting}
            className={`flex-1 font-semibold py-3 rounded text-sm transition-colors cursor-pointer flex items-center justify-center gap-2 ${
              isSelectedMonthClosed
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-[#003087] hover:bg-[#00236A] text-white'
            }`}
            style={{ fontFamily: "'Work Sans', sans-serif" }}
          >
            {isSelectedMonthClosed ? '🔒 Month Closed (Save Disabled)' : isSubmitting ? 'Saving...' : 'Save Log Entry'}
          </button>
          <button
            onClick={onCancel}
            className="px-6 border border-[#C8D5EB] text-[#5A6A82] hover:border-[#003087] hover:text-[#003087] font-medium py-3 rounded text-sm transition-colors cursor-pointer"
            style={{ fontFamily: "'Work Sans', sans-serif" }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
