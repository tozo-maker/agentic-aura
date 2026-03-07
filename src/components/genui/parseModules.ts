export interface ModuleDeployment {
  type: string;
  data: Record<string, any>;
}

export function parseModuleDeployments(text: string): {
  clean: string;
  modules: ModuleDeployment[];
} {
  const modules: ModuleDeployment[] = [];
  let clean = text.replace(
    /\[DEPLOY_MODULE:(\w+):([\s\S]*?)\]/g,
    (_, type, jsonStr) => {
      try {
        const data = JSON.parse(jsonStr);
        modules.push({ type, data });
      } catch {
        // skip malformed
      }
      return "";
    }
  );

  // Strip any incomplete marker still being streamed
  const incompleteIdx = clean.lastIndexOf("[DEPLOY_MODULE:");
  if (incompleteIdx !== -1) {
    const afterMarker = clean.slice(incompleteIdx);
    if (!afterMarker.match(/\[DEPLOY_MODULE:\w+:[\s\S]*?\]/)) {
      clean = clean.slice(0, incompleteIdx);
    }
  }

  return { clean: clean.trim(), modules };
}
