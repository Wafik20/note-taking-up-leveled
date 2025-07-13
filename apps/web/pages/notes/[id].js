import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/router';
import styles from '../../styles/Home.module.css';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useNotification } from '../../context/NotificationContext';
import { marked } from 'marked';

export default function NotePage() {
  const { user } = useAuth();
  const router = useRouter();
  const { id } = router.query;
  const [note, setNote] = useState(null);
  const [content, setContent] = useState('');
  const { showNotification } = useNotification();
  const previewRef = useRef(null);

  // Load MathJax with config for $...$ and $$...$$
  useEffect(() => {
    if (!window.MathJax) {
      // Add MathJax config
      const configScript = document.createElement('script');
      configScript.type = 'text/javascript';
      configScript.id = 'mathjax-config';
      configScript.text = `window.MathJax = {tex: {inlineMath: [['$', '$'], ['\\(', '\\)']], displayMath: [['$$', '$$'], ['\\[', '\\]']]}};`;
      document.head.appendChild(configScript);
      // Add MathJax script
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js';
      script.async = true;
      script.id = 'mathjax-script';
      document.head.appendChild(script);
    }
  }, []);

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

  // Render markdown and typeset math
  useEffect(() => {
    if (previewRef.current) {
      previewRef.current.innerHTML = marked.parse(content || '');
      // Wait for MathJax to be ready, then typeset
      function typeset() {
        if (window.MathJax && window.MathJax.typesetPromise) {
          window.MathJax.typesetPromise([previewRef.current]);
        } else {
          setTimeout(typeset, 200); // Retry until MathJax is ready
        }
      }
      typeset();
    }
  }, [content]);

  if (!note) {
    return <LoadingSpinner text="Loading note..." />;
  }

  return (
    <div className={styles.container}>
      <div className={styles.noteCardContainer}>
        <main className={styles.noteContainer}>
          <h1 className={styles.title}>{note.title}</h1>
          <div className={styles.markdownEditorLayout}>
            <textarea
              className={styles.markdownEditor}
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder="Write your markdown (with $math$) here..."
            />
            <div className={styles.markdownPreview} ref={previewRef} />
          </div>
          <div className={styles.buttonGroup}>
            <button onClick={saveNote}>Save</button>
            <button onClick={deleteNote}>Delete</button>
          </div>
        </main>
      </div>
    </div>
  );
}
