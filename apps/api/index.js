
const express = require('express');
const cors = require('cors');
const notesRouter = require('./routes/notes');
const authRouter = require('./routes/auth');
const groupsRouter = require('./routes/groups');

const app = express();
const port = process.env.API_PORT || 3001;

const allowedOrigins = [
  'https://note-taking-up-leveled-web-one.vercel.app', // main web app
  'https://note-taking-up-leveled-web.vercel.app',    // API endpoint (self)
  'http://localhost:3000' // local dev (optional)
];

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));

// Handle preflight requests for all routes
app.options('*', cors({
  origin: allowedOrigins,
  credentials: true,
}));

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
app.use('/api/groups', groupsRouter);

app.get('/', (req, res) => {
  res.send('Express on Vercel');
});

// Start the server only if not in a serverless environment
if (require.main === module) {
  app.listen(port, () => {
    console.log(`API server listening on port ${port}`);
  });
}

// Export the app instance for Vercel
module.exports = app;
