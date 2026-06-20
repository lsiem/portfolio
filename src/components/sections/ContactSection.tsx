import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiCopy, FiGithub, FiLinkedin, FiMail } from 'react-icons/fi';
import { getConfiguredSocialLinks, personalInfo } from '@/content';
import { uiText } from '@/content/ui';
import { SectionWrapper } from '@/components/layout/SectionWrapper';
import { Button } from '@/components/ui/Button';
import { Toast } from '@/components/ui/Toast';
import { useContactForm } from '@/hooks/useContactForm';
import { copyToClipboard } from '@/utils/cn';

const socialIcons = {
  github: FiGithub,
  linkedin: FiLinkedin,
} as const;

export function ContactSection() {
  const [copied, setCopied] = useState(false);
  const {
    formData,
    formErrors,
    isSubmitting,
    submitSuccess,
    handleChange,
    handleBlur,
    handleSubmit,
  } = useContactForm();

  const handleCopyEmail = async () => {
    const success = await copyToClipboard(personalInfo.email);
    if (success) {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <SectionWrapper id="contact" ariaLabelledby="contact-title">
      <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <p className="mb-3 font-mono text-sm uppercase tracking-[0.25em] text-accent">
            Contact
          </p>
          <h2 id="contact-title" className="mb-4 text-4xl font-bold md:text-5xl">
            {uiText.contact.title}
          </h2>
          <p className="mb-8 text-lg text-white/70">{uiText.contact.subtitle}</p>

          <div className="space-y-4">
            <button
              type="button"
              onClick={handleCopyEmail}
              className="flex w-full items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-left hover:border-accent/30"
            >
              <FiMail className="text-accent" />
              <span>{personalInfo.email}</span>
              <FiCopy className="ml-auto text-white/50" />
            </button>

            {getConfiguredSocialLinks().map(({ key, url }) => {
              const Icon = socialIcons[key];
              return (
                <a
                  key={key}
                  href={url}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 hover:border-accent/30"
                >
                  <Icon className="text-accent" />
                  <span className="capitalize">{key}</span>
                </a>
              );
            })}
          </div>
        </div>

        <motion.form
          className="glass-panel p-6 md:p-8"
          onSubmit={(event) => handleSubmit(event)}
          noValidate
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="absolute -left-[9999px]" aria-hidden="true">
            <label htmlFor="contact-website">Website</label>
            <input
              id="contact-website"
              name="website"
              value={formData.website}
              onChange={handleChange}
              tabIndex={-1}
              autoComplete="off"
            />
          </div>

          <div className="space-y-4">
            <div>
              <label htmlFor="contact-name" className="mb-2 block text-sm text-white/80">
                {uiText.contact.name}
              </label>
              <input
                id="contact-name"
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
              <label htmlFor="contact-email" className="mb-2 block text-sm text-white/80">
                {uiText.contact.email}
              </label>
              <input
                id="contact-email"
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
              <label htmlFor="contact-message" className="mb-2 block text-sm text-white/80">
                {uiText.contact.message}
              </label>
              <textarea
                id="contact-message"
                name="message"
                rows={5}
                value={formData.message}
                onChange={handleChange}
                onBlur={handleBlur}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:border-accent/50"
              />
              {formErrors.message ? (
                <p className="mt-1 text-sm text-red-400">{formErrors.message}</p>
              ) : null}
            </div>
          </div>

          <div className="mt-6" aria-live="polite">
            {formErrors.submit ? (
              <p className="mb-3 text-sm text-red-400">{formErrors.submit}</p>
            ) : null}
            {submitSuccess ? (
              <motion.p
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="mb-3 text-sm text-accent"
              >
                {uiText.contact.success}
              </motion.p>
            ) : null}
          </div>

          <Button type="submit" disabled={isSubmitting} className="mt-2">
            {isSubmitting ? uiText.contact.submitting : uiText.contact.submit}
          </Button>
        </motion.form>
      </div>

      <Toast message={uiText.contact.copied} visible={copied} />
    </SectionWrapper>
  );
}
