

# Add Quick-Reply Suggestion Chips After AI Responses

## Problem
When the AI asks a follow-up question (e.g., "What is your monthly ticket volume?"), users must manually type their answer. There are no tappable quick-reply options, making the UX feel like a plain text chat rather than a guided conversation.

## Solution
Have the AI emit structured **quick-reply suggestions** via a new marker `[SUGGESTIONS:...]`, and render them as clickable chips below the last assistant message. Clicking a chip sends it as the user's message.

## Changes

| File | Change |
|------|--------|
| `supabase/functions/chat/index.ts` | Add instruction to the system prompt telling the AI to emit `[SUGGESTIONS:["option1","option2","option3"]]` at the end of responses when asking questions |
| `src/components/genui/parseModules.ts` | Add a `parseSuggestions()` function that extracts suggestion arrays from text and returns clean text + suggestions |
| `src/hooks/useAIChat.ts` | Parse suggestions from streamed text, store latest suggestions in state, expose them |
| `src/components/canvas/ChatRail.tsx` | Render suggestion chips below the last assistant message; clicking one calls `onSendMessage` |
| `src/components/AIChat.tsx` | Same suggestion chip rendering for the floating chat widget |

## Implementation Details

### 1. New marker format in system prompt
```
When you ask the user a question, ALWAYS end your response with a suggestions marker:
[SUGGESTIONS:["Under 500/mo","500-2000/mo","2000-10000/mo","10000+"]]
Provide 2-4 contextually relevant quick-reply options. Keep each option under 6 words.
```

### 2. Parser (`parseModules.ts`)
```typescript
export function parseSuggestions(text: string): { clean: string; suggestions: string[] } {
  const match = text.match(/\[SUGGESTIONS:\[([^\]]*)\]\]/);
  if (!match) {
    // Also strip incomplete markers being streamed
    const incomplete = text.lastIndexOf("[SUGGESTIONS:");
    if (incomplete !== -1) return { clean: text.slice(0, incomplete).trim(), suggestions: [] };
    return { clean: text, suggestions: [] };
  }
  const clean = text.replace(/\[SUGGESTIONS:\[[^\]]*\]\]/, "").trim();
  try {
    const suggestions = JSON.parse(`[${match[1]}]`);
    return { clean, suggestions };
  } catch { return { clean, suggestions: [] }; }
}
```

### 3. State in `useAIChat.ts`
- Add `suggestions: string[]` state
- After stream completes, parse final text for suggestions
- Reset suggestions when user sends a new message

### 4. Chip UI in `ChatRail.tsx`
Render below messages area, above input:
```tsx
{suggestions.length > 0 && !isLoading && (
  <div className="flex flex-wrap gap-2 px-3 pb-2">
    {suggestions.map((s) => (
      <button key={s} onClick={() => onSendMessage(s)}
        className="px-3 py-1.5 text-xs font-sans rounded-full border border-border 
        bg-card hover:bg-primary hover:text-primary-foreground transition-colors">
        {s}
      </button>
    ))}
  </div>
)}
```

This gives users a tap-friendly, guided conversation flow while still allowing free-text input.

