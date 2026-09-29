export type SupplierTier = 1 | 2 | 3;
export type NodeStatus = 'NORMAL' | 'AT_RISK' | 'DISRUPTED' | 'CRITICAL';

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface Supplier {
  id: string;
  name: string;
  tier: SupplierTier;
  country: string;
  city: string;
  coordinates: Coordinates;
  status: NodeStatus;
  materials: string[];
  leadTimeDays: number;
  reliabilityScore: number;
  alternateSuppliers?: string[];
}

export interface Factory {
  id: string;
  name: string;
  location: string;
  city: string;
  country: string;
  coordinates: Coordinates;
  status: NodeStatus;
  utilizationPct: number;
  products: string[];
  dailyCapacity: number;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  inventoryDays: number;
  criticalThreshold: number;
  status: NodeStatus;
  factoryId: string;
}

export interface Customer {
  id: string;
  name: string;
  tier: 'TIER_1' | 'TIER_2' | 'TIER_3';
  country: string;
  ordersExposed: number;
  exposureUSD: number;
}

export type SupplyChainNodeType = 'SUPPLIER' | 'MATERIAL' | 'FACTORY' | 'PRODUCT' | 'CUSTOMER' | 'FREIGHT_HUB';
export type SupplyChainEdgeType = 'SUPPLY' | 'INPUT' | 'MANUFACTURE' | 'SHIP' | 'SELL' | 'TRANSIT' | 'FULFILL';

export interface SupplyChainNode {
  id: string;
  type: SupplyChainNodeType;
  name: string;
  status: NodeStatus;
  tier?: SupplierTier;
  coordinates?: Coordinates;
  x?: number; // SVG position
  y?: number; // SVG position
  data?: Supplier | Factory | Product | Customer;
}

export interface SupplyChainEdge {
  id: string;
  from: string;
  to: string;
  type: SupplyChainEdgeType;
  status: NodeStatus;
  transitDays?: number;
}

export interface SupplyChainGraph {
  nodes: SupplyChainNode[];
  edges: SupplyChainEdge[];
}

export interface MaterialShortage {
  material: string;
  supplierId: string;
  currentStockDays: number;
  criticalThreshold: number;
  status: 'CRITICAL' | 'AT_RISK' | 'ADEQUATE';
}

export interface CustomerOrder {
  id: string;
  customerId: string;
  customerName: string;
  productId: string;
  productName: string;
  quantity: number;
  valueUSD: number;
  dueDateISO: string;
  status: 'AT_RISK' | 'DELAYED' | 'ON_TRACK' | 'CANCELLED';
  riskLevel: 'HIGH' | 'MEDIUM' | 'LOW';
  customerTier: 'TIER_1' | 'TIER_2' | 'TIER_3';
}
