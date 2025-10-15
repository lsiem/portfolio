import { useState, useEffect, useRef } from 'react';

/**
 * Custom hook for contact form state management and validation
 * Shared between ContactSection and Header components
 * Includes anti-bot measures: honeypot field and time threshold
 */
export const useContactForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
    website: '' // Honeypot field - should remain empty
  });

  // Track when form was loaded for time threshold check
  const formLoadTimeRef = useRef(null);

  // Set form load time on mount
  useEffect(() => {
    formLoadTimeRef.current = Date.now();
  }, []);

  const [formErrors, setFormErrors] = useState({
    name: '',
    email: '',
    message: '',
    submit: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Validate a single field
  const validateField = (name, value) => {
    let error = '';

    switch (name) {
      case 'name':
        if (!value.trim()) {
          error = 'Name ist erforderlich';
        }
        break;
      case 'email':
        if (!value.trim()) {
          error = 'Email ist erforderlich';
        } else if (!/\S+@\S+\.\S+/.test(value)) {
          error = 'Ungültige Email-Adresse';
        }
        break;
      case 'message':
        if (!value.trim()) {
          error = 'Nachricht ist erforderlich';
        }
        break;
      default:
        break;
    }

    return error;
  };

  // Form validation
  const validateForm = () => {
    const errors = {};

    // Anti-bot check: Honeypot field (website) should be empty
    if (formData.website && formData.website.trim() !== '') {
      errors.submit = 'Ein Fehler ist aufgetreten. Bitte versuche es später erneut.';
      return errors;
    }

    // Anti-bot check: Time threshold - reject submissions faster than 800ms
    const timeSinceLoad = Date.now() - (formLoadTimeRef.current || 0);
    if (timeSinceLoad < 800) {
      errors.submit = 'Bitte nimm dir einen Moment Zeit, um das Formular auszufüllen.';
      return errors;
    }

    if (!formData.name.trim()) {
      errors.name = 'Name ist erforderlich';
    }

    if (!formData.email.trim()) {
      errors.email = 'Email ist erforderlich';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Ungültige Email-Adresse';
    }

    if (!formData.message.trim()) {
      errors.message = 'Nachricht ist erforderlich';
    }

    return errors;
  };

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear field error and submit error when user starts typing
    setFormErrors(prev => ({
      ...prev,
      [name]: '',
      submit: ''
    }));

    // Clear success message when user starts editing again
    if (submitSuccess) {
      setSubmitSuccess(false);
    }
  };

  // Handle input blur - validate single field
  const handleBlur = (e) => {
    const { name, value } = e.target;
    const error = validateField(name, value);

    // Only set error if field has been touched and has content or was previously validated
    if (error) {
      setFormErrors(prev => ({
        ...prev,
        [name]: error
      }));
    }
  };

  // Handle form submission
  const handleSubmit = async (e, onSuccess) => {
    e.preventDefault();

    const errors = validateForm();

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return false;
    }

    setIsSubmitting(true);

    try {
      // TODO: Integrate with email service (EmailJS, Formspree, or custom backend)

      // Only log in development environment
      if (import.meta.env.DEV) {
        console.log('Form submitted:', formData);
      }

      // Simulate API call (replace with actual submission)
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Show success message
      setSubmitSuccess(true);

      // Reset form
      setFormData({
        name: '',
        email: '',
        message: '',
        website: '' // Reset honeypot field
      });

      // Reset form load time for next submission
      formLoadTimeRef.current = Date.now();

      // Call optional success callback
      if (onSuccess) {
        onSuccess();
      }

      // Hide success message after 5 seconds
      setTimeout(() => {
        setSubmitSuccess(false);
      }, 5000);

      return true;
    } catch (error) {
      // Only log detailed errors in development
      if (import.meta.env.DEV) {
        console.error('Form submission error:', error);
      }

      setFormErrors({
        submit: 'Ein Fehler ist aufgetreten. Bitte versuche es später erneut.'
      });
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset form manually
  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      message: '',
      website: '' // Reset honeypot field
    });
    setFormErrors({
      name: '',
      email: '',
      message: '',
      submit: ''
    });
    setSubmitSuccess(false);
    // Reset form load time
    formLoadTimeRef.current = Date.now();
  };

  return {
    formData,
    formErrors,
    isSubmitting,
    submitSuccess,
    handleChange,
    handleBlur,
    handleSubmit,
    validateForm,
    resetForm
  };
};
