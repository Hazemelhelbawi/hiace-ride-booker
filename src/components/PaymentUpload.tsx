import React, { useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Copy, Upload, Check, Wallet, CreditCard, Loader2, Building2, MessageCircle } from 'lucide-react';
import { toast } from 'sonner';

interface PaymentUploadProps {
  onUpload: (url: string) => void;
  uploadedUrl: string;
}

const INSTAPAY_NUMBER = '01019533315';
const VODAFONE_CASH_NUMBERS = ['01006805717', '01019533315'];
const CIB_ACCOUNT = '0100063671667';
const WHATSAPP_NUMBER = '+201002178764';

const PaymentUpload: React.FC<PaymentUploadProps> = ({ onUpload, uploadedUrl }) => {
  const [isUploading, setIsUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied!`);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File must be under 5MB');
      return;
    }

    setIsUploading(true);
    try {
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${file.name.split('.').pop()}`;
      const { error } = await supabase.storage
        .from('payment-screenshots')
        .upload(fileName, file);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('payment-screenshots')
        .getPublicUrl(fileName);

      onUpload(publicUrl);
      toast.success('Screenshot uploaded successfully');
    } catch (err) {
      logger.error('Upload error:', err);
      toast.error('Failed to upload screenshot');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-foreground">Payment</h3>

      {/* Payment Methods */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* InstaPay */}
        <Card className="border-2">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <CreditCard className="w-5 h-5 text-primary" />
              <span className="font-medium text-foreground">InstaPay / حساب بنكي</span>
            </div>
            <p className="text-sm text-muted-foreground mb-2 font-mono">{INSTAPAY_NUMBER}</p>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => copyToClipboard(INSTAPAY_NUMBER, 'InstaPay number')}
              className="gap-1 w-full"
            >
              <Copy className="w-3 h-3" /> Copy Number
            </Button>
          </CardContent>
        </Card>

        {/* Vodafone Cash */}
        <Card className="border-2">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Wallet className="w-5 h-5 text-primary" />
              <span className="font-medium text-foreground">Vodafone Cash</span>
            </div>
            {VODAFONE_CASH_NUMBERS.map((num, i) => (
              <div key={i} className="flex items-center gap-2 mb-2">
                <p className="text-sm text-muted-foreground font-mono flex-1">{num}</p>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => copyToClipboard(num, 'Vodafone Cash number')}
                  className="gap-1 h-7 px-2"
                >
                  <Copy className="w-3 h-3" />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* CIB Account */}
        <Card className="border-2">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Building2 className="w-5 h-5 text-primary" />
              <span className="font-medium text-foreground">CIB حساب بنكي</span>
            </div>
            <p className="text-sm text-muted-foreground mb-2 font-mono">{CIB_ACCOUNT}</p>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => copyToClipboard(CIB_ACCOUNT, 'CIB account')}
              className="gap-1 w-full"
            >
              <Copy className="w-3 h-3" /> Copy Number
            </Button>
          </CardContent>
        </Card>

        {/* WhatsApp */}
        <Card className="border-2">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <MessageCircle className="w-5 h-5 text-primary" />
              <span className="font-medium text-foreground">WhatsApp</span>
            </div>
            <p className="text-sm text-muted-foreground mb-2 font-mono">{WHATSAPP_NUMBER}</p>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => window.open(`https://wa.me/${WHATSAPP_NUMBER.replace('+', '')}`, '_blank')}
              className="gap-1 w-full"
            >
              <MessageCircle className="w-3 h-3" /> Chat on WhatsApp
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Upload Screenshot */}
      <div>
        <p className="text-sm text-muted-foreground mb-2">Upload payment screenshot (optional)</p>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          className="hidden"
        />
        {uploadedUrl ? (
          <div className="flex items-center gap-3 p-3 bg-success/10 rounded-lg border border-success/20">
            <Check className="w-5 h-5 text-success flex-shrink-0" />
            <span className="text-sm text-success font-medium">Screenshot uploaded</span>
            <img src={uploadedUrl} alt="Payment" className="w-12 h-12 rounded object-cover ml-auto" />
          </div>
        ) : (
          <Button
            type="button"
            variant="outline"
            onClick={() => fileRef.current?.click()}
            disabled={isUploading}
            className="w-full h-20 border-dashed border-2 gap-2"
          >
            {isUploading ? (
              <><Loader2 className="w-5 h-5 animate-spin" /> Uploading...</>
            ) : (
              <><Upload className="w-5 h-5" /> Upload Payment Screenshot</>
            )}
          </Button>
        )}
      </div>
    </div>
  );
};

export default PaymentUpload;
