import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/router';
import NoteCard from '../../components/NoteCard';
import CreateNoteModal from '../../components/CreateNoteModal';
import styles from '../../styles/Home.module.css';

export default function Notes() {
  const { user } = useAuth();
  const router = useRouter();
  const [notes, setNotes] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push('/login');
    } else {
      fetchNotes();
    }
  }, [user]);

  const fetchNotes = async () => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/notes`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (response.ok) {
      const data = await response.json();
      setNotes(data);
    } else {
      console.error('Error fetching notes:', await response.text());
    }
  };

  const handleCreateNote = async (title) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/notes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ title, content: '' }),
    });

    if (response.ok) {
      const data = await response.json();
      setIsModalOpen(false);
      fetchNotes();
      router.push(`/notes/${data.id}`);
    } else {
      console.error('Error creating note:', await response.text());
    }
  };

  return (
    <div className={styles.container}>
      <main>
        <h1 className={styles.title}>Your Notes</h1>
        <button onClick={() => setIsModalOpen(true)}>Create New Note</button>
        <CreateNoteModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onCreate={handleCreateNote}
        />
        <div className={styles.grid}>
          {notes.map((note) => (
            <NoteCard key={note.id} note={note} />
          ))}
        </div>
      </main>
    </div>
  );
}
