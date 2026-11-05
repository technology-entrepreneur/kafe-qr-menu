'use client';

import React, { useState, useMemo } from 'react';
import {
  X,
  Users,
  Receipt,
  Check,
  CheckCircle2,
  CreditCard,
  Plus,
  Minus,
  Sparkles,
  PieChart,
  HelpCircle,
} from 'lucide-react';
import { CartItem, SessionParticipant } from '@/lib/hooks/useSharedCart';

export type SplitMode = 'itemized' | 'equal';

export interface SplitBillModalProps {
  isOpen: boolean;
  onClose: () => void;
  tableNumber: string | number;
  venueName?: string;
  items: CartItem[];
  participants: SessionParticipant[];
  currentParticipantId?: string;
  currencySymbol?: string;
  onConfirmPayment?: (paymentData: {
    mode: SplitMode;
    amount: number;
    tipAmount: number;
    totalToPay: number;
    selectedItemIds?: string[];
  }) => Promise<void> | void;
}

export function SplitBillModal({
  isOpen,
  onClose,
  tableNumber,
  venueName = 'Aura Hospitality',
  items,
  participants,
  currentParticipantId,
  currencySymbol = '₺',
  onConfirmPayment,
}: SplitBillModalProps) {
  const [splitMode, setSplitMode] = useState<SplitMode>('itemized');
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);
  const [tipPercentage, setTipPercentage] = useState<number>(10);
  const [customTip, setCustomTip] = useState<string>('');
  const [payingPersonsCount, setPayingPersonsCount] = useState<number>(
    Math.max(1, participants.length)
  );
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [paymentSuccess, setPaymentSuccess] = useState<boolean>(false);

  // Initialize selected items to items added by current participant
  React.useEffect(() => {
    if (currentParticipantId && items.length > 0) {
      const userItems = items
        .filter((item) => item.added_by_user_id === currentParticipantId)
        .map((item) => item.id);
      setSelectedItemIds(userItems.length > 0 ? userItems : items.map((i) => i.id));
    } else {
      setSelectedItemIds(items.map((i) => i.id));
    }
    setPayingPersonsCount(Math.max(1, participants.length));
  }, [currentParticipantId, items, participants.length, isOpen]);

  // Overall Table Calculation
  const tableSubtotal = useMemo(() => {
    return items.reduce((acc, item) => acc + Number(item.price) * item.quantity, 0);
  }, [items]);

  const totalAmountPaid = useMemo(() => {
    return participants.reduce((acc, p) => acc + (p.has_paid ? Number(p.amount_paid || 0) : 0), 0);
  }, [participants]);

  const remainingBalance = Math.max(0, tableSubtotal - totalAmountPaid);
  const progressPercentage = tableSubtotal > 0 ? Math.min(100, (totalAmountPaid / tableSubtotal) * 100) : 0;

  // Equal Split Calculations
  const effectiveTipPercent = customTip !== '' ? Number(customTip) || 0 : tipPercentage;
  const equalSubtotalPerPerson = tableSubtotal / (payingPersonsCount || 1);
  const equalTipPerPerson = (equalSubtotalPerPerson * effectiveTipPercent) / 100;
  const equalTotalPerPerson = equalSubtotalPerPerson + equalTipPerPerson;

  // Itemized Split Calculations
  const itemizedSubtotal = useMemo(() => {
    return items
      .filter((item) => selectedItemIds.includes(item.id))
      .reduce((acc, item) => acc + Number(item.price) * item.quantity, 0);
  }, [items, selectedItemIds]);

  const itemizedTip = (itemizedSubtotal * effectiveTipPercent) / 100;
  const itemizedTotal = itemizedSubtotal + itemizedTip;

  // Active Share To Pay based on chosen mode
  const currentTotalToPay = splitMode === 'itemized' ? itemizedTotal : equalTotalPerPerson;
  const currentTipToPay = splitMode === 'itemized' ? itemizedTip : equalTipPerPerson;
  const currentSubtotalToPay = splitMode === 'itemized' ? itemizedSubtotal : equalSubtotalPerPerson;

  const toggleItemSelection = (itemId: string) => {
    setSelectedItemIds((prev) =>
      prev.includes(itemId) ? prev.filter((id) => id !== itemId) : [...prev, itemId]
    );
  };

  const handleSelectAll = () => {
    if (selectedItemIds.length === items.length) {
      setSelectedItemIds([]);
    } else {
      setSelectedItemIds(items.map((i) => i.id));
    }
  };

  const handlePay = async () => {
    setIsProcessing(true);
    try {
      if (onConfirmPayment) {
        await onConfirmPayment({
          mode: splitMode,
          amount: currentSubtotalToPay,
          tipAmount: currentTipToPay,
          totalToPay: currentTotalToPay,
          selectedItemIds: splitMode === 'itemized' ? selectedItemIds : undefined,
        });
      }
      setPaymentSuccess(true);
      setTimeout(() => {
        setPaymentSuccess(false);
        onClose();
      }, 1800);
    } catch (err) {
      console.error('Payment error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4 transition-opacity animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg max-h-[92vh] flex flex-col bg-white dark:bg-zinc-950 rounded-t-3xl sm:rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
        
        {/* Top Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-zinc-100 dark:border-zinc-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center justify-center p-1.5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
                <Receipt className="w-5 h-5" />
              </span>
              <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                Split Bill
              </h2>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              {venueName} • Table #{tableNumber}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5 text-zinc-800 dark:text-zinc-200">
          
          {/* Table Bill Progress Card */}
          <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
            <div className="flex justify-between items-baseline mb-2">
              <span className="text-xs uppercase font-semibold text-zinc-500 tracking-wider">
                Table Total
              </span>
              <span className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                {currencySymbol}{tableSubtotal.toFixed(2)}
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-zinc-200 dark:bg-zinc-700 h-2.5 rounded-full overflow-hidden mb-2">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>

            <div className="flex justify-between text-xs text-zinc-500 dark:text-zinc-400">
              <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                <Check className="w-3.5 h-3.5" />
                Paid: {currencySymbol}{totalAmountPaid.toFixed(2)}
              </span>
              <span className="font-medium text-amber-600 dark:text-amber-400">
                Remaining: {currencySymbol}{remainingBalance.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="grid grid-cols-2 p-1 bg-zinc-100 dark:bg-zinc-900 rounded-xl">
            <button
              type="button"
              onClick={() => setSplitMode('itemized')}
              className={`flex items-center justify-center gap-2 py-2.5 text-xs font-semibold rounded-lg transition-all ${
                splitMode === 'itemized'
                  ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
              }`}
            >
              <Receipt className="w-4 h-4" />
              Itemized Split
            </button>
            <button
              type="button"
              onClick={() => setSplitMode('equal')}
              className={`flex items-center justify-center gap-2 py-2.5 text-xs font-semibold rounded-lg transition-all ${
                splitMode === 'equal'
                  ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
              }`}
            >
              <PieChart className="w-4 h-4" />
              Equal Split
            </button>
          </div>

          {/* MODE 1: Itemized Split Mode */}
          {splitMode === 'itemized' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">
                  Select the items you are paying for:
                </span>
                <button
                  type="button"
                  onClick={handleSelectAll}
                  className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
                >
                  {selectedItemIds.length === items.length ? 'Deselect All' : 'Select All'}
                </button>
              </div>

              <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                {items.length === 0 ? (
                  <p className="text-xs text-zinc-400 italic text-center py-4">
                    No items in table cart.
                  </p>
                ) : (
                  items.map((item) => {
                    const isSelected = selectedItemIds.includes(item.id);
                    const itemTotal = Number(item.price) * item.quantity;
                    const isMine = item.added_by_user_id === currentParticipantId;

                    return (
                      <div
                        key={item.id}
                        onClick={() => toggleItemSelection(item.id)}
                        className={`flex items-center justify-between p-3 rounded-xl border transition cursor-pointer select-none ${
                          isSelected
                            ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/20'
                            : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-5 h-5 rounded-md flex items-center justify-center border transition ${
                              isSelected
                                ? 'bg-indigo-600 border-indigo-600 text-white'
                                : 'border-zinc-300 dark:border-zinc-600'
                            }`}
                          >
                            {isSelected && <Check className="w-3.5 h-3.5" />}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                                {item.item_name}
                              </span>
                              {item.quantity > 1 && (
                                <span className="text-xs px-1.5 py-0.5 rounded-full bg-zinc-200 dark:bg-zinc-700 font-semibold">
                                  ×{item.quantity}
                                </span>
                              )}
                              {isMine && (
                                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                                  Added By You
                                </span>
                              )}
                            </div>
                            {item.custom_notes && (
                              <p className="text-[11px] text-zinc-400 italic">
                                &quot;{item.custom_notes}&quot;
                              </p>
                            )}
                          </div>
                        </div>

                        <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                          {currencySymbol}{itemTotal.toFixed(2)}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* MODE 2: Equal Split Mode */}
          {splitMode === 'equal' && (
            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">
                    Number of Paying Diners
                  </span>
                  <p className="text-[11px] text-zinc-400">
                    Split equally among table members
                  </p>
                </div>
                <div className="flex items-center gap-3 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-2 py-1">
                  <button
                    type="button"
                    disabled={payingPersonsCount <= 1}
                    onClick={() => setPayingPersonsCount((prev) => Math.max(1, prev - 1))}
                    className="p-1 rounded-lg text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 disabled:opacity-30"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="text-sm font-bold w-6 text-center text-zinc-900 dark:text-zinc-100">
                    {payingPersonsCount}
                  </span>
                  <button
                    type="button"
                    onClick={() => setPayingPersonsCount((prev) => prev + 1)}
                    className="p-1 rounded-lg text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800 flex justify-between items-baseline">
                <span className="text-xs text-zinc-500">Per Person Share:</span>
                <span className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                  {currencySymbol}{equalSubtotalPerPerson.toFixed(2)}
                </span>
              </div>
            </div>
          )}

          {/* Tip / Hospitality Gratuity Selector */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                Add Tip for Floor Staff:
              </span>
              <span className="text-xs font-medium text-zinc-500">
                +{currencySymbol}{currentTipToPay.toFixed(2)}
              </span>
            </div>

            <div className="grid grid-cols-5 gap-1.5">
              {[0, 10, 15, 20].map((percent) => (
                <button
                  key={percent}
                  type="button"
                  onClick={() => {
                    setTipPercentage(percent);
                    setCustomTip('');
                  }}
                  className={`py-2 text-xs font-semibold rounded-xl border transition ${
                    customTip === '' && tipPercentage === percent
                      ? 'bg-amber-500 border-amber-500 text-white shadow-sm'
                      : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 text-zinc-700 dark:text-zinc-300'
                  }`}
                >
                  {percent === 0 ? 'None' : `${percent}%`}
                </button>
              ))}
              <div className="relative">
                <input
                  type="number"
                  placeholder="Custom %"
                  value={customTip}
                  onChange={(e) => setCustomTip(e.target.value)}
                  className={`w-full py-2 px-1 text-center text-xs font-semibold rounded-xl border outline-none transition ${
                    customTip !== ''
                      ? 'border-amber-500 bg-amber-50/20 text-zinc-900 dark:text-zinc-100'
                      : 'border-zinc-200 dark:border-zinc-800 bg-transparent text-zinc-700 dark:text-zinc-300'
                  }`}
                />
              </div>
            </div>
          </div>

          {/* Active Participants Breakdown */}
          {participants.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
              <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5" />
                Table Guests & Payment Status ({participants.length}):
              </span>
              <div className="flex flex-wrap gap-2">
                {participants.map((participant) => (
                  <div
                    key={participant.id}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700"
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: participant.avatar_color || '#4F46E5' }}
                    />
                    <span className="font-medium text-zinc-800 dark:text-zinc-200">
                      {participant.user_nickname}
                    </span>
                    {participant.has_paid ? (
                      <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center">
                        <Check className="w-3 h-3 ml-0.5" />
                      </span>
                    ) : (
                      <span className="text-[10px] text-zinc-400">
                        Pending
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Footer Payment Action Panel */}
        <div className="p-5 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
          <div className="flex justify-between items-baseline mb-3">
            <div>
              <span className="text-xs text-zinc-500">Your Share to Pay:</span>
              <p className="text-[11px] text-zinc-400">Includes {effectiveTipPercent}% tip</p>
            </div>
            <div className="text-right">
              <span className="text-2xl font-black text-zinc-900 dark:text-zinc-100">
                {currencySymbol}{currentTotalToPay.toFixed(2)}
              </span>
            </div>
          </div>

          <button
            type="button"
            disabled={currentTotalToPay <= 0 || isProcessing || paymentSuccess}
            onClick={handlePay}
            className={`w-full py-3.5 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition active:scale-[0.98] ${
              paymentSuccess
                ? 'bg-emerald-600 text-white'
                : 'bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-indigo-600 dark:hover:bg-indigo-500 disabled:opacity-50'
            }`}
          >
            {paymentSuccess ? (
              <>
                <CheckCircle2 className="w-5 h-5 animate-bounce" />
                Payment Confirmed!
              </>
            ) : isProcessing ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Processing Payment...
              </>
            ) : (
              <>
                <CreditCard className="w-4 h-4" />
                Pay My Share ({currencySymbol}{currentTotalToPay.toFixed(2)})
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}

export default SplitBillModal;

