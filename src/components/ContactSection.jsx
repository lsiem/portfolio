import { useRef, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { gsap } from 'gsap';
import { FiMail, FiGithub, FiLinkedin } from 'react-icons/fi';
import { useContactForm } from '../hooks/useContactForm';
import { personalInfo, hasSocialLink } from '../config/personal';
import { prefersReducedMotion } from '../utils/motion';
import { useGsapScroll } from '../hooks/useGsapScroll';

const ContactSection = () => {
  const sectionRef = useRef(null);
  const titleRef = useRef(null);
  const underlineRef = useRef(null);
  const formRef = useRef(null);
  const starsRef = useRef([]);

  // Use shared contact form hook
  const {
    formData,
    formErrors,
    isSubmitting,
    submitSuccess,
    handleChange,
    handleBlur,
    handleSubmit
  } = useContactForm();

  // Generate random stars for background
  const stars = useMemo(() => Array.from({ length: 12 }, (_, i) => ({
    id: i,
    size: Math.random() * 3 + 1,
    top: `${Math.random() * 100}%`,
    left: `${Math.random() * 100}%`,
    opacity: Math.random() * 0.5 + 0.3,
    delay: Math.random() * 2
  })), []);

  // GSAP Animations
  const setupAnimations = useCallback(() => {
    if (prefersReducedMotion()) return;

    // Animate title
    gsap.fromTo(
      titleRef.current,
      { y: 100, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 80%',
          toggleActions: 'play none none reverse'
        }
      }
    );

    // Animate underline
    gsap.fromTo(
      underlineRef.current,
      { width: 0 },
      {
        width: '100%',
        duration: 1,
        delay: 0.3,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 80%',
          toggleActions: 'play none none reverse'
        }
      }
    );

    // Animate form container
    gsap.fromTo(
      formRef.current,
      { y: 80, opacity: 0, scale: 0.95 },
      {
        y: 0,
        opacity: 1,
        scale: 1,
        duration: 1,
        delay: 0.5,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 80%',
          toggleActions: 'play none none reverse'
        }
      }
    );

    // Animate stars with parallax effect
    starsRef.current.forEach((star, index) => {
      if (star) {
        gsap.to(star, {
          y: -50 - (index % 3) * 20,
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1 + (index % 3) * 0.5
          }
        });
      }
    });
  }, []);

  useGsapScroll(sectionRef, [], setupAnimations);

  return (
    <section
      id="contact"
      ref={sectionRef}
      className="min-h-screen relative overflow-hidden bg-gradient-to-b from-[#070F32] to-black px-4 lg:px-24 py-20"
    >
      {/* Decorative Background Stars */}
      {stars.map((star, index) => (
        <div
          key={star.id}
          ref={el => starsRef.current[index] = el}
          className="absolute rounded-full bg-white pointer-events-none"
          style={{
            width: `${star.size}px`,
            height: `${star.size}px`,
            top: star.top,
            left: star.left,
            opacity: star.opacity,
            animation: `twinkle ${2 + star.delay}s infinite alternate`
          }}
        />
      ))}

      {/* Section Title */}
      <div className="text-center mb-16">
        <h2
          ref={titleRef}
          className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4"
        >
          Kontakt
        </h2>
        <div className="relative w-32 mx-auto">
          <div
            ref={underlineRef}
            className="h-1 bg-gradient-to-r from-blue-600 to-blue-400 rounded-full"
            style={{ width: 0 }}
          />
        </div>
      </div>

      {/* Contact Form Container */}
      <div
        ref={formRef}
        className="max-w-2xl mx-auto bg-white/5 backdrop-blur-sm rounded-2xl p-8 md:p-12 shadow-2xl shadow-blue-900/20"
      >
        {/* Success Message */}
        {submitSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            role="alert"
            aria-live="polite"
            className="mb-6 p-4 bg-green-500/20 border border-green-500/50 rounded-lg text-green-300 text-center"
          >
            Vielen Dank für deine Nachricht! Ich werde mich bald bei dir melden.
          </motion.div>
        )}

        {/* General Error Message */}
        {formErrors.submit && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            role="alert"
            aria-live="assertive"
            className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300 text-center"
          >
            {formErrors.submit}
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Honeypot field - invisible to users, catches bots */}
          <div className="hidden" aria-hidden="true">
            <label htmlFor="website">Website</label>
            <input
              type="text"
              id="website"
              name="website"
              value={formData.website}
              onChange={handleChange}
              tabIndex="-1"
              autoComplete="off"
            />
          </div>

          {/* Name Field */}
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-blue-200 mb-2"
            >
              Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Dein Name"
              aria-invalid={formErrors.name ? 'true' : 'false'}
              aria-describedby={formErrors.name ? 'name-error' : undefined}
              className={`w-full px-4 py-3 rounded-lg bg-white/10 border ${
                formErrors.name ? 'border-red-500' : 'border-white/20'
              } text-white placeholder-blue-200/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300`}
            />
            {formErrors.name && (
              <p id="name-error" className="text-red-400 text-sm mt-1" role="alert" aria-live="polite">
                {formErrors.name}
              </p>
            )}
          </div>

          {/* Email Field */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-blue-200 mb-2"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="deine@email.de"
              aria-invalid={formErrors.email ? 'true' : 'false'}
              aria-describedby={formErrors.email ? 'email-error' : undefined}
              className={`w-full px-4 py-3 rounded-lg bg-white/10 border ${
                formErrors.email ? 'border-red-500' : 'border-white/20'
              } text-white placeholder-blue-200/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300`}
            />
            {formErrors.email && (
              <p id="email-error" className="text-red-400 text-sm mt-1" role="alert" aria-live="polite">
                {formErrors.email}
              </p>
            )}
          </div>

          {/* Message Field */}
          <div>
            <label
              htmlFor="message"
              className="block text-sm font-medium text-blue-200 mb-2"
            >
              Nachricht
            </label>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Deine Nachricht..."
              rows="6"
              aria-invalid={formErrors.message ? 'true' : 'false'}
              aria-describedby={formErrors.message ? 'message-error' : undefined}
              className={`w-full px-4 py-3 rounded-lg bg-white/10 border ${
                formErrors.message ? 'border-red-500' : 'border-white/20'
              } text-white placeholder-blue-200/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 resize-none`}
            />
            {formErrors.message && (
              <p id="message-error" className="text-red-400 text-sm mt-1" role="alert" aria-live="polite">
                {formErrors.message}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <motion.button
            type="submit"
            disabled={isSubmitting}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`w-full md:w-auto px-8 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-blue-400 text-white font-semibold hover:from-blue-700 hover:to-blue-500 hover:shadow-lg hover:shadow-blue-500/50 transition-all duration-300 ${
              isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isSubmitting ? 'Wird gesendet...' : 'Nachricht senden'}
          </motion.button>
        </form>
      </div>

      {/* Alternative Contact Information */}
      <div className="flex flex-wrap gap-6 justify-center mt-12">
        {hasSocialLink('email') && (
          <a
            href={`mailto:${personalInfo.email}`}
            className="flex items-center gap-2 text-blue-200 hover:text-white transition-colors"
            aria-label="Email senden"
          >
            <FiMail className="text-xl" />
            <span>{personalInfo.email}</span>
          </a>
        )}
        {hasSocialLink('github') && (
          <a
            href={personalInfo.github}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-blue-200 hover:text-white transition-colors"
            aria-label="GitHub Profil besuchen"
          >
            <FiGithub className="text-xl" />
            <span>GitHub</span>
          </a>
        )}
        {hasSocialLink('linkedin') && (
          <a
            href={personalInfo.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-blue-200 hover:text-white transition-colors"
            aria-label="LinkedIn Profil besuchen"
          >
            <FiLinkedin className="text-xl" />
            <span>LinkedIn</span>
          </a>
        )}
      </div>
    </section>
  );
};

export default ContactSection;
