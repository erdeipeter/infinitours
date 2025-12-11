import { useState } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { currentUser } from '@/data/mockData';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User, Mail, Lock, LogOut, Save } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

export default function ProfilePage() {
  const navigate = useNavigate();
  const [name, setName] = useState(currentUser.name);
  const [email, setEmail] = useState(currentUser.email);

  const handleSave = () => {
    toast.success('Profil sikeresen mentve!');
  };

  const handleLogout = () => {
    toast.success('Sikeres kijelentkezés!');
    navigate('/login');
  };

  return (
    <div className="animate-fade-in">
      <PageHeader title="Profilom" description="Személyes beállítások kezelése" />

      <div className="page-content space-y-6 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <User className="w-5 h-5 text-primary" />
              Profil adatok
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-2xl font-bold text-primary">
                  {currentUser.name.split(' ').map((n) => n[0]).join('')}
                </span>
              </div>
              <div>
                <p className="font-semibold text-lg">{currentUser.name}</p>
                <p className="text-muted-foreground">{currentUser.role}</p>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Név</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>E-mail cím</Label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <Button onClick={handleSave}>
              <Save className="w-4 h-4 mr-2" />
              Mentés
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Lock className="w-5 h-5 text-primary" />
              Jelszó módosítása
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Jelenlegi jelszó</Label>
              <Input type="password" />
            </div>
            <div className="space-y-2">
              <Label>Új jelszó</Label>
              <Input type="password" />
            </div>
            <div className="space-y-2">
              <Label>Új jelszó megerősítése</Label>
              <Input type="password" />
            </div>
            <Button variant="outline" onClick={() => toast.success('Jelszó módosítva!')}>
              Jelszó módosítása
            </Button>
          </CardContent>
        </Card>

        <Card className="border-destructive/50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Kijelentkezés</p>
                <p className="text-sm text-muted-foreground">Biztonságos kijelentkezés a rendszerből</p>
              </div>
              <Button variant="destructive" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Kijelentkezés
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
