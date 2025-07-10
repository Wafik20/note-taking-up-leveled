import Link from 'next/link';
import styles from '../styles/Home.module.css';

export default function NoteCard({ note }) {
  return (
    <Link href={`/notes/${note.id}`}>
      <a className={styles.card}>
        <h3>{note.title}</h3>
        <p>{new Date(note.created_at).toLocaleDateString()}</p>
      </a>
    </Link>
  );
}
