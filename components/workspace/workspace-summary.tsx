import type { GuidedDemoMilestone } from "@/components/workspace/types";
import { GuidedDemo } from "@/components/workspace/guided-demo";

export function WorkspaceSummary({ onLoadDemo, guideDismissed, guideMilestones, onDismissGuide }: {
  onLoadDemo: () => void;
  guideDismissed: boolean;
  guideMilestones: ReadonlySet<GuidedDemoMilestone>;
  onDismissGuide: () => void;
}) {
  if (guideDismissed) return null;
  return <div className="workspace-support"><GuidedDemo completed={guideMilestones} onDismiss={onDismissGuide} onStart={onLoadDemo} /></div>;
}
