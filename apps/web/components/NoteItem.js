import { formatDateTime, getNoteExcerpt } from '../utils/noteUtils';
import { useRouter } from 'next/router';

export default function NoteItem({ note, setSelectedNoteId, onNoteSelect }) {
  const router = useRouter();

  const handleNoteClick = () => {
    setSelectedNoteId(note.id);
    // Navigate to the full note page
    router.push(`/notes/${note.id}`);
  };

  const handleOpenClick = (e) => {
    e.stopPropagation();
    // Navigate to the full note page
    router.push(`/notes/${note.id}`);
  };

  const handleEditClick = (e) => {
    e.stopPropagation();
    if (onNoteSelect) {
      onNoteSelect(note.id);
    }
  };

  return (
    <div
      style={{
        padding: '0.5rem 0.7rem',
        borderRadius: 6,
        marginBottom: 2,
        background: '#fff',
        boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
        cursor: 'pointer',
        marginTop: 4,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}
      onClick={handleNoteClick}
      tabIndex={0}
      role="button"
    >
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 600, fontSize: 15 }}>{note.title || 'Untitled Note'}</div>
        <div style={{ fontSize: 12, color: '#888', margin: '2px 0' }}>{formatDateTime(note.createdAt || note.created_at)}</div>
        <span style={{ fontSize: 11, color: note.readOnly ? '#b0b6be' : '#22c55e', fontWeight: 600, marginRight: 8 }}>
          {note.readOnly ? 'Read-only' : 'Editable'}
        </span>
        <div style={{ fontSize: 13, color: '#666', marginTop: 2 }}>{getNoteExcerpt(note.content, 20, 100)}</div>
      </div>
      <div style={{ display: 'flex', gap: 8, marginLeft: 12 }}>
        <button
          onClick={handleOpenClick}
          style={{
            background: '#f8fafc',
            color: '#333',
            border: '1px solid #eaeaea',
            borderRadius: 6,
            padding: '0.4rem 0.8rem',
            fontSize: 13,
            fontWeight: 600,
            cursor: 'pointer',
            minWidth: 60,
          }}
          title="Open note in full view"
        >
          Open
        </button>
        <button
          onClick={handleEditClick}
          style={{
            background: 'var(--primary)',
            color: '#fff',
            border: 'none',
            borderRadius: 6,
            padding: '0.4rem 0.8rem',
            fontSize: 13,
            fontWeight: 600,
            cursor: 'pointer',
            minWidth: 60,
          }}
          title="Edit note in modal"
        >
          Edit
        </button>
      </div>
    </div>
  );
} 