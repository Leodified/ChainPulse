export type AgentStatus = 'IDLE' | 'RUNNING' | 'COMPLETED' | 'FAILED';
export type AgentType =
  | 'ORCHESTRATOR'
  | 'EVENT'
  | 'RESEARCH'
  | 'IMPACT'
  | 'FINANCE_ESG'
  | 'RECOVERY';

export interface AgentActivity {
  id: string;
  agentType: AgentType;
  agentName: string;
  status: AgentStatus;
  taskDescription: string;
  reasoning: string;
  evidenceUsed: string[];
  output: string;
  confidencePct: number;
  durationSeconds: number;
  startedAt: string;
  completedAt?: string;
}

export interface RecoveryStrategy {
  id: string;
  name: string;
  type: 'ALTERNATE_SUPPLIER' | 'AIR_FREIGHT' | 'INVENTORY_REALLOCATION' | 'DEMAND_DEFER';
  description: string;
  recoveryDays: number;
  additionalCostUSD: number;
  co2ImpactPct: number;
  operationalRisk: 'LOW' | 'MEDIUM' | 'HIGH';
  feasibilityPct: number;
  assumptions: string[];
  tradeoffs: string[];
  recommended: boolean;
  targetCustomerTier?: string;
  status?: string;
  approvedBy?: string;
  approvedAt?: string;
}

export interface FinancialSummary {
  revenueExposureUSD: number;
  workingCapitalImpactUSD: number;
  recoveryCostRangeMin: number;
  recoveryCostRangeMax: number;
  exposureByCustomerTier: Array<{
    tier: string;
    exposureUSD: number;
    ordersCount: number;
  }>;
  dailyExposure: Array<{
    date: string;
    exposureUSD: number;
    cumulativeUSD: number;
  }>;
}

export interface SustainabilityData {
  currentRouteCO2Tons: number;
  strategies: Array<{
    strategyId: string;
    strategyName: string;
    co2Tons: number;
    co2ChangePct: number;
    mode: string;
  }>;
}

export interface TransactionAnomaly {
  id: string;
  type: string;
  description: string;
  supplierId: string;
  supplierName: string;
  detectedAt: string;
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  correlatedDisruptionId?: string;
  valueUSD?: number;
  status: 'OPEN' | 'INVESTIGATING' | 'RESOLVED';
}
