import { describe, expect, it } from 'vitest';
import {
  hasContactFormErrors,
  validateContactForm,
  type ContactFormData,
} from '@/hooks/useContactForm';

const validForm: ContactFormData = {
  name: 'Lasse',
  email: 'test@example.com',
  message: 'Hallo',
  website: '',
};

describe('validateContactForm', () => {
  it('accepts valid submissions', () => {
    const errors = validateContactForm(validForm, Date.now() - 1000);
    expect(hasContactFormErrors(errors)).toBe(false);
  });

  it('rejects honeypot submissions', () => {
    const errors = validateContactForm({ ...validForm, website: 'spam' }, Date.now() - 1000);
    expect(errors.submit).toBeTruthy();
  });

  it('rejects fast submissions', () => {
    const errors = validateContactForm(validForm, Date.now());
    expect(errors.submit).toContain('Moment');
  });
});
