import React, { useState } from 'react';
import { createPrivateTrip } from '@/services/api';
import { useLanguage } from '@/contexts/LanguageContext';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Car, Check, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const PrivateTripRequest: React.FC = () => {
  const { t } = useLanguage();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    name: '',
    phone: '',
    from_location: '',
    to_location: '',
    requested_date: '',
    notes: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.phone.trim() || !form.from_location.trim() || !form.to_location.trim()) {
      toast.error(t('booking.fillRequired') || 'Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    try {
      await createPrivateTrip({
        name: form.name.trim(),
        phone: form.phone.trim(),
        from_location: form.from_location.trim(),
        to_location: form.to_location.trim(),
        requested_date: form.requested_date || new Date().toISOString().split('T')[0],
        notes: form.notes.trim() || undefined,
      });

      setSubmitted(true);
      toast.success(t('common.success') || 'Request submitted successfully!');
    } catch (error) {
      console.error('Error submitting request:', error);
      toast.error(t('common.error') || 'Failed to submit request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-hero">
        <Navbar />
        <div className="container mx-auto px-4 py-16 max-w-lg">
          <Card className="border-2 shadow-lg text-center">
            <CardContent className="p-10 space-y-4">
              <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto">
                <Check className="w-8 h-8 text-success" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">
                {t('privateTrip.successTitle') || 'Request Submitted!'}
              </h2>
              <p className="text-muted-foreground">
                {t('privateTrip.successMessage') || "We've received your private trip request. Our team will contact you soon to confirm the details."}
                {' '}<strong>{form.phone}</strong>
              </p>
              <Button onClick={() => { setSubmitted(false); setForm({ name: '', phone: '', from_location: '', to_location: '', requested_date: '', notes: '' }); }} variant="outline">
                {t('privateTrip.submitAnother') || 'Submit Another Request'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-hero">
      <Navbar />
      <div className="container mx-auto px-4 py-8 max-w-lg">
        <Card className="border-2 shadow-lg">
          <CardHeader className="border-b bg-primary text-primary-foreground">
            <CardTitle className="text-xl flex items-center gap-2">
              <Car className="w-5 h-5" /> {t('privateTrip.title') || 'Request a Private Trip'}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground mb-6">
              {t('privateTrip.subtitle') || "Need a private trip? Fill out this form and we'll get back to you with a quote."}
            </p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">{t('privateTrip.name') || 'Name'} *</Label>
                <Input
                  id="name"
                  value={form.name}
                  onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                  placeholder={t('booking.enterName') || 'Your full name'}
                  maxLength={100}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">{t('privateTrip.phone') || 'Phone'} *</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={form.phone}
                  onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                  placeholder="+20 1XX XXX XXXX"
                  maxLength={20}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="from_location">{t('privateTrip.pickup') || 'From Location'} *</Label>
                <Input
                  id="from_location"
                  value={form.from_location}
                  onChange={e => setForm(p => ({ ...p, from_location: e.target.value }))}
                  placeholder={t('search.pickupLocation') || 'e.g., Cairo, Dokki'}
                  maxLength={200}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="to_location">{t('privateTrip.dropoff') || 'To Location'} *</Label>
                <Input
                  id="to_location"
                  value={form.to_location}
                  onChange={e => setForm(p => ({ ...p, to_location: e.target.value }))}
                  placeholder={t('search.dropoffLocation') || 'e.g., Dahab, South Sinai'}
                  maxLength={200}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="date">{t('privateTrip.preferredDate') || 'Preferred Date'} *</Label>
                <Input
                  id="date"
                  type="date"
                  value={form.requested_date}
                  onChange={e => setForm(p => ({ ...p, requested_date: e.target.value }))}
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">{t('privateTrip.notes') || 'Additional Notes'}</Label>
                <Textarea
                  id="notes"
                  value={form.notes}
                  onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
                  placeholder={t('privateTrip.notesPlaceholder') || 'Any special requirements...'}
                  maxLength={500}
                  rows={3}
                />
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-12 text-base font-semibold gap-2"
              >
                {isSubmitting ? (
                  <><Loader2 className="w-5 h-5 animate-spin" /> {t('privateTrip.submitting') || 'Submitting...'}</>
                ) : (
                  <><Car className="w-5 h-5" /> {t('privateTrip.submit') || 'Submit Request'}</>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PrivateTripRequest;
