import { motion, AnimatePresence } from "framer-motion";
import { FiGithub, FiLinkedin, FiMenu, FiX } from "react-icons/fi";
import { RiCursorLine, RiCursorFill } from "react-icons/ri";
import { useState, useRef, useEffect } from "react";
import { useContactForm } from "../hooks/useContactForm";
import { personalInfo, hasSocialLink } from "../config/personal";
import { prefersReducedMotion } from "../utils/motion";

const Header = () => {
  // Navigation items mapping
  const navigationItems = [
    { label: "Start", id: "home" },
    { label: "Skills", id: "skills" },
    { label: "Über mich", id: "about" },
    { label: "Erfahrung", id: "experience" },
    { label: "Projekte", id: "projects" },
    { label: "Kontakt", id: "contact" }
  ];
  // Toggle the menu state
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Toggle the menu
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // State to track if the contact form is open (mobile only)
  const [isContactFormOpen, setIsContactFormOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // State for custom cursor toggle
  const [customCursorEnabled, setCustomCursorEnabled] = useState(false);
  const [cursorTooltip, setCursorTooltip] = useState(null);

  // Use shared contact form hook
  const {
    formData,
    formErrors,
    isSubmitting,
    submitSuccess,
    handleChange: handleFormChange,
    handleBlur: handleFormBlur,
    handleSubmit: handleFormSubmit
  } = useContactForm();

  // Refs for focus management
  const contactButtonRef = useRef(null);
  const firstInputRef = useRef(null);

  // Check if we're on mobile and initialize custom cursor state
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    // Initialize custom cursor state from localStorage
    const savedPref = localStorage.getItem('customCursorEnabled');
    if (savedPref !== null) {
      setCustomCursorEnabled(savedPref === 'true');
    } else {
      // Default to enabled if device supports it
      const reducedMotion = prefersReducedMotion();
      const hasFineMouse = window.matchMedia('(pointer: fine) and (min-width: 769px)').matches;
      setCustomCursorEnabled(hasFineMouse && !reducedMotion);
    }

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Handle contact button click
  const handleContactClick = () => {
    if (isMobile) {
      // Open modal on mobile
      setIsContactFormOpen(true);
    } else {
      // Scroll to contact section on desktop
      const contactSection = document.getElementById('contact');
      if (contactSection) {
        contactSection.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  // Handle custom cursor toggle
  const toggleCustomCursor = () => {
    // Check system preferences at toggle time
    const reducedMotion = prefersReducedMotion();
    const hasFineMouse = window.matchMedia('(pointer: fine) and (min-width: 769px)').matches;

    // If trying to enable but system doesn't support it, show explanation
    if (!customCursorEnabled && (reducedMotion || !hasFineMouse)) {
      let message = 'Eigener Cursor nicht verfügbar: ';
      if (reducedMotion && !hasFineMouse) {
        message += 'Bewegungsreduzierung aktiv und Maus nicht erkannt';
      } else if (reducedMotion) {
        message += 'Bewegungsreduzierung in den Systemeinstellungen aktiv';
      } else {
        message += 'Präzise Maus erforderlich (Touchscreen nicht unterstützt)';
      }

      setCursorTooltip(message);
      setTimeout(() => setCursorTooltip(null), 4000);
      return;
    }

    const newState = !customCursorEnabled;
    setCustomCursorEnabled(newState);

    // Update localStorage
    localStorage.setItem('customCursorEnabled', String(newState));

    // Update HTML class
    if (newState) {
      document.documentElement.classList.add("has-custom-cursor");
    } else {
      document.documentElement.classList.remove("has-custom-cursor");
    }

    // Dispatch custom event for CustomCursor component
    window.dispatchEvent(new Event('customCursorToggle'));
  };

  // Close the contact form
  const closeContactForm = () => {
    setIsContactFormOpen(false);
    // Restore focus to the button that opened the modal
    if (contactButtonRef.current) {
      contactButtonRef.current.focus();
    }
  };

  // Handle form submission with modal close
  const handleSubmit = (e) => {
    handleFormSubmit(e, () => {
      // Close modal after successful submission
      if (isMobile) {
        closeContactForm();
      }
    });
  };

  // Handle input changes - convert to match hook's expected format
  const handleInputChange = (field, value) => {
    const syntheticEvent = {
      target: {
        name: field,
        value: value
      }
    };
    handleFormChange(syntheticEvent);
  };

  // Handle input blur - convert to match hook's expected format
  const handleInputBlur = (field, value) => {
    const syntheticEvent = {
      target: {
        name: field,
        value: value
      }
    };
    handleFormBlur(syntheticEvent);
  };

  // Focus management and body scroll prevention
  useEffect(() => {
    if (isContactFormOpen) {
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';

      // Focus first input
      if (firstInputRef.current) {
        firstInputRef.current.focus();
      }
    } else {
      // Restore body scroll when modal closes
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isContactFormOpen]);

  // Focus trap for modal with dynamic focusable element detection
  useEffect(() => {
    if (!isContactFormOpen) return;

    const modalElement = document.querySelector('[role="dialog"]');
    if (!modalElement) return;

    // Re-query focusable elements on every keydown to handle dynamic changes
    // (e.g., when submitSuccess or formErrors change and add/remove elements)
    const getFocusableElements = () => {
      const elements = modalElement.querySelectorAll(
        'button:not(:disabled), [href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])'
      );
      return Array.from(elements).filter(el => {
        // Filter out hidden elements
        return el.offsetParent !== null || el.getClientRects().length > 0;
      });
    };

    const handleTabKey = (e) => {
      if (e.key !== 'Tab') return;

      // Get current focusable elements dynamically
      const focusableElements = getFocusableElements();
      if (focusableElements.length === 0) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (e.shiftKey) {
        // Shift + Tab - moving backwards
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        // Tab - moving forwards
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    modalElement.addEventListener('keydown', handleTabKey);

    return () => {
      modalElement.removeEventListener('keydown', handleTabKey);
    };
  }, [isContactFormOpen, submitSuccess, formErrors]);

  // Handle ESC key to close modal
  const handleKeyDown = (e) => {
    if (e.key === "Escape") {
      closeContactForm();
    }
  };

  return (
    <header className="absolute w-full z-50 transition-all duration-300">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16 md:h-20">
        {/* Logo */}
        <motion.div
          className="flex items-center"
          initial={{ opacity: 0, x: -100 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{
            type: "spring",
            stiffness: 100,
            damping: 25,
            delay: 0.3,
            duration: 1.2,
          }}
        >
          <div className="h-10 w-10 rounded-xl bg-gradient-to-r from-gray-500 to-gray-100 flex items-center justify-center text-blue-600 font-bold text-xl mr-3">
            L
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-gray-300 to-gray-100 bg-clip-text text-transparent">
            Lasse Siemoneit
          </span>
        </motion.div>

        {/* Desktop Navigation */}
        <nav className="lg:flex hidden space-x-8">
          {navigationItems.map((item, index) => (
            <motion.a
              key={item.id}
              className="relative text-gray-800 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors duration-300 group"
              href={`#${item.id}`}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                type: "spring",
                stiffness: 100,
                damping: 25,
                delay: 0.7 + index * 0.2,
                duration: 1.2,
              }}
            >
              {item.label}
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 group-hover:w-full transition-all duration-300"></span>
            </motion.a>
          ))}
        </nav>

        {/* Social Icons - Desktop */}
        <div className="md:flex hidden items-center space-x-4">
          {hasSocialLink('github') && (
            <motion.a
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.1, duration: 0.5 }}
              className="text-gray-800 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-300"
              href={personalInfo.github}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub"
            >
              <FiGithub className="w-5 h-5" />
            </motion.a>
          )}
          {hasSocialLink('linkedin') && (
            <motion.a
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.1, duration: 0.5 }}
              className="text-gray-800 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-300"
              href={personalInfo.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
            >
              <FiLinkedin className="w-5 h-5" />
            </motion.a>
          )}
          <motion.button
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.1, duration: 0.5 }}
            onClick={toggleCustomCursor}
            className={`transition-colors duration-300 ${
              customCursorEnabled
                ? 'text-gray-800 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400'
                : (() => {
                    const reducedMotion = prefersReducedMotion();
                    const hasFineMouse = typeof window !== 'undefined' && window.matchMedia('(pointer: fine) and (min-width: 769px)').matches;
                    return (reducedMotion || !hasFineMouse)
                      ? 'text-gray-500 dark:text-gray-600 cursor-not-allowed'
                      : 'text-gray-800 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400';
                  })()
            }`}
            aria-label={customCursorEnabled ? "Eigenen Cursor deaktivieren" : "Eigenen Cursor aktivieren"}
            title={customCursorEnabled ? "Eigenen Cursor deaktivieren" : "Eigenen Cursor aktivieren"}
          >
            {customCursorEnabled ? (
              <RiCursorFill className="w-5 h-5" />
            ) : (
              <RiCursorLine className="w-5 h-5" />
            )}
          </motion.button>
        </div>

        {/* Contact Button */}
        <motion.button
          ref={contactButtonRef}
          onClick={handleContactClick}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            type: "spring",
            stiffness: 100,
            damping: 25,
            delay: 1.6,
            duration: 0.8,
          }}
          className="ml-4 px-4 py-2 rounded-xl bg-gradient-to-r from-gray-300 to-gray-100 text-blue-600 font-bold hover:from-blue-600 hover:to-blue-600 hover:text-white transition-all duration-500"
        >
          Kontaktiere mich
        </motion.button>

        {/* Mobile Menu Button  */}
        <div className="md:hidden flex items-center">
          <motion.button
            whileTap={{ scale: 0.7 }}
            className="text-gray-300"
            onClick={toggleMenu}
          >
            {" "}
            {isMenuOpen ? (
              <FiX className="w-6 h-6" />
            ) : (
              <FiMenu className="w-5 h-5" />
            )}{" "}
          </motion.button>
        </div>
      </div>

      {/* Mobile Menu */}
      <motion.div
        className="md:hidden overflow-hidden bg-white dark:bg-gray-900 shadow-lg px-4 py-5 space-y-5"
        initial={{ opacity: 0, height: 0 }}
        animate={{
          opacity: isMenuOpen ? 1 : 0,
          height: isMenuOpen ? "auto" : 0,
        }}
        transition={{ duration: 0.5 }}
      >
        <nav className="flex flex-col space-y-3">
          {navigationItems.map((item) => (
            <a
              onClick={toggleMenu}
              key={item.id}
              href={`#${item.id}`}
              className="text-gray-300 font-medium py-2"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="pt-4 border-t border-gray-200 dark:border-gray-800">
          <div className="flex space-x-5 items-center">
            {hasSocialLink('github') && (
              <a href={personalInfo.github} target="_blank" rel="noopener noreferrer" aria-label="GitHub">
                <FiGithub className="w-5 h-5 text-gray-300" />
              </a>
            )}
            {hasSocialLink('linkedin') && (
              <a href={personalInfo.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                <FiLinkedin className="w-5 h-5 text-gray-300" />
              </a>
            )}
            <button
              onClick={toggleCustomCursor}
              className={`transition-colors duration-300 ${
                customCursorEnabled
                  ? 'text-gray-300 hover:text-blue-400'
                  : (() => {
                      const reducedMotion = prefersReducedMotion();
                      const hasFineMouse = typeof window !== 'undefined' && window.matchMedia('(pointer: fine) and (min-width: 769px)').matches;
                      return (reducedMotion || !hasFineMouse)
                        ? 'text-gray-600 cursor-not-allowed'
                        : 'text-gray-300 hover:text-blue-400';
                    })()
              }`}
              aria-label={customCursorEnabled ? "Eigenen Cursor deaktivieren" : "Eigenen Cursor aktivieren"}
              title={customCursorEnabled ? "Eigenen Cursor deaktivieren" : "Eigenen Cursor aktivieren"}
            >
              {customCursorEnabled ? (
                <RiCursorFill className="w-5 h-5" />
              ) : (
                <RiCursorLine className="w-5 h-5" />
              )}
            </button>
          </div>
          <button
            onClick={() => {
              handleContactClick();
              toggleMenu();
            }}
            className="mt-4 block w-full px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-blue-400 font-bold"
          >
            Kontaktiere mich
          </button>
        </div>
      </motion.div>

      {/* Contact Form */}
      <AnimatePresence>
        {isContactFormOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={closeContactForm}
            onKeyDown={handleKeyDown}
            role="dialog"
            aria-modal="true"
            aria-labelledby="contact-form-title"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 30 }}
              transition={{
                type: "spring",
                duration: 0.8,
                damping: 30,
                stiffness: 200,
              }}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Hidden sentinel for focus trap - start boundary */}
              <div tabIndex={0} onFocus={(e) => {
                const focusableElements = e.currentTarget.parentElement.querySelectorAll(
                  'button:not(:disabled), [href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])'
                );
                const visibleElements = Array.from(focusableElements).filter(el =>
                  el !== e.currentTarget && (el.offsetParent !== null || el.getClientRects().length > 0)
                );
                if (visibleElements.length > 0) {
                  visibleElements[visibleElements.length - 1].focus();
                }
              }} style={{ position: 'absolute', width: '1px', height: '1px', margin: '-1px', overflow: 'hidden', clip: 'rect(0,0,0,0)', whiteSpace: 'nowrap', border: 0 }} />

              <div className="flex justify-between items-center mb-4">
                <h2 id="contact-form-title" className="text-2xl font-bold text-gray-300">
                  Kontaktiere mich
                </h2>
                <button
                  onClick={closeContactForm}
                  aria-label="Kontaktformular schließen"
                  className="p-1 hover:bg-gray-700 rounded"
                >
                  <FiX className="w-5 h-5 text-gray-300 font-extrabold" />
                </button>
              </div>

              {/* Success Message */}
              {submitSuccess && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  role="alert"
                  aria-live="polite"
                  className="mb-4 p-3 bg-green-500/20 border border-green-500/50 rounded-lg text-green-300 text-sm text-center"
                >
                  Vielen Dank! Ich werde mich bald bei dir melden.
                </motion.div>
              )}

              {/* Error Message */}
              {formErrors.submit && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  role="alert"
                  aria-live="assertive"
                  className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300 text-sm text-center"
                >
                  {formErrors.submit}
                </motion.div>
              )}

              {/* Input forms */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Honeypot field - invisible to users, catches bots */}
                <div className="hidden" aria-hidden="true">
                  <label htmlFor="website-header">Website</label>
                  <input
                    type="text"
                    id="website-header"
                    value={formData.website}
                    onChange={(e) => handleInputChange("website", e.target.value)}
                    tabIndex="-1"
                    autoComplete="off"
                  />
                </div>

                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-300 mb-1"
                  >
                    Name
                  </label>
                  <input
                    ref={firstInputRef}
                    type="text"
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    onBlur={(e) => handleInputBlur("name", e.target.value)}
                    placeholder="Dein Name"
                    className={`w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-700 text-gray-300 ${
                      formErrors.name ? "border-red-500" : "border-gray-600"
                    }`}
                    aria-invalid={formErrors.name ? "true" : "false"}
                    aria-describedby={formErrors.name ? "name-error" : undefined}
                  />
                  {formErrors.name && (
                    <p id="name-error" className="text-red-400 text-sm mt-1" role="alert" aria-live="polite">
                      {formErrors.name}
                    </p>
                  )}
                </div>
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-300 mb-1"
                  >
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    onBlur={(e) => handleInputBlur("email", e.target.value)}
                    placeholder="Deine Email"
                    className={`w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-700 text-gray-300 ${
                      formErrors.email ? "border-red-500" : "border-gray-600"
                    }`}
                    aria-invalid={formErrors.email ? "true" : "false"}
                    aria-describedby={formErrors.email ? "email-error" : undefined}
                  />
                  {formErrors.email && (
                    <p id="email-error" className="text-red-400 text-sm mt-1" role="alert" aria-live="polite">
                      {formErrors.email}
                    </p>
                  )}
                </div>
                <div>
                  <label
                    htmlFor="message"
                    className="block text-sm font-medium text-gray-300 mb-1"
                  >
                    Nachricht
                  </label>
                  <textarea
                    rows="4"
                    id="message"
                    value={formData.message}
                    onChange={(e) => handleInputChange("message", e.target.value)}
                    onBlur={(e) => handleInputBlur("message", e.target.value)}
                    placeholder="Deine Nachricht"
                    className={`w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-700 text-gray-300 ${
                      formErrors.message ? "border-red-500" : "border-gray-600"
                    }`}
                    aria-invalid={formErrors.message ? "true" : "false"}
                    aria-describedby={formErrors.message ? "message-error" : undefined}
                  />
                  {formErrors.message && (
                    <p id="message-error" className="text-red-400 text-sm mt-1" role="alert" aria-live="polite">
                      {formErrors.message}
                    </p>
                  )}
                </div>
                <motion.button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-400 hover:from-blue-700 hover:to-blue-400 transition-all duration-300 rounded-lg shadow-md hover:shadow-lg hover:shadow-blue-500 ${
                    isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                  whileHover={{ scale: isSubmitting ? 1 : 1.03 }}
                  whileTap={{ scale: isSubmitting ? 1 : 0.97 }}
                >
                  {isSubmitting ? 'Wird gesendet...' : 'Senden'}
                </motion.button>
              </form>

              {/* Hidden sentinel for focus trap - end boundary */}
              <div tabIndex={0} onFocus={(e) => {
                const focusableElements = e.currentTarget.parentElement.querySelectorAll(
                  'button:not(:disabled), [href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])'
                );
                const visibleElements = Array.from(focusableElements).filter(el =>
                  el !== e.currentTarget && (el.offsetParent !== null || el.getClientRects().length > 0)
                );
                if (visibleElements.length > 0) {
                  visibleElements[0].focus();
                }
              }} style={{ position: 'absolute', width: '1px', height: '1px', margin: '-1px', overflow: 'hidden', clip: 'rect(0,0,0,0)', whiteSpace: 'nowrap', border: 0 }} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Custom Cursor Tooltip/Toast */}
      <AnimatePresence>
        {cursorTooltip && (
          <motion.div
            initial={{ opacity: 0, y: -20, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -20, x: '-50%' }}
            transition={{ duration: 0.3 }}
            className="fixed top-24 left-1/2 transform -translate-x-1/2 z-[100] max-w-md px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg shadow-xl"
            role="alert"
            aria-live="polite"
          >
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-5 h-5 text-yellow-400">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                </svg>
              </div>
              <p className="text-sm text-gray-200">{cursorTooltip}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
export default Header;
