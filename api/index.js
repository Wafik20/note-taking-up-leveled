
const express = require('express');
const cors = require('cors');
require('dotenv').config();
const notesRouter = require('./routes/notes');
const authRouter = require('./routes/auth');

const app = express();

app.use(cors());
app.use(express.json());

// All routes are now prefixed with /api by Vercel's routing
app.use('/auth', authRouter);
app.use('/notes', notesRouter);

app.get('/', (req, res) => {
  res.send('Express on Vercel');
});

// Export the app instance for Vercel
module.exports = app;
