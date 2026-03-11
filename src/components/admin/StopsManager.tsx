import React, { useState } from "react";
import { useConfirmDialog } from "@/components/ConfirmDialog";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  useStops,
  useCreateStop,
  useUpdateStop,
  useDeleteStop,
} from "@/hooks/useStopsData";
import type { Stop } from "@/services/stopsApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Edit, Trash2, MapPin, Search } from "lucide-react";
import { toast } from "sonner";

const REGIONS = [
  "Cairo",
  "South Sinai",
  "North Sinai",
  "Red Sea",
  "Alexandria",
  "Giza",
  "Suez",
  "Ismailia",
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
  name_ar: "",
  name_en: "",
  region: "",
  city: "",
  address: "",
  latitude: "",
  longitude: "",
};

const StopsManager: React.FC = () => {
  const { t, language } = useLanguage();
  const { data: stops = [], isLoading } = useStops(true);
  const createStop = useCreateStop();
  const updateStop = useUpdateStop();
  const deleteStop = useDeleteStop();
  const { confirm } = useConfirmDialog();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingStop, setEditingStop] = useState<Stop | null>(null);
  const [form, setForm] = useState<StopFormData>(emptyForm);
  const [searchQuery, setSearchQuery] = useState("");
  const [regionFilter, setRegionFilter] = useState<string>("all");

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
      address: stop.address || "",
      latitude: stop.latitude?.toString() || "",
      longitude: stop.longitude?.toString() || "",
    });
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name_en || !form.name_ar || !form.region || !form.city) {
      toast.error(t("stops.fillRequiredFields"));
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
        toast.success(t("stops.stopUpdated"));
      } else {
        await createStop.mutateAsync(payload);
        toast.success(t("stops.stopCreated"));
      }
      setDialogOpen(false);
      resetForm();
    } catch {
      toast.error(t("stops.failedToSave"));
    }
  };

  const handleToggleActive = async (stop: Stop) => {
    try {
      await updateStop.mutateAsync({
        id: stop.id,
        updates: { is_active: !stop.is_active },
      });
      toast.success(
        stop.is_active ? t("stops.stopDeactivated") : t("stops.stopActivated"),
      );
    } catch {
      toast.error(t("stops.failedToUpdate"));
    }
  };

  const handleDelete = async (id: string) => {
    const confirmed = await confirm({
      title: t("stops.deleteStop"),
      description: t("stops.deleteStopDesc"),
      confirmLabel: t("stops.delete"),
      variant: "destructive",
    });
    if (!confirmed) return;
    try {
      await deleteStop.mutateAsync(id);
      toast.success(t("stops.stopDeleted"));
    } catch {
      toast.error(t("stops.failedToDelete"));
    }
  };

  const filteredStops = stops.filter((s) => {
    const matchesSearch =
      s.name_en.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.name_ar.includes(searchQuery) ||
      s.city.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRegion = regionFilter === "all" || s.region === regionFilter;
    return matchesSearch && matchesRegion;
  });

  const regions = [...new Set(filteredStops.map((s) => s.region))].sort();

  if (isLoading) {
    return (
      <p className="text-center text-muted-foreground py-8">
        {t("common.loading")}
      </p>
    );
  }

  return (
    <Card className="border-2 shadow-lg">
      <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
          <MapPin className="w-5 h-5 text-primary" />
          {t("stops.stopsManagement")}
        </CardTitle>
        <Dialog
          open={dialogOpen}
          onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) resetForm();
          }}
        >
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary-dark text-white gap-2">
              <Plus className="w-4 h-4" />
              {t("stops.addStop")}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>
                {editingStop ? t("stops.editStop") : t("stops.addNewStop")}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t("stops.nameEn")} *</Label>
                  <Input
                    value={form.name_en}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, name_en: e.target.value }))
                    }
                    placeholder="e.g., Dokki"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t("stops.nameAr")} *</Label>
                  <Input
                    dir="rtl"
                    value={form.name_ar}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, name_ar: e.target.value }))
                    }
                    placeholder="مثلاً: الدقي"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t("stops.region")} *</Label>
                  <Select
                    value={form.region}
                    onValueChange={(v) => setForm((p) => ({ ...p, region: v }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t("stops.selectRegion")} />
                    </SelectTrigger>
                    <SelectContent>
                      {REGIONS.map((r) => (
                        <SelectItem key={r} value={r}>
                          {r}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>{t("stops.city")} *</Label>
                  <Input
                    value={form.city}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, city: e.target.value }))
                    }
                    placeholder="e.g., Cairo"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>{t("stops.address")}</Label>
                <Input
                  value={form.address}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, address: e.target.value }))
                  }
                  placeholder={t("stops.addressPlaceholder")}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t("stops.latitude")}</Label>
                  <Input
                    type="number"
                    step="any"
                    value={form.latitude}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, latitude: e.target.value }))
                    }
                    placeholder="30.0444"
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t("stops.longitude")}</Label>
                  <Input
                    type="number"
                    step="any"
                    value={form.longitude}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, longitude: e.target.value }))
                    }
                    placeholder="31.2357"
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary-dark text-white"
              >
                {editingStop ? t("stops.updateStop") : t("stops.createStop")}
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
              placeholder={t("stops.searchStops")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select value={regionFilter} onValueChange={setRegionFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder={t("stops.filterByRegion")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("stops.allRegions")}</SelectItem>
              {REGIONS.map((r) => (
                <SelectItem key={r} value={r}>
                  {r}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {regions.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            {t("stops.noStopsFound")}
          </p>
        ) : (
          <div className="space-y-6">
            {regions.map((region) => {
              const regionStops = filteredStops.filter(
                (s) => s.region === region,
              );
              return (
                <div key={region}>
                  <div className="flex items-center gap-2 mb-3">
                    <Badge
                      variant="outline"
                      className="text-sm font-semibold px-3 py-1"
                    >
                      {region}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      ({regionStops.length}{" "}
                      {regionStops.length !== 1
                        ? t("stops.stopsPlural")
                        : t("stops.stopSingular")}
                      )
                    </span>
                  </div>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-center">
                            {t("stops.nameEnCol")}
                          </TableHead>
                          <TableHead className="text-center">
                            {t("stops.nameArCol")}
                          </TableHead>
                          <TableHead className="text-center">
                            {t("stops.city")}
                          </TableHead>
                          <TableHead className="text-center">
                            {t("stops.statusCol")}
                          </TableHead>
                          <TableHead className="text-center">
                            {t("stops.actionsCol")}
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {regionStops.map((stop) => (
                          <TableRow
                            key={stop.id}
                            className={!stop.is_active ? "opacity-50" : ""}
                          >
                            <TableCell className="font-medium text-center">
                              {stop.name_en}
                            </TableCell>
                            <TableCell className="text-center" dir="rtl">
                              {stop.name_ar}
                            </TableCell>
                            <TableCell className="text-center text-sm text-muted-foreground">
                              {stop.city}
                            </TableCell>
                            <TableCell className="text-center">
                              <div className="flex items-center justify-center gap-2">
                                <Switch
                                  checked={stop.is_active}
                                  onCheckedChange={() =>
                                    handleToggleActive(stop)
                                  }
                                />
                                <span
                                  className={`text-xs ${stop.is_active ? "text-success" : "text-muted-foreground"}`}
                                >
                                  {stop.is_active
                                    ? t("stops.active")
                                    : t("stops.inactive")}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className="text-center">
                              <div className="flex items-center justify-center gap-2 ">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => openEdit(stop)}
                                  className="gap-1"
                                >
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
