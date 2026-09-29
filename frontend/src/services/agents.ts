import api from './api';
import { MOCK_AGENT_ACTIVITIES } from '../data/mockData';
import type { AgentActivity } from '../types/agents';

const ROLE_TO_TYPE: Record<string, any> = {
    'Event Classification & Anomaly Detection': 'EVENT',
    'External Intelligence Gathering': 'RESEARCH',
    'Supply Chain Impact Tracing': 'IMPACT',
    'Financial & ESG Impact Quantification': 'FINANCE_ESG',
    'Recovery Strategy Generation & Ranking': 'RECOVERY',
    'Workflow Coordination & Executive Synthesis': 'ORCHESTRATOR',
};

export async function fetchAgentActivities(disruptionId: string = 'DISR-SG-2026-001'): Promise<AgentActivity[]> {
  try {
    const res = await api.get<any>(`/agents/${disruptionId}/activity`);
    if (res.data && Array.isArray(res.data.activities) && res.data.activities.length > 0) {
      return res.data.activities.map((a: any) => ({
        id: `AGT-${a.id}`,
        agentType: ROLE_TO_TYPE[a.agent_role] || 'EVENT',
        agentName: a.agent_name,
        status: a.status,
        taskDescription: a.task_description,
        reasoning: a.reasoning_summary,
        evidenceUsed: a.evidence_used ? a.evidence_used.split('; ') : [],
        output: a.output_summary,
        confidencePct: Math.round((a.confidence_score || 0.9) * 100),
        durationSeconds: a.duration_seconds || 3.0,
        startedAt: a.started_at,
        completedAt: a.completed_at,
      }));
    }
    return MOCK_AGENT_ACTIVITIES;
  } catch {
    return MOCK_AGENT_ACTIVITIES;
  }
}
