export interface RedashQueryResult<TRow> {
  query_result: {
    id: number;
    query: string;
    data: {
      columns: Array<{ name: string; type: string }>;
      rows: TRow[];
    };
    runtime: number;
  };
}

export interface UserMetricsRow {
  email: string;
  firstName: string;
  vol_total: number;
  vol_30d: number;
  tx_total: number;
  tx_30d: number;
  rank_vol_total: string;
  rank_vol_30d: string;
  rank_tx_total: string;
  rank_tx_30d: string;
}

/** Ordered from most exclusive to least — used to classify VIP status */
export const VIP_RANKS = ['Top 1%', 'Top 2%', 'Top 3%', 'Top 5%', 'Top 10%'] as const;

export type EngagementFlow = 'inactive' | 'warmup' | 'vip' | 'regular';

/** All rank values ordered from most exclusive to least */
export const RANK_ORDER = [
  'Top 1%', 'Top 2%', 'Top 3%', 'Top 5%', 'Top 10%',
  'Top 15%', 'Top 20%', 'Top 25%', 'Top 30%', 'Iniciante',
] as const;

export interface EngagementResult {
  flow: EngagementFlow;
  message: string;
  firstName: string | null;
  metrics: {
    vol_total: number;
    vol_30d: number;
    tx_total: number;
    tx_30d: number;
    rank_vol_total: string;
    rank_vol_30d: string;
    rank_tx_total: string;
    rank_tx_30d: string;
  };
}
