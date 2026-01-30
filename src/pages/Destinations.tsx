import React from "react";
import Navbar from "@/components/Navbar";
import { useLanguage } from "@/contexts/LanguageContext";
import { MapPin, Clock, Star, Bus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import egyptDestinations from "@/assets/egypt-destinations.jpg";

const destinations = [
  {
    name: { en: "Cairo", ar: "القاهرة" },
    description: {
      en: "The capital city with pyramids and rich history",
      ar: "العاصمة مع الأهرامات والتاريخ العريق",
    },
    travelTime: "Base",
    rating: 4.8,
    // Cairo - Pyramids of Giza
    image: "https://images.unsplash.com/photo-1572252009286-268acec5ca0a?w=400",
  },
  {
    name: { en: "Alexandria", ar: "الإسكندرية" },
    description: {
      en: "Mediterranean pearl with beautiful beaches",
      ar: "لؤلؤة البحر المتوسط بشواطئها الجميلة",
    },
    travelTime: "3h",
    rating: 4.7,
    image:
      "https://images.unsplash.com/photo-1594808815295-52034d585f56?q=80&w=1074",
  },
  {
    name: { en: "Luxor", ar: "الأقصر" },
    description: {
      en: "Ancient temples and Valley of the Kings",
      ar: "المعابد القديمة ووادي الملوك",
    },
    travelTime: "8h",
    rating: 4.9,
    image:
      "https://images.unsplash.com/photo-1587975844610-40f1ad10d07e?q=80&w=1171",
  },
  {
    name: { en: "Aswan", ar: "أسوان" },
    description: {
      en: "Nubian culture and the famous High Dam",
      ar: "الثقافة النوبية والسد العالي الشهير",
    },
    travelTime: "10h",
    rating: 4.6,
    // Aswan - Philae Temple
    image:
      "https://images.unsplash.com/photo-1644517270263-4112379d97ca?q=80&w=1170",
  },
  {
    name: { en: "Hurghada", ar: "الغردقة" },
    description: {
      en: "Red Sea resort with amazing diving spots",
      ar: "منتجع البحر الأحمر مع مواقع غوص مذهلة",
    },
    travelTime: "6h",
    rating: 4.5,
    // Hurghada - Red Sea coral reef
    image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400",
  },
  {
    name: { en: "Sharm El Sheikh", ar: "شرم الشيخ" },
    description: {
      en: "World-class beaches and coral reefs",
      ar: "شواطئ عالمية وشعاب مرجانية",
    },
    travelTime: "7h",
    rating: 4.8,
    // Sharm El Sheikh - beach resort
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400",
  },
  {
    name: { en: "Dahab", ar: "دهب" },
    description: {
      en: "Laid-back beach town famous for diving",
      ar: "مدينة شاطئية هادئة مشهورة بالغوص",
    },
    travelTime: "8h",
    rating: 4.7,
    // Dahab - Blue Hole diving spot
    image: "https://images.unsplash.com/photo-1682687982501-1e58ab814714?w=400",
  },
  {
    name: { en: "Saint Catherine", ar: "سانت كاترين" },
    description: {
      en: "Mount Sinai and the historic monastery",
      ar: "جبل سيناء والدير التاريخي",
    },
    travelTime: "9h",
    rating: 4.6,
    // Saint Catherine - Mount Sinai
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400",
  },
  {
    name: { en: "El Tor", ar: "الطور" },
    description: {
      en: "Gateway to Sinai with natural hot springs",
      ar: "بوابة سيناء مع الينابيع الحارة الطبيعية",
    },
    travelTime: "6h",
    rating: 4.4,
    // El Tor - Sinai coast
    image:
      "https://images.unsplash.com/photo-1642032669625-30d27b475a1f?q=80&w=564",
  },
];

const Destinations: React.FC = () => {
  const { language } = useLanguage();
  const isRTL = language === "ar";

  return (
    <div className={`min-h-screen bg-background ${isRTL ? "rtl" : "ltr"}`}>
      <Navbar />

      {/* Hero Section */}
      <section className="relative h-[50vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={egyptDestinations}
            alt="Egypt Destinations"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/50 to-background" />
        </div>
        <div className="relative z-10 text-center px-4">
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-4">
            {isRTL ? "وجهاتنا" : "Our Destinations"}
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {isRTL
              ? "اكتشف أجمل المدن المصرية مع رحلات مريحة وآمنة"
              : "Discover Egypt's most beautiful cities with comfortable and safe travel"}
          </p>
        </div>
      </section>

      {/* Destinations Grid */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {destinations.map((destination, index) => (
            <Card
              key={index}
              className="group overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-2"
            >
              <div className="relative h-48 overflow-hidden">
                <img
                  src={destination.image}
                  alt={destination.name[language]}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute top-4 right-4 bg-primary/90 backdrop-blur-sm text-primary-foreground px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                  <Star className="w-3 h-3 fill-current" />
                  {destination.rating}
                </div>
              </div>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-primary" />
                    {destination.name[language]}
                  </h3>
                  <div className="flex items-center gap-1 text-muted-foreground text-sm">
                    <Clock className="w-4 h-4" />
                    {destination.travelTime}
                  </div>
                </div>
                <p className="text-muted-foreground">
                  {destination.description[language]}
                </p>
                <div className="mt-4 pt-4 border-t border-border/50 flex items-center gap-2 text-sm text-primary">
                  <Bus className="w-4 h-4" />
                  {isRTL ? "رحلات يومية متاحة" : "Daily trips available"}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="bg-gradient-to-r from-primary/20 to-accent/20 rounded-3xl p-8 md:p-12 text-center border border-primary/20">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            {isRTL ? "جاهز للسفر؟" : "Ready to Travel?"}
          </h2>
          <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
            {isRTL
              ? "احجز رحلتك الآن واستمتع بتجربة سفر لا تُنسى"
              : "Book your trip now and enjoy an unforgettable travel experience"}
          </p>
          <a
            href="/"
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-8 py-3 rounded-full font-semibold hover:bg-primary/90 transition-colors"
          >
            <Bus className="w-5 h-5" />
            {isRTL ? "استكشف الرحلات" : "Explore Routes"}
          </a>
        </div>
      </section>
    </div>
  );
};

export default Destinations;
