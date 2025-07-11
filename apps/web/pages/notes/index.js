import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/router';
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
    const token = localStorage.getItem('token');
    console.log(`notes/index.js: token from localStorage: ${token}`);
    const response = await fetch('/api/notes', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (response.ok) {
      const data = await response.json();
      setNotes(data);
    } else {
      console.log('notes/index.js: Error response from /api/notes');
      const errorText = await response.text();
      console.error('Error fetching notes:', errorText);
    }
  };

  const createNewNote = async () => {
    const token = localStorage.getItem('token');
    const response = await fetch('/api/notes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ title: 'New Note', content: '' }),
    });

    if (response.ok) {
      const data = await response.json();
      router.push(`/notes/${data.id}`);
    } else {
      console.error('Error creating note:', await response.text());
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
