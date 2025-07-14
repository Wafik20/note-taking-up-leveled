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
  
  // Check if this is the initial empty state (no groups and no notes at all)
  const isInitialEmptyState = groups.length === 0 && notes.length === 0;
  
  // Show both subgroups and notes, or appropriate message
  return (
    <div style={{ flex: 1, padding: '2.5rem 2rem', minWidth: 0 }}>
      {isInitialEmptyState ? (
        <div style={{ 
          textAlign: 'center', 
          marginTop: '3rem',
          padding: '2rem 1rem'
        }}>
          <div style={{ 
            fontSize: '4rem', 
            marginBottom: '1.5rem',
            opacity: 0.6
          }}>
            📝
          </div>
          <h2 style={{ 
            color: '#333', 
            fontSize: '1.5rem', 
            fontWeight: 700,
            marginBottom: '1rem'
          }}>
            Welcome to your notes!
          </h2>
          <p style={{ 
            color: '#666', 
            fontSize: '1rem',
            lineHeight: 1.6,
            marginBottom: '2.5rem',
            maxWidth: '500px',
            margin: '0 auto 2.5rem auto'
          }}>
            Start by creating your first note or group to organize your thoughts and ideas.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '300px', margin: '0 auto' }}>
            <button
              onClick={() => onAddNote()}
              style={{
                background: 'var(--primary)',
                color: '#fff',
                border: 'none',
                borderRadius: 10,
                padding: '1rem 2rem',
                fontSize: '1rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: '0 2px 8px rgba(0,112,243,0.2)'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 4px 12px rgba(0,112,243,0.3)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 2px 8px rgba(0,112,243,0.2)';
              }}
            >
              + Create Your First Note
            </button>
            <button
              onClick={() => onAddGroup()}
              style={{
                background: '#22c55e',
                color: '#fff',
                border: 'none',
                borderRadius: 10,
                padding: '1rem 2rem',
                fontSize: '1rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: '0 2px 8px rgba(34,197,94,0.2)'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 4px 12px rgba(34,197,94,0.3)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 2px 8px rgba(34,197,94,0.2)';
              }}
            >
              + Create Your First Group
            </button>
          </div>
        </div>
      ) : subgroups.length === 0 && notes.length === 0 ? (
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