import React, { lazy, Suspense } from "react";
import type { ModuleDeployment } from "./parseModules";

const ServiceSpotlight = lazy(() => import("./modules/ServiceSpotlight"));
const ComparisonTable = lazy(() => import("./modules/ComparisonTable"));
const ROICalculator = lazy(() => import("./modules/ROICalculator"));
const CaseStudyCard = lazy(() => import("./modules/CaseStudyCard"));
const TimelineVisualizer = lazy(() => import("./modules/TimelineVisualizer"));
const PricingTier = lazy(() => import("./modules/PricingTier"));
const ProcessFlow = lazy(() => import("./modules/ProcessFlow"));

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const registry: Record<string, React.LazyExoticComponent<React.ComponentType<any>>> = {
  service_spotlight: ServiceSpotlight,
  comparison_table: ComparisonTable,
  roi_calculator: ROICalculator,
  case_study: CaseStudyCard,
  timeline: TimelineVisualizer,
  pricing_tier: PricingTier,
  process_flow: ProcessFlow,
};

interface GenUIRendererProps {
  deployment: ModuleDeployment;
  onAction?: (msg: string) => void;
}

const GenUIRenderer = ({ deployment, onAction }: GenUIRendererProps) => {
  const Component = registry[deployment.type];
  if (!Component) return null;

  return (
    <Suspense fallback={<div className="h-24 animate-pulse rounded-md bg-secondary" />}>
      <Component data={deployment.data} onAction={onAction} />
    </Suspense>
  );
};

export default GenUIRenderer;
