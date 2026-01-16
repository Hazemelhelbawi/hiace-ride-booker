import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useRoutes } from '@/hooks/useData';
import RouteCard from '@/components/RouteCard';
import Navbar from '@/components/Navbar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { MapPin, Calendar, Users, Bus, Clock, ThumbsUp, Loader2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import heroImage from '@/assets/hero-van.jpg';
import destinationsImage from '@/assets/egypt-destinations.jpg';

interface FilterOptions {
  origin?: string;
  destination?: string;
  date?: string;
}

const Routes: React.FC = () => {
  const { data: routes = [], isLoading } = useRoutes();
  const [filters, setFilters] = useState<FilterOptions>({});
  const [passengers, setPassengers] = useState(1);
  const { isAuthenticated } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const filteredRoutes = useMemo(() => {
    let filtered = [...routes];

    if (filters.origin) {
      filtered = filtered.filter((r) =>
        r.origin.toLowerCase().includes(filters.origin!.toLowerCase())
      );
    }

    if (filters.destination) {
      filtered = filtered.filter((r) =>
        r.destination.toLowerCase().includes(filters.destination!.toLowerCase())
      );
    }

    if (filters.date) {
      filtered = filtered.filter((r) => r.date === filters.date);
    }

    return filtered;
  }, [filters, routes]);

  const handleBook = (route: typeof routes[0]) => {
    if (!isAuthenticated) {
      navigate('/auth', { state: { from: '/', routeId: route.id } });
      return;
    }
    navigate(`/booking/${route.id}`);
  };

  const handleFilterChange = (key: keyof FilterOptions, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value || undefined }));
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative h-[650px] flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroImage})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary/80 via-primary/60 to-accent/50"></div>
        </div>

        <div className="relative z-10 container mx-auto px-4">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
              <Bus className="w-5 h-5 text-white" />
              <span className="text-white/90 text-sm font-medium">Trusted by 10,000+ travelers</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-black text-white mb-6 tracking-tight leading-tight">
              {t('hero.title')}
            </h1>
            <p className="text-white/90 text-xl md:text-2xl font-medium max-w-2xl mx-auto">
              {t('hero.subtitle')}
            </p>
          </div>

          <Card className="max-w-5xl mx-auto bg-card/95 backdrop-blur-lg border-0 shadow-2xl p-8 rounded-2xl">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="space-y-2">
                <label className="text-foreground text-sm font-medium block">{t('search.pickupLocation')}</label>
                <div className="relative">
                  <MapPin className="absolute start-3 top-1/2 -translate-y-1/2 w-5 h-5 text-primary" />
                  <Input
                    placeholder={t('search.pickupLocation')}
                    value={filters.origin || ''}
                    onChange={(e) => handleFilterChange('origin', e.target.value)}
                    className="ps-10 bg-secondary border-border h-12 text-foreground rounded-xl focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-foreground text-sm font-medium block">{t('search.dropoffLocation')}</label>
                <div className="relative">
                  <MapPin className="absolute start-3 top-1/2 -translate-y-1/2 w-5 h-5 text-primary" />
                  <Input
                    placeholder={t('search.dropoffLocation')}
                    value={filters.destination || ''}
                    onChange={(e) => handleFilterChange('destination', e.target.value)}
                    className="ps-10 bg-secondary border-border h-12 text-foreground rounded-xl focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-foreground text-sm font-medium block">{t('search.quantity')}</label>
                <div className="relative">
                  <Users className="absolute start-3 top-1/2 -translate-y-1/2 w-5 h-5 text-primary" />
                  <Input
                    type="number"
                    min="1"
                    max="12"
                    value={passengers}
                    onChange={(e) => setPassengers(Number(e.target.value))}
                    placeholder={t('search.howManyPeople')}
                    className="ps-10 bg-secondary border-border h-12 text-foreground rounded-xl focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
              <div className="space-y-2">
                <label className="text-foreground text-sm font-medium block">{t('search.departureDate')}</label>
                <div className="relative">
                  <Calendar className="absolute start-3 top-1/2 -translate-y-1/2 w-5 h-5 text-primary" />
                  <Input
                    type="date"
                    value={filters.date || ''}
                    onChange={(e) => handleFilterChange('date', e.target.value)}
                    className="ps-10 bg-secondary border-border h-12 text-foreground rounded-xl focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <Button 
                className="h-12 bg-primary hover:bg-primary-dark text-white font-bold text-lg w-full rounded-xl shadow-lg hover:shadow-xl transition-all"
                onClick={() => document.getElementById('routes')?.scrollIntoView({ behavior: 'smooth' })}
              >
                {t('hero.findTransfer')}
              </Button>
            </div>
          </Card>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-card">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Why Choose BookBus?</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">Experience the best way to travel across Egypt</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div className="text-center group">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-primary-light flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 transition-transform">
                <Bus className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">{t('features.routeAvailability')}</h3>
              <p className="text-muted-foreground leading-relaxed">{t('features.routeAvailabilityDesc')}</p>
            </div>

            <div className="text-center group">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-accent to-accent-light flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 transition-transform">
                <Clock className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">{t('features.comfort')}</h3>
              <p className="text-muted-foreground leading-relaxed">{t('features.comfortDesc')}</p>
            </div>

            <div className="text-center group">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 transition-transform">
                <ThumbsUp className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">{t('features.pricing')}</h3>
              <p className="text-muted-foreground leading-relaxed">{t('features.pricingDesc')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Destinations Section */}
      <section className="py-24 bg-secondary">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="order-2 lg:order-1">
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full mb-6 font-medium">
                <MapPin className="w-4 h-4" />
                Explore Egypt
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-foreground mb-6 leading-tight">{t('destinations.title')}</h2>
              <p className="text-lg text-muted-foreground leading-relaxed mb-8">{t('destinations.description')}</p>
              <Button 
                className="bg-primary hover:bg-primary-dark text-white font-bold text-lg px-8 py-6 h-auto rounded-xl shadow-lg hover:shadow-xl transition-all"
                onClick={() => document.getElementById('routes')?.scrollIntoView({ behavior: 'smooth' })}
              >
                {t('destinations.exploreRoutes')}
              </Button>
            </div>
            <div className="order-1 lg:order-2">
              <img 
                src={destinationsImage} 
                alt="Egyptian Destinations" 
                className="rounded-3xl shadow-2xl w-full"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Routes Grid */}
      <section id="routes" className="py-24 bg-card">
        <div className="container mx-auto px-4">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-black text-foreground mb-4">{t('routes.title')}</h2>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">{t('routes.subtitle')}</p>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-10 h-10 animate-spin text-primary" />
            </div>
          ) : filteredRoutes.length === 0 ? (
            <Card className="p-12 text-center border-2 border-dashed rounded-2xl">
              <Bus className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold text-foreground mb-2">{t('routes.noRoutes')}</h3>
              <p className="text-muted-foreground">{t('routes.noRoutesDesc')}</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredRoutes.map((route) => (
                <RouteCard key={route.id} route={route} onBook={() => handleBook(route)} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Routes;
