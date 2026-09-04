import React, { useState, useMemo } from 'react';
import { LogEntry, User } from '../types';
import { BsnlLogo } from './BsnlLogo';
import { KmProgress } from './KmProgress';
import { MonthPicker } from './MonthPicker';
import { LogEntriesTable } from './LogEntriesTable';
import { formatMonthIndian, DEFAULT_VEHICLE_NO, isMonthClosed } from '../constants';

interface UserDashboardProps {
  currentUser: User;
  entries: LogEntry[];
  onNewEntry: (selectedMonthKey: string) => void;
  onEditEntry?: (entry: LogEntry) => void;
  onReport: () => void;
  onLogout: () => void;
  logoUrl?: string;
  vehicleNo?: string;
  closedMonths?: string[];
}

export const UserDashboard: React.FC<UserDashboardProps> = ({
  currentUser,
  entries,
  onNewEntry,
  onEditEntry,
  onReport,
  onLogout,
  logoUrl,
  vehicleNo = DEFAULT_VEHICLE_NO,
  closedMonths = [],
}) => {
  // Start from August 2026 as requested
  const [selectedYear, setSelectedYear] = useState(2026);
  const [selectedMonth, setSelectedMonth] = useState(7); // 7 = August (0-indexed)

  // Password change state
  const [showPasswordBox, setShowPasswordBox] = useState(false);
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [pwMessage, setPwMessage] = useState('');

  const currentMonthKey = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}`;
  const isCurrentMonthClosed = isMonthClosed(currentMonthKey, closedMonths);

  // Filter entries for the chosen month
  const monthlyEntries = useMemo(() => {
    return entries.filter((entry) => {
      return entry.date.startsWith(currentMonthKey);
    });
  }, [entries, currentMonthKey]);

  const totalUsedKm = useMemo(() => {
    return monthlyEntries.reduce((acc, curr) => acc + curr.km, 0);
  }, [monthlyEntries]);

  async function handlePasswordChange() {
    if (!currentPw || !newPw) {
      setPwMessage('Please provide both current and new password.');
      return;
    }
    if (newPw.length < 4) {
      setPwMessage('New password too short.');
      return;
    }

    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: currentUser.username,
          currentPassword: currentPw,
          newPassword: newPw,
          isAdmin: false,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setPwMessage(data.error || 'Password update failed.');
      } else {
        setPwMessage('✓ Password saved successfully.');
        setCurrentPw('');
        setNewPw('');
      }
    } catch {
      setPwMessage('Connection error.');
    }
  }

  return (
    <div className="min-h-screen bg-[#EEF2F9]">
      <header className="bg-white border-b border-[#D4DEF0] px-4 py-3">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <BsnlLogo logoUrl={logoUrl} />
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <div
                className="text-[#003087] font-semibold text-xs"
                style={{ fontFamily: "'JetBrains Mono', monospace" }}
              >
                {vehicleNo}
              </div>
              <div
                className="text-[#5A6A82] text-xs"
                style={{ fontFamily: "'Inter', sans-serif" }}
              >
                {currentUser.name}
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={onReport}
                className="text-[#0055C8] text-xs font-medium px-2.5 py-1.5 rounded border border-[#C8D5EB] hover:border-[#003087] transition-colors cursor-pointer"
                style={{ fontFamily: "'Work Sans', sans-serif" }}
              >
                Monthly Report
              </button>
              <button
                onClick={() => setShowPasswordBox(!showPasswordBox)}
                className="text-[#5A6A82] text-xs px-2.5 py-1.5 rounded border border-[#C8D5EB] hover:border-[#003087] hover:text-[#003087] transition-colors cursor-pointer"
                style={{ fontFamily: "'Work Sans', sans-serif" }}
              >
                Password
              </button>
              <button
                onClick={onLogout}
                className="text-[#5A6A82] text-xs px-2.5 py-1.5 rounded border border-[#C8D5EB] hover:border-[#003087] hover:text-[#003087] transition-colors cursor-pointer"
                style={{ fontFamily: "'Work Sans', sans-serif" }}
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-5 space-y-4">
        <div className="sm:hidden text-center">
          <div
            className="text-[#003087] font-semibold text-sm"
            style={{ fontFamily: "'JetBrains Mono', monospace" }}
          >
            {vehicleNo}
          </div>
          <div
            className="text-[#5A6A82] text-xs"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            {currentUser.name}
          </div>
        </div>

        {/* Change password modal/inline drawer */}
        {showPasswordBox && (
          <div className="bg-white border border-[#D4DEF0] rounded p-4 space-y-3">
            <div className="flex justify-between items-center">
              <h3
                className="font-semibold text-sm text-[#003087]"
                style={{ fontFamily: "'Work Sans', sans-serif" }}
              >
                Change Password
              </h3>
              <button
                onClick={() => setShowPasswordBox(false)}
                className="text-[#8A99AE] hover:text-[#1A2A4A] text-xs"
              >
                ✕ Close
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input
                type="password"
                className="border border-[#C8D5EB] rounded px-3 py-2 text-sm focus:outline-none focus:border-[#003087]"
                placeholder="Current password"
                value={currentPw}
                onChange={(e) => setCurrentPw(e.target.value)}
                style={{ fontFamily: "'Inter', sans-serif" }}
              />
              <input
                type="password"
                className="border border-[#C8D5EB] rounded px-3 py-2 text-sm focus:outline-none focus:border-[#003087]"
                placeholder="New password"
                value={newPw}
                onChange={(e) => setNewPw(e.target.value)}
                style={{ fontFamily: "'Inter', sans-serif" }}
              />
            </div>
            {pwMessage && (
              <p
                className="text-xs font-medium"
                style={{
                  fontFamily: "'Inter', sans-serif",
                  color: pwMessage.startsWith('✓') ? 'green' : 'red',
                }}
              >
                {pwMessage}
              </p>
            )}
            <button
              onClick={handlePasswordChange}
              className="bg-[#003087] text-white text-xs font-semibold px-4 py-2 rounded hover:bg-[#00236A] transition-colors cursor-pointer"
              style={{ fontFamily: "'Work Sans', sans-serif" }}
            >
              Save New Password
            </button>
          </div>
        )}

        {/* Monthly KM Status & Month Closing Status */}
        <div className="bg-white border border-[#D4DEF0] rounded p-4 space-y-3">
          <div className="flex items-center justify-between mb-1 flex-wrap gap-2">
            <div className="flex items-center gap-3">
              <h2
                className="text-[#003087] font-bold text-sm uppercase tracking-wider"
                style={{ fontFamily: "'Work Sans', sans-serif" }}
              >
                Monthly KM Status
              </h2>
              {isCurrentMonthClosed ? (
                <span className="bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold px-2.5 py-0.5 rounded flex items-center gap-1">
                  🔒 Month Closed
                </span>
              ) : (
                <span className="bg-green-100 text-green-800 border border-green-300 text-xs font-bold px-2.5 py-0.5 rounded flex items-center gap-1">
                  ● Month Open
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <MonthPicker
                year={selectedYear}
                month={selectedMonth}
                onChange={(y, m) => {
                  setSelectedYear(y);
                  setSelectedMonth(m);
                }}
              />
              {isCurrentMonthClosed && (
                <span className="text-xs text-amber-800 font-semibold bg-amber-50 px-2 py-1 rounded border border-amber-200">
                  🔒 Closed (Admin Only)
                </span>
              )}
            </div>
          </div>

          <KmProgress used={totalUsedKm} />
        </div>

        {/* New Log Entry Button */}
        {isCurrentMonthClosed ? (
          <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded p-3 text-center text-xs font-medium">
            🔒 {formatMonthIndian(selectedYear, selectedMonth)} is closed and locked by Administrator. Adding or editing entries for this month is not allowed for users.
          </div>
        ) : (
          <button
            onClick={() => onNewEntry(currentMonthKey)}
            className="w-full bg-[#003087] hover:bg-[#00236A] text-white font-bold py-3 rounded text-sm flex items-center justify-center gap-2 transition-colors shadow-xs cursor-pointer"
            style={{ fontFamily: "'Work Sans', sans-serif" }}
          >
            <span className="text-lg font-light leading-none">+</span> New Log Entry for {formatMonthIndian(selectedYear, selectedMonth)}
          </button>
        )}

        {/* Monthly Logbook Table Card */}
        <div className="bg-white border border-[#D4DEF0] rounded overflow-hidden">
          <div className="px-4 py-3 border-b border-[#EEF2F9] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2
                className="text-[#003087] font-bold text-sm uppercase tracking-wider"
                style={{ fontFamily: "'Work Sans', sans-serif" }}
              >
                Monthly Logbook — {formatMonthIndian(selectedYear, selectedMonth)}
              </h2>
              {isCurrentMonthClosed && (
                <span className="text-[11px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-semibold">
                  Sealed
                </span>
              )}
            </div>
            <span
              className="text-[#8A99AE] text-xs"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              {monthlyEntries.length} entries
            </span>
          </div>
          <LogEntriesTable
            entries={monthlyEntries}
            closedMonths={closedMonths}
            onEdit={isCurrentMonthClosed ? undefined : onEditEntry}
          />
        </div>
      </div>
    </div>
  );
};
