import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';

export default function Layout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    // Aggiorna la data ogni minuto
    const interval = setInterval(() => {
      setCurrentDate(new Date());
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-blue-600 text-white shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold">CALDAIAPP</h1>
              <span className="text-sm opacity-80">{user?.tenantName}</span>
              <span className="text-sm opacity-70 border-l border-blue-400 pl-4">
                {format(currentDate, "EEEE d MMMM yyyy 'ore' HH:mm", { locale: it })}
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm">
                {user?.firstName} {user?.lastName}
              </span>
              <button
                onClick={handleLogout}
                className="bg-blue-700 hover:bg-blue-800 px-4 py-2 rounded transition"
              >
                Esci
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white shadow-md">
        <div className="container mx-auto px-4">
          <div className="flex space-x-1">
            <NavLink to="/app" active={location.pathname === '/app'}>
              Dashboard
            </NavLink>
            <NavLink to="/app/customers" active={isActive('/app/customers')}>
              Clienti
            </NavLink>
            <NavLink to="/app/boilers" active={isActive('/app/boilers')}>
              Caldaie
            </NavLink>
            <NavLink to="/app/calendar" active={isActive('/app/calendar')}>
              Calendario
            </NavLink>
            <NavLink to="/app/interventions" active={isActive('/app/interventions')}>
              Interventi
            </NavLink>
            <NavLink to="/app/invoices" active={isActive('/app/invoices')}>
              Fatture
            </NavLink>
            <NavLink to="/app/estimates" active={isActive('/app/estimates')}>
              Preventivi
            </NavLink>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}

function NavLink({ to, active, children }: { to: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link
      to={to}
      className={`px-4 py-3 font-medium transition ${
        active
          ? 'text-blue-600 border-b-2 border-blue-600'
          : 'text-gray-600 hover:text-blue-600 hover:border-b-2 hover:border-blue-400'
      }`}
    >
      {children}
    </Link>
  );
}
