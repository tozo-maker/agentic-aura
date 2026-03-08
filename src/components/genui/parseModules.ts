export interface ModuleDeployment {
  type: string;
  data: Record<string, any>;
}

export function parseModuleDeployments(text: string): {
  clean: string;
  modules: ModuleDeployment[];
} {
  const modules: ModuleDeployment[] = [];
  let clean = "";
  let i = 0;
  const marker = "[DEPLOY_MODULE:";

  while (i < text.length) {
    const idx = text.indexOf(marker, i);
    if (idx === -1) { clean += text.slice(i); break; }
    clean += text.slice(i, idx);

    const typeStart = idx + marker.length;
    const colonIdx = text.indexOf(":", typeStart);
    if (colonIdx === -1) { break; }
    const type = text.slice(typeStart, colonIdx);

    let depth = 1;
    let j = colonIdx + 1;
    while (j < text.length && depth > 0) {
      if (text[j] === "[") depth++;
      else if (text[j] === "]") depth--;
      j++;
    }

    if (depth > 0) { break; }

    const jsonStr = text.slice(colonIdx + 1, j - 1);
    try { modules.push({ type, data: JSON.parse(jsonStr) }); } catch {}
    i = j;
  }

  return { clean: clean.trim(), modules };
}
