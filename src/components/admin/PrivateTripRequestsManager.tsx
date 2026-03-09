import React from 'react';
import { useConfirmDialog } from '@/components/ConfirmDialog';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Car, Trash2, MessageCircle } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface PrivateTripRequest {
  id: string;
  name: string;
  phone: string;
  number_of_passengers: number;
  pickup_location: string;
  dropoff_location: string;
  preferred_date: string | null;
  notes: string | null;
  status: string;
  created_at: string;
}

const PrivateTripRequestsManager: React.FC = () => {
  const queryClient = useQueryClient();
  const { confirm } = useConfirmDialog();

  const { data: requests = [], isLoading } = useQuery({
    queryKey: ['private-trip-requests'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('private_trip_requests' as any)
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []) as unknown as PrivateTripRequest[];
    },
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase
        .from('private_trip_requests' as any)
        .update({ status } as any)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['private-trip-requests'] });
      toast.success('Status updated');
    },
    onError: () => toast.error('Failed to update status'),
  });

  const deleteRequest = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('private_trip_requests' as any)
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['private-trip-requests'] });
      toast.success('Request deleted');
    },
    onError: () => toast.error('Failed to delete'),
  });

  const statusColor = (s: string) => {
    switch (s) {
      case 'pending': return 'bg-warning/10 text-warning';
      case 'contacted': return 'bg-primary/10 text-primary';
      case 'confirmed': return 'bg-success/10 text-success';
      case 'rejected': return 'bg-destructive/10 text-destructive';
      default: return '';
    }
  };

  return (
    <Card className="border-2 shadow-lg">
      <CardHeader>
        <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
          <Car className="w-5 h-5" /> Private Trip Requests
          {requests.filter(r => r.status === 'pending').length > 0 && (
            <Badge className="bg-warning/10 text-warning ml-2">
              {requests.filter(r => r.status === 'pending').length} new
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="text-center text-muted-foreground py-8">Loading...</p>
        ) : requests.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">No private trip requests yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Date</TableHead>
                  <TableHead className="text-xs">Name</TableHead>
                  <TableHead className="text-xs">Phone</TableHead>
                  <TableHead className="text-xs">Passengers</TableHead>
                  <TableHead className="text-xs">Pickup</TableHead>
                  <TableHead className="text-xs">Dropoff</TableHead>
                  <TableHead className="text-xs">Preferred Date</TableHead>
                  <TableHead className="text-xs">Notes</TableHead>
                  <TableHead className="text-xs">Status</TableHead>
                  <TableHead className="text-xs">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests.map(req => (
                  <TableRow key={req.id}>
                    <TableCell className="text-xs">
                      {format(new Date(req.created_at), 'MMM dd, HH:mm')}
                    </TableCell>
                    <TableCell className="text-xs font-medium">{req.name}</TableCell>
                    <TableCell className="text-xs">{req.phone}</TableCell>
                    <TableCell className="text-xs text-center">{req.number_of_passengers}</TableCell>
                    <TableCell className="text-xs">{req.pickup_location}</TableCell>
                    <TableCell className="text-xs">{req.dropoff_location}</TableCell>
                    <TableCell className="text-xs">
                      {req.preferred_date ? format(new Date(req.preferred_date), 'MMM dd, yyyy') : '—'}
                    </TableCell>
                    <TableCell className="text-xs max-w-[150px] truncate">{req.notes || '—'}</TableCell>
                    <TableCell>
                      <Badge className={statusColor(req.status)}>{req.status}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Select
                          value={req.status}
                          onValueChange={v => updateStatus.mutate({ id: req.id, status: v })}
                        >
                          <SelectTrigger className="h-7 text-xs w-28">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="contacted">Contacted</SelectItem>
                            <SelectItem value="confirmed">Confirmed</SelectItem>
                            <SelectItem value="rejected">Rejected</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 w-7 p-0 text-success hover:text-success"
                          onClick={() => {
                            const phone = req.phone.replace(/[^0-9]/g, '');
                            const msg = encodeURIComponent(`Hi ${req.name}, regarding your private trip request from ${req.pickup_location} to ${req.dropoff_location}...`);
                            window.open(`https://wa.me/${phone}?text=${msg}`, '_blank');
                          }}
                          title="WhatsApp"
                        >
                          <MessageCircle className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          className="h-7 w-7 p-0"
                          onClick={async () => {
                            const confirmed = await confirm({
                              title: 'Delete Request',
                              description: 'This private trip request will be permanently deleted.',
                              confirmLabel: 'Delete',
                              variant: 'destructive',
                            });
                            if (confirmed) deleteRequest.mutate(req.id);
                          }}
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
        )}
      </CardContent>
    </Card>
  );
};

export default PrivateTripRequestsManager;
