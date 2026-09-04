import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import {
  initDatabase,
  getAllEntries,
  saveEntry,
  deleteEntry,
  clearAllEntries,
  closeMonth,
  reopenMonth,
  getAllUsers,
  saveUser,
  deleteUser,
  updateUserPassword,
  getSettings,
  updateSettings,
  getDbStatus,
  connectMongo,
} from './server/db';

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Initialize DB
  await initDatabase();

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // DB connection status & manual trigger
  app.get('/api/db-status', (req, res) => {
    res.json(getDbStatus());
  });

  app.post('/api/db-connect', async (req, res) => {
    const { uri } = req.body || {};
    const result = await connectMongo(uri);
    res.json({ ...result, status: getDbStatus() });
  });

  // --- API Routes ---

  // Entries
  app.get('/api/entries', async (req, res) => {
    try {
      const entries = await getAllEntries();
      res.json(entries);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/entries', async (req, res) => {
    try {
      const entry = req.body;
      if (!entry.date || !entry.startTime || !entry.placesVisited || !entry.purpose) {
        return res.status(400).json({ error: 'Missing required fields' });
      }
      const saved = await saveEntry(entry);
      res.status(201).json(saved);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.put('/api/entries/:id', async (req, res) => {
    try {
      const entry = { ...req.body, id: req.params.id };
      const saved = await saveEntry(entry);
      res.json(saved);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.delete('/api/entries/:id', async (req, res) => {
    try {
      const ok = await deleteEntry(req.params.id);
      res.json({ success: ok });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.post('/api/entries/clear-all', async (req, res) => {
    try {
      const ok = await clearAllEntries();
      res.json({ success: ok });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Month Closing & Reopening
  app.post('/api/months/close', async (req, res) => {
    try {
      const month = req.body.month;
      if (!month) {
        return res.status(400).json({ error: 'Month is required (format: YYYY-MM)' });
      }
      const closedMonths = await closeMonth(month);
      res.json({ success: true, closedMonths });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/months/:month/close', async (req, res) => {
    try {
      const month = req.params.month;
      if (!month) {
        return res.status(400).json({ error: 'Month is required (format: YYYY-MM)' });
      }
      const closedMonths = await closeMonth(month);
      res.json({ success: true, closedMonths });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/months/reopen', async (req, res) => {
    try {
      const month = req.body.month;
      if (!month) {
        return res.status(400).json({ error: 'Month is required (format: YYYY-MM)' });
      }
      const closedMonths = await reopenMonth(month);
      res.json({ success: true, closedMonths });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/months/:month/reopen', async (req, res) => {
    try {
      const month = req.params.month;
      if (!month) {
        return res.status(400).json({ error: 'Month is required (format: YYYY-MM)' });
      }
      const closedMonths = await reopenMonth(month);
      res.json({ success: true, closedMonths });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Users
  app.get('/api/users', async (req, res) => {
    try {
      const users = await getAllUsers();
      res.json(users);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/users', async (req, res) => {
    try {
      const user = req.body;
      if (!user.username || !user.name) {
        return res.status(400).json({ error: 'Username and Name are required' });
      }
      const saved = await saveUser(user);
      res.status(201).json(saved);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.put('/api/users/:id', async (req, res) => {
    try {
      const user = { ...req.body, id: req.params.id };
      const saved = await saveUser(user);
      res.json(saved);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.delete('/api/users/:id', async (req, res) => {
    try {
      const ok = await deleteUser(req.params.id);
      res.json({ success: ok });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/users/:id/reset-password', async (req, res) => {
    try {
      const { newPassword } = req.body;
      if (!newPassword) {
        return res.status(400).json({ error: 'New password is required' });
      }
      const success = await updateUserPassword(req.params.id, newPassword);
      if (!success) {
        return res.status(404).json({ error: 'User not found' });
      }
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Settings
  app.get('/api/settings', async (req, res) => {
    try {
      const settings = await getSettings();
      res.json(settings);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.put('/api/settings', async (req, res) => {
    try {
      const updated = await updateSettings(req.body);
      res.json(updated);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Auth: Login
  app.post('/api/auth/login', async (req, res) => {
    try {
      const { username, password, isAdmin } = req.body;
      const settings = await getSettings();

      if (isAdmin) {
        if (username === 'admin' && password === settings.adminPassword) {
          return res.json({
            role: 'admin',
            user: {
              id: 'admin',
              username: 'admin',
              name: 'Administrator',
              designation: 'Admin',
              active: true,
            },
          });
        }
        return res.status(401).json({ error: 'Invalid admin credentials.' });
      }

      const users = await getAllUsers();
      const user = users.find(u => u.username === username && u.password === password);
      if (user) {
        return res.json({
          role: 'user',
          user: {
            id: user.id,
            username: user.username,
            name: user.name,
            designation: user.designation,
            active: user.active,
          },
        });
      }

      res.status(401).json({ error: 'Invalid username or password.' });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Auth: Change password
  app.post('/api/auth/change-password', async (req, res) => {
    try {
      const { username, currentPassword, newPassword, isAdmin } = req.body;
      const settings = await getSettings();

      if (isAdmin) {
        if (currentPassword !== settings.adminPassword) {
          return res.status(400).json({ error: 'Current password incorrect.' });
        }
        if (!newPassword || newPassword.length < 4) {
          return res.status(400).json({ error: 'Password too short (minimum 4 characters).' });
        }
        await updateSettings({ adminPassword: newPassword });
        return res.json({ success: true });
      }

      const users = await getAllUsers();
      const user = users.find(u => u.username === username);
      if (!user || user.password !== currentPassword) {
        return res.status(400).json({ error: 'Current password incorrect.' });
      }
      if (!newPassword || newPassword.length < 4) {
        return res.status(400).json({ error: 'Password too short (minimum 4 characters).' });
      }
      await updateUserPassword(user.id, newPassword);
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Vite middleware for development vs Static files in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
