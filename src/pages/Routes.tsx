import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Route as RouteType, FilterOptions } from '@/types';
import { getRoutes } from '@/services/localStorage';
import { useAuth } from '@/contexts/AuthContext';
import RouteCard from '@/components/RouteCard';
import Navbar from '@/components/Navbar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { MapPin, Calendar, Users, Bus, Clock, ThumbsUp } from 'lucide-react';
import { Card } from '@/components/ui/card';
import heroImage from '@/assets/hero-van.jpg';
import destinationsImage from '@/assets/egypt-destinations.jpg';

const Routes: React.FC = () => {
  const [routes, setRoutes] = useState<RouteType[]>([]);
  const [filteredRoutes, setFilteredRoutes] = useState<RouteType[]>([]);
  const [filters, setFilters] = useState<FilterOptions>({});
  const [passengers, setPassengers] = useState(1);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const loadRoutes = () => {
      const allRoutes = getRoutes();
      setRoutes(allRoutes);
      setFilteredRoutes(allRoutes);
    };
    loadRoutes();
  }, []);

  useEffect(() => {
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

    setFilteredRoutes(filtered);
  }, [filters, routes]);

  const handleBook = (route: RouteType) => {
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

        {/* Hero Content */}
        <div className="relative z-10 container mx-auto px-4">
          <div className="text-center mb-8">
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-4 tracking-tight">
              WEBUS
            </h1>
            <div className="inline-block bg-primary px-6 py-3">
              <p className="text-white text-xl md:text-2xl font-semibold">
                You've come to the right place
              </p>
            </div>
          </div>

          {/* Search Box */}
          <Card className="max-w-5xl mx-auto bg-search-bg border-0 shadow-2xl p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="space-y-2">
                <label className="text-white text-sm font-medium block">Pick up location</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    placeholder="Pick up location"
                    value={filters.origin || ''}
                    onChange={(e) => handleFilterChange('origin', e.target.value)}
                    className="pl-10 bg-white border-0 h-12 text-foreground"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-white text-sm font-medium block">Drop off location</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    placeholder="Drop off location"
                    value={filters.destination || ''}
                    onChange={(e) => handleFilterChange('destination', e.target.value)}
                    className="pl-10 bg-white border-0 h-12 text-foreground"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-white text-sm font-medium block">Quantity</label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    type="number"
                    min="1"
                    max="12"
                    value={passengers}
                    onChange={(e) => setPassengers(Number(e.target.value))}
                    placeholder="How many people?"
                    className="pl-10 bg-white border-0 h-12 text-foreground"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
              <div className="space-y-2">
                <label className="text-white text-sm font-medium block">Departure date</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    type="date"
                    value={filters.date || ''}
                    onChange={(e) => handleFilterChange('date', e.target.value)}
                    className="pl-10 bg-white border-0 h-12 text-foreground"
                  />
                </div>
              </div>

              <Button 
                className="h-12 bg-primary hover:bg-primary-dark text-white font-bold text-lg w-full"
                onClick={() => document.getElementById('routes')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Find a transfer
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
              <h3 className="text-2xl font-bold text-foreground mb-4">Route Availability</h3>
              <p className="text-muted-foreground leading-relaxed">
                Provides a vast network throughout Egypt, linking major cities like Cairo, Hurghada, Dahab, Taba, and Sharm El Sheikh.
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Clock className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-4">Comfort</h3>
              <p className="text-muted-foreground leading-relaxed">
                Basic comfort levels with reclining seats, air conditioning, and standard amenities.
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center mx-auto mb-6 shadow-lg">
                <ThumbsUp className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-4">Pricing</h3>
              <p className="text-muted-foreground leading-relaxed">
                Affordable, with dynamic pricing based on demand and route.
              </p>
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
              <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
                Your Journey, Your Comfort—Book Now!
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed mb-8">
                Experience the best of Egypt's transportation services. From the bustling streets of Cairo to the serene beaches of the Red Sea, we connect you to your destination with comfort and reliability.
              </p>
              <Button 
                className="bg-primary hover:bg-primary-dark text-white font-bold text-lg px-8 py-6 h-auto"
                onClick={() => document.getElementById('routes')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Explore Routes
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Routes Grid */}
      <section id="routes" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-foreground mb-4">Available Routes</h2>
            <p className="text-lg text-muted-foreground">
              Choose your destination and book your seat
            </p>
          </div>

          {filteredRoutes.length === 0 ? (
            <Card className="p-12 text-center border-2">
              <Bus className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold text-foreground mb-2">No routes found</h3>
              <p className="text-muted-foreground">
                Try adjusting your filters or check back later for new routes
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredRoutes.map((route) => (
                <RouteCard key={route.id} route={route} onBook={handleBook} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Routes;
