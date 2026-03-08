

# Fix: Module Marker Regex Fails on Nested JSON Brackets

## Root Cause

The `parseModuleDeployments` regex uses `[\s\S]*?` (non-greedy) to match the JSON body inside `[DEPLOY_MODULE:type:{ ... }]`. However, the JSON contains arrays with `]` characters (e.g., `"useCases":["SaaS","Healthcare"]`). The non-greedy match terminates at the **first** `]` it finds — the one closing a JSON array — not the actual marker-closing bracket. This leaves the remainder of the JSON (e.g., `,"highlight":"50%+","useCases":[...]}]`) as visible "clean" text.

Example of the failure:
```
[DEPLOY_MODULE:service_spotlight:{"features":["a","b"],"highlight":"x"}]
                                              ^--- regex stops here (first ])
Leftover visible: ,"highlight":"x"}]
```

## Fix

Replace the simple regex approach with a **bracket-counting parser** that correctly identifies the end of the JSON payload by tracking nested `[` and `]` characters. This ensures the marker boundary is found only when all brackets are balanced.

## Changes

| File | Change |
|------|--------|
| `src/components/genui/parseModules.ts` | Replace regex with a bracket-counting parser that finds complete `[DEPLOY_MODULE:type:{...}]` markers even when JSON contains nested brackets |

### Implementation

```typescript
export function parseModuleDeployments(text: string) {
  const modules: ModuleDeployment[] = [];
  let clean = "";
  let i = 0;
  const marker = "[DEPLOY_MODULE:";

  while (i < text.length) {
    const idx = text.indexOf(marker, i);
    if (idx === -1) { clean += text.slice(i); break; }
    clean += text.slice(i, idx);
    
    // Find the type
    const typeStart = idx + marker.length;
    const colonIdx = text.indexOf(":", typeStart);
    if (colonIdx === -1) { /* incomplete marker, strip rest */ break; }
    const type = text.slice(typeStart, colonIdx);
    
    // Bracket-count to find matching end ]
    let depth = 1; // we're inside the outer [
    let j = colonIdx + 1;
    while (j < text.length && depth > 0) {
      if (text[j] === "[") depth++;
      else if (text[j] === "]") depth--;
      j++;
    }
    
    if (depth > 0) { /* incomplete, strip from idx onward */ break; }
    
    const jsonStr = text.slice(colonIdx + 1, j - 1);
    try { modules.push({ type, data: JSON.parse(jsonStr) }); } catch {}
    i = j;
  }

  return { clean: clean.trim(), modules };
}
```

This single change fixes both the "leaking tail" problem and the "incomplete marker" problem in one unified parser. No other files need changes since `useAIChat.ts` already calls this function.

