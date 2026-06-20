import { useEffect, useRef, useState } from 'react';

export interface ContactFormData {
  name: string;
  email: string;
  message: string;
  website: string;
}

export interface ContactFormErrors {
  name: string;
  email: string;
  message: string;
  submit: string;
}

const initialFormData: ContactFormData = {
  name: '',
  email: '',
  message: '',
  website: '',
};

const initialErrors: ContactFormErrors = {
  name: '',
  email: '',
  message: '',
  submit: '',
};

export function validateContactForm(
  formData: ContactFormData,
  formLoadTime: number,
): ContactFormErrors {
  const errors: ContactFormErrors = { ...initialErrors };

  if (formData.website.trim() !== '') {
    errors.submit = 'Ein Fehler ist aufgetreten. Bitte versuche es später erneut.';
    return errors;
  }

  if (Date.now() - formLoadTime < 800) {
    errors.submit = 'Bitte nimm dir einen Moment Zeit, um das Formular auszufüllen.';
    return errors;
  }

  if (!formData.name.trim()) errors.name = 'Name ist erforderlich';
  if (!formData.email.trim()) {
    errors.email = 'E-Mail ist erforderlich';
  } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
    errors.email = 'Ungültige E-Mail-Adresse';
  }
  if (!formData.message.trim()) errors.message = 'Nachricht ist erforderlich';

  return errors;
}

export function hasContactFormErrors(errors: ContactFormErrors): boolean {
  return Object.values(errors).some(Boolean);
}

export function useContactForm() {
  const [formData, setFormData] = useState<ContactFormData>(initialFormData);
  const [formErrors, setFormErrors] = useState<ContactFormErrors>(initialErrors);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const formLoadTimeRef = useRef(Date.now());

  useEffect(() => {
    formLoadTimeRef.current = Date.now();
  }, []);

  const validateField = (name: keyof ContactFormData, value: string): string => {
    if (name === 'website') return '';
    const errors = validateContactForm({ ...formData, [name]: value }, formLoadTimeRef.current);
    return errors[name];
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setFormErrors((prev) => ({ ...prev, [name]: '', submit: '' }));
    if (submitSuccess) setSubmitSuccess(false);
  };

  const handleBlur = (event: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    if (name === 'website') return;
    const error = validateField(name as keyof ContactFormData, value);
    if (error) {
      setFormErrors((prev) => ({ ...prev, [name]: error }));
    }
  };

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
    onSuccess?: () => void,
  ): Promise<boolean> => {
    event.preventDefault();
    const errors = validateContactForm(formData, formLoadTimeRef.current);
    if (hasContactFormErrors(errors)) {
      setFormErrors(errors);
      return false;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim(),
          message: formData.message.trim(),
          website: formData.website,
          submittedAt: formLoadTimeRef.current,
        }),
      });

      if (!response.ok) {
        throw new Error('Submission failed');
      }

      setSubmitSuccess(true);
      setFormData(initialFormData);
      formLoadTimeRef.current = Date.now();
      onSuccess?.();
      window.setTimeout(() => setSubmitSuccess(false), 5000);
      return true;
    } catch {
      setFormErrors((prev) => ({
        ...prev,
        submit: 'Ein Fehler ist aufgetreten. Bitte versuche es später erneut.',
      }));
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData(initialFormData);
    setFormErrors(initialErrors);
    setSubmitSuccess(false);
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
    resetForm,
  };
}
