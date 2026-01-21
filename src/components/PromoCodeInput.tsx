import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useValidatePromoCode, type PromoCode } from '@/hooks/usePromoCodes';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tag, Check, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface PromoCodeInputProps {
  onApply: (promoCode: PromoCode | null) => void;
  appliedCode: PromoCode | null;
}

const PromoCodeInput: React.FC<PromoCodeInputProps> = ({ onApply, appliedCode }) => {
  const { t } = useLanguage();
  const [code, setCode] = useState('');
  const validatePromoCode = useValidatePromoCode();

  const handleApply = async () => {
    if (!code.trim()) return;

    try {
      const result = await validatePromoCode.mutateAsync(code);
      
      if (result) {
        onApply(result);
        toast.success(t('promo.applied').replace('{discount}', `${result.discount_percent}%`));
      } else {
        toast.error(t('promo.invalid'));
        onApply(null);
      }
    } catch (error) {
      toast.error(t('promo.invalid'));
      onApply(null);
    }
  };

  const handleRemove = () => {
    setCode('');
    onApply(null);
    toast.success(t('promo.removed'));
  };

  if (appliedCode) {
    return (
      <div className="flex items-center gap-2 p-3 bg-success/10 border border-success/30 rounded-lg">
        <Check className="w-5 h-5 text-success flex-shrink-0" />
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <code className="px-2 py-0.5 bg-success/20 text-success rounded font-mono font-bold text-sm">
              {appliedCode.code}
            </code>
            <span className="text-sm text-success font-medium">
              -{appliedCode.discount_percent}% {t('promo.discount')}
            </span>
          </div>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleRemove}
          className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-foreground flex items-center gap-2">
        <Tag className="w-4 h-4" />
        {t('promo.haveCode')}
      </label>
      <div className="flex gap-2">
        <Input
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder={t('promo.enterCode')}
          className={cn(
            'font-mono uppercase',
            validatePromoCode.isPending && 'opacity-50'
          )}
          disabled={validatePromoCode.isPending}
        />
        <Button
          type="button"
          onClick={handleApply}
          disabled={!code.trim() || validatePromoCode.isPending}
          className="bg-primary hover:bg-primary-dark text-white"
        >
          {validatePromoCode.isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            t('promo.apply')
          )}
        </Button>
      </div>
    </div>
  );
};

export default PromoCodeInput;
