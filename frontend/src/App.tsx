import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Homepage from './pages/Homepage';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Customers from './pages/Customers';
import CustomerDetail from './pages/CustomerDetail';
import Boilers from './pages/Boilers';
import Interventions from './pages/Interventions';
import Calendar from './pages/Calendar';
import Invoices from './pages/Invoices';
import Estimates from './pages/Estimates';
import Condominiums from './pages/Condominiums';
import CondominiumDetail from './pages/CondominiumDetail';
import Calls from './pages/Calls';
import Inventory from './pages/Inventory';
import Analytics from './pages/Analytics';
import Layout from './components/Layout';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Homepage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route path="/app" element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }>
            <Route index element={<Dashboard />} />
            <Route path="customers" element={<Customers />} />
            <Route path="customers/:id" element={<CustomerDetail />} />
            <Route path="condominiums" element={<Condominiums />} />
            <Route path="condominiums/:id" element={<CondominiumDetail />} />
            <Route path="boilers" element={<Boilers />} />
            <Route path="interventions" element={<Interventions />} />
            <Route path="calendar" element={<Calendar />} />
            <Route path="invoices" element={<Invoices />} />
            <Route path="estimates" element={<Estimates />} />
            <Route path="calls" element={<Calls />} />
            <Route path="inventory" element={<Inventory />} />
            <Route path="analytics" element={<Analytics />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
