import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import type {
  DemoStep,
  RerouteState,
  LiveAuditEvent,
  SAPLearningHubProfile,
  DemoContextValue,
} from '../types/demo';
import { format } from 'date-fns';

const INITIAL_LEARNING_HUB_PROFILE: SAPLearningHubProfile = {
  studentName: 'Sarah Chen',
  studentId: 'S-002948102',
  institution: 'SAP University Alliances · Student Edition Cohort 2026',
  certification: 'SAP Certified Associate - Sourcing and Procurement (C_TS452_2022)',
  certificationId: 'CERT-SAP-UA-883921',
  score: '98% (Distinction)',
  verified: true,
  learningJourneyTitle: 'Resilience & Disruption Handling in SAP Digital Supply Chain',
  learningJourneyUrl: 'https://learning.sap.com/learning-journeys/discovering-sap-s-4hana-sourcing-and-procurement',
  adapterStatus: 'ADAPTER_DEFINED_CREDENTIAL_READY',
  ssoMechanism: 'SAP Identity Authentication Service (IAS) SAML 2.0 / OIDC',
  odataEndpoint: '/sap/opu/odata/sap/API_PURCHASEORDER_PROCESS_SRV',
};

const INITIAL_AUDIT_EVENTS: LiveAuditEvent[] = [
  {
    id: 'AUD-2026-0920-001',
    eventType: 'DISRUPTION_DETECTED',
    actor: 'agent:event_intelligence',
    targetEntity: 'DISR-SG-2026-001',
    description: 'Singapore Port MPA Tanjong Pagar berth congestion validated from 3 maritime AIS sources. Berth queue: 847 vessels.',
    timestamp: '2026-09-20 04:15:22',
    ipAddress: '10.240.12.8',
    verified: true,
  },
  {
    id: 'AUD-2026-0920-002',
    eventType: 'IMPACT_ANALYSIS_COMPLETED',
    actor: 'agent:impact_tracing',
    targetEntity: 'GRAPH-CAS-001',
    description: '4-tier causal impact traced: Singapore Hub ──► Penang Electronics ──► PCB Assemblies ──► Frankfurt Factory. 22 orders exposed ($28.3M max).',
    timestamp: '2026-09-20 04:15:28',
    ipAddress: '10.240.12.9',
    verified: true,
  },
];

const DemoContext = createContext<DemoContextValue | undefined>(undefined);

export function DemoProvider({ children }: { children: React.ReactNode }) {
  const [currentStep, setCurrentStep] = useState<DemoStep>('STEP_01_DISRUPTION_DETECTED');
  const [rerouteState, setRerouteState] = useState<RerouteState>('BLOCKED');
  const [selectedStrategyId, setSelectedStrategyId] = useState<string>('STRAT-B');
  const [isRunningDemo, setIsRunningDemo] = useState<boolean>(false);
  const [auditEvents, setAuditEvents] = useState<LiveAuditEvent[]>(INITIAL_AUDIT_EVENTS);
  const [learningHubProfile] = useState<SAPLearningHubProfile>(INITIAL_LEARNING_HUB_PROFILE);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const stepMapping: Record<DemoStep, number> = {
    STEP_01_DISRUPTION_DETECTED: 1,
    STEP_02_SWARM_ANALYZING: 2,
    STEP_03_IMPACT_PROPAGATED: 3,
    STEP_04_ALTERNATIVES_GENERATED: 4,
    STEP_05_REROUTE_PROPOSED: 5,
    STEP_06_AUDIT_LOGGED: 6,
    STEP_07_AWAITING_APPROVAL: 7,
    STEP_08_APPROVAL_GRANTED: 8,
    STEP_09_ROUTE_ACTIVATED: 9,
    STEP_10_AUDIT_SEALED: 10,
  };

  const stepIndex = stepMapping[currentStep] || 1;

  // Add audit event helper
  const addAuditEvent = (
    eventType: string,
    actor: string,
    targetEntity: string,
    description: string
  ) => {
    const newEvent: LiveAuditEvent = {
      id: `AUD-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      eventType,
      actor,
      targetEntity,
      description,
      timestamp: format(new Date(), 'yyyy-MM-dd HH:mm:ss'),
      ipAddress: '10.240.12.4',
      verified: true,
    };
    setAuditEvents((prev) => [newEvent, ...prev]);
  };

  const clearTimers = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  // Run the full automated showcase until the hard gate (Step 7)
  const runFullDemo = () => {
    clearTimers();
    setIsRunningDemo(true);
    setCurrentStep('STEP_01_DISRUPTION_DETECTED');
    setRerouteState('BLOCKED');

    // Step 2: Multi-Agent Swarm (1.2s)
    timerRef.current = setTimeout(() => {
      setCurrentStep('STEP_02_SWARM_ANALYZING');

      // Step 3: Impact Propagation (2.4s)
      timerRef.current = setTimeout(() => {
        setCurrentStep('STEP_03_IMPACT_PROPAGATED');

        // Step 4: Alternatives Generated (3.6s)
        timerRef.current = setTimeout(() => {
          setCurrentStep('STEP_04_ALTERNATIVES_GENERATED');
          addAuditEvent(
            'ALTERNATE_ROUTE_GENERATED',
            'agent:recovery_strategy',
            'ROUT-ALT-SG-01',
            'Computed 3 candidate recovery routes. Strategy B (Emergency Air Freight Bridge) scored 92% feasibility.'
          );

          // Step 5: Reroute Proposed (4.8s) - Reroute becomes AMBER / PROPOSED
          timerRef.current = setTimeout(() => {
            setCurrentStep('STEP_05_REROUTE_PROPOSED');
            setRerouteState('PROPOSED');

            // Step 6: Audit Logged (6.0s)
            timerRef.current = setTimeout(() => {
              setCurrentStep('STEP_06_AUDIT_LOGGED');
              addAuditEvent(
                'REROUTING_PROPOSED',
                'agent:orchestrator',
                'ROUT-AIR-SG-FRA',
                'Proposed candidate route ROUT-AIR-SG-FRA (8-day recovery, $3.8M outlay). Dispatched to Decision Room.'
              );

              // Step 7: Awaiting Human Approval (7.2s) - HARD GATE!
              timerRef.current = setTimeout(() => {
                setCurrentStep('STEP_07_AWAITING_APPROVAL');
                addAuditEvent(
                  'HUMAN_APPROVAL_REQUESTED',
                  'governance:firewall',
                  'PLAN-CP-2026-0920-001',
                  'Hard Gate Triggered: Awaiting cryptographic sign-off from verified Operations Director (Sarah Chen).'
                );
                setIsRunningDemo(false);
              }, 1200);
            }, 1200);
          }, 1200);
        }, 1200);
      }, 1200);
    }, 1200);
  };

  // Human Approval Execution (Steps 8 -> 9 -> 10)
  const approveReroute = () => {
    clearTimers();
    setIsRunningDemo(true);
    setCurrentStep('STEP_08_APPROVAL_GRANTED');
    setRerouteState('APPROVED');

    addAuditEvent(
      'HUMAN_APPROVAL_GRANTED',
      `user:${learningHubProfile.studentName} (${learningHubProfile.studentId})`,
      'PLAN-CP-2026-0920-001',
      `Authorization granted by Sarah Chen. Operator credentials verified via SAP Learning Hub, student edition (${learningHubProfile.certificationId}).`
    );

    // Step 9: Route Activated (Green / Active)
    timerRef.current = setTimeout(() => {
      setCurrentStep('STEP_09_ROUTE_ACTIVATED');
      setRerouteState('ACTIVE');

      addAuditEvent(
        'ROUTE_ACTIVATED',
        'sap:s4hana_bapi',
        'ROUT-AIR-SG-FRA',
        'Emergency Air Freight Bridge activated. Blocked maritime corridor bypassed. Moving packets routing via Air Freight.'
      );

      // Step 10: Audit Sealed
      timerRef.current = setTimeout(() => {
        setCurrentStep('STEP_10_AUDIT_SEALED');
        addAuditEvent(
          'AUDIT_TRAIL_SEALED',
          'governance:ledger',
          'PLAN-CP-2026-0920-001',
          'Autonomous recovery sequence executed and cryptographically sealed. SAP purchase requisition release complete.'
        );
        setIsRunningDemo(false);
      }, 1400);
    }, 1400);
  };

  const resetDemo = () => {
    clearTimers();
    setIsRunningDemo(false);
    setCurrentStep('STEP_01_DISRUPTION_DETECTED');
    setRerouteState('BLOCKED');
    setAuditEvents(INITIAL_AUDIT_EVENTS);
  };

  const jumpToStep = (step: DemoStep) => {
    clearTimers();
    setIsRunningDemo(false);
    setCurrentStep(step);
    if (step === 'STEP_05_REROUTE_PROPOSED' || step === 'STEP_06_AUDIT_LOGGED' || step === 'STEP_07_AWAITING_APPROVAL') {
      setRerouteState('PROPOSED');
    } else if (step === 'STEP_08_APPROVAL_GRANTED') {
      setRerouteState('APPROVED');
    } else if (step === 'STEP_09_ROUTE_ACTIVATED' || step === 'STEP_10_AUDIT_SEALED') {
      setRerouteState('ACTIVE');
    } else {
      setRerouteState('BLOCKED');
    }
  };

  useEffect(() => {
    return () => clearTimers();
  }, []);

  return (
    <DemoContext.Provider
      value={{
        currentStep,
        stepIndex,
        rerouteState,
        selectedStrategyId,
        isRunningDemo,
        auditEvents,
        learningHubProfile,
        runFullDemo,
        approveReroute,
        resetDemo,
        jumpToStep,
        setSelectedStrategyId,
      }}
    >
      {children}
    </DemoContext.Provider>
  );
}

export function useDemo() {
  const context = useContext(DemoContext);
  if (!context) {
    throw new Error('useDemo must be used within a DemoProvider');
  }
  return context;
}
