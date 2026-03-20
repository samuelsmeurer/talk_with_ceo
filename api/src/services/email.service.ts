import { config } from '../config.js';

const RESEND_API_URL = 'https://api.resend.com/emails';

async function sendEmail(params: {
  from: string;
  to: string;
  subject: string;
  text: string;
}): Promise<void> {
  const res = await fetch(RESEND_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${config.resendApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Resend API error ${res.status}: ${body}`);
  }
}

export async function sendSupportTicket(
  username: string,
  userEmail: string | null,
  messageText: string,
): Promise<void> {
  if (!config.resendApiKey) {
    console.warn('RESEND_API_KEY not configured — skipping support ticket email');
    return;
  }
  try {
    await sendEmail({
      from: config.emailFrom,
      to: 's.schramm@eldorado.io',
      subject: `[Habla con Guille] Ticket de soporte - ${username}`,
      text: [
        `Nuevo ticket desde el miniapp "Habla con Guille"`,
        '',
        `Usuario: ${username}`,
        `Email: ${userEmail ?? 'No disponible'}`,
        '',
        'Mensaje del usuario:',
        messageText,
      ].join('\n'),
    });
    console.log(`Support ticket email sent for user: ${username}`);
  } catch (err) {
    console.error('Failed to send support ticket email:', err);
  }
}

export async function sendUserConfirmation(
  userEmail: string,
  firstName: string,
): Promise<void> {
  if (!config.resendApiKey) {
    console.warn('RESEND_API_KEY not configured — skipping user confirmation email');
    return;
  }
  try {
    await sendEmail({
      from: config.emailFrom,
      to: userEmail,
      subject: 'Guillermo de El Dorado - Ya estamos en contacto',
      text: [
        `¡Hola ${firstName}!`,
        '',
        'Soy Guillermo, CEO de El Dorado. Recibí tu mensaje y ya le pedí al equipo de soporte que se comunique con vos en los próximos minutos.',
        '',
        'Gracias por tomarte el tiempo de escribirme.',
        '',
        'Un abrazo,',
        'Guillermo',
      ].join('\n'),
    });
    console.log(`User confirmation email sent to: ${userEmail}`);
  } catch (err) {
    console.error('Failed to send user confirmation email:', err);
  }
}
