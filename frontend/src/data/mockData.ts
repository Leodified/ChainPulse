import {
  Supplier,
  Factory,
  Product,
  Customer,
  SupplyChainGraph,
  CustomerOrder,
  MaterialShortage,
} from '../types/supply-chain';
import { Scenario } from '../types/simulations';
import {
  AgentActivity,
  RecoveryStrategy,
  FinancialSummary,
  SustainabilityData,
  TransactionAnomaly,
} from '../types/agents';
import { DisruptionEvent } from '../types/disruptions';
import type { ImpactTraceResult } from '../types/disruptions';

// ─────────────────────────────────────────────────────────────
// DISRUPTIONS
// ─────────────────────────────────────────────────────────────
export const MOCK_DISRUPTIONS: DisruptionEvent[] = [
  {
    id: 'DISR-SG-2026-001',
    title: 'Singapore Port MPA Terminal Congestion',
    description:
      'Severe congestion at Singapore Port due to crane malfunction and labour dispute. PSA Tanjong Pagar terminal operating at 35% capacity. 847 vessels queued. ETA delays of 7-14 days reported by major shipping lines.',
    category: 'PORT_DISRUPTION',
    severity: 'HIGH',
    status: 'ACTIVE',
    location: { lat: 1.2897, lng: 103.8501, city: 'Singapore', country: 'Singapore', region: 'Southeast Asia' },
    detectedAt: '2026-09-20T04:15:00Z',
    updatedAt: '2026-09-26T14:30:00Z',
    affectedRoutes: ['Singapore-Hamburg', 'Singapore-Rotterdam', 'Singapore-LA'],
    exposureUSD: 28300000,
    affectedSuppliers: ['MY-ELECTRONICS-01', 'SG-FREIGHT-HUB-01'],
    sources: ['MPA Advisory', 'Lloyds List', 'Port Authority Singapore'],
    tags: ['port', 'congestion', 'asia-pacific', 'semiconductor'],
  },
  {
    id: 'TWN-2026-0918-002',
    title: 'Taiwan Strait Shipping Lane Tension',
    description:
      'Heightened geopolitical tension causing shipping lanes through Taiwan Strait to be rerouted. 12% increase in transit times for Asia-Pacific routes.',
    category: 'GEOPOLITICAL',
    severity: 'MEDIUM',
    status: 'MONITORING',
    location: { lat: 23.6978, lng: 120.9605, city: 'Taipei', country: 'Taiwan', region: 'East Asia' },
    detectedAt: '2026-09-18T08:00:00Z',
    updatedAt: '2026-09-25T10:00:00Z',
    affectedRoutes: ['Taiwan-US', 'Taiwan-Europe'],
    exposureUSD: 8500000,
    affectedSuppliers: [],
    sources: ['Reuters', 'Bloomberg'],
    tags: ['geopolitical', 'shipping', 'taiwan'],
  },
  {
    id: 'BGD-2026-0915-003',
    title: 'Bangladesh Garment Supplier Strike',
    description:
      'Labour strike at 3 major garment factories near Dhaka. Estimated 2-week production halt affecting textile supply.',
    category: 'SUPPLIER_FAILURE',
    severity: 'LOW',
    status: 'MONITORING',
    location: { lat: 23.8103, lng: 90.4125, city: 'Dhaka', country: 'Bangladesh', region: 'South Asia' },
    detectedAt: '2026-09-15T11:00:00Z',
    updatedAt: '2026-09-24T09:00:00Z',
    exposureUSD: 1200000,
    affectedSuppliers: [],
    sources: ['Local press', 'Industry sources'],
    tags: ['strike', 'garment', 'labour'],
  },
  {
    id: 'RTM-2026-0910-004',
    title: 'Rotterdam Port Fog Delays',
    description:
      'Dense fog conditions causing vessel delays at Port of Rotterdam. Average delay of 18-24 hours. Normal operations expected to resume within 48 hours.',
    category: 'WEATHER',
    severity: 'LOW',
    status: 'RESOLVED',
    location: { lat: 51.9225, lng: 4.4792, city: 'Rotterdam', country: 'Netherlands', region: 'Europe' },
    detectedAt: '2026-09-10T06:00:00Z',
    updatedAt: '2026-09-12T18:00:00Z',
    exposureUSD: 450000,
    affectedSuppliers: [],
    sources: ['Port of Rotterdam Authority'],
    tags: ['weather', 'fog', 'europe'],
  },
  {
    id: 'JPN-2026-0905-005',
    title: 'Japan Earthquake Supply Disruption',
    description:
      'Magnitude 6.2 earthquake near Osaka affecting automotive component suppliers. Road transport disrupted. Air freight capacity strained.',
    category: 'NATURAL_DISASTER',
    severity: 'MEDIUM',
    status: 'MONITORING',
    location: { lat: 34.6937, lng: 135.5023, city: 'Osaka', country: 'Japan', region: 'East Asia' },
    detectedAt: '2026-09-05T02:30:00Z',
    updatedAt: '2026-09-20T16:00:00Z',
    exposureUSD: 5600000,
    affectedSuppliers: [],
    sources: ['JMA', 'Reuters'],
    tags: ['earthquake', 'japan', 'automotive'],
  },
];

// ─────────────────────────────────────────────────────────────
// SUPPLIERS
// ─────────────────────────────────────────────────────────────
export const MOCK_SUPPLIERS: Supplier[] = [
  {
    id: 'MY-ELECTRONICS-01',
    name: 'Penang Electronics Sdn Bhd',
    tier: 1,
    country: 'Malaysia',
    city: 'Penang',
    coordinates: { lat: 5.4141, lng: 100.3288 },
    status: 'DISRUPTED',
    materials: ['PCB Assemblies', 'Semiconductor Modules', 'RF Components'],
    leadTimeDays: 21,
    reliabilityScore: 87,
    alternateSuppliers: ['MY-ELECTRONICS-02', 'TH-ELECTRONICS-01'],
  },
  {
    id: 'SG-FREIGHT-HUB-01',
    name: 'Singapore Freight Hub',
    tier: 1,
    country: 'Singapore',
    city: 'Singapore',
    coordinates: { lat: 1.3521, lng: 103.8198 },
    status: 'DISRUPTED',
    materials: ['Logistics', 'Freight'],
    leadTimeDays: 3,
    reliabilityScore: 92,
    alternateSuppliers: ['MY-KLANG-01', 'SG-TANJONG-01'],
  },
  {
    id: 'MY-ELECTRONICS-02',
    name: 'Kuala Lumpur Components Ltd',
    tier: 2,
    country: 'Malaysia',
    city: 'Kuala Lumpur',
    coordinates: { lat: 3.139, lng: 101.6869 },
    status: 'AT_RISK',
    materials: ['PCB Assemblies', 'Passive Components'],
    leadTimeDays: 28,
    reliabilityScore: 79,
    alternateSuppliers: [],
  },
  {
    id: 'TH-ELECTRONICS-01',
    name: 'Bangkok Electronic Manufacturing',
    tier: 2,
    country: 'Thailand',
    city: 'Bangkok',
    coordinates: { lat: 13.7563, lng: 100.5018 },
    status: 'NORMAL',
    materials: ['PCB Assemblies', 'MEMS Sensors'],
    leadTimeDays: 35,
    reliabilityScore: 82,
    alternateSuppliers: [],
  },
  {
    id: 'JP-MICRO-01',
    name: 'Tokyo Microelectronics Corp',
    tier: 2,
    country: 'Japan',
    city: 'Tokyo',
    coordinates: { lat: 35.6762, lng: 139.6503 },
    status: 'NORMAL',
    materials: ['Microcontrollers', 'NAND Flash'],
    leadTimeDays: 18,
    reliabilityScore: 96,
    alternateSuppliers: [],
  },
];

// ─────────────────────────────────────────────────────────────
// FACTORIES
// ─────────────────────────────────────────────────────────────
export const MOCK_FACTORIES: Factory[] = [
  {
    id: 'DE-FACTORY-01',
    name: 'Frankfurt Assembly Plant',
    location: 'Frankfurt, Germany',
    city: 'Frankfurt',
    country: 'Germany',
    coordinates: { lat: 50.1109, lng: 8.6821 },
    status: 'AT_RISK',
    utilizationPct: 70,
    products: ['IntelliSense Pro X1', 'SmartLink Hub'],
    dailyCapacity: 1200,
  },
  {
    id: 'US-FACTORY-01',
    name: 'Austin Assembly Center',
    location: 'Austin, Texas, USA',
    city: 'Austin',
    country: 'USA',
    coordinates: { lat: 30.2672, lng: -97.7431 },
    status: 'NORMAL',
    utilizationPct: 88,
    products: ['DataBridge Enterprise'],
    dailyCapacity: 800,
  },
];

// ─────────────────────────────────────────────────────────────
// PRODUCTS
// ─────────────────────────────────────────────────────────────
export const MOCK_PRODUCTS: Product[] = [
  {
    id: 'PROD-X1',
    name: 'IntelliSense Pro X1',
    sku: 'ISP-X1-2026',
    category: 'Industrial IoT',
    inventoryDays: 7,
    criticalThreshold: 14,
    status: 'AT_RISK',
    factoryId: 'DE-FACTORY-01',
  },
  {
    id: 'PROD-SLH',
    name: 'SmartLink Hub',
    sku: 'SLH-2026',
    category: 'Connectivity',
    inventoryDays: 22,
    criticalThreshold: 10,
    status: 'NORMAL',
    factoryId: 'DE-FACTORY-01',
  },
];

// ─────────────────────────────────────────────────────────────
// CUSTOMERS
// ─────────────────────────────────────────────────────────────
export const MOCK_CUSTOMERS: Customer[] = [
  { id: 'CUST-DT', name: 'Deutsche Telekom AG', tier: 'TIER_1', country: 'Germany', ordersExposed: 8, exposureUSD: 14200000 },
  { id: 'CUST-SIEM', name: 'Siemens Digital Industries', tier: 'TIER_1', country: 'Germany', ordersExposed: 5, exposureUSD: 9800000 },
  { id: 'CUST-PHIL', name: 'Philips Healthcare', tier: 'TIER_2', country: 'Netherlands', ordersExposed: 6, exposureUSD: 3100000 },
  { id: 'CUST-BOSCH', name: 'Bosch Automotive', tier: 'TIER_2', country: 'Germany', ordersExposed: 3, exposureUSD: 1200000 },
];

// ─────────────────────────────────────────────────────────────
// SUPPLY CHAIN GRAPH (Canonical 5-tier model)
// ─────────────────────────────────────────────────────────────
export const MOCK_SUPPLY_CHAIN_GRAPH: SupplyChainGraph = {
  nodes: [
    // Tier 1 / Logistics & Suppliers (Column 1, x=70)
    { id: 'SG-LOGISTICS-01', type: 'FREIGHT_HUB', name: 'Singapore Freight Hub', status: 'DISRUPTED', coordinates: { lat: 1.2644, lng: 103.8185 }, x: 70, y: 50 },
    { id: 'MY-ELECTRONICS-01', type: 'SUPPLIER', name: 'Penang Electronics', status: 'DISRUPTED', tier: 1, coordinates: { lat: 5.4141, lng: 100.3288 }, x: 70, y: 115 },
    { id: 'TW-CHIPS-01', type: 'SUPPLIER', name: 'Taiwan Semiconductor', status: 'AT_RISK', tier: 2, coordinates: { lat: 24.7821, lng: 120.9978 }, x: 70, y: 180 },
    { id: 'JP-PRECISION-01', type: 'SUPPLIER', name: 'Osaka Precision Parts', status: 'NORMAL', tier: 1, coordinates: { lat: 34.6937, lng: 135.5023 }, x: 70, y: 245 },
    { id: 'IN-ALTERNATE-01', type: 'SUPPLIER', name: 'Bangalore Alt Partner', status: 'NORMAL', tier: 2, coordinates: { lat: 12.9716, lng: 77.5946 }, x: 70, y: 310 },

    // Critical Materials (Column 2, x=190)
    { id: 'MAT-CHIP-001', type: 'MATERIAL', name: 'Advanced Logic Chips', status: 'DISRUPTED', x: 190, y: 80 },
    { id: 'MAT-PCB-001', type: 'MATERIAL', name: 'PCB Assemblies', status: 'DISRUPTED', x: 190, y: 150 },
    { id: 'MAT-CONN-001', type: 'MATERIAL', name: 'Precision Connectors', status: 'NORMAL', x: 190, y: 220 },

    // Assembly Plants & Factories (Column 3, x=320)
    { id: 'FACT-DE-001', type: 'FACTORY', name: 'Frankfurt Manufacturing Hub', status: 'AT_RISK', coordinates: { lat: 50.1109, lng: 8.6821 }, x: 320, y: 100 },
    { id: 'FACT-SG-001', type: 'FACTORY', name: 'Singapore Regional Assembly', status: 'DISRUPTED', coordinates: { lat: 1.3521, lng: 103.8198 }, x: 320, y: 180 },

    // Finished Products (Column 4, x=440)
    { id: 'PROD-ISP-X1', type: 'PRODUCT', name: 'IntelliSense Pro X1', status: 'AT_RISK', x: 440, y: 100 },
    { id: 'PROD-DLG-5G', type: 'PRODUCT', name: 'DataLink Gateway 5G', status: 'AT_RISK', x: 440, y: 180 },

    // Enterprise Customers (Column 5, x=560)
    { id: 'CUST-DTE-001', type: 'CUSTOMER', name: 'Deutsche Telekom AG', status: 'AT_RISK', coordinates: { lat: 50.7374, lng: 7.0982 }, x: 560, y: 60 },
    { id: 'CUST-SIE-001', type: 'CUSTOMER', name: 'Siemens AG', status: 'AT_RISK', coordinates: { lat: 48.1351, lng: 11.582 }, x: 560, y: 125 },
    { id: 'CUST-BSH-001', type: 'CUSTOMER', name: 'Bosch Industrial', status: 'AT_RISK', coordinates: { lat: 48.7758, lng: 9.1829 }, x: 560, y: 190 },
    { id: 'CUST-VOD-001', type: 'CUSTOMER', name: 'Vodafone UK', status: 'NORMAL', coordinates: { lat: 51.5074, lng: -0.1278 }, x: 560, y: 255 },
  ],
  edges: [
    // Suppliers to Logistics / Materials
    { id: 'e1', from: 'TW-CHIPS-01', to: 'MAT-CHIP-001', type: 'SUPPLY', status: 'AT_RISK' },
    { id: 'e2', from: 'TW-CHIPS-01', to: 'SG-LOGISTICS-01', type: 'SHIP', status: 'DISRUPTED' },
    { id: 'e3', from: 'MY-ELECTRONICS-01', to: 'SG-LOGISTICS-01', type: 'SHIP', status: 'DISRUPTED' },
    { id: 'e4', from: 'MY-ELECTRONICS-01', to: 'MAT-PCB-001', type: 'SUPPLY', status: 'DISRUPTED' },
    { id: 'e5', from: 'JP-PRECISION-01', to: 'MAT-CONN-001', type: 'SUPPLY', status: 'NORMAL' },
    { id: 'e6', from: 'IN-ALTERNATE-01', to: 'MAT-PCB-001', type: 'SUPPLY', status: 'NORMAL' },

    // Materials to Factories
    { id: 'e7', from: 'MAT-CHIP-001', to: 'FACT-DE-001', type: 'INPUT', status: 'DISRUPTED' },
    { id: 'e8', from: 'MAT-PCB-001', to: 'FACT-DE-001', type: 'INPUT', status: 'DISRUPTED' },
    { id: 'e9', from: 'MAT-CONN-001', to: 'FACT-DE-001', type: 'INPUT', status: 'NORMAL' },
    { id: 'e10', from: 'SG-LOGISTICS-01', to: 'FACT-DE-001', type: 'TRANSIT', status: 'DISRUPTED' },
    { id: 'e11', from: 'MAT-PCB-001', to: 'FACT-SG-001', type: 'INPUT', status: 'DISRUPTED' },

    // Factories to Products
    { id: 'e12', from: 'FACT-DE-001', to: 'PROD-ISP-X1', type: 'MANUFACTURE', status: 'AT_RISK' },
    { id: 'e13', from: 'FACT-DE-001', to: 'PROD-DLG-5G', type: 'MANUFACTURE', status: 'AT_RISK' },

    // Products to Customers
    { id: 'e14', from: 'PROD-ISP-X1', to: 'CUST-DTE-001', type: 'FULFILL', status: 'AT_RISK' },
    { id: 'e15', from: 'PROD-ISP-X1', to: 'CUST-SIE-001', type: 'FULFILL', status: 'AT_RISK' },
    { id: 'e16', from: 'PROD-ISP-X1', to: 'CUST-BSH-001', type: 'FULFILL', status: 'AT_RISK' },
    { id: 'e17', from: 'PROD-DLG-5G', to: 'CUST-VOD-001', type: 'FULFILL', status: 'NORMAL' },
  ],
};

// ─────────────────────────────────────────────────────────────
// IMPACT TRACE RESULT
// ─────────────────────────────────────────────────────────────
export const MOCK_IMPACT_TRACE: ImpactTraceResult = {
  disruptionId: 'DISR-SG-2026-001',
  traceTimestamp: '2026-09-26T14:30:00Z',
  affectedNodeCount: 7,
  criticalPath: [
    'DISR-SG-2026-001',
    'SG-FREIGHT-HUB-01',
    'MY-ELECTRONICS-01',
    'PCB-ASSEMBLIES',
    'DE-FACTORY-01',
    'PROD-X1',
    'CUST-DT',
  ],
  nodes: [
    { id: 'DISR-SG-2026-001', name: 'Singapore Port MPA Terminal Congestion', type: 'DISRUPTION', impactLevel: 'HIGH' },
    { id: 'SG-FREIGHT-HUB-01', name: 'Singapore Freight Hub', type: 'FREIGHT_HUB', impactLevel: 'HIGH' },
    { id: 'MY-ELECTRONICS-01', name: 'Penang Electronics Sdn Bhd', type: 'SUPPLIER', tier: 1, impactLevel: 'HIGH' },
    { id: 'PCB-ASSEMBLIES', name: 'PCB Assemblies', type: 'PRODUCT', impactLevel: 'CRITICAL' },
    { id: 'DE-FACTORY-01', name: 'Frankfurt Assembly Plant', type: 'FACTORY', impactLevel: 'HIGH' },
    { id: 'PROD-X1', name: 'IntelliSense Pro X1', type: 'PRODUCT', impactLevel: 'HIGH' },
    { id: 'CUST-DT', name: 'Deutsche Telekom AG', type: 'CUSTOMER', impactLevel: 'HIGH' },
  ],
  edges: [
    { from: 'DISR-SG-2026-001', to: 'SG-FREIGHT-HUB-01' },
    { from: 'SG-FREIGHT-HUB-01', to: 'MY-ELECTRONICS-01' },
    { from: 'MY-ELECTRONICS-01', to: 'PCB-ASSEMBLIES', label: 'supplies' },
    { from: 'PCB-ASSEMBLIES', to: 'DE-FACTORY-01', label: 'critical input' },
    { from: 'DE-FACTORY-01', to: 'PROD-X1', label: 'produces' },
    { from: 'PROD-X1', to: 'CUST-DT', label: 'delivers to' },
  ],
  summary: {
    suppliersAffected: 3,
    factoriesAffected: 2,
    ordersAtRisk: 22,
    financialExposureUSD: 28300000,
    criticalMaterials: ['PCB Assemblies', 'RF Components'],
    estimatedRecoveryDays: 13,
  },
};

// ─────────────────────────────────────────────────────────────
// MATERIAL SHORTAGES
// ─────────────────────────────────────────────────────────────
export const MOCK_MATERIAL_SHORTAGES: MaterialShortage[] = [
  { material: 'PCB Assemblies', supplierId: 'MY-ELECTRONICS-01', currentStockDays: 7, criticalThreshold: 14, status: 'CRITICAL' },
  { material: 'RF Components', supplierId: 'MY-ELECTRONICS-01', currentStockDays: 5, criticalThreshold: 10, status: 'CRITICAL' },
  { material: 'Semiconductor Modules', supplierId: 'MY-ELECTRONICS-01', currentStockDays: 18, criticalThreshold: 14, status: 'ADEQUATE' },
  { material: 'Microcontrollers', supplierId: 'JP-MICRO-01', currentStockDays: 32, criticalThreshold: 14, status: 'ADEQUATE' },
];

// ─────────────────────────────────────────────────────────────
// CUSTOMER ORDERS
// ─────────────────────────────────────────────────────────────
export const MOCK_ORDERS: CustomerOrder[] = [
  { id: 'ORD-001', customerId: 'CUST-DT', customerName: 'Deutsche Telekom AG', productId: 'PROD-X1', productName: 'IntelliSense Pro X1', quantity: 2500, valueUSD: 5800000, dueDateISO: '2026-10-05T00:00:00Z', status: 'AT_RISK', riskLevel: 'HIGH', customerTier: 'TIER_1' },
  { id: 'ORD-002', customerId: 'CUST-DT', customerName: 'Deutsche Telekom AG', productId: 'PROD-X1', productName: 'IntelliSense Pro X1', quantity: 1800, valueUSD: 4200000, dueDateISO: '2026-10-12T00:00:00Z', status: 'AT_RISK', riskLevel: 'HIGH', customerTier: 'TIER_1' },
  { id: 'ORD-003', customerId: 'CUST-DT', customerName: 'Deutsche Telekom AG', productId: 'PROD-X1', productName: 'IntelliSense Pro X1', quantity: 1200, valueUSD: 2800000, dueDateISO: '2026-10-18T00:00:00Z', status: 'AT_RISK', riskLevel: 'MEDIUM', customerTier: 'TIER_1' },
  { id: 'ORD-004', customerId: 'CUST-SIEM', customerName: 'Siemens Digital Industries', productId: 'PROD-X1', productName: 'IntelliSense Pro X1', quantity: 3000, valueUSD: 7200000, dueDateISO: '2026-10-08T00:00:00Z', status: 'AT_RISK', riskLevel: 'HIGH', customerTier: 'TIER_1' },
  { id: 'ORD-005', customerId: 'CUST-SIEM', customerName: 'Siemens Digital Industries', productId: 'PROD-X1', productName: 'IntelliSense Pro X1', quantity: 1100, valueUSD: 2600000, dueDateISO: '2026-10-15T00:00:00Z', status: 'DELAYED', riskLevel: 'HIGH', customerTier: 'TIER_1' },
  { id: 'ORD-006', customerId: 'CUST-PHIL', customerName: 'Philips Healthcare', productId: 'PROD-X1', productName: 'IntelliSense Pro X1', quantity: 600, valueUSD: 1400000, dueDateISO: '2026-10-20T00:00:00Z', status: 'AT_RISK', riskLevel: 'MEDIUM', customerTier: 'TIER_2' },
  { id: 'ORD-007', customerId: 'CUST-PHIL', customerName: 'Philips Healthcare', productId: 'PROD-X1', productName: 'IntelliSense Pro X1', quantity: 800, valueUSD: 1800000, dueDateISO: '2026-10-28T00:00:00Z', status: 'ON_TRACK', riskLevel: 'LOW', customerTier: 'TIER_2' },
  { id: 'ORD-008', customerId: 'CUST-BOSCH', customerName: 'Bosch Automotive', productId: 'PROD-X1', productName: 'IntelliSense Pro X1', quantity: 400, valueUSD: 900000, dueDateISO: '2026-11-05T00:00:00Z', status: 'ON_TRACK', riskLevel: 'LOW', customerTier: 'TIER_2' },
];

// ─────────────────────────────────────────────────────────────
// SCENARIOS
// ─────────────────────────────────────────────────────────────
function makeSnapshots(days: number, startInv: number, invDecayRate: number, baseExposure: number): import('../types/simulations').DailySnapshot[] {
  const snaps = [];
  for (let d = 0; d < days; d++) {
    const date = new Date('2026-09-26');
    date.setDate(date.getDate() + d);
    snaps.push({
      day: d + 1,
      date: date.toISOString().slice(0, 10),
      inventoryPct: Math.max(5, startInv - invDecayRate * d + (d > 10 ? Math.min(d - 10, 15) : 0)),
      productionCapacityPct: Math.max(40, 70 - d * 1.5 + (d > 8 ? (d - 8) * 2.5 : 0)),
      ordersAtRisk: Math.min(22 + d, 40),
      financialExposureUSD: baseExposure + d * 150000,
      cumulativeLossUSD: d * baseExposure * 0.05,
    });
  }
  return snaps;
}

export const MOCK_SCENARIOS: Scenario[] = [
  {
    id: 'SIM-7D',
    duration: '7D',
    label: '7-Day Scenario',
    description: 'Short-term impact assuming disruption continues for full week with no recovery action.',
    assumptions: [
      'Singapore Port remains congested for 7 days',
      'No alternate supplier activated',
      'Current inventory consumed at normal rate',
      'No emergency air freight initiated',
    ],
    riskLevel: 'HIGH',
    snapshots: [
      { day: 1, date: '2026-09-20', inventoryPct: 92, productionCapacityPct: 98, ordersAtRisk: 0, financialExposureUSD: 0, cumulativeLossUSD: 0 },
      { day: 2, date: '2026-09-21', inventoryPct: 84, productionCapacityPct: 95, ordersAtRisk: 2, financialExposureUSD: 850000, cumulativeLossUSD: 200000 },
      { day: 3, date: '2026-09-22', inventoryPct: 76, productionCapacityPct: 90, ordersAtRisk: 4, financialExposureUSD: 1600000, cumulativeLossUSD: 450000 },
      { day: 4, date: '2026-09-23', inventoryPct: 68, productionCapacityPct: 85, ordersAtRisk: 5, financialExposureUSD: 2400000, cumulativeLossUSD: 800000 },
      { day: 5, date: '2026-09-24', inventoryPct: 60, productionCapacityPct: 80, ordersAtRisk: 6, financialExposureUSD: 3100000, cumulativeLossUSD: 1200000 },
      { day: 6, date: '2026-09-25', inventoryPct: 52, productionCapacityPct: 75, ordersAtRisk: 7, financialExposureUSD: 3700000, cumulativeLossUSD: 1700000 },
      { day: 7, date: '2026-09-26', inventoryPct: 45, productionCapacityPct: 70, ordersAtRisk: 8, financialExposureUSD: 4200000, cumulativeLossUSD: 2300000 },
    ],
    summary: { peakInventoryRisk: 45, minProductionCapacity: 70, totalOrdersAtRisk: 8, totalFinancialExposureUSD: 4200000, estimatedRecoveryCostUSD: 400000 },
  },
  {
    id: 'SIM-30D',
    duration: '30D',
    label: '30-Day Scenario',
    description: 'Medium-term projection: inventory buffers exhaust without expedited recovery.',
    assumptions: [
      'Disruption persists 10-14 days',
      'Alternate supplier MY-ELECTRONICS-02 activated on Day 8',
      'Partial air freight for critical orders initiated',
      'Production rebalanced by Day 15',
    ],
    riskLevel: 'HIGH',
    snapshots: [
      { day: 1, date: '2026-09-20', inventoryPct: 92, productionCapacityPct: 98, ordersAtRisk: 0, financialExposureUSD: 0, cumulativeLossUSD: 0 },
      { day: 5, date: '2026-09-25', inventoryPct: 60, productionCapacityPct: 80, ordersAtRisk: 6, financialExposureUSD: 3100000, cumulativeLossUSD: 1200000 },
      { day: 10, date: '2026-09-30', inventoryPct: 38, productionCapacityPct: 65, ordersAtRisk: 11, financialExposureUSD: 6800000, cumulativeLossUSD: 3100000 },
      { day: 14, date: '2026-10-04', inventoryPct: 30, productionCapacityPct: 58, ordersAtRisk: 15, financialExposureUSD: 9900000, cumulativeLossUSD: 4800000 },
      { day: 18, date: '2026-10-08', inventoryPct: 25, productionCapacityPct: 52, ordersAtRisk: 18, financialExposureUSD: 13200000, cumulativeLossUSD: 6900000 },
      { day: 21, date: '2026-10-11', inventoryPct: 22, productionCapacityPct: 48, ordersAtRisk: 20, financialExposureUSD: 15400000, cumulativeLossUSD: 8500000 },
      { day: 25, date: '2026-10-15', inventoryPct: 20, productionCapacityPct: 46, ordersAtRisk: 21, financialExposureUSD: 17100000, cumulativeLossUSD: 10200000 },
      { day: 30, date: '2026-10-20', inventoryPct: 18, productionCapacityPct: 45, ordersAtRisk: 22, financialExposureUSD: 18700000, cumulativeLossUSD: 12400000 },
    ],
    summary: { peakInventoryRisk: 18, minProductionCapacity: 45, totalOrdersAtRisk: 22, totalFinancialExposureUSD: 18700000, estimatedRecoveryCostUSD: 1200000 },
  },
  {
    id: 'SIM-60D',
    duration: '60D',
    label: '60-Day Scenario',
    description: 'Long-term unmitigated disruption baseline: severe stockouts and customer penalties.',
    assumptions: [
      'Full port recovery by Day 21',
      'Dual-source supply established with Bangkok Electronics',
      'Safety stock replenishment complete by Day 45',
      'Demand management and customer deferrals applied',
    ],
    riskLevel: 'CRITICAL',
    snapshots: [
      { day: 1, date: '2026-09-20', inventoryPct: 92, productionCapacityPct: 98, ordersAtRisk: 0, financialExposureUSD: 0, cumulativeLossUSD: 0 },
      { day: 7, date: '2026-09-26', inventoryPct: 45, productionCapacityPct: 70, ordersAtRisk: 8, financialExposureUSD: 4200000, cumulativeLossUSD: 2300000 },
      { day: 14, date: '2026-10-04', inventoryPct: 30, productionCapacityPct: 58, ordersAtRisk: 15, financialExposureUSD: 9900000, cumulativeLossUSD: 4800000 },
      { day: 21, date: '2026-10-11', inventoryPct: 22, productionCapacityPct: 48, ordersAtRisk: 20, financialExposureUSD: 15400000, cumulativeLossUSD: 8500000 },
      { day: 28, date: '2026-10-18', inventoryPct: 18, productionCapacityPct: 42, ordersAtRisk: 22, financialExposureUSD: 18500000, cumulativeLossUSD: 11200000 },
      { day: 35, date: '2026-10-25', inventoryPct: 14, productionCapacityPct: 35, ordersAtRisk: 23, financialExposureUSD: 21800000, cumulativeLossUSD: 13900000 },
      { day: 42, date: '2026-11-01', inventoryPct: 10, productionCapacityPct: 28, ordersAtRisk: 24, financialExposureUSD: 24600000, cumulativeLossUSD: 16500000 },
      { day: 50, date: '2026-11-09', inventoryPct: 7, productionCapacityPct: 24, ordersAtRisk: 25, financialExposureUSD: 26900000, cumulativeLossUSD: 19100000 },
      { day: 60, date: '2026-11-19', inventoryPct: 5, productionCapacityPct: 20, ordersAtRisk: 25, financialExposureUSD: 28300000, cumulativeLossUSD: 22400000 },
    ],
    summary: { peakInventoryRisk: 5, minProductionCapacity: 20, totalOrdersAtRisk: 25, totalFinancialExposureUSD: 28300000, estimatedRecoveryCostUSD: 3800000 },
  },
];

// ─────────────────────────────────────────────────────────────
// AGENT ACTIVITIES
// ─────────────────────────────────────────────────────────────
export const MOCK_AGENT_ACTIVITIES: AgentActivity[] = [
  {
    id: 'AGT-EVENT-01',
    agentType: 'EVENT',
    agentName: 'Event Intelligence Agent',
    status: 'COMPLETED',
    taskDescription: 'Validate and classify Singapore Port disruption from multiple authoritative sources.',
    reasoning: 'Cross-referenced MPA advisory #2026-147 with Lloyds List vessel tracking data and Port Authority Singapore public bulletin. Congestion confirmed at PSA Tanjong Pagar terminal. Labour dispute validated via shipping line advisories from MSC, Maersk, and CMA CGM. Classified as PORT_DISRUPTION with HIGH severity based on 65% throughput reduction and 847 vessel queue.',
    evidenceUsed: ['MPA Advisory #2026-147', 'Lloyds List vessel tracking', 'Port Authority Singapore bulletin', 'MSC/Maersk/CMA CGM advisories', 'AIS data from MarineTraffic'],
    output: 'Disruption validated: Singapore Port MPA Terminal Congestion. Severity: HIGH. Category: PORT_DISRUPTION. 847 vessels queued. 35% terminal capacity. ETA delays: 7-14 days.',
    confidencePct: 94,
    durationSeconds: 2.3,
    startedAt: '2026-09-26T14:00:00Z',
    completedAt: '2026-09-26T14:00:02Z',
  },
  {
    id: 'AGT-RESEARCH-01',
    agentType: 'RESEARCH',
    agentName: 'Supply Chain Research Agent',
    status: 'COMPLETED',
    taskDescription: 'Gather current port throughput data, identify alternate routing options, and map affected shipping lines.',
    reasoning: 'Queried Singapore MPA live throughput API confirming 35% capacity. Identified Port Klang (MY) and Tanjong Pelepas (MY) as viable alternate transhipment hubs with 8-12 day additional lead time. Enumerated 12 major shipping lines with Singapore port calls affected. Analyzed historical precedents from 2021 Yantian Port congestion for recovery time estimation.',
    evidenceUsed: ['Singapore MPA throughput API', 'Port Klang capacity data', 'Tanjong Pelepas schedule data', 'Shipping line AIS data', '2021 Yantian Port precedent analysis'],
    output: '65% throughput reduction confirmed. 847 vessels queued. Port Klang and Tanjong Pelepas identified as alternates with 8-12 day incremental lead time. 12 major shipping lines affected. Historical recovery: 12-18 days.',
    confidencePct: 89,
    durationSeconds: 3.7,
    startedAt: '2026-09-26T14:00:02Z',
    completedAt: '2026-09-26T14:00:06Z',
  },
  {
    id: 'AGT-IMPACT-01',
    agentType: 'IMPACT',
    agentName: 'Impact Trace Agent',
    status: 'COMPLETED',
    taskDescription: 'Trace 4-tier supply chain impact from disruption origin to end customer delivery.',
    reasoning: 'Traversed supply chain graph from Singapore Port disruption through Penang Electronics (Tier 1 supplier), through PCB Assemblies critical material, to Frankfurt Assembly Plant, to IntelliSense Pro X1 product, to Deutsche Telekom and Siemens as Tier-1 customers. Identified 7 critical path nodes and 22 exposed orders. Inventory analysis confirms 7-day runway at current consumption rate.',
    evidenceUsed: ['Supply chain graph database', 'SAP inventory snapshots', 'Bill of Materials (BOM)', 'Customer order backlog', 'Safety stock thresholds'],
    output: 'Critical path: Singapore → MY-ELECTRONICS-01 → PCB Assemblies → Frankfurt Factory → IntelliSense Pro X1 → Deutsche Telekom. 22 customer orders exposed ($28.3M). 7-day inventory runway. 2 factories at risk.',
    confidencePct: 96,
    durationSeconds: 4.1,
    startedAt: '2026-09-26T14:00:06Z',
    completedAt: '2026-09-26T14:00:10Z',
  },
  {
    id: 'AGT-FINANCE-01',
    agentType: 'FINANCE_ESG',
    agentName: 'Finance & ESG Agent',
    status: 'COMPLETED',
    taskDescription: 'Quantify financial exposure across all scenarios and compare CO2 footprint of recovery options.',
    reasoning: 'Modelled revenue exposure across 7/30/60-day horizons based on order values and contractual penalties. Air freight surcharge modelled at $3.8M for critical orders. CO2 analysis: air freight generates 340% higher emissions vs sea route baseline. Inventory reallocation identified as lowest-CO2 option but carries highest customer satisfaction risk.',
    evidenceUsed: ['SAP order data', 'Freight rate APIs (air vs sea)', 'CO2 emission factors by transport mode', 'Customer contract SLAs', 'Working capital model'],
    output: 'Max exposure: $28.3M (60-day). Air freight adds $3.8M cost (+340% CO2). Inventory realloc: $0.4M cost (lowest CO2). Alternate supplier: $1.2M cost (+12% CO2). Working capital impact: $4.2M.',
    confidencePct: 91,
    durationSeconds: 3.2,
    startedAt: '2026-09-26T14:00:10Z',
    completedAt: '2026-09-26T14:00:13Z',
  },
  {
    id: 'AGT-RECOVERY-01',
    agentType: 'RECOVERY',
    agentName: 'Recovery Strategy Agent',
    status: 'COMPLETED',
    taskDescription: 'Generate and rank 3 executable recovery strategies with detailed trade-off analysis.',
    reasoning: 'Generated 3 strategies covering the full recovery spectrum: (A) Alternate Supplier activation for medium-term supply security, (B) Emergency Air Freight for fastest Tier-1 customer fulfillment, and (C) Inventory Reallocation for lowest cost but requiring customer negotiation. Strategy B achieves 8-day recovery for critical orders. Strategy A provides best long-term supply security at moderate cost.',
    evidenceUsed: ['Alternate supplier capacity data', 'Air freight availability and rates', 'Current inventory distribution', 'Customer priority matrix', 'Contractual obligations'],
    output: '3 strategies generated. Strategy B (Air Freight): 8-day recovery, $3.8M cost, HIGH CO2 (+340%). Strategy A (Alternate Supplier): 18-day recovery, $1.2M cost, MEDIUM risk. Strategy C (Reallocation): 5-day recovery, $0.4M cost, HIGH customer risk.',
    confidencePct: 88,
    durationSeconds: 2.9,
    startedAt: '2026-09-26T14:00:13Z',
    completedAt: '2026-09-26T14:00:16Z',
  },
  {
    id: 'AGT-ORCH-01',
    agentType: 'ORCHESTRATOR',
    agentName: 'Orchestrator Agent',
    status: 'COMPLETED',
    taskDescription: 'Coordinate 5-agent workflow, synthesize findings, and generate final recommendation.',
    reasoning: 'Coordinated sequential execution of Event → Research → Impact → Finance & ESG → Recovery agents. Synthesized all agent outputs into coherent recommendation. Recommendation balances financial exposure minimisation, operational feasibility, and sustainability considerations. Human approval required before strategy activation.',
    evidenceUsed: ['All agent outputs', 'Company risk policy', 'Customer priority matrix', 'Sustainability targets', 'Budget constraints'],
    output: 'Synthesis complete. Recommend Strategy B for Tier-1 customers (Deutsche Telekom, Siemens) requiring immediate fulfillment. Recommend Strategy A for medium-term supply chain security. Strategy C as supplement for Tier-2/3 customers. Total coordinated workflow: 14.2s. Human approval required.',
    confidencePct: 93,
    durationSeconds: 14.2,
    startedAt: '2026-09-26T14:00:00Z',
    completedAt: '2026-09-26T14:00:14Z',
  },
];

// ─────────────────────────────────────────────────────────────
// RECOVERY STRATEGIES
// ─────────────────────────────────────────────────────────────
export const MOCK_STRATEGIES: RecoveryStrategy[] = [
  {
    id: 'STRAT-A-ALT-SUPPLIER',
    name: 'Activate Alternate Supplier',
    type: 'ALTERNATE_SUPPLIER',
    description: 'Onboard MY-ELECTRONICS-02 (Kuala Lumpur Components) as emergency alternate supplier for PCB Assemblies. Qualify production line within 5 days, first delivery in 18 days via Port Klang.',
    recoveryDays: 18,
    additionalCostUSD: 1200000,
    co2ImpactPct: 12,
    operationalRisk: 'MEDIUM',
    feasibilityPct: 78,
    assumptions: [
      'MY-ELECTRONICS-02 has 60% excess capacity available',
      'Quality qualification completed in 5 business days',
      'Port Klang routing adds 8 days to baseline lead time',
      'Air freight used for first 2 weeks of critical materials',
    ],
    tradeoffs: [
      'Best long-term supply security outcome',
      'Higher unit cost (+18% vs primary supplier)',
      'Moderate CO2 increase from dual-sourcing logistics (+12%)',
      '18-day window creates partial Tier-1 customer delay',
    ],
    recommended: false,
  },
  {
    id: 'STRAT-B-AIR-FREIGHT',
    name: 'Emergency Air Freight',
    type: 'AIR_FREIGHT',
    description: 'Charter air freight for critical PCB Assembly shipments from Penang to Frankfurt via cargo hub. Achieves 8-day recovery for Tier-1 customer orders. High cost but fastest resolution.',
    recoveryDays: 8,
    additionalCostUSD: 3800000,
    co2ImpactPct: 340,
    operationalRisk: 'LOW',
    feasibilityPct: 92,
    assumptions: [
      'Air cargo capacity available from Penang International Airport',
      'Customer approval for freight cost surcharge (Tier-1 contracts allow)',
      'Production at Penang facility continues at 80% capacity',
      'Frankfurt Factory clears backlog within 5 days',
    ],
    tradeoffs: [
      'Fastest recovery (8 days) — protects Tier-1 SLAs',
      'Significantly higher cost (+$3.8M)',
      '340% CO2 impact vs sea freight baseline',
      'Not sustainable for long-term use',
    ],
    recommended: true,
  },
  {
    id: 'STRAT-C-REALLOCATION',
    name: 'Inventory Reallocation',
    type: 'INVENTORY_REALLOCATION',
    description: 'Reallocate existing Frankfurt warehouse inventory from Tier-2/3 customer orders to fulfil Tier-1 critical orders. Defer lower-priority shipments by 3-4 weeks.',
    recoveryDays: 5,
    additionalCostUSD: 400000,
    co2ImpactPct: 2,
    operationalRisk: 'HIGH',
    feasibilityPct: 65,
    assumptions: [
      'Tier-2/3 customer acceptance of 3-4 week deferral',
      'Existing safety stock covers 12 days of Tier-1 demand',
      'No contractual penalties triggered under force majeure',
      'Port disruption resolves within 14 days',
    ],
    tradeoffs: [
      'Lowest cost option ($0.4M)',
      'Near-zero additional CO2 impact (+2%)',
      'High customer satisfaction risk for Tier-2/3 accounts',
      'Requires active customer negotiation',
    ],
    recommended: false,
  },
];

// ─────────────────────────────────────────────────────────────
// FINANCIAL SUMMARY
// ─────────────────────────────────────────────────────────────
export const MOCK_FINANCIAL_SUMMARY: FinancialSummary = {
  revenueExposureUSD: 28300000,
  workingCapitalImpactUSD: 4200000,
  recoveryCostRangeMin: 400000,
  recoveryCostRangeMax: 3800000,
  exposureByCustomerTier: [
    { tier: 'TIER_1', exposureUSD: 24000000, ordersCount: 13 },
    { tier: 'TIER_2', exposureUSD: 3100000, ordersCount: 6 },
    { tier: 'TIER_3', exposureUSD: 1200000, ordersCount: 3 },
  ],
  dailyExposure: Array.from({ length: 30 }, (_, i) => {
    const d = new Date('2026-09-26');
    d.setDate(d.getDate() + i);
    return {
      date: d.toISOString().slice(0, 10),
      exposureUSD: 28300000 + i * 120000,
      cumulativeUSD: (i + 1) * 28300000 * 0.03,
    };
  }),
};

// ─────────────────────────────────────────────────────────────
// SUSTAINABILITY
// ─────────────────────────────────────────────────────────────
export const MOCK_SUSTAINABILITY: SustainabilityData = {
  currentRouteCO2Tons: 148,
  strategies: [
    { strategyId: 'STR-A', strategyName: 'Alternate Supplier', co2Tons: 215, co2ChangePct: 45, mode: 'Sea + Air (partial)' },
    { strategyId: 'STR-B', strategyName: 'Air Freight', co2Tons: 651, co2ChangePct: 340, mode: 'Full Air Freight' },
    { strategyId: 'STR-C', strategyName: 'Inventory Realloc', co2Tons: 155, co2ChangePct: 5, mode: 'Road (minimal)' },
  ],
};

// ─────────────────────────────────────────────────────────────
// TRANSACTION ANOMALIES
// ─────────────────────────────────────────────────────────────
export const MOCK_ANOMALIES: TransactionAnomaly[] = [
  {
    id: 'ANO-001',
    type: 'PAYMENT_DELAY',
    description: 'Unexpected payment delay from Penang Electronics (MY-ELECTRONICS-01) — 18 days overdue on invoice #INV-2026-8812.',
    supplierId: 'MY-ELECTRONICS-01',
    supplierName: 'Penang Electronics Sdn Bhd',
    detectedAt: '2026-09-19T08:00:00Z',
    severity: 'HIGH',
    correlatedDisruptionId: 'DISR-SG-2026-001',
    valueUSD: 2100000,
    status: 'INVESTIGATING',
  },
  {
    id: 'ANO-002',
    type: 'ORDER_SPIKE',
    description: 'Abnormal order volume spike (+340%) from Singapore Freight Hub — indicative of pre-disruption inventory hoarding.',
    supplierId: 'SG-FREIGHT-HUB-01',
    supplierName: 'Singapore Freight Hub',
    detectedAt: '2026-09-17T14:30:00Z',
    severity: 'MEDIUM',
    correlatedDisruptionId: 'DISR-SG-2026-001',
    valueUSD: 850000,
    status: 'OPEN',
  },
  {
    id: 'ANO-003',
    type: 'PRICE_ANOMALY',
    description: 'PCB Assembly spot market price surge: +85% above 90-day moving average. Consistent with supply shock behaviour.',
    supplierId: 'MY-ELECTRONICS-02',
    supplierName: 'KL Components Ltd',
    detectedAt: '2026-09-21T10:00:00Z',
    severity: 'HIGH',
    correlatedDisruptionId: 'DISR-SG-2026-001',
    valueUSD: 0,
    status: 'OPEN',
  },
  {
    id: 'ANO-004',
    type: 'INVOICE_MISMATCH',
    description: 'Invoice quantity mismatch detected: PO-2026-4421 shows 3,000 units but invoice issued for 2,400 units from Bangkok Electronics.',
    supplierId: 'TH-ELECTRONICS-01',
    supplierName: 'Bangkok Electronic Manufacturing',
    detectedAt: '2026-09-22T16:00:00Z',
    severity: 'LOW',
    correlatedDisruptionId: undefined,
    valueUSD: 180000,
    status: 'INVESTIGATING',
  },
];

// ─────────────────────────────────────────────────────────────
// OVERVIEW KPIs
// ─────────────────────────────────────────────────────────────
export const MOCK_OVERVIEW = {
  activeDisruptions: 1,
  suppliersAtRisk: 3,
  ordersExposed: 22,
  financialExposureUSD: 28300000,
  criticalMaterials: 2,
  factoriesAffected: 2,
  systemStatus: {
    backend: 'ONLINE',
    aiAgents: 'ONLINE',
    sapDataFeed: 'ONLINE',
    marketDataFeed: 'ONLINE',
    mlModels: 'ONLINE',
  },
  recentEvents: [
    { id: '1', message: 'Singapore Port disruption detected — severity upgraded to HIGH', timestamp: '2026-09-26T14:30:00Z', level: 'HIGH' },
    { id: '2', message: 'Impact trace completed: 22 orders at risk, $28.3M exposure', timestamp: '2026-09-26T14:31:00Z', level: 'HIGH' },
    { id: '3', message: 'Agent swarm activated — 5 agents analysing disruption', timestamp: '2026-09-26T14:32:00Z', level: 'INFO' },
    { id: '4', message: 'PCB Assembly inventory below 14-day safety threshold', timestamp: '2026-09-26T14:35:00Z', level: 'CRITICAL' },
    { id: '5', message: 'Recovery strategies generated — awaiting human approval', timestamp: '2026-09-26T14:45:00Z', level: 'INFO' },
  ],
  aiAttentionItems: [
    { id: 'a1', title: 'Immediate: Tier-1 customer SLA breach risk', description: 'Deutsche Telekom and Siemens orders due within 14 days. Activate air freight or alternate supplier immediately.', severity: 'CRITICAL' },
    { id: 'a2', title: 'Payment anomaly at Penang Electronics', description: 'Invoice overdue 18 days — may indicate financial stress at supplier. Investigate and escalate.', severity: 'HIGH' },
    { id: 'a3', title: 'PCB Assembly spot price surge (+85%)', description: 'Market data shows sharp price increase. Lock in alternate supplier pricing before further escalation.', severity: 'MEDIUM' },
  ],
};
