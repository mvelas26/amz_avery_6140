import { useEffect, useState } from 'react';
import '@styles/globals.css';

function MyApp({ Component, pageProps }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return mounted ? <Component {...pageProps} /> : null;
}

export default MyApp;
