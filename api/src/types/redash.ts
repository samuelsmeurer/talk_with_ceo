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
  tx_total: number;
  rank_vol_total: number;
  rank_tx_total: number;
}

export type EngagementFlow = 'inactive' | 'warmup' | 'vip' | 'regular';

export interface EngagementResult {
  flow: EngagementFlow;
  message: string;
  firstName: string | null;
  metrics: {
    vol_total: number;
    tx_total: number;
    rank_vol_total: number;
    rank_tx_total: number;
  };
}
