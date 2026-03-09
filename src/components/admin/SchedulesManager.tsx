import React, { useState } from 'react';
import { useConfirmDialog } from '@/components/ConfirmDialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Plus, Trash2, Clock, CalendarDays, Bus, Zap, ChevronDown, ChevronUp,
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { useRouteTemplates } from '@/hooks/useStopsData';
import {
  useSchedules, useCreateSchedule, useDeleteSchedule, useUpdateSchedule,
  useScheduleStopTimes, useSetScheduleStopTimes,
  useTripInstances, useGenerateTripInstances, useUpdateTripInstance,
} from '@/hooks/useSchedulesData';
import { useRouteTemplateStops } from '@/hooks/useStopsData';

const WEEKDAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const SchedulesManager: React.FC = () => {
  const { data: templates = [] } = useRouteTemplates(true);
  const { data: schedules = [], isLoading } = useSchedules();
  const createSchedule = useCreateSchedule();
  const deleteSchedule = useDeleteSchedule();
  const updateSchedule = useUpdateSchedule();
  const generateTrips = useGenerateTripInstances();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [expandedSchedule, setExpandedSchedule] = useState<string | null>(null);
  const [form, setForm] = useState({
    route_template_id: '',
    title: '',
    start_date: '',
    end_date: '',
    recurrence_type: 'daily' as 'daily' | 'weekly' | 'custom',
    weekdays: [] as number[],
    vehicle_count: 1,
    seats_per_vehicle: 12,
    price: 0,
    van_type: '13_seats' as '13_seats' | '12_seats',
    daily_repeats: 1,
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.route_template_id || !form.title || !form.start_date || !form.end_date) {
      toast.error('Please fill all required fields');
      return;
    }
    try {
      await createSchedule.mutateAsync({ ...form, is_active: true });
      setIsDialogOpen(false);
      setForm({ route_template_id: '', title: '', start_date: '', end_date: '', recurrence_type: 'daily', weekdays: [], vehicle_count: 1, seats_per_vehicle: 12, price: 0, van_type: '13_seats', daily_repeats: 1 });
      toast.success('Schedule created');
    } catch { toast.error('Failed to create schedule'); }
  };

  const handleDelete = async (id: string) => {
    const confirmed = await confirm({
      title: 'Delete Schedule',
      description: 'This schedule and all its trip instances will be permanently deleted.',
      confirmLabel: 'Delete',
      variant: 'destructive',
    });
    if (!confirmed) return;
    try {
      await deleteSchedule.mutateAsync(id);
      toast.success('Schedule deleted');
    } catch { toast.error('Failed to delete'); }
  };

  const handleGenerate = async (id: string) => {
    try {
      const count = await generateTrips.mutateAsync(id);
      toast.success(`Generated ${count} trip instances`);
    } catch { toast.error('Failed to generate trips'); }
  };

  const toggleWeekday = (day: number) => {
    setForm(prev => ({
      ...prev,
      weekdays: prev.weekdays.includes(day)
        ? prev.weekdays.filter(d => d !== day)
        : [...prev.weekdays, day],
    }));
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="schedules">
        <TabsList className="flex flex-wrap h-auto gap-1">
          <TabsTrigger value="schedules" className="text-xs sm:text-sm">Schedules</TabsTrigger>
          <TabsTrigger value="trips" className="text-xs sm:text-sm">Trip Instances</TabsTrigger>
        </TabsList>

        <TabsContent value="schedules">
          <Card className="border-2 shadow-lg">
            <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
                <CalendarDays className="w-5 h-5" /> Trip Schedules
              </CardTitle>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm"><Plus className="w-4 h-4 mr-1" /> New Schedule</Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                  <DialogHeader><DialogTitle>Create Trip Schedule</DialogTitle></DialogHeader>
                  <form onSubmit={handleCreate} className="space-y-4">
                    <div>
                      <Label>Route Template *</Label>
                      <Select value={form.route_template_id} onValueChange={v => setForm(p => ({ ...p, route_template_id: v }))}>
                        <SelectTrigger><SelectValue placeholder="Select route..." /></SelectTrigger>
                        <SelectContent>
                          {templates.map(t => (
                            <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Title *</Label>
                      <Input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="e.g. Cairo-Sinai Daily June" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label>Start Date *</Label>
                        <Input type="date" value={form.start_date} onChange={e => setForm(p => ({ ...p, start_date: e.target.value }))} />
                      </div>
                      <div>
                        <Label>End Date *</Label>
                        <Input type="date" value={form.end_date} onChange={e => setForm(p => ({ ...p, end_date: e.target.value }))} />
                      </div>
                    </div>
                    <div>
                      <Label>Recurrence</Label>
                      <Select value={form.recurrence_type} onValueChange={(v: any) => setForm(p => ({ ...p, recurrence_type: v }))}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="custom">Custom Days</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {(form.recurrence_type === 'weekly' || form.recurrence_type === 'custom') && (
                      <div>
                        <Label>Select Days</Label>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {WEEKDAY_NAMES.map((name, i) => (
                            <Button key={i} type="button" size="sm"
                              variant={form.weekdays.includes(i) ? 'default' : 'outline'}
                              onClick={() => toggleWeekday(i)}
                            >{name}</Button>
                          ))}
                        </div>
                      </div>
                    )}
                    {/* Van Type */}
                    <div>
                      <Label>Van Type</Label>
                      <Select value={form.van_type} onValueChange={(v: any) => setForm(p => ({
                        ...p,
                        van_type: v,
                        seats_per_vehicle: v === '12_seats' ? 12 : 13,
                      }))}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="13_seats">13 Seats (with seat 4)</SelectItem>
                          <SelectItem value="12_seats">12 Seats (without seat 4)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {/* Daily Repeats */}
                    <div>
                      <Label>Daily Repeats (same trip per day)</Label>
                      <Input
                        type="number"
                        min={1}
                        max={10}
                        value={form.daily_repeats}
                        onChange={e => setForm(p => ({ ...p, daily_repeats: parseInt(e.target.value) || 1 }))}
                      />
                      <p className="text-xs text-muted-foreground mt-1">How many times this trip runs each day (1-10)</p>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <Label>Vehicles</Label>
                        <Input type="number" min={1} value={form.vehicle_count} onChange={e => setForm(p => ({ ...p, vehicle_count: parseInt(e.target.value) || 1 }))} />
                      </div>
                      <div>
                        <Label>Seats/Vehicle</Label>
                        <Input type="number" min={1} value={form.seats_per_vehicle} onChange={e => setForm(p => ({ ...p, seats_per_vehicle: parseInt(e.target.value) || 12 }))} />
                      </div>
                      <div>
                        <Label>Price (LE)</Label>
                        <Input type="number" min={0} value={form.price} onChange={e => setForm(p => ({ ...p, price: parseFloat(e.target.value) || 0 }))} />
                      </div>
                    </div>
                    <div className="p-3 bg-muted rounded-lg text-sm">
                      <Bus className="w-4 h-4 inline mr-1" />
                      Total Capacity: <strong>{form.vehicle_count * form.seats_per_vehicle}</strong> seats per trip × <strong>{form.daily_repeats}</strong> repeat(s) = <strong>{form.vehicle_count * form.seats_per_vehicle * form.daily_repeats}</strong> total seats/day
                    </div>
                    <Button type="submit" className="w-full" disabled={createSchedule.isPending}>
                      {createSchedule.isPending ? 'Creating...' : 'Create Schedule'}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <p className="text-center text-muted-foreground py-8">Loading...</p>
              ) : schedules.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No schedules yet. Create one to get started.</p>
              ) : (
                <div className="space-y-3">
                  {schedules.map(schedule => (
                    <ScheduleCard
                      key={schedule.id}
                      schedule={schedule}
                      isExpanded={expandedSchedule === schedule.id}
                      onToggle={() => setExpandedSchedule(expandedSchedule === schedule.id ? null : schedule.id)}
                      onDelete={() => handleDelete(schedule.id)}
                      onGenerate={() => handleGenerate(schedule.id)}
                      onToggleActive={async (active) => {
                        await updateSchedule.mutateAsync({ id: schedule.id, updates: { is_active: active } });
                      }}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trips">
          <TripInstancesView />
        </TabsContent>
      </Tabs>
    </div>
  );
};

// ─── Schedule Card with Stop Times ───

interface ScheduleCardProps {
  schedule: any;
  isExpanded: boolean;
  onToggle: () => void;
  onDelete: () => void;
  onGenerate: () => void;
  onToggleActive: (active: boolean) => void;
}

const ScheduleCard: React.FC<ScheduleCardProps> = ({
  schedule, isExpanded, onToggle, onDelete, onGenerate, onToggleActive,
}) => {
  const totalSeats = schedule.vehicle_count * schedule.seats_per_vehicle;

  return (
    <Card className="border">
      <CardContent className="p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold text-sm sm:text-base truncate">{schedule.title}</h3>
              <Badge variant={schedule.is_active ? 'default' : 'secondary'}>
                {schedule.is_active ? 'Active' : 'Inactive'}
              </Badge>
              <Badge variant="outline">{schedule.recurrence_type}</Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {schedule.route_template?.name || 'Unknown Route'} •{' '}
              {schedule.start_date} → {schedule.end_date} •{' '}
              {schedule.vehicle_count} vehicles × {schedule.seats_per_vehicle} seats = {totalSeats} total •{' '}
              {schedule.price} LE • {schedule.van_type === '12_seats' ? '12-seat van' : '13-seat van'} •{' '}
              {schedule.daily_repeats > 1 ? `${schedule.daily_repeats}x daily` : 'Once daily'}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Switch checked={schedule.is_active} onCheckedChange={onToggleActive} />
            <Button size="sm" variant="outline" onClick={onGenerate}>
              <Zap className="w-3 h-3 mr-1" /> Generate
            </Button>
            <Button size="sm" variant="outline" onClick={onToggle}>
              <Clock className="w-3 h-3 mr-1" /> Times
              {isExpanded ? <ChevronUp className="w-3 h-3 ml-1" /> : <ChevronDown className="w-3 h-3 ml-1" />}
            </Button>
            <Button size="sm" variant="destructive" onClick={onDelete}>
              <Trash2 className="w-3 h-3" />
            </Button>
          </div>
        </div>
        {isExpanded && (
          <div className="mt-4 border-t pt-4">
            <StopTimesEditor scheduleId={schedule.id} routeTemplateId={schedule.route_template_id} />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// ─── Stop Times Editor ───

const StopTimesEditor: React.FC<{ scheduleId: string; routeTemplateId: string }> = ({
  scheduleId, routeTemplateId,
}) => {
  const { data: templateStops = [] } = useRouteTemplateStops(routeTemplateId);
  const { data: existingTimes = [], isLoading } = useScheduleStopTimes(scheduleId);
  const setStopTimes = useSetScheduleStopTimes();

  const [times, setTimes] = useState<Record<string, { arrival: string; departure: string }>>({});
  const [initialized, setInitialized] = useState(false);

  React.useEffect(() => {
    if (!isLoading && !initialized) {
      const initial: Record<string, { arrival: string; departure: string }> = {};
      if (existingTimes.length > 0) {
        existingTimes.forEach(t => {
          initial[t.stop_id] = { arrival: t.arrival_time, departure: t.departure_time || '' };
        });
      } else {
        templateStops.forEach(ts => {
          if (ts.stop) {
            initial[ts.stop_id] = { arrival: '', departure: '' };
          }
        });
      }
      setTimes(initial);
      setInitialized(true);
    }
  }, [isLoading, existingTimes, templateStops, initialized]);

  const handleSave = async () => {
    const stopTimes = templateStops
      .filter(ts => times[ts.stop_id]?.arrival)
      .map(ts => ({
        stop_id: ts.stop_id,
        arrival_time: times[ts.stop_id].arrival,
        departure_time: times[ts.stop_id].departure || null,
        sequence_order: ts.sequence_order,
      }));

    try {
      await setStopTimes.mutateAsync({ scheduleId, stopTimes });
      toast.success('Stop times saved');
    } catch { toast.error('Failed to save times'); }
  };

  if (isLoading) return <p className="text-sm text-muted-foreground">Loading...</p>;

  if (templateStops.length === 0) {
    return <p className="text-sm text-muted-foreground">No stops assigned to this route template. Assign stops first.</p>;
  }

  return (
    <div className="space-y-3">
      <h4 className="font-medium text-sm flex items-center gap-1"><Clock className="w-4 h-4" /> Stop Times</h4>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-xs">#</TableHead>
              <TableHead className="text-xs">Stop</TableHead>
              <TableHead className="text-xs">Role</TableHead>
              <TableHead className="text-xs">Arrival</TableHead>
              <TableHead className="text-xs">Departure</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {templateStops.map(ts => (
              <TableRow key={ts.stop_id}>
                <TableCell className="text-xs">{ts.sequence_order}</TableCell>
                <TableCell className="text-xs font-medium">{ts.stop?.name_en || 'Unknown'}</TableCell>
                <TableCell>
                  <Badge variant="outline" className="text-xs">{ts.stop_role}</Badge>
                </TableCell>
                <TableCell>
                  <Input
                    type="time"
                    className="w-28 h-8 text-xs"
                    value={times[ts.stop_id]?.arrival || ''}
                    onChange={e => setTimes(prev => ({
                      ...prev,
                      [ts.stop_id]: { ...prev[ts.stop_id], arrival: e.target.value },
                    }))}
                  />
                </TableCell>
                <TableCell>
                  <Input
                    type="time"
                    className="w-28 h-8 text-xs"
                    value={times[ts.stop_id]?.departure || ''}
                    onChange={e => setTimes(prev => ({
                      ...prev,
                      [ts.stop_id]: { ...prev[ts.stop_id], departure: e.target.value },
                    }))}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <Button size="sm" onClick={handleSave} disabled={setStopTimes.isPending}>
        {setStopTimes.isPending ? 'Saving...' : 'Save Stop Times'}
      </Button>
    </div>
  );
};

// ─── Trip Instances View ───

const TripInstancesView: React.FC = () => {
  const { data: instances = [], isLoading } = useTripInstances();
  const updateInstance = useUpdateTripInstance();

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await updateInstance.mutateAsync({ id, updates: { status: status as any } });
      toast.success('Trip status updated');
    } catch { toast.error('Failed to update'); }
  };

  const statusColor = (s: string) => {
    switch (s) {
      case 'scheduled': return 'bg-primary/10 text-primary';
      case 'in_progress': return 'bg-warning/10 text-warning';
      case 'completed': return 'bg-success/10 text-success';
      case 'cancelled': return 'bg-destructive/10 text-destructive';
      default: return '';
    }
  };

  return (
    <Card className="border-2 shadow-lg">
      <CardHeader>
        <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
          <Bus className="w-5 h-5" /> Trip Instances
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="text-center text-muted-foreground py-8">Loading...</p>
        ) : instances.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">No trip instances. Generate them from a schedule.</p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Date</TableHead>
                  <TableHead className="text-xs">Route</TableHead>
                  <TableHead className="text-xs">Capacity</TableHead>
                  <TableHead className="text-xs">Available</TableHead>
                  <TableHead className="text-xs">Status</TableHead>
                  <TableHead className="text-xs">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {instances.map(inst => (
                  <TableRow key={inst.id}>
                    <TableCell className="text-xs font-medium">{inst.trip_date}</TableCell>
                    <TableCell className="text-xs">
                      {inst.schedule?.route_template?.name || 'Unknown'}
                    </TableCell>
                    <TableCell className="text-xs">{inst.total_seats}</TableCell>
                    <TableCell className="text-xs font-medium">{inst.available_seats}</TableCell>
                    <TableCell>
                      <Badge className={statusColor(inst.status)}>{inst.status}</Badge>
                    </TableCell>
                    <TableCell>
                      <Select value={inst.status} onValueChange={v => handleStatusChange(inst.id, v)}>
                        <SelectTrigger className="h-7 text-xs w-28">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="scheduled">Scheduled</SelectItem>
                          <SelectItem value="in_progress">In Progress</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SchedulesManager;
