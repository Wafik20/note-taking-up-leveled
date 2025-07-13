import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/router';
import styles from '../../styles/Home.module.css';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useNotification } from '../../context/NotificationContext';

export default function NotePage() {
  const { user } = useAuth();
  const router = useRouter();
  const { id } = router.query;
  const [note, setNote] = useState(null);
  const [content, setContent] = useState('');
  const { showNotification } = useNotification();

  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user]);

  useEffect(() => {
    if (id) {
      fetchNote();
    }
  }, [id]);

  const fetchNote = async () => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/notes/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (response.ok) {
      const data = await response.json();
      setNote(data);
      setContent(data.content);
    } else {
      console.error('Error fetching note:', await response.text());
      router.push('/notes');
    }
  };

  const saveNote = async () => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/notes/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ content }),
    });

    if (response.ok) {
      showNotification('Note saved!', 'success');
    } else {
      console.error('Error updating note:', await response.text());
    }
  };

  const deleteNote = async () => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/notes/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (response.ok) {
      router.push('/notes');
    } else {
      console.error('Error deleting note:', await response.text());
    }
  };

  if (!note) {
    return <LoadingSpinner text="Loading note..." />;
  }

  return (
    <div className={styles.container}>
      <main className={styles.noteContainer}>
        <h1 className={styles.title}>{note.title}</h1>
        <textarea
          className={styles.textarea}
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        <div className={styles.buttonGroup}>
          <button onClick={saveNote}>Save</button>
          <button onClick={deleteNote}>Delete</button>
        </div>
      </main>
    </div>
  );
}
