

# Next Roadmap Items: Persistence, Pre-deploy & Analytics

Implementing items 3, 5, and 6 from the roadmap in order.

---

## 3. Conversation Persistence

**Goal**: Chat sessions survive page refreshes. Returning users can continue where they left off.

| File | Change |
|------|--------|
| `src/hooks/useAIChat.ts` | Store `sessionId` in `localStorage`. On mount, fetch previous messages from the database via the edge function. Show "Continue conversation?" prompt if recent session exists. Restore `deployedModules` by re-parsing module markers from stored assistant messages. |
| `supabase/functions/chat/index.ts` | Save assistant responses to `chat_messages` after stream completes (currently only saves user messages). Add a new endpoint path or parameter `?history=true` to return previous messages for a session. |

**Flow**:
1. On first visit → generate `sessionId`, store in `localStorage`
2. On return visit → read `sessionId` from `localStorage`, fetch `chat_messages` for that session
3. If messages exist and are < 24h old → restore them and deployed modules automatically
4. If > 24h old → show initial greeting with a "Continue previous conversation?" suggestion chip

---

## 5. Pre-deploy Modules from Service Cards

**Goal**: When a BentoGrid service card is clicked, instantly show the relevant GenUI module in the canvas before the AI responds.

| File | Change |
|------|--------|
| `src/hooks/useAIChat.ts` | Add `preloadModule(type, data)` method that immediately pushes a module to `deployedModules` |
| `src/pages/Index.tsx` | Map each service card ID to a default module config. On card click, call `preloadModule` then `openCanvas(intent)` |

**Module mapping**:
- `commerce` → `service_spotlight` with commerce data
- `automation` → `process_flow` with automation steps
- `ai_support` → `service_spotlight` with AI support data
- `infrastructure` → `service_spotlight` with infra data
- `data_intelligence` → `service_spotlight` with data intel data
- `generative_ui` → `service_spotlight` with GenUI data

---

## 6. Analytics Tracking

**Goal**: Track key conversion funnel events for visibility.

| Change | Detail |
|--------|--------|
| New migration | Create `chat_analytics` table: `id, session_id, event_type, module_type, metadata jsonb, created_at` with RLS for service role |
| `supabase/functions/chat/index.ts` | Insert analytics events: `session_start` (first message), `module_deployed` (when module markers detected in response) |
| `src/hooks/useAIChat.ts` | Fire lightweight analytics calls on: `first_message`, `module_viewed`, `suggestion_clicked` via a simple fetch to the chat function with an analytics flag, or directly to the database |

**Events tracked**: `session_start`, `first_message`, `module_deployed`, `suggestion_clicked`, `wizard_started`, `wizard_completed`, `lead_captured`

---

## Summary

Three changes shipping together — persistence makes sessions sticky, pre-deploy makes transitions instant, analytics gives funnel visibility. All low-to-medium effort with high cumulative impact.

