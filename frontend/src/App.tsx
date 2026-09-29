import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppLayout } from './layouts/AppLayout';
import OverviewPage from './pages/OverviewPage';
import DisruptionsPage from './pages/DisruptionsPage';
import GlobalRadarPage from './pages/GlobalRadarPage';
import SupplyChainMapPage from './pages/SupplyChainMapPage';
import ImpactAnalysisPage from './pages/ImpactAnalysisPage';
import SimulationsPage from './pages/SimulationsPage';
import AgentSwarmPage from './pages/AgentSwarmPage';
import RecoveryPlansPage from './pages/RecoveryPlansPage';
import FinancialImpactPage from './pages/FinancialImpactPage';
import SustainabilityPage from './pages/SustainabilityPage';
import TransactionAnomaliesPage from './pages/TransactionAnomaliesPage';
import ReportsPage from './pages/ReportsPage';
import SettingsPage from './pages/SettingsPage';

function App() {
  return (
    <BrowserRouter>
      <AppLayout>
        <Routes>
          <Route path="/" element={<OverviewPage />} />
          <Route path="/disruptions" element={<DisruptionsPage />} />
          <Route path="/radar" element={<GlobalRadarPage />} />
          <Route path="/supply-chain" element={<SupplyChainMapPage />} />
          <Route path="/impact" element={<ImpactAnalysisPage />} />
          <Route path="/impact/:disruptionId" element={<ImpactAnalysisPage />} />
          <Route path="/simulations" element={<SimulationsPage />} />
          <Route path="/simulations/:disruptionId" element={<SimulationsPage />} />
          <Route path="/agents" element={<AgentSwarmPage />} />
          <Route path="/recovery" element={<RecoveryPlansPage />} />
          <Route path="/financial" element={<FinancialImpactPage />} />
          <Route path="/sustainability" element={<SustainabilityPage />} />
          <Route path="/anomalies" element={<TransactionAnomaliesPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </AppLayout>
    </BrowserRouter>
  );
}

export default App;
