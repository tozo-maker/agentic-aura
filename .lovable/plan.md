

# Canvas-First GenUI Redesign

## Vision

Transform the experience from "landing page with a chat widget" into a **full-screen canvas interface** inspired by Google Gemini Canvas. When the AI conversation begins, the landing page transitions into a split-pane layout: a compact chat/input rail on one side and a large canvas area that fills with rich interactive UI modules. The conversation is UI-driven, not text-driven.

## Layout Architecture

```text
BEFORE (landing page — scrollable, unchanged):
+----------------------------------------------+
| Navbar                                       |
| Hero → SocialProof → BentoGrid → etc.       |
+----------------------------------------------+

AFTER user opens chat (canvas mode):
+----------------------------------------------+
| Navbar (compact, always visible)             |
+----------+-----------------------------------+
|          |                                   |
|  Chat    |         Canvas Area               |
|  Rail    |   (GenUI modules render here      |
|  (~320px)|    at full size, stacked or       |
|          |    replaced as conversation        |
|  Input   |    progresses)                    |
|  at      |                                   |
|  bottom  |   Shows welcome cards when empty  |
|          |                                   |
+----------+-----------------------------------+

Mobile: stacked — canvas on top, chat input pinned at bottom
```

## Key Changes

### 1. New Canvas Layout (`src/components/canvas/CanvasLayout.tsx`)

A full-viewport split layout that replaces the current floating chat panel:
- **Left rail** (~320px): Scrollable message history + input bar at bottom. Messages are compact bubbles, but GenUI modules are NOT rendered here — only a small "card deployed" indicator appears inline.
- **Right canvas** (remaining width): The active GenUI module renders here at full size. When multiple modules are deployed, they stack vertically with the latest on top, or user can tab between them.
- Smooth `framer-motion` `layoutId` transitions when switching between landing page and canvas mode.

### 2. Welcome Cards (`src/components/canvas/WelcomeCards.tsx`)

When the canvas is empty (no modules deployed yet), show clickable suggestion cards:
- "What services do you offer?" → deploys ProcessFlow
- "Show me pricing" → deploys PricingTier  
- "How much can I save?" → deploys ROICalculator
- "See a case study" → deploys CaseStudyCard

These replace the traditional "type a message" empty state with an interactive, UI-first experience.

### 3. Refactored Message Flow

The `AIChat` streaming logic moves into a shared hook (`src/hooks/useAIChat.ts`) so both the canvas rail and the old floating panel can use it. The hook manages:
- Messages state, streaming, parsing
- Module deployments (emitted as events the canvas listens to)
- Wizard state coordination

### 4. Canvas Module Display (`src/components/canvas/CanvasModuleView.tsx`)

Renders the currently active module(s) in the canvas area at full width. Each module gets:
- A header bar with module type label + close/minimize button
- Full-width rendering (modules already exist but will get responsive max-width adjustments)
- A "Ask about this" button that sends context back to the chat

### 5. Page Transition

`Index.tsx` manages a `mode` state: `"landing"` or `"canvas"`.
- Landing mode: current scrollable page with all sections
- Canvas mode: full-viewport `CanvasLayout` with the landing page hidden
- Transition: smooth crossfade when user clicks "Talk to Our Agent" or a suggestion card
- A "Back to site" button in canvas mode returns to landing

### 6. Updated System Prompt

Update the edge function to instruct the AI to deploy modules more aggressively since they now have full canvas real estate. The AI should:
- Lead with a module deployment whenever possible
- Use shorter text responses (the UI tells the story)
- Deploy modules proactively, not just reactively

## Files Summary

| File | Action | Purpose |
|------|--------|---------|
| `src/components/canvas/CanvasLayout.tsx` | Create | Split-pane layout with chat rail + canvas area |
| `src/components/canvas/WelcomeCards.tsx` | Create | Clickable suggestion cards for empty canvas state |
| `src/components/canvas/CanvasModuleView.tsx` | Create | Full-width module renderer with header/actions |
| `src/components/canvas/ChatRail.tsx` | Create | Compact chat message list + input bar |
| `src/hooks/useAIChat.ts` | Create | Extract chat logic from AIChat into reusable hook |
| `src/pages/Index.tsx` | Modify | Add landing/canvas mode toggle |
| `src/components/AIChat.tsx` | Modify | Use shared hook, keep as fallback mobile chat |
| `src/components/Navbar.tsx` | Modify | Compact variant for canvas mode |
| `src/components/genui/modules/*.tsx` | Modify | Add responsive full-width styles for canvas rendering |
| `supabase/functions/chat/index.ts` | Modify | Update system prompt to be more module-aggressive |

No database changes required.

