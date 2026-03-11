import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { MapPin, Clock, PhoneCall, Send } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

const infoCards = [
  {
    icon: MapPin,
    title: "Location",
    highlight: "Phoenix Metro Area, Arizona",
    desc: "Pickup locations arranged after order",
  },
  {
    icon: Clock,
    title: "Response Time",
    highlight: "Within 24 Hours",
    desc: "We'll contact you to schedule pickup",
  },
  {
    icon: PhoneCall,
    title: "Order Inquiries",
    highlight: "Submit your order online",
    desc: "We'll call you to confirm",
  },
];

const payments = ["Cash", "Venmo", "Zelle", "Cash App", "Apple Pay"];

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    await base44.entities.ContactMessage.create(form);
    toast.success("Message sent! We'll get back to you soon.");
    setForm({ name: "", email: "", phone: "", message: "" });
    setSending(false);
  };

  return (
    <div className="min-h-screen bg-black pt-28 pb-20 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-orange-400 text-sm font-medium tracking-widest uppercase mb-3">
            Get In Touch
          </p>
          <h1 className="text-4xl md:text-5xl font-bold text-white">
            Contact <span className="text-orange-500">Us</span>
          </h1>
          <p className="text-gray-500 mt-4 max-w-xl mx-auto">
            Have questions about our products or your order? We're here to help!
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          {/* Left info */}
          <div>
            <h2 className="text-2xl font-bold text-white mb-6">How It Works</h2>
            <div className="space-y-4">
              {infoCards.map((card, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex items-start gap-4"
                >
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center flex-shrink-0 shadow-md">
                    <card.icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold">{card.title}</h3>
                    <p className="text-orange-400 text-sm mt-0.5">{card.highlight}</p>
                    <p className="text-gray-500 text-sm mt-1">{card.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 mt-4">
              <h3 className="text-white font-semibold mb-3">Accepted Payments</h3>
              <div className="flex flex-wrap gap-2">
                {payments.map((p) => (
                  <span
                    key={p}
                    className="px-3 py-1.5 rounded-full bg-slate-800 border border-slate-700 text-gray-300 text-xs font-medium"
                  >
                    {p}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Right form */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8">
            <h2 className="text-2xl font-bold text-white mb-6">Send Us a Message</h2>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="text-gray-400 text-sm mb-1.5 block">Name</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Your name"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-orange-500/40 transition-colors"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-gray-400 text-sm mb-1.5 block">Email</label>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="your@email.com"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-orange-500/40 transition-colors"
                  />
                </div>
                <div>
                  <label className="text-gray-400 text-sm mb-1.5 block">Phone</label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value.replace(/[^0-9+()\s\-]/g, "") })}
                    placeholder="(555) 123-4567"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-orange-500/50 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="text-gray-400 text-sm mb-1.5 block">Message</label>
                <textarea
                  required
                  rows={4}
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  placeholder="How can we help you?"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-orange-500/40 transition-colors resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={sending}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition-all duration-300 text-base shadow-[0_0_25px_rgba(249,115,22,0.3)] hover:shadow-[0_0_40px_rgba(249,115,22,0.5)] disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                {sending ? "Sending..." : "Send Message"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
