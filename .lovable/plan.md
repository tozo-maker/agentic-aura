

# Fix: Duplicate Modules in Canvas

## Issues Identified from Screenshot

1. **Duplicate modules**: Two nearly identical "Service Spotlight" cards appear in the canvas. This happens because each new message from the AI deploys a new module to `deployedModules`, and the dedup check uses `JSON.stringify` comparison which fails when the AI generates slightly different data (different descriptions/features) for the same service type across messages.

2. **Modules accumulate across messages**: The `deployedModules` state persists across the entire conversation. Each AI response that mentions the same service type adds another module, leading to stacking duplicates.

## Fix

**Strategy**: Deduplicate by module `type` — when a new module of the same type arrives, **replace** the previous one instead of appending. This matches the Gemini Canvas pattern where the canvas shows the *latest* relevant content.

### Changes

| File | Change |
|------|--------|
| `src/hooks/useAIChat.ts` | In `setDeployedModules` updater (~line 123), replace existing modules of the same type instead of only appending truly unique ones. Also clear `streamModules` of same-type duplicates during parsing. |
| `src/components/canvas/CanvasModuleView.tsx` | Use `mod.type` as the animation key instead of index-based `${mod.type}-${i}` to prevent unnecessary re-renders when modules are replaced. |

### Implementation Detail

In `useAIChat.ts`, the dedup logic at line 112-116 (streamModules within a single stream) and line 123-128 (merging into deployedModules) both need to replace-by-type:

```typescript
// streamModules dedup: replace same type
const existingIdx = streamModules.findIndex((d) => d.type === m.type);
if (existingIdx !== -1) streamModules[existingIdx] = m;
else streamModules.push(m);

// deployedModules update: replace same type, append new types
setDeployedModules((prev) => {
  const updated = [...prev];
  streamModules.forEach((sm) => {
    const idx = updated.findIndex((p) => p.type === sm.type);
    if (idx !== -1) updated[idx] = sm;
    else updated.push(sm);
  });
  return updated;
});
```

