import Head from 'next/head';
import Header from '@components/Header';
import Footer from '@components/Footer';
import SerialConnection from '@components/SerialConnection';

export default function Home() {
  return (
    <div className="container">
      <Head>
        <title>Avery Pathfinder 6140 Calibration</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <Header title="Avery Pathfinder 6140 Calibration" />
        <SerialConnection />
      </main>

      <Footer />

      <style jsx>{`
        .container {
          min-height: 100vh;
          padding: 0 1rem;
          display: flex;
          flex-direction: column;
        }
        main {
          padding: 2rem 0;
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
      `}</style>
    </div>
  );
}