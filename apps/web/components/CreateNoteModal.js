import { useState } from 'react';
import styles from '../styles/CreateNoteModal.module.css';

export default function CreateNoteModal({ isOpen, onClose, onCreate }) {
  const [title, setTitle] = useState('');

  if (!isOpen) {
    return null;
  }

  const handleCreate = () => {
    onCreate(title);
    setTitle('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleCreate();
    }
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <h2>Create New Note</h2>
        <input
          type="text"
          placeholder="Note Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <div className={styles.buttons}>
          <button onClick={onClose}>Cancel</button>
          <button onClick={handleCreate} disabled={!title}>
            Create
          </button>
        </div>
      </div>
    </div>
  );
}
