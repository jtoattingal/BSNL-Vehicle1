import { LogEntry, StationAdjustment, User, AppSettings } from './types';

export const STATION_OFFSETS: Record<string, number> = {
  Attingal: 5,
  Kallambalam: 14,
  Kilimanoor: 17,
};

export const OPENING_STATION_BREAKDOWNS: Record<string, StationAdjustment[]> = {
  Attingal: [{ label: 'Garage → Attingal', km: 5 }],
  Kallambalam: [
    { label: 'Garage → Attingal', km: 5 },
    { label: 'Attingal → Kallambalam', km: 9 },
  ],
  Kilimanoor: [
    { label: 'Garage → Attingal', km: 5 },
    { label: 'Attingal → Kilimanoor', km: 12 },
  ],
};

export const CLOSING_STATION_BREAKDOWNS: Record<string, StationAdjustment[]> = {
  Attingal: [{ label: 'Attingal → Garage', km: 5 }],
  Kallambalam: [
    { label: 'Kallambalam → Attingal', km: 9 },
    { label: 'Attingal → Garage', km: 5 },
  ],
  Kilimanoor: [
    { label: 'Kilimanoor → Attingal', km: 12 },
    { label: 'Attingal → Garage', km: 5 },
  ],
};

export const INITIAL_USERS: User[] = [
  {
    id: '1',
    username: 'jto_attingal',
    name: 'JTO (Network), Attingal',
    designation: 'Junior Telecom Officer (Network)',
    password: 'Bsnl',
    active: true,
  },
  {
    id: '2',
    username: 'jto_varkala',
    name: 'JTO (Network), Varkala',
    designation: 'Junior Telecom Officer (Network)',
    password: 'Bsnl',
    active: true,
  },
  {
    id: '3',
    username: 'sde_kilimanoor',
    name: 'SDE (Network), Kilimanoor',
    designation: 'Sub-Divisional Engineer (Network)',
    password: 'Bsnl',
    active: true,
  },
  {
    id: '4',
    username: 'agm_attingal',
    name: 'AGM (Network), Attingal',
    designation: 'Assistant General Manager (Network)',
    password: 'Bsnl',
    active: true,
  },
];

export const INITIAL_ENTRIES: LogEntry[] = [];

export const DEFAULT_VEHICLE_NO = 'KL 19 L 6865';
export const DEFAULT_MONTHLY_ALLOWANCE = 2000;
export const DEFAULT_VEHICLE_IMG = '/assets/vehicle.jpeg';
export const DEFAULT_START_DATE = '2026-08-01';

export const INITIAL_SETTINGS: AppSettings = {
  vehicleNo: DEFAULT_VEHICLE_NO,
  monthlyAllowance: DEFAULT_MONTHLY_ALLOWANCE,
  adminPassword: 'Bsnlatt',
  logoUrl: '/assets/bsnl_logo.jpg',
  vehicleImg: DEFAULT_VEHICLE_IMG,
  startDate: DEFAULT_START_DATE,
  closedMonths: [],
};

export function isMonthClosed(dateOrMonth: string, closedMonths?: string[]): boolean {
  if (!closedMonths || !Array.isArray(closedMonths)) return false;
  const monthKey = dateOrMonth.slice(0, 7); // "YYYY-MM"
  return closedMonths.includes(monthKey);
}

// Calculations
export function calculateLogbookOMR(actualMeter: number, station: string): number {
  const offset = STATION_OFFSETS[station] ?? 0;
  return actualMeter - offset;
}

export function calculateLogbookCMR(actualMeter: number, station: string): number {
  const offset = STATION_OFFSETS[station] ?? 0;
  return actualMeter + offset;
}

export function formatDateIndian(dateString: string): string {
  if (!dateString) return '';
  return new Date(dateString + 'T00:00:00').toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function formatMonthIndian(year: number, monthIndex: number): string {
  return new Date(year, monthIndex, 1).toLocaleDateString('en-IN', {
    month: 'long',
    year: 'numeric',
  });
}

export function formatMonthYear(dateString: string): string {
  if (!dateString) return '';
  const d = new Date(dateString + 'T00:00:00');
  return d.toLocaleDateString('en-IN', {
    month: 'long',
    year: 'numeric',
  });
}
