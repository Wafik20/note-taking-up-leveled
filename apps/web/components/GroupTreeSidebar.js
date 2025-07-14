import { buildGroupTree } from '../utils/groupTree';
import GroupItem from './GroupItem';

export default function GroupTreeSidebar({ groups, notes, selectedGroupId, setSelectedGroupId, setSelectedNoteId, onAddNote, onAddGroup, onRenameGroup, onDeleteGroup, loadingGroups, onNoteSelect }) {
  const tree = buildGroupTree(groups, notes);
  
  return (
    <aside style={{ minWidth: 430, maxWidth: 500, borderRight: '1.5px solid #eaeaea', padding: '2rem 1rem', background: '#f8fafc', height: '100%' }}>
      {loadingGroups ? (
        <div style={{ color: '#b0b6be', textAlign: 'center', marginTop: '2rem' }}>Loading groups...</div>
      ) : tree.length === 0 ? (
        <div style={{ 
          textAlign: 'center', 
          marginTop: '3rem',
          padding: '2rem 1rem'
        }}>
          <div style={{ 
            fontSize: '2rem', 
            marginBottom: '1rem',
            opacity: 0.5
          }}>
            📁
          </div>
          <p style={{ 
            color: '#888', 
            fontSize: '0.9rem',
            lineHeight: 1.4
          }}>
            Add notes or groups to view the tree structure here.
          </p>
        </div>
      ) : (
        tree.map(group => (
        <GroupItem
          key={group.id}
          group={group}
          selectedGroupId={selectedGroupId}
          setSelectedGroupId={setSelectedGroupId}
          setSelectedNoteId={setSelectedNoteId}
          onAddNote={onAddNote}
          onAddGroup={onAddGroup}
          onRenameGroup={onRenameGroup}
          onDeleteGroup={onDeleteGroup}
          onNoteSelect={onNoteSelect}
        />
        ))
      )}
    </aside>
  );
} 