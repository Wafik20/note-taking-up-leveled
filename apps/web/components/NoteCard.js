import Link from 'next/link';
import styles from '../styles/Home.module.css';

export default function NoteCard({ note }) {
  return (
    <Link href={`/notes/${note.id}`} className={styles.card}>
      <h3>{note.title}</h3>
    </Link>
  );
}
