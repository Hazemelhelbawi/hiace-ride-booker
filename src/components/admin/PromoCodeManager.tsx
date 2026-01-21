import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  usePromoCodes,
  useCreatePromoCode,
  useUpdatePromoCode,
  useDeletePromoCode,
  type PromoCode,
} from '@/hooks/usePromoCodes';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Plus, Trash2, Edit, Tag, Percent } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface PromoFormData {
  code: string;
  discount_percent: number;
  is_active: boolean;
  expires_at: string;
  max_uses: string;
}

const PromoCodeManager: React.FC = () => {
  const { t } = useLanguage();
  const { data: promoCodes = [], isLoading } = usePromoCodes();
  const createPromoCode = useCreatePromoCode();
  const updatePromoCode = useUpdatePromoCode();
  const deletePromoCode = useDeletePromoCode();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPromo, setEditingPromo] = useState<PromoCode | null>(null);
  const [formData, setFormData] = useState<PromoFormData>({
    code: '',
    discount_percent: 10,
    is_active: true,
    expires_at: '',
    max_uses: '',
  });

  const resetForm = () => {
    setFormData({
      code: '',
      discount_percent: 10,
      is_active: true,
      expires_at: '',
      max_uses: '',
    });
    setEditingPromo(null);
  };

  const openEditDialog = (promo: PromoCode) => {
    setEditingPromo(promo);
    setFormData({
      code: promo.code,
      discount_percent: promo.discount_percent,
      is_active: promo.is_active,
      expires_at: promo.expires_at ? promo.expires_at.split('T')[0] : '',
      max_uses: promo.max_uses?.toString() || '',
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const data = {
        code: formData.code.toUpperCase(),
        discount_percent: formData.discount_percent,
        is_active: formData.is_active,
        expires_at: formData.expires_at ? new Date(formData.expires_at).toISOString() : null,
        max_uses: formData.max_uses ? parseInt(formData.max_uses) : null,
      };

      if (editingPromo) {
        await updatePromoCode.mutateAsync({ id: editingPromo.id, updates: data });
        toast.success(t('admin.promoUpdated'));
      } else {
        await createPromoCode.mutateAsync(data);
        toast.success(t('admin.promoAdded'));
      }

      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      toast.error(t('common.error'));
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t('admin.confirmDeletePromo'))) return;

    try {
      await deletePromoCode.mutateAsync(id);
      toast.success(t('admin.promoDeleted'));
    } catch (error) {
      toast.error(t('common.error'));
    }
  };

  const handleToggleActive = async (promo: PromoCode) => {
    try {
      await updatePromoCode.mutateAsync({
        id: promo.id,
        updates: { is_active: !promo.is_active },
      });
      toast.success(promo.is_active ? t('admin.promoDeactivated') : t('admin.promoActivated'));
    } catch (error) {
      toast.error(t('common.error'));
    }
  };

  if (isLoading) {
    return <p className="text-center text-muted-foreground">{t('common.loading')}</p>;
  }

  return (
    <Card className="border-2 shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Tag className="w-5 h-5" />
          {t('admin.promoCodes')}
        </CardTitle>
        <Dialog
          open={isDialogOpen}
          onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetForm();
          }}
        >
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary-dark text-white gap-2">
              <Plus className="w-4 h-4" />
              {t('admin.addPromo')}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingPromo ? t('admin.editPromo') : t('admin.addPromo')}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="code">{t('admin.promoCode')}</Label>
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) => setFormData((prev) => ({ ...prev, code: e.target.value.toUpperCase() }))}
                  placeholder="e.g., SUMMER20"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="discount">{t('admin.discountPercent')}</Label>
                <div className="relative">
                  <Input
                    id="discount"
                    type="number"
                    min="1"
                    max="100"
                    value={formData.discount_percent}
                    onChange={(e) => setFormData((prev) => ({ ...prev, discount_percent: parseInt(e.target.value) || 0 }))}
                    required
                  />
                  <Percent className="absolute end-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="expires">{t('admin.expiresAt')}</Label>
                <Input
                  id="expires"
                  type="date"
                  value={formData.expires_at}
                  onChange={(e) => setFormData((prev) => ({ ...prev, expires_at: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxUses">{t('admin.maxUses')}</Label>
                <Input
                  id="maxUses"
                  type="number"
                  min="1"
                  value={formData.max_uses}
                  onChange={(e) => setFormData((prev) => ({ ...prev, max_uses: e.target.value }))}
                  placeholder={t('admin.unlimited')}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="active">{t('admin.isActive')}</Label>
                <Switch
                  id="active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, is_active: checked }))}
                />
              </div>

              <Button type="submit" className="w-full bg-primary hover:bg-primary-dark text-white">
                {editingPromo ? t('admin.updatePromo') : t('admin.addPromo')}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('admin.promoCode')}</TableHead>
                <TableHead>{t('admin.discount')}</TableHead>
                <TableHead>{t('admin.uses')}</TableHead>
                <TableHead>{t('admin.expires')}</TableHead>
                <TableHead>{t('admin.status')}</TableHead>
                <TableHead>{t('admin.actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {promoCodes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    {t('admin.noPromoCodes')}
                  </TableCell>
                </TableRow>
              ) : (
                promoCodes.map((promo) => (
                  <TableRow key={promo.id}>
                    <TableCell>
                      <code className="px-2 py-1 bg-primary/10 text-primary rounded font-mono font-bold">
                        {promo.code}
                      </code>
                    </TableCell>
                    <TableCell className="font-semibold text-primary">
                      {promo.discount_percent}%
                    </TableCell>
                    <TableCell>
                      {promo.current_uses} / {promo.max_uses || '∞'}
                    </TableCell>
                    <TableCell className="text-sm">
                      {promo.expires_at
                        ? format(new Date(promo.expires_at), 'MMM dd, yyyy')
                        : t('admin.noExpiry')}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={promo.is_active}
                          onCheckedChange={() => handleToggleActive(promo)}
                        />
                        <Badge className={promo.is_active ? 'bg-success text-success-foreground' : 'bg-muted text-muted-foreground'}>
                          {promo.is_active ? t('admin.active') : t('admin.inactive')}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openEditDialog(promo)}
                          className="gap-1"
                        >
                          <Edit className="w-3 h-3" />
                          {t('admin.edit')}
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(promo.id)}
                          className="gap-1"
                        >
                          <Trash2 className="w-3 h-3" />
                          {t('admin.delete')}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default PromoCodeManager;
