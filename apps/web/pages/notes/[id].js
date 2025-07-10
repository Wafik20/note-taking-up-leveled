import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/router';
import { supabase } from '../../utils/supabaseClient';
import styles from '../../styles/Home.module.css';

export default function NoteEditor() {
  const { user } = useAuth();
  const router = useRouter();
  const { id } = router.query;
  const [note, setNote] = useState(null);
  const [content, setContent] = useState('');
  const [collaborators, setCollaborators] = useState([]);
  const [newCollaboratorEmail, setNewCollaboratorEmail] = useState('');

  useEffect(() => {
    if (!user) {
      router.push('/login');
    } else if (id) {
      fetchNote();
      fetchCollaborators();
      const subscription = supabase
        .from(`notes:id=eq.${id}`)
        .on('UPDATE', (payload) => {
          setNote(payload.new);
          setContent(payload.new.content);
        })
        .subscribe();

      return () => {
        supabase.removeSubscription(subscription);
      };
    }
  }, [user, id]);

  const fetchNote = async () => {
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .eq('id', id)
      .single();
    if (error) {
      console.error('Error fetching note:', error);
    } else {
      setNote(data);
      setContent(data.content);
    }
  };

  const fetchCollaborators = async () => {
    const { data, error } = await supabase
      .from('collaborators')
      .select('user_id, users(email)')
      .eq('note_id', id);
    if (error) {
      console.error('Error fetching collaborators:', error);
    } else {
      setCollaborators(data);
    }
  };

  const updateNote = async () => {
    const { error } = await supabase
      .from('notes')
      .update({ content })
      .eq('id', id);
    if (error) {
      console.error('Error updating note:', error);
    }
  };

  const addCollaborator = async (e) => {
    e.preventDefault();
    const { data: newCollaborator, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('email', newCollaboratorEmail)
      .single();

    if (userError || !newCollaborator) {
      console.error('Error finding user:', userError);
      return;
    }

    const { error } = await supabase
      .from('collaborators')
      .insert({ note_id: id, user_id: newCollaborator.id });
    if (error) {
      console.error('Error adding collaborator:', error);
    } else {
      fetchCollaborators();
      setNewCollaboratorEmail('');
    }
  };

  return (
    <div className={styles.container}>
      <main>
        {note && (
          <>
            <h1 className={styles.title}>{note.title}</h1>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onBlur={updateNote}
              className={styles.textarea}
            />
            <div className={styles.share}>
              <h2>Collaborators</h2>
              <ul>
                {collaborators.map((c) => (
                  <li key={c.user_id}>{c.users.email}</li>
                ))}
              </ul>
              <form onSubmit={addCollaborator}>
                <input
                  type="email"
                  placeholder="Email to invite"
                  value={newCollaboratorEmail}
                  onChange={(e) => setNewCollaboratorEmail(e.target.value)}
                  required
                />
                <button type="submit">Share</button>
              </form>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
