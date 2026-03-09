import React, { useState, useEffect } from 'react';
import { useConfirmDialog } from '@/components/ConfirmDialog';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  useRouteTemplates,
  useCreateRouteTemplate,
  useUpdateRouteTemplate,
  useDeleteRouteTemplate,
  useRouteTemplateStops,
  useSetRouteTemplateStops,
  useStops,
} from '@/hooks/useStopsData';
import type { RouteTemplate, StopRole } from '@/services/stopsApi';
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
import { Plus, Edit, Trash2, Route, ArrowRight, X, MapPin } from 'lucide-react';
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

interface TemplateFormData {
  name: string;
  origin_region: string;
  destination_region: string;
}

const emptyForm: TemplateFormData = {
  name: '',
  origin_region: '',
  destination_region: '',
};

interface StopAssignment {
  stop_id: string;
  stop_role: StopRole;
  name_en: string;
  name_ar: string;
}

const RouteTemplatesManager: React.FC = () => {
  const { t, language } = useLanguage();
  const { data: templates = [], isLoading } = useRouteTemplates(true);
  const { data: allStops = [] } = useStops(true);
  const createTemplate = useCreateRouteTemplate();
  const updateTemplate = useUpdateRouteTemplate();
  const deleteTemplate = useDeleteRouteTemplate();
  const setTemplateStops = useSetRouteTemplateStops();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<RouteTemplate | null>(null);
  const [form, setForm] = useState<TemplateFormData>(emptyForm);

  // Stop assignment state
  const [stopsDialogOpen, setStopsDialogOpen] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | undefined>(undefined);
  const [assignedStops, setAssignedStops] = useState<StopAssignment[]>([]);
  const { data: currentTemplateStops = [] } = useRouteTemplateStops(selectedTemplateId);

  // When template stops load, populate the assigned stops
  useEffect(() => {
    if (currentTemplateStops.length > 0 && stopsDialogOpen) {
      setAssignedStops(
        currentTemplateStops.map(ts => ({
          stop_id: ts.stop_id,
          stop_role: ts.stop_role,
          name_en: ts.stop?.name_en || '',
          name_ar: ts.stop?.name_ar || '',
        }))
      );
    }
  }, [currentTemplateStops, stopsDialogOpen]);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingTemplate(null);
  };

  const openEdit = (tmpl: RouteTemplate) => {
    setEditingTemplate(tmpl);
    setForm({
      name: tmpl.name,
      origin_region: tmpl.origin_region,
      destination_region: tmpl.destination_region,
    });
    setDialogOpen(true);
  };

  const openStopsDialog = (templateId: string) => {
    setSelectedTemplateId(templateId);
    setAssignedStops([]);
    setStopsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.origin_region || !form.destination_region) {
      toast.error('Please fill all required fields');
      return;
    }

    const payload = {
      name: form.name,
      origin_region: form.origin_region,
      destination_region: form.destination_region,
      is_active: true,
    };

    try {
      if (editingTemplate) {
        await updateTemplate.mutateAsync({ id: editingTemplate.id, updates: payload });
        toast.success('Route template updated');
      } else {
        await createTemplate.mutateAsync(payload);
        toast.success('Route template created');
      }
      setDialogOpen(false);
      resetForm();
    } catch {
      toast.error('Failed to save route template');
    }
  };

  const handleToggleActive = async (tmpl: RouteTemplate) => {
    try {
      await updateTemplate.mutateAsync({ id: tmpl.id, updates: { is_active: !tmpl.is_active } });
      toast.success(tmpl.is_active ? 'Template deactivated' : 'Template activated');
    } catch {
      toast.error('Failed to update template');
    }
  };

  const handleDelete = async (id: string) => {
    const confirmed = await confirm({
      title: 'Delete Route Template',
      description: 'This template and all its schedules, stops, and trip instances will be permanently deleted.',
      confirmLabel: 'Delete',
      variant: 'destructive',
    });
    if (!confirmed) return;
    try {
      await deleteTemplate.mutateAsync(id);
      toast.success('Route template deleted');
    } catch {
      toast.error('Failed to delete template');
    }
  };

  const addStopToAssignment = (stopId: string) => {
    const stop = allStops.find(s => s.id === stopId);
    if (!stop || assignedStops.some(a => a.stop_id === stopId)) return;
    setAssignedStops(prev => [
      ...prev,
      { stop_id: stopId, stop_role: 'both' as StopRole, name_en: stop.name_en, name_ar: stop.name_ar },
    ]);
  };

  const removeStopFromAssignment = (stopId: string) => {
    setAssignedStops(prev => prev.filter(a => a.stop_id !== stopId));
  };

  const updateStopRole = (stopId: string, role: StopRole) => {
    setAssignedStops(prev =>
      prev.map(a => a.stop_id === stopId ? { ...a, stop_role: role } : a)
    );
  };

  const moveStop = (index: number, direction: 'up' | 'down') => {
    const newArr = [...assignedStops];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newArr.length) return;
    [newArr[index], newArr[targetIndex]] = [newArr[targetIndex], newArr[index]];
    setAssignedStops(newArr);
  };

  const handleSaveStops = async () => {
    if (!selectedTemplateId) return;
    try {
      await setTemplateStops.mutateAsync({
        templateId: selectedTemplateId,
        stops: assignedStops.map((a, i) => ({
          stop_id: a.stop_id,
          sequence_order: i + 1,
          stop_role: a.stop_role,
        })),
      });
      toast.success('Stops saved successfully');
      setStopsDialogOpen(false);
    } catch {
      toast.error('Failed to save stops');
    }
  };

  // Get template for stops dialog
  const selectedTemplate = templates.find(t => t.id === selectedTemplateId);

  // Available stops to add (filter by template regions)
  const availableStops = allStops.filter(s => {
    if (!selectedTemplate) return s.is_active;
    return (
      s.is_active &&
      (s.region === selectedTemplate.origin_region || s.region === selectedTemplate.destination_region) &&
      !assignedStops.some(a => a.stop_id === s.id)
    );
  });

  if (isLoading) {
    return <p className="text-center text-muted-foreground py-8">{t('common.loading')}</p>;
  }

  return (
    <>
      <Card className="border-2 shadow-lg">
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <Route className="w-5 h-5 text-primary" />
            Route Templates
          </CardTitle>
          <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary-dark text-white gap-2">
                <Plus className="w-4 h-4" />
                Add Template
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>{editingTemplate ? 'Edit Route Template' : 'Add Route Template'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label>Template Name *</Label>
                  <Input
                    value={form.name}
                    onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                    placeholder="e.g., Cairo → South Sinai"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Origin Region *</Label>
                    <Select value={form.origin_region} onValueChange={v => setForm(p => ({ ...p, origin_region: v }))}>
                      <SelectTrigger><SelectValue placeholder="Select region" /></SelectTrigger>
                      <SelectContent>
                        {REGIONS.map(r => (
                          <SelectItem key={r} value={r}>{r}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Destination Region *</Label>
                    <Select value={form.destination_region} onValueChange={v => setForm(p => ({ ...p, destination_region: v }))}>
                      <SelectTrigger><SelectValue placeholder="Select region" /></SelectTrigger>
                      <SelectContent>
                        {REGIONS.map(r => (
                          <SelectItem key={r} value={r}>{r}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button type="submit" className="w-full bg-primary hover:bg-primary-dark text-white">
                  {editingTemplate ? 'Update Template' : 'Create Template'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {templates.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No route templates yet. Create one above.</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Direction</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Stops</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {templates.map(tmpl => (
                    <TableRow key={tmpl.id} className={!tmpl.is_active ? 'opacity-50' : ''}>
                      <TableCell className="font-medium">{tmpl.name}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <Badge variant="outline">{tmpl.origin_region}</Badge>
                          <ArrowRight className="w-3 h-3 text-muted-foreground" />
                          <Badge variant="outline">{tmpl.destination_region}</Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={tmpl.is_active}
                            onCheckedChange={() => handleToggleActive(tmpl)}
                          />
                          <span className={`text-xs ${tmpl.is_active ? 'text-success' : 'text-muted-foreground'}`}>
                            {tmpl.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openStopsDialog(tmpl.id)}
                          className="gap-1"
                        >
                          <MapPin className="w-3 h-3" />
                          Manage Stops
                        </Button>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => openEdit(tmpl)}>
                            <Edit className="w-3 h-3" />
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => handleDelete(tmpl.id)}>
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stops Assignment Dialog */}
      <Dialog open={stopsDialogOpen} onOpenChange={setStopsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Manage Stops — {selectedTemplate?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* Add stop */}
            <div className="space-y-2">
              <Label>Add Stop</Label>
              <Select onValueChange={addStopToAssignment} value="">
                <SelectTrigger>
                  <SelectValue placeholder="Select a stop to add..." />
                </SelectTrigger>
                <SelectContent>
                  {availableStops.length === 0 ? (
                    <SelectItem value="none" disabled>No available stops</SelectItem>
                  ) : (
                    availableStops.map(s => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.name_en} — {s.region}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Assigned stops list */}
            <div className="space-y-2">
              <Label>Stop Order (drag to reorder)</Label>
              {assignedStops.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">No stops assigned yet</p>
              ) : (
                <div className="space-y-2">
                  {assignedStops.map((stop, index) => (
                    <div
                      key={stop.stop_id}
                      className="flex items-center gap-2 p-3 rounded-lg border bg-card"
                    >
                      <div className="flex flex-col gap-0.5">
                        <button
                          type="button"
                          className="text-muted-foreground hover:text-foreground disabled:opacity-30"
                          disabled={index === 0}
                          onClick={() => moveStop(index, 'up')}
                        >
                          ▲
                        </button>
                        <button
                          type="button"
                          className="text-muted-foreground hover:text-foreground disabled:opacity-30"
                          disabled={index === assignedStops.length - 1}
                          onClick={() => moveStop(index, 'down')}
                        >
                          ▼
                        </button>
                      </div>
                      <span className="w-6 h-6 flex items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">
                        {index + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm truncate">{stop.name_en}</div>
                        <div className="text-xs text-muted-foreground" dir="rtl">{stop.name_ar}</div>
                      </div>
                      <Select
                        value={stop.stop_role}
                        onValueChange={(v) => updateStopRole(stop.stop_id, v as StopRole)}
                      >
                        <SelectTrigger className="w-28">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pickup">Pickup</SelectItem>
                          <SelectItem value="dropoff">Dropoff</SelectItem>
                          <SelectItem value="both">Both</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => removeStopFromAssignment(stop.stop_id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Button
              onClick={handleSaveStops}
              className="w-full bg-primary hover:bg-primary-dark text-white"
              disabled={setTemplateStops.isPending}
            >
              {setTemplateStops.isPending ? 'Saving...' : 'Save Stops Order'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default RouteTemplatesManager;
