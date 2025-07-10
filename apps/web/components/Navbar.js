import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import styles from '../styles/Home.module.css';

export default function Navbar() {
  const { user, signOut } = useAuth();

  return (
    <nav className={styles.nav}>
      <ul>
        <li>
          <Link href="/">
            <a>Home</a>
          </Link>
        </li>
        {user ? (
          <>
            <li>
              <Link href="/notes">
                <a>Notes</a>
              </Link>
            </li>
            <li>
              <button onClick={signOut}>Sign Out</button>
            </li>
          </>
        ) : (
          <>
            <li>
              <Link href="/login">
                <a>Login</a>
              </Link>
            </li>
            <li>
              <Link href="/register">
                <a>Register</a>
              </Link>
            </li>
          </>
        )}
      </ul>
    </nav>
  );
}
