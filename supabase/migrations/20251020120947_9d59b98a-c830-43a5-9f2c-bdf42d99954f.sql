-- Create streams table
CREATE TABLE public.streams (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  wallet_address TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  thumbnail_url TEXT,
  is_live BOOLEAN NOT NULL DEFAULT false,
  viewer_count INTEGER NOT NULL DEFAULT 0,
  stream_key TEXT UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create stream_chat table
CREATE TABLE public.stream_chat (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  stream_id UUID NOT NULL REFERENCES public.streams(id) ON DELETE CASCADE,
  wallet_address TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.streams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stream_chat ENABLE ROW LEVEL SECURITY;

-- Streams policies
CREATE POLICY "Anyone can view live streams" 
ON public.streams 
FOR SELECT 
USING (is_live = true OR wallet_address = current_setting('request.jwt.claims', true)::json->>'wallet_address');

CREATE POLICY "Users can create their own streams" 
ON public.streams 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Users can update their own streams" 
ON public.streams 
FOR UPDATE 
USING (wallet_address = current_setting('request.jwt.claims', true)::json->>'wallet_address');

CREATE POLICY "Users can delete their own streams" 
ON public.streams 
FOR DELETE 
USING (wallet_address = current_setting('request.jwt.claims', true)::json->>'wallet_address');

-- Chat policies
CREATE POLICY "Anyone can view chat messages" 
ON public.stream_chat 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can send chat messages" 
ON public.stream_chat 
FOR INSERT 
WITH CHECK (true);

-- Update timestamp function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for streams
CREATE TRIGGER update_streams_updated_at
BEFORE UPDATE ON public.streams
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.streams;
ALTER PUBLICATION supabase_realtime ADD TABLE public.stream_chat;