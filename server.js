import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(express.json());
app.use(cors());

// Database file path
const DB_PATH = path.join(__dirname, 'src', 'data', 'db.json');

// Helper functions to read and write to the database
const readDatabase = () => {
  try {
    const data = fs.readFileSync(DB_PATH, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading database:', error);
    return null;
  }
};

const writeDatabase = (data) => {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error('Error writing to database:', error);
    return false;
  }
};

// Routes

// Get the current database state
app.get('/api/db', (req, res) => {
  const data = readDatabase();
  if (data) {
    res.json(data);
  } else {
    res.status(500).json({ error: 'Failed to read database' });
  }
});

// Get a specific section of the database
app.get('/api/db/:section', (req, res) => {
  const { section } = req.params;
  const data = readDatabase();

  if (!data) {
    return res.status(500).json({ error: 'Failed to read database' });
  }

  if (data[section] === undefined) {
    return res.status(404).json({ error: `Section "${section}" not found` });
  }

  res.json(data[section]);
});

// Update a specific section of the database
app.post('/api/db/:section', (req, res) => {
  const { section } = req.params;
  const newData = req.body;
  const data = readDatabase();

  if (!data) {
    return res.status(500).json({ error: 'Failed to read database' });
  }

  if (data[section] === undefined) {
    return res.status(404).json({ error: `Section "${section}" not found` });
  }

  data[section] = newData;

  const success = writeDatabase(data);
  if (success) {
    res.json({ success: true, message: `Updated section "${section}"` });
  } else {
    res.status(500).json({ error: 'Failed to write to database' });
  }
});

// Add item to an array in the database
app.post('/api/db/:section/add', (req, res) => {
  const { section } = req.params;
  const newItem = req.body;
  const data = readDatabase();

  if (!data) {
    return res.status(500).json({ error: 'Failed to read database' });
  }

  if (data[section] === undefined) {
    return res.status(404).json({ error: `Section "${section}" not found` });
  }

  if (!Array.isArray(data[section])) {
    return res.status(400).json({ error: `Section "${section}" is not an array` });
  }

  data[section].push(newItem);

  const success = writeDatabase(data);
  if (success) {
    res.json({ success: true, message: `Added item to "${section}"` });
  } else {
    res.status(500).json({ error: 'Failed to write to database' });
  }
});

// Update current user
app.post('/api/db/currentUser/update', (req, res) => {
  const userData = req.body;
  const data = readDatabase();

  if (!data) {
    return res.status(500).json({ error: 'Failed to read database' });
  }

  data.currentUser = userData;

  // Also update the user in the users array if it exists
  if (userData && userData.id) {
    const userIndex = data.users.findIndex(u => u.id === userData.id);
    if (userIndex !== -1) {
      data.users[userIndex] = userData;
    }
  }

  const success = writeDatabase(data);
  if (success) {
    res.json({ success: true, message: 'Updated current user' });
  } else {
    res.status(500).json({ error: 'Failed to write to database' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 