import { StreamCard } from './StreamCard';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Stream {
  id: string;
  wallet_address: string;
  title: string;
  description: string;
  category: string;
  thumbnail_url: string;
  is_live: boolean;
  viewer_count: number;
}

interface MockStream {
  id: string;
  thumbnail: string;
  title: string;
  streamer: string;
  viewers: number;
  category: string;
  avatar: string;
}

const mockStreams: MockStream[] = [
  {
    id: 'mock-1',
    thumbnail: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&h=450&fit=crop',
    title: 'Building DApps on Solana - Live Coding Session',
    streamer: 'SolDev',
    viewers: 2435,
    category: 'Development',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=SolDev'
  },
  {
    id: 'mock-2',
    thumbnail: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800&h=450&fit=crop',
    title: 'NFT Drop Party - Exclusive Solana Collection',
    streamer: 'CryptoQueen',
    viewers: 5821,
    category: 'NFTs',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=CryptoQueen'
  },
  {
    id: 'mock-3',
    thumbnail: 'https://images.unsplash.com/photo-1614332287897-cdc485fa562d?w=800&h=450&fit=crop',
    title: 'DeFi Trading Strategies & Market Analysis',
    streamer: 'TraderJoe',
    viewers: 3142,
    category: 'Trading',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=TraderJoe'
  },
  {
    id: 'mock-4',
    thumbnail: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&h=450&fit=crop',
    title: 'Gaming Tournament - Play to Earn on Solana',
    streamer: 'GameMaster',
    viewers: 8956,
    category: 'Gaming',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=GameMaster'
  },
  {
    id: 'mock-5',
    thumbnail: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800&h=450&fit=crop',
    title: 'Web3 Music Production & NFT Releases',
    streamer: 'BeatMaker',
    viewers: 1872,
    category: 'Music',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=BeatMaker'
  },
  {
    id: 'mock-6',
    thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&h=450&fit=crop',
    title: 'Solana Ecosystem Updates & News',
    streamer: 'SolanaDaily',
    viewers: 4521,
    category: 'News',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=SolanaDaily'
  },
  {
    id: 'mock-7',
    thumbnail: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=800&h=450&fit=crop',
    title: 'Community AMA - Future of Web3 Streaming',
    streamer: 'Web3Vision',
    viewers: 6234,
    category: 'Community',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Web3Vision'
  },
  {
    id: 'mock-8',
    thumbnail: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&h=450&fit=crop',
    title: 'Smart Contract Security Best Practices',
    streamer: 'SecureCode',
    viewers: 1956,
    category: 'Security',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=SecureCode'
  },
];

export const StreamGrid = () => {
  const [liveStreams, setLiveStreams] = useState<Stream[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('All');

  useEffect(() => {
    // Fetch live streams
    const fetchStreams = async () => {
      const { data } = await supabase
        .from('streams')
        .select('*')
        .eq('is_live', true)
        .order('viewer_count', { ascending: false });

      if (data) setLiveStreams(data);
    };

    fetchStreams();

    // Subscribe to real-time updates
    const channel = supabase
      .channel('live-streams')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'streams',
        },
        () => {
          fetchStreams();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const allStreams = [...liveStreams, ...mockStreams];
  const filteredStreams = selectedCategory === 'All' 
    ? allStreams 
    : allStreams.filter(s => s.category === selectedCategory);

  return (
    <section id="streams" className="py-12">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold">Live Now</h2>
          <div className="flex gap-2">
            {['All', 'Gaming', 'Development', 'NFTs'].map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`text-sm px-4 py-2 rounded-full ${
                  selectedCategory === category
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredStreams.map((stream) => {
            const isRealStream = 'wallet_address' in stream;
            return (
              <StreamCard 
                key={stream.id} 
                id={stream.id}
                thumbnail={isRealStream ? stream.thumbnail_url : stream.thumbnail}
                title={stream.title}
                streamer={isRealStream ? `${stream.wallet_address.slice(0, 4)}...${stream.wallet_address.slice(-4)}` : stream.streamer}
                viewers={isRealStream ? stream.viewer_count : stream.viewers}
                category={stream.category}
                avatar={isRealStream ? `https://api.dicebear.com/7.x/avataaars/svg?seed=${stream.wallet_address}` : stream.avatar}
                isLive={isRealStream ? stream.is_live : true}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
};
