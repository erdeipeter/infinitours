import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Building2,
  Bus,
  Users,
  Route,
  Calendar,
  ClipboardCheck,
  FileBarChart,
  Settings,
  User,
  ChevronDown,
  ChevronRight,
  LogOut,
  Menu,
  X,
  FileText,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface NavItem {
  label: string;
  icon: React.ElementType;
  path?: string;
  children?: { label: string; path: string }[];
}

// Full navigation for internal users
const internalNavigation: NavItem[] = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
  { label: 'Megrendelők', icon: Building2, path: '/clients' },
  { label: 'Járművek', icon: Bus, path: '/vehicles' },
  { label: 'Sofőrök', icon: Users, path: '/drivers' },
  {
    label: 'Járattervezés',
    icon: Route,
    children: [
      { label: 'Fix járatok', path: '/trips/fix' },
      { label: 'Körjáratok', path: '/trips/kor' },
      { label: 'Eseti járatok', path: '/trips/eseti' },
    ],
  },
  { label: 'Menetrendek', icon: Calendar, path: '/schedules' },
  { label: 'Teljesítés korrekció', icon: ClipboardCheck, path: '/corrections' },
  {
    label: 'Riportok',
    icon: FileBarChart,
    children: [
      { label: 'Külső riportok', path: '/reports/external' },
      { label: 'Belső riport 1', path: '/reports/internal-1' },
      { label: 'Belső riport 2', path: '/reports/internal-2' },
      { label: 'Belső riport 3', path: '/reports/internal-3' },
    ],
  },
  { label: 'Beállítások', icon: Settings, path: '/settings' },
  { label: 'Profilom', icon: User, path: '/profile' },
];

// Limited navigation for Megrendelő users
const clientNavigation: NavItem[] = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
  { label: 'Járatok', icon: Route, path: '/trips/client' },
  { label: 'Eseti megrendelések', icon: Calendar, path: '/trips/eseti' },
  { label: 'Teljesítési igazolások', icon: FileText, path: '/reports/external' },
  { label: 'Profilom', icon: User, path: '/profile' },
];

interface AppSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

export function AppSidebar({ isOpen, onToggle }: AppSidebarProps) {
  const location = useLocation();
  const { currentUser, isClient, logout } = useAuth();
  const [expandedItems, setExpandedItems] = useState<string[]>(['Járattervezés', 'Riportok']);

  // Select navigation based on user role
  const navigation = isClient ? clientNavigation : internalNavigation;

  const toggleExpand = (label: string) => {
    setExpandedItems((prev) =>
      prev.includes(label) ? prev.filter((item) => item !== label) : [...prev, label]
    );
  };

  const isActive = (path: string) => location.pathname === path;
  const isChildActive = (children?: { label: string; path: string }[]) =>
    children?.some((child) => location.pathname === child.path);

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-foreground/50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed lg:static inset-y-0 left-0 z-50 w-64 bg-sidebar flex flex-col transform transition-transform duration-200 ease-in-out',
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-sidebar-border">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Bus className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-sidebar-foreground text-lg">ON-Time 2.0</span>
          </div>
          <button onClick={onToggle} className="lg:hidden text-sidebar-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto scrollbar-thin py-4 px-3">
          <ul className="space-y-1">
            {navigation.map((item) => (
              <li key={item.label}>
                {item.children ? (
                  <div>
                    <button
                      onClick={() => toggleExpand(item.label)}
                      className={cn(
                        'w-full sidebar-link',
                        isChildActive(item.children) && 'text-sidebar-foreground'
                      )}
                    >
                      <item.icon className="w-5 h-5" />
                      <span className="flex-1 text-left">{item.label}</span>
                      {expandedItems.includes(item.label) ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </button>
                    {expandedItems.includes(item.label) && (
                      <ul className="mt-1 ml-8 space-y-1">
                        {item.children.map((child) => (
                          <li key={child.path}>
                            <NavLink
                              to={child.path}
                              className={({ isActive }) =>
                                cn(
                                  'block px-3 py-2 rounded-lg text-sm transition-colors',
                                  isActive
                                    ? 'bg-sidebar-accent text-sidebar-foreground font-medium'
                                    : 'text-sidebar-muted hover:text-sidebar-foreground hover:bg-sidebar-accent/50'
                                )
                              }
                            >
                              {child.label}
                            </NavLink>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ) : (
                  <NavLink
                    to={item.path!}
                    className={({ isActive }) =>
                      cn('sidebar-link', isActive && 'sidebar-link-active')
                    }
                  >
                    <item.icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </NavLink>
                )}
              </li>
            ))}
          </ul>
        </nav>

        {/* User Info */}
        <div className="p-4 border-t border-sidebar-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-sidebar-accent flex items-center justify-center">
              <User className="w-5 h-5 text-sidebar-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-sidebar-foreground truncate">
                {currentUser?.name || 'Vendég'}
              </p>
              <p className="text-xs text-sidebar-muted truncate">{currentUser?.role || ''}</p>
            </div>
            <button 
              type="button"
              onClick={handleLogout}
              className="text-sidebar-muted hover:text-sidebar-foreground transition-colors cursor-pointer p-1 rounded hover:bg-sidebar-accent"
              title="Kijelentkezés"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen flex w-full bg-background">
      <AppSidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <header className="lg:hidden h-16 flex items-center px-4 border-b border-border bg-card">
          <button onClick={() => setSidebarOpen(true)} className="text-foreground">
            <Menu className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-2 ml-4">
            <Bus className="w-6 h-6 text-primary" />
            <span className="font-display font-bold text-lg">ON-Time 2.0</span>
          </div>
        </header>
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
