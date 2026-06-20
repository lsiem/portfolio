import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { FiGithub, FiLinkedin, FiMenu, FiX } from 'react-icons/fi';
import { getConfiguredSocialLinks, personalInfo } from '@/content';
import { navItems, uiText } from '@/content/ui';
import { useScrollSpy } from '@/hooks/useScrollSpy';
import { useMotionPreferences } from '@/hooks/useReducedMotion';
import { cn, scrollToSection } from '@/utils/cn';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { useContactForm } from '@/hooks/useContactForm';

const socialIcons = {
  github: FiGithub,
  linkedin: FiLinkedin,
} as const;

export function Header() {
  const activeSection = useScrollSpy();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const { reducedMotion, toggleReducedMotion } = useMotionPreferences();
  const {
    formData,
    formErrors,
    isSubmitting,
    submitSuccess,
    handleChange,
    handleBlur,
    handleSubmit,
    resetForm,
  } = useContactForm();

  const handleNavClick = (href: string) => {
    scrollToSection(href);
    setMobileOpen(false);
  };

  return (
    <>
      <a
        href="#home"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[80] focus:rounded-md focus:bg-space-900 focus:px-4 focus:py-2"
      >
        {uiText.accessibility.skipToContent}
      </a>

      <header className="fixed inset-x-0 top-0 z-[60] border-b border-white/5 bg-space-950/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 md:px-12">
          <button
            type="button"
            onClick={() => handleNavClick('#home')}
            className="font-mono text-sm font-semibold tracking-[0.2em] text-white"
            aria-label="Zur Startseite"
          >
            LSIEM<span className="text-accent">.</span>
          </button>

          <nav className="hidden items-center gap-1 lg:flex" aria-label="Hauptnavigation">
            {navItems.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNavClick(item.href)}
                className={cn(
                  'rounded-full px-4 py-2 text-sm transition-colors',
                  activeSection === item.id
                    ? 'bg-white/10 text-white'
                    : 'text-white/70 hover:text-white',
                )}
                aria-current={activeSection === item.id ? 'page' : undefined}
              >
                {item.label}
              </button>
            ))}
          </nav>

          <div className="hidden items-center gap-3 lg:flex">
            {getConfiguredSocialLinks().map(({ key, url }) => {
              const Icon = socialIcons[key];
              return (
                <a
                  key={key}
                  href={url}
                  target="_blank"
                  rel="noreferrer noopener"
                  aria-label={key}
                  className="rounded-full p-2 text-white/70 transition-colors hover:bg-white/10 hover:text-white"
                >
                  <Icon size={18} />
                </a>
              );
            })}
            <button
              type="button"
              onClick={toggleReducedMotion}
              className="rounded-full border border-white/10 px-3 py-1.5 text-xs text-white/70 hover:border-accent/30 hover:text-white"
              aria-pressed={reducedMotion}
            >
              {uiText.accessibility.reducedMotion}
            </button>
            <Button onClick={() => setContactOpen(true)}>{uiText.nav.contact}</Button>
          </div>

          <button
            type="button"
            className="rounded-full p-2 text-white lg:hidden"
            aria-label={mobileOpen ? 'Menü schließen' : 'Menü öffnen'}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((open) => !open)}
          >
            {mobileOpen ? <FiX size={22} /> : <FiMenu size={22} />}
          </button>
        </div>

        <AnimatePresence>
          {mobileOpen ? (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden border-t border-white/5 lg:hidden"
            >
              <div className="space-y-2 px-6 py-4">
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleNavClick(item.href)}
                    className="block w-full rounded-xl px-4 py-3 text-left text-white/80 hover:bg-white/5"
                  >
                    {item.label}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={toggleReducedMotion}
                  className="block w-full rounded-xl px-4 py-3 text-left text-white/70 hover:bg-white/5"
                  aria-pressed={reducedMotion}
                >
                  {uiText.accessibility.reducedMotion}
                </button>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </header>

      <Modal open={contactOpen} onClose={() => setContactOpen(false)} title={uiText.contact.title}>
        <form
          className="space-y-4"
          onSubmit={(event) =>
            handleSubmit(event, () => {
              window.setTimeout(() => setContactOpen(false), 1500);
            })
          }
          noValidate
        >
          <div className="absolute -left-[9999px]" aria-hidden="true">
            <label htmlFor="header-website">Website</label>
            <input
              id="header-website"
              name="website"
              value={formData.website}
              onChange={handleChange}
              tabIndex={-1}
              autoComplete="off"
            />
          </div>

          <div>
            <label htmlFor="header-name" className="mb-2 block text-sm text-white/80">
              {uiText.contact.name}
            </label>
            <input
              id="header-name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              onBlur={handleBlur}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:border-accent/50"
            />
            {formErrors.name ? (
              <p className="mt-1 text-sm text-red-400">{formErrors.name}</p>
            ) : null}
          </div>

          <div>
            <label htmlFor="header-email" className="mb-2 block text-sm text-white/80">
              {uiText.contact.email}
            </label>
            <input
              id="header-email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              onBlur={handleBlur}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:border-accent/50"
            />
            {formErrors.email ? (
              <p className="mt-1 text-sm text-red-400">{formErrors.email}</p>
            ) : null}
          </div>

          <div>
            <label htmlFor="header-message" className="mb-2 block text-sm text-white/80">
              {uiText.contact.message}
            </label>
            <textarea
              id="header-message"
              name="message"
              rows={4}
              value={formData.message}
              onChange={handleChange}
              onBlur={handleBlur}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:border-accent/50"
            />
            {formErrors.message ? (
              <p className="mt-1 text-sm text-red-400">{formErrors.message}</p>
            ) : null}
          </div>

          <div aria-live="polite">
            {formErrors.submit ? (
              <p className="text-sm text-red-400">{formErrors.submit}</p>
            ) : null}
            {submitSuccess ? (
              <p className="text-sm text-accent">{uiText.contact.success}</p>
            ) : null}
          </div>

          <div className="flex gap-3">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? uiText.contact.submitting : uiText.contact.submit}
            </Button>
            <Button type="button" variant="ghost" onClick={resetForm}>
              Reset
            </Button>
          </div>
        </form>
        <p className="mt-4 text-sm text-white/60">{personalInfo.email}</p>
      </Modal>
    </>
  );
}
