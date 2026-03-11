import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ShoppingCart, Check } from "lucide-react";
import { toast } from "sonner";
import CheckoutForm from "../components/cart/CheckoutForm";

export default function Cart() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderDone, setOrderDone] = useState(false);

  const { data: items = [], isLoading } = useQuery({
    queryKey: ["cartItems"],
    queryFn: () => base44.entities.CartItem.list(),
    initialData: [],
  });

  const clearCart = useMutation({
    mutationFn: async () => {
      await Promise.all(items.map((i) => base44.entities.CartItem.delete(i.id)));
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["cartItems"] }),
  });

  const total = items.reduce(
    (sum, item) => sum + (item.product_price || 0) * (item.quantity || 1),
    0
  );

  // Normalize items for CheckoutForm
  const checkoutItems = items.map((item) => ({
    id: item.id,
    name: item.product_name,
    price: item.product_price,
    image_url: item.product_image,
    quantity: item.quantity || 1,
  }));

  const handleSubmit = async (formData) => {
    setIsSubmitting(true);
    await base44.entities.Order.create({
      ...formData,
      items: checkoutItems,
    });
    await clearCart.mutateAsync();
    setOrderDone(true);
    setIsSubmitting(false);
    toast.success("Order submitted! We'll contact you within 24 hours.");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black pt-28 pb-20 px-4">
        <div className="max-w-2xl mx-auto space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 rounded-2xl bg-white/5 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (orderDone) {
    return (
      <div className="min-h-screen bg-black pt-28 pb-20 px-4 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto">
          <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6">
            <Check className="w-10 h-10 text-green-400" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-3">Order Submitted!</h1>
          <p className="text-gray-400 mb-8">
            We'll contact you within 24 hours to arrange pickup or delivery.
          </p>
          <Link
            to={createPageUrl("Shop")}
            className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-xl font-semibold transition-all"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-black pt-28 pb-20 px-4">
        <div className="text-center py-20">
          <ShoppingCart className="w-12 h-12 text-gray-700 mx-auto mb-4" />
          <p className="text-gray-500 mb-6">Your cart is empty</p>
          <Link
            to={createPageUrl("Shop")}
            className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-xl font-semibold transition-all"
          >
            Shop Fireworks
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black pt-28 pb-20 px-4">
      <div className="max-w-2xl mx-auto">
        <CheckoutForm
          items={checkoutItems}
          total={total}
          onBack={() => navigate(-1)}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
        />
      </div>
    </div>
  );
}
