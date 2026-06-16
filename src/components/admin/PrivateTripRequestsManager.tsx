import React from "react";
import { useConfirmDialog } from "@/components/ConfirmDialog";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAllPrivateTrips, STRAPI_URL, type StrapiItem, type PrivateTrip } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Car, Trash2, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

const PrivateTripRequestsManager: React.FC = () => {
  const queryClient = useQueryClient();
  const { confirm } = useConfirmDialog();
  const { t } = useLanguage();
  const { token } = useAuth();

  const { data: requests = [], isLoading } = useQuery({
    queryKey: ["private-trip-requests"],
    queryFn: async () => {
      if (!token) return [];
      return await getAllPrivateTrips(token);
    },
    enabled: !!token,
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      if (!token) throw new Error('No auth token');
      const res = await fetch(`${STRAPI_URL}/api/private-trips/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ data: { status } }),
      });
      if (!res.ok) throw new Error('Failed to update status');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["private-trip-requests"] });
      toast.success(t("privateTrips.statusUpdated"));
    },
    onError: () => toast.error(t("privateTrips.failedToUpdateStatus")),
  });

  const deleteRequest = useMutation({
    mutationFn: async (id: number) => {
      if (!token) throw new Error('No auth token');
      const res = await fetch(`${STRAPI_URL}/api/private-trips/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to delete');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["private-trip-requests"] });
      toast.success(t("privateTrips.requestDeleted"));
    },
    onError: () => toast.error(t("privateTrips.failedToDelete")),
  });

  const statusColor = (s: string) => {
    switch (s) {
      case "new":
        return "bg-warning/10 text-warning";
      case "in_progress":
        return "bg-primary/10 text-primary";
      case "completed":
        return "bg-success/10 text-success";
      default:
        return "";
    }
  };

  return (
    <Card className="border-2 shadow-lg">
      <CardHeader>
        <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
          <Car className="w-5 h-5" />
          {t("privateTrips.title")}
          {requests.filter((r) => r.attributes.status === "new").length > 0 && (
            <Badge className="bg-warning/10 text-warning ml-2">
              {requests.filter((r) => r.attributes.status === "new").length}{" "}
              {t("privateTrips.new")}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="text-center text-muted-foreground py-8">
            {t("common.loading")}
          </p>
        ) : requests.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            {t("privateTrips.noRequests")}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="text-center">
                <TableRow>
                  <TableHead className="text-xs">
                    {t("privateTrips.date")}
                  </TableHead>
                  <TableHead className="text-xs">
                    {t("privateTrips.name")}
                  </TableHead>
                  <TableHead className="text-xs">
                    {t("privateTrips.phone")}
                  </TableHead>
                  <TableHead className="text-xs">
                    {t("privateTrips.pickup")}
                  </TableHead>
                  <TableHead className="text-xs">
                    {t("privateTrips.dropoff")}
                  </TableHead>
                  <TableHead className="text-xs">
                    {t("privateTrips.preferredDate")}
                  </TableHead>
                  <TableHead className="text-xs">
                    {t("privateTrips.notes")}
                  </TableHead>
                  <TableHead className="text-xs">
                    {t("privateTrips.status")}
                  </TableHead>
                  <TableHead className="text-xs">
                    {t("privateTrips.actions")}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="text-center">
                {requests.map((req) => (
                  <TableRow key={req.id}>
                    <TableCell className="text-xs">
                      {format(new Date(req.attributes.createdAt), "MMM dd, hh:mm a")}
                    </TableCell>
                    <TableCell className="text-xs font-medium">
                      {req.attributes.name}
                    </TableCell>
                    <TableCell className="text-xs">{req.attributes.phone}</TableCell>
                    <TableCell className="text-xs">
                      {req.attributes.from_location}
                    </TableCell>
                    <TableCell className="text-xs">
                      {req.attributes.to_location}
                    </TableCell>
                    <TableCell className="text-xs">
                      {req.attributes.requested_date
                        ? format(new Date(req.attributes.requested_date), "MMM dd, yyyy")
                        : "—"}
                    </TableCell>
                    <TableCell className="text-xs max-w-[150px] truncate">
                      {req.attributes.notes || "—"}
                    </TableCell>
                    <TableCell>
                      <Badge className={statusColor(req.attributes.status)}>
                        {req.attributes.status.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Select
                          value={req.attributes.status}
                          onValueChange={(v) =>
                            updateStatus.mutate({ id: req.id, status: v })
                          }
                        >
                          <SelectTrigger className="h-7 text-xs w-28">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="new">New</SelectItem>
                            <SelectItem value="in_progress">In Progress</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 w-7 p-0 text-success hover:text-success"
                          onClick={() => {
                            let phone = req.attributes.phone.replace(/[^0-9]/g, "");
                            if (phone.startsWith("0"))
                              phone = "20" + phone.slice(1);
                            const msg = encodeURIComponent(
                              `Hi ${req.attributes.name}, regarding your private trip request from ${req.attributes.from_location} to ${req.attributes.to_location}...`,
                            );
                            window.open(
                              `https://wa.me/${phone}?text=${msg}`,
                              "_blank",
                            );
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
                              title: t("privateTrips.deleteRequest"),
                              description: t("privateTrips.deleteRequestDesc"),
                              confirmLabel: t("privateTrips.delete"),
                              variant: "destructive",
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
