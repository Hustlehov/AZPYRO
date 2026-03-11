import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, Phone, Mail, MessageSquare, ArrowLeft, Check, Loader2,
  Tag, AlertTriangle, Home
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

const PICKUP_NOTE = "480 PYRO WILL CONTACT YOU WITHIN 24 HOURS TO ARRANGE PICKUP/DELIVERY. THERE IS A MINIMUM PURCHASE REQUIREMENT OF $100 FOR ALL DELIVERY REQUESTS. THERE IS A FEE FOR ALL DELIVERY REQUESTS THAT ARE OUTSIDE OF THE PICKUP/DELIVERY AREA.";

export default function CheckoutForm({ items, total, onBack, onSubmit, isSubmitting }) {
  const subtotal = total;

  const [fulfillment, setFulfillment] = useState(null);
  const [addressLine, setAddressLine] = useState('');
  const [addressCity, setAddressCity] = useState('');
  const [addressState, setAddressState] = useState('AZ');
  const [addressZip, setAddressZip] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_phone: '',
    customer_email: '',
    notes: '',
  });

  // Promo code
  const [promoInput, setPromoInput] = useState('');
  const [promoApplied, setPromoApplied] = useState(null);
  const [promoLoading, setPromoLoading] = useState(false);
  const [promoError, setPromoError] = useState('');

  // Phone verification
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [sentPhoneCode, setSentPhoneCode] = useState(null);
  const [phoneVerifyInput, setPhoneVerifyInput] = useState('');
  const [phoneVerifyError, setPhoneVerifyError] = useState('');

  const handleSendPhoneCode = () => {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setSentPhoneCode(code);
    setPhoneVerifyInput('');
    setPhoneVerifyError('');
    toast.success(`Your verification code is: ${code}`, { duration: 30000 });
  };

  const handleVerifyPhone = () => {
    if (phoneVerifyInput.trim() === sentPhoneCode) {
      setPhoneVerified(true);
      setPhoneVerifyError('');
      toast.success('Phone number verified!');
    } else {
      setPhoneVerifyError('Incorrect code. Please try again.');
    }
  };

  const getDiscount = () => {
    if (!promoApplied) return 0;
    if (promoApplied.discount_type === 'percent') {
      return (subtotal * promoApplied.discount_value) / 100;
    }
    return Math.min(promoApplied.discount_value, subtotal);
  };
  const discountAmount = getDiscount();
  const finalTotal = Math.max(0, subtotal - discountAmount);

  const handleApplyPromo = async () => {
    if (!promoInput.trim()) return;
    setPromoLoading(true);
    setPromoError('');
    const codes = await base44.entities.PromoCode.filter({ code: promoInput.trim().toUpperCase(), active: true });
    if (codes.length === 0) {
      setPromoError('Invalid or expired promo code.');
      setPromoApplied(null);
    } else {
      const code = codes[0];
      if (code.min_order && subtotal < code.min_order) {
        setPromoError(`Minimum order of $${code.min_order} required for this code.`);
        setPromoApplied(null);
      } else {
        setPromoApplied(code);
        toast.success('Promo code applied!');
      }
    }
    setPromoLoading(false);
  };

  const fullAddress = [addressLine, addressCity, addressState, addressZip].filter(Boolean).join(', ');

  const handleAddressInput = async (val) => {
    setAddressLine(val);
    if (val.length < 4) { setSuggestions([]); return; }
    const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=5&q=${encodeURIComponent(val)}&countrycodes=us`);
    const data = await res.json();
    setSuggestions(data);
    setShowSuggestions(true);
  };

  const selectSuggestion = (item) => {
    const addr = item.address;
    const street = [addr.house_number, addr.road].filter(Boolean).join(' ');
    setAddressLine(street || item.display_name.split(',')[0]);
    setAddressCity(addr.city || addr.town || addr.village || '');
    setAddressState(addr.state_code || addr.state || 'AZ');
    setAddressZip(addr.postcode || '');
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const isValidPhone = (p) => p.replace(/\D/g, '').length >= 10;
  const isValidEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

  const canSubmit = () => {
    if (!fulfillment) return false;
    if (fulfillment === 'delivery' && !addressLine.trim()) return false;
    if (!formData.customer_name || !formData.customer_phone) return false;
    if (!isValidPhone(formData.customer_phone)) return false;
    if (!phoneVerified) return false;
    if (formData.customer_email && !isValidEmail(formData.customer_email)) return false;
    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!canSubmit()) return;
    onSubmit({
      ...formData,
      fulfillment_type: fulfillment,
      shipping_address: fullAddress,
      promo_code: promoApplied?.code || '',
      discount_amount: discountAmount,
      subtotal,
      total: finalTotal,
      phone_verified: phoneVerified,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="max-w-2xl mx-auto"
    >
      <Button variant="ghost" onClick={onBack} className="text-gray-400 hover:text-white mb-6">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Cart
      </Button>

      <div className="bg-gradient-to-br from-gray-900 to-gray-950 rounded-2xl border border-white/10 overflow-hidden">

        {/* Order Summary */}
        <div className="p-6 border-b border-white/10">
          <h3 className="text-lg font-bold text-white mb-4">Order Summary</h3>
          <div className="space-y-2">
            {items.map((item) => (
              <div key={item.id} className="flex justify-between text-sm">
                <span className="text-gray-400">{item.name} × {item.quantity}</span>
                <span className="text-white">${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
            <Separator className="bg-white/10 my-2" />
            <div className="flex justify-between text-sm text-gray-400">
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between text-sm text-green-400">
                <span>Discount ({promoApplied.code})</span>
                <span>−${discountAmount.toFixed(2)}</span>
              </div>
            )}
            {fulfillment === 'delivery' && (
              <div className="flex justify-between text-sm text-yellow-400">
                <span>Delivery fee</span>
                <span>TBD at contact</span>
              </div>
            )}
            <Separator className="bg-white/10 my-2" />
            <div className="flex justify-between text-lg font-bold">
              <span className="text-white">Total</span>
              <span className="text-orange-400">${finalTotal.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-7">

          {/* STEP 1: Fulfillment */}
          <div>
            <h3 className="text-lg font-bold text-white mb-4">1. How would you like to receive your order?</h3>
            <div className="mb-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 flex gap-3">
              <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
              <p className="text-yellow-300 text-sm font-medium leading-relaxed">{PICKUP_NOTE}</p>
            </div>

            <div className="flex flex-col gap-3">
              <button
                type="button"
                onClick={() => setFulfillment('pickup')}
                className={`rounded-xl px-5 py-3 border-2 text-left transition-all duration-200 flex items-center gap-3 ${
                  fulfillment === 'pickup'
                    ? 'border-orange-500 bg-orange-500/10'
                    : 'border-white/10 bg-white/5 hover:border-white/20'
                }`}
              >
                <span className="text-xl">📍</span>
                <p className="font-bold text-white text-base">Pickup</p>
              </button>

              <button
                type="button"
                onClick={() => setFulfillment('delivery')}
                className={`rounded-xl px-5 py-3 border-2 text-left transition-all duration-200 flex items-center gap-3 ${
                  fulfillment === 'delivery'
                    ? 'border-orange-500 bg-orange-500/10'
                    : 'border-white/10 bg-white/5 hover:border-white/20'
                }`}
              >
                <span className="text-xl">🚚</span>
                <p className="font-bold text-white text-base">Delivery</p>
              </button>
            </div>

            <AnimatePresence>
              {fulfillment === 'delivery' && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="mt-4 space-y-3"
                >
                  <Label className="text-gray-300">Delivery Address *</Label>
                  <div className="relative">
                    <Home className="absolute left-3 top-3.5 w-5 h-5 text-gray-500 z-10" />
                    <input
                      type="text"
                      value={addressLine}
                      onChange={(e) => handleAddressInput(e.target.value)}
                      onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                      placeholder="Street address"
                      className="w-full bg-white/5 border border-white/10 rounded-lg text-white pl-10 pr-4 py-3 focus:outline-none focus:border-orange-500 placeholder:text-gray-600"
                      required
                    />
                    {showSuggestions && suggestions.length > 0 && (
                      <div className="absolute top-full left-0 right-0 bg-gray-900 border border-white/10 rounded-xl mt-1 z-50 overflow-hidden shadow-xl">
                        {suggestions.map((s) => {
                          const addr = s.address || {};
                          const street = [addr.house_number, addr.road].filter(Boolean).join(' ');
                          const city = addr.city || addr.town || addr.village || '';
                          const state = addr.state_code || addr.state || '';
                          const zip = addr.postcode || '';
                          const label = [street, city, state, zip].filter(Boolean).join(', ');
                          return (
                            <button
                              key={s.place_id}
                              type="button"
                              onMouseDown={() => selectSuggestion(s)}
                              className="w-full text-left px-4 py-2.5 text-sm text-gray-200 hover:bg-white/10 transition-colors border-b border-white/5 last:border-0"
                            >
                              {label || s.display_name.split(',').slice(0, 3).join(',')}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      value={addressCity}
                      onChange={(e) => setAddressCity(e.target.value)}
                      placeholder="City"
                      className="bg-white/5 border border-white/10 rounded-lg text-white px-4 py-3 focus:outline-none focus:border-orange-500 placeholder:text-gray-600"
                    />
                    <input
                      type="text"
                      value={addressState}
                      onChange={(e) => setAddressState(e.target.value)}
                      placeholder="State"
                      className="bg-white/5 border border-white/10 rounded-lg text-white px-4 py-3 focus:outline-none focus:border-orange-500 placeholder:text-gray-600"
                    />
                  </div>
                  <input
                    type="text"
                    value={addressZip}
                    onChange={(e) => setAddressZip(e.target.value)}
                    placeholder="ZIP Code"
                    className="w-full bg-white/5 border border-white/10 rounded-lg text-white px-4 py-3 focus:outline-none focus:border-orange-500 placeholder:text-gray-600"
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <Separator className="bg-white/10" />

          {/* STEP 2: Customer Info */}
          <div>
            <h3 className="text-lg font-bold text-white mb-4">2. Your Information</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-gray-300">Full Name *</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <Input
                    required
                    value={formData.customer_name}
                    onChange={(e) => {
                      const val = e.target.value.replace(/[0-9]/g, '');
                      setFormData({ ...formData, customer_name: val });
                    }}
                    placeholder="John Doe"
                    className="bg-white/5 border-white/10 text-white pl-10 h-12 focus:border-orange-500"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-gray-300">
                  Phone Number *
                  {phoneVerified && (
                    <span className="ml-2 text-green-400 text-xs font-medium inline-flex items-center gap-1">
                      <Check className="w-3 h-3" /> Verified
                    </span>
                  )}
                </Label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <Input
                      type="tel"
                      required
                      value={formData.customer_phone}
                      onChange={(e) => {
                        const val = e.target.value.replace(/[^\d\s\-().+]/g, '');
                        setFormData({ ...formData, customer_phone: val });
                        setPhoneVerified(false);
                        setSentPhoneCode(null);
                        setPhoneVerifyInput('');
                        setPhoneVerifyError('');
                      }}
                      disabled={phoneVerified}
                      placeholder="(555) 123-4567"
                      className="bg-white/5 border-white/10 text-white pl-10 h-12 focus:border-orange-500 disabled:opacity-60"
                    />
                  </div>
                  {!phoneVerified && isValidPhone(formData.customer_phone) && (
                    <Button
                      type="button"
                      onClick={handleSendPhoneCode}
                      className="bg-white/10 hover:bg-white/20 text-white border border-white/10 h-12 px-4 shrink-0"
                    >
                      {sentPhoneCode ? 'Resend' : 'Send Code'}
                    </Button>
                  )}
                </div>

                <AnimatePresence>
                  {sentPhoneCode && !phoneVerified && (
                    <motion.div
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="flex gap-2"
                    >
                      <Input
                        value={phoneVerifyInput}
                        onChange={(e) => setPhoneVerifyInput(e.target.value)}
                        placeholder="Enter 6-digit code"
                        maxLength={6}
                        className="bg-white/5 border-white/10 text-white h-11 focus:border-orange-500 tracking-widest text-center text-lg"
                      />
                      <Button
                        type="button"
                        onClick={handleVerifyPhone}
                        className="bg-orange-500 hover:bg-orange-600 text-white h-11 px-5 shrink-0"
                      >
                        Verify
                      </Button>
                    </motion.div>
                  )}
                </AnimatePresence>
                {phoneVerifyError && <p className="text-red-400 text-xs">{phoneVerifyError}</p>}
                {!phoneVerified && isValidPhone(formData.customer_phone) && !sentPhoneCode && (
                  <p className="text-gray-500 text-xs">Click "Send Code" to verify your phone number.</p>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-gray-300">Email (Optional)</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <Input
                    type="email"
                    value={formData.customer_email}
                    onChange={(e) => setFormData({ ...formData, customer_email: e.target.value })}
                    placeholder="john@example.com"
                    className="bg-white/5 border-white/10 text-white pl-10 h-12 focus:border-orange-500"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-gray-300">Special Instructions (Optional)</Label>
                <div className="relative">
                  <MessageSquare className="absolute left-3 top-3 w-5 h-5 text-gray-500" />
                  <Textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Any special requests or notes..."
                    className="bg-white/5 border-white/10 text-white pl-10 min-h-[90px] focus:border-orange-500 resize-none"
                  />
                </div>
              </div>
            </div>
          </div>

          <Separator className="bg-white/10" />

          {/* STEP 3: Promo Code */}
          <div>
            <h3 className="text-lg font-bold text-white mb-4">3. Promo Code</h3>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <Input
                  value={promoInput}
                  onChange={(e) => {
                    setPromoInput(e.target.value.toUpperCase());
                    setPromoError('');
                    if (promoApplied) setPromoApplied(null);
                  }}
                  disabled={!!promoApplied}
                  placeholder="ENTER CODE"
                  className="bg-white/5 border-white/10 text-white pl-10 h-12 focus:border-orange-500 tracking-widest font-mono uppercase disabled:opacity-60"
                />
              </div>
              {promoApplied ? (
                <Button
                  type="button"
                  onClick={() => { setPromoApplied(null); setPromoInput(''); }}
                  className="bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/20 h-12 px-4 shrink-0"
                >
                  Remove
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={handleApplyPromo}
                  disabled={promoLoading || !promoInput.trim()}
                  className="bg-white/10 hover:bg-white/20 text-white border border-white/10 h-12 px-5 shrink-0"
                >
                  {promoLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Apply'}
                </Button>
              )}
            </div>
            {promoError && <p className="text-red-400 text-xs mt-2">{promoError}</p>}
            {promoApplied && (
              <p className="text-green-400 text-xs mt-2 flex items-center gap-1">
                <Check className="w-3 h-3" />
                {promoApplied.discount_type === 'percent'
                  ? `${promoApplied.discount_value}% off applied`
                  : `$${promoApplied.discount_value} off applied`}
              </p>
            )}
          </div>

          <Separator className="bg-white/10" />

          {/* Payment note */}
          <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-4">
            <p className="text-orange-300 text-sm">
              <strong>Payment collected at pickup/delivery.</strong> We accept Cash, Venmo, Zelle, Cash App, and Apple Pay.
            </p>
          </div>

          <Button
            type="submit"
            disabled={isSubmitting || !canSubmit()}
            className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold py-7 rounded-xl text-lg shadow-lg shadow-orange-500/25"
          >
            {isSubmitting ? (
              <><Loader2 className="w-5 h-5 mr-2 animate-spin" />Submitting...</>
            ) : (
              <><Check className="w-5 h-5 mr-2" />Submit Order — ${finalTotal.toFixed(2)}</>
            )}
          </Button>

          {!canSubmit() && fulfillment && (
            <p className="text-center text-gray-500 text-xs -mt-4">
              Please fill in all required fields.
            </p>
          )}
        </form>
      </div>
    </motion.div>
  );
}
