import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/router';
import NotesDashboard from '../../components/NotesDashboard';
import { useNotification } from '../../context/NotificationContext';

export default function NotesPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { showNotification } = useNotification();
  const [groups, setGroups] = useState([]);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push('/login');
    } else {
      fetchData();
    }
    // eslint-disable-next-line
  }, [user]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const [groupsRes, notesRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/groups`, {
          headers: { 'Authorization': `Bearer ${token}` },
        }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/notes`, {
          headers: { 'Authorization': `Bearer ${token}` },
        })
      ]);
      const groupsData = groupsRes.ok ? await groupsRes.json() : [];
      const notesData = notesRes.ok ? await notesRes.json() : [];
      setGroups(groupsData);
      setNotes(notesData);
    } catch (e) {
      showNotification('Error loading notes or groups', 'error');
    }
    setLoading(false);
  };

  if (loading) {
    return <div style={{ textAlign: 'center', marginTop: '4rem', color: '#b0b6be' }}>Loading...</div>;
  }

  return <NotesDashboard groups={groups} notes={notes} />;
}
