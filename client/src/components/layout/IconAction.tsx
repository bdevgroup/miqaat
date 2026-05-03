import * as React from 'react';
import { Button, type ButtonProps } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

type Props = Omit<ButtonProps, 'children' | 'title'> & {
  label: string;
  shortcut?: string;
  children: React.ReactNode;
};

export const IconAction = React.forwardRef<HTMLButtonElement, Props>(
  function IconAction({ label, shortcut, children, ...rest }, ref) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <Button ref={ref} variant="ghost" size="icon" aria-label={label} {...rest}>
            {children}
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <span>{label}</span>
          {shortcut && (
            <span className="ml-2 rounded bg-primary-foreground/10 px-1 font-mono text-[10px] uppercase tracking-wider">
              {shortcut}
            </span>
          )}
        </TooltipContent>
      </Tooltip>
    );
  },
);
