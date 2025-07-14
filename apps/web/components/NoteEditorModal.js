import { useState, useEffect } from 'react';
import ConfirmationModal from './ConfirmationModal';

export default function NoteEditorModal({ open, onClose, onSave, onDelete, groups, initialNote = {}, onCreateGroup }) {
  const [title, setTitle] = useState(initialNote.title || '');
  const [groupId, setGroupId] = useState(initialNote.group_id || '');
  const [showGroupInput, setShowGroupInput] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const isEdit = !!initialNote.id;

  // Reset form when modal opens/closes or initialNote changes
  useEffect(() => {
    if (open) {
      setTitle(initialNote.title || '');
      setGroupId(initialNote.group_id || '');
    }
  }, [open, initialNote]);

  if (!open) return null;

  const handleSave = () => {
    onSave({ title, group_id: groupId || null });
  };

  const handleDelete = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    onDelete(initialNote.id);
  };

  const handleCreateGroup = () => {
    if (newGroupName.trim()) {
      onCreateGroup(newGroupName.trim(), (createdGroup) => {
        setGroupId(createdGroup.id);
        setShowGroupInput(false);
        setNewGroupName('');
      }, null);
    }
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div style={{ background: '#fff', borderRadius: 12, padding: '2.5rem 2rem', minWidth: 340, minHeight: 200, maxWidth: 420 }}>
        <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 18 }}>{isEdit ? 'Edit Note Details' : 'Create Note'}</div>
        <div style={{ marginBottom: 18 }}>
          <label style={{ fontWeight: 600, fontSize: 14, display: 'block', marginBottom: 6 }}>Title:</label>
          <input
            type="text"
            placeholder="Note title"
            value={title}
            onChange={e => setTitle(e.target.value)}
            style={{ width: '100%', padding: '0.7rem', fontSize: 15, borderRadius: 6, border: '1px solid #eaeaea' }}
          />
        </div>
        <div style={{ marginBottom: 18 }}>
          <label style={{ fontWeight: 600, fontSize: 14, display: 'block', marginBottom: 6 }}>Group:</label>
          <select
            value={groupId}
            onChange={e => setGroupId(e.target.value)}
            style={{ width: '100%', padding: '0.7rem', fontSize: 15, borderRadius: 6, border: '1px solid #eaeaea' }}
          >
            <option value="">Ungrouped</option>
            {groups.map(g => (
              <option key={g.id} value={g.id}>{g.name}</option>
            ))}
          </select>
          <button
            style={{ marginTop: 8, fontSize: 13, padding: '0.3rem 0.7rem', borderRadius: 6, border: '1px solid #eaeaea', background: '#f8fafc', cursor: 'pointer' }}
            onClick={() => setShowGroupInput(x => !x)}
            type="button"
          >
            + New Group
          </button>
        </div>
        {showGroupInput && (
          <div style={{ marginBottom: 18 }}>
            <input
              type="text"
              placeholder="New group name"
              value={newGroupName}
              onChange={e => setNewGroupName(e.target.value)}
              style={{ width: '70%', padding: '0.5rem', fontSize: 14, borderRadius: 6, border: '1px solid #eaeaea', marginRight: 8 }}
            />
            <button
              style={{ fontSize: 13, padding: '0.3rem 0.7rem', borderRadius: 6, border: '1px solid #eaeaea', background: '#22c55e', color: '#fff', cursor: 'pointer' }}
              onClick={handleCreateGroup}
              type="button"
            >
              Create
            </button>
            <button
              style={{ fontSize: 13, padding: '0.3rem 0.7rem', borderRadius: 6, border: '1px solid #eaeaea', background: '#f44336', color: '#fff', cursor: 'pointer', marginLeft: 6 }}
              onClick={() => { setShowGroupInput(false); setNewGroupName(''); }}
              type="button"
            >
              Cancel
            </button>
          </div>
        )}
        {isEdit && (
          <div style={{ marginBottom: 18, padding: '0.8rem', background: '#f8fafc', borderRadius: 6, border: '1px solid #eaeaea' }}>
            <div style={{ fontSize: 13, color: '#666', marginBottom: 4 }}>💡 Content editing tip:</div>
            <div style={{ fontSize: 12, color: '#888' }}>
              Use the "Open" button to edit the note content in the full editor with markdown support.
            </div>
          </div>
        )}
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, marginTop: 18 }}>
          <div>
            {isEdit && (
              <button 
                onClick={handleDelete} 
                style={{ 
                  background: '#f44336', 
                  color: '#fff', 
                  border: 'none', 
                  borderRadius: 6, 
                  padding: '0.6rem 1.2rem', 
                  fontWeight: 600, 
                  fontSize: 15, 
                  cursor: 'pointer' 
                }}
              >
                Delete
              </button>
            )}
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={onClose} style={{ background: '#e0e7ef', color: '#333', border: 'none', borderRadius: 6, padding: '0.6rem 1.2rem', fontWeight: 600, fontSize: 15, cursor: 'pointer' }}>Cancel</button>
            <button onClick={handleSave} style={{ background: 'var(--primary)', color: '#fff', border: 'none', borderRadius: 6, padding: '0.6rem 1.2rem', fontWeight: 600, fontSize: 15, cursor: 'pointer' }}>{isEdit ? 'Update' : 'Create'}</button>
          </div>
        </div>
      </div>
      <ConfirmationModal
        open={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={confirmDelete}
        title="Delete Note"
        message="Are you sure you want to delete this note? This action cannot be undone."
        confirmText="Delete Note"
        cancelText="Cancel"
        confirmButtonStyle="danger"
      />
    </div>
  );
} 