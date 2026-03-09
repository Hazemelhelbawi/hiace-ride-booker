import React, { useState } from 'react';
import { useConfirmDialog } from '@/components/ConfirmDialog';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  useStops,
  useCreateStop,
  useUpdateStop,
  useDeleteStop,
} from '@/hooks/useStopsData';
import type { Stop } from '@/services/stopsApi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Edit, Trash2, MapPin, Search } from 'lucide-react';
import { toast } from 'sonner';

const REGIONS = [
  'Cairo',
  'South Sinai',
  'North Sinai',
  'Red Sea',
  'Alexandria',
  'Giza',
  'Suez',
  'Ismailia',
];

interface StopFormData {
  name_ar: string;
  name_en: string;
  region: string;
  city: string;
  address: string;
  latitude: string;
  longitude: string;
}

const emptyForm: StopFormData = {
  name_ar: '',
  name_en: '',
  region: '',
  city: '',
  address: '',
  latitude: '',
  longitude: '',
};

const StopsManager: React.FC = () => {
  const { t, language } = useLanguage();
  const { data: stops = [], isLoading } = useStops(true);
  const createStop = useCreateStop();
  const updateStop = useUpdateStop();
  const deleteStop = useDeleteStop();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingStop, setEditingStop] = useState<Stop | null>(null);
  const [form, setForm] = useState<StopFormData>(emptyForm);
  const [searchQuery, setSearchQuery] = useState('');
  const [regionFilter, setRegionFilter] = useState<string>('all');

  const resetForm = () => {
    setForm(emptyForm);
    setEditingStop(null);
  };

  const openEdit = (stop: Stop) => {
    setEditingStop(stop);
    setForm({
      name_ar: stop.name_ar,
      name_en: stop.name_en,
      region: stop.region,
      city: stop.city,
      address: stop.address || '',
      latitude: stop.latitude?.toString() || '',
      longitude: stop.longitude?.toString() || '',
    });
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name_en || !form.name_ar || !form.region || !form.city) {
      toast.error('Please fill all required fields');
      return;
    }

    const payload = {
      name_ar: form.name_ar,
      name_en: form.name_en,
      region: form.region,
      city: form.city,
      address: form.address || null,
      latitude: form.latitude ? parseFloat(form.latitude) : null,
      longitude: form.longitude ? parseFloat(form.longitude) : null,
      is_active: true,
    };

    try {
      if (editingStop) {
        await updateStop.mutateAsync({ id: editingStop.id, updates: payload });
        toast.success('Stop updated');
      } else {
        await createStop.mutateAsync(payload);
        toast.success('Stop created');
      }
      setDialogOpen(false);
      resetForm();
    } catch {
      toast.error('Failed to save stop');
    }
  };

  const handleToggleActive = async (stop: Stop) => {
    try {
      await updateStop.mutateAsync({ id: stop.id, updates: { is_active: !stop.is_active } });
      toast.success(stop.is_active ? 'Stop deactivated' : 'Stop activated');
    } catch {
      toast.error('Failed to update stop');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this stop?')) return;
    try {
      await deleteStop.mutateAsync(id);
      toast.success('Stop deleted');
    } catch {
      toast.error('Failed to delete stop');
    }
  };

  const filteredStops = stops.filter(s => {
    const matchesSearch =
      s.name_en.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.name_ar.includes(searchQuery) ||
      s.city.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRegion = regionFilter === 'all' || s.region === regionFilter;
    return matchesSearch && matchesRegion;
  });

  // Group by region
  const regions = [...new Set(filteredStops.map(s => s.region))].sort();

  if (isLoading) {
    return <p className="text-center text-muted-foreground py-8">{t('common.loading')}</p>;
  }

  return (
    <Card className="border-2 shadow-lg">
      <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
          <MapPin className="w-5 h-5 text-primary" />
          Stops Management
        </CardTitle>
        <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary-dark text-white gap-2">
              <Plus className="w-4 h-4" />
              Add Stop
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{editingStop ? 'Edit Stop' : 'Add New Stop'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Name (English) *</Label>
                  <Input
                    value={form.name_en}
                    onChange={e => setForm(p => ({ ...p, name_en: e.target.value }))}
                    placeholder="e.g., Dokki"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Name (Arabic) *</Label>
                  <Input
                    dir="rtl"
                    value={form.name_ar}
                    onChange={e => setForm(p => ({ ...p, name_ar: e.target.value }))}
                    placeholder="مثلاً: الدقي"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Region *</Label>
                  <Select value={form.region} onValueChange={v => setForm(p => ({ ...p, region: v }))}>
                    <SelectTrigger><SelectValue placeholder="Select region" /></SelectTrigger>
                    <SelectContent>
                      {REGIONS.map(r => (
                        <SelectItem key={r} value={r}>{r}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>City *</Label>
                  <Input
                    value={form.city}
                    onChange={e => setForm(p => ({ ...p, city: e.target.value }))}
                    placeholder="e.g., Cairo"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Address</Label>
                <Input
                  value={form.address}
                  onChange={e => setForm(p => ({ ...p, address: e.target.value }))}
                  placeholder="Full address (optional)"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Latitude</Label>
                  <Input
                    type="number"
                    step="any"
                    value={form.latitude}
                    onChange={e => setForm(p => ({ ...p, latitude: e.target.value }))}
                    placeholder="30.0444"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Longitude</Label>
                  <Input
                    type="number"
                    step="any"
                    value={form.longitude}
                    onChange={e => setForm(p => ({ ...p, longitude: e.target.value }))}
                    placeholder="31.2357"
                  />
                </div>
              </div>

              <Button type="submit" className="w-full bg-primary hover:bg-primary-dark text-white">
                {editingStop ? 'Update Stop' : 'Create Stop'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="Search stops..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
          <Select value={regionFilter} onValueChange={setRegionFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Filter by region" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Regions</SelectItem>
              {REGIONS.map(r => (
                <SelectItem key={r} value={r}>{r}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Stops grouped by region */}
        {regions.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">No stops found. Create your first stop above.</p>
        ) : (
          <div className="space-y-6">
            {regions.map(region => {
              const regionStops = filteredStops.filter(s => s.region === region);
              return (
                <div key={region}>
                  <div className="flex items-center gap-2 mb-3">
                    <Badge variant="outline" className="text-sm font-semibold px-3 py-1">
                      {region}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      ({regionStops.length} stop{regionStops.length !== 1 ? 's' : ''})
                    </span>
                  </div>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name (EN)</TableHead>
                          <TableHead>Name (AR)</TableHead>
                          <TableHead>City</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {regionStops.map(stop => (
                          <TableRow key={stop.id} className={!stop.is_active ? 'opacity-50' : ''}>
                            <TableCell className="font-medium">{stop.name_en}</TableCell>
                            <TableCell dir="rtl">{stop.name_ar}</TableCell>
                            <TableCell className="text-sm text-muted-foreground">{stop.city}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Switch
                                  checked={stop.is_active}
                                  onCheckedChange={() => handleToggleActive(stop)}
                                />
                                <span className={`text-xs ${stop.is_active ? 'text-success' : 'text-muted-foreground'}`}>
                                  {stop.is_active ? 'Active' : 'Inactive'}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button size="sm" variant="outline" onClick={() => openEdit(stop)} className="gap-1">
                                  <Edit className="w-3 h-3" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => handleDelete(stop.id)}
                                  className="gap-1"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default StopsManager;
