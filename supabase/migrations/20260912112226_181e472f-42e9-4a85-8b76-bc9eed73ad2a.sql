CREATE TABLE public.threads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id text NOT NULL,
  title text,
  status text NOT NULL DEFAULT 'active',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.threads TO authenticated;
GRANT ALL ON public.threads TO service_role;

ALTER TABLE public.threads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own threads" ON public.threads
  FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can view all threads" ON public.threads
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

ALTER TABLE public.chat_messages ADD COLUMN thread_id uuid REFERENCES public.threads(id) ON DELETE CASCADE;
ALTER TABLE public.chat_analytics ADD COLUMN thread_id uuid REFERENCES public.threads(id) ON DELETE SET NULL;
ALTER TABLE public.leads ADD COLUMN thread_id uuid REFERENCES public.threads(id) ON DELETE SET NULL;

ALTER TABLE public.chat_analytics ADD COLUMN updated_at timestamp with time zone NOT NULL DEFAULT now();

CREATE TRIGGER update_chat_analytics_updated_at
  BEFORE UPDATE ON public.chat_analytics
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_threads_updated_at
  BEFORE UPDATE ON public.threads
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_chat_messages_thread_id ON public.chat_messages(thread_id);
CREATE INDEX idx_chat_analytics_thread_id ON public.chat_analytics(thread_id);
CREATE INDEX idx_leads_thread_id ON public.leads(thread_id);
CREATE INDEX idx_threads_session_id ON public.threads(session_id);
CREATE INDEX idx_threads_user_id ON public.threads(user_id);