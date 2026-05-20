import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bus, Mail, Lock, Eye, EyeOff, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { users } from '@/data/mockData';

const roleEmoji: Record<string, string> = {
  'Rendszeradmin': '🔑',
  'Műszakvezető':  '📋',
  'Járattervező':  '🗺️',
  'Diszpécser':    '📡',
  'Riportnéző':    '📊',
  'Sofőr':         '🚌',
  'Megrendelő':    '🏢',
};

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('horvath.bela@infinitours.hu');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      if (password !== 'Infinitours1') {
        setIsLoading(false);
        toast.error('Hibás jelszó!');
        return;
      }
      const success = login(email);
      setIsLoading(false);
      if (success) {
        toast.success('Sikeres bejelentkezés!');
        navigate('/dashboard');
      } else {
        toast.error('Hibás e-mail cím!');
      }
    }, 800);
  };

  return (
    <div className="min-h-screen flex">
      {/* Bal oldal – branding */}
      <div className="hidden lg:flex lg:flex-1 bg-sidebar relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent" />
        <div className="relative z-10 flex flex-col justify-center px-16">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center">
              <Bus className="w-10 h-10 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-4xl font-display font-bold text-sidebar-foreground">Infinitours</h1>
              <p className="text-sidebar-muted">Operatív vezénylési platform</p>
            </div>
          </div>
          <div className="space-y-4 max-w-md">
            {[
              { title: 'Teljes járatkezelés',         desc: 'Igénytől a teljesítésig – egy rendszerben' },
              { title: 'Valós idejű ütközéskezelés',  desc: 'AETR, E-FOS, párhuzamos járat automatikus ellenőrzése' },
              { title: 'AI ütemezőmotor',             desc: 'Beosztási javaslatok, műszakvezető jóváhagyással' },
            ].map(f => (
              <div key={f.title} className="p-4 rounded-xl bg-sidebar-accent/50 backdrop-blur">
                <p className="text-sidebar-foreground font-medium">{f.title}</p>
                <p className="text-sidebar-muted text-sm mt-1">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="absolute bottom-8 left-16 text-sidebar-muted text-sm">
          © 2026 Infinitours Kft. · Powered by MerkIT
        </div>
      </div>

      {/* Jobb oldal – login */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-3 mb-8 justify-center">
            <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center">
              <Bus className="w-7 h-7 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-display font-bold">Infinitours</h1>
          </div>

          <div className="text-center mb-8">
            <h2 className="text-2xl font-display font-bold text-foreground">Üdvözöljük!</h2>
            <p className="text-muted-foreground mt-2">Jelentkezzen be a folytatáshoz</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email">E-mail cím</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="nev@infinitours.hu" className="pl-10" required />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Jelszó</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input id="password" type={showPassword ? 'text' : 'password'} value={password}
                  onChange={e => setPassword(e.target.value)} placeholder="••••••••" className="pl-10 pr-10" required />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
            <Button type="submit" className="w-full h-11" disabled={isLoading}>
              {isLoading ? 'Bejelentkezés...' : 'Bejelentkezés'}
            </Button>
          </form>

          {/* Demo gyors bejelentkezés */}
          <div className="mt-8 p-4 rounded-xl bg-muted/50 text-sm space-y-3">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <AlertTriangle className="w-4 h-4" />
              <span className="font-medium text-foreground">Demo hozzáférések</span>
              <span>– jelszó: <span className="font-mono font-semibold text-foreground">Infinitours1</span></span>
            </div>
            <div className="grid grid-cols-1 gap-1">
              {users.map(u => (
                <button key={u.id} type="button"
                  onClick={() => setEmail(u.email)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-background text-left transition-colors group"
                >
                  <span className="text-base">{roleEmoji[u.role] ?? '👤'}</span>
                  <div className="flex-1 min-w-0">
                    <span className="font-medium text-foreground group-hover:text-primary text-sm">{u.name}</span>
                    <span className="text-muted-foreground text-xs ml-2">({u.role})</span>
                  </div>
                  <span className="text-xs text-muted-foreground truncate max-w-[140px]">{u.email}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
