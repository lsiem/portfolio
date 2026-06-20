import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const rateLimitMap = new Map<string, number>();

interface ContactPayload {
  name?: string;
  email?: string;
  message?: string;
  website?: string;
}

const MAX_LENGTHS = { name: 100, email: 200, message: 5000 } as const;

export default async function handler(request: VercelRequest, response: VercelResponse) {
  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method not allowed' });
  }

  const ip = request.headers['x-forwarded-for']?.toString().split(',')[0] ?? 'unknown';
  const lastRequest = rateLimitMap.get(ip) ?? 0;
  if (Date.now() - lastRequest < 30_000) {
    return response.status(429).json({ error: 'Too many requests' });
  }

  const body = (request.body ?? {}) as ContactPayload;
  const name = body.name?.trim();
  const email = body.email?.trim();
  const message = body.message?.trim();
  const website = body.website?.trim() ?? '';

  // Honeypot: real users never fill the hidden `website` field. This is the
  // primary server-side bot defence — the load-time threshold stays purely
  // client-side because a client-supplied timestamp is trivially spoofable and
  // would otherwise reject legitimate users on clock skew.
  if (website) {
    return response.status(400).json({ error: 'Invalid submission' });
  }

  if (!name || !email || !message || !/\S+@\S+\.\S+/.test(email)) {
    return response.status(400).json({ error: 'Invalid form data' });
  }

  if (
    name.length > MAX_LENGTHS.name ||
    email.length > MAX_LENGTHS.email ||
    message.length > MAX_LENGTHS.message
  ) {
    return response.status(400).json({ error: 'Invalid form data' });
  }

  if (!process.env.RESEND_API_KEY) {
    return response.status(500).json({ error: 'Email service not configured' });
  }

  // Record the attempt before sending so repeated requests are throttled
  // regardless of whether the send ultimately succeeds.
  rateLimitMap.set(ip, Date.now());

  try {
    await resend.emails.send({
      from: 'Portfolio <onboarding@resend.dev>',
      to: ['info@lsiem.de'],
      replyTo: email,
      subject: `Portfolio Kontakt — ${name}`,
      text: `Name: ${name}\nEmail: ${email}\n\n${message}`,
    });

    return response.status(200).json({ success: true });
  } catch {
    return response.status(500).json({ error: 'Failed to send email' });
  }
}
