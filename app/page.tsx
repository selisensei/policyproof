import { DemoReviewWorkspace } from "@/components/demo-review-workspace";
import { LocaleProvider } from "@/src/i18n/locale-context";

export default function Home() {
  return (
    <LocaleProvider>
      <DemoReviewWorkspace />
    </LocaleProvider>
  );
}
