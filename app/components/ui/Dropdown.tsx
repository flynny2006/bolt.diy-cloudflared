import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { type ReactNode } from 'react';
import { classNames } from '~/utils/classNames';

interface DropdownProps {
  trigger: ReactNode;
  children: ReactNode;
  align?: 'start' | 'center' | 'end';
  sideOffset?: number;
}

interface DropdownItemProps {
  children: ReactNode;
  onSelect?: () => void;
  className?: string;
}

export const DropdownItem = ({ children, onSelect, className }: DropdownItemProps) => (
  <DropdownMenu.Item
    className={classNames(
      'relative flex items-center gap-2 px-3 py-2 rounded-lg text-sm',
      'text-bolt-elements-textPrimary hover:text-bolt-elements-textPrimary',
      'hover:bg-bolt-elements-background-depth-3',
      'transition-colors cursor-pointer',
      'outline-none',
      className,
    )}
    onSelect={onSelect}
  >
    {children}
  </DropdownMenu.Item>
);

export const DropdownSeparator = () => <DropdownMenu.Separator className="h-px bg-bolt-elements-borderColor my-1" />;

export const Dropdown = ({ trigger, children, align = 'end', sideOffset = 5 }: DropdownProps) => {
  const triggerWithChevron = (
    <span className="flex items-center gap-2">
      {trigger}
      <svg className="w-4 h-4 opacity-70" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
    </span>
  );
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>{triggerWithChevron}</DropdownMenu.Trigger>
        <DropdownMenu.Content
          className={classNames(
          'min-w-[220px] rounded-xl p-2',
          'bg-white/80 dark:bg-bolt-elements-background-depth-2/80 backdrop-blur-md',
            'border border-bolt-elements-borderColor',
          'shadow-2xl',
            'animate-in fade-in-80 zoom-in-95',
            'data-[side=bottom]:slide-in-from-top-2',
            'data-[side=left]:slide-in-from-right-2',
            'data-[side=right]:slide-in-from-left-2',
            'data-[side=top]:slide-in-from-bottom-2',
            'z-[1000]',
          )}
          sideOffset={sideOffset}
          align={align}
        >
          {children}
        </DropdownMenu.Content>
    </DropdownMenu.Root>
  );
};
