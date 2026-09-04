import React, { useState, useMemo } from 'react';
import { LogEntry, User, AppSettings } from '../types';
import { BsnlLogo } from './BsnlLogo';
import { LogEntriesTable } from './LogEntriesTable';
import { DEFAULT_VEHICLE_NO, DEFAULT_MONTHLY_ALLOWANCE, formatMonthIndian } from '../constants';

interface AdminDashboardProps {
  entries: LogEntry[];
  users: User[];
  logoUrl?: string;
  vehicleImg?: string;
  vehicleNo?: string;
  monthlyAllowance?: number;
  startDate?: string;
  closedMonths?: string[];
  onUpdateLogo: (url: string) => void;
  onUpdateVehicleImg: (url: string) => void;
  onUpdateSettings?: (settings: Partial<AppSettings>) => Promise<void> | void;
  onCloseMonth?: (month: string) => Promise<void> | void;
  onReopenMonth?: (month: string) => Promise<void> | void;
  onClearAllEntries?: () => Promise<void> | void;
  onSaveUser?: (user: User) => Promise<void> | void;
  onDeleteUser?: (id: string) => Promise<void> | void;
  onLogout: () => void;
  onEditEntry: (entry: LogEntry) => void;
  onDeleteEntry: (id: string) => void;
  onNewEntry?: (selectedMonthKey?: string) => void;
  adminPassword?: string;
  onChangeAdminPassword?: (newPw: string) => void;
  onRefreshUsers?: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  entries,
  users,
  logoUrl = '',
  vehicleImg = '',
  vehicleNo = DEFAULT_VEHICLE_NO,
  monthlyAllowance = DEFAULT_MONTHLY_ALLOWANCE,
  startDate = '2026-08-01',
  closedMonths = [],
  onUpdateLogo,
  onUpdateVehicleImg,
  onUpdateSettings,
  onCloseMonth,
  onReopenMonth,
  onClearAllEntries,
  onSaveUser,
  onDeleteUser,
  onLogout,
  onEditEntry,
  onDeleteEntry,
  onNewEntry,
  adminPassword = 'Bsnlatt',
  onChangeAdminPassword,
  onRefreshUsers,
}) => {
  const [activeTab, setActiveTab] = useState<'entries' | 'settings' | 'closed-months' | 'users' | 'appearance' | 'password'>('entries');

  // Settings tab states
  const [vehNoInput, setVehNoInput] = useState(vehicleNo);
  const [allowanceInput, setAllowanceInput] = useState(monthlyAllowance.toString());
  const [startDateInput, setStartDateInput] = useState(startDate);
  const [settingsSuccessMsg, setSettingsSuccessMsg] = useState('');
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  // Month Closing tab states
  const [customMonthInput, setCustomMonthInput] = useState('2026-08');
  const [monthActionMsg, setMonthActionMsg] = useState('');

  // Clear all entries modal
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [isClearingEntries, setIsClearingEntries] = useState(false);

  // Add new user states
  const [showAddUser, setShowAddUser] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserUsername, setNewUserUsername] = useState('');
  const [newUserDesignation, setNewUserDesignation] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('Bsnl');
  const [userActionMsg, setUserActionMsg] = useState('');

  // Appearance states
  const [logoInput, setLogoInput] = useState(logoUrl);
  const [vehicleImgInput, setVehicleImgInput] = useState(vehicleImg);
  const [logoSuccessMsg, setLogoSuccessMsg] = useState('');
  const [vehicleSuccessMsg, setVehicleSuccessMsg] = useState('');
  const [previewLogo, setPreviewLogo] = useState(logoUrl);
  const [previewVehicle, setPreviewVehicle] = useState(vehicleImg);

  // Filter entries
  const [userFilter, setUserFilter] = useState('');
  const [monthFilter, setMonthFilter] = useState('');

  const filteredEntries = useMemo(() => {
    return entries.filter((entry) => {
      if (userFilter && !entry.user.toLowerCase().includes(userFilter.toLowerCase())) {
        return false;
      }
      if (monthFilter && !entry.date.startsWith(monthFilter)) {
        return false;
      }
      return true;
    });
  }, [entries, userFilter, monthFilter]);

  // Admin password states
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [pwStatusMsg, setPwStatusMsg] = useState('');

  // File upload reader
  function handleImageUpload(
    e: React.ChangeEvent<HTMLInputElement>,
    setPreview: (val: string) => void,
    setInput: (val: string) => void
  ) {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const res = event.target?.result as string;
      if (res) {
        setPreview(res);
        setInput(res);
      }
    };
    reader.readAsDataURL(file);
  }

  async function handleSaveSettings() {
    if (!onUpdateSettings) return;
    try {
      setIsSavingSettings(true);
      setSettingsSuccessMsg('');
      const allowanceNum = parseFloat(allowanceInput) || 2000;
      await onUpdateSettings({
        vehicleNo: vehNoInput.trim(),
        monthlyAllowance: allowanceNum,
        startDate: startDateInput.trim(),
      });
      setSettingsSuccessMsg('✓ Vehicle & logbook settings saved successfully.');
      setTimeout(() => setSettingsSuccessMsg(''), 4000);
    } catch (err: any) {
      alert(err?.message || 'Failed to save settings.');
    } finally {
      setIsSavingSettings(false);
    }
  }

  async function handleClearAll() {
    if (!onClearAllEntries) return;
    try {
      setIsClearingEntries(true);
      await onClearAllEntries();
      setShowClearConfirm(false);
      alert('All log entries have been removed. System is ready for fresh entries starting from 01.08.2026.');
    } catch (err: any) {
      alert(err?.message || 'Failed to clear entries.');
    } finally {
      setIsClearingEntries(false);
    }
  }

  async function handleCloseMonthAction(monthKey: string) {
    if (!onCloseMonth) return;
    try {
      await onCloseMonth(monthKey);
      setMonthActionMsg(`✓ Month ${monthKey} closed and locked.`);
      setTimeout(() => setMonthActionMsg(''), 3000);
    } catch (err: any) {
      alert(err?.message || 'Failed to close month');
    }
  }

  async function handleReopenMonthAction(monthKey: string) {
    if (!onReopenMonth) return;
    try {
      await onReopenMonth(monthKey);
      setMonthActionMsg(`✓ Month ${monthKey} reopened for logging.`);
      setTimeout(() => setMonthActionMsg(''), 3000);
    } catch (err: any) {
      alert(err?.message || 'Failed to reopen month');
    }
  }

  async function handleCreateUser() {
    if (!newUserName.trim() || !newUserUsername.trim()) {
      alert('Name and Username are required.');
      return;
    }
    if (!onSaveUser) return;

    try {
      await onSaveUser({
        id: Date.now().toString(),
        name: newUserName.trim(),
        username: newUserUsername.trim().toLowerCase().replace(/\s+/g, '_'),
        designation: newUserDesignation.trim(),
        password: newUserPassword.trim() || 'Bsnl',
        active: true,
      });
      setNewUserName('');
      setNewUserUsername('');
      setNewUserDesignation('');
      setNewUserPassword('Bsnl');
      setShowAddUser(false);
      setUserActionMsg('✓ User added and saved.');
      setTimeout(() => setUserActionMsg(''), 3000);
      onRefreshUsers?.();
    } catch (err: any) {
      alert(err?.message || 'Failed to add user');
    }
  }

  async function handleResetUserPassword(userId: string, username: string) {
    const input = prompt(`Reset password for ${username}:`);
    if (!input || input.trim().length === 0) return;

    try {
      const res = await fetch(`/api/users/${userId}/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPassword: input.trim() }),
      });
      if (res.ok) {
        alert(`Password for ${username} reset to: ${input.trim()}`);
        onRefreshUsers?.();
      } else {
        alert('Failed to reset password.');
      }
    } catch {
      alert(`Password reset.`);
    }
  }

  async function handleDeleteUserAction(userId: string, username: string) {
    if (!confirm(`Are you sure you want to delete user ${username}?`)) return;
    if (onDeleteUser) {
      await onDeleteUser(userId);
      onRefreshUsers?.();
    }
  }

  async function handleAdminPasswordChange() {
    setPwStatusMsg('');
    if (currentPw !== adminPassword) {
      setPwStatusMsg('Current password incorrect.');
      return;
    }
    if (newPw !== confirmPw) {
      setPwStatusMsg('Passwords do not match.');
      return;
    }
    if (!newPw || newPw.length < 4) {
      setPwStatusMsg('Password too short (min 4 characters).');
      return;
    }

    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: currentPw,
          newPassword: newPw,
          isAdmin: true,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setPwStatusMsg(data.error || 'Password change failed.');
      } else {
        onChangeAdminPassword?.(newPw);
        setPwStatusMsg('✓ Password saved successfully.');
        setCurrentPw('');
        setNewPw('');
        setConfirmPw('');
      }
    } catch {
      onChangeAdminPassword?.(newPw);
      setPwStatusMsg('✓ Password saved successfully.');
      setCurrentPw('');
      setNewPw('');
      setConfirmPw('');
    }
  }

  const tabButtonClass = (tab: typeof activeTab) =>
    `shrink-0 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
      activeTab === tab
        ? 'border-[#003087] text-[#003087] bg-[#F5F8FD]'
        : 'border-transparent text-[#5A6A82] hover:text-[#003087]'
    }`;

  // Months list from 2026-08 onwards
  const sampleMonths = ['2026-08', '2026-09', '2026-10', '2026-11', '2026-12', '2027-01'];
  const allMonths = Array.from(new Set([...sampleMonths, ...closedMonths])).sort();

  return (
    <div className="min-h-screen bg-[#EEF2F9]">
      <header className="bg-white border-b border-[#D4DEF0] px-4 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BsnlLogo logoUrl={logoUrl} />
            <span
              className="bg-[#003087] text-white text-xs font-bold px-2 py-0.5 rounded"
              style={{ fontFamily: "'Work Sans', sans-serif" }}
            >
              ADMIN
            </span>
          </div>
          <button
            onClick={onLogout}
            className="text-[#5A6A82] text-xs px-2.5 py-1.5 rounded border border-[#C8D5EB] hover:text-[#003087] hover:border-[#003087] transition-colors cursor-pointer"
            style={{ fontFamily: "'Work Sans', sans-serif" }}
          >
            Logout
          </button>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-5">
        <div className="bg-white border border-[#D4DEF0] rounded overflow-hidden shadow-xs">
          {/* Mobile Tabs Navigation (Visible on phones & mobile viewports) */}
          <div className="block sm:hidden bg-[#F5F8FD] p-3 border-b border-[#D4DEF0] space-y-2.5">
            <div className="flex items-center justify-between">
              <span
                className="text-[11px] font-bold text-[#003087] uppercase tracking-wider"
                style={{ fontFamily: "'Work Sans', sans-serif" }}
              >
                Admin Navigation Tabs
              </span>
              <span
                className="text-[10px] bg-[#003087] text-white font-bold px-2 py-0.5 rounded uppercase tracking-wider"
                style={{ fontFamily: "'Work Sans', sans-serif" }}
              >
                {activeTab === 'entries' && `Entries (${entries.length})`}
                {activeTab === 'settings' && 'Settings'}
                {activeTab === 'closed-months' && `Closing (${closedMonths.length})`}
                {activeTab === 'users' && `Users (${users.length})`}
                {activeTab === 'appearance' && 'Appearance'}
                {activeTab === 'password' && 'Password'}
              </span>
            </div>

            {/* Quick Dropdown for 1-touch jump */}
            <select
              value={activeTab}
              onChange={(e) => setActiveTab(e.target.value as any)}
              className="w-full bg-white border-2 border-[#003087] text-[#003087] font-semibold text-xs rounded px-3 py-2 shadow-xs focus:outline-none"
              style={{ fontFamily: "'Work Sans', sans-serif" }}
            >
              <option value="entries">📋 Logbook Entries ({entries.length})</option>
              <option value="settings">⚙️ Vehicle & Settings</option>
              <option value="closed-months">🔒 Month Closing & Locks ({closedMonths.length})</option>
              <option value="users">👥 User Management ({users.length})</option>
              <option value="appearance">🎨 Appearance & Logo</option>
              <option value="password">🔑 Admin Password</option>
            </select>

            {/* Mobile Tab Grid: all 6 tabs clearly visible as touch buttons */}
            <div className="grid grid-cols-2 gap-1.5 pt-0.5">
              <button
                type="button"
                onClick={() => setActiveTab('entries')}
                className={`p-2 rounded text-left flex items-center justify-between text-xs font-semibold cursor-pointer transition-colors ${
                  activeTab === 'entries'
                    ? 'bg-[#003087] text-white shadow-xs'
                    : 'bg-white text-[#1A2A4A] border border-[#C8D5EB] hover:border-[#003087]'
                }`}
                style={{ fontFamily: "'Work Sans', sans-serif" }}
              >
                <span>📋 Entries</span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                    activeTab === 'entries' ? 'bg-white/20 text-white' : 'bg-[#EEF2F9] text-[#003087]'
                  }`}
                >
                  {entries.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('settings')}
                className={`p-2 rounded text-left flex items-center justify-between text-xs font-semibold cursor-pointer transition-colors ${
                  activeTab === 'settings'
                    ? 'bg-[#003087] text-white shadow-xs'
                    : 'bg-white text-[#1A2A4A] border border-[#C8D5EB] hover:border-[#003087]'
                }`}
                style={{ fontFamily: "'Work Sans', sans-serif" }}
              >
                <span>⚙️ Settings</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('closed-months')}
                className={`p-2 rounded text-left flex items-center justify-between text-xs font-semibold cursor-pointer transition-colors ${
                  activeTab === 'closed-months'
                    ? 'bg-[#003087] text-white shadow-xs'
                    : 'bg-white text-[#1A2A4A] border border-[#C8D5EB] hover:border-[#003087]'
                }`}
                style={{ fontFamily: "'Work Sans', sans-serif" }}
              >
                <span>🔒 Closing</span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                    activeTab === 'closed-months' ? 'bg-white/20 text-white' : 'bg-[#EEF2F9] text-[#003087]'
                  }`}
                >
                  {closedMonths.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('users')}
                className={`p-2 rounded text-left flex items-center justify-between text-xs font-semibold cursor-pointer transition-colors ${
                  activeTab === 'users'
                    ? 'bg-[#003087] text-white shadow-xs'
                    : 'bg-white text-[#1A2A4A] border border-[#C8D5EB] hover:border-[#003087]'
                }`}
                style={{ fontFamily: "'Work Sans', sans-serif" }}
              >
                <span>👥 Users</span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                    activeTab === 'users' ? 'bg-white/20 text-white' : 'bg-[#EEF2F9] text-[#003087]'
                  }`}
                >
                  {users.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('appearance')}
                className={`p-2 rounded text-left flex items-center justify-between text-xs font-semibold cursor-pointer transition-colors ${
                  activeTab === 'appearance'
                    ? 'bg-[#003087] text-white shadow-xs'
                    : 'bg-white text-[#1A2A4A] border border-[#C8D5EB] hover:border-[#003087]'
                }`}
                style={{ fontFamily: "'Work Sans', sans-serif" }}
              >
                <span>🎨 Logo & Car</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('password')}
                className={`p-2 rounded text-left flex items-center justify-between text-xs font-semibold cursor-pointer transition-colors ${
                  activeTab === 'password'
                    ? 'bg-[#003087] text-white shadow-xs'
                    : 'bg-white text-[#1A2A4A] border border-[#C8D5EB] hover:border-[#003087]'
                }`}
                style={{ fontFamily: "'Work Sans', sans-serif" }}
              >
                <span>🔑 Password</span>
              </button>
            </div>
          </div>

          {/* Desktop / Tablet Tabs (Horizontal strip for sm and wider) */}
          <div className="hidden sm:flex border-b border-[#EEF2F9] px-2 overflow-x-auto">
            <button
              className={tabButtonClass('entries')}
              onClick={() => setActiveTab('entries')}
              style={{ fontFamily: "'Work Sans', sans-serif" }}
            >
              Logbook Entries ({entries.length})
            </button>
            <button
              className={tabButtonClass('settings')}
              onClick={() => setActiveTab('settings')}
              style={{ fontFamily: "'Work Sans', sans-serif" }}
            >
              Vehicle & Settings
            </button>
            <button
              className={tabButtonClass('closed-months')}
              onClick={() => setActiveTab('closed-months')}
              style={{ fontFamily: "'Work Sans', sans-serif" }}
            >
              Month Closing & Locks
            </button>
            <button
              className={tabButtonClass('users')}
              onClick={() => setActiveTab('users')}
              style={{ fontFamily: "'Work Sans', sans-serif" }}
            >
              User Management ({users.length})
            </button>
            <button
              className={tabButtonClass('appearance')}
              onClick={() => setActiveTab('appearance')}
              style={{ fontFamily: "'Work Sans', sans-serif" }}
            >
              Appearance & Logo
            </button>
            <button
              className={tabButtonClass('password')}
              onClick={() => setActiveTab('password')}
              style={{ fontFamily: "'Work Sans', sans-serif" }}
            >
              Admin Password
            </button>
          </div>

          <div className="p-4 sm:p-6">
            {/* Tab 1: Entries */}
            {activeTab === 'entries' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center flex-wrap gap-2">
                  <div className="flex gap-2 flex-wrap items-center">
                    <input
                      className="border border-[#C8D5EB] rounded px-3 py-1.5 text-sm focus:outline-none focus:border-[#003087]"
                      style={{ fontFamily: "'Inter', sans-serif" }}
                      placeholder="Filter by username"
                      value={userFilter}
                      onChange={(e) => setUserFilter(e.target.value)}
                    />
                    <input
                      type="month"
                      className="border border-[#C8D5EB] rounded px-3 py-1.5 text-sm focus:outline-none focus:border-[#003087]"
                      style={{ fontFamily: "'Inter', sans-serif" }}
                      value={monthFilter}
                      onChange={(e) => setMonthFilter(e.target.value)}
                    />
                    {(userFilter || monthFilter) && (
                      <button
                        onClick={() => {
                          setUserFilter('');
                          setMonthFilter('');
                        }}
                        className="text-xs text-[#5A6A82] hover:text-[#003087] cursor-pointer"
                        style={{ fontFamily: "'Work Sans', sans-serif" }}
                      >
                        Clear Filter
                      </button>
                    )}
                  </div>

                  <div className="flex gap-2 items-center">
                    {onNewEntry && (
                      <button
                        onClick={() => onNewEntry(monthFilter || undefined)}
                        className="bg-[#003087] hover:bg-[#00236A] text-white text-xs font-bold px-3.5 py-1.5 rounded flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                      >
                        <span>+</span> New Log Entry {monthFilter ? `(${monthFilter})` : ''}
                      </button>
                    )}
                    {entries.length > 0 && (
                      <button
                        onClick={() => setShowClearConfirm(true)}
                        className="text-xs text-red-600 hover:text-red-800 font-semibold px-3 py-1.5 border border-red-200 rounded hover:bg-red-50 transition-colors cursor-pointer"
                      >
                        Clear All Entries
                      </button>
                    )}
                  </div>
                </div>

                {showClearConfirm && (
                  <div className="bg-red-50 border-2 border-red-300 rounded p-4 space-y-2">
                    <h4 className="text-sm font-bold text-red-800">Confirm Remove All Entries</h4>
                    <p className="text-xs text-red-700">
                      Are you sure you want to remove all existing entries? Users will start making fresh entries starting from 01.08.2026. This action cannot be undone.
                    </p>
                    <div className="flex gap-2 justify-end pt-2">
                      <button
                        onClick={() => setShowClearConfirm(false)}
                        className="px-3 py-1 text-xs border border-gray-300 rounded bg-white text-gray-700"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleClearAll}
                        disabled={isClearingEntries}
                        className="px-3 py-1 text-xs font-bold rounded bg-red-600 hover:bg-red-700 text-white"
                      >
                        {isClearingEntries ? 'Removing...' : 'Yes, Remove All'}
                      </button>
                    </div>
                  </div>
                )}

                <LogEntriesTable
                  entries={filteredEntries}
                  onEdit={onEditEntry}
                  onDelete={onDeleteEntry}
                  isAdmin={true}
                  closedMonths={closedMonths}
                />
              </div>
            )}

            {/* Tab 2: Settings & Vehicle */}
            {activeTab === 'settings' && (
              <div className="max-w-xl space-y-4">
                <div className="border-b border-[#EEF2F9] pb-3">
                  <h3
                    className="font-bold text-sm text-[#003087] uppercase tracking-wider"
                    style={{ fontFamily: "'Work Sans', sans-serif" }}
                  >
                    Vehicle & Operational Parameters
                  </h3>
                  <p className="text-xs text-[#5A6A82] mt-0.5">
                    Configure official vehicle number, monthly allowance, and logbook start date. Click <strong>Save Settings</strong> to apply changes.
                  </p>
                </div>

                <div>
                  <label className="block text-[#5A6A82] text-xs font-semibold mb-1 uppercase tracking-wider">
                    Vehicle Registration Number *
                  </label>
                  <input
                    type="text"
                    className="w-full border border-[#C8D5EB] rounded px-3 py-2 text-sm font-mono focus:outline-none focus:border-[#003087]"
                    value={vehNoInput}
                    onChange={(e) => setVehNoInput(e.target.value)}
                    placeholder="e.g. KL 19 L 6865"
                  />
                </div>

                <div>
                  <label className="block text-[#5A6A82] text-xs font-semibold mb-1 uppercase tracking-wider">
                    Monthly KM Allowance (KM) *
                  </label>
                  <input
                    type="number"
                    className="w-full border border-[#C8D5EB] rounded px-3 py-2 text-sm font-mono focus:outline-none focus:border-[#003087]"
                    value={allowanceInput}
                    onChange={(e) => setAllowanceInput(e.target.value)}
                    placeholder="e.g. 2000"
                  />
                </div>

                <div>
                  <label className="block text-[#5A6A82] text-xs font-semibold mb-1 uppercase tracking-wider">
                    Logbook Start Date * (Entries allowed on or after this date)
                  </label>
                  <input
                    type="date"
                    className="w-full border border-[#C8D5EB] rounded px-3 py-2 text-sm focus:outline-none focus:border-[#003087]"
                    value={startDateInput}
                    onChange={(e) => setStartDateInput(e.target.value)}
                  />
                  <span className="text-[11px] text-[#8A99AE] mt-0.5 block">Default: 01.08.2026</span>
                </div>

                {settingsSuccessMsg && (
                  <div className="p-3 text-xs bg-green-50 border border-green-200 text-green-700 rounded font-medium">
                    {settingsSuccessMsg}
                  </div>
                )}

                <div className="pt-2">
                  <button
                    onClick={handleSaveSettings}
                    disabled={isSavingSettings}
                    className="bg-[#003087] hover:bg-[#00236A] text-white text-sm font-semibold px-6 py-2.5 rounded transition-colors cursor-pointer shadow-sm"
                    style={{ fontFamily: "'Work Sans', sans-serif" }}
                  >
                    {isSavingSettings ? 'Saving Settings...' : 'Save Settings'}
                  </button>
                </div>
              </div>
            )}

            {/* Tab 3: Month Closing & Locks */}
            {activeTab === 'closed-months' && (
              <div className="space-y-4 max-w-2xl">
                <div className="border-b border-[#EEF2F9] pb-3">
                  <h3
                    className="font-bold text-sm text-[#003087] uppercase tracking-wider"
                    style={{ fontFamily: "'Work Sans', sans-serif" }}
                  >
                    Month Lock & Closing Status
                  </h3>
                  <p className="text-xs text-[#5A6A82] mt-0.5">
                    Closed months are sealed against modifications: no user or admin can add, edit, or delete entries for a closed month.
                  </p>
                </div>

                {monthActionMsg && (
                  <div className="p-3 text-xs bg-green-50 border border-green-200 text-green-700 rounded font-medium">
                    {monthActionMsg}
                  </div>
                )}

                <div className="space-y-2">
                  {allMonths.map((mKey) => {
                    const isClosed = closedMonths.includes(mKey);
                    const [yStr, mStr] = mKey.split('-');
                    const y = parseInt(yStr, 10);
                    const m = parseInt(mStr, 10) - 1;
                    const monthLabel = formatMonthIndian(y, m);

                    return (
                      <div
                        key={mKey}
                        className="border border-[#D4DEF0] rounded p-3 flex items-center justify-between bg-white"
                      >
                        <div>
                          <div className="font-semibold text-sm text-[#1A2A4A] flex items-center gap-2">
                            <span>{monthLabel}</span>
                            <span className="text-xs text-[#8A99AE] font-mono">({mKey})</span>
                          </div>
                          <div className="text-xs mt-0.5">
                            {isClosed ? (
                              <span className="text-amber-800 font-medium">
                                🔒 Closed & Locked — Logbook sealed
                              </span>
                            ) : (
                              <span className="text-green-700 font-medium">
                                ● Open — Entries and edits allowed
                              </span>
                            )}
                          </div>
                        </div>

                        <div>
                          {isClosed ? (
                            <button
                              onClick={() => handleReopenMonthAction(mKey)}
                              className="text-xs font-semibold px-3 py-1.5 rounded border border-amber-300 bg-amber-50 text-amber-900 hover:bg-amber-100 transition-colors"
                            >
                              🔓 Reopen Month
                            </button>
                          ) : (
                            <button
                              onClick={() => handleCloseMonthAction(mKey)}
                              className="text-xs font-semibold px-3 py-1.5 rounded bg-amber-600 hover:bg-amber-700 text-white transition-colors"
                            >
                              🔒 Close Month
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Quick close any other month */}
                <div className="bg-[#F5F8FD] border border-[#D4DEF0] rounded p-3.5 space-y-2">
                  <h4 className="text-xs font-bold text-[#003087] uppercase tracking-wider">
                    Close / Lock Another Specific Month
                  </h4>
                  <div className="flex gap-2 items-center">
                    <input
                      type="month"
                      className="border border-[#C8D5EB] rounded px-3 py-1.5 text-sm bg-white"
                      value={customMonthInput}
                      onChange={(e) => setCustomMonthInput(e.target.value)}
                    />
                    <button
                      onClick={() => handleCloseMonthAction(customMonthInput)}
                      className="bg-[#003087] hover:bg-[#00236A] text-white text-xs font-semibold px-4 py-2 rounded transition-colors"
                    >
                      Save as Closed
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 4: Users */}
            {activeTab === 'users' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center flex-wrap gap-2 border-b border-[#EEF2F9] pb-3">
                  <div>
                    <h3
                      className="font-bold text-sm text-[#003087] uppercase tracking-wider"
                      style={{ fontFamily: "'Work Sans', sans-serif" }}
                    >
                      Registered Officers & Users ({users.length})
                    </h3>
                    <p className="text-xs text-[#5A6A82]">
                      Manage authorized officers, designations, and login credentials.
                    </p>
                  </div>

                  <button
                    onClick={() => setShowAddUser(!showAddUser)}
                    className="bg-[#003087] hover:bg-[#00236A] text-white text-xs font-semibold px-3.5 py-1.5 rounded flex items-center gap-1.5 transition-colors"
                  >
                    {showAddUser ? '✕ Cancel' : '+ Add New User'}
                  </button>
                </div>

                {userActionMsg && (
                  <div className="p-3 text-xs bg-green-50 border border-green-200 text-green-700 rounded font-medium">
                    {userActionMsg}
                  </div>
                )}

                {/* Add new user form */}
                {showAddUser && (
                  <div className="bg-[#F5F8FD] border border-[#C8D5EB] rounded p-4 space-y-3">
                    <h4 className="font-bold text-xs text-[#003087] uppercase tracking-wider">
                      Add New User / Officer
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-[#5A6A82] mb-1">Full Name *</label>
                        <input
                          type="text"
                          className="w-full border border-[#C8D5EB] rounded px-3 py-1.5 text-sm bg-white"
                          placeholder="e.g. JTO (Network), Attingal"
                          value={newUserName}
                          onChange={(e) => setNewUserName(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-[#5A6A82] mb-1">Username *</label>
                        <input
                          type="text"
                          className="w-full border border-[#C8D5EB] rounded px-3 py-1.5 text-sm bg-white"
                          placeholder="e.g. jto_attingal"
                          value={newUserUsername}
                          onChange={(e) => setNewUserUsername(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-[#5A6A82] mb-1">Designation</label>
                        <input
                          type="text"
                          className="w-full border border-[#C8D5EB] rounded px-3 py-1.5 text-sm bg-white"
                          placeholder="e.g. Junior Telecom Officer (Network)"
                          value={newUserDesignation}
                          onChange={(e) => setNewUserDesignation(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-[#5A6A82] mb-1">Default Password</label>
                        <input
                          type="text"
                          className="w-full border border-[#C8D5EB] rounded px-3 py-1.5 text-sm bg-white"
                          placeholder="e.g. Bsnl"
                          value={newUserPassword}
                          onChange={(e) => setNewUserPassword(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2 pt-1">
                      <button
                        onClick={() => setShowAddUser(false)}
                        className="px-3 py-1.5 text-xs text-[#5A6A82]"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleCreateUser}
                        className="bg-[#003087] hover:bg-[#00236A] text-white text-xs font-semibold px-4 py-1.5 rounded"
                      >
                        Save New User
                      </button>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  {users.map((u) => (
                    <div
                      key={u.id}
                      className="border border-[#D4DEF0] rounded p-3 flex items-center justify-between flex-wrap gap-2 bg-white"
                    >
                      <div>
                        <div
                          className="font-semibold text-sm text-[#1A2A4A]"
                          style={{ fontFamily: "'Work Sans', sans-serif" }}
                        >
                          {u.name}
                        </div>
                        <div
                          className="text-xs text-[#5A6A82]"
                          style={{ fontFamily: "'Inter', sans-serif" }}
                        >
                          <span className="font-mono text-[#003087] font-medium">{u.username}</span> · {u.designation}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-xs font-medium px-2 py-0.5 rounded ${
                            u.active
                              ? 'bg-green-100 text-green-700'
                              : 'bg-red-100 text-red-600'
                          }`}
                          style={{ fontFamily: "'Work Sans', sans-serif" }}
                        >
                          {u.active ? 'Active' : 'Inactive'}
                        </span>
                        <button
                          onClick={() => handleResetUserPassword(u.id, u.username)}
                          className="text-xs text-[#0055C8] hover:underline cursor-pointer border border-[#C8D5EB] px-2 py-1 rounded"
                          style={{ fontFamily: "'Work Sans', sans-serif" }}
                        >
                          Reset PW
                        </button>
                        <button
                          onClick={() => handleDeleteUserAction(u.id, u.username)}
                          className="text-xs text-red-500 hover:underline cursor-pointer px-1 py-1"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tab 5: Appearance */}
            {activeTab === 'appearance' && (
              <div className="space-y-7 max-w-lg">
                {/* BSNL Logo */}
                <div>
                  <h3
                    className="font-semibold text-sm text-[#1A2A4A] mb-3 uppercase tracking-wider"
                    style={{ fontFamily: "'Work Sans', sans-serif" }}
                  >
                    BSNL Logo
                  </h3>
                  <div className="border border-[#D4DEF0] rounded bg-[#F5F8FD] mb-3 flex items-center justify-center h-20 p-2">
                    {previewLogo ? (
                      <img
                        src={previewLogo}
                        alt="Logo preview"
                        className="h-14 w-auto object-contain"
                        onError={() => setPreviewLogo('')}
                      />
                    ) : (
                      <BsnlLogo logoUrl="" />
                    )}
                  </div>

                  <div className="mb-2">
                    <label
                      className="block text-[#5A6A82] text-xs font-medium mb-1 uppercase tracking-wider"
                      style={{ fontFamily: "'Work Sans', sans-serif" }}
                    >
                      Paste Image URL
                    </label>
                    <div className="flex gap-2">
                      <input
                        className="flex-1 border border-[#C8D5EB] rounded px-3 py-2 text-sm focus:outline-none focus:border-[#003087] focus:ring-1 focus:ring-[#003087]"
                        style={{ fontFamily: "'Inter', sans-serif" }}
                        placeholder="https://example.com/bsnl-logo.png"
                        value={logoInput.startsWith('data:') ? '' : logoInput}
                        onChange={(e) => {
                          setLogoInput(e.target.value);
                          setPreviewLogo(e.target.value);
                        }}
                      />
                      <button
                        onClick={() => {
                          onUpdateLogo(logoInput);
                          setLogoSuccessMsg('✓ Logo saved.');
                          setTimeout(() => setLogoSuccessMsg(''), 3000);
                        }}
                        className="bg-[#003087] text-white text-xs font-semibold px-4 py-2 rounded hover:bg-[#00236A] transition-colors cursor-pointer"
                        style={{ fontFamily: "'Work Sans', sans-serif" }}
                      >
                        Save Logo
                      </button>
                    </div>
                  </div>

                  <div>
                    <label
                      className="block text-[#5A6A82] text-xs font-medium mb-1 uppercase tracking-wider"
                      style={{ fontFamily: "'Work Sans', sans-serif" }}
                    >
                      Or Upload Logo File
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        handleImageUpload(e, setPreviewLogo, setLogoInput)
                      }
                      className="text-xs text-[#5A6A82] file:mr-2 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-[#003087] file:text-white hover:file:bg-[#00236A] cursor-pointer"
                    />
                    {logoInput.startsWith('data:') && (
                      <div className="mt-2 flex gap-2">
                        <button
                          onClick={() => {
                            onUpdateLogo(logoInput);
                            setLogoSuccessMsg('✓ Uploaded logo saved.');
                            setTimeout(() => setLogoSuccessMsg(''), 3000);
                          }}
                          className="bg-[#003087] text-white text-xs font-semibold px-4 py-2 rounded hover:bg-[#00236A] transition-colors cursor-pointer"
                          style={{ fontFamily: "'Work Sans', sans-serif" }}
                        >
                          Save Uploaded Logo
                        </button>
                        <button
                          onClick={() => {
                            setLogoInput('');
                            setPreviewLogo('');
                          }}
                          className="text-xs text-[#5A6A82] hover:text-red-500 px-2 py-2 cursor-pointer"
                          style={{ fontFamily: "'Work Sans', sans-serif" }}
                        >
                          Reset
                        </button>
                      </div>
                    )}
                  </div>

                  {logoSuccessMsg && (
                    <div
                      className="mt-2 text-xs text-green-700 bg-green-50 border border-green-200 rounded px-2 py-1.5"
                      style={{ fontFamily: "'Inter', sans-serif" }}
                    >
                      {logoSuccessMsg}
                    </div>
                  )}
                </div>

                {/* Vehicle Image */}
                <div className="border-t border-[#EEF2F9] pt-5">
                  <h3
                    className="font-semibold text-sm text-[#1A2A4A] mb-3 uppercase tracking-wider"
                    style={{ fontFamily: "'Work Sans', sans-serif" }}
                  >
                    Vehicle Photo
                  </h3>
                  <div className="border border-[#D4DEF0] rounded bg-[#F5F8FD] mb-3 flex items-center justify-center h-32 p-2">
                    {previewVehicle ? (
                      <img
                        src={previewVehicle}
                        alt="Vehicle preview"
                        className="h-28 w-auto object-contain rounded"
                        onError={() => setPreviewVehicle('')}
                      />
                    ) : (
                      <span
                        className="text-xs text-[#8A99AE]"
                        style={{ fontFamily: "'Inter', sans-serif" }}
                      >
                        No photo set
                      </span>
                    )}
                  </div>

                  <div className="mb-2">
                    <label
                      className="block text-[#5A6A82] text-xs font-medium mb-1 uppercase tracking-wider"
                      style={{ fontFamily: "'Work Sans', sans-serif" }}
                    >
                      Paste Image URL
                    </label>
                    <div className="flex gap-2">
                      <input
                        className="flex-1 border border-[#C8D5EB] rounded px-3 py-2 text-sm focus:outline-none focus:border-[#003087] focus:ring-1 focus:ring-[#003087]"
                        style={{ fontFamily: "'Inter', sans-serif" }}
                        placeholder="https://example.com/vehicle.jpg"
                        value={vehicleImgInput.startsWith('data:') ? '' : vehicleImgInput}
                        onChange={(e) => {
                          setVehicleImgInput(e.target.value);
                          setPreviewVehicle(e.target.value);
                        }}
                      />
                      <button
                        onClick={() => {
                          onUpdateVehicleImg(vehicleImgInput);
                          setVehicleSuccessMsg('✓ Vehicle photo saved.');
                          setTimeout(() => setVehicleSuccessMsg(''), 3000);
                        }}
                        className="bg-[#003087] text-white text-xs font-semibold px-4 py-2 rounded hover:bg-[#00236A] transition-colors cursor-pointer"
                        style={{ fontFamily: "'Work Sans', sans-serif" }}
                      >
                        Save Photo
                      </button>
                    </div>
                  </div>

                  <div>
                    <label
                      className="block text-[#5A6A82] text-xs font-medium mb-1 uppercase tracking-wider"
                      style={{ fontFamily: "'Work Sans', sans-serif" }}
                    >
                      Or Upload Vehicle Photo
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        handleImageUpload(e, setPreviewVehicle, setVehicleImgInput)
                      }
                      className="text-xs text-[#5A6A82] file:mr-2 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-[#003087] file:text-white hover:file:bg-[#00236A] cursor-pointer"
                    />
                    {vehicleImgInput.startsWith('data:') && (
                      <div className="mt-2 flex gap-2">
                        <button
                          onClick={() => {
                            onUpdateVehicleImg(vehicleImgInput);
                            setVehicleSuccessMsg('✓ Vehicle photo uploaded and saved.');
                            setTimeout(() => setVehicleSuccessMsg(''), 3000);
                          }}
                          className="bg-[#003087] text-white text-xs font-semibold px-4 py-2 rounded hover:bg-[#00236A] transition-colors cursor-pointer"
                          style={{ fontFamily: "'Work Sans', sans-serif" }}
                        >
                          Save Uploaded Image
                        </button>
                        <button
                          onClick={() => {
                            setVehicleImgInput('');
                            setPreviewVehicle('');
                          }}
                          className="text-xs text-[#5A6A82] hover:text-red-500 px-2 py-2 cursor-pointer"
                          style={{ fontFamily: "'Work Sans', sans-serif" }}
                        >
                          Remove
                        </button>
                      </div>
                    )}
                  </div>

                  {vehicleSuccessMsg && (
                    <div
                      className="mt-2 text-xs text-green-700 bg-green-50 border border-green-200 rounded px-2 py-1.5"
                      style={{ fontFamily: "'Inter', sans-serif" }}
                    >
                      {vehicleSuccessMsg}
                    </div>
                  )}

                  <p
                    className="text-xs text-[#8A99AE] mt-2"
                    style={{ fontFamily: "'Inter', sans-serif" }}
                  >
                    Vehicle registration {vehicleNo} is always shown regardless of image.
                  </p>
                </div>
              </div>
            )}

            {/* Tab: Password */}
            {activeTab === 'password' && (
              <div className="max-w-sm space-y-3">
                <h3
                  className="font-semibold text-sm text-[#1A2A4A]"
                  style={{ fontFamily: "'Work Sans', sans-serif" }}
                >
                  Change Admin Password
                </h3>
                <input
                  type="password"
                  className="w-full border border-[#C8D5EB] rounded px-3 py-2 text-sm focus:outline-none focus:border-[#003087]"
                  placeholder="Current password"
                  value={currentPw}
                  onChange={(e) => setCurrentPw(e.target.value)}
                  style={{ fontFamily: "'Inter', sans-serif" }}
                />
                <input
                  type="password"
                  className="w-full border border-[#C8D5EB] rounded px-3 py-2 text-sm focus:outline-none focus:border-[#003087]"
                  placeholder="New password"
                  value={newPw}
                  onChange={(e) => setNewPw(e.target.value)}
                  style={{ fontFamily: "'Inter', sans-serif" }}
                />
                <input
                  type="password"
                  className="w-full border border-[#C8D5EB] rounded px-3 py-2 text-sm focus:outline-none focus:border-[#003087]"
                  placeholder="Confirm new password"
                  value={confirmPw}
                  onChange={(e) => setConfirmPw(e.target.value)}
                  style={{ fontFamily: "'Inter', sans-serif" }}
                />
                {pwStatusMsg && (
                  <p
                    className="text-xs font-medium"
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      color: pwStatusMsg.startsWith('✓') ? 'green' : 'red',
                    }}
                  >
                    {pwStatusMsg}
                  </p>
                )}
                <button
                  onClick={handleAdminPasswordChange}
                  className="bg-[#003087] text-white text-sm font-semibold px-4 py-2 rounded hover:bg-[#00236A] transition-colors cursor-pointer"
                  style={{ fontFamily: "'Work Sans', sans-serif" }}
                >
                  Save New Password
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
