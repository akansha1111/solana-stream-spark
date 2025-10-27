import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWallet } from '@solana/wallet-adapter-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Video, VideoOff, Mic, MicOff, Monitor, Camera } from 'lucide-react';

const categories = [
  'Gaming',
  'Development',
  'NFTs',
  'Trading',
  'Music',
  'Art',
  'Education',
  'Entertainment',
  'Community',
  'Just Chatting',
];

export default function GoLive() {
  const navigate = useNavigate();
  const { publicKey, connected } = useWallet();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const [streamId, setStreamId] = useState<string | null>(null);
  
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [streamSource, setStreamSource] = useState<'camera' | 'screen'>('camera');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Just Chatting',
    thumbnail_url: 'https://images.unsplash.com/photo-1614332287897-cdc485fa562d?w=800&h=450&fit=crop',
    streamType: 'webcam' as 'webcam' | 'external',
    externalUrl: '',
    externalPlatform: 'YouTube' as 'YouTube' | 'Twitch' | 'X' | 'Other',
  });

  useEffect(() => {
    // Avoid redirecting on mount; show UI gating instead
  }, []);

  useEffect(() => {
    startPreview();
    return () => {
      stopPreview();
    };
  }, [streamSource]);

  const startPreview = async () => {
    try {
      const constraints = streamSource === 'camera'
        ? { video: true, audio: true }
        : { video: { displaySurface: 'monitor' } as any, audio: true };

      const stream = streamSource === 'camera'
        ? await navigator.mediaDevices.getUserMedia(constraints)
        : await navigator.mediaDevices.getDisplayMedia(constraints);

      setMediaStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      toast.error('Failed to access camera/screen');
      console.error('Media access error:', error);
    }
  };

  const stopPreview = () => {
    if (mediaStream) {
      mediaStream.getTracks().forEach(track => track.stop());
      setMediaStream(null);
    }
  };

  const toggleVideo = () => {
    if (mediaStream) {
      const videoTrack = mediaStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setVideoEnabled(videoTrack.enabled);
      }
    }
  };

  const toggleAudio = () => {
    if (mediaStream) {
      const audioTrack = mediaStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setAudioEnabled(audioTrack.enabled);
      }
    }
  };

  const handleGoLive = async () => {
    if (!publicKey || !formData.title) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (formData.streamType === 'external' && !formData.externalUrl) {
      toast.error('Please provide a stream URL');
      return;
    }

    try {
      // Normalize external URLs for popular platforms
      let externalUrl: string | null = null;
      if (formData.streamType === 'external') {
        const raw = formData.externalUrl.trim();
        const platform = formData.externalPlatform;
        try {
          if (platform === 'YouTube') {
            const match = raw.match(/(?:v=|youtu\.be\/)([A-Za-z0-9_-]{6,})/);
            const id = match ? match[1] : null;
            externalUrl = id ? `https://www.youtube.com/embed/${id}` : raw;
          } else if (platform === 'Twitch') {
            const m = raw.match(/twitch\.tv\/([A-Za-z0-9_]+)/i);
            const channel = m ? m[1] : raw;
            const parent = window.location.hostname;
            externalUrl = `https://player.twitch.tv/?channel=${channel}&parent=${parent}&muted=true`;
          } else {
            externalUrl = raw;
          }
        } catch {
          externalUrl = raw;
        }
      }

      const { data, error } = await supabase
        .from('streams')
        .insert({
          wallet_address: publicKey.toString(),
          title: formData.title,
          description: formData.description,
          category: formData.category,
          thumbnail_url: formData.thumbnail_url,
          is_live: true,
          viewer_count: 0,
          stream_key: crypto.randomUUID(),
          is_external: formData.streamType === 'external',
          external_platform: formData.streamType === 'external' ? formData.externalPlatform : null,
          external_url: formData.streamType === 'external' ? externalUrl : null,
        })
        .select()
        .single();

      if (error) throw error;

      setStreamId(data.id);
      setIsStreaming(true);
      toast.success('You are now live!');
      navigate(`/stream/${data.id}`);
    } catch (error) {
      toast.error('Failed to start stream');
      console.error('Stream creation error:', error);
    }
  };

  const handleEndStream = async () => {
    if (!streamId) return;

    try {
      const { error } = await supabase
        .from('streams')
        .update({ is_live: false })
        .eq('id', streamId);

      if (error) throw error;

      setIsStreaming(false);
      setStreamId(null);
      stopPreview();
      toast.success('Stream ended');
      navigate('/');
    } catch (error) {
      toast.error('Failed to end stream');
      console.error('Stream end error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-background pt-20">
      {!connected && (
        <div className="container mx-auto px-4 py-4">
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 text-center">
            <p className="text-yellow-600 dark:text-yellow-400">
              Please connect your wallet first to start streaming
            </p>
          </div>
        </div>
      )}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Preview Section */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Stream Preview</span>
                  {isStreaming && (
                    <Badge className="bg-red-600 text-white animate-pulse">
                      LIVE
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
                  <video
                    ref={videoRef}
                    autoPlay
                    muted
                    playsInline
                    className="w-full h-full object-cover"
                  />
                  {!videoEnabled && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black">
                      <VideoOff className="h-16 w-16 text-white" />
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-center gap-4 mt-4">
                  <Button
                    variant={videoEnabled ? 'default' : 'destructive'}
                    size="icon"
                    onClick={toggleVideo}
                  >
                    {videoEnabled ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
                  </Button>
                  <Button
                    variant={audioEnabled ? 'default' : 'destructive'}
                    size="icon"
                    onClick={toggleAudio}
                  >
                    {audioEnabled ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      stopPreview();
                      setStreamSource(streamSource === 'camera' ? 'screen' : 'camera');
                    }}
                  >
                    {streamSource === 'camera' ? <Monitor className="h-5 w-5 mr-2" /> : <Camera className="h-5 w-5 mr-2" />}
                    {streamSource === 'camera' ? 'Share Screen' : 'Use Camera'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Stream Settings */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Stream Settings</CardTitle>
                <CardDescription>Configure your stream details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Stream Title *</Label>
                  <Input
                    id="title"
                    placeholder="Enter stream title..."
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    disabled={isStreaming}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Tell viewers what your stream is about..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    disabled={isStreaming}
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                    disabled={isStreaming}
                  >
                    <SelectTrigger id="category">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="streamType">Stream Type *</Label>
                  <Select
                    value={formData.streamType}
                    onValueChange={(value: 'webcam' | 'external') => setFormData({ ...formData, streamType: value })}
                    disabled={isStreaming}
                  >
                    <SelectTrigger id="streamType">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="webcam">Webcam/Screen Share</SelectItem>
                      <SelectItem value="external">External Platform (YouTube, Twitch, X)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {formData.streamType === 'external' && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="platform">Platform *</Label>
                      <Select
                        value={formData.externalPlatform}
                        onValueChange={(value: 'YouTube' | 'Twitch' | 'X' | 'Other') => 
                          setFormData({ ...formData, externalPlatform: value })
                        }
                        disabled={isStreaming}
                      >
                        <SelectTrigger id="platform">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="YouTube">YouTube</SelectItem>
                          <SelectItem value="Twitch">Twitch</SelectItem>
                          <SelectItem value="X">X (Twitter)</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="externalUrl">Stream URL/Embed Code *</Label>
                      <Textarea
                        id="externalUrl"
                        placeholder="Paste YouTube embed URL, Twitch channel URL, or embed code..."
                        value={formData.externalUrl}
                        onChange={(e) => setFormData({ ...formData, externalUrl: e.target.value })}
                        disabled={isStreaming}
                        rows={2}
                      />
                      <p className="text-xs text-muted-foreground">
                        Example: https://www.youtube.com/embed/VIDEO_ID or https://www.twitch.tv/CHANNEL_NAME
                      </p>
                    </div>
                  </>
                )}

                {!isStreaming ? (
                  <Button
                    className="w-full bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700"
                    onClick={handleGoLive}
                    disabled={!formData.title || (formData.streamType === 'external' && !formData.externalUrl)}
                  >
                    Go Live
                  </Button>
                ) : (
                  <Button
                    variant="destructive"
                    className="w-full"
                    onClick={handleEndStream}
                  >
                    End Stream
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
