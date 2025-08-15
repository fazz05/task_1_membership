// src/adapters/emailAdapter.ts
import fetch from 'cross-fetch';

// Gunakan tipe dari deklarasi kustom kita
type EmailOptions = {
  to: string;
  subject: string;
  html: string;
};

const BREVO_API_KEY = process.env.BREVO_API_KEY || '';
const BREVO_SENDER_NAME = process.env.BREVO_SENDER_NAME || '';
const BREVO_SENDER_EMAIL = process.env.BREVO_SENDER_EMAIL || '';

export default {
  send: async (options: EmailOptions) => {
    const { to, subject, html } = options;
    
    if (!BREVO_API_KEY) {
      throw new Error('Brevo API key tidak ditemukan');
    }

    try {
      const response = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'api-key': BREVO_API_KEY,
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          sender: {
            name: BREVO_SENDER_NAME,
            email: BREVO_SENDER_EMAIL
          },
          to: [{ email: to }],
          subject: subject,
          htmlContent: html
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Brevo error: ${errorData.message || response.statusText}`);
      }

      console.log('[Email] Berhasil dikirim ke:', to);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('[Email] Gagal mengirim:', errorMessage);
      throw error;
    }
  }
};