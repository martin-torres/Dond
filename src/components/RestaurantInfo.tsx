import { useState } from 'react';
import { MapPin, Clock, Users, Tag, CheckCircle2 } from 'lucide-react';
import { Restaurant, Language, Promo } from '../types';
import { t, localizeText } from '../utils/translations';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card } from './ui/card';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Input } from './ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';

interface RestaurantInfoProps {
  restaurant: Restaurant;
  language: Language;
  onContinue: () => void;
  onOrderFromPromo?: (promoId: string) => void;
  onViewMenu?: (menuItemId?: string) => void;
  onViewInteractiveMenu?: (menuItemId?: string, initialTab?: 'food' | 'drinks') => void;
  onViewChefPreview?: (category?: 'food' | 'drinks') => void;
}

const HOLD_PAYMENT_OPTIONS = [
  { value: 'apple-pay', label: 'Apple Pay' },
  { value: 'visa', label: 'Visa' },
  { value: 'mastercard', label: 'Mastercard' },
  { value: 'amex', label: 'American Express' },
  { value: 'credit-card', label: 'Credit / Debit Card' },
];

export function RestaurantInfo({
  restaurant,
  language,
  onContinue,
  onOrderFromPromo,
  onViewMenu,
  onViewInteractiveMenu,
  onViewChefPreview,
}: RestaurantInfoProps) {
  const [isPromoDialogOpen, setPromoDialogOpen] = useState(false);
  const [activePromo, setActivePromo] = useState<Promo | null>(null);
  const [guestName, setGuestName] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [promoReservations, setPromoReservations] = useState<
    Record<string, { name: string; paymentMethod: string }>
  >({});

  const handlePromoDialogChange = (open: boolean) => {
    setPromoDialogOpen(open);
    if (!open) {
      setShowConfirmation(false);
      setActivePromo(null);
      setGuestName('');
      setPaymentMethod('');
    }
  };

  const handlePromoButtonClick = (promo: Promo) => {
    setActivePromo(promo);
    const existing = promoReservations[promo.id];
    setGuestName(existing?.name ?? '');
    setPaymentMethod(existing?.paymentMethod ?? '');
    setShowConfirmation(Boolean(existing));
    setPromoDialogOpen(true);
  };

  const handlePromoNavigateToMenu = (promo: Promo) => {
    if (onViewChefPreview) {
      onViewChefPreview(promo.menuCategory === 'drinks' ? 'drinks' : 'food');
      return;
    }
    if (onViewInteractiveMenu && promo.menuItemId) {
      onViewInteractiveMenu(
        promo.menuItemId,
        promo.menuCategory === 'drinks' ? 'drinks' : 'food'
      );
      return;
    }
    if (onViewMenu) {
      onViewMenu(promo.menuItemId);
      return;
    }
    onContinue();
  };

  const handleMenuButtonClick = () => {
    if (onViewChefPreview) {
      onViewChefPreview();
      return;
    }
    if (onViewInteractiveMenu) {
      onViewInteractiveMenu(undefined, 'food');
      return;
    }
    if (onViewMenu) {
      onViewMenu();
      return;
    }
    onContinue();
  };

  const getPaymentLabel = (value: string) =>
    HOLD_PAYMENT_OPTIONS.find((option) => option.value === value)?.label ?? value;

  const handleConfirmPromo = () => {
    if (!activePromo) return;
    const trimmedName = guestName.trim();
    if (!trimmedName || !paymentMethod) return;

    setPromoReservations((prev) => ({
      ...prev,
      [activePromo.id]: {
        name: trimmedName,
        paymentMethod,
      },
    }));

    if (onOrderFromPromo) {
      onOrderFromPromo(activePromo.id);
    }

    setGuestName(trimmedName);
    setShowConfirmation(true);
  };

  const todaysPromosLabel = t('todaysPromos', language);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4 pb-24">
      <div className="max-w-2xl mx-auto space-y-4">
        <Card className="p-6">
          <div className="space-y-4">
            <div>
              <h1 className="text-gray-900 mb-2">{restaurant.name}</h1>
              <div className="flex items-start gap-2 text-gray-600">
                <MapPin className="w-5 h-5 mt-0.5 flex-shrink-0" />
                <span>{restaurant.address}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-gray-900">{t('hours', language)}</p>
                  <p className="text-gray-600">
                    {restaurant.hours.open} - {restaurant.hours.close}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-purple-600" />
                <div>
                  <p className="text-gray-900">{t('waitTime', language)}</p>
                  <p className="text-gray-600">
                    {restaurant.waitTime} {t('minutes', language)}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2 border-t">
              <MapPin className="w-5 h-5 text-green-600" />
              <p className="text-gray-600">
                {t('distance', language)}: {restaurant.distance} {t('meters', language)}
              </p>
            </div>
          </div>
        </Card>

        {(restaurant.id === 'rest-one-maui' || restaurant.id === 'rest-rupestre') && (
          <>
            {restaurant.id === 'rest-one-maui' && (
              <Card className="p-5 border border-cyan-200 shadow-md relative overflow-hidden rounded-2xl">
                <div
                  aria-hidden
                  className="absolute inset-0"
                  style={{
                    backgroundImage:
                      "url('https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1000&q=80')",
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-br from-sky-900/70 via-slate-900/60 to-cyan-800/50" />
                <div className="relative space-y-3 text-white p-4 text-center flex flex-col gap-3">
                  <div className="space-y-1">
                    <p className="text-xs uppercase tracking-[0.3em] text-cyan-200">Maui Connect</p>
                    <h2 className="text-xl font-semibold">
                      {t('mauiConnectHeadline', language)}
                    </h2>
                    <p className="text-sm text-white/90">
                      {t('mauiConnectSchedule', language)}
                    </p>
                    <p className="text-sm text-white/85">
                      {t('mauiConnectDescription', language)}
                    </p>
                    <p className="text-sm font-semibold text-white mt-2">
                      {t('mauiConnectAvailability', language)}
                    </p>
                  </div>
                  <Button className="w-full h-14 text-base" variant="secondary" onClick={onContinue}>
                    {t('mauiConnectCTA', language)}
                  </Button>
                </div>
              </Card>
            )}
            {restaurant.id === 'rest-rupestre' &&
              restaurant.promos
                .filter((promo) => promo.id === 'rup-promo-mariachi')
                .map((promo) => {
                  const promoTitle = localizeText(promo.title, language);
                  const promoDescription = localizeText(promo.description, language);
                  return (
                    <Card
                      key={promo.id}
                      className="p-5 border border-cyan-200 shadow-md relative overflow-hidden rounded-2xl"
                    >
                      <div
                        aria-hidden
                        className="absolute inset-0"
                        style={{
                          backgroundImage: promo.imageUrl
                            ? `url('${promo.imageUrl}')`
                            : "url('https://images.unsplash.com/photo-1509099836639-18ba1795216d?auto=format&fit=crop&w=1000&q=80')",
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-br from-rose-900/70 via-amber-900/60 to-orange-800/50" />
                      <div className="relative space-y-3 text-white p-4 text-center flex flex-col gap-3">
                        <div className="space-y-1">
                          <p className="text-xs uppercase tracking-[0.3em] text-amber-200">
                            {t('mariachiLabel', language)}
                          </p>
                          <h2 className="text-xl font-semibold">{promoTitle}</h2>
                          <p className="text-sm text-white/90">{promoDescription}</p>
                          <p className="text-sm font-semibold text-white mt-2">
                            {t('mariachiTiming', language)}
                          </p>
                        </div>
                        <Button className="w-full h-14 text-base" variant="secondary" onClick={onContinue}>
                          {t('mariachiCTA', language)}
                        </Button>
                      </div>
                    </Card>
                  );
                })}
          </>
        )}

        {restaurant.promos.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Tag className="w-5 h-5 text-orange-600" />
              <h2 className="text-gray-900">{todaysPromosLabel}</h2>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {restaurant.promos.map((promo) => {
                const promoTitle = localizeText(promo.title, language);
                const promoDescription = localizeText(promo.description, language);
                return (
                <Card
                  key={promo.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => handlePromoNavigateToMenu(promo)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      handlePromoNavigateToMenu(promo);
                    }
                  }}
                  className="overflow-hidden border-2 border-orange-200 hover:border-orange-400 transition-all hover:shadow-lg cursor-pointer focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-orange-200"
                  style={{ minHeight: '160px' }}
                >
                  {promo.imageUrl && (
                    <div className="relative h-32 w-full overflow-hidden">
                      <ImageWithFallback
                        src={promo.imageUrl}
                        alt={promoTitle}
                        className="w-full h-full object-cover"
                      />
                      {promo.discount > 0 && (
                        <div className="absolute top-3 right-3">
                          <Badge className="bg-orange-600 text-white text-xs px-2 py-1 shadow-lg">
                            {promo.discount}% {t('off', language)}
                          </Badge>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
                        <h3 className="text-sm font-semibold">{promoTitle}</h3>
                      </div>
                    </div>
                  )}
                  <div className="p-3">
                    {!promo.imageUrl && (
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <h3 className="text-gray-900 text-sm font-semibold">
                          {promoTitle}
                        </h3>
                        {promo.discount > 0 && (
                          <Badge className="bg-orange-600 text-white flex-shrink-0 text-xs">
                            {promo.discount}% {t('off', language)}
                          </Badge>
                        )}
                      </div>
                    )}

                    <p className="text-gray-600 text-sm line-clamp-3">
                      {promoDescription}
                    </p>
                  </div>
                </Card>
              );
              })}
            </div>
          </div>
        )}

        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t shadow-lg">
          <div className="max-w-2xl mx-auto flex flex-col gap-2 sm:flex-row">
            <Button
              onClick={handleMenuButtonClick}
              className="w-full sm:flex-1 text-gray-900"
              size="lg"
              variant="outline"
              style={{ color: '#1F2937', borderColor: '#6B7280' }}
            >
              {t('menu', language)}
            </Button>
            <Button
              onClick={onContinue}
              className="w-full sm:flex-1"
              size="lg"
              style={{ backgroundColor: '#1F2937', color: '#F9FAFB' }}
            >
              {t('selectTable', language)}
            </Button>
          </div>
        </div>
      </div>

      <Dialog open={isPromoDialogOpen} onOpenChange={handlePromoDialogChange}>
        <DialogContent className="sm:max-w-md">
          {activePromo && !showConfirmation && (
            <>
              <DialogHeader>
                <DialogTitle>
                  {`${t('holdPromoLabel', language)} • ${activePromo.title[language]}`}
                </DialogTitle>
                <DialogDescription>
                  {t('holdPromoDescription', language)}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gray-700">
                    {t('orderNameLabel', language)}
                  </label>
                  <Input
                    value={guestName}
                    onChange={(event) => setGuestName(event.target.value)}
                    placeholder={t('orderNamePlaceholder', language)}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gray-700">
                    {t('preferredPaymentMethod', language)}
                  </label>
                  <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder={t('chooseMethod', language)} />
                    </SelectTrigger>
                    <SelectContent>
                      {HOLD_PAYMENT_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-[11px] text-gray-500">
                    {t('paymentVerificationNote', language)}
                  </p>
                </div>
              </div>

              <DialogFooter className="pt-4">
                <Button variant="ghost" onClick={() => handlePromoDialogChange(false)}>
                  {t('cancel', language)}
                </Button>
                <Button onClick={handleConfirmPromo} disabled={!guestName.trim() || !paymentMethod}>
                  {t('confirmHold', language)}
                </Button>
              </DialogFooter>
            </>
          )}

          {activePromo && showConfirmation && (
            <>
              <DialogHeader>
                <DialogTitle>
                  {t('holdSuccessTitle', language)}
                </DialogTitle>
                <DialogDescription>
                  {t('holdSuccessSubtitle', language)}
                </DialogDescription>
              </DialogHeader>

              <div className="rounded-2xl border border-green-100 bg-green-50 p-4 flex gap-3">
                <CheckCircle2 className="h-10 w-10 text-green-600 flex-shrink-0" />
                <div className="space-y-1 text-sm text-green-900">
                  <p className="font-semibold">
                    {t('thanksByName', language).replace('{name}', guestName)}
                  </p>
                  <p>
                    {t('holdSuccessAdded', language).replace('{promo}', activePromo.title[language])}
                  </p>
                  <p>
                    {t('holdSuccessPayment', language).replace(
                      '{method}',
                      getPaymentLabel(paymentMethod)
                    )}
                  </p>
                </div>
              </div>

              <p className="text-sm text-gray-600">
                {t('holdReminder', language)}
              </p>

              <DialogFooter className="pt-2">
                <Button className="w-full" onClick={() => handlePromoDialogChange(false)}>
                  {t('greatThanks', language)}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
