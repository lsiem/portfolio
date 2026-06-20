import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const rateLimitMap = new Map<string, number>();

interface ContactPayload {
  name?: string;
  email?: string;
  message?: string;
  website?: string;
  submittedAt?: number;
}

export default async function handler(request: VercelRequest, response: VercelResponse) {
  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method not allowed' });
  }

  const ip = request.headers['x-forwarded-for']?.toString().split(',')[0] ?? 'unknown';
  const lastRequest = rateLimitMap.get(ip) ?? 0;
  if (Date.now() - lastRequest < 30_000) {
    return response.status(429).json({ error: 'Too many requests' });
  }

  const body = request.body as ContactPayload;
  const name = body.name?.trim();
  const email = body.email?.trim();
  const message = body.message?.trim();
  const website = body.website?.trim() ?? '';
  const submittedAt = body.submittedAt ?? 0;

  if (website) {
    return response.status(400).json({ error: 'Invalid submission' });
  }

  if (Date.now() - submittedAt < 800) {
    return response.status(400).json({ error: 'Submitted too quickly' });
  }

  if (!name || !email || !message || !/\S+@\S+\.\S+/.test(email)) {
    return response.status(400).json({ error: 'Invalid form data' });
  }

  if (!process.env.RESEND_API_KEY) {
    return response.status(500).json({ error: 'Email service not configured' });
  }

  try {
    await resend.emails.send({
      from: 'Portfolio <onboarding@resend.dev>',
      to: ['info@lsiem.de'],
      replyTo: email,
      subject: `Portfolio Kontakt — ${name}`,
      text: `Name: ${name}\nEmail: ${email}\n\n${message}`,
    });

    rateLimitMap.set(ip, Date.now());
    return response.status(200).json({ success: true });
  } catch {
    return response.status(500).json({ error: 'Failed to send email' });
  }
}
