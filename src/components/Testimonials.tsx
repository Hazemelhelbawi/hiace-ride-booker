import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent } from '@/components/ui/card';
import { Star, Quote } from 'lucide-react';

interface Testimonial {
  id: number;
  name: { en: string; ar: string };
  location: { en: string; ar: string };
  rating: number;
  comment: { en: string; ar: string };
  avatar: string;
  route: { en: string; ar: string };
}

const testimonials: Testimonial[] = [
  {
    id: 1,
    name: { en: 'Ahmed Hassan', ar: 'أحمد حسن' },
    location: { en: 'Cairo', ar: 'القاهرة' },
    rating: 5,
    comment: {
      en: 'Excellent service! The van was clean, comfortable, and the driver was very professional. Will definitely book again.',
      ar: 'خدمة ممتازة! الحافلة كانت نظيفة ومريحة والسائق كان محترفًا جدًا. سأحجز مرة أخرى بالتأكيد.'
    },
    avatar: 'https://i.pravatar.cc/100?img=1',
    route: { en: 'Cairo → Hurghada', ar: 'القاهرة ← الغردقة' }
  },
  {
    id: 2,
    name: { en: 'Sarah Mohamed', ar: 'سارة محمد' },
    location: { en: 'Alexandria', ar: 'الإسكندرية' },
    rating: 5,
    comment: {
      en: 'Best transportation experience in Egypt! Easy booking process and great customer service. Highly recommended!',
      ar: 'أفضل تجربة نقل في مصر! عملية حجز سهلة وخدمة عملاء رائعة. أنصح بها بشدة!'
    },
    avatar: 'https://i.pravatar.cc/100?img=5',
    route: { en: 'Alexandria → Sharm', ar: 'الإسكندرية ← شرم الشيخ' }
  },
  {
    id: 3,
    name: { en: 'Mohamed Ali', ar: 'محمد علي' },
    location: { en: 'Luxor', ar: 'الأقصر' },
    rating: 4,
    comment: {
      en: 'Very reliable and punctual. The app made booking super easy. Great value for money!',
      ar: 'موثوق جدًا ودقيق في المواعيد. التطبيق جعل الحجز سهلًا للغاية. قيمة ممتازة مقابل المال!'
    },
    avatar: 'https://i.pravatar.cc/100?img=3',
    route: { en: 'Luxor → Aswan', ar: 'الأقصر ← أسوان' }
  },
  {
    id: 4,
    name: { en: 'Fatima Ibrahim', ar: 'فاطمة إبراهيم' },
    location: { en: 'Hurghada', ar: 'الغردقة' },
    rating: 5,
    comment: {
      en: 'Traveled with my family and everyone was impressed. Comfortable seats and friendly staff. Thank you!',
      ar: 'سافرت مع عائلتي والجميع أعجبوا بالخدمة. مقاعد مريحة وطاقم ودود. شكرًا لكم!'
    },
    avatar: 'https://i.pravatar.cc/100?img=9',
    route: { en: 'Hurghada → Cairo', ar: 'الغردقة ← القاهرة' }
  }
];

const Testimonials = React.forwardRef<HTMLElement, {}>((_, ref) => {
  const { t, language } = useLanguage();

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, index) => (
      <Star
        key={index}
        className={`w-4 h-4 ${
          index < rating
            ? 'fill-warning text-warning'
            : 'fill-muted text-muted'
        }`}
      />
    ));
  };

  return (
    <section ref={ref} className="py-24 bg-secondary">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full mb-6 font-medium">
            <Star className="w-4 h-4 fill-primary" />
            {t('testimonials.badge')}
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-foreground mb-4">
            {t('testimonials.title')}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t('testimonials.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {testimonials.map((testimonial) => (
            <Card 
              key={testimonial.id} 
              className="bg-card border-border hover:border-primary/30 transition-all duration-300 hover:shadow-xl group"
            >
              <CardContent className="p-6">
                <Quote className="w-8 h-8 text-primary/20 mb-4 group-hover:text-primary/40 transition-colors" />
                
                <p className="text-muted-foreground mb-6 leading-relaxed text-sm">
                  "{testimonial.comment[language]}"
                </p>

                <div className="flex items-center gap-2 mb-4">
                  {renderStars(testimonial.rating)}
                </div>

                <div className="flex items-center gap-3">
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.name[language]}
                    className="w-12 h-12 rounded-full object-cover border-2 border-primary/20"
                  />
                  <div>
                    <h4 className="font-bold text-foreground text-sm">
                      {testimonial.name[language]}
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      {testimonial.location[language]}
                    </p>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-border">
                  <p className="text-xs text-primary font-medium">
                    {testimonial.route[language]}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <div className="inline-flex items-center gap-6 bg-card rounded-2xl p-6 shadow-lg">
            <div className="text-center">
              <p className="text-3xl font-black text-primary">4.9</p>
              <p className="text-sm text-muted-foreground">{t('testimonials.avgRating')}</p>
            </div>
            <div className="w-px h-12 bg-border" />
            <div className="text-center">
              <p className="text-3xl font-black text-primary">10K+</p>
              <p className="text-sm text-muted-foreground">{t('testimonials.happyCustomers')}</p>
            </div>
            <div className="w-px h-12 bg-border" />
            <div className="text-center">
              <p className="text-3xl font-black text-primary">50+</p>
              <p className="text-sm text-muted-foreground">{t('testimonials.routes')}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
