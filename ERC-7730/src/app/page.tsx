import AddressHistory from '@/components/AddressHistory';
import Erc7730Generator from '@/components/Erc7730Generator';

export default function Home() {
  return (
    <main style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2rem', padding: '2rem' }}>
      <section style={{ width: '100%', maxWidth: 600 }}>
        <h1 style={{ textAlign: 'center' }}>ERC-7730 Generator</h1>
        <Erc7730Generator />
      </section>
      <section style={{ width: '100%', maxWidth: 600 }}>
        <h2 style={{ textAlign: 'center' }}>Address History</h2>
        <AddressHistory />
      </section>
    </main>
  );
}