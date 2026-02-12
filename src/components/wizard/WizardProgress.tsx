interface WizardProgressProps {
  current: number;
  total: number;
}

const WizardProgress = ({ current, total }: WizardProgressProps) => (
  <div className="flex items-center gap-1.5">
    {Array.from({ length: total }, (_, i) => (
      <div
        key={i}
        className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
          i <= current ? "bg-foreground" : "bg-border"
        }`}
      />
    ))}
  </div>
);

export default WizardProgress;
