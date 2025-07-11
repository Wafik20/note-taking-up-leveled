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
            Home
          </Link>
        </li>
        {user ? (
          <>
            <li>
              <Link href="/notes">
                Notes
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
                Login
              </Link>
            </li>
            <li>
              <Link href="/register">
                Register
              </Link>
            </li>
          </>
        )}
      </ul>
    </nav>
  );
}
