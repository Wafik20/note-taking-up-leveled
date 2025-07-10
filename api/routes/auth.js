
const express = require('express');
const router = express.Router();
const authService = require('../services/authService');

router.post('/register', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await authService.register(email, password);
    res.status(201).json({ message: 'User registered successfully', user });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const session = await authService.login(email, password);
    res.status(200).json({ message: 'Login successful', session });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
