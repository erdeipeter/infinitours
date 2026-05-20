import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard, Bus, Users, Route, Calendar, ClipboardCheck,
  FileBarChart, Settings, User, ChevronDown, ChevronRight, LogOut,
  Menu, X, FileText, Radio, Cpu, Smartphone,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface NavItem {
  label: string;
  icon: React.ElementType;
  path?: string;
  children?: { label: string; path: string }[];
  roles?: string[]; // ha üres → mindenki látja
}

const allNav: NavItem[] = [
  { label: 'Vezérlőpult',    icon: LayoutDashboard, path: '/dashboard' },
  { label: 'Diszpécser',     icon: Radio,            path: '/dispatcher',   roles: ['Rendszeradmin','Műszakvezető','Diszpécser'] },
  { label: 'Ütemezőmotor',   icon: Cpu,              path: '/scheduler',    roles: ['Rendszeradmin','Műszakvezető'] },
  { label: 'Sofőr nézet',    icon: Smartphone,       path: '/driver',       roles: ['Rendszeradmin','Sofőr'] },
  { label: 'Ügyfelek',       icon: Users,            path: '/clients',      roles: ['Rendszeradmin','Műszakvezető','Járattervező'] },
  { label: 'Járművek',       icon: Bus,              path: '/vehicles',     roles: ['Rendszeradmin','Műszakvezető','Járattervező','Diszpécser'] },
  { label: 'Sofőrök',        icon: Users,            path: '/drivers',      roles: ['Rendszeradmin','Műszakvezető','Járattervező'] },
  {
    label: 'Járatok', icon: Route,
    roles: ['Rendszeradmin','Műszakvezető','Járattervező','Diszpécser'],
    children: [
      { label: 'Fix járatok',   path: '/trips/fix'   },
      { label: 'Körjáratok',    path: '/trips/kor'   },
      { label: 'Eseti járatok', path: '/trips/eseti' },
    ],
  },
  { label: 'Menetrendek',    icon: Calendar,         path: '/schedules',    roles: ['Rendszeradmin','Műszakvezető','Járattervező'] },
  { label: 'Korrekciók',     icon: ClipboardCheck,   path: '/corrections',  roles: ['Rendszeradmin','Diszpécser'] },
  {
    label: 'Riportok', icon: FileBarChart,
    children: [
      { label: 'Külső riportok', path: '/reports/external' },
      { label: 'Belső riport 1', path: '/reports/internal-1' },
      { label: 'Belső riport 2', path: '/reports/internal-2' },
      { label: 'Belső riport 3', path: '/reports/internal-3' },
    ],
    roles: ['Rendszeradmin','Műszakvezető','Riportnéző'],
  },
  { label: 'Beállítások',    icon: Settings,         path: '/settings',     roles: ['Rendszeradmin'] },
  { label: 'Profilom',       icon: User,             path: '/profile' },
];

const clientNav: NavItem[] = [
  { label: 'Vezérlőpult',         icon: LayoutDashboard, path: '/dashboard' },
  { label: 'Saját járatok',        icon: Route,           path: '/trips/client' },
  { label: 'Eseti megrendelések',  icon: Calendar,        path: '/trips/eseti' },
  { label: 'Teljesítési igazolások', icon: FileText,      path: '/reports/external' },
  { label: 'Profilom',             icon: User,            path: '/profile' },
];

export function AppSidebar({ isOpen, onToggle, onClose }: { isOpen: boolean; onToggle: () => void; onClose: () => void }) {
  const location = useLocation();
  const { currentUser, isClient, logout } = useAuth();
  const [expandedItems, setExpandedItems] = useState<string[]>(['Járatok', 'Riportok']);

  const role = currentUser?.role ?? '';
  const navigation = isClient
    ? clientNav
    : allNav.filter(item => !item.roles || item.roles.includes(role));

  const toggleExpand = (label: string) =>
    setExpandedItems(prev => prev.includes(label) ? prev.filter(i => i !== label) : [...prev, label]);

  const isActive      = (path: string) => location.pathname === path;
  const isChildActive = (children?: { label: string; path: string }[]) =>
    children?.some(c => location.pathname === c.path);

  const handleLogout = () => { logout(); window.location.href = '/login'; };

  return (
    <>
      {isOpen && <div className="fixed inset-0 bg-foreground/50 z-40 lg:hidden" onClick={onToggle} />}
      <aside className={cn(
        'fixed lg:static inset-y-0 left-0 z-50 w-64 bg-sidebar flex flex-col transform transition-transform duration-200 ease-in-out',
        isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      )}>
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-sidebar-border">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Bus className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-sidebar-foreground text-lg">Infinitours</span>
          </div>
          <button onClick={onToggle} className="lg:hidden text-sidebar-foreground"><X className="w-5 h-5" /></button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto scrollbar-thin py-4 px-3">
          <ul className="space-y-1">
            {navigation.map(item => (
              <li key={item.label}>
                {item.children ? (
                  <div>
                    <button onClick={() => toggleExpand(item.label)}
                      className={cn('w-full sidebar-link', isChildActive(item.children) && 'text-sidebar-foreground')}>
                      <item.icon className="w-5 h-5" />
                      <span className="flex-1 text-left">{item.label}</span>
                      {expandedItems.includes(item.label) ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </button>
                    {expandedItems.includes(item.label) && (
                      <ul className="mt-1 ml-8 space-y-1">
                        {item.children.map(child => (
                          <li key={child.path}>
                            <NavLink to={child.path} onClick={onClose} className={({ isActive }) => cn(
                              'block px-3 py-2 rounded-lg text-sm transition-colors',
                              isActive ? 'bg-sidebar-accent text-sidebar-foreground font-medium' : 'text-sidebar-muted hover:text-sidebar-foreground hover:bg-sidebar-accent/50'
                            )}>{child.label}</NavLink>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ) : (
                  <NavLink to={item.path!} onClick={onClose} className={({ isActive: a }) => cn('sidebar-link', a && 'sidebar-link-active')}>
                    <item.icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </NavLink>
                )}
              </li>
            ))}
          </ul>
        </nav>

        {/* User info */}
        <div className="p-4 border-t border-sidebar-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-sidebar-accent flex items-center justify-center">
              <User className="w-5 h-5 text-sidebar-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-sidebar-foreground truncate">{currentUser?.name ?? 'Vendég'}</p>
              <p className="text-xs text-sidebar-muted truncate">{currentUser?.role ?? ''}</p>
            </div>
            <button type="button" onClick={handleLogout}
              className="text-sidebar-muted hover:text-sidebar-foreground transition-colors p-1 rounded hover:bg-sidebar-accent" title="Kijelentkezés">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  return (
    <div className="min-h-screen flex w-full bg-background">
      <AppSidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0">
        <header className="lg:hidden h-16 flex items-center px-4 border-b border-border bg-card">
          <button onClick={() => setSidebarOpen(true)} className="text-foreground"><Menu className="w-6 h-6" /></button>
          <div className="flex items-center gap-2 ml-4">
            <Bus className="w-6 h-6 text-primary" />
            <span className="font-display font-bold text-lg">Infinitours</span>
          </div>
        </header>
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
