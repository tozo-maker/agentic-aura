

# Polymorphic GenUI System

## Concept

The AI agent gains the ability to "deploy" rich, interactive UI modules directly into the conversation and onto the page -- not just text responses and wizard forms. When the AI determines that a visual component would be more helpful than text, it emits a structured marker that the frontend renders as a full interactive module.

The page retains all its current static content (Hero, Bento Grid, Trust Protocol, Footer) as the informative baseline. On top of that, GenUI modules appear both **inline in the chat** and as a **floating spotlight panel** beside the chat, creating an adaptive experience that evolves with the conversation.

## Module Types

The system ships with these pre-built GenUI modules:

| Module | When Deployed | What It Shows |
|--------|--------------|---------------|
| **ServiceSpotlight** | User mentions a specific service area | Expanded service card with features list, example use cases, and a "Start scoping" CTA |
| **ComparisonTable** | User asks "what's the difference between..." | Side-by-side feature/pricing comparison |
| **ROICalculator** | User discusses costs or budget | Interactive sliders showing estimated savings and ROI |
| **CaseStudyCard** | User asks about results or past work | Mini case study with metrics (e.g., "60% cost reduction") |
| **TimelineVisualizer** | User asks about delivery timeline | Visual project phases with duration bars |
| **PricingTier** | User asks about pricing | Tiered pricing cards with feature lists |
| **ProcessFlow** | User asks "how does it work?" | Step-by-step animated flow diagram |

## Architecture

### 1. Module Registry (`src/components/genui/ModuleRegistry.ts`)

A typed registry mapping module IDs to their React components and data schemas:

```text
ModuleRegistry = {
  service_spotlight: { component: ServiceSpotlight, schema: {...} },
  comparison_table:  { component: ComparisonTable,  schema: {...} },
  roi_calculator:    { component: ROICalculator,     schema: {...} },
  ...
}
```

### 2. AI Deployment Protocol

The AI emits structured markers in its streaming response, similar to the existing `[FIELD_UPDATE]` pattern:

```text
[DEPLOY_MODULE:service_spotlight:{"serviceId":"ai_support","highlight":"80% automation rate"}]
```

The frontend parser strips these from visible text and renders the corresponding component inline in the chat flow.

### 3. Parsing Layer (`src/components/genui/parseModules.ts`)

Extends the existing `parseFieldUpdates` function to also detect `[DEPLOY_MODULE:type:jsonData]` markers. Returns both field updates and module deployment instructions from a single stream parse pass.

### 4. Inline Rendering in Chat

When a `DEPLOY_MODULE` marker is parsed, the module component is inserted into the chat message list as a special "module" message type. This sits alongside text messages and wizard cards in the same scrollable area.

### 5. Context Spotlight Panel (`src/components/genui/SpotlightPanel.tsx`)

A floating panel that appears beside the chat (on desktop) or above it (on mobile) showing the most recently deployed module in a larger, more interactive format. This gives complex modules like the ROI Calculator or Comparison Table room to breathe.

### 6. Page-Level Reactivity

The Bento Grid service cards gain subtle highlighting when the AI discusses a related service. A new context signal from the chat tells the page which service category is currently being discussed, and that card gets a gentle glow/pulse animation.

## Edge Function Updates

The system prompt gains a new section teaching the AI when and how to deploy modules:

- "When the user asks about a specific service, deploy a ServiceSpotlight module"
- "When the user compares options, deploy a ComparisonTable"
- "When budget is discussed, deploy the ROICalculator with relevant parameters"
- The AI is instructed to provide realistic-looking data for each module
- Module deployment is optional -- the AI still responds with text and only deploys modules when they add value

## Technical Details

### New Files

| File | Purpose |
|------|---------|
| `src/components/genui/ModuleRegistry.ts` | Maps module type IDs to components + data schemas |
| `src/components/genui/parseModules.ts` | Parses `[DEPLOY_MODULE:...]` markers from AI stream |
| `src/components/genui/SpotlightPanel.tsx` | Floating panel showing expanded module view |
| `src/components/genui/modules/ServiceSpotlight.tsx` | Expanded service detail card |
| `src/components/genui/modules/ComparisonTable.tsx` | Side-by-side feature comparison |
| `src/components/genui/modules/ROICalculator.tsx` | Interactive savings calculator with sliders |
| `src/components/genui/modules/CaseStudyCard.tsx` | Mini case study with metrics |
| `src/components/genui/modules/TimelineVisualizer.tsx` | Project phase timeline |
| `src/components/genui/modules/PricingTier.tsx` | Pricing cards |
| `src/components/genui/modules/ProcessFlow.tsx` | Animated step-by-step flow |
| `src/components/genui/GenUIRenderer.tsx` | Takes a module deployment instruction and renders the correct component |

### Modified Files

| File | Changes |
|------|---------|
| `src/components/AIChat.tsx` | Extended stream parser to detect module markers; new message type "module" in the message list; renders `GenUIRenderer` for module messages; integrates `SpotlightPanel`; emits active service context |
| `src/components/BentoGrid.tsx` | Accepts `activeService` prop; applies highlight animation to the matching card |
| `src/pages/Index.tsx` | Passes `activeService` state between AIChat and BentoGrid |
| `supabase/functions/chat/index.ts` | Extended system prompt with GenUI deployment instructions and module catalog |

### Design System

All GenUI modules follow the existing "Liquid Glass" aesthetic:
- `glass` class with `backdrop-blur-xl`
- Warm bone palette, serif headings, sans body text
- Spring-based Framer Motion enter/exit animations
- Consistent border-radius (`rounded-2xl`) and spacing

### Interactive Elements

- **ROI Calculator**: Range sliders for ticket volume, average resolution time; computed savings displayed in real-time
- **ComparisonTable**: Hover states, feature checkmarks, recommended plan highlight
- **TimelineVisualizer**: Animated progress bars showing phase durations
- **ServiceSpotlight**: "Start scoping" button that triggers the corresponding wizard
- **All modules**: Dismissible with a close button; each has a "Learn more" action that sends a follow-up message to the AI

### Message Type Extension

The current message type `{ role, content, hidden }` is extended to:

```text
type Msg = {
  role: "user" | "assistant" | "module";
  content: string;
  hidden?: boolean;
  module?: {
    type: string;     // e.g. "roi_calculator"
    data: Record<string, any>;
  };
};
```

Module messages render the GenUI component instead of text.

