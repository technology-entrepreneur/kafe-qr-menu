'use client';

import React, { useState, useEffect } from 'react';
import {
  Star,
  X,
  Heart,
  MessageSquareWarning,
  ExternalLink,
  ShieldCheck,
  Send,
  AlertTriangle,
  Clock,
  Utensils,
  Sparkles,
  CreditCard,
  Phone,
} from 'lucide-react';
import { triggerGoldenConfetti } from '@/lib/confetti';
import { IssueType } from '@/lib/whatsapp';

export interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  tableNumber: string | number;
  venueName?: string;
  sessionId?: string;
  googleReviewUrl?: string;
  language?: 'tr' | 'en';
}

type ModalStep = 'rating' | 'positive' | 'negative' | 'submitted';

export function FeedbackModal({
  isOpen,
  onClose,
  tableNumber,
  venueName = 'Gloriouss Cafe',
  sessionId,
  googleReviewUrl = 'https://maps.google.com',
  language = 'tr',
}: FeedbackModalProps) {
  const [step, setStep] = useState<ModalStep>('rating');
  const [rating, setRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [category, setCategory] = useState<IssueType>('other');
  const [comment, setComment] = useState<string>('');
  const [guestContact, setGuestContact] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [finalGoogleUrl, setFinalGoogleUrl] = useState<string>(googleReviewUrl);

  // Reset state on modal open
  useEffect(() => {
    if (isOpen) {
      setStep('rating');
      setRating(0);
      setHoverRating(0);
      setCategory('other');
      setComment('');
      setGuestContact('');
      setIsSubmitting(false);
      setFinalGoogleUrl(googleReviewUrl);
    }
  }, [isOpen, googleReviewUrl]);

  if (!isOpen) return null;

  // Star Labels dictionary
  const ratingLabels: Record<number, { tr: string; en: string }> = {
    5: { tr: 'Olağanüstü! 🌟', en: 'Exceptional! 🌟' },
    4: { tr: 'Çok İyi! 😊', en: 'Very Good! 😊' },
    3: { tr: 'Ortalama 😐', en: 'Average 😐' },
    2: { tr: 'Beklentimin Altında 🙁', en: 'Disappointing 🙁' },
    1: { tr: 'Kötü 😞', en: 'Poor 😞' },
  };

  const handleSelectStar = async (selected: number) => {
    setRating(selected);

    if (selected >= 4) {
      // 4 or 5 Stars -> High Satisfaction Route
      setStep('positive');
      triggerGoldenConfetti();

      // Notify backend of positive score & retrieve configured Google review link
      try {
        const res = await fetch('/api/feedback', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            rating: selected,
            tableNumber,
            venueName,
            sessionId,
          }),
        });
        const data = await res.json();
        if (data.googleReviewUrl) {
          setFinalGoogleUrl(data.googleReviewUrl);
        }
      } catch (err) {
        console.warn('Feedback API call failed:', err);
      }
    } else {
      // 1, 2, or 3 Stars -> Internal De-escalation & Floor Manager Alert
      setStep('negative');
    }
  };

  const handleNegativeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rating,
          category,
          comment,
          tableNumber,
          venueName,
          sessionId,
          guestContact,
        }),
      });

      setStep('submitted');
      setTimeout(() => {
        onClose();
      }, 3500);
    } catch (err) {
      console.error('Error submitting negative feedback:', err);
      setStep('submitted');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleRedirect = () => {
    window.open(finalGoogleUrl, '_blank', 'noopener,noreferrer');
    onClose();
  };

  const displayedRating = hoverRating || rating;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white dark:bg-zinc-950 rounded-3xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden text-zinc-900 dark:text-zinc-100">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition z-10"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* STEP 1: INITIAL 5-STAR RATING */}
        {step === 'rating' && (
          <div className="p-6 text-center space-y-4">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <Sparkles className="w-7 h-7" />
            </div>

            <div>
              <h3 className="text-xl font-black text-zinc-900 dark:text-zinc-100">
                {language === 'tr' ? 'Deneyiminizi Puanlayın' : 'Rate Your Experience'}
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                {venueName} • Table #{tableNumber}
              </p>
            </div>

            {/* Interactive Stars */}
            <div className="flex items-center justify-center gap-2 py-3">
              {[1, 2, 3, 4, 5].map((starValue) => {
                const isLit = starValue <= displayedRating;
                return (
                  <button
                    key={starValue}
                    type="button"
                    onMouseEnter={() => setHoverRating(starValue)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => handleSelectStar(starValue)}
                    className="p-1 transition-transform active:scale-90 hover:scale-125 focus:outline-none"
                    aria-label={`${starValue} stars`}
                  >
                    <Star
                      className={`w-9 h-9 transition-colors duration-200 ${
                        isLit
                          ? 'fill-amber-400 text-amber-400 drop-shadow-[0_2px_8px_rgba(251,191,36,0.5)]'
                          : 'text-zinc-300 dark:text-zinc-700'
                      }`}
                    />
                  </button>
                );
              })}
            </div>

            {/* Live Hover Microcopy */}
            <div className="h-6">
              {displayedRating > 0 ? (
                <span className="text-sm font-bold text-amber-600 dark:text-amber-400 animate-in fade-in">
                  {language === 'tr'
                    ? ratingLabels[displayedRating].tr
                    : ratingLabels[displayedRating].en}
                </span>
              ) : (
                <span className="text-xs text-zinc-400">
                  {language === 'tr'
                    ? 'Yıldızlara dokunarak puan verin'
                    : 'Tap a star to rate'}
                </span>
              )}
            </div>
          </div>
        )}

        {/* STEP 2A: POSITIVE ROUTE (4 or 5 Stars -> Google Business Review) */}
        {step === 'positive' && (
          <div className="p-6 text-center space-y-4 animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 mx-auto rounded-3xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-inner">
              <Heart className="w-8 h-8 fill-emerald-500" />
            </div>

            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-1 text-amber-500 font-bold text-xs px-2.5 py-0.5 rounded-full bg-amber-500/10">
                <Star className="w-3.5 h-3.5 fill-amber-400" />
                {rating} / 5 Stars
              </div>
              <h3 className="text-xl font-black text-zinc-900 dark:text-zinc-100">
                {language === 'tr' ? 'Bizi Çok Mutlu Ettiniz!' : 'We Are Thrilled You Loved It!'}
              </h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-xs mx-auto">
                {language === 'tr'
                  ? 'Geri bildiriminiz ekibimiz için paha biçilemez. Google Maps üzerinde 30 saniyenizi ayırıp deneyiminizi paylaşır mısınız?'
                  : 'Your review means the world to our kitchen and service team. Would you take 30 seconds to support us on Google?'}
              </p>
            </div>

            {/* Google Review Primary CTA */}
            <div className="pt-2 space-y-2">
              <button
                type="button"
                onClick={handleGoogleRedirect}
                className="w-full py-3.5 px-4 rounded-2xl bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-white dark:hover:bg-zinc-100 dark:text-zinc-900 font-bold text-sm flex items-center justify-center gap-2 shadow-xl hover:shadow-2xl transition active:scale-[0.98]"
              >
                {/* Google Colors G Icon SVG */}
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>
                  {language === 'tr' ? 'Google’da Yorum Yap' : 'Review Us on Google'}
                </span>
                <ExternalLink className="w-3.5 h-3.5 opacity-70 ml-1" />
              </button>

              <button
                type="button"
                onClick={onClose}
                className="w-full py-2.5 text-xs font-semibold text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 transition"
              >
                {language === 'tr' ? 'Belki Daha Sonra' : 'Maybe Later'}
              </button>
            </div>
          </div>
        )}

        {/* STEP 2B: NEGATIVE ROUTE (1, 2, or 3 Stars -> Internal Floor Alert) */}
        {step === 'negative' && (
          <form onSubmit={handleNegativeSubmit} className="p-6 space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center flex-shrink-0">
                <MessageSquareWarning className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                  {language === 'tr'
                    ? 'Çok Üzgünüz. Nasıl Telafi Edebiliriz?'
                    : 'We Are So Sorry. How Can We Help?'}
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  {language === 'tr'
                    ? 'Bu mesaj doğrudan vardiya müdürümüze iletilir.'
                    : 'Your feedback goes directly to our shift manager.'}
                </p>
              </div>
            </div>

            {/* Category Selector Pills */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                {language === 'tr' ? 'Sorunun Kaynağı:' : 'Issue Category:'}
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  { id: 'food_quality', labelTr: 'Lezzet / Pişirme', labelEn: 'Food Quality', icon: Utensils },
                  { id: 'service_speed', labelTr: 'Servis Gecikmesi', labelEn: 'Service Speed', icon: Clock },
                  { id: 'cleanliness', labelTr: 'Temizlik / Hijyen', labelEn: 'Cleanliness', icon: Sparkles },
                  { id: 'billing', labelTr: 'Hesap / Ödeme', labelEn: 'Billing Issue', icon: CreditCard },
                ].map((item) => {
                  const Icon = item.icon;
                  const isSelected = category === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setCategory(item.id as IssueType)}
                      className={`flex items-center gap-2 p-2 rounded-xl text-xs font-medium border transition ${
                        isSelected
                          ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/30 text-amber-900 dark:text-amber-200 font-bold'
                          : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 text-zinc-600 dark:text-zinc-400'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{language === 'tr' ? item.labelTr : item.labelEn}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Details Textarea */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                {language === 'tr' ? 'Detaylar:' : 'Complaint Details:'}
              </label>
              <textarea
                required
                rows={3}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder={
                  language === 'tr'
                    ? 'Lütfen aksayan durumu kısaca açıklayın...'
                    : 'Please let us know what fell short of your expectations...'
                }
                className="w-full p-3 text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-amber-500/50 resize-none text-zinc-900 dark:text-zinc-100"
              />
            </div>

            {/* Optional Guest Contact */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400 flex items-center gap-1">
                <Phone className="w-3 h-3" />
                {language === 'tr'
                  ? 'İletişim Numaranız (Opsiyonel - Telafi için):'
                  : 'Your Phone Number (Optional - For Manager Follow-up):'}
              </label>
              <input
                type="tel"
                value={guestContact}
                onChange={(e) => setGuestContact(e.target.value)}
                placeholder="05XX XXX XX XX"
                className="w-full p-2.5 text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-amber-500/50 text-zinc-900 dark:text-zinc-100"
              />
            </div>

            {/* Submit Action Button */}
            <button
              type="submit"
              disabled={isSubmitting || !comment.trim()}
              className="w-full py-3 px-4 rounded-xl font-bold text-xs bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white flex items-center justify-center gap-2 shadow-lg transition active:scale-[0.98]"
            >
              {isSubmitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  {language === 'tr' ? 'Müdüre İletiliyor...' : 'Alerting Floor Manager...'}
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  {language === 'tr' ? 'Vardiya Müdürüne İlet' : 'Dispatch to Shift Manager'}
                </>
              )}
            </button>
          </form>
        )}

        {/* STEP 3: SUBMITTED SUCCESS CONFIRMATION */}
        {step === 'submitted' && (
          <div className="p-8 text-center space-y-3 animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 mx-auto rounded-3xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <ShieldCheck className="w-9 h-9" />
            </div>

            <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
              {language === 'tr' ? 'Bildiriminiz Alındı' : 'Manager Has Been Alerted'}
            </h3>

            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed max-w-xs mx-auto">
              {language === 'tr'
                ? 'Geri bildiriminiz doğrudan salon müdürümüzün ekranına ve WhatsApp hattına iletildi. Yaşattığımız aksaklık için özür diler, teşekkür ederiz.'
                : 'Your comments have been routed directly to our shift lead. We deeply apologize for the inconvenience and are addressing it promptly.'}
            </p>

            <button
              type="button"
              onClick={onClose}
              className="mt-2 text-xs font-semibold text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 underline"
            >
              {language === 'tr' ? 'Pencereyi Kapat' : 'Close'}
            </button>
          </div>
        )}

      </div>
    </div>
  );
}

export default FeedbackModal;

