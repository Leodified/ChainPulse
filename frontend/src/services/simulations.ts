import api from './api';
import { MOCK_SCENARIOS } from '../data/mockData';
import type { Scenario } from '../types/simulations';

export async function fetchScenarios(disruptionId: string = 'DISR-SG-2026-001'): Promise<Scenario[]> {
  try {
    const res = await api.get<any[]>(`/simulations/${disruptionId}`);
    if (Array.isArray(res.data) && res.data.length > 0) {
      // Map backend ScenarioOut to frontend Scenario interface
      return res.data.map((sc) => {
        const horizon = sc.time_horizon_days;
        const duration = `${horizon}D` as '7D' | '30D' | '60D';
        const mockFallback = MOCK_SCENARIOS.find((m) => m.duration === duration) || MOCK_SCENARIOS[0];

        const snapshots = Array.isArray(sc.snapshots) && sc.snapshots.length > 0
          ? sc.snapshots.map((snap: any) => ({
              day: Number(snap.day || 1),
              date: `2026-10-${String(snap.day || 1).padStart(2, '0')}`,
              inventoryPct: Number(snap.inventory_level_percent ?? snap.inventoryPct ?? 0),
              productionCapacityPct: Number(snap.production_capacity_percent ?? snap.productionCapacityPct ?? 0),
              ordersAtRisk: Number(snap.orders_at_risk_count ?? snap.ordersAtRisk ?? 0),
              financialExposureUSD: Number(snap.financial_exposure_usd ?? snap.financialExposureUSD ?? 0),
              cumulativeLossUSD: Number(snap.financial_exposure_usd ?? snap.financialExposureUSD ?? 0) * 0.8,
            }))
          : mockFallback.snapshots;

        const lastSnap = snapshots[snapshots.length - 1];
        return {
          id: sc.id,
          duration,
          label: `${horizon}-Day Scenario`,
          description: sc.assumptions || mockFallback.description,
          assumptions: sc.assumptions ? sc.assumptions.split('. ').filter(Boolean) : mockFallback.assumptions,
          riskLevel: (lastSnap?.financialExposureUSD > 20000000 ? 'CRITICAL' : 'HIGH') as any,
          snapshots,
          summary: {
            peakInventoryRisk: Math.round(lastSnap?.inventoryPct ?? (horizon === 7 ? 45 : horizon === 30 ? 18 : 2)),
            minProductionCapacity: Math.round(lastSnap?.productionCapacityPct ?? (horizon === 7 ? 70 : horizon === 30 ? 45 : 15)),
            totalOrdersAtRisk: lastSnap?.ordersAtRisk ?? (horizon === 7 ? 8 : horizon === 30 ? 22 : 25),
            totalFinancialExposureUSD: lastSnap?.financialExposureUSD ?? (horizon === 7 ? 4200000 : horizon === 30 ? 18700000 : 28300000),
            estimatedRecoveryCostUSD: horizon === 7 ? 400000 : horizon === 30 ? 1200000 : 3800000,
          },
        };
      });
    }
    return MOCK_SCENARIOS;
  } catch {
    return MOCK_SCENARIOS;
  }
}
