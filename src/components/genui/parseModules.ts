export interface ModuleDeployment {
  type: string;
  data: Record<string, any>;
}

export function parseModuleDeployments(text: string): {
  clean: string;
  modules: ModuleDeployment[];
} {
  const modules: ModuleDeployment[] = [];
  const clean = text.replace(
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
  return { clean: clean.trim(), modules };
}
