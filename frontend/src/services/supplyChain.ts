import api from './api';
import { MOCK_SUPPLY_CHAIN_GRAPH, MOCK_SUPPLIERS, MOCK_FACTORIES } from '../data/mockData';
import type { SupplyChainGraph, Supplier, Factory } from '../types/supply-chain';

export async function fetchSupplyChainGraph(): Promise<SupplyChainGraph> {
  try {
    const res = await api.get<any>('/supply-chain/graph');
    if (res.data && Array.isArray(res.data.nodes) && res.data.nodes.length > 0) {
      // Deterministic 5-column layout:
      // Col 1: Suppliers & Freight Hubs (x=70)
      // Col 2: Critical Materials (x=190)
      // Col 3: Factories & Plants (x=320)
      // Col 4: Finished Products (x=440)
      // Col 5: Global Enterprise Customers (x=560)
      const columnPositions: Record<string, { x: number; count: number }> = {
        SUPPLIER: { x: 70, count: 0 },
        FREIGHT_HUB: { x: 70, count: 0 },
        MATERIAL: { x: 190, count: 0 },
        FACTORY: { x: 320, count: 0 },
        PRODUCT: { x: 440, count: 0 },
        CUSTOMER: { x: 560, count: 0 },
      };

      const nodes = res.data.nodes.map((n: any) => {
        const type = (n.node_type || 'SUPPLIER').toUpperCase();
        const col = columnPositions[type] || { x: 300, count: 0 };
        const yIndex = col.count++;
        const y = 50 + yIndex * 60;
        const name = n.label || n.name || n.id;

        return {
          id: n.id,
          type: type as any,
          name: name,
          status: n.status || (n.is_affected ? 'AT_RISK' : 'NORMAL'),
          tier: n.tier,
          coordinates: n.lat && n.lng ? { lat: n.lat, lng: n.lng } : undefined,
          x: col.x,
          y: y,
          data: n.metadata,
        };
      });

      const edges = res.data.edges.map((e: any, idx: number) => ({
        id: `e-${idx}`,
        from: e.source,
        to: e.target,
        type: (e.edge_type || e.relationship_type || 'SUPPLY').toUpperCase(),
        status: e.is_affected ? 'AT_RISK' : 'NORMAL',
      }));

      return { nodes, edges };
    }
    return MOCK_SUPPLY_CHAIN_GRAPH;
  } catch (err) {
    console.warn('[SupplyChainService] Error fetching graph, using fallback:', err);
    return MOCK_SUPPLY_CHAIN_GRAPH;
  }
}

export async function fetchSuppliers(): Promise<Supplier[]> {
  try {
    const res = await api.get<any[]>('/supply-chain/suppliers');
    if (Array.isArray(res.data) && res.data.length > 0) {
      return res.data.map((s) => ({
        id: s.id,
        name: s.name,
        tier: s.tier,
        country: s.country,
        city: s.city,
        coordinates: { lat: s.lat, lng: s.lng },
        status: s.status,
        materials: [],
        leadTimeDays: 14,
        reliabilityScore: s.quality_score || 0.95,
      }));
    }
    return MOCK_SUPPLIERS;
  } catch {
    return MOCK_SUPPLIERS;
  }
}

export async function fetchFactories(): Promise<Factory[]> {
  try {
    const res = await api.get<any[]>('/supply-chain/factories');
    if (Array.isArray(res.data) && res.data.length > 0) {
      return res.data.map((f) => ({
        id: f.id,
        name: f.name,
        location: `${f.city}, ${f.country}`,
        city: f.city,
        country: f.country,
        coordinates: { lat: f.lat, lng: f.lng },
        status: f.status,
        utilizationPct: f.current_utilization_percent,
        products: [],
        dailyCapacity: f.capacity_units_per_day,
      }));
    }
    return MOCK_FACTORIES;
  } catch {
    return MOCK_FACTORIES;
  }
}
