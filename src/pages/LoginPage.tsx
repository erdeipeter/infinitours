import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bus, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export default function LoginPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('kiss.andras@ontime.hu');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate login
    setTimeout(() => {
      setIsLoading(false);
      toast.success('Sikeres bejelentkezés!');
      navigate('/dashboard');
    }, 1000);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:flex-1 bg-sidebar relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent" />
        <div className="relative z-10 flex flex-col justify-center px-16">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center">
              <Bus className="w-10 h-10 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-4xl font-display font-bold text-sidebar-foreground">ON-Time 2.0</h1>
              <p className="text-sidebar-muted">Flottamenedzsment rendszer</p>
            </div>
          </div>
          <div className="space-y-6 max-w-md">
            <div className="p-4 rounded-xl bg-sidebar-accent/50 backdrop-blur">
              <p className="text-sidebar-foreground font-medium">Teljes flottakezelés</p>
              <p className="text-sidebar-muted text-sm mt-1">Járműpark, sofőrök, menetrendek egy helyen</p>
            </div>
            <div className="p-4 rounded-xl bg-sidebar-accent/50 backdrop-blur">
              <p className="text-sidebar-foreground font-medium">Valós idejű követés</p>
              <p className="text-sidebar-muted text-sm mt-1">GPS alapú járatkövetés és riportálás</p>
            </div>
            <div className="p-4 rounded-xl bg-sidebar-accent/50 backdrop-blur">
              <p className="text-sidebar-foreground font-medium">Egyszerű járattervezés</p>
              <p className="text-sidebar-muted text-sm mt-1">Fix, kör és eseti járatok kezelése</p>
            </div>
          </div>
        </div>
        <div className="absolute bottom-8 left-16 text-sidebar-muted text-sm">
          © 2024 ON-Time Transport Kft.
        </div>
      </div>

      {/* Right side - Login form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-3 mb-8 justify-center">
            <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center">
              <Bus className="w-7 h-7 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-display font-bold">ON-Time 2.0</h1>
          </div>

          <div className="text-center mb-8">
            <h2 className="text-2xl font-display font-bold text-foreground">Üdvözöljük!</h2>
            <p className="text-muted-foreground mt-2">Jelentkezzen be a folytatáshoz</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="input-label">E-mail cím</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="pelda@email.com"
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="input-label">Jelszó</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pl-10 pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <Button type="submit" className="w-full h-11" disabled={isLoading}>
              {isLoading ? 'Bejelentkezés...' : 'Bejelentkezés'}
            </Button>

            <button
              type="button"
              className="w-full text-center text-sm text-primary hover:underline"
            >
              Elfelejtett jelszó?
            </button>
          </form>

          <div className="mt-8 p-4 rounded-xl bg-muted/50 text-sm">
            <p className="font-medium text-foreground mb-2">Demo hozzáférések:</p>
            <ul className="space-y-1 text-muted-foreground">
              <li>Admin: kiss.andras@ontime.hu</li>
              <li>Iroda: nagy.monika@ontime.hu</li>
              <li>Flottam.: toth.gabor@ontime.hu</li>
              <li>Megrend.: kovacs.laszlo@auchan.hu</li>
            </ul>
            <p className="mt-2 text-foreground">Jelszó: <span className="font-mono font-semibold">OnTime2.0</span></p>
          </div>
        </div>
      </div>
    </div>
  );
}
