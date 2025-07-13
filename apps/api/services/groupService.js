// groupService.js

module.exports = {
  // Get all groups for the authenticated user
  async getGroups(supabase) {
    const { data, error } = await supabase
      .from('note_groups')
      .select('*')
      .order('created_at', { ascending: true });
    if (error) throw new Error(error.message);
    return data;
  },

  // Create a new group
  async createGroup(supabase, { name, parent_group_id, owner_id }) {
    const { data, error } = await supabase
      .from('note_groups')
      .insert([{ name, parent_group_id: parent_group_id || null, owner_id }])
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data;
  },

  // Update a group (rename or move)
  async updateGroup(supabase, id, { name, parent_group_id }, user_id) {
    // Only allow update if user owns the group (RLS should enforce this too)
    const { data, error } = await supabase
      .from('note_groups')
      .update({ name, parent_group_id: parent_group_id || null })
      .eq('id', id)
      .eq('owner_id', user_id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data;
  },

  // Delete a group
  async deleteGroup(supabase, id) {
    const { error } = await supabase
      .from('note_groups')
      .delete()
      .eq('id', id);
    if (error) throw new Error(error.message);
    return true;
  },
}; 