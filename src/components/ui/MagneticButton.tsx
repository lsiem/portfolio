import { useRef, type MouseEvent, type ReactNode } from 'react';
import { cn } from '@/utils/cn';
import { useMotionPreferences } from '@/hooks/useReducedMotion';

interface MagneticButtonProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  href?: string;
  type?: 'button' | 'submit';
  disabled?: boolean;
  'aria-label'?: string;
}

export function MagneticButton({
  children,
  className,
  onClick,
  href,
  type = 'button',
  disabled,
  'aria-label': ariaLabel,
}: MagneticButtonProps) {
  const ref = useRef<HTMLButtonElement & HTMLAnchorElement>(null);
  const { reducedMotion } = useMotionPreferences();

  const handleMove = (event: MouseEvent) => {
    if (reducedMotion || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = event.clientX - rect.left - rect.width / 2;
    const y = event.clientY - rect.top - rect.height / 2;
    ref.current.style.transform = `translate(${x * 0.12}px, ${y * 0.12}px)`;
  };

  const reset = () => {
    if (!ref.current) return;
    ref.current.style.transform = 'translate(0, 0)';
  };

  const sharedClassName = cn(
    'inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-medium text-white transition-[transform,background-color,border-color] duration-200 hover:border-accent/40 hover:bg-white/10',
    className,
  );

  if (href) {
    return (
      <a
        ref={ref}
        href={href}
        aria-label={ariaLabel}
        className={sharedClassName}
        onMouseMove={handleMove}
        onMouseLeave={reset}
        target={href.startsWith('http') ? '_blank' : undefined}
        rel={href.startsWith('http') ? 'noreferrer noopener' : undefined}
      >
        {children}
      </a>
    );
  }

  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled}
      aria-label={ariaLabel}
      className={sharedClassName}
      onClick={onClick}
      onMouseMove={handleMove}
      onMouseLeave={reset}
    >
      {children}
    </button>
  );
}
