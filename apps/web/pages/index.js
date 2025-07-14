import Head from 'next/head';
import styles from '../styles/Home.module.css';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

function PublicHomePage() {
  return (
    <>
      {/* Hero Section */}
      <main className={styles.heroMain}>
        <section className={styles.heroSection}>
          <h1 className={styles.heroTitle}>Note Taking Upleveled</h1>
          <p className={styles.heroTagline}>Markdown notes with math made effortless.</p>
          <p className={styles.heroDesc}>
            A modern, markdown-based note editor with LaTeX math rendering support — designed for students, researchers, developers, and anyone who wants more expressive, structured note-taking.
          </p>
          <div style={{display: 'flex', justifyContent: 'center', gap: '1.2rem'}}>
            <Link href="/register"><button className={styles.ctaButton}>Sign Up</button></Link>
            <Link href="/login"><button className={styles.ctaButton} style={{background: '#f4f6fa', color: 'var(--primary)'}}>Log In</button></Link>
          </div>
        </section>

        {/* Features Section */}
        <section className={styles.featuresSection}>
          <h2 className={styles.featuresTitle}>Features</h2>
          <div className={styles.featuresGrid}>
            <div className={styles.featureCard}>
              <span className={styles.featureIcon}>📝</span>
              <h3>Markdown note-taking</h3>
              <p>Write notes with headings, lists, code, and more. Live preview as you type.</p>
            </div>
            <div className={styles.featureCard}>
              <span className={styles.featureIcon}>∑</span>
              <h3>LaTeX math support</h3>
              <p>Render beautiful math formulas with MathJax. Inline and block math supported.</p>
            </div>
            <div className={styles.featureCard}>
              <span className={styles.featureIcon}>💾</span>
              <h3>Persistent saving</h3>
              <p>Your notes are saved and always accessible. Never lose your work.</p>
            </div>
            <div className={styles.featureCard}>
              <span className={styles.featureIcon}>🎯</span>
              <h3>Distraction-free interface</h3>
              <p>Clean, minimalist design helps you focus on your ideas.</p>
            </div>
            <div className={styles.featureCard}>
              <span className={styles.featureIcon}>⬇️</span>
              <h3>Export as Markdown</h3>
              <p>Download your notes as .md files for use anywhere.</p>
            </div>
          </div>
        </section>

        {/* Demo Screenshot Section */}
        <section className={styles.demoSection}>
          <h2 className={styles.demoTitle}>See it in Action</h2>
          <div className={styles.demoImagePlaceholder}>
            <span>Demo Screenshot / GIF Coming Soon</span>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className={styles.footer}>
        <div>
          <span className={styles.footerAppName}>Note Taking Upleveled</span> &copy; {new Date().getFullYear()}
        </div>
        <div className={styles.footerLinks}>
          <a href="https://github.com/" target="_blank" rel="noopener noreferrer">GitHub</a>
          <span>|</span>
          <a href="#">Privacy Policy</a>
          <span>|</span>
          <a href="#">Contact</a>
        </div>
      </footer>
    </>
  );
}

function UserHomePage() {
  const { user } = useAuth();
  const [recentNotes, setRecentNotes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchNotes() {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/notes`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setRecentNotes(data.slice(0, 5));
        }
      } catch (e) {}
      setLoading(false);
    }
    fetchNotes();
  }, []);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Today';
    if (diffDays === 2) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays - 1} days ago`;
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  };

  const getWordCount = (content) => {
    if (!content) return 0;
    return content.trim().split(/\s+/).filter(word => word.length > 0).length;
  };

  const getReadingTime = (content) => {
    const words = getWordCount(content);
    const readingTime = Math.ceil(words / 200); // Average reading speed
    return readingTime < 1 ? '< 1 min' : `${readingTime} min read`;
  };

  return (
    <main className={styles.userHomeMain}>
      <section className={styles.userHeroSection}>
        <h1 className={styles.userWelcome}>Welcome back, {user?.name || user?.email || 'there'}!</h1>
      </section>
      <section className={styles.userRecentSection}>
        <h2 className={styles.featuresTitle} style={{marginBottom: '1.2rem'}}>Recent Notes</h2>
        {loading ? <div>Loading...</div> : (
          <div className={styles.userNotesList}>
            {recentNotes.length === 0 ? (
              <div className={styles.userNoNotes}>No notes yet. Start writing!</div>
            ) : recentNotes.map(note => (
              <Link key={note.id} href={`/notes/${note.id}`} className={styles.userNoteCard}>
                <div style={{ flex: 1 }}>
                  <div className={styles.userNoteTitle}>{note.title || 'Untitled Note'}</div>
                  <div className={styles.userNoteSnippet}>
                    {note.content?.slice(0, 120) || 'No content yet...'}
                    {note.content && note.content.length > 120 && '...'}
                  </div>
                  <div style={{ 
                    display: 'flex', 
                    gap: '1rem', 
                    marginTop: '0.5rem',
                    fontSize: '0.8rem',
                    color: '#666'
                  }}>
                    <span>📅 {formatDate(note.updated_at || note.created_at)}</span>
                    <span>📝 {getWordCount(note.content)} words</span>
                    <span>⏱️ {getReadingTime(note.content)}</span>
                    {note.group_id && (
                      <span>📁 {note.group_name || 'Group'}</span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

export default function HomePage() {
  const { user } = useAuth();
  return (
    <div className={styles.container}>
      <Head>
        <title>Note Taking Upleveled</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      {user ? <UserHomePage /> : <PublicHomePage />}
    </div>
  );
}
