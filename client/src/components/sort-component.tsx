import { CaretSortIcon, CheckIcon } from "@radix-ui/react-icons";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useState } from "react";
type Props = {
  value: string;
  handleChange: (value: string) => void;
  sortOptions: { value: string; label: string }[];
  isPending: boolean;
};
const SortTabs: React.FC<Props> = ({
  value,
  handleChange,
  sortOptions,
  isPending,
}: Props) => {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className=" justify-between rounded-full tracking-widest"
          disabled={isPending}
          type="button"
        >
          {value
            ? sortOptions.find((option) => option.value === value)?.label
            : "Sort by"}
          <CaretSortIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput
            placeholder="sort option"
            className="h-9 placeholder:text-xs font-mono"
            disabled={isPending}
          />
          <CommandEmpty>No option found.</CommandEmpty>
          <CommandGroup>
            {sortOptions.map((option) => (
              <CommandItem
                key={option.value}
                value={option.value}
                onSelect={(currentValue) => {
                  handleChange(currentValue);
                  setOpen(false);
                }}
                disabled={isPending}
                className="text-xs font-mono"
              >
                {option.label}
                <CheckIcon
                  className={cn(
                    "ml-auto h-4 w-4",
                    value === option.value ? "opacity-100" : "opacity-0"
                  )}
                />
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
export default SortTabs;
