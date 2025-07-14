import { useState, useEffect, useRef, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/router';
import styles from '../../styles/Home.module.css';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useNotification } from '../../context/NotificationContext';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import remarkRehype from 'remark-rehype';
import rehypeKatex from 'rehype-katex';
import rehypeStringify from 'rehype-stringify';
import 'katex/dist/katex.min.css';
import html2pdf from 'html2pdf.js';

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

  // Memoized HTML rendering with KaTeX
  const renderedHtml = useMemo(() => {
    const toRender = mode === 'preview' ? savedContent : content;
    try {
      const file = unified()
        .use(remarkParse)
        .use(remarkGfm)
        .use(remarkMath)
        .use(remarkRehype)
        .use(rehypeKatex)
        .use(rehypeStringify)
        .processSync(toRender || '');
      return String(file);
    } catch (e) {
      return '<div style="color:red">Error rendering markdown</div>';
    }
  }, [content, savedContent, mode]);

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

  // Add export to markdown handler
  const exportToMarkdown = () => {
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = (note?.title ? note.title.replace(/[^a-z0-9]/gi, '_').toLowerCase() : 'note') + '.md';
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 0);
  };

  // Add export to pdf handler
  const exportToPDF = () => {
    const element = document.createElement('div');
    element.style.padding = '2rem';
    element.innerHTML = `<h1 style='font-size:2rem;margin-bottom:1.5rem;'>${note?.title || ''}</h1>` + renderedHtml;
    html2pdf()
      .set({
        margin: 0.5,
        filename: (note?.title ? note.title.replace(/[^a-z0-9]/gi, '_').toLowerCase() : 'note') + '.pdf',
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
      })
      .from(element)
      .save();
  };

  const hasUnsavedChanges = content !== savedContent;

  if (!note) {
    return <LoadingSpinner text="Loading note..." />;
  }

  return (
    <div className={styles.container}>
      <div className={styles.noteCardContainer}>
        <main className={styles.noteContainer}>
          <h1 className={styles.title}>{note.title}</h1>
          <div style={{ display: 'flex', justifyContent: 'flex-end', width: '100%', maxWidth: '1400px', marginBottom: '1.2rem', gap: '0.7rem' }}>
            <button
              style={{
                background: mode === 'edit' ? 'var(--primary)' : '#f4f6fa',
                color: mode === 'edit' ? '#fff' : 'var(--primary)',
                border: 'none',
                borderRadius: '999px',
                padding: '0.5rem 1.5rem',
                fontWeight: 600,
                fontSize: '1.05rem',
                marginRight: 0,
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
            <button
              style={{
                background: '#f44336',
                color: '#fff',
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
              onClick={deleteNote}
            >
              Delete
            </button>
            <button
              style={{
                background: '#22c55e',
                color: '#fff',
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
              onClick={exportToMarkdown}
            >
              Export to Markdown
            </button>
            <button
              style={{
                background: '#6366f1',
                color: '#fff',
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
              onClick={exportToPDF}
            >
              Export to PDF
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
                <div className={styles.markdownPreview} dangerouslySetInnerHTML={{ __html: renderedHtml }} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <span style={{ color: saving ? '#888' : '#22c55e', fontSize: 14 }}>{saveStatus}</span>
              </div>
            </>
          ) : (
            <div className={styles.a4Preview} dangerouslySetInnerHTML={{ __html: renderedHtml }} />
          )}
        </main>
      </div>
    </div>
  );
}
