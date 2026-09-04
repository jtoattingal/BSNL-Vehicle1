import React, { useState, useMemo } from 'react';
import { LogEntry, User } from '../types';
import { BsnlLogo } from './BsnlLogo';
import { MonthPicker } from './MonthPicker';
import {
  formatDateIndian,
  DEFAULT_VEHICLE_NO,
  DEFAULT_MONTHLY_ALLOWANCE,
  isMonthClosed,
  formatMonthIndian,
} from '../constants';

interface MonthlyReportViewProps {
  entries: LogEntry[];
  currentUser: User;
  logoUrl?: string;
  onBack: () => void;
  vehicleNo?: string;
  monthlyAllowance?: number;
  closedMonths?: string[];
  onCloseMonth?: (month: string) => Promise<void> | void;
  isAdmin?: boolean;
}

export const MonthlyReportView: React.FC<MonthlyReportViewProps> = ({
  entries,
  currentUser,
  logoUrl,
  onBack,
  vehicleNo = DEFAULT_VEHICLE_NO,
  monthlyAllowance = DEFAULT_MONTHLY_ALLOWANCE,
  closedMonths = [],
  onCloseMonth,
  isAdmin = false,
}) => {
  // Default to August 2026
  const [reportYear, setReportYear] = useState(2026);
  const [reportMonth, setReportMonth] = useState(7); // August 2026
  const [isClosing, setIsClosing] = useState(false);

  const reportMonthKey = `${reportYear}-${String(reportMonth + 1).padStart(2, '0')}`;
  const isClosed = isMonthClosed(reportMonthKey, closedMonths);

  const filteredEntries = useMemo(() => {
    return entries.filter((entry) => {
      return entry.date.startsWith(reportMonthKey);
    });
  }, [entries, reportMonthKey]);

  const totalUsedKm = useMemo(() => {
    return filteredEntries.reduce((acc, curr) => acc + curr.km, 0);
  }, [filteredEntries]);

  const remainingKm = Math.max(monthlyAllowance - totalUsedKm, 0);

  const startDateStr = new Date(reportYear, reportMonth, 1).toLocaleDateString(
    'en-IN',
    { day: '2-digit', month: '2-digit', year: 'numeric' }
  );
  const endDateStr = new Date(reportYear, reportMonth + 1, 0).toLocaleDateString(
    'en-IN',
    { day: '2-digit', month: '2-digit', year: 'numeric' }
  );

  async function handleCloseMonth() {
    if (!onCloseMonth) return;
    const confirmed = window.confirm(
      `Are you sure you want to close the month of ${formatMonthIndian(reportYear, reportMonth)}? Once closed, no further edits or entries can be made.`
    );
    if (!confirmed) return;

    try {
      setIsClosing(true);
      await onCloseMonth(reportMonthKey);
      alert(`Month ${formatMonthIndian(reportYear, reportMonth)} is now closed and locked.`);
    } catch (err: any) {
      alert(err?.message || 'Failed to close month');
    } finally {
      setIsClosing(false);
    }
  }

  const thClass =
    'border border-[#C8D5EB] px-2 py-2 text-[#1A2A4A] text-xs font-semibold bg-[#EEF2F9] text-center';
  const tdClass = 'border border-[#D4DEF0] px-2 py-2 text-xs text-[#1A2A4A] align-top';

  return (
    <div className="min-h-screen bg-[#EEF2F9]">
      {/* Top action bar - hidden on print */}
      <div className="bg-white border-b border-[#D4DEF0] px-4 py-3 flex items-center justify-between no-print">
        <button
          onClick={onBack}
          className="text-[#0055C8] text-sm font-medium hover:underline cursor-pointer"
          style={{ fontFamily: "'Work Sans', sans-serif" }}
        >
          ← Back
        </button>
        <div className="flex gap-2 items-center">
          <MonthPicker
            year={reportYear}
            month={reportMonth}
            onChange={(y, m) => {
              setReportYear(y);
              setReportMonth(m);
            }}
          />
          {isClosed ? (
            <span className="bg-amber-100 border border-amber-300 text-amber-900 text-xs font-bold px-2.5 py-1 rounded flex items-center gap-1">
              🔒 Month Closed
            </span>
          ) : isAdmin ? (
            <button
              onClick={handleCloseMonth}
              disabled={isClosing}
              className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold px-3 py-1.5 rounded flex items-center gap-1 transition-colors cursor-pointer"
              title="Close and lock this month (Admin only)"
            >
              {isClosing ? 'Closing...' : '🔒 Close Month'}
            </button>
          ) : (
            <span className="bg-green-100 border border-green-300 text-green-800 text-xs font-semibold px-2.5 py-1 rounded flex items-center gap-1">
              ● Month Open
            </span>
          )}
          <button
            onClick={() => window.print()}
            className="bg-[#003087] text-white text-xs font-semibold px-3 py-1.5 rounded hover:bg-[#00236A] transition-colors ml-2 cursor-pointer"
            style={{ fontFamily: "'Work Sans', sans-serif" }}
          >
            Print
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6">
        <div
          className="bg-white border border-[#D4DEF0] rounded p-6 shadow-xs"
          id="report-content"
        >
          {/* Header */}
          <div className="text-center mb-6 border-b-2 border-[#003087] pb-4">
            <div className="flex justify-center mb-2">
              <BsnlLogo logoUrl={logoUrl} />
            </div>
            <div className="flex justify-center mt-1">
              {isClosed ? (
                <span className="inline-block bg-amber-50 border border-amber-300 text-amber-900 text-xs font-bold px-3 py-0.5 rounded uppercase tracking-wider">
                  🔒 Certified & Closed Month
                </span>
              ) : (
                <span className="inline-block bg-green-50 border border-green-300 text-green-800 text-xs font-semibold px-3 py-0.5 rounded uppercase tracking-wider">
                  ● Active Month (In Progress)
                </span>
              )}
            </div>
            <h1
              className="text-[#003087] font-bold text-lg uppercase tracking-widest mt-2"
              style={{ fontFamily: "'Work Sans', sans-serif" }}
            >
              Bharat Sanchar Nigam Limited
            </h1>
            <h2
              className="text-[#1A2A4A] font-semibold text-base uppercase tracking-wider"
              style={{ fontFamily: "'Work Sans', sans-serif" }}
            >
              Vehicle Logbook Report
            </h2>
            <div className="mt-2 grid grid-cols-2 gap-4 max-w-lg mx-auto text-sm">
              <div>
                <div
                  className="text-[#8A99AE] text-xs uppercase tracking-wider"
                  style={{ fontFamily: "'Work Sans', sans-serif" }}
                >
                  Vehicle No.
                </div>
                <div
                  className="font-mono font-bold text-[#003087]"
                  style={{ fontFamily: "'JetBrains Mono', monospace" }}
                >
                  {vehicleNo}
                </div>
              </div>
              <div>
                <div
                  className="text-[#8A99AE] text-xs uppercase tracking-wider"
                  style={{ fontFamily: "'Work Sans', sans-serif" }}
                >
                  Period
                </div>
                <div
                  className="font-medium text-[#1A2A4A] text-xs"
                  style={{ fontFamily: "'Inter', sans-serif" }}
                >
                  {startDateStr} to {endDateStr}
                </div>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto mb-6">
            <table className="w-full border-collapse min-w-[800px]">
              <thead>
                <tr>
                  <th className={thClass}>Date</th>
                  <th className={thClass}>Start Station</th>
                  <th className={thClass}>Logbook OMR</th>
                  <th className={thClass}>Places Visited</th>
                  <th className={thClass}>Purpose / Details</th>
                  <th className={thClass}>End Station</th>
                  <th className={thClass}>Logbook CMR</th>
                  <th className={thClass}>KM</th>
                  <th className={thClass}>Remarks</th>
                </tr>
              </thead>
              <tbody>
                {filteredEntries.length === 0 ? (
                  <tr>
                    <td
                      colSpan={9}
                      className="text-center py-8 text-[#8A99AE] text-sm border border-[#D4DEF0]"
                    >
                      No entries for this period.
                    </td>
                  </tr>
                ) : (
                  filteredEntries.map((entry) => (
                    <tr key={entry.id}>
                      <td className={tdClass} style={{ fontFamily: "'Inter', sans-serif" }}>
                        {formatDateIndian(entry.date)}
                      </td>
                      <td className={tdClass} style={{ fontFamily: "'Inter', sans-serif" }}>
                        {entry.startStation}
                      </td>
                      <td
                        className={`${tdClass} text-center font-mono`}
                        style={{ fontFamily: "'JetBrains Mono', monospace" }}
                      >
                        {entry.logbookOMR}
                      </td>
                      <td
                        className={tdClass}
                        style={{ fontFamily: "'Inter', sans-serif", fontSize: '11px' }}
                      >
                        {entry.placesVisited}
                      </td>
                      <td
                        className={tdClass}
                        style={{ fontFamily: "'Inter', sans-serif", fontSize: '11px' }}
                      >
                        {entry.purpose}
                      </td>
                      <td className={tdClass} style={{ fontFamily: "'Inter', sans-serif" }}>
                        {entry.endStation}
                      </td>
                      <td
                        className={`${tdClass} text-center font-mono`}
                        style={{ fontFamily: "'JetBrains Mono', monospace" }}
                      >
                        {entry.logbookCMR}
                      </td>
                      <td
                        className={`${tdClass} text-center font-bold`}
                        style={{ fontFamily: "'JetBrains Mono', monospace" }}
                      >
                        {entry.km}
                      </td>
                      <td
                        className={tdClass}
                        style={{ fontFamily: "'Inter', sans-serif", fontSize: '11px' }}
                      >
                        {entry.remarks || ''}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
              <tfoot>
                <tr className="bg-[#F5F8FD]">
                  <td
                    colSpan={7}
                    className="border border-[#C8D5EB] px-2 py-2 text-xs font-bold text-right text-[#1A2A4A]"
                    style={{ fontFamily: "'Work Sans', sans-serif" }}
                  >
                    Total KM
                  </td>
                  <td
                    className="border border-[#C8D5EB] px-2 py-2 text-center font-bold text-[#003087]"
                    style={{ fontFamily: "'JetBrains Mono', monospace" }}
                  >
                    {totalUsedKm}
                  </td>
                  <td className="border border-[#C8D5EB]" />
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Stats Boxes */}
          <div className="grid grid-cols-3 gap-3 mb-8 text-sm">
            <div className="border border-[#D4DEF0] rounded p-3 text-center">
              <div
                className="text-[#8A99AE] text-xs uppercase tracking-wider mb-1"
                style={{ fontFamily: "'Work Sans', sans-serif" }}
              >
                Monthly Allowable
              </div>
              <div
                className="font-bold text-[#003087] text-xl"
                style={{ fontFamily: "'JetBrains Mono', monospace" }}
              >
                {monthlyAllowance}
              </div>
            </div>
            <div className="border border-[#D4DEF0] rounded p-3 text-center">
              <div
                className="text-[#8A99AE] text-xs uppercase tracking-wider mb-1"
                style={{ fontFamily: "'Work Sans', sans-serif" }}
              >
                Total Used
              </div>
              <div
                className="font-bold text-[#003087] text-xl"
                style={{ fontFamily: "'JetBrains Mono', monospace" }}
              >
                {totalUsedKm}
              </div>
            </div>
            <div className="border border-[#D4DEF0] rounded p-3 text-center">
              <div
                className="text-[#8A99AE] text-xs uppercase tracking-wider mb-1"
                style={{ fontFamily: "'Work Sans', sans-serif" }}
              >
                Remaining
              </div>
              <div
                className={`font-bold text-xl ${
                  remainingKm <= 0 ? 'text-red-600' : 'text-green-700'
                }`}
                style={{ fontFamily: "'JetBrains Mono', monospace" }}
              >
                {remainingKm}
              </div>
            </div>
          </div>

          {/* Signatures */}
          <div className="grid grid-cols-2 gap-8 mt-8 pt-6 border-t border-[#D4DEF0]">
            <div>
              <div className="h-10 border-b border-[#1A2A4A] mb-1" />
              <div
                className="text-xs text-[#5A6A82]"
                style={{ fontFamily: "'Work Sans', sans-serif" }}
              >
                Prepared by
              </div>
              <div
                className="text-xs font-medium text-[#1A2A4A]"
                style={{ fontFamily: "'Inter', sans-serif" }}
              >
                {currentUser.name}
              </div>
            </div>
            <div>
              <div className="h-10 border-b border-[#1A2A4A] mb-1" />
              <div
                className="text-xs text-[#5A6A82]"
                style={{ fontFamily: "'Work Sans', sans-serif" }}
              >
                Checked by
              </div>
              <div
                className="text-xs font-medium text-[#1A2A4A]"
                style={{ fontFamily: "'Inter', sans-serif" }}
              >
                AGM (Network), Attingal
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
