import OpenAI from 'openai';
import { config } from '../config.js';
import { query } from '../db/client.js';

const VALID_CATEGORIES = ['elogio', 'sugerencia', 'reclamo', 'duda', 'bug', 'otro'] as const;
const VALID_SENTIMENTS = ['positivo', 'neutro', 'negativo'] as const;

const SYSTEM_PROMPT = `Sos un asistente que clasifica mensajes de usuarios de una app fintech latinoamericana (El Dorado).

Dado el mensaje del usuario, respondé SOLO con un JSON válido (sin markdown, sin backticks) con estos campos:

{
  "category": "elogio" | "sugerencia" | "reclamo" | "duda" | "bug" | "otro",
  "importance": 1-5,
  "sentiment": "positivo" | "neutro" | "negativo",
  "summary": "resumen en 1 frase corta en español"
}

Guía de importancia:
1 = casual, saludo, agradecimiento simple
2 = feedback general, opinión
3 = sugerencia concreta, duda operativa
4 = problema que afecta uso del producto, reclamo con urgencia
5 = crítico: bloqueo de cuenta, pérdida de dinero, error grave

Guía de categorías:
- elogio: el usuario felicita, agradece o habla bien del producto
- sugerencia: propone una mejora o feature nueva
- reclamo: se queja de algo que no funciona o que le molesta
- duda: pregunta sobre cómo funciona algo
- bug: reporta un error técnico específico
- otro: no encaja en ninguna categoría`;

export interface AnalysisResult {
  category: string;
  importance: number;
  sentiment: string;
  summary: string;
}

export async function analyzeMessage(messageId: string, userText: string): Promise<AnalysisResult | null> {
  if (!config.openaiApiKey) {
    console.warn('OPENAI_API_KEY not configured — skipping message analysis');
    return null;
  }

  try {
    const client = new OpenAI({ apiKey: config.openaiApiKey });

    const response = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userText },
      ],
      temperature: 0.3,
      max_tokens: 200,
    });

    const content = response.choices[0]?.message?.content?.trim();
    if (!content) return null;

    let parsed: { category?: string; importance?: number; sentiment?: string; summary?: string };
    try {
      parsed = JSON.parse(content);
    } catch {
      console.warn('Analysis returned invalid JSON:', content);
      return null;
    }

    // Sanitize
    const category = VALID_CATEGORIES.includes(parsed.category as typeof VALID_CATEGORIES[number])
      ? parsed.category!
      : 'otro';
    const importance = Math.max(1, Math.min(5, Math.round(Number(parsed.importance) || 3)));
    const sentiment = VALID_SENTIMENTS.includes(parsed.sentiment as typeof VALID_SENTIMENTS[number])
      ? parsed.sentiment!
      : 'neutro';
    const summary = typeof parsed.summary === 'string' ? parsed.summary.slice(0, 500) : '';

    const analysis = { category, importance, sentiment, summary };

    // Merge into message metadata
    await query(
      `UPDATE messages
       SET metadata = COALESCE(metadata, '{}'::jsonb) || jsonb_build_object('analysis', $2::jsonb)
       WHERE id = $1`,
      [messageId, JSON.stringify(analysis)],
    );

    // Denormalize to conversations for fast admin queries
    await query(
      `UPDATE conversations
       SET ai_category = $2, ai_importance = $3, ai_sentiment = $4, ai_summary = $5
       FROM messages m
       WHERE m.id = $1 AND conversations.id = m.conversation_id`,
      [messageId, category, importance, sentiment, summary],
    );

    console.log(`Message ${messageId} analyzed: ${category} (${importance}) ${sentiment}`);
    return analysis;
  } catch (err) {
    console.error('Message analysis failed:', err);
    return null;
  }
}
