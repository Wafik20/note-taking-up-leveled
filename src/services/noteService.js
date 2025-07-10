
// Each function now accepts a user-scoped supabase client
// to ensure RLS policies are applied correctly.

async function createNote(supabase, { title, content, owner_id }) {
  const { data, error } = await supabase
    .from('notes')
    .insert([{ title, content, owner_id }])
    .select()
    .single(); // Use single to get the object directly

  if (error) throw new Error(error.message);
  return data;
}

async function getNotes(supabase) {
  // RLS handles security, so the query is simple.
  // Removed the problematic join to users table to fix the 400 error.
  const { data, error } = await supabase
    .from('notes')
    .select(`*, note_permissions(*)`);

  if (error) throw new Error(error.message);
  return data;
}

async function getNoteById(supabase, id) {
    // RLS handles security. If the user doesn't have access, this will return null.
    // Removed the problematic join to users table to fix the 400 error.
    const { data, error } = await supabase
      .from('notes')
      .select(`*, note_permissions(*), note_edits(*)`)
      .eq('id', id)
      .single();
  
    if (error && error.code !== 'PGRST116') { // Ignore "exact one row" error for not found
        throw new Error(error.message);
    }
    if (!data) throw new Error('Note not found or you do not have permission to view it.');
    return data;
}

async function updateNote(supabase, id, { title, content }, user_id) {
    const { data: originalNote, error: getError } = await supabase
        .from('notes')
        .select('content')
        .eq('id', id)
        .single();

    if (getError) throw new Error('Note not found or permission denied.');

    const { data, error } = await supabase
        .from('notes')
        .update({ title, content })
        .eq('id', id)
        .select()
        .single();

    if (error) throw new Error(error.message);
  
    // Log the edit in the note_edits table
    const { error: editError } = await supabase
        .from('note_edits')
        .insert([{ note_id: id, editor_id: user_id, old_content: originalNote.content, new_content: content }]);

    if (editError) console.error('Failed to log note edit:', editError.message);

    // Broadcast the update, including the editor's ID
    const channel = supabase.channel(`note-edit:${id}`);
    channel.send({
        type: 'broadcast',
        event: 'note:update',
        payload: { ...data, editor_id: user_id },
    });

    return data;
}

async function deleteNote(supabase, id) {
    // RLS ensures only the owner can delete.
    const { data, error } = await supabase
        .from('notes')
        .delete()
        .eq('id', id);

    if (error) throw new Error(error.message);
    return data;
}

async function shareNote(supabase, note_id, shared_with_user_id, can_edit) {
    // RLS on the note_permissions table ensures only the owner can insert.
    const { data, error } = await supabase
        .from('note_permissions')
        .insert([{ note_id, user_id: shared_with_user_id, can_edit }])
        .select()
        .single();

    if (error) {
        if (error.code === '23505') { // Unique constraint violation
            throw new Error('Note is already shared with this user.');
        }
        throw new Error(error.message);
    }
    return data;
}

module.exports = {
  createNote,
  getNotes,
  getNoteById,
  updateNote,
  deleteNote,
  shareNote,
};
