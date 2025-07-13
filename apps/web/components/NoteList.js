import NoteItem from './NoteItem';

export default function NoteList({ notes, selectedNoteId, setSelectedNoteId, onNoteSelect }) {
  return (
    <div style={{ flex: 1, padding: '2.5rem 2rem', minWidth: 0 }}>
      {notes.length === 0 ? (
        <div style={{ color: '#b0b6be', textAlign: 'center', marginTop: '3rem' }}>
          No notes here yet — create one!
        </div>
      ) : (
        notes.map(note => (
          <NoteItem key={note.id} note={note} setSelectedNoteId={setSelectedNoteId} onNoteSelect={onNoteSelect} />
        ))
      )}
    </div>
  );
} 