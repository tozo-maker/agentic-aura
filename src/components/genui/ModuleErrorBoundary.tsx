import React from "react";
import { AlertTriangle } from "lucide-react";

interface State {
  hasError: boolean;
}

class ModuleErrorBoundary extends React.Component<React.PropsWithChildren, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("GenUI module render error:", error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center gap-3 py-4 px-5 rounded-xl bg-destructive/5 border border-destructive/20">
          <AlertTriangle className="w-5 h-5 text-destructive shrink-0" />
          <div>
            <p className="text-sm font-sans font-medium text-foreground">Module failed to load</p>
            <p className="text-xs font-sans text-muted-foreground mt-0.5">
              This interactive component encountered an error. Try asking the AI to regenerate it.
            </p>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ModuleErrorBoundary;
