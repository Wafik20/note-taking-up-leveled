// groups: [{id, name, parent_group_id, ...}]
// notes: [{id, title, group_id, ...}]
// Returns: [{...group, subgroups: [...], notes: [...]}, ...]
export function buildGroupTree(groups, notes) {
  const groupMap = {};
  groups.forEach(g => groupMap[g.id] = { ...g, subgroups: [], notes: [] });
  // Assign notes to their group
  notes.forEach(note => {
    if (note.group_id && groupMap[note.group_id]) {
      groupMap[note.group_id].notes.push(note);
    }
  });
  // Build tree
  const roots = [];
  groups.forEach(group => {
    if (group.parent_group_id && groupMap[group.parent_group_id]) {
      groupMap[group.parent_group_id].subgroups.push(groupMap[group.id]);
    } else {
      roots.push(groupMap[group.id]);
    }
  });
  // Add ungrouped notes as a special root
  const ungroupedNotes = notes.filter(n => !n.group_id);
  if (ungroupedNotes.length > 0) {
    roots.push({ id: 'ungrouped', name: 'Ungrouped', subgroups: [], notes: ungroupedNotes });
  }
  return roots;
} 