import api from './api';
import { MOCK_FINANCIAL_SUMMARY } from '../data/mockData';
import type { FinancialSummary } from '../types/agents';

export async function fetchFinancialSummary(disruptionId: string = 'DISR-SG-2026-001'): Promise<FinancialSummary> {
  try {
    const res = await api.get<any>(`/financial/${disruptionId}`);
    if (res.data) {
      return {
        revenueExposureUSD: res.data.total_exposure_usd || 28300000,
        workingCapitalImpactUSD: res.data.working_capital_impact_usd || 4200000,
        recoveryCostRangeMin: MOCK_FINANCIAL_SUMMARY.recoveryCostRangeMin,
        recoveryCostRangeMax: MOCK_FINANCIAL_SUMMARY.recoveryCostRangeMax,
        exposureByCustomerTier: res.data.exposure_by_tier || MOCK_FINANCIAL_SUMMARY.exposureByCustomerTier,
        dailyExposure: MOCK_FINANCIAL_SUMMARY.dailyExposure,
      };
    }
    return MOCK_FINANCIAL_SUMMARY;
  } catch {
    return MOCK_FINANCIAL_SUMMARY;
  }
}
