

# Unified AI-Native Interface Redesign

## The Problem

You have 4 entry points (Navbar CTA, Hero CTA, OmniBar, FloatingChatBar, BentoGrid cards) that all dump the user into the same split-pane canvas view through a jarring full-page swap. The landing page and canvas feel like two separate apps. This is the classic "chatbot bolted onto a website" anti-pattern.

## The Vision: Portal Architecture

Inspired by the Gramercy Studios "portal concept" — the landing page IS the interface. The AI doesn't live in a separate view; it adds **depth** to the existing page. The user never leaves the landing page. Instead, the page **transforms around them** as they engage with the AI.

```text
CURRENT (broken):
┌──────────────┐     hard cut      ┌────────┬──────────┐
│  Landing     │ ──────────────→   │ Chat   │  Canvas  │
│  Page        │                   │ Rail   │  Area    │
└──────────────┘                   └────────┴──────────┘

PROPOSED (unified):
┌──────────────────────────────────────────────┐
│  Navbar (persistent, no mode switch)         │
├──────────────────────────────────────────────┤
│                                              │
│  Hero / Content scrolls naturally            │
│                                              │
│  ┌────────────────────────────────────────┐  │
│  │  Ambient AI Bar (always present)       │  │
│  │  "What are you looking to build?"      │  │
│  └────────────────────────────────────────┘  │
│                                              │
│  BentoGrid / Testimonials / etc.             │
│                                              │
├──────────────────────────────────────────────┤
│  ┌────────────────────────────────────────┐  │
│  │  Conversation Thread (inline, below    │  │
│  │  hero — grows as messages appear)      │  │
│  │                                        │  │
│  │  ┌──────────────────────────────────┐  │  │
│  │  │  GenUI Module (inline card)      │  │  │
│  │  └──────────────────────────────────┘  │  │
│  │                                        │  │
│  │  AI response text...                   │  │
│  │                                        │  │
│  └────────────────────────────────────────┘  │
│                                              │
│  ┌────────────────────────────────────────┐  │
│  │  Sticky Input Bar (bottom)             │  │
│  └────────────────────────────────────────┘  │
└──────────────────────────────────────────────┘
```

## Core Design Principles

1. **One page, one vibe** — No mode switching. The landing page content coexists with the conversation thread. As the user starts chatting, the marketing sections gracefully compress/fade and the conversation thread becomes the focal point.

2. **Ambient AI presence** — The input bar is always visible at the bottom, subtly pulsing. It's not a CTA button — it's the AI breathing. The user sees it as a living entity, not a feature.

3. **Inline conversation thread** — Messages appear in the main content flow, not a side rail. GenUI modules render inline between messages at full width. This feels like the AI is building the page in real-time.

4. **Progressive reveal** — Landing page sections don't disappear — they scroll up as conversation content grows below. The user can always scroll back up to see the marketing content.

5. **Single entry point** — Remove redundant CTAs. One persistent input bar at the bottom. The Hero text becomes contextual ("What are you looking to build?" as a heading above the input). OmniBar becomes a quick-actions dropdown within the input bar (triggered by `/` or a menu icon).

## Technical Changes

### Files to Modify

| File | Change |
|------|--------|
| `src/pages/Index.tsx` | Remove binary `landing`/`canvas` mode. Single scrollable page. Conversation thread renders inline below hero. Remove OmniBar as separate modal — fold quick actions into input bar. |
| `src/components/HeroSection.tsx` | Simplify to a compact, always-visible header. Remove duplicate CTAs. The hero becomes the "greeting" — just the tagline + ambient input bar. |
| `src/components/Navbar.tsx` | Remove `compact` mode and `onBack`. Always the same nav. Remove "Talk to Our Agent" button (input bar handles this). Keep theme toggle and nav links. |
| `src/components/FloatingChatBar.tsx` | Evolve into `AmbientInputBar.tsx` — sticky bottom bar that's always visible. Add `/` trigger for quick actions (replacing OmniBar). Add typing indicator when AI is processing. Morphing animation stays but simpler. |
| `src/components/canvas/CanvasLayout.tsx` | Remove entirely. No separate canvas view. |
| `src/components/canvas/ChatRail.tsx` | Remove entirely. Conversation renders inline. |
| `src/components/canvas/MobileChatDrawer.tsx` | Remove entirely. Mobile uses same inline layout. |
| New: `src/components/ConversationThread.tsx` | Inline message thread that renders in the main content flow. Messages + GenUI modules at full width. Smooth scroll-into-view for new messages. |
| New: `src/components/AmbientInputBar.tsx` | Sticky bottom input with voice toggle, quick-action menu (`/`), send button. Subtle ambient glow animation. Always present. |
| `src/components/canvas/CanvasModuleView.tsx` | Refactor to `InlineModuleCard.tsx` — renders individual modules inline within the conversation thread at full content width. |
| `src/components/canvas/WelcomeCards.tsx` | Refactor into suggestion chips that appear below the hero text, not in a separate canvas view. |
| `src/components/OmniBar.tsx` | Remove as modal. Quick actions fold into the input bar as a popover/dropdown. |
| `src/components/BentoGrid.tsx` | Keep but clicking a card now sends a message directly (no mode switch). The conversation thread scrolls into view with the response. |

### The Scroll-to-Conversation Flow

When the user sends their first message:
1. Landing page content above the conversation area stays in place
2. A new `ConversationThread` section fades in below the hero/social proof
3. The page auto-scrolls to show the thread
4. BentoGrid, Testimonials, etc. are still below (or compressed) — user can scroll to them
5. The sticky input bar stays at the bottom throughout

### Mobile Experience

Same layout, just responsive. The conversation thread is full-width. GenUI modules stack vertically. The sticky input bar has safe-area padding. No drawer needed — everything is inline.

### Ambient Intelligence Touches

- Input bar has a subtle, slow-breathing glow animation (CSS radial gradient pulse)
- When AI is "thinking," the glow intensifies
- GenUI modules animate in with a "materializing" effect (blur-to-sharp + scale)
- Suggestion chips float with gentle hover physics
- The hero tagline can subtly change based on time of day or return visits

## What Gets Removed

- Binary `landing`/`canvas` mode state
- `ChatRail.tsx` (side panel)
- `CanvasLayout.tsx` (split pane)
- `MobileChatDrawer.tsx` (bottom sheet)
- `OmniBar.tsx` as a modal (becomes inline popover)
- 3 of 4 duplicate "Talk to Agent" CTAs
- Navbar back button / compact mode

## What Stays

- All GenUI modules and their rendering logic
- `useAIChat` hook (unchanged)
- BentoGrid, Testimonials, TrustProtocol, Footer
- WizardProvider and wizard flow
- Color scheme, typography, glassmorphism aesthetic
- Analytics tracking, lead capture, conversation persistence

## Summary

This transforms the app from a "website with a chatbot" into an "AI-native interface with marketing content." The intelligence is woven into the page itself. One vibe, one flow, zero mode switches. The user feels like they're talking to a living page, not navigating between views.

