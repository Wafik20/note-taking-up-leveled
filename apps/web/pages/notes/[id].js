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
  const [savedContent, setSavedContent] = useState('');
  const { showNotification } = useNotification();
  const previewRef = useRef(null);
  const [mode, setMode] = useState('edit'); // 'edit' or 'preview'
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState(''); // '', 'Saving...', 'Saved'
  const saveTimeout = useRef(null);

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

  useEffect(() => {
    if (content !== savedContent) {
      setSaveStatus('Saving...');
      setSaving(true);
      if (saveTimeout.current) clearTimeout(saveTimeout.current);
      saveTimeout.current = setTimeout(async () => {
        await saveNote();
        setSaving(false);
        setSaveStatus('Saved');
        setTimeout(() => setSaveStatus(''), 1200);
      }, 1000);
    }
    // Cleanup on unmount
    return () => {
      if (saveTimeout.current) clearTimeout(saveTimeout.current);
    };
  }, [content]);

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
      // Ensure content is always a string, never null
      const safeContent = data.content || '';
      setContent(safeContent);
      setSavedContent(safeContent);
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
      setSavedContent(content);
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
      const toRender = mode === 'preview' ? savedContent : content;
      previewRef.current.innerHTML = marked.parse(toRender || '');
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
  }, [content, savedContent, mode]);

  const hasUnsavedChanges = content !== savedContent;

  if (!note) {
    return <LoadingSpinner text="Loading note..." />;
  }

  return (
    <div className={styles.container}>
      <div className={styles.noteCardContainer}>
        <main className={styles.noteContainer}>
          <h1 className={styles.title}>{note.title}</h1>
          <div style={{ display: 'flex', justifyContent: 'flex-end', width: '100%', maxWidth: '1400px', marginBottom: '1.2rem' }}>
            <button
              style={{
                background: mode === 'edit' ? 'var(--primary)' : '#f4f6fa',
                color: mode === 'edit' ? '#fff' : 'var(--primary)',
                border: 'none',
                borderRadius: '999px',
                padding: '0.5rem 1.5rem',
                fontWeight: 600,
                fontSize: '1.05rem',
                marginRight: '0.7rem',
                cursor: 'pointer',
                boxShadow: '0 1px 4px rgba(0,0,0,0.03)',
                outline: 'none',
                transition: 'background 0.18s, color 0.18s',
              }}
              onClick={() => setMode('edit')}
              disabled={mode === 'edit'}
            >
              Edit
            </button>
            <button
              style={{
                background: mode === 'preview' ? 'var(--primary)' : '#f4f6fa',
                color: mode === 'preview' ? '#fff' : 'var(--primary)',
                border: 'none',
                borderRadius: '999px',
                padding: '0.5rem 1.5rem',
                fontWeight: 600,
                fontSize: '1.05rem',
                cursor: 'pointer',
                boxShadow: '0 1px 4px rgba(0,0,0,0.03)',
                outline: 'none',
                transition: 'background 0.18s, color 0.18s',
              }}
              onClick={() => setMode('preview')}
              disabled={mode === 'preview'}
            >
              Preview
            </button>
          </div>
          {mode === 'edit' ? (
            <>
              <div className={styles.markdownEditorLayout}>
                <textarea
                  className={styles.markdownEditor}
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  placeholder="Write your markdown (with $math$) here..."
                />
                <div className={styles.markdownPreview} ref={previewRef} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <span style={{ color: saving ? '#888' : '#22c55e', fontSize: 14 }}>{saveStatus}</span>
                <button onClick={deleteNote}>Delete</button>
              </div>
            </>
          ) : (
            <div className={styles.a4Preview} ref={previewRef} />
          )}
        </main>
      </div>
    </div>
  );
}
