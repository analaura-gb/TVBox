import { Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import TVBoxDetails from './pages/TVBoxDetails';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/tvbox/:id" element={<TVBoxDetails />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
