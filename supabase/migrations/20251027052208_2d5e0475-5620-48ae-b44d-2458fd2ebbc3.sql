-- Add external streaming support to streams table
ALTER TABLE public.streams
  ADD COLUMN IF NOT EXISTS is_external BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS external_platform TEXT,
  ADD COLUMN IF NOT EXISTS external_url TEXT;

-- Optional index for faster filtering by external flag
CREATE INDEX IF NOT EXISTS idx_streams_is_external ON public.streams (is_external);
