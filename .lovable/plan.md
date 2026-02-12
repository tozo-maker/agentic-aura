

# Dynamic Wizard + Voice Agent System

## Overview

Transform the current text-only chat into a **synchronized wizard + AI agent** experience. When a user selects a quick action (or the AI determines it needs structured data), a dynamic form wizard appears **inside the chat panel**, and the AI agent drives the conversation through it. Users can either fill fields manually or switch to **voice mode** where the agent interviews them and auto-fills the wizard in real-time.

## How It Works

```text
+------------------------------------------+
|  Nexus AI Consultant           [mic] [X] |
|------------------------------------------|
|  [Chat messages area]                    |
|                                          |
|  +------------------------------------+  |
|  | WIZARD CARD (inline in chat)       |  |
|  | Step 2 of 4: Your Project          |  |
|  |                                    |  |
|  | Company name:  [Auto Corp_____]    |  |
|  | Industry:      [Manufacturing  v]  |  |
|  | Team size:     (o)1-10 ( )11-50    |  |
|  |                                    |  |
|  | [Back]              [Next ->]      |  |
|  +------------------------------------+  |
|                                          |
|  Agent: "Great, Auto Corp! What's your  |
|  main pain point — manual processes or   |
|  customer support volume?"               |
|------------------------------------------|
|  [Voice active: listening...]    [Send]  |
+------------------------------------------+
```

## Architecture

### 1. Wizard Schema System (Frontend)

Create a `WizardSchema` type that defines dynamic, multi-step forms:

```text
WizardSchema {
  id: string              // e.g. "lead_qualification"
  steps: WizardStep[]
  onComplete: (data) => void
}

WizardStep {
  id: string              // e.g. "intent"
  title: string
  fields: WizardField[]
}

WizardField {
  id: string              // e.g. "company_name"
  type: "text" | "select" | "radio" | "textarea" | "email" | "range"
  label: string
  options?: { label, value }[]
  required?: boolean
  placeholder?: string
}
```

Pre-built wizard templates mapped to each quick action:
- **"Cut support costs"** -> Support Assessment wizard (pain points, volume, current tools, budget)
- **"Automate procurement"** -> Automation Scoping wizard (process description, frequency, team size, timeline)
- **"Build headless storefront"** -> Commerce wizard (current platform, SKU count, integrations, budget)
- **"Self-healing infrastructure"** -> Infrastructure wizard (current hosting, traffic, uptime needs, budget)

### 2. New Components

**`WizardCard.tsx`** — Renders a single wizard step inline within the chat message area
- Glassmorphic card matching existing design system
- Progress indicator (step X of Y)
- Field renderers for each field type (text, select, radio, etc.)
- Back/Next navigation
- Animated transitions between steps via Framer Motion

**`VoiceToggle.tsx`** — Mic button in the chat input bar
- Uses browser `SpeechRecognition` API (Web Speech API) for voice-to-text
- When active, transcribed text is sent as regular chat messages
- Visual indicator: pulsing mic icon, live waveform animation
- No external API needed — runs entirely in browser

**`WizardProvider.tsx`** — React context that holds:
- Active wizard schema (or null)
- Current step index
- Collected form data (`Record<string, any>`)
- Methods: `startWizard()`, `updateField()`, `nextStep()`, `prevStep()`, `completeWizard()`

### 3. Synchronization: Chat + Wizard

The key innovation is **bidirectional sync** between the AI chat and the wizard:

**Direction A — User fills wizard manually:**
- When user fills a field and clicks "Next", the field values are sent to the AI as a structured message (e.g., `"[WIZARD_UPDATE] company: Auto Corp, industry: Manufacturing"`)
- The AI acknowledges and asks follow-up questions or moves the conversation forward
- This message type is hidden from the visible chat — the AI just reacts naturally

**Direction B — AI fills wizard via voice/chat:**
- The AI's system prompt is updated to include the current wizard schema and instructions to emit structured `[FIELD_UPDATE]` markers when it extracts data
- Example: if user says "We're Auto Corp, a manufacturing company", the AI responds naturally AND emits `[FIELD_UPDATE:company_name=Auto Corp][FIELD_UPDATE:industry=Manufacturing]`
- Frontend parses these markers from the stream, strips them from the visible message, and auto-fills the wizard fields with animations
- This creates the "magic" effect of the form filling itself as you talk

### 4. Updated Edge Function (`chat/index.ts`)

Modify the system prompt to be wizard-aware:
- Accept an optional `wizardContext` parameter containing the current schema + step + collected data
- When wizard is active, the system prompt instructs the AI to:
  - Ask questions that correspond to unfilled wizard fields
  - Emit `[FIELD_UPDATE:fieldId=value]` markers when it extracts information
  - Progress through steps naturally
  - Confirm collected data before moving to the next step
- When all fields are collected, AI suggests completing the wizard

### 5. Updated OmniBar Integration

Each quick action now carries a `wizardId`:
```text
intents = [
  { label: "Cut support costs by 50%", category: "AI Support", wizardId: "support_assessment" },
  { label: "Automate procurement",     category: "Automation", wizardId: "automation_scoping" },
  ...
]
```

When a user selects a quick action:
1. Close OmniBar
2. Open chat panel
3. Start the corresponding wizard
4. AI sends a contextual greeting referencing the chosen intent

### 6. Voice Mode (Browser Speech API)

- Toggle mic button in the chat input area (next to Send button)
- Uses `window.SpeechRecognition` (or `webkitSpeechRecognition`)
- When active: continuous recognition, interim results shown as placeholder text
- Final transcript auto-submitted as a chat message
- AI processes it, extracts field values, wizard auto-fills
- Visual feedback: pulsing red dot, "Listening..." label
- Fallback: if browser doesn't support Speech API, button is hidden with a tooltip

### 7. Lead Data Persistence

When wizard completes:
- All collected data is saved to the `leads` table (company, budget_range, timeline, intent_category)
- Session is linked via `session_id`
- AI sends a summary confirmation message

## Files to Create/Modify

| File | Action | Purpose |
|------|--------|---------|
| `src/components/wizard/WizardProvider.tsx` | Create | React context for wizard state |
| `src/components/wizard/WizardCard.tsx` | Create | Inline wizard step renderer |
| `src/components/wizard/wizardSchemas.ts` | Create | Pre-built wizard templates for each intent |
| `src/components/wizard/WizardProgress.tsx` | Create | Step progress indicator |
| `src/components/wizard/FieldRenderer.tsx` | Create | Renders individual field types |
| `src/components/VoiceToggle.tsx` | Create | Mic button with Speech API |
| `src/components/AIChat.tsx` | Modify | Integrate wizard context, voice toggle, field extraction from stream |
| `src/components/OmniBar.tsx` | Modify | Pass wizardId when selecting quick actions |
| `src/pages/Index.tsx` | Modify | Wire wizard provider and pass wizardId through components |
| `supabase/functions/chat/index.ts` | Modify | Accept wizardContext, update system prompt for field extraction |

## What This Does NOT Include (keeps scope manageable)

- No ElevenLabs voice (uses free browser Speech API instead)
- No database schema changes (existing `leads` table already has all needed fields)
- No new edge functions (reuses existing `chat` function with extended prompt)

