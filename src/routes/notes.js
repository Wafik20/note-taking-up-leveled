
const express = require('express');
const router = express.Router();
const noteService = require('../services/noteService');
const { isAuthenticated } = require('../middleware/auth');

// Create a new note
router.post('/', isAuthenticated, async (req, res) => {
  const { title, content } = req.body;
  const owner_id = req.user.id; 
  try {
    // Pass the user-scoped client from middleware to the service
    const note = await noteService.createNote(req.supabase, { title, content, owner_id });
    res.status(201).json(note);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get all notes for the authenticated user
router.get('/', isAuthenticated, async (req, res) => {
  try {
    const notes = await noteService.getNotes(req.supabase);
    res.status(200).json(notes);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get a specific note by ID
router.get('/:id', isAuthenticated, async (req, res) => {
  const { id } = req.params;
  try {
    const note = await noteService.getNoteById(req.supabase, id);
    res.status(200).json(note);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

// Update a note
router.put('/:id', isAuthenticated, async (req, res) => {
  const { id } = req.params;
  const { title, content } = req.body;
  const user_id = req.user.id;
  try {
    const updatedNote = await noteService.updateNote(req.supabase, id, { title, content }, user_id);
    res.status(200).json(updatedNote);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete a note
router.delete('/:id', isAuthenticated, async (req, res) => {
  const { id } = req.params;
  try {
    await noteService.deleteNote(req.supabase, id);
    res.status(204).send();
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Share a note with another user
router.post('/:id/share', isAuthenticated, async (req, res) => {
    const { id } = req.params;
    const { user_id: shared_with_user_id, can_edit } = req.body;

    try {
        const permission = await noteService.shareNote(req.supabase, id, shared_with_user_id, can_edit);
        res.status(201).json(permission);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

module.exports = router;
