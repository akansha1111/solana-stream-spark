import { WalletProvider } from '@/components/WalletProvider';
import { Navbar } from '@/components/Navbar';
import { Hero } from '@/components/Hero';
import { StreamGrid } from '@/components/StreamGrid';
import { Footer } from '@/components/Footer';

const Index = () => {
  return (
    <WalletProvider>
      <div className="min-h-screen bg-background">
        <Navbar />
        <main>
          <Hero />
          <StreamGrid />
        </main>
        <Footer />
      </div>
    </WalletProvider>
  );
};

export default Index;
