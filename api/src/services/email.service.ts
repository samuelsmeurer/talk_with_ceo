import nodemailer from 'nodemailer';
import { config } from '../config.js';

const smtpOptions = {
  host: config.smtpHost || 'smtp.gmail.com',
  port: config.smtpPort,
  secure: config.smtpPort === 465,
  family: 4 as const,
  auth: {
    user: config.smtpUser,
    pass: config.smtpPass,
  },
};

const transporter = nodemailer.createTransport(smtpOptions);

export async function sendSupportTicket(
  username: string,
  userEmail: string | null,
  messageText: string,
): Promise<void> {
  try {
    await transporter.sendMail({
      from: `Habla con Guille <${config.smtpUser}>`,
      to: 'soporte@eldorado.io',
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
  try {
    await transporter.sendMail({
      from: `Guillermo - CEO de El Dorado <${config.smtpUser}>`,
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
