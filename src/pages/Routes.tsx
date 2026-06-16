import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { getStops, getTrips, STRAPI_URL, type StrapiItem, type Stop, type Trip } from "@/services/api";
import Navbar from "@/components/Navbar";
import PromoBanner from "@/components/PromoBanner";
import Gallery from "@/components/Gallery";
import Testimonials from "@/components/Testimonials";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  MapPin,
  Calendar,
  Users,
  Bus,
  Clock,
  ThumbsUp,
  Loader2,
  Car,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import hero from "@/assets/hero.png";
import logoImage from "@/assets/logo.png";
import aboutImage from "@/assets/about.png";

interface FilterOptions {
  direction?: 'cairo_sinai' | 'sinai_cairo';
  date?: string;
}

const Routes: React.FC = () => {
  const [stops, setStops] = useState<StrapiItem<Stop>[]>([]);
  const [trips, setTrips] = useState<StrapiItem<Trip>[]>([]);
  const [filters, setFilters] = useState<FilterOptions>({});
  const [passengers, setPassengers] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const { isAuthenticated } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  // Fetch stops on mount
  useEffect(() => {
    const fetchStops = async () => {
      try {
        const stopsData = await getStops();
        setStops(stopsData);
      } catch (error) {
        console.error('Error fetching stops:', error);
      }
    };

    fetchStops();
  }, []);

  // Get unique regions for origin/destination  
  const cairoStops = stops.filter(s => s.attributes.region === 'cairo');
  const sinaiStops = stops.filter(s => s.attributes.region === 'south_sinai');

  const handleSearch = async () => {
    if (!filters.direction) {
      return;
    }

    setIsLoading(true);
    try {
      const tripsData = await getTrips(filters);
      setTrips(tripsData);
    } catch (error) {
      console.error('Error fetching trips:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDirectionChange = (value: string) => {
    if (value === 'all') {
      setFilters(prev => ({ ...prev, direction: undefined }));
    } else {
      setFilters(prev => ({ ...prev, direction: value as 'cairo_sinai' | 'sinai_cairo' }));
    }
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters(prev => ({ ...prev, date: e.target.value || undefined }));
  };

  const handleBookTrip = (trip: StrapiItem<Trip>) => {
    if (!isAuthenticated) {
      navigate("/auth", { state: { from: "/", tripId: trip.id } });
      return;
    }
    navigate(`/booking/${trip.id}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <PromoBanner />
      <Navbar />

      {/* Hero Section */}
      <section className="relative min-h-[650px] py-8 flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${hero})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary/80 via-primary/60 to-accent/50"></div>
        </div>

        <div className="relative z-10 container mx-auto px-4">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
              <Bus className="w-5 h-5 text-white" />
              <span className="text-white/90 text-sm font-medium">
                {t("hero.trustedBy10000Travelers")}
              </span>
            </div>
            <div className="flex items-center justify-center">
              <img src={logoImage} alt="logo" />
            </div>
            <h1 className="text-5xl md:text-7xl font-black text-white mb-6 tracking-tight leading-tight">
              {t("hero.title")}
            </h1>
            <p className="text-white/90 text-xl md:text-2xl font-medium max-w-2xl mx-auto">
              {t("hero.subtitle")}
            </p>
          </div>

          <Card className="max-w-5xl mx-auto bg-card/95 backdrop-blur-lg border-0 shadow-2xl p-4 sm:p-6 md:p-8 rounded-2xl">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
              <div className="space-y-2">
                <label className="text-foreground text-sm font-medium block">
                  {t("search.direction") || "Direction"}
                </label>
                <div className="relative">
                  <MapPin className="absolute start-3 top-1/2 -translate-y-1/2 w-5 h-5 text-primary z-10" />
                  <Select
                    value={filters.direction || "all"}
                    onValueChange={handleDirectionChange}
                  >
                    <SelectTrigger className="ps-10 bg-secondary border-border h-12 text-foreground rounded-xl focus:ring-2 focus:ring-primary">
                      <SelectValue placeholder={t("search.selectDirection") || "Select Direction"} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">
                        {t("search.allDirections") || "All Directions"}
                      </SelectItem>
                      <SelectItem value="cairo_sinai">Cairo → Sinai</SelectItem>
                      <SelectItem value="sinai_cairo">Sinai → Cairo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-foreground text-sm font-medium block">
                  {t("search.departureDate")}
                </label>
                <div className="relative">
                  <Calendar className="absolute start-3 top-1/2 -translate-y-1/2 w-5 h-5 text-primary" />
                  <Input
                    type="date"
                    value={filters.date || ""}
                    onChange={handleDateChange}
                    className="ps-10 bg-secondary border-border h-12 text-foreground rounded-xl focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 items-end">
              <div className="space-y-2">
                <label className="text-foreground text-sm font-medium block">
                  {t("search.quantity")}
                </label>
                <div className="relative">
                  <Users className="absolute start-3 top-1/2 -translate-y-1/2 w-5 h-5 text-primary" />
                  <Input
                    type="number"
                    min="1"
                    max="12"
                    value={passengers}
                    onChange={(e) => setPassengers(Number(e.target.value))}
                    placeholder={t("search.howManyPeople")}
                    className="ps-10 bg-secondary border-border h-12 text-foreground rounded-xl focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <Button
                className="h-12 bg-primary hover:bg-primary-dark text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all"
                onClick={handleSearch}
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                ) : null}
                {t("hero.findTransfer")}
              </Button>
            </div>
          </Card>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-card">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Why Choose BookBus?
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Experience the best way to travel across Egypt
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div className="text-center group">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-primary-light flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 transition-transform">
                <Bus className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">
                {t("features.routeAvailability")}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {t("features.routeAvailabilityDesc")}
              </p>
            </div>

            <div className="text-center group">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-accent to-accent-light flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 transition-transform">
                <Clock className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">
                {t("features.comfort")}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {t("features.comfortDesc")}
              </p>
            </div>

            <div className="text-center group">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 transition-transform">
                <ThumbsUp className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">
                {t("features.pricing")}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {t("features.pricingDesc")}
              </p>
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
              <h2 className="text-4xl md:text-5xl font-black text-foreground mb-6 leading-tight">
                {t("destinations.title")}
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed mb-8">
                {t("destinations.description")}
              </p>
              <Button
                className="bg-primary hover:bg-primary-dark text-white font-bold text-lg px-8 py-6 h-auto rounded-xl shadow-lg hover:shadow-xl transition-all"
                onClick={handleSearch}
              >
                {t("destinations.exploreRoutes")}
              </Button>
            </div>
            <div className="order-1 lg:order-2">
              <img
                src={aboutImage}
                alt="about Image"
                className="rounded-3xl shadow-2xl w-full"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Private Trip CTA */}
      <section className="py-16 bg-primary/5">
        <div className="container mx-auto px-4 text-center">
          <Car className="w-12 h-12 text-primary mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-foreground mb-3">{t('privateTrip.ctaTitle') || 'Need a Private Trip?'}</h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto mb-6">
            {t('privateTrip.ctaDescription') || "Planning a group trip or need a custom route? Request a private trip and we'll arrange everything for you."}
          </p>
          <Button
            size="lg"
            className="font-bold text-lg px-8 py-6 h-auto rounded-xl shadow-lg"
            onClick={() => navigate('/private-trip')}
          >
            <Car className="w-5 h-5 mr-2" /> {t('privateTrip.ctaButton') || 'Request Private Trip'}
          </Button>
        </div>
      </section>

      {/* Gallery Section */}
      <Gallery />

      {/* Testimonials Section */}
      <Testimonials />

      {/* Trips Results */}
      {trips.length > 0 && (
        <section id="routes" className="py-24 bg-card">
          <div className="container mx-auto px-4">
            <div className="text-center mb-14">
              <h2 className="text-4xl font-black text-foreground mb-4">
                {t("routes.title")}
              </h2>
              <p className="text-lg text-muted-foreground max-w-xl mx-auto">
                {t("routes.subtitle")}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {trips.map((trip) => (
                <Card key={trip.id} className="border-2 shadow-lg p-6 hover:shadow-xl transition-shadow">
                  <div className="mb-4">
                    <h3 className="text-xl font-bold mb-2">
                      {trip.attributes.direction === 'cairo_sinai' ? 'Cairo → Sinai' : 'Sinai → Cairo'}
                    </h3>
                    <p className="text-muted-foreground">
                      {trip.attributes.date} at {trip.attributes.time}
                    </p>
                  </div>
                  <div className="mb-4">
                    <p className="text-sm text-muted-foreground">Vehicle: {trip.attributes.vehicle_type} seats</p>
                    {trip.attributes.is_extra && (
                      <span className="inline-block bg-primary/10 text-primary px-2 py-1 rounded text-xs font-medium mt-2">
                        Extra Trip
                      </span>
                    )}
                  </div>
                  <Button
                    onClick={() => handleBookTrip(trip)}
                    className="w-full"
                  >
                    Book Now
                  </Button>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default Routes;
