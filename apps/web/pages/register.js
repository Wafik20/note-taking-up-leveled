import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/router';
import styles from '../styles/Home.module.css';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const { signUp } = useAuth();
  const router = useRouter();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const { error } = await signUp({ email, password });
      if (error) throw error;
      router.push('/notes');
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div className={styles.authPageContainer}>
      <div className={styles.authCard}>
        <h1 className={styles.authTitle}>Register</h1>
        {error && <p className={styles.authError}>{error}</p>}
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
