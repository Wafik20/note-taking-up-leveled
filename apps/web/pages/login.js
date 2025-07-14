import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/router';
import styles from '../styles/Home.module.css';
import { useNotification } from '../context/NotificationContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { signIn } = useAuth();
  const router = useRouter();
  const { showNotification } = useNotification();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signIn({ email, password });
      router.push('/notes');
    } catch (error) {
      // If error.message is a JSON string, try to parse and extract .error
      let msg = error.message;
      try {
        const parsed = JSON.parse(error.message);
        if (parsed && parsed.error) msg = parsed.error;
      } catch {}
      showNotification(msg || 'Login failed', 'error');
    }
  };

  return (
    <div className={styles.authPageContainer}>
      <div className={styles.authCard}>
        <h1 className={styles.authTitle}>Login</h1>
        <form onSubmit={handleLogin} className={styles.authForm}>
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
          <button type="submit">Login</button>
        </form>
      </div>
    </div>
  );
}
