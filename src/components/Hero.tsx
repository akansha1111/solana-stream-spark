import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Button } from '@/components/ui/button';
import { Play, Zap } from 'lucide-react';

export const Hero = () => {
  const { connected } = useWallet();

  return (
    <section className="relative overflow-hidden py-20 lg:py-32">
      {/* Gradient Background */}
      <div className="absolute inset-0 gradient-hero opacity-50" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,hsl(270_91%_65%/0.1),transparent_50%)]" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-effect border border-primary/20 mb-6">
            <Zap className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">Powered by Solana</span>
          </div>

          {/* Heading */}
          <h1 className="text-4xl lg:text-7xl font-bold mb-6 leading-tight">
            Stream, Watch &{' '}
            <span className="gradient-primary bg-clip-text text-transparent">
              Earn
            </span>
            {' '}on Web3
          </h1>

          {/* Description */}
          <p className="text-lg lg:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            The next generation streaming platform built on Solana. Connect your wallet, discover amazing content, and support your favorite creators.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {connected ? (
              <Button size="lg" className="gradient-primary border-0 glow-primary group" onClick={() => window.location.href = '/go-live'}>
                <Play className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                Start Streaming
              </Button>
            ) : (
              <WalletMultiButton className="!text-base !h-12 !px-6" />
            )}
            <Button
              size="lg"
              variant="outline"
              className="border-primary/20"
              onClick={() => document.getElementById('streams')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
            >
              Explore Streams
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto mt-16">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">12.5K+</div>
              <div className="text-sm text-muted-foreground mt-1">Active Streamers</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">500K+</div>
              <div className="text-sm text-muted-foreground mt-1">Viewers</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">2.5M SOL</div>
              <div className="text-sm text-muted-foreground mt-1">Distributed</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
