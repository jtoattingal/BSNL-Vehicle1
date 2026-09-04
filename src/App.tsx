import React, { useState, useEffect } from 'react';
import { AppView, LogEntry, User, AppSettings } from './types';
import {
  INITIAL_ENTRIES,
  INITIAL_USERS,
  INITIAL_SETTINGS,
} from './constants';
import { LoginView } from './components/LoginView';
import { UserDashboard } from './components/UserDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { LogEntryForm } from './components/LogEntryForm';
import { MonthlyReportView } from './components/MonthlyReportView';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [view, setView] = useState<AppView>('login');

  const [entries, setEntries] = useState<LogEntry[]>(INITIAL_ENTRIES);
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [settings, setSettings] = useState<AppSettings>(INITIAL_SETTINGS);
  const [editingEntry, setEditingEntry] = useState<LogEntry | null>(null);

  // Load initial data from API
  useEffect(() => {
    async function loadData() {
      try {
        const [entriesRes, usersRes, settingsRes] = await Promise.all([
          fetch('/api/entries'),
          fetch('/api/users'),
          fetch('/api/settings'),
        ]);

        if (entriesRes.ok) {
          const data = await entriesRes.json();
          if (Array.isArray(data)) setEntries(data);
        }

        if (usersRes.ok) {
          const data = await usersRes.json();
          if (Array.isArray(data)) setUsers(data);
        }

        if (settingsRes.ok) {
          const data = await settingsRes.json();
          if (data && typeof data === 'object') {
            setSettings((prev) => ({ ...prev, ...data }));
          }
        }
      } catch (err) {
        console.warn('Using initial seed data:', err);
      }
    }
    loadData();
  }, []);

  // Fetch users again when needed
  async function refreshUsers() {
    try {
      const res = await fetch('/api/users');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) setUsers(data);
      }
    } catch (err) {
      console.error(err);
    }
  }

  function handleLogin(user: User | null) {
    if (user === null) {
      // Admin
      setIsAdmin(true);
      setCurrentUser(null);
      setView('admin');
    } else {
      // User
      setIsAdmin(false);
      setCurrentUser(user);
      setView('user');
    }
  }

  function handleLogout() {
    setCurrentUser(null);
    setIsAdmin(false);
    setView('login');
    setEditingEntry(null);
  }

  async function handleSaveEntry(savedEntry: LogEntry) {
    const isEdit = entries.some((e) => e.id === savedEntry.id);
    const method = isEdit ? 'PUT' : 'POST';
    const url = isEdit ? `/api/entries/${savedEntry.id}` : '/api/entries';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(savedEntry),
      });

      if (res.ok) {
        const persisted = await res.json();
        setEntries((prev) => {
          const index = prev.findIndex((e) => e.id === persisted.id);
          let next;
          if (index >= 0) {
            next = [...prev];
            next[index] = persisted;
          } else {
            next = [...prev, persisted];
          }
          return next.sort((a, b) => a.date.localeCompare(b.date));
        });
      }
    } catch (err) {
      // Fallback local update
      setEntries((prev) => {
        const index = prev.findIndex((e) => e.id === savedEntry.id);
        let next;
        if (index >= 0) {
          next = [...prev];
          next[index] = savedEntry;
        } else {
          next = [...prev, savedEntry];
        }
        return next.sort((a, b) => a.date.localeCompare(b.date));
      });
    }
  }

  async function handleDeleteEntry(id: string) {
    if (!window.confirm('Are you sure you want to delete this log entry?')) {
      return;
    }

    try {
      const res = await fetch(`/api/entries/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setEntries((prev) => prev.filter((e) => e.id !== id));
      }
    } catch (err) {
      setEntries((prev) => prev.filter((e) => e.id !== id));
    }
  }

  async function handleUpdateLogo(logoUrl: string) {
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ logoUrl }),
      });
      if (res.ok) {
        const updated = await res.json();
        setSettings(updated);
      }
    } catch {
      setSettings((prev) => ({ ...prev, logoUrl }));
    }
  }

  async function handleUpdateVehicleImg(vehicleImg: string) {
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vehicleImg }),
      });
      if (res.ok) {
        const updated = await res.json();
        setSettings(updated);
      }
    } catch {
      setSettings((prev) => ({ ...prev, vehicleImg }));
    }
  }

  async function handleUpdateSettings(newSettings: Partial<AppSettings>) {
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSettings),
      });
      if (res.ok) {
        const updated = await res.json();
        setSettings(updated);
      }
    } catch {
      setSettings((prev) => ({ ...prev, ...newSettings }));
    }
  }

  async function handleCloseMonth(month: string) {
    try {
      const res = await fetch(`/api/months/${month}/close`, { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setSettings((prev) => ({ ...prev, closedMonths: data.closedMonths }));
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function handleReopenMonth(month: string) {
    try {
      const res = await fetch(`/api/months/${month}/reopen`, { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setSettings((prev) => ({ ...prev, closedMonths: data.closedMonths }));
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function handleClearAllEntries() {
    try {
      const res = await fetch('/api/entries/clear-all', { method: 'POST' });
      if (res.ok) {
        setEntries([]);
      }
    } catch (err) {
      console.error(err);
      setEntries([]);
    }
  }

  async function handleSaveUser(user: User) {
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user),
      });
      if (res.ok) {
        await refreshUsers();
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function handleDeleteUser(userId: string) {
    try {
      const res = await fetch(`/api/users/${userId}`, { method: 'DELETE' });
      if (res.ok) {
        await refreshUsers();
      }
    } catch (err) {
      console.error(err);
    }
  }

  function handleEditEntry(entry: LogEntry) {
    setEditingEntry(entry);
    setView('new-entry');
  }

  // View routing
  switch (view) {
    case 'login':
      return (
        <LoginView
          onLogin={handleLogin}
          users={users}
          logoUrl={settings.logoUrl}
          vehicleImg={settings.vehicleImg}
          vehicleNo={settings.vehicleNo}
        />
      );

    case 'user':
      if (!currentUser) {
        return (
          <LoginView
            onLogin={handleLogin}
            users={users}
            logoUrl={settings.logoUrl}
            vehicleImg={settings.vehicleImg}
            vehicleNo={settings.vehicleNo}
          />
        );
      }
      return (
        <UserDashboard
          currentUser={currentUser}
          entries={entries}
          onNewEntry={() => {
            setEditingEntry(null);
            setView('new-entry');
          }}
          onEditEntry={handleEditEntry}
          onReport={() => setView('report')}
          onLogout={handleLogout}
          logoUrl={settings.logoUrl}
          vehicleNo={settings.vehicleNo}
          closedMonths={settings.closedMonths}
          onCloseMonth={handleCloseMonth}
        />
      );

    case 'admin':
      return (
        <AdminDashboard
          entries={entries}
          users={users}
          logoUrl={settings.logoUrl}
          vehicleImg={settings.vehicleImg}
          vehicleNo={settings.vehicleNo}
          monthlyAllowance={settings.monthlyAllowance}
          startDate={settings.startDate}
          closedMonths={settings.closedMonths}
          onUpdateLogo={handleUpdateLogo}
          onUpdateVehicleImg={handleUpdateVehicleImg}
          onUpdateSettings={handleUpdateSettings}
          onCloseMonth={handleCloseMonth}
          onReopenMonth={handleReopenMonth}
          onClearAllEntries={handleClearAllEntries}
          onSaveUser={handleSaveUser}
          onDeleteUser={handleDeleteUser}
          onLogout={handleLogout}
          onEditEntry={handleEditEntry}
          onDeleteEntry={handleDeleteEntry}
          adminPassword={settings.adminPassword}
          onChangeAdminPassword={(newPw) =>
            setSettings((prev) => ({ ...prev, adminPassword: newPw }))
          }
          onRefreshUsers={refreshUsers}
        />
      );

    case 'new-entry':
      return (
        <LogEntryForm
          currentUser={
            currentUser || {
              id: 'admin',
              username: 'admin',
              name: 'Administrator',
              designation: 'Admin',
              active: true,
            }
          }
          onSave={async (savedEntry) => {
            await handleSaveEntry(savedEntry);
            setView(isAdmin ? 'admin' : 'user');
          }}
          onCancel={() => {
            setEditingEntry(null);
            setView(isAdmin ? 'admin' : 'user');
          }}
          editEntry={editingEntry || undefined}
          startDate={settings.startDate}
          closedMonths={settings.closedMonths}
        />
      );

    case 'report':
      return (
        <MonthlyReportView
          entries={entries}
          currentUser={
            currentUser || {
              id: 'admin',
              username: 'admin',
              name: 'Administrator',
              designation: 'Admin',
              active: true,
            }
          }
          logoUrl={settings.logoUrl}
          onBack={() => setView(isAdmin ? 'admin' : 'user')}
          vehicleNo={settings.vehicleNo}
          monthlyAllowance={settings.monthlyAllowance}
          closedMonths={settings.closedMonths}
          onCloseMonth={handleCloseMonth}
        />
      );

    default:
      return null;
  }
}
