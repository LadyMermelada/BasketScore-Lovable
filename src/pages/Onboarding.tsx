import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

const Onboarding = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    birth_date: '',
    gender: '',
    role: 'player'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      const { error } = await supabase
        .from('profiles')
        .update({
          ...formData,
          updated_at: new Date()
        })
        .eq('id', user.id);

      if (error) {
        toast.error("Error al guardar: " + error.message);
      } else {
        toast.success("¡Perfil completado!");
        navigate('/'); // Volvemos a la cancha
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8 bg-card p-8 rounded-2xl border border-border shadow-xl">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight">Casi listo... 🏀</h1>
          <p className="text-muted-foreground mt-2">Necesitamos estos datos para personalizar tu experiencia.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="first_name">Nombre</Label>
              <Input id="first_name" placeholder="Ej: Pau" onChange={e => setFormData({...formData, first_name: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="last_name">Apellido</Label>
              <Input id="last_name" placeholder="Ej: Gasol" onChange={e => setFormData({...formData, last_name: e.target.value})} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="birth_date">Fecha de Nacimiento *</Label>
            <Input id="birth_date" type="date" required onChange={e => setFormData({...formData, birth_date: e.target.value})} />
          </div>

          <div className="space-y-2">
            <Label>Género *</Label>
            <Select onValueChange={val => setFormData({...formData, gender: val})} required>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="masculino">Masculino</SelectItem>
                <SelectItem value="femenino">Femenino</SelectItem>
                <SelectItem value="otro">Otro / Prefiero no decirlo</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Tu rol principal</Label>
            <Select onValueChange={val => setFormData({...formData, role: val})} defaultValue="player">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="player">Jugador</SelectItem>
                <SelectItem value="coach">Entrenador</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-[10px] text-muted-foreground">Tu nombre y apellido ayudarán a que te reconozcan en tus Clubes.</p>
          </div>

          <Button type="submit" className="w-full h-12 text-lg font-bold" disabled={loading}>
            {loading ? 'Guardando...' : 'Comenzar a entrenar'}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Onboarding;
