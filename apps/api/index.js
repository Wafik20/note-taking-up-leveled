
const express = require('express');
const cors = require('cors');
require('dotenv').config();
const notesRouter = require('./routes/notes');
const authRouter = require('./routes/auth');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/api', (req, res) => {
  res.status(200).json({ message: 'API is running' });
});

app.get('/api/ping', (req, res) => {
  res.status(200).json({ message: 'pong' });
});

// Route handlers
app.use('/api/auth', authRouter);
app.use('/api/notes', notesRouter);

app.get('/', (req, res) => {
  res.send('Express on Vercel');
});

// Export the app instance for Vercel
module.exports = app;
