import { statusGlyph } from "@/components/workspace/presentation";
import type { ControlResult } from "@/src/domain/schemas";
import { useLocale } from "@/src/i18n/locale-context";

export function StatusBadge({ status }: { status: ControlResult["status"] }) {
  const { t } = useLocale();
  return (
    <span className="status-mark" data-status={status}>
      <span aria-hidden="true">{statusGlyph(status)}</span>
      {t(`status.${status}`)}
    </span>
  );
}
