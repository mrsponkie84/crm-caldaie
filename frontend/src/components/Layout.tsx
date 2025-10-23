import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Layout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

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
              <h1 className="text-2xl font-bold">CRM Caldaie</h1>
              <span className="text-sm opacity-80">{user?.tenantName}</span>
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
            <NavLink to="/" active={location.pathname === '/'}>
              Dashboard
            </NavLink>
            <NavLink to="/customers" active={isActive('/customers')}>
              Clienti
            </NavLink>
            <NavLink to="/boilers" active={isActive('/boilers')}>
              Caldaie
            </NavLink>
            <NavLink to="/calendar" active={isActive('/calendar')}>
              Calendario
            </NavLink>
            <NavLink to="/interventions" active={isActive('/interventions')}>
              Interventi
            </NavLink>
            <NavLink to="/invoices" active={isActive('/invoices')}>
              Fatture
            </NavLink>
            <NavLink to="/estimates" active={isActive('/estimates')}>
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
