import { Card, CardContent } from "@/components/ui/card";
import type { MetricCardProps } from "@/lib/type";

export function MetricCard({
  label,
  value,
  icon: Icon,
  iconTone,
  detail,
  variant = "dashboard",
}: MetricCardProps) {
  return (
    <Card className="rounded-2xl border-brand-line bg-white shadow-none">
      {variant === "compact" ? (
        <CardContent className="flex items-center gap-4 p-5">
          <span
            className={`grid size-10 place-items-center rounded-xl ${iconTone}`}
          >
            <Icon className="size-5" />
          </span>
          <span className="flex flex-col gap-1">
            <span className="text-2xl font-semibold tracking-tight">
              {value}
            </span>
            <span className="text-xs text-muted-foreground">{label}</span>
          </span>
        </CardContent>
      ) : (
        <CardContent className="flex flex-col gap-5 p-5">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">{label}</span>
            <span
              className={`grid size-9 place-items-center rounded-xl ${iconTone}`}
            >
              <Icon className="size-4" />
            </span>
          </div>
          <div className="flex items-end justify-between gap-2">
            <span className="text-3xl font-semibold tracking-tight">
              {value}
            </span>
            {detail && (
              <span className="text-[11px] text-muted-foreground">
                {detail}
              </span>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  );
}
