export type DisruptionSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
export type DisruptionStatus = 'ACTIVE' | 'MONITORING' | 'RESOLVED' | 'MITIGATED';
export type DisruptionCategory =
  | 'PORT_DISRUPTION'
  | 'WEATHER'
  | 'GEOPOLITICAL'
  | 'SUPPLIER_FAILURE'
  | 'LOGISTICS'
  | 'NATURAL_DISASTER';

export interface GeoLocation {
  lat: number;
  lng: number;
  city?: string;
  country?: string;
  region?: string;
}

export interface DisruptionEvent {
  id: string;
  title: string;
  description: string;
  category: DisruptionCategory;
  severity: DisruptionSeverity;
  status: DisruptionStatus;
  location: GeoLocation;
  detectedAt: string;
  updatedAt: string;
  affectedRoutes?: string[];
  exposureUSD?: number;
  affectedSuppliers?: string[];
  sources?: string[];
  tags?: string[];
}

export interface ImpactTraceNode {
  id: string;
  name: string;
  type: 'DISRUPTION' | 'SUPPLIER' | 'FREIGHT_HUB' | 'FACTORY' | 'PRODUCT' | 'CUSTOMER';
  tier?: number;
  impactLevel: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'NONE';
  details?: Record<string, unknown>;
}

export interface ImpactTraceEdge {
  from: string;
  to: string;
  label?: string;
  type?: string;
}

export interface ImpactTraceResult {
  disruptionId: string;
  traceTimestamp: string;
  affectedNodeCount: number;
  criticalPath: string[];
  nodes: ImpactTraceNode[];
  edges: ImpactTraceEdge[];
  summary: {
    suppliersAffected: number;
    factoriesAffected: number;
    ordersAtRisk: number;
    financialExposureUSD: number;
    criticalMaterials: string[];
    estimatedRecoveryDays: number;
  };
}
