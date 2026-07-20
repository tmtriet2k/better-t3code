import { memo } from "react";
import { TimerIcon } from "lucide-react";
import { type AutoPickupState } from "@t3tools/contracts";
import { Button } from "./ui/button";
import { Tooltip, TooltipPopup, TooltipTrigger } from "./ui/tooltip";
import { cn } from "~/lib/utils";
import { formatRelativeTimeLabel } from "../timestampFormat";

interface AutoPickupToggleProps {
  autoPickupState: AutoPickupState | null;
  autoPickedUpAt: string | null;
  disabled: boolean;
  pending: boolean;
  onToggle: () => void;
}

export const AutoPickupToggle = memo(function AutoPickupToggle({
  autoPickupState,
  autoPickedUpAt,
  disabled,
  pending,
  onToggle,
}: AutoPickupToggleProps) {
  const queued = autoPickupState === "queued";
  const picked = autoPickupState === "picked";
  const label = queued
    ? "Remove from auto-pickup queue"
    : picked
      ? "Queue for auto-pickup again"
      : "Queue for auto-pickup";
  const tooltip = disabled
    ? "Add a spec first"
    : queued
      ? "Queued for auto-pickup — click to remove"
      : picked && autoPickedUpAt
        ? `Auto-picked up ${formatRelativeTimeLabel(autoPickedUpAt)} — click to queue again`
        : "Queue for auto-pickup";

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            size="icon-xs"
            variant={queued ? "secondary" : "outline"}
            aria-label={label}
            aria-pressed={queued ? "true" : "false"}
            disabled={disabled || pending}
            onClick={onToggle}
          />
        }
      >
        <TimerIcon className={cn(queued && "text-primary", picked && !queued && "text-success")} />
      </TooltipTrigger>
      <TooltipPopup side="top">{tooltip}</TooltipPopup>
    </Tooltip>
  );
});
