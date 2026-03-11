import React from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart, ClipboardCheck, Phone, CreditCard } from 'lucide-react';

const steps = [
  {
    icon: ShoppingCart,
    title: "Add to Cart",
    description: "Browse our selection and add your favorite fireworks to your cart",
    color: "from-orange-500 to-red-500",
  },
  {
    icon: ClipboardCheck,
    title: "Submit Order",
    description: "Complete your info and submit your order for review",
    color: "from-yellow-500 to-orange-500",
  },
  {
    icon: Phone,
    title: "We'll Contact You",
    description: "We'll contact you within 24 hours to schedule your pickup",
    color: "from-green-500 to-emerald-500",
  },
  {
    icon: CreditCard,
    title: "Pay & Pickup",
    description: "Payment collected at pickup. Cash, Venmo, Zelle, Cash App accepted",
    color: "from-purple-500 to-pink-500",
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-16 px-4 bg-gradient-to-b from-[#0a0a0a] to-black relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-orange-500/5 rounded-full blur-3xl" />

      <div className="max-w-6xl mx-auto relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
            Order in <span className="text-orange-400">4 Easy Steps</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Getting your fireworks has never been easier. Follow these simple steps and get ready to light up the sky.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="relative group"
            >
              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-16 left-full w-full h-0.5 bg-gradient-to-r from-white/10 to-transparent z-0" />
              )}

              <div className="bg-gradient-to-br from-gray-900 to-gray-950 rounded-2xl p-8 border border-white/5 hover:border-orange-500/30 transition-all duration-300 relative z-10 h-full">
                {/* Step number */}
                <div className="absolute -top-4 -right-4 w-10 h-10 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg shadow-orange-500/30">
                  {index + 1}
                </div>

                {/* Icon */}
                <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${step.color} flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <step.icon className="w-8 h-8 text-white" />
                </div>

                <h3 className="text-xl font-bold text-white mb-3">{step.title}</h3>
                <p className="text-gray-400 leading-relaxed">{step.description}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Payment methods */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-16 text-center"
        >
          <p className="text-gray-500 mb-4">Accepted Payment Methods</p>
          <div className="flex items-center justify-center gap-6 flex-wrap">
            {['Cash', 'Venmo', 'Zelle', 'Cash App', 'Apple Pay'].map((method) => (
              <span key={method} className="px-4 py-2 bg-white/5 rounded-lg text-gray-300 text-sm font-medium border border-white/10">
                {method}
              </span>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
