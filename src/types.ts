export type Station = 'Attingal' | 'Kallambalam' | 'Kilimanoor';

export interface User {
  id: string;
  username: string;
  name: string;
  designation: string;
  password?: string;
  active: boolean;
}

export interface LogEntry {
  id: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  startStation: string;
  actualOMR: number;
  logbookOMR: number;
  placesVisited: string;
  purpose: string;
  endStation: string;
  actualCMR: number;
  logbookCMR: number;
  km: number;
  remarks: string;
  user: string; // username
  createdAt?: string;
}

export interface StationAdjustment {
  label: string;
  km: number;
}

export interface AppSettings {
  vehicleNo: string;
  monthlyAllowance: number;
  adminPassword: string;
  logoUrl: string;
  vehicleImg: string;
  startDate?: string;
  closedMonths?: string[];
}

export type AppView = 'login' | 'user' | 'admin' | 'new-entry' | 'report';
