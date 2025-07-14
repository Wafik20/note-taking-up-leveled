import NoteItem from './NoteItem';
import GroupItem from './GroupItem';

export default function NoteList({ 
  notes, 
  groups, 
  selectedGroupId, 
  selectedNoteId, 
  setSelectedNoteId, 
  onNoteSelect,
  onAddNote,
  onAddGroup,
  onRenameGroup,
  onDeleteGroup,
  onGroupSelect
}) {
  // Get subgroups of the selected group
  const subgroups = groups.filter(group => group.parent_group_id === selectedGroupId);
  
  // Show both subgroups and notes, or "no content" message
  return (
    <div style={{ flex: 1, padding: '2.5rem 2rem', minWidth: 0 }}>
      {subgroups.length === 0 && notes.length === 0 ? (
        <div style={{ color: '#b0b6be', textAlign: 'center', marginTop: '3rem' }}>
          No notes here yet — create one!
        </div>
      ) : (
        <>
          {/* Show subgroups if any exist */}
          {subgroups.length > 0 && (
            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{ color: '#666', fontSize: 16, marginBottom: '1rem' }}>Subgroups:</h3>
              <div style={{ display: 'grid', gap: '1rem' }}>
                {subgroups.map(group => (
                  <div
                    key={group.id}
                    style={{
                      background: '#fff',
                      border: '1px solid #eaeaea',
                      borderRadius: 8,
                      padding: '1rem',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                    }}
                    onClick={() => {
                      // Navigate to the subgroup by updating the selected group
                      if (onGroupSelect) {
                        onGroupSelect(group.id);
                      }
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.transform = 'translateY(-2px)';
                      e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div>
                        <h4 style={{ margin: 0, fontSize: 18, fontWeight: 600, color: '#222' }}>
                          {group.name}
                        </h4>
                        <p style={{ margin: '0.5rem 0 0 0', color: '#666', fontSize: 14 }}>
                          Click to view this subgroup
                        </p>
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          style={{
                            background: 'var(--primary)',
                            color: '#fff',
                            border: 'none',
                            borderRadius: 6,
                            padding: '0.5rem 1rem',
                            fontSize: 14,
                            cursor: 'pointer',
                            fontWeight: 500
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            onAddNote(group.id);
                          }}
                        >
                          + Note
                        </button>
                        {group.id !== 'ungrouped' && (
                          <button
                            style={{
                              background: '#22c55e',
                              color: '#fff',
                              border: 'none',
                              borderRadius: 6,
                              padding: '0.5rem 1rem',
                              fontSize: 14,
                              cursor: 'pointer',
                              fontWeight: 500
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              onAddGroup(group.id);
                            }}
                          >
                            + Subgroup
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Show notes if any exist */}
          {notes.length > 0 && (
            <div>
              <h3 style={{ color: '#666', fontSize: 16, marginBottom: '1rem' }}>Notes:</h3>
              {notes.map(note => (
                <NoteItem key={note.id} note={note} setSelectedNoteId={setSelectedNoteId} onNoteSelect={onNoteSelect} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
} 