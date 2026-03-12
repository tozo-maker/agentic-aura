const SESSION_KEY = "nexus_chat_sessionId";
const SESSION_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours

interface StoredSession {
  sessionId: string;
  timestamp: number;
}

export function getStoredSession(): StoredSession | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function storeSession(sessionId: string) {
  localStorage.setItem(SESSION_KEY, JSON.stringify({ sessionId, timestamp: Date.now() }));
}

export function isSessionExpired(stored: StoredSession | null): boolean {
  return stored ? Date.now() - stored.timestamp > SESSION_EXPIRY_MS : true;
}

export function trackAnalytics(
  sessionId: string,
  eventType: string,
  moduleType?: string,
  metadata?: Record<string, any>
) {
  const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat?analytics=true`;
  fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
    },
    body: JSON.stringify({ sessionId, eventType, moduleType, metadata }),
  }).catch(() => {});
}
