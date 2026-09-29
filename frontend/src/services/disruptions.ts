import api from './api';
import { MOCK_DISRUPTIONS } from '../data/mockData';
import type { DisruptionEvent } from '../types/disruptions';

export function normalizeDisruption(d: any): DisruptionEvent {
  return {
    id: d.id,
    title: d.title,
    description: d.description,
    category: d.category,
    severity: d.severity,
    status: d.status,
    location: d.location || {
      lat: d.lat ?? 1.2644,
      lng: d.lng ?? 103.8185,
      city: d.location_name || 'Singapore',
      country: d.country || 'Singapore',
    },
    detectedAt: d.detected_at || d.detectedAt || new Date().toISOString(),
    updatedAt: d.updated_at || d.updatedAt || d.detected_at || new Date().toISOString(),
    affectedRoutes: d.affectedRoutes || ['RTE-SG-DE-SEA', 'RTE-TW-SG-SEA'],
    exposureUSD: d.exposureUSD ?? (d.company_exposure_level === 'HIGH' ? 28300000 : 4200000),
    affectedSuppliers: d.affectedSuppliers || ['SG-LOGISTICS-01', 'MY-ELECTRONICS-01'],
    sources: d.source ? [d.source] : (d.sources || ['MPA Advisory']),
    tags: d.tags || ['PORT_CONGESTION', 'FORCE_MAJEURE'],
  };
}

export async function fetchDisruptions(): Promise<DisruptionEvent[]> {
  try {
    const res = await api.get<any[]>('/disruptions');
    if (Array.isArray(res.data) && res.data.length > 0) {
      const backendDisruptions = res.data.map(normalizeDisruption);
      // Merge with non-conflicting mock disruptions for full demo experience
      const mockRemaining = MOCK_DISRUPTIONS.filter(
        (m) => !backendDisruptions.some((b) => b.id === m.id)
      );
      return [...backendDisruptions, ...mockRemaining];
    }
    return MOCK_DISRUPTIONS;
  } catch (err) {
    console.warn('[DisruptionsService] Backend unavailable, using mock data:', err);
    return MOCK_DISRUPTIONS;
  }
}

export async function fetchDisruptionById(id: string): Promise<DisruptionEvent | undefined> {
  try {
    const res = await api.get<any>(`/disruptions/${id}`);
    if (res.data) {
      return normalizeDisruption(res.data);
    }
    return MOCK_DISRUPTIONS.find((d) => d.id === id);
  } catch {
    return MOCK_DISRUPTIONS.find((d) => d.id === id);
  }
}
