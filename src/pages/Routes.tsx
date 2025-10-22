import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Route as RouteType, FilterOptions } from '@/types';
import { getRoutes } from '@/services/localStorage';
import { useAuth } from '@/contexts/AuthContext';
import RouteCard from '@/components/RouteCard';
import Navbar from '@/components/Navbar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Filter, MapPin, Calendar } from 'lucide-react';
import { Card } from '@/components/ui/card';

const Routes: React.FC = () => {
  const [routes, setRoutes] = useState<RouteType[]>([]);
  const [filteredRoutes, setFilteredRoutes] = useState<RouteType[]>([]);
  const [filters, setFilters] = useState<FilterOptions>({});
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

  const clearFilters = () => {
    setFilters({});
  };

  const hasActiveFilters = Object.values(filters).some((v) => v !== undefined && v !== '');

  return (
    <div className="min-h-screen bg-gradient-hero">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12 space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground">
            Find Your Perfect Journey
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Book comfortable Hiace van rides to your favorite destinations across Egypt
          </p>
        </div>

        {/* Filters Section */}
        <Card className="p-6 mb-8 border-2 shadow-lg">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">Filter Routes</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Origin city..."
                value={filters.origin || ''}
                onChange={(e) => handleFilterChange('origin', e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Destination city..."
                value={filters.destination || ''}
                onChange={(e) => handleFilterChange('destination', e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="date"
                value={filters.date || ''}
                onChange={(e) => handleFilterChange('date', e.target.value)}
                className="pl-10"
              />
            </div>

            {hasActiveFilters && (
              <Button
                variant="outline"
                onClick={clearFilters}
                className="border-2"
              >
                Clear Filters
              </Button>
            )}
          </div>
        </Card>

        {/* Routes Grid */}
        {filteredRoutes.length === 0 ? (
          <Card className="p-12 text-center border-2">
            <Search className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold text-foreground mb-2">No routes found</h3>
            <p className="text-muted-foreground">
              Try adjusting your filters or check back later for new routes
            </p>
          </Card>
        ) : (
          <>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-foreground">
                Available Routes ({filteredRoutes.length})
              </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredRoutes.map((route) => (
                <RouteCard key={route.id} route={route} onBook={handleBook} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Routes;
