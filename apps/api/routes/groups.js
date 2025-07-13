const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../middleware/auth');
const groupService = require('../services/groupService');

// Get all groups for the authenticated user
router.get('/', isAuthenticated, async (req, res) => {
  try {
    const groups = await groupService.getGroups(req.supabase);
    res.status(200).json(groups);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Create a new group
router.post('/', isAuthenticated, async (req, res) => {
  const { name, parent_group_id } = req.body;
  const owner_id = req.user.id;
  try {
    const group = await groupService.createGroup(req.supabase, { name, parent_group_id, owner_id });
    res.status(201).json(group);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update a group (rename or move)
router.patch('/:id', isAuthenticated, async (req, res) => {
  const { id } = req.params;
  const { name, parent_group_id } = req.body;
  const user_id = req.user.id;
  try {
    const updatedGroup = await groupService.updateGroup(req.supabase, id, { name, parent_group_id }, user_id);
    res.status(200).json(updatedGroup);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete a group
router.delete('/:id', isAuthenticated, async (req, res) => {
  const { id } = req.params;
  try {
    await groupService.deleteGroup(req.supabase, id);
    res.status(204).send();
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router; 