import { useState, useEffect } from 'react';

export default function GroupModal({ open, onClose, onSave, groups, initialGroup }) {
  const isEdit = !!initialGroup;
  const [name, setName] = useState(initialGroup?.name || '');
  const [parentId, setParentId] = useState(initialGroup?.parent_group_id || '');

  useEffect(() => {
    setName(initialGroup?.name || '');
    setParentId(initialGroup?.parent_group_id || '');
  }, [initialGroup, open]);

  if (!open) return null;

  const handleSave = () => {
    if (name.trim()) {
      onSave({
        name: name.trim(),
        parent_group_id: parentId || null,
      });
    }
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div style={{ background: '#fff', borderRadius: 12, padding: '2.5rem 2rem', minWidth: 340, minHeight: 200, maxWidth: 420 }}>
        <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 18 }}>{isEdit ? 'Rename Group' : 'Create Group'}</div>
        <div style={{ marginBottom: 18 }}>
          <label style={{ fontWeight: 600, fontSize: 14 }}>Name:</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            style={{ width: '100%', padding: '0.7rem', fontSize: 15, borderRadius: 6, border: '1px solid #eaeaea', marginTop: 6 }}
            placeholder="Group name"
            autoFocus
          />
        </div>
        <div style={{ marginBottom: 18 }}>
          <label style={{ fontWeight: 600, fontSize: 14 }}>Parent Group:</label>
          <select
            value={parentId || ''}
            onChange={e => setParentId(e.target.value)}
            style={{ marginLeft: 8, padding: '0.4rem', borderRadius: 6, border: '1px solid #eaeaea', fontSize: 14 }}
          >
            <option value="">None (top level)</option>
            {groups.filter(g => !isEdit || g.id !== initialGroup?.id).map(g => (
              <option key={g.id} value={g.id}>{g.name}</option>
            ))}
          </select>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 18 }}>
          <button onClick={onClose} style={{ background: '#e0e7ef', color: '#333', border: 'none', borderRadius: 6, padding: '0.6rem 1.2rem', fontWeight: 600, fontSize: 15, cursor: 'pointer' }}>Cancel</button>
          <button onClick={handleSave} style={{ background: 'var(--primary)', color: '#fff', border: 'none', borderRadius: 6, padding: '0.6rem 1.2rem', fontWeight: 600, fontSize: 15, cursor: 'pointer' }} disabled={!name.trim()}>{isEdit ? 'Save' : 'Create'}</button>
        </div>
      </div>
    </div>
  );
} 