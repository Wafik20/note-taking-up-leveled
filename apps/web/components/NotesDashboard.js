import { useState } from 'react';
import GroupTreeSidebar from './GroupTreeSidebar';
import NoteList from './NoteList';
import NoteEditorModal from './NoteEditorModal';
import GroupModal from './GroupModal';
import { useNotification } from '../context/NotificationContext';

export default function NotesDashboard({ groups: initialGroups, notes: initialNotes }) {
  const [groups, setGroups] = useState(initialGroups);
  const [notes, setNotes] = useState(initialNotes);
  const [selectedGroupId, setSelectedGroupId] = useState(null);
  const [selectedNoteId, setSelectedNoteId] = useState(null);
  const [showNoteEditor, setShowNoteEditor] = useState(false);
  const [noteEditorInitial, setNoteEditorInitial] = useState({});
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [groupModalInitial, setGroupModalInitial] = useState(null);
  const { showNotification } = useNotification();
  const [loadingGroups, setLoadingGroups] = useState(false);
  const [loadingNotes, setLoadingNotes] = useState(false);

  // Helper to refresh groups from backend
  const fetchGroups = async () => {
    setLoadingGroups(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/groups`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = res.ok ? await res.json() : [];
      setGroups(data);
    } catch (e) {
      showNotification('Error loading groups', 'error');
    }
    setLoadingGroups(false);
  };

  // Helper to refresh notes from backend
  const fetchNotes = async () => {
    setLoadingNotes(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/notes`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = res.ok ? await res.json() : [];
      setNotes(data);
    } catch (e) {
      showNotification('Error loading notes', 'error');
    }
    setLoadingNotes(false);
  };

  // Show modal for adding a note to a group
  const handleAddNote = (groupId = null) => {
    setNoteEditorInitial({ group_id: groupId || selectedGroupId });
    setShowNoteEditor(true);
  };

  // Handle note selection - open editor
  const handleNoteSelect = (noteId) => {
    const note = notes.find(n => n.id === noteId);
    if (note) {
      setNoteEditorInitial(note);
      setShowNoteEditor(true);
    }
  };

  // Create a new note (call backend, update state)
  const handleSaveNote = async (noteData) => {
    try {
      const token = localStorage.getItem('token');
      const isEdit = noteEditorInitial.id;
      
      // Ensure content is always a string for new notes
      const dataToSend = {
        ...noteData,
        content: noteData.content || ''
      };
      
      const url = isEdit 
        ? `${process.env.NEXT_PUBLIC_API_URL}/notes/${noteEditorInitial.id}`
        : `${process.env.NEXT_PUBLIC_API_URL}/notes`;
      
      const method = isEdit ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(dataToSend),
      });
      
      if (!res.ok) throw new Error(await res.text());
      const savedNote = await res.json();
      
      showNotification(isEdit ? 'Note updated!' : 'Note created!', 'success');
      await fetchNotes();
      setShowNoteEditor(false);
    } catch (e) {
      showNotification('Error saving note', 'error');
    }
  };

  // Delete a note
  const handleDeleteNote = async (noteId) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/notes/${noteId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      
      if (!res.ok) throw new Error(await res.text());
      
      showNotification('Note deleted!', 'success');
      await fetchNotes();
      setShowNoteEditor(false);
    } catch (e) {
      showNotification('Error deleting note', 'error');
    }
  };

  // --- GROUP CRUD ---
  // Create group (optionally as subgroup)
  const handleCreateGroup = async (name, cb, parent_group_id = null) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/groups`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ name, parent_group_id }),
      });
      if (!res.ok) throw new Error(await res.text());
      const group = await res.json();
      showNotification('Group created!', 'success');
      await fetchGroups();
      if (cb) cb(group);
    } catch (e) {
      showNotification('Error creating group', 'error');
    }
  };

  // Rename/move group
  const handleRenameGroup = async (groupId, { name, parent_group_id }) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/groups/${groupId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ name, parent_group_id }),
      });
      if (!res.ok) throw new Error(await res.text());
      showNotification('Group updated!', 'success');
      await fetchGroups();
    } catch (e) {
      showNotification('Error updating group', 'error');
    }
  };

  // Delete group
  const handleDeleteGroup = async (groupId) => {
    if (!window.confirm('Are you sure you want to delete this group and all its subgroups/notes?')) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/groups/${groupId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(await res.text());
      showNotification('Group deleted!', 'success');
      await fetchGroups();
    } catch (e) {
      showNotification('Error deleting group', 'error');
    }
  };

  // Modal triggers
  const openCreateGroupModal = (parent_group_id = null) => {
    setGroupModalInitial(parent_group_id ? { parent_group_id } : null);
    setShowGroupModal(true);
  };
  const openRenameGroupModal = (group) => {
    setGroupModalInitial(group);
    setShowGroupModal(true);
  };

  // Handle modal save
  const handleGroupModalSave = async (data) => {
    setShowGroupModal(false);
    if (groupModalInitial && groupModalInitial.id) {
      // Edit
      await handleRenameGroup(groupModalInitial.id, data);
    } else {
      // Create
      await handleCreateGroup(data.name, null, data.parent_group_id);
    }
  };

  // Notes for selected group
  const notesForSelectedGroup = notes.filter(n => n.group_id === selectedGroupId);

  return (
    <div style={{ display: 'flex', minHeight: '80vh' }}>
      <GroupTreeSidebar
        groups={groups}
        notes={notes}
        selectedGroupId={selectedGroupId}
        setSelectedGroupId={setSelectedGroupId}
        setSelectedNoteId={setSelectedNoteId}
        onAddNote={handleAddNote}
        onAddGroup={openCreateGroupModal}
        onRenameGroup={openRenameGroupModal}
        onDeleteGroup={handleDeleteGroup}
        loadingGroups={loadingGroups}
        onNoteSelect={handleNoteSelect}
      />
      <main style={{ flex: 1, padding: '2.5rem 2rem', minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'left', marginBottom: 24 }}>
          <h2 style={{ fontWeight: 800, fontSize: 22, marginRight: '20px' }}>
            {groups.find(g => g.id === selectedGroupId)?.name || 'All Notes'}
          </h2>
          <button
            style={{ background: 'var(--primary)', color: '#fff', border: 'none', borderRadius: 999, padding: '0.7rem 2rem', fontWeight: 700, fontSize: 16, cursor: 'pointer' }}
            onClick={() => handleAddNote(selectedGroupId)}
          >
            + Create Note
          </button>
          <button
            style={{ marginLeft: 16, background: '#22c55e', color: '#fff', border: 'none', borderRadius: 999, padding: '0.7rem 2rem', fontWeight: 700, fontSize: 16, cursor: 'pointer' }}
            onClick={() => openCreateGroupModal(null)}
          >
            + New Group
          </button>
        </div>
        <NoteList
          notes={notesForSelectedGroup}
          groups={groups}
          selectedGroupId={selectedGroupId}
          selectedNoteId={selectedNoteId}
          setSelectedNoteId={setSelectedNoteId}
          onNoteSelect={handleNoteSelect}
          onAddNote={handleAddNote}
          onAddGroup={openCreateGroupModal}
          onRenameGroup={openRenameGroupModal}
          onDeleteGroup={handleDeleteGroup}
          onGroupSelect={setSelectedGroupId}
        />
      </main>
      <NoteEditorModal
        open={showNoteEditor}
        onClose={() => setShowNoteEditor(false)}
        onSave={handleSaveNote}
        onDelete={handleDeleteNote}
        groups={groups}
        initialNote={noteEditorInitial}
        onCreateGroup={handleCreateGroup}
      />
      <GroupModal
        open={showGroupModal}
        onClose={() => setShowGroupModal(false)}
        onSave={handleGroupModalSave}
        groups={groups}
        initialGroup={groupModalInitial}
      />
    </div>
  );
} 