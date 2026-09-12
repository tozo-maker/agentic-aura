# Nexus AI — Meaningful Upgrade

A substantial capability upgrade while keeping the portal architecture: one unified surface where the AI consultant is the main interface, and marketing content steps aside when the conversation starts.

## 1. Persistent, threaded conversations

- Move from a single ephemeral session to threaded conversations.
- Each thread gets a dedicated route (`/chat/:threadId`) so a reload restores the same conversation.
- A thread list appears when the conversation is active: recent chats, new-thread button, delete/archive actions.
- Messages persist in the backend per authenticated user (or per anonymous session id if auth is skipped).
- The AI SDK chat is keyed by `threadId`; history loads on mount and saves on `onFinish`.

## 2. Smarter consultant behaviour

- Multi-turn memory: the consultant remembers what was already said in the thread and what the wizard captured, so it never asks twice.
- Proactive follow-ups: after a service module is shown, the consultant suggests the next logical step (estimate, case study, timeline, book a call).
- Richer GenUI modules:
  - Add a `project_estimate` module that builds a live quote from collected wizard data.
  - Add a `meeting_booker` module that lets the user pick a call slot.
  - Improve existing modules with clearer data and better empty/error states.
- Suggestion chips become context-aware and limited to three high-value options.

## 3. Full voice mode

- Replace the browser-only speech input with a real talk-and-listen experience.
- A mic button in the input bar starts voice mode: the user speaks, the transcript streams in, and the consultant replies out loud.
- Speech-to-text uses `google/gemini-3.5-transcribe` via a new edge function; text-to-speech uses `openai/gpt-4o-mini-tts`.
- Real-time playback with PCM streaming, animated listening/speaking states, and tap-to-interrupt.
- Graceful fallback if the microphone is denied or unavailable.

## 4. Visual redesign

- Generate three rendered design directions for the homepage and the conversation card.
- The chosen direction is applied to all existing sections: same content and structure, refreshed palette, typography, spacing, glass treatment, and motion.
- Mobile-first polish: full-height conversation card, keyboard-aware input, larger tap targets.

## 5. Admin dashboard

- A private `/admin` route, visible only to users with the `admin` role.
- Leads table with search, status filters, and date range filters.
- Lead detail page with the full conversation transcript and captured wizard data.
- Analytics overview: conversations per day, top requested services, wizard completion rate, average response time.
- Uses the existing `user_roles` + `has_role` security model.

## 6. Conversation experience polish

- Streaming feel: a short "thinking" indicator until the first words arrive, then smooth streaming without layout jumps.
- Tighter grouped-assistant spacing, hover timestamps, copy and retry actions on answers.
- Suggestion chips pinned above the input so they stay reachable.
- Smoother auto-scroll that respects manual scrolling.
- Clearer stop control while streaming and a friendlier error card with one-tap retry.

## Technical notes

- Threads: new `threads` and `chat_messages` tables, RLS scoped to the owning user/session, server-side thread ownership check before streaming.
- Voice: browser records WAV via Web Audio, uploads to a new `transcribe` edge function that streams SSE to the gateway; a new `speak` edge function streams TTS PCM back to the browser `AudioContext`.
- AI engine: keep the current `streamText` + tool-calling setup; tune prompts for memory and proactive follow-ups. No change to the gateway provider pattern.
- Admin: reads existing `leads`, `chat_messages`, `chat_analytics`, and `user_roles` tables through RLS.
- Design tokens land in `index.css`; no hardcoded colors in components.

## Order of work

1. Threaded conversations and persistence
2. Voice mode
3. Smarter modules and consultant behaviour
4. Design directions, then apply the chosen one
5. Admin dashboard
6. Final conversation polish pass
