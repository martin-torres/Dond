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
import { PageShell } from './PageShell';
import { BottomActionBar } from './BottomActionBar';

interface RestaurantInfoProps {
  restaurant: Restaurant;
  language: Language;
  onContinue: () => void;
  onOrderFromPromo?: (promoId: string) => void;
  onViewMenu?: (menuItemId?: string) => void;
  onViewInteractiveMenu?: (menuItemId?: string, initialTab?: 'food' | 'drinks', isToGo?: boolean) => void;
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

  const handleToGoButtonClick = () => {
    // Start To Go ordering flow - go directly to food menu without table selection
    if (onViewInteractiveMenu) {
      onViewInteractiveMenu(undefined, 'food', true); // true flag indicates To Go
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
    <>
      <PageShell paddedForActionBar>
        <div className="space-y-6">
          {/* Slim restaurant identity card */}
          <Card className="p-4 sm:p-5 border border-slate-100 bg-gradient-to-br from-white via-slate-50 to-slate-100 shadow-sm">
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-slate-900 text-white flex items-center justify-center text-base font-semibold shadow-inner">
                  {restaurant.name.slice(0, 1)}
                </div>
                <div className="min-w-0 flex-1">
                  <h1 className={`text-lg sm:text-xl font-semibold leading-tight truncate ${
                    restaurant.name === 'Restaurant' ? 'text-blue-600' : 'text-gray-900'
                  }`}>
                    {restaurant.name}
                  </h1>
                  <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                    <MapPin className="w-4 h-4 text-blue-500 flex-shrink-0" />
                    <span className={`truncate ${
                      restaurant.address === 'Address not available' ? 'text-blue-600' : ''
                    }`}>
                      {restaurant.address}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="flex items-center gap-2 rounded-xl bg-white/70 px-3 py-2 shadow-inner">
                  <Clock className="w-4 h-4 text-blue-600" />
                  <p className="text-xs sm:text-sm text-gray-700 font-semibold truncate">
                    {restaurant.hours.open} - {restaurant.hours.close}
                  </p>
                </div>
                <div className="flex items-center gap-2 rounded-xl bg-white/70 px-3 py-2 shadow-inner">
                  <Users className="w-4 h-4 text-purple-600" />
                  <p className="text-xs sm:text-sm text-gray-700 font-semibold truncate">
                    {restaurant.waitTime} {t('minutes', language)}
                  </p>
                </div>
                <div className="flex items-center gap-2 rounded-xl bg-white/70 px-3 py-2 shadow-inner">
                  <MapPin className="w-4 h-4 text-green-600" />
                  <p className="text-xs sm:text-sm text-gray-700 font-semibold truncate">
                    {restaurant.distance} {t('meters', language)}
                  </p>
                </div>
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
                      <h2 className="text-xl font-semibold">{t('mauiConnectHeadline', language)}</h2>
                      <p className="text-sm text-white/90">{t('mauiConnectSchedule', language)}</p>
                      <p className="text-sm text-white/85">{t('mauiConnectDescription', language)}</p>
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
                (restaurant.promos || [])
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

          {/* EVENTS SECTION - Above Promos */}
          {(() => {
            const eventsForList = (restaurant as any).events || [];

            if (!eventsForList || eventsForList.length === 0) return null;

            return (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Tag className="w-5 h-5 text-blue-600" />
                  <h2 className="text-xl font-semibold text-gray-900">{t('upcomingEvents', language)}</h2>
                </div>

                {/* EVENTS: ONE PER LINE */}
                <div className="space-y-3">
                  {eventsForList.map((event: any) => {
                    const eventTitle = localizeText(event.title, language);
                    const eventDescription = localizeText(event.description, language);
                    return (
                      <Card
                        key={event.id}
                        className="overflow-hidden border border-blue-200 shadow-sm"
                      >
                        {event.imageUrl && (
                          <div className="relative h-24 w-full overflow-hidden">
                            <ImageWithFallback
                              src={event.imageUrl}
                              alt={eventTitle}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent" />
                            <div className="absolute bottom-0 left-0 right-0 p-2 text-white">
                              <h3 className="text-sm font-semibold line-clamp-1">{eventTitle}</h3>
                            </div>
                          </div>
                        )}
                        <div className="p-4">
                          <div className="flex items-start justify-between gap-3 mb-2">
                            <h3 className="text-gray-900 text-base font-semibold line-clamp-2">
                              {eventTitle}
                            </h3>
                            <div className="text-right text-xs text-gray-500 flex-shrink-0">
                              <p>{new Date(event.date).toLocaleDateString(language)}</p>
                              <p>{event.startTime} - {event.endTime}</p>
                            </div>
                          </div>
                          <p className="text-gray-600 text-sm line-clamp-2">{eventDescription}</p>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </div>
            );
          })()}

          {(() => {
            const promosForList =
              restaurant.id === 'rest-rupestre'
                ? (restaurant.promos || []).filter((promo) => promo.id !== 'rup-promo-mariachi')
                : (restaurant.promos || []);

            if (!promosForList || promosForList.length === 0) return null;

            return (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Tag className="w-5 h-5 text-orange-600" />
                  <h2 className="text-xl font-semibold text-gray-900">{todaysPromosLabel}</h2>
                </div>

                {/* TODAY'S SPECIALS: ALWAYS 2 CARDS PER ROW */}
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  {promosForList.map((promo) => {
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
                              <h3 className="text-sm font-semibold line-clamp-1">{promoTitle}</h3>
                            </div>
                          </div>
                        )}
                        <div className="p-3">
                          {!promo.imageUrl && (
                            <div className="flex items-start justify-between gap-3 mb-2">
                              <h3 className="text-gray-900 text-sm font-semibold line-clamp-2">
                                {promoTitle}
                              </h3>
                              {promo.discount > 0 && (
                                <Badge className="bg-orange-600 text-white flex-shrink-0 text-xs">
                                  {promo.discount}% {t('off', language)}
                                </Badge>
                              )}
                            </div>
                          )}

                          <p className="text-gray-600 text-sm line-clamp-3">{promoDescription}</p>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </div>
            );
          })()}
        </div>
      </PageShell>

      <BottomActionBar>
        <Button
          onClick={handleToGoButtonClick}
          className="w-full sm:flex-1 text-gray-900"
          size="lg"
          variant="outline"
        >
          {t('toGo', language)}
        </Button>
        <Button
          onClick={onContinue}
          className="w-full sm:flex-1"
          size="lg"
        >
          {t('selectTable', language)}
        </Button>
      </BottomActionBar>

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
    </>
  );
}
