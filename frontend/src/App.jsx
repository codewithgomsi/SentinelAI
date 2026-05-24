import { Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import LiveMonitoring from './pages/LiveMonitoring';
import AnomalyDetection from './pages/AnomalyDetection';
import Analytics from './pages/Analytics';
import IncidentReports from './pages/IncidentReports';
import ModelEvaluation from './pages/ModelEvaluation';
import WarRoom from './pages/WarRoom';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="/live-monitoring" element={<LiveMonitoring />} />
        <Route path="/anomaly-detection" element={<AnomalyDetection />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/incidents" element={<IncidentReports />} />
        <Route path="/model-evaluation" element={<ModelEvaluation />} />
        <Route path="/war-room" element={<WarRoom />} />
      </Route>
    </Routes>
  );
}
