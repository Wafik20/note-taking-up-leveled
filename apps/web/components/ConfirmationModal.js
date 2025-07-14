import { useEffect } from 'react';

export default function ConfirmationModal({ 
  open, 
  onClose, 
  onConfirm, 
  title = 'Confirm Action', 
  message = 'Are you sure you want to proceed?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmButtonStyle = 'danger'
}) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [open]);

  if (!open) return null;

  const getConfirmButtonStyle = () => {
    switch (confirmButtonStyle) {
      case 'danger':
        return { background: '#f44336', color: '#fff' };
      case 'warning':
        return { background: '#ff9800', color: '#fff' };
      default:
        return { background: 'var(--primary)', color: '#fff' };
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '1rem'
    }}>
      <div style={{
        background: '#fff',
        borderRadius: 12,
        padding: '2rem',
        maxWidth: 400,
        width: '100%',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        animation: 'slideIn 0.2s ease-out'
      }}>
        <h3 style={{
          margin: '0 0 1rem 0',
          fontSize: '1.25rem',
          fontWeight: 600,
          color: '#222'
        }}>
          {title}
        </h3>
        
        <p style={{
          margin: '0 0 2rem 0',
          color: '#666',
          lineHeight: 1.5,
          fontSize: '1rem'
        }}>
          {message}
        </p>
        
        <div style={{
          display: 'flex',
          gap: '1rem',
          justifyContent: 'flex-end'
        }}>
          <button
            onClick={onClose}
            style={{
              background: '#f8f9fa',
              color: '#666',
              border: '1px solid #e9ecef',
              borderRadius: 8,
              padding: '0.75rem 1.5rem',
              fontSize: '1rem',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = '#e9ecef';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = '#f8f9fa';
            }}
          >
            {cancelText}
          </button>
          
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            style={{
              ...getConfirmButtonStyle(),
              border: 'none',
              borderRadius: 8,
              padding: '0.75rem 1.5rem',
              fontSize: '1rem',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.opacity = '0.9';
            }}
            onMouseLeave={(e) => {
              e.target.style.opacity = '1';
            }}
          >
            {confirmText}
          </button>
        </div>
      </div>
      
      <style jsx>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(-10px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
      `}</style>
    </div>
  );
} 