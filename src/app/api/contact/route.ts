import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

type ContactPayload = {
  name?: unknown;
  phone?: unknown;
  message?: unknown;
  project?: unknown;
};

type FieldErrors = {
  name?: string;
  phone?: string;
  project?: string;
};

const PHONE_REGEX = /^\+?1?\s*[(]?[0-9]{3}[)]?[-\s]?[0-9]{3}[-\s]?[0-9]{4}$/;

function sanitize(input: string): string {
  return input
    .replace(/<[^>]*>/g, '')
    .replace(/[<>"';]/g, '')
    .trim();
}

function escapeHtml(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function validate(payload: ContactPayload): {
  errors: FieldErrors;
  clean: { name: string; phone: string; message: string };
} {
  const errors: FieldErrors = {};

  const rawName = typeof payload.name === 'string' ? payload.name : '';
  const rawPhone = typeof payload.phone === 'string' ? payload.phone : '';
  const rawMessage =
    typeof payload.project === 'string'
      ? payload.project
      : typeof payload.message === 'string'
        ? payload.message
        : '';

  const name = sanitize(rawName);
  const phone = sanitize(rawPhone);
  const message = sanitize(rawMessage);

  if (!name) {
    errors.name = 'Please tell me your name.';
  } else if (name.length < 2) {
    errors.name = 'Name must be at least 2 characters.';
  } else if (name.length > 100) {
    errors.name = 'Name is too long.';
  }

  if (!phone) {
    errors.phone = 'A phone number helps me reach you fast.';
  } else if (!PHONE_REGEX.test(phone)) {
    errors.phone = 'Use a 10-digit US format like 713-555-0123.';
  }

  if (!message) {
    errors.project = 'Tell me a little about what you need.';
  } else if (message.length < 10) {
    errors.project = 'A few more details, please — at least 10 characters.';
  } else if (message.length > 500) {
    errors.project = 'Keep it under 500 characters — we can dig in over a call.';
  }

  return { errors, clean: { name, phone, message } };
}

const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;
const RATE_LIMIT_MAX = 5;
const ipHits: Map<string, number[]> = new Map();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const hits = (ipHits.get(ip) ?? []).filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
  if (hits.length >= RATE_LIMIT_MAX) {
    ipHits.set(ip, hits);
    return true;
  }
  hits.push(now);
  ipHits.set(ip, hits);
  return false;
}

function getClientIp(req: NextRequest): string {
  const fwd = req.headers.get('x-forwarded-for');
  if (fwd) return fwd.split(',')[0].trim();
  const real = req.headers.get('x-real-ip');
  if (real) return real.trim();
  return 'unknown';
}

async function sendEmail(clean: { name: string; phone: string; message: string }): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.NOAH_EMAIL;

  if (!apiKey || !to) {
    console.warn('[contact] RESEND_API_KEY or NOAH_EMAIL not set — skipping email send.');
    return false;
  }

  const timestamp = new Date().toLocaleString('en-US', { timeZone: 'America/Chicago' });

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #0A0A0A; color: #FFFFFF;">
      <h1 style="color: #00D4FF; font-size: 22px; margin: 0 0 16px;">New project inquiry</h1>
      <p style="color: #888; font-size: 12px; margin: 0 0 24px;">${escapeHtml(timestamp)} CT</p>
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 12px 0; border-bottom: 1px solid #222; color: #888; width: 100px;">Name</td>
          <td style="padding: 12px 0; border-bottom: 1px solid #222; color: #FFF; font-weight: 600;">${escapeHtml(clean.name)}</td>
        </tr>
        <tr>
          <td style="padding: 12px 0; border-bottom: 1px solid #222; color: #888;">Phone</td>
          <td style="padding: 12px 0; border-bottom: 1px solid #222;">
            <a href="tel:${escapeHtml(clean.phone)}" style="color: #00D4FF; font-size: 18px; font-weight: 700; text-decoration: none;">${escapeHtml(clean.phone)}</a>
          </td>
        </tr>
        <tr>
          <td style="padding: 12px 0; color: #888; vertical-align: top;">Message</td>
          <td style="padding: 12px 0; color: #FFF; white-space: pre-wrap;">${escapeHtml(clean.message)}</td>
        </tr>
      </table>
    </div>
  `.trim();

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'NRG Portfolio <noreply@nrgbuilds.com>',
      to: [to],
      subject: `New project inquiry from ${clean.name}`,
      html,
      reply_to: to,
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    console.error('[contact] Resend failed:', res.status, text);
    return false;
  }
  return true;
}

async function sendSms(clean: { name: string; phone: string; message: string }): Promise<void> {
  const sid = process.env.TWILIO_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_FROM_NUMBER;
  const to = process.env.NOAH_PHONE;

  if (!sid || !token || !from || !to) return;

  const preview = clean.message.length > 100 ? clean.message.slice(0, 100) + '…' : clean.message;
  const body = `New inquiry from ${clean.name}. Phone: ${clean.phone}. Message: ${preview}. Check email.`;

  const params = new URLSearchParams({ From: from, To: to, Body: body });
  const auth = Buffer.from(`${sid}:${token}`).toString('base64');

  try {
    const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      console.error('[contact] Twilio failed:', res.status, text);
    }
  } catch (err) {
    console.error('[contact] Twilio error:', err);
  }
}

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);

  if (isRateLimited(ip)) {
    return NextResponse.json(
      { success: false, message: 'Too many submissions. Please email noah@nrgbuilds.com directly.' },
      { status: 429 }
    );
  }

  let payload: ContactPayload;
  try {
    payload = (await req.json()) as ContactPayload;
  } catch {
    return NextResponse.json(
      { success: false, message: 'Invalid request body.' },
      { status: 400 }
    );
  }

  const { errors, clean } = validate(payload);
  if (Object.keys(errors).length > 0) {
    return NextResponse.json({ success: false, errors }, { status: 400 });
  }

  try {
    const emailed = await sendEmail(clean);
    await sendSms(clean);

    if (!emailed && process.env.NODE_ENV === 'production') {
      return NextResponse.json(
        { success: false, message: 'Something went wrong. Email directly: noah@nrgbuilds.com' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Got it — I'll reach back out within one business day, usually same day.",
    });
  } catch (err) {
    console.error('[contact] Unexpected error:', err);
    return NextResponse.json(
      { success: false, message: 'Something went wrong. Email directly: noah@nrgbuilds.com' },
      { status: 500 }
    );
  }
}
