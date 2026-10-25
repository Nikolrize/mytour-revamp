import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { TripTagsProps } from "@/lib/type";

export function TripTags({ interests = [], limit }: TripTagsProps) {
  if (!interests.length) return null;

  const visible = limit === undefined ? interests : interests.slice(0, limit);
  const remaining = interests.slice(visible.length);

  return (
    <>
      {visible.map((interest) => (
        <Badge
          key={interest}
          variant="secondary"
          className="rounded-full bg-brand-blue-soft px-3 py-1 text-brand-blue"
        >
          {interest}
        </Badge>
      ))}
      {!!remaining.length && (
        <Popover>
          <PopoverTrigger
            render={
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-auto rounded-full border-brand-line px-3 py-1 text-xs"
                aria-label={`Show ${remaining.length} more interest tags`}
              />
            }
          >
            +{remaining.length}
          </PopoverTrigger>
          <PopoverContent className="w-auto max-w-64 rounded-xl p-3">
            <p className="pb-2 text-xs font-medium text-muted-foreground">
              More interests
            </p>
            <div className="flex flex-wrap gap-2">
              {remaining.map((interest) => (
                <Badge
                  key={interest}
                  variant="secondary"
                  className="rounded-full bg-brand-blue-soft text-brand-blue"
                >
                  {interest}
                </Badge>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      )}
    </>
  );
}
