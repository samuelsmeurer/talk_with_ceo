import type { UserMetricsRow, EngagementResult, EngagementFlow } from '../types/redash.js';

export function classifyEngagement(metrics: UserMetricsRow): EngagementResult {
  const firstName = metrics.firstName || null;
  const name = firstName ?? 'crack';

  const base = {
    firstName,
    metrics: {
      vol_total: metrics.vol_total,
      tx_total: metrics.tx_total,
      rank_vol_total: metrics.rank_vol_total,
      rank_tx_total: metrics.rank_tx_total,
    },
  };

  let flow: EngagementFlow;
  let message: string;

  if (metrics.rank_vol_total <= 10 || metrics.rank_tx_total <= 10) {
    flow = 'vip';
    message = `${name}, sos de nuestros usuarios top. Quiero escucharte personalmente — contame lo que quieras.`;
  } else if (metrics.tx_total === 0) {
    flow = 'inactive';
    message = `¡Hola${firstName ? ` ${firstName}` : ''}! Vi que todavía no hiciste tu primera transacción. ¿En qué te puedo ayudar para arrancar?`;
  } else if (metrics.tx_total > 0 && metrics.tx_total <= 3) {
    flow = 'warmup';
    message = `¡Buena, ${name}! Ya arrancaste a usar El Dorado. ¿Cómo viene la experiencia? Contame.`;
  } else {
    flow = 'regular';
    message = `¡Hola${firstName ? ` ${firstName}` : ''}! Soy Guille, el CEO de El Dorado. Escribime lo que quieras — leo todo personalmente.`;
  }

  return { flow, message, ...base };
}
