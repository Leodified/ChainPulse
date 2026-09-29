import api from './api';

export interface AuditEvent {
  id: number;
  tenant_id: string;
  event_type: string;
  entity_type: string;
  entity_id: string;
  user_id: string;
  description: string;
  metadata_json: string;
  created_at: string;
  ip_address: string;
}

export const auditService = {
  getEvents: async (limit = 50): Promise<AuditEvent[]> => {
    try {
      const response = await api.get<AuditEvent[]>('/audit/events', {
        params: { limit, tenant_id: 'tenant-acme-corp' },
      });
      return response.data;
    } catch {
      // Fallback structured audit events if offline
      return [
        {
          id: 6,
          tenant_id: 'tenant-acme-corp',
          event_type: 'STRATEGY_APPROVED',
          entity_type: 'recovery_strategy',
          entity_id: 'STRAT-B-AIR-FREIGHT',
          user_id: 'Sarah Chen (Operations Director)',
          description: "Recovery strategy 'Strategy B: Emergency Air Freight Bridge' approved by Sarah Chen (Operations Director)",
          metadata_json: '{"strategy_id": "STRAT-B-AIR-FREIGHT", "feasibility_score": 0.92, "execution_phase": "INITIATED"}',
          created_at: new Date(Date.now() - 3600000).toISOString(),
          ip_address: '10.14.***.*** (Internal Gateway)',
        },
        {
          id: 5,
          tenant_id: 'tenant-acme-corp',
          event_type: 'AGENT_SWARM_CONVERGED',
          entity_type: 'agent_orchestrator',
          entity_id: 'SWARM-SG-001',
          user_id: 'agent:orchestrator',
          description: 'Orchestrator synthesized 3 recovery strategies with multi-attribute trade-off envelope',
          metadata_json: '{"strategies_count": 3, "confidence": 0.94, "duration_s": 14.2}',
          created_at: new Date(Date.now() - 7200000).toISOString(),
          ip_address: '127.0.0.*** (Internal Gateway)',
        },
        {
          id: 4,
          tenant_id: 'tenant-acme-corp',
          event_type: 'SCENARIO_SIMULATION_COMPLETED',
          entity_type: 'simulation_engine',
          entity_id: 'SCEN-60D',
          user_id: 'system',
          description: 'Deterministic scenario models (7D, 30D, 60D) finalized: max unmitigated exposure $28.3M across 22 orders',
          metadata_json: '{"max_exposure_usd": 28300000, "orders_at_risk": 22}',
          created_at: new Date(Date.now() - 10800000).toISOString(),
          ip_address: '127.0.0.*** (Internal Gateway)',
        },
        {
          id: 3,
          tenant_id: 'tenant-acme-corp',
          event_type: 'NETWORK_IMPACT_TRACED',
          entity_type: 'supply_chain_graph',
          entity_id: 'DISR-SG-2026-001',
          user_id: 'agent:impact_tracer',
          description: 'Multi-tier impact graph mapped: 4 suppliers, 7 materials, 68 factories exposed',
          metadata_json: '{"suppliers_affected": 4, "materials_affected": 7, "critical_path": "Singapore -> Penang -> Frankfurt"}',
          created_at: new Date(Date.now() - 14400000).toISOString(),
          ip_address: '127.0.0.*** (Internal Gateway)',
        },
        {
          id: 2,
          tenant_id: 'tenant-acme-corp',
          event_type: 'DISRUPTION_INGESTED',
          entity_type: 'disruption_event',
          entity_id: 'DISR-SG-2026-001',
          user_id: 'agent:event_listener',
          description: 'Singapore MPA Terminal Congestion detected from AIS Vessel Tracking & Port Authority advisories',
          metadata_json: '{"source": "MPA Singapore / AIS Vessel Tracking", "confidence": 0.94}',
          created_at: new Date(Date.now() - 18000000).toISOString(),
          ip_address: '127.0.0.*** (Internal Gateway)',
        },
        {
          id: 1,
          tenant_id: 'tenant-acme-corp',
          event_type: 'DATA_SEEDED',
          entity_type: 'system',
          entity_id: 'demo',
          user_id: 'system',
          description: 'Supply chain digital twin context synchronized with SAP ERP S/4HANA baseline',
          metadata_json: '{"scenario": "SG_PORT_DISRUPTION_2026", "version": "1.0.0"}',
          created_at: new Date(Date.now() - 21600000).toISOString(),
          ip_address: '127.0.0.*** (Internal Gateway)',
        },
      ];
    }
  },
};
