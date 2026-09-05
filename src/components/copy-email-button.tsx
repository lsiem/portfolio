"use client";

import { useRef, useState } from "react";

type CopyEmailButtonProps = {
  email: string;
  copyLabel: string;
  copiedLabel: string;
};

export function CopyEmailButton({
  email,
  copyLabel,
  copiedLabel,
}: CopyEmailButtonProps) {
  const [copied, setCopied] = useState(false);
  const resetTimer = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );

  const copyEmail = async (): Promise<void> => {
    await navigator.clipboard.writeText(email);
    setCopied(true);
    if (resetTimer.current) clearTimeout(resetTimer.current);
    resetTimer.current = setTimeout(() => setCopied(false), 2_000);
  };

  return (
    <button
      type="button"
      onClick={() => void copyEmail()}
      className="w-fit rounded-full border border-border px-3 py-1 font-mono text-xs text-muted transition-colors hover:border-foreground hover:text-foreground"
    >
      <span aria-hidden="true">{copied ? "✓" : "⧉"} </span>
      <span aria-live="polite">{copied ? copiedLabel : copyLabel}</span>
    </button>
  );
}
