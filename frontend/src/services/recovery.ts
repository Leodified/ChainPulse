import api from './api';
import { MOCK_STRATEGIES } from '../data/mockData';
import type { RecoveryStrategy } from '../types/agents';

export interface ApprovalResult {
  planId: string;
  approvedAt: string;
  approvedBy: string;
  auditEventId?: number;
}

export async function fetchStrategies(disruptionId: string = 'DISR-SG-2026-001'): Promise<RecoveryStrategy[]> {
  try {
    const res = await api.get<any[]>(`/recovery/${disruptionId}/strategies`);
    if (Array.isArray(res.data) && res.data.length > 0) {
      // Map backend schema to frontend RecoveryStrategy interface
      return res.data.map((s) => ({
        id: s.id,
        name: s.name,
        type: s.strategy_type,
        description: s.description,
        recoveryDays: s.estimated_recovery_days,
        additionalCostUSD: s.estimated_cost_usd,
        co2ImpactPct: Math.round(s.co2_impact_kg > 100000 ? 340 : s.co2_impact_kg > 30000 ? 45 : 5),
        operationalRisk: (s.operational_risk_level || 'MEDIUM') as 'LOW' | 'MEDIUM' | 'HIGH',
        feasibilityPct: Math.round(s.feasibility_score * 100),
        assumptions: s.assumptions ? s.assumptions.split('. ').filter(Boolean) : [],
        tradeoffs: s.trade_offs ? s.trade_offs.split('. ').filter(Boolean) : [],
        recommended: s.status === 'RECOMMENDED',
        status: s.status,
        approvedBy: s.approved_by,
        approvedAt: s.approved_at,
      }));
    }
    return MOCK_STRATEGIES;
  } catch {
    return MOCK_STRATEGIES;
  }
}

export async function approveStrategy(
  strategyId: string,
  approvedBy: string = 'Sarah Chen (Operations Director)',
  notes?: string
): Promise<ApprovalResult> {
  try {
    const res = await api.post(`/recovery/${strategyId}/approve`, {
      approved_by: approvedBy,
      notes: notes || 'Approved via ChainPulse recovery console',
    });
    return {
      planId: `CP-${strategyId.replace('STRAT-', '')}-001`,
      approvedAt: res.data.approved_at || new Date().toISOString(),
      approvedBy: res.data.approved_by || approvedBy,
      auditEventId: res.data.audit_event_id,
    };
  } catch (err: any) {
    console.warn('[RecoveryService] Approval API failed, falling back to local result:', err.message);
    return {
      planId: `CP-${strategyId.replace('STRAT-', '')}-001`,
      approvedAt: new Date().toISOString(),
      approvedBy,
    };
  }
}
