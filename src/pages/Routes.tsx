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
      <section className="relative h-[600px] flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroImage})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/70"></div>
        </div>

        <div className="relative z-10 container mx-auto px-4">
          <div className="text-center mb-8">
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-4 tracking-tight">
              {t('hero.title')}
            </h1>
            <div className="inline-block bg-primary px-6 py-3">
              <p className="text-white text-xl md:text-2xl font-semibold">
                {t('hero.subtitle')}
              </p>
            </div>
          </div>

          <Card className="max-w-5xl mx-auto bg-search-bg border-0 shadow-2xl p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="space-y-2">
                <label className="text-white text-sm font-medium block">{t('search.pickupLocation')}</label>
                <div className="relative">
                  <MapPin className="absolute start-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    placeholder={t('search.pickupLocation')}
                    value={filters.origin || ''}
                    onChange={(e) => handleFilterChange('origin', e.target.value)}
                    className="ps-10 bg-white border-0 h-12 text-foreground"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-white text-sm font-medium block">{t('search.dropoffLocation')}</label>
                <div className="relative">
                  <MapPin className="absolute start-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    placeholder={t('search.dropoffLocation')}
                    value={filters.destination || ''}
                    onChange={(e) => handleFilterChange('destination', e.target.value)}
                    className="ps-10 bg-white border-0 h-12 text-foreground"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-white text-sm font-medium block">{t('search.quantity')}</label>
                <div className="relative">
                  <Users className="absolute start-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    type="number"
                    min="1"
                    max="12"
                    value={passengers}
                    onChange={(e) => setPassengers(Number(e.target.value))}
                    placeholder={t('search.howManyPeople')}
                    className="ps-10 bg-white border-0 h-12 text-foreground"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
              <div className="space-y-2">
                <label className="text-white text-sm font-medium block">{t('search.departureDate')}</label>
                <div className="relative">
                  <Calendar className="absolute start-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    type="date"
                    value={filters.date || ''}
                    onChange={(e) => handleFilterChange('date', e.target.value)}
                    className="ps-10 bg-white border-0 h-12 text-foreground"
                  />
                </div>
              </div>

              <Button 
                className="h-12 bg-primary hover:bg-primary-dark text-white font-bold text-lg w-full"
                onClick={() => document.getElementById('routes')?.scrollIntoView({ behavior: 'smooth' })}
              >
                {t('hero.findTransfer')}
              </Button>
            </div>
          </Card>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Bus className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-4">{t('features.routeAvailability')}</h3>
              <p className="text-muted-foreground leading-relaxed">{t('features.routeAvailabilityDesc')}</p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Clock className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-4">{t('features.comfort')}</h3>
              <p className="text-muted-foreground leading-relaxed">{t('features.comfortDesc')}</p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center mx-auto mb-6 shadow-lg">
                <ThumbsUp className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-4">{t('features.pricing')}</h3>
              <p className="text-muted-foreground leading-relaxed">{t('features.pricingDesc')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Destinations Section */}
      <section className="py-20 bg-muted">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <img 
                src={destinationsImage} 
                alt="Egyptian Destinations" 
                className="rounded-2xl shadow-2xl w-full"
              />
            </div>
            <div>
              <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">{t('destinations.title')}</h2>
              <p className="text-lg text-muted-foreground leading-relaxed mb-8">{t('destinations.description')}</p>
              <Button 
                className="bg-primary hover:bg-primary-dark text-white font-bold text-lg px-8 py-6 h-auto"
                onClick={() => document.getElementById('routes')?.scrollIntoView({ behavior: 'smooth' })}
              >
                {t('destinations.exploreRoutes')}
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Routes Grid */}
      <section id="routes" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-foreground mb-4">{t('routes.title')}</h2>
            <p className="text-lg text-muted-foreground">{t('routes.subtitle')}</p>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : filteredRoutes.length === 0 ? (
            <Card className="p-12 text-center border-2">
              <Bus className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold text-foreground mb-2">{t('routes.noRoutes')}</h3>
              <p className="text-muted-foreground">{t('routes.noRoutesDesc')}</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
