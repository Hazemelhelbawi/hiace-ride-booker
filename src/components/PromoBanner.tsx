import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useActivePromoCode } from '@/hooks/usePromoCodes';
import { X, Tag, Clock, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const PromoBanner: React.FC = () => {
  const { t, language } = useLanguage();
  const { data: promoCode, isLoading } = useActivePromoCode();
  const [isVisible, setIsVisible] = useState(true);
  const [copied, setCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState<string>('');

  useEffect(() => {
    if (!promoCode?.expires_at) return;

    const expiresAt = new Date(promoCode.expires_at);

    const updateTimeLeft = () => {
      const now = new Date();
      const diff = expiresAt.getTime() - now.getTime();
      
      if (diff <= 0) {
        setTimeLeft('');
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      if (language === 'ar') {
        setTimeLeft(`${hours}س ${minutes}د ${seconds}ث`);
      } else {
        setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
      }
    };

    updateTimeLeft();
    const interval = setInterval(updateTimeLeft, 1000);
    return () => clearInterval(interval);
  }, [promoCode?.expires_at, language]);

  const handleCopyCode = async () => {
    if (!promoCode) return;
    
    try {
      await navigator.clipboard.writeText(promoCode.code);
      setCopied(true);
      toast.success(t('promo.codeCopied'));
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error(t('promo.copyFailed'));
    }
  };

  const handleClose = () => {
    setIsVisible(false);
  };

  // Don't render if loading, no promo code, or closed
  if (isLoading || !promoCode || !isVisible) return null;

  return (
    <div className="bg-gradient-to-r from-primary via-primary-dark to-accent text-white relative overflow-hidden">
      {/* Animated background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-40 h-40 bg-white rounded-full -translate-x-1/2 -translate-y-1/2 animate-pulse" />
        <div className="absolute bottom-0 right-0 w-32 h-32 bg-white rounded-full translate-x-1/2 translate-y-1/2 animate-pulse" />
      </div>
      
      <div className="container mx-auto px-4 py-3 relative z-10">
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <Tag className="w-5 h-5 animate-bounce" />
            <span className="font-bold text-lg">
              {t('promo.limitedOffer')}: {promoCode.discount_percent}% {t('promo.discount')}
            </span>
          </div>
          
          <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-1.5">
            <span className="font-mono font-bold tracking-wider">{promoCode.code}</span>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 hover:bg-white/20 text-white"
              onClick={handleCopyCode}
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </Button>
          </div>

          {timeLeft && (
            <div className="flex items-center gap-2 text-white/90">
              <Clock className="w-4 h-4" />
              <span className="text-sm font-medium">{t('promo.endsIn')}: {timeLeft}</span>
            </div>
          )}
        </div>
      </div>

      <Button
        variant="ghost"
        size="sm"
        className="absolute end-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0 hover:bg-white/20 text-white rounded-full"
        onClick={handleClose}
      >
        <X className="w-4 h-4" />
      </Button>
    </div>
  );
};

export default PromoBanner;
