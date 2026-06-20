import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cn } from '@/utils/cn';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center rounded-full px-5 py-2.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-space-950 disabled:cursor-not-allowed disabled:opacity-60',
          variant === 'primary' && 'bg-accent text-space-950 hover:bg-cyan-300',
          variant === 'secondary' &&
            'border border-white/15 bg-white/5 text-white hover:border-accent/40 hover:bg-white/10',
          variant === 'ghost' && 'text-white/80 hover:bg-white/10 hover:text-white',
          className,
        )}
        {...props}
      >
        {children}
      </button>
    );
  },
);

Button.displayName = 'Button';
