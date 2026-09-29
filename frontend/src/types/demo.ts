import type { RecoveryStrategy } from './agents';

export type DemoStep =
  | 'STEP_01_DISRUPTION_DETECTED'
  | 'STEP_02_SWARM_ANALYZING'
  | 'STEP_03_IMPACT_PROPAGATED'
  | 'STEP_04_ALTERNATIVES_GENERATED'
  | 'STEP_05_REROUTE_PROPOSED'
  | 'STEP_06_AUDIT_LOGGED'
  | 'STEP_07_AWAITING_APPROVAL'
  | 'STEP_08_APPROVAL_GRANTED'
  | 'STEP_09_ROUTE_ACTIVATED'
  | 'STEP_10_AUDIT_SEALED';

export type RerouteState = 'BLOCKED' | 'PROPOSED' | 'APPROVED' | 'ACTIVE';

export interface LiveAuditEvent {
  id: string;
  eventType: string;
  actor: string;
  targetEntity: string;
  description: string;
  timestamp: string;
  ipAddress: string;
  verified: boolean;
}

export interface SAPLearningHubProfile {
  studentName: string;
  studentId: string;
  institution: string;
  certification: string;
  certificationId: string;
  score: string;
  verified: boolean;
  learningJourneyTitle: string;
  learningJourneyUrl: string;
  adapterStatus: 'ADAPTER_DEFINED_CREDENTIAL_READY' | 'LIVE_CONNECTED' | 'DISCONNECTED';
  ssoMechanism: string;
  odataEndpoint: string;
}

export interface DemoContextValue {
  currentStep: DemoStep;
  stepIndex: number;
  rerouteState: RerouteState;
  selectedStrategyId: string;
  isRunningDemo: boolean;
  auditEvents: LiveAuditEvent[];
  learningHubProfile: SAPLearningHubProfile;
  runFullDemo: () => void;
  approveReroute: () => void;
  resetDemo: () => void;
  jumpToStep: (step: DemoStep) => void;
  setSelectedStrategyId: (id: string) => void;
}
