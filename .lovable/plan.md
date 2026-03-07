

# Fix: GenUI Module Markers Leaking Into Chat Text

## Root Cause

The `parseModuleDeployments` regex only matches **complete** markers: `[DEPLOY_MODULE:type:{...json...}]`. During streaming, tokens arrive incrementally, so the accumulated text temporarily contains partial markers like:

```
,"highlight":"90% less manual entry","useCases":["Custom Prototyping"...
```

This partial text doesn't match the regex, passes through as "clean" text, and gets rendered visibly in the chat.

## Fix

Modify the streaming display logic in `AIChat.tsx` to detect and hide incomplete `[DEPLOY_MODULE:` markers from the displayed text. Specifically:

1. **In `parseModuleDeployments` (`parseModules.ts`)**: After stripping complete markers, check if there's a trailing incomplete marker (text containing `[DEPLOY_MODULE:` without a matching closing `]`). Strip everything from the last unmatched `[DEPLOY_MODULE:` onward from the "clean" output.

2. **Same approach for `[FIELD_UPDATE:` markers**: Apply identical buffering logic to prevent any partial `[FIELD_UPDATE:` from leaking.

## Changes

| File | Change |
|------|--------|
| `src/components/genui/parseModules.ts` | After regex replacement, strip any trailing incomplete `[DEPLOY_MODULE:...` that hasn't closed yet |
| `src/components/AIChat.tsx` | Same treatment for `parseFieldUpdates` — strip trailing incomplete `[FIELD_UPDATE:...` |

## Implementation Detail

In `parseModules.ts`, after the existing regex replace:
```typescript
// Strip any incomplete marker still being streamed
const incompleteIdx = clean.lastIndexOf("[DEPLOY_MODULE:");
if (incompleteIdx !== -1) {
  // Check if there's a matching close bracket after it
  const afterMarker = clean.slice(incompleteIdx);
  if (!afterMarker.match(/\[DEPLOY_MODULE:\w+:[\s\S]*?\]/)) {
    clean = clean.slice(0, incompleteIdx).trim();
  }
}
```

Same pattern for `[FIELD_UPDATE:` in the `parseFieldUpdates` function inside `AIChat.tsx`.

