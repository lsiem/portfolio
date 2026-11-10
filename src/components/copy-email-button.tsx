"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Check, Copy } from "./icons";

export function CopyEmailButton({ email }: { email: string }) {
  const t = useTranslations("contact");
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard unavailable: the mailto link next to this button still works.
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      className="inline-flex h-11 items-center gap-2 rounded-md border border-border px-4 font-mono text-sm text-muted transition-colors hover:border-border-strong hover:text-fg"
    >
      {copied ? <Check className="text-ok" /> : <Copy />}
      <span aria-live="polite">{copied ? t("copied") : t("copyEmail")}</span>
    </button>
  );
}
