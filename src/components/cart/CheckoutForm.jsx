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
 
