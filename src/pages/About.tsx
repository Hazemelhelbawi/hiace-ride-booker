import React from "react";
import Navbar from "@/components/Navbar";
import { useLanguage } from "@/contexts/LanguageContext";
import { Bus, Shield, Clock, Users, Award, Heart, Phone, Mail, MapPin } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const About: React.FC = () => {
  const { language } = useLanguage();
  const isRTL = language === "ar";

  const features = [
    {
      icon: Shield,
      title: { en: "Safety First", ar: "السلامة أولاً" },
      description: { en: "All our vehicles undergo regular safety inspections and maintenance", ar: "جميع مركباتنا تخضع لفحوصات السلامة والصيانة الدورية" }
    },
    {
      icon: Clock,
      title: { en: "On-Time Guarantee", ar: "ضمان الوقت" },
      description: { en: "We pride ourselves on punctual departures and arrivals", ar: "نفخر بالتزامنا بمواعيد المغادرة والوصول" }
    },
    {
      icon: Users,
      title: { en: "Experienced Drivers", ar: "سائقون محترفون" },
      description: { en: "Professional drivers with years of experience on Egyptian roads", ar: "سائقون محترفون بسنوات من الخبرة على الطرق المصرية" }
    },
    {
      icon: Award,
      title: { en: "Best Prices", ar: "أفضل الأسعار" },
      description: { en: "Competitive pricing without compromising on quality", ar: "أسعار تنافسية دون المساس بالجودة" }
    }
  ];

  const stats = [
    { value: "10K+", label: { en: "Happy Customers", ar: "عميل سعيد" } },
    { value: "50+", label: { en: "Routes", ar: "خط سير" } },
    { value: "100+", label: { en: "Daily Trips", ar: "رحلة يومية" } },
    { value: "5+", label: { en: "Years Experience", ar: "سنوات خبرة" } }
  ];

  return (
    <div className={`min-h-screen bg-background ${isRTL ? "rtl" : "ltr"}`}>
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/10" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-primary/20 rounded-full mb-6">
              <Bus className="w-10 h-10 text-primary" />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
              {isRTL ? "من نحن" : "About BookBus"}
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              {isRTL 
                ? "نحن شركة رائدة في مجال النقل البري في مصر، نقدم خدمات سفر آمنة ومريحة بين المدن المصرية منذ أكثر من 5 سنوات"
                : "We are a leading ground transportation company in Egypt, providing safe and comfortable intercity travel services for over 5 years"
              }
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-card/50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-primary mb-2">{stat.value}</div>
                <div className="text-muted-foreground">{stat.label[language]}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold text-foreground mb-6 flex items-center gap-3">
                  <Heart className="w-8 h-8 text-primary" />
                  {isRTL ? "مهمتنا" : "Our Mission"}
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  {isRTL 
                    ? "نسعى لتوفير تجربة سفر استثنائية لكل راكب، من خلال الجمع بين الراحة والأمان والأسعار المناسبة. نؤمن بأن السفر يجب أن يكون ممتعاً وخالياً من المتاعب."
                    : "We strive to provide an exceptional travel experience for every passenger by combining comfort, safety, and affordable prices. We believe that travel should be enjoyable and hassle-free."
                  }
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  {isRTL 
                    ? "فريقنا المتفاني يعمل على مدار الساعة لضمان رضاكم وتلبية احتياجاتكم في كل رحلة."
                    : "Our dedicated team works around the clock to ensure your satisfaction and meet your needs on every journey."
                  }
                </p>
              </div>
              <div className="bg-gradient-to-br from-primary/20 to-accent/20 rounded-3xl p-8 border border-primary/20">
                <h3 className="text-xl font-bold text-foreground mb-4">
                  {isRTL ? "لماذا تختارنا؟" : "Why Choose Us?"}
                </h3>
                <ul className="space-y-3">
                  {[
                    { en: "Modern air-conditioned vehicles", ar: "مركبات حديثة مكيفة" },
                    { en: "24/7 customer support", ar: "دعم عملاء على مدار الساعة" },
                    { en: "Easy online booking", ar: "حجز سهل عبر الإنترنت" },
                    { en: "Flexible cancellation policy", ar: "سياسة إلغاء مرنة" },
                    { en: "Loyalty rewards program", ar: "برنامج مكافآت الولاء" }
                  ].map((item, index) => (
                    <li key={index} className="flex items-center gap-2 text-muted-foreground">
                      <div className="w-2 h-2 bg-primary rounded-full" />
                      {item[language]}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-card/50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-foreground text-center mb-12">
            {isRTL ? "ما يميزنا" : "What Sets Us Apart"}
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="bg-background/50 border-border/50 hover:shadow-lg transition-shadow">
                <CardContent className="p-6 text-center">
                  <div className="inline-flex items-center justify-center w-14 h-14 bg-primary/20 rounded-full mb-4">
                    <feature.icon className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground mb-2">{feature.title[language]}</h3>
                  <p className="text-muted-foreground text-sm">{feature.description[language]}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-foreground mb-8">
              {isRTL ? "تواصل معنا" : "Contact Us"}
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="flex flex-col items-center p-4">
                <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mb-3">
                  <Phone className="w-6 h-6 text-primary" />
                </div>
                <div className="text-foreground font-medium">+20 123 456 7890</div>
              </div>
              <div className="flex flex-col items-center p-4">
                <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mb-3">
                  <Mail className="w-6 h-6 text-primary" />
                </div>
                <div className="text-foreground font-medium">info@bookbus.com</div>
              </div>
              <div className="flex flex-col items-center p-4">
                <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mb-3">
                  <MapPin className="w-6 h-6 text-primary" />
                </div>
                <div className="text-foreground font-medium">{isRTL ? "القاهرة، مصر" : "Cairo, Egypt"}</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
