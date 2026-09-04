import fs from 'fs';
import path from 'path';
import { MongoClient, Db } from 'mongodb';
import {
  INITIAL_ENTRIES,
  INITIAL_USERS,
  INITIAL_SETTINGS,
} from '../src/constants';
import { LogEntry, User, AppSettings } from '../src/types';

interface DatabaseSchema {
  entries: LogEntry[];
  users: User[];
  settings: AppSettings;
}

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

let mongoClient: MongoClient | null = null;
let mongoDb: Db | null = null;
let isMongoConnected = false;

// Initialize in-memory cache / file store
let localStore: DatabaseSchema = {
  entries: [...INITIAL_ENTRIES],
  users: [...INITIAL_USERS],
  settings: { ...INITIAL_SETTINGS },
};

function ensureDataDirectory(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function loadLocalStore(): void {
  try {
    ensureDataDirectory();
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, 'utf8');
      const parsed = JSON.parse(raw);
      localStore = {
        entries: Array.isArray(parsed.entries) ? parsed.entries : INITIAL_ENTRIES,
        users: Array.isArray(parsed.users) ? parsed.users : INITIAL_USERS,
        settings: parsed.settings ? { ...INITIAL_SETTINGS, ...parsed.settings } : INITIAL_SETTINGS,
      };
    } else {
      saveLocalStore();
    }
  } catch (err) {
    console.error('Error loading local data store, resetting to defaults:', err);
    saveLocalStore();
  }
}

function saveLocalStore(): void {
  try {
    ensureDataDirectory();
    fs.writeFileSync(DB_FILE, JSON.stringify(localStore, null, 2), 'utf8');
  } catch (err) {
    console.error('Error saving local data store:', err);
  }
}

export async function initDatabase(): Promise<void> {
  loadLocalStore();

  const mongoUri = process.env.MONGODB_URI;
  if (mongoUri && mongoUri.trim().length > 0) {
    try {
      console.log('Connecting to MongoDB via MONGODB_URI...');
      mongoClient = new MongoClient(mongoUri.trim(), {
        serverSelectionTimeoutMS: 4000,
      });
      await mongoClient.connect();
      mongoDb = mongoClient.db();
      isMongoConnected = true;
      console.log('✓ MongoDB connected successfully!');

      // Sync collections if needed
      const entriesCount = await mongoDb.collection('entries').countDocuments();
      if (entriesCount === 0 && localStore.entries.length > 0) {
        await mongoDb.collection('entries').insertMany(localStore.entries as any);
      } else if (entriesCount > 0) {
        const remoteEntries: any[] = await mongoDb.collection('entries').find({}).toArray();
        localStore.entries = remoteEntries.map((doc) => ({
          id: doc.id || doc._id.toString(),
          date: doc.date,
          startTime: doc.startTime,
          startStation: doc.startStation,
          actualOMR: doc.actualOMR,
          logbookOMR: doc.logbookOMR,
          placesVisited: doc.placesVisited,
          purpose: doc.purpose,
          endStation: doc.endStation,
          actualCMR: doc.actualCMR,
          logbookCMR: doc.logbookCMR,
          km: doc.km,
          remarks: doc.remarks || '',
          user: doc.user,
        }));
        saveLocalStore();
      }

      const usersCount = await mongoDb.collection('users').countDocuments();
      if (usersCount === 0 && localStore.users.length > 0) {
        await mongoDb.collection('users').insertMany(localStore.users as any);
      }

      const settingsDoc: any = await mongoDb.collection('settings').findOne({});
      if (!settingsDoc && localStore.settings) {
        await mongoDb.collection('settings').insertOne(localStore.settings as any);
      } else if (settingsDoc) {
        localStore.settings = { ...INITIAL_SETTINGS, ...settingsDoc };
        saveLocalStore();
      }
    } catch (err: any) {
      console.warn('MongoDB connection not available, using local persistent storage.');
      isMongoConnected = false;
    }
  }
}

// Entries CRUD
export async function getAllEntries(): Promise<LogEntry[]> {
  if (isMongoConnected && mongoDb) {
    const docs = await mongoDb.collection('entries').find({}).toArray();
    return docs.map((doc: any) => ({
      id: doc.id || doc._id.toString(),
      date: doc.date,
      startTime: doc.startTime,
      startStation: doc.startStation,
      actualOMR: doc.actualOMR,
      logbookOMR: doc.logbookOMR,
      placesVisited: doc.placesVisited,
      purpose: doc.purpose,
      endStation: doc.endStation,
      actualCMR: doc.actualCMR,
      logbookCMR: doc.logbookCMR,
      km: doc.km,
      remarks: doc.remarks || '',
      user: doc.user,
    }));
  }
  return [...localStore.entries];
}

export async function saveEntry(entry: LogEntry, isAdmin: boolean = false): Promise<LogEntry> {
  const currentSettings = await getSettings();
  const closedMonths = currentSettings.closedMonths || [];
  const entryMonth = entry.date.slice(0, 7); // YYYY-MM

  if (!isAdmin && closedMonths.includes(entryMonth)) {
    throw new Error(`Month ${entryMonth} is closed and locked by Admin. Regular users are not allowed to enter or edit.`);
  }

  const startDate = currentSettings.startDate || '2026-08-01';
  if (entry.date < startDate) {
    throw new Error(`Entry date cannot be earlier than logbook start date (${startDate}).`);
  }

  // Also check if an existing entry being edited was in a closed month
  if (!isAdmin && entry.id) {
    const existing = localStore.entries.find(e => e.id === entry.id);
    if (existing && closedMonths.includes(existing.date.slice(0, 7))) {
      throw new Error(`Cannot edit an entry belonging to closed month ${existing.date.slice(0, 7)}.`);
    }
  }

  const finalEntry = {
    ...entry,
    id: entry.id || Date.now().toString(),
  };

  if (isMongoConnected && mongoDb) {
    await mongoDb.collection('entries').updateOne(
      { id: finalEntry.id },
      { $set: finalEntry },
      { upsert: true }
    );
  }

  const existingIdx = localStore.entries.findIndex(e => e.id === finalEntry.id);
  if (existingIdx >= 0) {
    localStore.entries[existingIdx] = finalEntry;
  } else {
    localStore.entries.push(finalEntry);
  }
  // Keep sorted by date
  localStore.entries.sort((a, b) => a.date.localeCompare(b.date));
  saveLocalStore();

  return finalEntry;
}

export async function deleteEntry(id: string, isAdmin: boolean = false): Promise<boolean> {
  const existing = localStore.entries.find(e => e.id === id);
  if (existing && !isAdmin) {
    const currentSettings = await getSettings();
    const closedMonths = currentSettings.closedMonths || [];
    const entryMonth = existing.date.slice(0, 7);
    if (closedMonths.includes(entryMonth)) {
      throw new Error(`Month ${entryMonth} is closed. Cannot delete entries from a closed month.`);
    }
  }

  if (isMongoConnected && mongoDb) {
    await mongoDb.collection('entries').deleteOne({ id });
  }

  const prevLen = localStore.entries.length;
  localStore.entries = localStore.entries.filter(e => e.id !== id);
  saveLocalStore();
  return localStore.entries.length < prevLen;
}

export async function clearAllEntries(): Promise<boolean> {
  if (isMongoConnected && mongoDb) {
    await mongoDb.collection('entries').deleteMany({});
  }
  localStore.entries = [];
  saveLocalStore();
  return true;
}

// Month Closing Operations
export async function closeMonth(month: string): Promise<string[]> {
  const currentSettings = await getSettings();
  const closedMonths = new Set(currentSettings.closedMonths || []);
  closedMonths.add(month);
  const updatedList = Array.from(closedMonths);
  await updateSettings({ closedMonths: updatedList });
  return updatedList;
}

export async function reopenMonth(month: string): Promise<string[]> {
  const currentSettings = await getSettings();
  const closedMonths = (currentSettings.closedMonths || []).filter(m => m !== month);
  await updateSettings({ closedMonths });
  return closedMonths;
}

// Users CRUD
export async function getAllUsers(): Promise<User[]> {
  if (isMongoConnected && mongoDb) {
    const docs = await mongoDb.collection('users').find({}).toArray();
    return docs.map((doc: any) => ({
      id: doc.id || doc._id.toString(),
      username: doc.username,
      name: doc.name,
      designation: doc.designation,
      password: doc.password,
      active: doc.active !== false,
    }));
  }
  return [...localStore.users];
}

export async function saveUser(user: User): Promise<User> {
  const finalUser = {
    ...user,
    id: user.id || Date.now().toString(),
    active: user.active !== false,
  };

  if (isMongoConnected && mongoDb) {
    await mongoDb.collection('users').updateOne(
      { id: finalUser.id },
      { $set: finalUser },
      { upsert: true }
    );
  }

  const idx = localStore.users.findIndex(u => u.id === finalUser.id);
  if (idx >= 0) {
    localStore.users[idx] = finalUser;
  } else {
    localStore.users.push(finalUser);
  }
  saveLocalStore();
  return finalUser;
}

export async function deleteUser(id: string): Promise<boolean> {
  if (isMongoConnected && mongoDb) {
    try {
      await mongoDb.collection('users').deleteMany({
        $or: [
          { id },
          { username: id },
        ],
      });
    } catch (e) {
      console.error('Error deleting from mongo:', e);
    }
  }
  const prevLen = localStore.users.length;
  localStore.users = localStore.users.filter(u => u.id !== id && u.username !== id);
  saveLocalStore();
  return true;
}

export async function updateUserPassword(userIdOrUsername: string, newPassword: string): Promise<boolean> {
  if (isMongoConnected && mongoDb) {
    await mongoDb.collection('users').updateOne(
      { $or: [{ id: userIdOrUsername }, { username: userIdOrUsername }] },
      { $set: { password: newPassword } }
    );
  }

  const user = localStore.users.find(u => u.id === userIdOrUsername || u.username === userIdOrUsername);
  if (user) {
    user.password = newPassword;
    saveLocalStore();
    return true;
  }
  return false;
}

// Settings CRUD
export async function getSettings(): Promise<AppSettings> {
  if (isMongoConnected && mongoDb) {
    const doc: any = await mongoDb.collection('settings').findOne({});
    if (doc) {
      return {
        vehicleNo: doc.vehicleNo || INITIAL_SETTINGS.vehicleNo,
        monthlyAllowance: doc.monthlyAllowance || INITIAL_SETTINGS.monthlyAllowance,
        adminPassword: doc.adminPassword || INITIAL_SETTINGS.adminPassword,
        logoUrl: doc.logoUrl || INITIAL_SETTINGS.logoUrl,
        vehicleImg: doc.vehicleImg || INITIAL_SETTINGS.vehicleImg,
        startDate: doc.startDate || INITIAL_SETTINGS.startDate,
        closedMonths: Array.isArray(doc.closedMonths) ? doc.closedMonths : (INITIAL_SETTINGS.closedMonths || []),
      };
    }
  }
  return {
    ...INITIAL_SETTINGS,
    ...localStore.settings,
    closedMonths: Array.isArray(localStore.settings.closedMonths) ? localStore.settings.closedMonths : [],
  };
}

export async function updateSettings(settings: Partial<AppSettings>): Promise<AppSettings> {
  const merged = { ...localStore.settings, ...settings };
  localStore.settings = merged;
  saveLocalStore();

  if (isMongoConnected && mongoDb) {
    await mongoDb.collection('settings').updateOne(
      {},
      { $set: merged },
      { upsert: true }
    );
  }

  return merged;
}
