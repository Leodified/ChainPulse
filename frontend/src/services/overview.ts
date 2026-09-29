import api from './api';
import { MOCK_OVERVIEW } from '../data/mockData';

export async function fetchOverview() {
  try {
    const res = await api.get('/overview/summary');
    if (res.data?.success && res.data?.data) {
      return {
        ...MOCK_OVERVIEW,
        activeDisruptions: res.data.data.active_disruptions,
        suppliersAtRisk: res.data.data.affected_suppliers,
        ordersExposed: res.data.data.at_risk_orders,
        financialExposureUSD: res.data.data.max_financial_exposure_usd || 28300000,
        primaryDisruption: res.data.data.primary_disruption,
      };
    }
    return MOCK_OVERVIEW;
  } catch {
    return MOCK_OVERVIEW;
  }
}
