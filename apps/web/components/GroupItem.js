import { useState } from 'react';
import NoteItem from './NoteItem';

export default function GroupItem({ group, selectedGroupId, setSelectedGroupId, setSelectedNoteId, onAddNote, onAddGroup, onRenameGroup, onDeleteGroup, onNoteSelect }) {
  const [expanded, setExpanded] = useState(true);
  const isSelected = selectedGroupId === group.id;

  // Handlers for group actions
  const handleAddSubgroup = (e) => { e.stopPropagation(); onAddGroup && onAddGroup(group.id); };
  const handleRenameGroup = (e) => { e.stopPropagation(); onRenameGroup && onRenameGroup(group); };
  const handleDeleteGroup = (e) => { e.stopPropagation(); onDeleteGroup && onDeleteGroup(group.id); };

  return (
    <div style={{ marginBottom: '1rem', marginLeft: group.parent_group_id ? 18 : 0 }}>
      <div
        style={{
          display: 'flex', alignItems: 'center', cursor: 'pointer',
          fontWeight: isSelected ? 700 : 500,
          color: isSelected ? 'var(--primary)' : '#222',
          background: isSelected ? '#eaf3ff' : 'transparent',
          borderRadius: 6, padding: '0.2rem 0.3rem',
          boxShadow: isSelected ? '0 2px 8px rgba(0,112,243,0.07)' : 'none',
        }}
        onClick={() => setSelectedGroupId(group.id)}
      >
        <span onClick={e => { e.stopPropagation(); setExpanded(x => !x); }} style={{ marginRight: 8, fontSize: 18, userSelect: 'none', color: '#888' }}>
          {expanded ? '▼' : '▶'}
        </span>
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 120 }}>{group.name}</span>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 4 }}>
          <button style={{ fontSize: 13 }} title="Add note to this group" onClick={e => { e.stopPropagation(); onAddNote(group.id); }}>+ Note</button>
          {group.id !== 'ungrouped' && (
            <>
              <button style={{ fontSize: 13 }} title="Add subgroup" onClick={handleAddSubgroup}>+ Subgroup</button>
              <button style={{ fontSize: 13 }} title="Rename group" onClick={handleRenameGroup}>✏️</button>
              <button style={{ fontSize: 13, color: '#f44336' }} title="Delete group" onClick={handleDeleteGroup}>🗑️</button>
            </>
          )}
        </div>
      </div>
      {expanded && (
        <div style={{ marginLeft: 18 }}>
          {group.subgroups && group.subgroups.map(sub => (
            <GroupItem
              key={sub.id}
              group={sub}
              selectedGroupId={selectedGroupId}
              setSelectedGroupId={setSelectedGroupId}
              setSelectedNoteId={setSelectedNoteId}
              onAddNote={onAddNote}
              onAddGroup={onAddGroup}
              onRenameGroup={onRenameGroup}
              onDeleteGroup={onDeleteGroup}
            />
          ))}
          {group.notes && group.notes.map(note => (
            <NoteItem key={note.id} note={note} setSelectedNoteId={setSelectedNoteId} onNoteSelect={onNoteSelect} />
          ))}
        </div>
      )}
    </div>
  );
} 