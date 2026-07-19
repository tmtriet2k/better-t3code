import { memo } from "react";
import { FilePlusIcon } from "lucide-react";
import { Button } from "./ui/button";
import { Tooltip, TooltipPopup, TooltipTrigger } from "./ui/tooltip";

interface AddSpecButtonProps {
  onClick: () => void;
  pending: boolean;
}

export const AddSpecButton = memo(function AddSpecButton({ onClick, pending }: AddSpecButtonProps) {
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            size="icon-xs"
            variant="outline"
            aria-label="Add spec"
            disabled={pending}
            onClick={onClick}
          />
        }
      >
        <FilePlusIcon className="size-4" />
      </TooltipTrigger>
      <TooltipPopup side="top">Add spec</TooltipPopup>
    </Tooltip>
  );
});
