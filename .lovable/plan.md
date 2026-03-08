

# Reverse Module Order & Move Repeated Modules to Top

## Problem
1. New modules appear at the **bottom** of the canvas — latest should be on top.
2. When a module of the same type is re-deployed, it stays in its original position instead of moving to the top.

## Changes

| File | Change |
|------|--------|
| `src/hooks/useAIChat.ts` | In the `setDeployedModules` updater (~line 131-138): when a module of the same type already exists, **remove it from its current position** and **prepend** it to the front. New types also get prepended. |
| `src/components/canvas/CanvasModuleView.tsx` | Render modules with `layout` prop on motion.div so Framer Motion animates position changes smoothly when order shifts. Update initial animation to slide down from top (`y: -30`). |

## Implementation

**useAIChat.ts** — replace-by-type becomes move-to-front:
```typescript
setDeployedModules((prev) => {
  const updated = prev.filter((p) => !streamModules.some((sm) => sm.type === p.type));
  return [...streamModules, ...updated]; // new/updated modules prepended
});
```

**CanvasModuleView.tsx** — animate reordering:
```tsx
<motion.div
  key={mod.type}
  layout // enables smooth reorder animation
  initial={{ opacity: 0, y: -30, scale: 0.97 }}
  animate={{ opacity: 1, y: 0, scale: 1 }}
  exit={{ opacity: 0, scale: 0.95 }}
  transition={{ type: "spring", stiffness: 300, damping: 28 }}
  ...
```

Two small edits, newest modules always appear first, repeated modules float to the top with a smooth animation.

