import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/router';
import styles from '../styles/Home.module.css';
import { useNotification } from '../context/NotificationContext';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [confirmationSent, setConfirmationSent] = useState(false);
  const { signUp } = useAuth();
  const router = useRouter();
  const { showNotification } = useNotification();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await signUp({ email, password }); // No destructuring { error }
      setConfirmationSent(true);
    } catch (error) {
      // If error.message is a JSON string, try to parse and extract .error
      let msg = error.message;
      try {
        const parsed = JSON.parse(error.message);
        if (parsed && parsed.error) msg = parsed.error;
      } catch {}
      showNotification(msg || 'Registration failed', 'error');
    }
  };

  if (confirmationSent) {
    return (
      <div className={styles.authPageContainer}>
        <div className={styles.authCard}>
          <h1 className={styles.authTitle}>Check your email</h1>
          <p style={{ color: '#333', fontSize: '1.1rem', margin: '1.5rem 0' }}>
            A confirmation email has been sent to <b>{email}</b>.<br />
            Please check your inbox and follow the link to verify your account.
          </p>
          <button
            style={{
              background: 'var(--primary)',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              padding: '0.7rem 2rem',
              fontWeight: 600,
              fontSize: 16,
              cursor: 'pointer',
              marginTop: 16
            }}
            onClick={() => router.push('/login')}
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.authPageContainer}>
      <div className={styles.authCard}>
        <h1 className={styles.authTitle}>Register</h1>
        <form onSubmit={handleRegister} className={styles.authForm}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit">Register</button>
        </form>
      </div>
    </div>
  );
}
