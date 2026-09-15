import { ensureSessionId } from "@/hooks/useSession";

const THREADS_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/threads`;
const AUTH = `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`;

export interface ThreadRecord {
  id: string;
  title: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

export async function createThreadRequest(title?: string): Promise<ThreadRecord | null> {
  try {
    const res = await fetch(THREADS_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: AUTH },
      body: JSON.stringify({ sessionId: ensureSessionId(), title }),
    });
    const { thread } = (await res.json()) as { thread?: ThreadRecord };
    return thread ?? null;
  } catch {
    return null;
  }
}
