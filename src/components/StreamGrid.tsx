import { StreamCard } from './StreamCard';

const mockStreams = [
  {
    id: 1,
    thumbnail: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&h=450&fit=crop',
    title: 'Building DApps on Solana - Live Coding Session',
    streamer: 'SolDev',
    viewers: 2435,
    category: 'Development',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=SolDev'
  },
  {
    id: 2,
    thumbnail: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800&h=450&fit=crop',
    title: 'NFT Drop Party - Exclusive Solana Collection',
    streamer: 'CryptoQueen',
    viewers: 5821,
    category: 'NFTs',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=CryptoQueen'
  },
  {
    id: 3,
    thumbnail: 'https://images.unsplash.com/photo-1614332287897-cdc485fa562d?w=800&h=450&fit=crop',
    title: 'DeFi Trading Strategies & Market Analysis',
    streamer: 'TraderJoe',
    viewers: 3142,
    category: 'Trading',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=TraderJoe'
  },
  {
    id: 4,
    thumbnail: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&h=450&fit=crop',
    title: 'Gaming Tournament - Play to Earn on Solana',
    streamer: 'GameMaster',
    viewers: 8956,
    category: 'Gaming',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=GameMaster'
  },
  {
    id: 5,
    thumbnail: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800&h=450&fit=crop',
    title: 'Web3 Music Production & NFT Releases',
    streamer: 'BeatMaker',
    viewers: 1872,
    category: 'Music',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=BeatMaker'
  },
  {
    id: 6,
    thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&h=450&fit=crop',
    title: 'Solana Ecosystem Updates & News',
    streamer: 'SolanaDaily',
    viewers: 4521,
    category: 'News',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=SolanaDaily'
  },
  {
    id: 7,
    thumbnail: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=800&h=450&fit=crop',
    title: 'Community AMA - Future of Web3 Streaming',
    streamer: 'Web3Vision',
    viewers: 6234,
    category: 'Community',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Web3Vision'
  },
  {
    id: 8,
    thumbnail: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&h=450&fit=crop',
    title: 'Smart Contract Security Best Practices',
    streamer: 'SecureCode',
    viewers: 1956,
    category: 'Security',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=SecureCode'
  },
];

export const StreamGrid = () => {
  return (
    <section id="streams" className="py-12">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold">Live Now</h2>
          <div className="flex gap-2">
            <button className="text-sm px-4 py-2 rounded-full bg-primary text-primary-foreground">
              All
            </button>
            <button className="text-sm px-4 py-2 rounded-full bg-secondary text-secondary-foreground hover:bg-secondary/80">
              Gaming
            </button>
            <button className="text-sm px-4 py-2 rounded-full bg-secondary text-secondary-foreground hover:bg-secondary/80">
              Development
            </button>
            <button className="text-sm px-4 py-2 rounded-full bg-secondary text-secondary-foreground hover:bg-secondary/80">
              NFTs
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {mockStreams.map((stream) => (
            <StreamCard key={stream.id} {...stream} />
          ))}
        </div>
      </div>
    </section>
  );
};
