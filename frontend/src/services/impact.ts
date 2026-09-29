import api from './api';
import { MOCK_IMPACT_TRACE } from '../data/mockData';
import type { ImpactTraceResult } from '../types/disruptions';

export async function traceImpact(disruptionId: string = 'DISR-SG-2026-001'): Promise<ImpactTraceResult> {
  try {
    const res = await api.get<any>(`/disruptions/${disruptionId}/trace-impact`);
    if (res.data && res.data.nodes) {
      return {
        disruptionId,
        traceTimestamp: new Date().toISOString(),
        affectedNodeCount: res.data.affected_node_count || res.data.nodes.length,
        criticalPath: res.data.critical_paths?.[0] || MOCK_IMPACT_TRACE.criticalPath,
        nodes: res.data.nodes.map((n: any) => ({
          id: n.id,
          name: n.name,
          type: (n.node_type || 'SUPPLIER').toUpperCase(),
          tier: n.metadata?.tier,
          impactLevel: n.impact_level || 'HIGH',
        })),
        edges: res.data.edges.map((e: any) => ({
          from: e.source,
          to: e.target,
          label: e.label,
        })),
        summary: res.data.summary || MOCK_IMPACT_TRACE.summary,
      };
    }
    return { ...MOCK_IMPACT_TRACE, disruptionId };
  } catch {
    return { ...MOCK_IMPACT_TRACE, disruptionId };
  }
}

export async function fetchImpact(disruptionId: string = 'DISR-SG-2026-001'): Promise<any> {
  try {
    const res = await api.get(`/impact/${disruptionId}`);
    return res.data;
  } catch {
    return { ...MOCK_IMPACT_TRACE, disruptionId };
  }
}
