import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import {
  LayoutDashboard,
  Users,
  Building2,
  Flame,
  Calendar,
  Wrench,
  FileText,
  Receipt,
  Phone,
  Package,
  LogOut,
  ChevronDown
} from 'lucide-react';

export default function Layout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showUserMenu, setShowUserMenu] = useState(false);

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
    <div className="min-h-screen bg-[#F7F7F7]">
      {/* Sidebar */}
      <aside className="fixed top-0 left-0 h-full w-64 bg-[#2A3F54] text-white z-30">
        {/* Logo */}
        <div className="h-16 flex items-center px-6 bg-[#1f2d3d] border-b border-[#3d5266]">
          <h1 className="text-xl font-bold text-white">CALDAIAPP</h1>
        </div>

        {/* Navigation */}
        <nav className="py-4">
          <SidebarLink
            to="/app"
            icon={<LayoutDashboard className="w-5 h-5" />}
            active={location.pathname === '/app'}
          >
            Dashboard
          </SidebarLink>

          <SidebarLink
            to="/app/customers"
            icon={<Users className="w-5 h-5" />}
            active={isActive('/app/customers')}
          >
            Clienti
          </SidebarLink>

          <SidebarLink
            to="/app/condominiums"
            icon={<Building2 className="w-5 h-5" />}
            active={isActive('/app/condominiums')}
          >
            Condomini
          </SidebarLink>

          <SidebarLink
            to="/app/boilers"
            icon={<Flame className="w-5 h-5" />}
            active={isActive('/app/boilers')}
          >
            Caldaie
          </SidebarLink>

          <SidebarLink
            to="/app/calendar"
            icon={<Calendar className="w-5 h-5" />}
            active={isActive('/app/calendar')}
          >
            Calendario
          </SidebarLink>

          <SidebarLink
            to="/app/interventions"
            icon={<Wrench className="w-5 h-5" />}
            active={isActive('/app/interventions')}
          >
            Interventi
          </SidebarLink>

          <SidebarLink
            to="/app/estimates"
            icon={<FileText className="w-5 h-5" />}
            active={isActive('/app/estimates')}
          >
            Preventivi
          </SidebarLink>

          <SidebarLink
            to="/app/invoices"
            icon={<Receipt className="w-5 h-5" />}
            active={isActive('/app/invoices')}
          >
            Promemoria
          </SidebarLink>

          <SidebarLink
            to="/app/calls"
            icon={<Phone className="w-5 h-5" />}
            active={isActive('/app/calls')}
          >
            Chiamate
          </SidebarLink>

          <SidebarLink
            to="/app/inventory"
            icon={<Package className="w-5 h-5" />}
            active={isActive('/app/inventory')}
          >
            Magazzino
          </SidebarLink>
        </nav>

        {/* Footer Info */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-[#3d5266]">
          <div className="text-xs text-gray-400">
            <div className="font-medium text-white mb-1">{user?.tenantName}</div>
            <div>{format(currentDate, "EEEE d MMMM yyyy", { locale: it })}</div>
            <div>{format(currentDate, "HH:mm", { locale: it })}</div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="ml-64">
        {/* Top Header */}
        <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-6 sticky top-0 z-20 shadow-sm">
          {/* Breadcrumb area (può essere personalizzato per pagina) */}
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <span className="font-medium text-gray-900">CALDAIAPP</span>
          </div>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center space-x-3 hover:bg-gray-50 px-3 py-2 rounded-lg transition"
            >
              <div className="w-8 h-8 bg-[#1ABB9C] rounded-full flex items-center justify-center text-white font-medium">
                {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
              </div>
              <div className="text-left hidden md:block">
                <div className="text-sm font-medium text-gray-900">
                  {user?.firstName} {user?.lastName}
                </div>
                <div className="text-xs text-gray-500">{user?.role}</div>
              </div>
              <ChevronDown className="w-4 h-4 text-gray-500" />
            </button>

            {/* Dropdown Menu */}
            {showUserMenu && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowUserMenu(false)}
                />
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Esci</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function SidebarLink({
  to,
  icon,
  active,
  children
}: {
  to: string;
  icon: React.ReactNode;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      to={to}
      className={`flex items-center space-x-3 px-6 py-3 transition ${
        active
          ? 'bg-[#1ABB9C] text-white border-l-4 border-[#17a085]'
          : 'text-gray-300 hover:bg-[#1f2d3d] hover:text-white'
      }`}
    >
      {icon}
      <span className="font-medium">{children}</span>
    </Link>
  );
}
