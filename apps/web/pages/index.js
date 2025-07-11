import Head from 'next/head';
import styles from '../styles/Home.module.css';
import { useState, useEffect } from 'react';

export default function Home() {
  const [apiResponse, setApiResponse] = useState('');

  useEffect(() => {
    async function checkApi() {
      try {
        console.log("checking api...");
        console.log(process.env.API_PORT);
        const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/ping`;
        const res = await fetch(apiUrl);
        const data = await res.json();
        setApiResponse(`API response: "${data.message}"`);
      } catch (error) {
        console.error('Error fetching from API:', error);
        setApiResponse('Could not connect to API. Is it running?');
      }
    }
    checkApi();
  }, []);

  return (
    <div className={styles.container}>
      <Head>
        <title>Next.js API Test</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <h1 className={styles.title}>
          Connecting to the API
        </h1>

        <p className={styles.description}>
          {apiResponse || 'Pinging API...'}
        </p>
      </main>

      <style jsx>{`
        main {
          padding: 5rem 0;
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
        }
      `}</style>

      <style jsx global>{`
        html,
        body {
          padding: 0;
          margin: 0;
          font-family:
            -apple-system,
            BlinkMacSystemFont,
            Segoe UI,
            Roboto,
            Oxygen,
            Ubuntu,
            Cantarell,
            Fira Sans,
            Droid Sans,
            Helvetica Neue,
            sans-serif;
        }
        * {
          box-sizing: border-box;
        }
      `}</style>
    </div>
  );
}
