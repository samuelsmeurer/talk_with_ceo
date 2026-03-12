const CEO_CONFIRMATION_MESSAGE =
  '¡Listo! Ya lo recibí. Lo voy a leer personalmente. Gracias por tomarte el tiempo.';

/**
 * Generates the CEO response for a given conversation.
 *
 * MVP: returns a fixed confirmation message.
 * Future: swap to OpenAI with Guille's context prompt.
 *
 * ```ts
 * // FUTURE: OpenAI integration
 * import OpenAI from 'openai';
 * const openai = new OpenAI();
 *
 * export async function generateResponse(conversationId: string): Promise<string> {
 *   const history = await getMessages(conversationId);
 *   const response = await openai.chat.completions.create({
 *     model: 'gpt-4',
 *     messages: [
 *       { role: 'system', content: GUILLE_CONTEXT_PROMPT },
 *       ...history.map(m => ({
 *         role: m.sender === 'user' ? 'user' as const : 'assistant' as const,
 *         content: m.text,
 *       })),
 *     ],
 *   });
 *   return response.choices[0].message.content ?? CEO_CONFIRMATION_MESSAGE;
 * }
 * ```
 */
export async function generateResponse(_conversationId: string): Promise<string> {
  return CEO_CONFIRMATION_MESSAGE;
}
