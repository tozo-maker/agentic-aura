-- 1. Drop overly permissive "public" policies (service_role bypasses RLS anyway)
DROP POLICY IF EXISTS "Service role can manage chat_analytics" ON public.chat_analytics;
DROP POLICY IF EXISTS "Service role can manage chat_messages" ON public.chat_messages;
DROP POLICY IF EXISTS "Service role can manage leads" ON public.leads;

-- Ensure backend (edge functions) keeps table privileges
GRANT ALL ON public.chat_analytics TO service_role;
GRANT ALL ON public.chat_messages TO service_role;
GRANT ALL ON public.leads TO service_role;

-- Remove direct Data API privileges from anon/authenticated (admins read via RLS SELECT policies)
REVOKE ALL ON public.chat_analytics FROM anon;
REVOKE ALL ON public.chat_messages FROM anon;
REVOKE ALL ON public.leads FROM anon;
GRANT SELECT ON public.chat_analytics TO authenticated;
GRANT SELECT ON public.chat_messages TO authenticated;
GRANT SELECT ON public.leads TO authenticated;

-- 2. has_role: switch to SECURITY INVOKER (user_roles RLS lets users read their own roles)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$function$;

-- 3. Lock down direct execution of internal helpers
REVOKE ALL ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated;