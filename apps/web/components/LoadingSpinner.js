import styles from '../styles/LoadingSpinner.module.css';

export default function LoadingSpinner({ text = 'Loading...' }) {
  return (
    <div className={styles.spinnerContainer}>
      <div className={styles.spinner}></div>
      <span className={styles.loadingText}>{text}</span>
    </div>
  );
} 