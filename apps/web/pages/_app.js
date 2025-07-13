import { AuthProvider } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import '../styles/global.css';
import { NotificationProvider } from '../context/NotificationContext';
import Notification from '../components/Notification';

function MyApp({ Component, pageProps }) {
  return (
    <NotificationProvider>
      <AuthProvider>
        <Notification />
        <Navbar />
        <Component {...pageProps} />
      </AuthProvider>
    </NotificationProvider>
  );
}

export default MyApp;
