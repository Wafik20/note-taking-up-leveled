import { AuthProvider } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import '../styles/global.css';

function MyApp({ Component, pageProps }) {
  return (
    <AuthProvider>
      <Navbar />
      <Component {...pageProps} />
    </AuthProvider>
  );
}

export default MyApp;
