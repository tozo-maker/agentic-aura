# Fix the stuck blur + polish the conversation experience

## What's wrong today

Once you send a first message, the page permanently dims and blurs the entire marketing area (services, testimonials, trust, footer) and never restores it. There is no way back to the normal site short of a reload. On top of that:

- The blurred content is still scrollable, focusable and clickable — you can tab into blurry buttons, which is both confusing and an accessibility failure.
- The persistent CSS blur filter on a tall section is expensive to paint and causes visible jank while scrolling on lower-end devices and mobile.
- The hero collapses into a tiny "Nexus AI" heading, so the conversation has no clear container or boundary — it reads as loose text floating over a faded page.
- The input bar keeps its "Try:" chips and privacy line taking up vertical space, and there is no visible way to clear or restart the conversation.

## What I'll change

**1. Replace the permanent blur with a clean focus mode**
- Marketing sections stop being blurred. Instead, when a conversation is active they collapse out of the way (fade + slide out, removed from the flow) so the conversation owns the screen.
- Add an explicit "Back to site" / "Close conversation" control in the compact header. Pressing it (or Escape) restores the full page — hero, sections, no blur, no leftovers.
- While a conversation is active, hide the marketing sections from assistive tech and keyboard focus instead of leaving them half-visible.

**2. Give the conversation a real container**
- Wrap the thread in a defined surface: sticky compact header (agent mark, "Nexus AI Consultant", live status, close + new-chat buttons), scroll region, and clear top/bottom edges so messages don't bleed into the page.
- Add a "New conversation" action that clears messages, modules and suggestions.

**3. Thread readability pass**
- Tighter, more consistent spacing between messages; assistant messages stay background-free, user bubbles keep the high-contrast pair.
- Group consecutive assistant messages under a single agent mark.
- GenUI module cards get consistent width and spacing so they don't jump between message widths.
- Scroll behavior: stick to bottom only when the user is already at the bottom, plus a "jump to latest" affordance — currently every update yanks you down mid-read.

**4. Input bar refinement**
- In conversation mode: compact single-row layout, chips and privacy line collapsed, stop/cancel state while streaming.
- Keep the glow subtle and pause the infinite animations when the user prefers reduced motion.

## Technical notes

- `src/pages/Index.tsx`: remove the `filter: blur(2px)` / `opacity: 0.5` treatment, drive marketing visibility off a `focusMode` boolean derived from `hasConversation` plus a user-dismissable override; add `inert`/`aria-hidden` on the hidden branch.
- `src/components/ConversationThread.tsx`: add the sticky header, replace the naive `scrollIntoView` effect with AI Elements `Conversation`/`ConversationContent`/`ConversationScrollButton` (already installed) for stick-to-bottom behavior; group consecutive assistant turns.
- `src/components/AmbientInputBar.tsx`: honor `minimal` more aggressively, add stop-streaming control, gate looping animations behind `prefers-reduced-motion`.
- `src/hooks/useAIChat.ts`: expose a `reset()` for the new-conversation action.
- No backend, schema or prompt changes.
