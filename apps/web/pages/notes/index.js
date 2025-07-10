import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/router';
import { supabase } from '../../utils/supabaseClient';
import NoteCard from '../../components/NoteCard';
import styles from '../../styles/Home.module.css';

export default function Notes() {
  const { user } = useAuth();
  const router = useRouter();
  const [notes, setNotes] = useState([]);

  useEffect(() => {
    if (!user) {
      router.push('/login');
    } else {
      fetchNotes();
    }
  }, [user]);

  const fetchNotes = async () => {
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .eq('user_id', user.id);
    if (error) {
      console.error('Error fetching notes:', error);
    } else {
      setNotes(data);
    }
  };

  const createNewNote = async () => {
    const { data, error } = await supabase
      .from('notes')
      .insert({ title: 'New Note', content: '', user_id: user.id })
      .single();
    if (error) {
      console.error('Error creating note:', error);
    } else {
      router.push(`/notes/${data.id}`);
    }
  };

  return (
    <div className={styles.container}>
      <main>
        <h1 className={styles.title}>Your Notes</h1>
        <button onClick={createNewNote}>Create New Note</button>
        <div className={styles.grid}>
          {notes.map((note) => (
            <NoteCard key={note.id} note={note} />
          ))}
        </div>
      </main>
    </div>
  );
}
