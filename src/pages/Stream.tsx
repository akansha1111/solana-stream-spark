import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { useWallet } from '@solana/wallet-adapter-react';
import { Eye, Heart, Share2, Send, Users } from 'lucide-react';

interface StreamData {
  id: string;
  wallet_address: string;
  title: string;
  description: string;
  category: string;
  thumbnail_url: string;
  is_live: boolean;
  viewer_count: number;
  created_at: string;
  is_external: boolean;
  external_platform: string | null;
  external_url: string | null;
}

interface ChatMessage {
  id: string;
  wallet_address: string;
  message: string;
  created_at: string;
}

export default function Stream() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { publicKey } = useWallet();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<StreamData | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const [isLiked, setIsLiked] = useState(false);

  useEffect(() => {
    if (!id) return;

    // Fetch stream data
    const fetchStream = async () => {
      const { data, error } = await supabase
        .from('streams')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        toast.error('Stream not found');
        navigate('/');
        return;
      }

      setStream(data);
    };

    fetchStream();

    // Subscribe to stream updates
    const streamChannel = supabase
      .channel(`stream-${id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'streams',
          filter: `id=eq.${id}`,
        },
        (payload) => {
          setStream(payload.new as StreamData);
        }
      )
      .subscribe();

    // Fetch and subscribe to chat messages
    const fetchChatMessages = async () => {
      const { data } = await supabase
        .from('stream_chat')
        .select('*')
        .eq('stream_id', id)
        .order('created_at', { ascending: true });

      if (data) setChatMessages(data);
    };

    fetchChatMessages();

    const chatChannel = supabase
      .channel(`chat-${id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'stream_chat',
          filter: `stream_id=eq.${id}`,
        },
        (payload) => {
          setChatMessages((prev) => [...prev, payload.new as ChatMessage]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(streamChannel);
      supabase.removeChannel(chatChannel);
      if (mediaStream) {
        mediaStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [id, navigate]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !publicKey || !id) return;

    const { error } = await supabase.from('stream_chat').insert({
      stream_id: id,
      wallet_address: publicKey.toString(),
      message: newMessage.trim(),
    });

    if (error) {
      toast.error('Failed to send message');
      return;
    }

    setNewMessage('');
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Stream link copied to clipboard!');
  };

  const handleLike = () => {
    setIsLiked(!isLiked);
    toast.success(isLiked ? 'Removed from favorites' : 'Added to favorites');
  };

  if (!stream) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-20">
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Video Player Section */}
          <div className="lg:col-span-2 space-y-4">
            <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
              {stream.is_external ? (
                <iframe
                  src={stream.external_url || ''}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover"
                  poster={stream.thumbnail_url}
                  autoPlay
                  playsInline
                />
              )}
              {stream.is_live && (
                <div className="absolute top-4 left-4 flex gap-2">
                  <Badge className="bg-red-600 text-white">
                    LIVE
                  </Badge>
                  {stream.is_external && (
                    <Badge variant="secondary">
                      {stream.external_platform}
                    </Badge>
                  )}
                </div>
              )}
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-white">
                <div className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  <span className="font-semibold">{stream.viewer_count.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Stream Info */}
            <div className="space-y-4">
              <div>
                <h1 className="text-2xl font-bold mb-2">{stream.title}</h1>
                <Badge variant="secondary">{stream.category}</Badge>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${stream.wallet_address}`} />
                    <AvatarFallback>ST</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">
                      {stream.wallet_address.slice(0, 4)}...{stream.wallet_address.slice(-4)}
                    </p>
                    <p className="text-sm text-muted-foreground">Streamer</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleLike}
                    className={isLiked ? 'text-red-500' : ''}
                  >
                    <Heart className={`h-5 w-5 ${isLiked ? 'fill-current' : ''}`} />
                  </Button>
                  <Button variant="outline" size="icon" onClick={handleShare}>
                    <Share2 className="h-5 w-5" />
                  </Button>
                </div>
              </div>

              {stream.description && (
                <div className="bg-secondary/50 rounded-lg p-4">
                  <p className="text-sm">{stream.description}</p>
                </div>
              )}
            </div>
          </div>

          {/* Chat Section */}
          <div className="lg:col-span-1">
            <div className="bg-card rounded-lg border shadow-sm h-[600px] flex flex-col">
              <div className="p-4 border-b">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  <h2 className="font-semibold">Live Chat</h2>
                  <Badge variant="secondary" className="ml-auto">
                    {chatMessages.length}
                  </Badge>
                </div>
              </div>

              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {chatMessages.map((msg) => (
                    <div key={msg.id} className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage
                            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${msg.wallet_address}`}
                          />
                          <AvatarFallback>U</AvatarFallback>
                        </Avatar>
                        <span className="text-xs font-semibold">
                          {msg.wallet_address.slice(0, 4)}...{msg.wallet_address.slice(-4)}
                        </span>
                        <span className="text-xs text-muted-foreground ml-auto">
                          {new Date(msg.created_at).toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-sm pl-8">{msg.message}</p>
                      <Separator className="mt-2" />
                    </div>
                  ))}
                </div>
              </ScrollArea>

              <div className="p-4 border-t">
                {publicKey ? (
                  <div className="flex gap-2">
                    <Input
                      placeholder="Send a message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    />
                    <Button size="icon" onClick={handleSendMessage}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <p className="text-sm text-center text-muted-foreground">
                    Connect wallet to chat
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
