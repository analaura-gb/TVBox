import { Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import TVBoxDetails from "./pages/TVBoxDetails";

function App() {

  return (
    <Routes className="min-h-screen bg-gray-900 text-white">
      <Route path="/" element={<Dashboard />} />
      <Route path="/tvbox/:id" element={<TVBoxDetails />} />
    </Routes>
  )
}

export default App
