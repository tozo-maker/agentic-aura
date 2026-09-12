# Nexus AI — Polish Round

A refinement pass across four areas. No structural rewrites: the portal layout, the chat engine and the existing modules stay as they are.

## 1. Conversation experience

- Streaming feel: show the consultant's short "thinking" line only until the first words arrive, then stream text without the placeholder jumping the layout.
- Message polish: tighter spacing between grouped replies, timestamps on hover, copy and retry actions on each answer.
- Suggestions: keep them pinned just above the input instead of inside the scroll area, so they never slide out of reach.
- Mobile: full-height conversation card, input pinned above the keyboard, larger tap targets on suggestion chips and module controls.
- Small touches: smooth auto-scroll that respects manual scrolling, a clearer stop control while the answer streams, and a friendlier error card with a one-tap retry.

## 2. Voice mode (talk and listen)

- A mic button in the input bar switches the conversation into voice mode: speak, see your words appear live, and hear the consultant answer back.
- Speech is transcribed server-side for accuracy and language auto-detection; replies are spoken with a natural voice and stream so speaking starts almost immediately.
- Visible states: idle, listening (animated level meter), transcribing, speaking. Tap anywhere to interrupt the consultant mid-sentence.
- Voice is optional and remembered: a small toggle mutes spoken replies while keeping dictation.
- Falls back gracefully when the microphone is blocked or unavailable, with a clear explanation instead of a dead button.

## 3. Smarter behaviour (light touch)

- The consultant reads back what it has already captured (name, company, budget, timeline) so the wizard and the chat never ask twice.
- Better follow-up suggestions: context-aware and limited to three, phrased as things a real prospect would say next.
- Modules get a short spoken/written lead-in so they never appear without explanation.

## 4. Visual refresh

Before building, three rendered design directions for the homepage and the conversation card, based on your picks for palette, type pairing and layout. The chosen direction is applied to the existing sections — same content, same structure, refreshed surface treatment, spacing, and motion.

## 5. Admin view

A private `/admin` page, visible only to admin accounts:
- Leads table with search, status and date filters.
- Lead detail with the full conversation transcript.
- A simple activity overview: conversations per day, most-requested services, wizard completion rate.
- Uses the existing admin role check; non-admins see a clear "no access" message.

## Technical notes

- Voice: Lovable AI speech-to-text (`google/gemini-3.5-transcribe`) and text-to-speech (`openai/gpt-4o-mini-tts`), both behind new edge functions streaming SSE; the browser records WAV via Web Audio and plays PCM chunks through an `AudioContext`. Replaces the current browser `SpeechRecognition` in `VoiceToggle.tsx`.
- Conversation polish stays inside `ConversationThread.tsx`, `AmbientInputBar.tsx` and the AI Elements primitives; no change to `useAIChat` transport or the chat edge function beyond suggestion prompt tuning.
- Admin pages read through existing RLS policies with `has_role`; analytics aggregate over `chat_analytics` and `leads`.
- Design direction tokens land in `index.css`; no hardcoded colors in components.

## Order of work

1. Conversation polish + mobile
2. Voice mode
3. Design directions, then apply the chosen one
4. Admin view
