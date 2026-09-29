export type ScenarioDuration = '7D' | '30D' | '60D';
export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface DailySnapshot {
  day: number;
  date: string;
  inventoryPct: number;
  productionCapacityPct: number;
  ordersAtRisk: number;
  financialExposureUSD: number;
  cumulativeLossUSD: number;
}

export interface Scenario {
  id: string;
  duration: ScenarioDuration;
  label: string;
  description: string;
  assumptions: string[];
  riskLevel: RiskLevel;
  snapshots: DailySnapshot[];
  summary: {
    peakInventoryRisk: number;
    minProductionCapacity: number;
    totalOrdersAtRisk: number;
    totalFinancialExposureUSD: number;
    estimatedRecoveryCostUSD: number;
  };
}
