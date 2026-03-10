CREATE TABLE public.chat_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text NOT NULL,
  event_type text NOT NULL,
  module_type text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.chat_analytics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can manage chat_analytics"
ON public.chat_analytics
FOR ALL
TO public
USING (true)
WITH CHECK (true);

CREATE INDEX idx_chat_analytics_session ON public.chat_analytics(session_id);
CREATE INDEX idx_chat_analytics_event ON public.chat_analytics(event_type);