# Nexus AI — Engine + Chat Experience Upgrade

A single-pass modernization of the AI layer and the conversation surface, with the visual direction chosen from rendered options before building.

## What's limiting the app today

- The chat runs on a hand-written streaming reader that parses the model's raw text for markers like `[DEPLOY_MODULE:...]`, `[SUGGESTIONS:...]` and `[FIELD_UPDATE:...]`. Half-streamed markers must be repaired with regex, malformed JSON silently drops a module, and modules are de-duplicated by type so the same module can't appear twice in a conversation.
- Assistant text is rendered as plain text — no markdown, so lists, bold and links show as raw characters.
- There is no stop/cancel while the model is answering, no retry, and no visible reasoning.
- Errors are collapsed into one generic "I'm having trouble connecting" line; the backend's 429 (rate limit) and 402 (credits) responses never reach the user as distinct messages.
- The model is a preview-generation Gemini; lead extraction runs a second full-conversation call on every turn from message four onward.
- The public chat endpoint has no per-session rate limiting.

## The upgrade

### 1. AI engine

- Rebuild the chat edge function on the AI SDK (`streamText`) with the Lovable AI Gateway provider instead of hand-rolled `fetch` + SSE parsing.
- Move to `google/gemini-3.6-flash`, with reasoning enabled and streamed as a collapsible "thinking" section.
- Replace text markers with **tool calling**. Each GenUI module (`service_spotlight`, `comparison_table`, `roi_calculator`, `case_study`, `timeline`, `pricing_tier`, `process_flow`) becomes a typed tool with a Zod input schema, plus tools for quick-reply suggestions and wizard field updates. Modules arrive as structured data, so no regex, no half-parsed JSON, no marker leakage into visible text.
- Lead extraction becomes a tool the model calls when it actually learns something, instead of a second full-conversation call every turn.
- Per-session rate limiting and Zod validation on the edge function; explicit 429/402/validation responses surfaced in the UI.

### 2. Chat UI/UX

- Rebuild the transcript on AI Elements (`Conversation`, `Message`, `PromptInput`, `Tool`, `Shimmer`) instead of the current custom thread.
- Markdown rendering for assistant text.
- Streaming states: shimmer "Thinking…", live reasoning, per-module skeletons while a tool runs.
- Stop / cancel mid-stream, retry on a failed turn, copy on any message.
- Modules render inline in the thread as tool output, can repeat, and each one keeps its own state.
- Keyboard and focus behaviour: composer stays focused after send and after stream completion.
- Mobile: full-height canvas, safe-area-aware composer, modules scaled for narrow screens.

### 3. Visual direction

Before building the UI, I'll capture the current chat canvas and generate three rendered design directions for it — same brand palette and typography (Bone/Charcoal, Playfair + Inter), varying in composition, density and motion. You pick one, and that direction's tokens and layout are implemented verbatim.

### 4. Codebase

- Typed contracts shared between the edge function and the client (module payloads, tool names) replacing `any` wizard context and string parsing.
- `useAIChat` / `useStreamChat` / `parseModules` collapse into the AI SDK `useChat` transport; the marker parsers are removed.
- Existing session history keeps loading — stored transcripts are converted to the new message shape on read, so nothing already captured is lost.
- Vitest coverage on the tool schemas and history conversion.

## Technical notes

- Packages added: `ai`, `@ai-sdk/openai-compatible`, `@ai-sdk/react`, `react-markdown`, plus AI Elements components via the shadcn registry.
- `supabase/functions/chat/index.ts` is rewritten; the `history` and `analytics` query-param endpoints stay at the same URLs.
- Database schema is unchanged. `chat_messages` gains structured parts stored in the existing `content` column as before, with module data serialized alongside the text.
- MCP tools (`list_leads`, `get_lead`, `list_recent_analytics`) are unaffected.

## Not included

- Admin dashboard UI (leads remain reachable via MCP tools).
- Voice input rework beyond keeping the current toggle working.
