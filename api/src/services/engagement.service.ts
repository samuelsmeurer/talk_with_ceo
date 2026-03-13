import type { UserMetricsRow, EngagementResult, EngagementFlow } from '../types/redash.js';
import { VIP_RANKS, RANK_ORDER } from '../types/redash.js';

function isVipRank(rank: string): boolean {
  return VIP_RANKS.includes(rank as typeof VIP_RANKS[number]);
}

/** Returns the more exclusive of two ranks (lower index in RANK_ORDER = more exclusive) */
function getBestRank(rankA: string, rankB: string): string {
  const idxA = RANK_ORDER.indexOf(rankA as typeof RANK_ORDER[number]);
  const idxB = RANK_ORDER.indexOf(rankB as typeof RANK_ORDER[number]);
  const safeA = idxA === -1 ? RANK_ORDER.length : idxA;
  const safeB = idxB === -1 ? RANK_ORDER.length : idxB;
  return safeA <= safeB ? rankA : rankB;
}

/** Format name: first word, title case */
function formatName(name: string): string {
  const first = name.trim().split(/\s+/)[0] || '';
  if (!first) return '';
  return first.charAt(0).toUpperCase() + first.slice(1).toLowerCase();
}

export function classifyEngagement(metrics: UserMetricsRow): EngagementResult {
  const rawFirstName = metrics.firstName || null;
  const firstName = rawFirstName ? formatName(rawFirstName) : null;

  const base = {
    firstName,
    metrics: {
      vol_total: metrics.vol_total,
      vol_30d: metrics.vol_30d,
      tx_total: metrics.tx_total,
      tx_30d: metrics.tx_30d,
      rank_vol_total: metrics.rank_vol_total,
      rank_vol_30d: metrics.rank_vol_30d,
      rank_tx_total: metrics.rank_tx_total,
      rank_tx_30d: metrics.rank_tx_30d,
    },
  };

  let flow: EngagementFlow;
  let message: string;

  const volVip = isVipRank(metrics.rank_vol_total);
  const txVip = isVipRank(metrics.rank_tx_total);

  if (volVip || txVip) {
    flow = 'vip';
    const bestRank = volVip && txVip
      ? getBestRank(metrics.rank_vol_total, metrics.rank_tx_total)
      : volVip ? metrics.rank_vol_total : metrics.rank_tx_total;
    const context = volVip && txVip
      ? 'volumen y transacciones'
      : volVip ? 'volumen de transacciones' : 'cantidad de transacciones';
    message = `Estoy muy contento de hablar con vos, más aún porque estás entre el ${bestRank} de usuarios de El Dorado en ${context}. Por eso me importa mucho tu punto de vista.`;
  } else if (metrics.tx_total === 0) {
    flow = 'inactive';
    message = 'Estoy muy contento de hablar con vos. Vi que todavía no hiciste tu primera transacción — me encantaría ayudarte a arrancar.';
  } else if (metrics.tx_total > 0 && metrics.tx_total <= 3) {
    flow = 'warmup';
    message = `Estoy muy contento de hablar con vos, más aún porque ya hiciste ${metrics.tx_total} transaccion${metrics.tx_total === 1 ? '' : 'es'} en El Dorado. Me importa mucho tu punto de vista.`;
  } else {
    flow = 'regular';
    message = 'Estoy muy contento de hablar con vos. Me importa mucho tu punto de vista.';
  }

  return { flow, message, ...base };
}
