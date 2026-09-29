import api from './api';
import { MOCK_SUSTAINABILITY } from '../data/mockData';
import type { SustainabilityData } from '../types/agents';

export async function fetchSustainability(disruptionId: string = 'DISR-SG-2026-001'): Promise<SustainabilityData> {
  try {
    const res = await api.get<any>(`/sustainability/${disruptionId}`);
    if (res.data) {
      return {
        currentRouteCO2Tons: res.data.baseline_co2_kg ? Math.round(res.data.baseline_co2_kg / 1000) : 32,
        strategies: MOCK_SUSTAINABILITY.strategies,
      };
    }
    return MOCK_SUSTAINABILITY;
  } catch {
    return MOCK_SUSTAINABILITY;
  }
}
