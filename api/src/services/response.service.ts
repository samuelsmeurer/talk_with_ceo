const CEO_CONFIRMATION_MESSAGE =
  '¡Listo! Ya lo recibí. Lo voy a leer personalmente. Gracias por tomarte el tiempo.';

const CEO_COMPLAINT_MESSAGE =
  'Solo para confirmar, ¿tuviste algún problema en la app? ¿Querés que me comunique con alguien de soporte para que te envíe un mensaje en los próximos minutos? Siempre busco la mejor calidad para nuestros clientes.';

const COMPLAINT_KEYWORDS = [
  'problema',
  'error',
  'fallo',
  'no funciona',
  'no anda',
  'bug',
  'queja',
  'reclamo',
];

function detectComplaint(text: string): boolean {
  const lower = text.toLowerCase();
  return COMPLAINT_KEYWORDS.some((kw) => lower.includes(kw));
}

export interface CeoResponseResult {
  text: string;
  complaintDetected: boolean;
}

/**
 * Generates the CEO response for a given conversation.
 *
 * MVP: returns a fixed confirmation or complaint message based on keyword detection.
 * Future: swap to OpenAI with Guille's context prompt.
 */
export async function generateResponse(
  _conversationId: string,
  userText: string,
  options?: { aiCategory?: string },
): Promise<CeoResponseResult> {
  const complaintDetected =
    options?.aiCategory !== undefined
      ? options.aiCategory === 'reclamo' || options.aiCategory === 'bug'
      : detectComplaint(userText);
  return {
    text: complaintDetected ? CEO_COMPLAINT_MESSAGE : CEO_CONFIRMATION_MESSAGE,
    complaintDetected,
  };
}
