import { useState } from 'react';

/**
 * Custom hook for contact form state management and validation
 * Shared between ContactSection and Header components
 */
export const useContactForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });

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
        message: ''
      });

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
      message: ''
    });
    setFormErrors({
      name: '',
      email: '',
      message: '',
      submit: ''
    });
    setSubmitSuccess(false);
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
