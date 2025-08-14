"use client";

import * as React from "react";
import { Check, ChevronRight, Circle } from "lucide-react";
import { cn } from "@/lib/utils";

interface DropdownMenuContextValue {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const DropdownMenuContext = React.createContext<DropdownMenuContextValue>({
  open: false,
  onOpenChange: () => {},
});

interface DropdownMenuProps {
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

function DropdownMenu({ children, open: controlledOpen, onOpenChange }: DropdownMenuProps) {
  const [internalOpen, setInternalOpen] = React.useState(false);
  const open = controlledOpen ?? internalOpen;

  const handleOpenChange = React.useCallback((newOpen: boolean) => {
    if (controlledOpen === undefined) {
      setInternalOpen(newOpen);
    }
    onOpenChange?.(newOpen);
  }, [controlledOpen, onOpenChange]);

  return (
    <DropdownMenuContext.Provider value={{ open, onOpenChange: handleOpenChange }}>
      {children}
    </DropdownMenuContext.Provider>
  );
}

interface DropdownMenuTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
}

const DropdownMenuTrigger = React.forwardRef<HTMLButtonElement, DropdownMenuTriggerProps>(
  ({ className, children, asChild = false, ...props }, ref) => {
    const { onOpenChange } = React.useContext(DropdownMenuContext);

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      onOpenChange(true);
      props.onClick?.(e);
    };

    if (asChild) {
      return React.cloneElement(children as React.ReactElement, {
        ref,
        onClick: handleClick,
      });
    }

    return (
      <button
        ref={ref}
        className={className}
        onClick={handleClick}
        {...props}
      >
        {children}
      </button>
    );
  }
);
DropdownMenuTrigger.displayName = "DropdownMenuTrigger";

interface DropdownMenuContentProps extends React.HTMLAttributes<HTMLDivElement> {
  align?: "start" | "center" | "end";
  sideOffset?: number;
}

const DropdownMenuContent = React.forwardRef<HTMLDivElement, DropdownMenuContentProps>(
  ({ className, children, align = "center", sideOffset = 4, ...props }, ref) => {
    const { open, onOpenChange } = React.useContext(DropdownMenuContext);
    const contentRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (contentRef.current && !contentRef.current.contains(event.target as Node)) {
          onOpenChange(false);
        }
      };

      const handleEscape = (event: KeyboardEvent) => {
        if (event.key === "Escape") {
          onOpenChange(false);
        }
      };

      if (open) {
        document.addEventListener("mousedown", handleClickOutside);
        document.addEventListener("keydown", handleEscape);
      }

      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
        document.removeEventListener("keydown", handleEscape);
      };
    }, [open, onOpenChange]);

    if (!open) return null;

    return (
      <div
        ref={(node) => {
          contentRef.current = node;
          if (typeof ref === "function") ref(node);
          else if (ref) ref.current = node;
        }}
        className={cn(
          "absolute z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md",
          "animate-in fade-in-0 zoom-in-95",
          className,
        )}
        style={{ marginTop: sideOffset }}
        {...props}
      >
        {children}
      </div>
    );
  }
);
DropdownMenuContent.displayName = "DropdownMenuContent";

interface DropdownMenuItemProps extends React.HTMLAttributes<HTMLDivElement> {
  inset?: boolean;
  variant?: "default" | "destructive";
}

const DropdownMenuItem = React.forwardRef<HTMLDivElement, DropdownMenuItemProps>(
  ({ className, inset, variant = "default", ...props }, ref) => {
    const { onOpenChange } = React.useContext(DropdownMenuContext);

    const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
      onOpenChange(false);
      props.onClick?.(e);
    };

    return (
      <div
        ref={ref}
        className={cn(
          "relative flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors",
          "focus:bg-accent focus:text-accent-foreground hover:bg-accent hover:text-accent-foreground",
          variant === "destructive" && "text-destructive focus:bg-destructive/10 hover:bg-destructive/10",
          inset && "pl-8",
          className,
        )}
        onClick={handleClick}
        {...props}
      />
    );
  }
);
DropdownMenuItem.displayName = "DropdownMenuItem";

interface DropdownMenuLabelProps extends React.HTMLAttributes<HTMLDivElement> {
  inset?: boolean;
}

const DropdownMenuLabel = React.forwardRef<HTMLDivElement, DropdownMenuLabelProps>(
  ({ className, inset, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "px-2 py-1.5 text-sm font-semibold",
        inset && "pl-8",
        className,
      )}
      {...props}
    />
  )
);
DropdownMenuLabel.displayName = "DropdownMenuLabel";

const DropdownMenuSeparator = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("-mx-1 my-1 h-px bg-muted", className)}
      {...props}
    />
  )
);
DropdownMenuSeparator.displayName = "DropdownMenuSeparator";

// Additional components for completeness
const DropdownMenuGroup = ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div {...props}>{children}</div>
);

const DropdownMenuCheckboxItem = React.forwardRef<HTMLDivElement, DropdownMenuItemProps & {
  checked?: boolean;
}>(({ className, children, checked, ...props }, ref) => (
  <DropdownMenuItem
    ref={ref}
    className={cn("relative pl-8", className)}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      {checked && <Check className="h-4 w-4" />}
    </span>
    {children}
  </DropdownMenuItem>
));
DropdownMenuCheckboxItem.displayName = "DropdownMenuCheckboxItem";

const DropdownMenuRadioGroup = ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div {...props}>{children}</div>
);

const DropdownMenuRadioItem = React.forwardRef<HTMLDivElement, DropdownMenuItemProps>(
  ({ className, children, ...props }, ref) => (
    <DropdownMenuItem
      ref={ref}
      className={cn("relative pl-8", className)}
      {...props}
    >
      <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
        <Circle className="h-2 w-2 fill-current" />
      </span>
      {children}
    </DropdownMenuItem>
  )
);
DropdownMenuRadioItem.displayName = "DropdownMenuRadioItem";

const DropdownMenuShortcut = ({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) => (
  <span
    className={cn("ml-auto text-xs tracking-widest opacity-60", className)}
    {...props}
  />
);

const DropdownMenuSub = ({ children }: { children: React.ReactNode }) => <>{children}</>;

const DropdownMenuSubTrigger = React.forwardRef<HTMLDivElement, DropdownMenuItemProps>(
  ({ className, inset, children, ...props }, ref) => (
    <DropdownMenuItem
      ref={ref}
      className={cn(
        "focus:bg-accent focus:text-accent-foreground data-[state=open]:bg-accent data-[state=open]:text-accent-foreground",
        inset && "pl-8",
        className,
      )}
      {...props}
    >
      {children}
      <ChevronRight className="ml-auto h-4 w-4" />
    </DropdownMenuItem>
  )
);
DropdownMenuSubTrigger.displayName = "DropdownMenuSubTrigger";

const DropdownMenuSubContent = React.forwardRef<HTMLDivElement, DropdownMenuContentProps>(
  ({ className, ...props }, ref) => (
    <DropdownMenuContent
      ref={ref}
      className={cn(
        "z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-lg",
        className,
      )}
      {...props}
    />
  )
);
DropdownMenuSubContent.displayName = "DropdownMenuSubContent";

const DropdownMenuPortal = ({ children }: { children: React.ReactNode }) => <>{children}</>;

export {
  DropdownMenu,
  DropdownMenuPortal,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
};