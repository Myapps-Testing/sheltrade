import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { validateGiftCard, redeemGiftCard } from '@/apis/giftcard';
import { Search, CheckCircle, XCircle, AlertCircle, Loader2, Gift, CreditCard } from 'lucide-react';

interface ValidationResult {
  brand: string;
  denomination: number;
  currency: string;
  status: string;
  expiresAt?: string;
  isValid: boolean;
}

interface GiftCardValidationProps {
  onRedeem?: (amount: number) => void;
}

export const GiftCardValidation = ({ onRedeem }: GiftCardValidationProps) => {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [redeeming, setRedeeming] = useState(false);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { toast } = useToast();

  const formatCode = (value: string) => {
    // Remove all non-alphanumeric characters
    const cleaned = value.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
    // Add dashes every 4 characters
    const formatted = cleaned.match(/.{1,4}/g)?.join('-') || cleaned;
    return formatted.slice(0, 19); // Max length: XXXX-XXXX-XXXX-XXXX
  };

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCode(e.target.value);
    setCode(formatted);
    setValidationResult(null);
    setErrorMessage(null);
  };

  const handleValidate = async () => {
    if (!code || code.length < 4) {
      toast({ title: 'Error', description: 'Please enter a valid gift card code', variant: 'destructive' });
      return;
    }

    setLoading(true);
    setValidationResult(null);
    setErrorMessage(null);

    try {
      const result = await validateGiftCard({ code });

      if (result.success && result.data) {
        setValidationResult(result.data);
      } else {
        setErrorMessage(result.message);
      }
    } catch (error) {
      setErrorMessage('Failed to validate gift card');
    } finally {
      setLoading(false);
    }
  };

  const handleRedeem = async () => {
    if (!validationResult?.isValid) return;

    setRedeeming(true);
    try {
      const result = await redeemGiftCard(code);

      if (result.success) {
        toast({ title: 'Success', description: result.message });
        onRedeem?.(result.amount || 0);
        setCode('');
        setValidationResult(null);
      } else {
        toast({ title: 'Error', description: result.message, variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to redeem gift card', variant: 'destructive' });
    } finally {
      setRedeeming(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'used':
        return <XCircle className="h-5 w-5 text-destructive" />;
      case 'expired':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500/10 text-green-500 hover:bg-green-500/20">Active</Badge>;
      case 'used':
        return <Badge variant="destructive">Used</Badge>;
      case 'expired':
        return <Badge className="bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20">Expired</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Validate Gift Card
        </CardTitle>
        <CardDescription>Enter your gift card code to check its status or redeem it</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Code Input */}
        <div className="space-y-2">
          <Label htmlFor="giftCardCode">Gift Card Code</Label>
          <div className="flex gap-2">
            <Input
              id="giftCardCode"
              type="text"
              placeholder="XXXX-XXXX-XXXX-XXXX"
              value={code}
              onChange={handleCodeChange}
              className="flex-1 font-mono tracking-wider"
              maxLength={19}
            />
            <Button
              type="button"
              onClick={handleValidate}
              disabled={loading || code.length < 4}
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Enter the 16-character code found on your gift card
          </p>
        </div>

        {/* Error Message */}
        {errorMessage && (
          <div className="p-4 border border-destructive/50 rounded-lg bg-destructive/10">
            <div className="flex items-center gap-2 text-destructive">
              <XCircle className="h-5 w-5" />
              <span className="font-medium">Validation Failed</span>
            </div>
            <p className="text-sm mt-1 text-destructive/80">{errorMessage}</p>
          </div>
        )}

        {/* Validation Result */}
        {validationResult && (
          <div className={`p-4 border rounded-lg ${
            validationResult.isValid 
              ? 'border-green-500/50 bg-green-500/10' 
              : 'border-muted bg-muted/50'
          }`}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                {getStatusIcon(validationResult.status)}
                <span className="font-semibold">{validationResult.brand}</span>
              </div>
              {getStatusBadge(validationResult.status)}
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Value</span>
                <p className="font-bold text-lg">
                  {validationResult.currency} {validationResult.denomination.toLocaleString()}
                </p>
              </div>
              {validationResult.expiresAt && (
                <div>
                  <span className="text-muted-foreground">Expires</span>
                  <p className="font-medium">
                    {new Date(validationResult.expiresAt).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>

            {validationResult.isValid && (
              <Button
                className="w-full mt-4"
                onClick={handleRedeem}
                disabled={redeeming}
              >
                {redeeming ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Redeeming...
                  </>
                ) : (
                  <>
                    <Gift className="mr-2 h-4 w-4" />
                    Redeem Gift Card
                  </>
                )}
              </Button>
            )}

            {!validationResult.isValid && (
              <p className="text-sm text-muted-foreground mt-3 text-center">
                This gift card cannot be redeemed because it is {validationResult.status}.
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};