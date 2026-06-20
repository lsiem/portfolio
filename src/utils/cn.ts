export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(' ');
}

const HEADER_OFFSET = 80;

export function scrollToSection(href: string): void {
  const id = href.replace('#', '');
  const element = document.getElementById(id);
  if (!element) return;

  // Prefer Lenis when active so programmatic scrolling stays in sync with the
  // smooth-scroll engine; fall back to native scroll (with header offset) when
  // Lenis is disabled (reduced motion / coarse pointer).
  const lenis = window.__lenis;
  if (lenis) {
    lenis.scrollTo(element, { offset: -HEADER_OFFSET });
    return;
  }

  const top = element.getBoundingClientRect().top + window.scrollY - HEADER_OFFSET;
  window.scrollTo({ top, behavior: 'smooth' });
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}
