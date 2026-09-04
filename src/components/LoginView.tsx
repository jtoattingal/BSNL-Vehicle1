import React, { useState } from 'react';
import { BsnlLogo } from './BsnlLogo';
import { DEFAULT_VEHICLE_NO } from '../constants';
import { User } from '../types';

interface LoginViewProps {
  onLogin: (user: User | null) => void;
  users?: User[];
  logoUrl?: string;
  vehicleImg?: string;
  vehicleNo?: string;
}

export const LoginView: React.FC<LoginViewProps> = ({
  onLogin,
  users = [],
  logoUrl,
  vehicleImg,
  vehicleNo = DEFAULT_VEHICLE_NO,
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isAdminLogin, setIsAdminLogin] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    setError('');
    if (!username || !password) {
      setError('Please enter both username and password.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: username.trim(),
          password,
          isAdmin: isAdminLogin,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Invalid credentials.');
        setLoading(false);
        return;
      }

      if (data.role === 'admin') {
        onLogin(null); // null represents admin in parent state
      } else {
        onLogin(data.user);
      }
    } catch (err) {
      // Fallback local check if API is unreachable
      if (isAdminLogin) {
        if (username === 'admin' && password === 'Bsnlatt') {
          onLogin(null);
          return;
        }
        setError('Invalid admin credentials.');
      } else {
        setError('Connection error. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#EEF2F9] flex flex-col items-center justify-center px-4 py-8">
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <div className="flex justify-center mb-3">
            <BsnlLogo logoUrl={logoUrl} />
          </div>
          <h1
            className="text-[#003087] font-bold text-xl tracking-tight mb-0.5"
            style={{ fontFamily: "'Work Sans', sans-serif" }}
          >
            Vehicle Digital Logbook
          </h1>
          <p
            className="text-[#5A6A82] text-sm"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            Official Internal Application
          </p>
        </div>

        {/* Vehicle Preview Card */}
        <div className="bg-white border border-[#D4DEF0] rounded overflow-hidden mb-5 shadow-xs">
          <div className="h-32 bg-[#1A2A4A] flex items-center justify-center overflow-hidden">
            {vehicleImg ? (
              <img
                src={vehicleImg}
                alt="Vehicle"
                className="w-full h-full object-cover opacity-90"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            ) : (
              <div className="text-center">
                <div className="text-5xl mb-1">🚐</div>
              </div>
            )}
          </div>
          <div className="py-2 text-center bg-white border-t border-[#EEF2F9]">
            <span
              className="text-[#003087] font-bold text-base tracking-widest"
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
            >
              {vehicleNo}
            </span>
          </div>
        </div>

        {/* Login Form Card */}
        <div className="bg-white border border-[#D4DEF0] rounded p-5 shadow-xs">
          {/* Login Mode Tabs */}
          <div className="grid grid-cols-2 p-1 bg-[#EEF2F9] rounded border border-[#D4DEF0] mb-4">
            <button
              type="button"
              onClick={() => {
                setIsAdminLogin(false);
                setError('');
                setUsername('');
                setPassword('');
              }}
              className={`py-2 px-3 text-xs font-bold rounded transition-colors cursor-pointer text-center ${
                !isAdminLogin
                  ? 'bg-[#003087] text-white shadow-xs'
                  : 'text-[#5A6A82] hover:text-[#003087]'
              }`}
              style={{ fontFamily: "'Work Sans', sans-serif" }}
            >
              👤 Officer Login
            </button>
            <button
              type="button"
              onClick={() => {
                setIsAdminLogin(true);
                setError('');
                setUsername('');
                setPassword('');
              }}
              className={`py-2 px-3 text-xs font-bold rounded transition-colors cursor-pointer text-center ${
                isAdminLogin
                  ? 'bg-[#003087] text-white shadow-xs'
                  : 'text-[#5A6A82] hover:text-[#003087]'
              }`}
              style={{ fontFamily: "'Work Sans', sans-serif" }}
            >
              🛡️ Admin Login
            </button>
          </div>

          <div className="mb-4">
            <h2
              className="text-[#1A2A4A] font-semibold text-base"
              style={{ fontFamily: "'Work Sans', sans-serif" }}
            >
              {isAdminLogin ? 'BSNL Admin Portal' : 'BSNL Officer Logbook'}
            </h2>
            <p className="text-xs text-[#5A6A82] mt-0.5" style={{ fontFamily: "'Inter', sans-serif" }}>
              {isAdminLogin ? 'Enter admin credentials to manage logbook & settings' : 'Select or enter your officer credentials'}
            </p>
          </div>

          <div className="space-y-3">
            {!isAdminLogin && users && users.length > 0 && (
              <div>
                <label
                  className="block text-[#5A6A82] text-xs font-medium mb-1 uppercase tracking-wider"
                  style={{ fontFamily: "'Work Sans', sans-serif" }}
                >
                  Select Officer
                </label>
                <select
                  className="w-full border border-[#C8D5EB] rounded px-3 py-2 text-sm text-[#1A2A4A] bg-white focus:outline-none focus:border-[#003087]"
                  style={{ fontFamily: "'Inter', sans-serif" }}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                >
                  <option value="">-- Select Officer from List --</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.username}>
                      {u.name} ({u.username})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label
                className="block text-[#5A6A82] text-xs font-medium mb-1 uppercase tracking-wider"
                style={{ fontFamily: "'Work Sans', sans-serif" }}
              >
                {isAdminLogin ? 'Admin Username' : 'Username'}
              </label>
              <input
                className="w-full border border-[#C8D5EB] rounded px-3 py-2 text-sm text-[#1A2A4A] focus:outline-none focus:border-[#003087] focus:ring-1 focus:ring-[#003087]"
                style={{ fontFamily: "'Inter', sans-serif" }}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                placeholder={isAdminLogin ? 'admin' : 'Enter username (e.g. jto_attingal)'}
                autoComplete="username"
              />
            </div>

            <div>
              <label
                className="block text-[#5A6A82] text-xs font-medium mb-1 uppercase tracking-wider"
                style={{ fontFamily: "'Work Sans', sans-serif" }}
              >
                Password
              </label>
              <input
                type="password"
                className="w-full border border-[#C8D5EB] rounded px-3 py-2 text-sm text-[#1A2A4A] focus:outline-none focus:border-[#003087] focus:ring-1 focus:ring-[#003087]"
                style={{ fontFamily: "'Inter', sans-serif" }}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                placeholder="Enter password"
                autoComplete="current-password"
              />
            </div>

            {error && (
              <p
                className="text-red-600 text-xs font-medium"
                style={{ fontFamily: "'Inter', sans-serif" }}
              >
                {error}
              </p>
            )}

            <button
              onClick={handleLogin}
              disabled={loading}
              className="w-full bg-[#003087] hover:bg-[#00236A] text-white font-semibold py-2.5 rounded text-sm transition-colors cursor-pointer disabled:opacity-60"
              style={{ fontFamily: "'Work Sans', sans-serif" }}
            >
              {loading ? 'Authenticating...' : 'Login'}
            </button>
          </div>
        </div>

        <p
          className="text-center text-[#8A99AE] text-xs mt-4"
          style={{ fontFamily: "'Inter', sans-serif" }}
        >
          BSNL · Attingal SSA · Confidential Internal System
        </p>
      </div>
    </div>
  );
};
