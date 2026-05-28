import React from 'react';
import { Check, X, HelpCircle, Zap, Shield, Crown } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function PricingPage() {
    const plans = [
        {
            name: 'Free',
            price: '0',
            desc: 'For individuals and testing',
            features: [
                '5 Detections per month',
                'Standard GPU processing',
                'Single file upload',
                'Email community support',
                '7-day history storage'
            ],
            notIncluded: [
                'Batch detection',
                'API Access',
                'Advanced forensics report',
                'Priority support'
            ],
            icon: <Zap size={24} className="text-gray-400" />,
            btnText: 'Get Started',
            btnLink: '/register',
            isPopular: false
        },
        {
            name: 'Professional',
            price: '29',
            desc: 'For investigators and small teams',
            features: [
                '500 Detections per month',
                'Priority GPU processing',
                'Batch detection (up to 20)',
                'Full forensic reports',
                'API Access (50 req/min)',
                '30-day history storage',
                'Priority email support'
            ],
            notIncluded: [
                'Custom model training',
                'Enterprise SLA'
            ],
            icon: <Shield size={24} className="text-indigo-400" />,
            btnText: 'Start Free Trial',
            btnLink: '/register',
            isPopular: true
        },
        {
            name: 'Enterprise',
            price: 'Custom',
            desc: 'For large agencies and newsrooms',
            features: [
                'Unlimited Detections*',
                'Dedicated GPU nodes',
                'Bulk batch processing',
                'Custom model integration',
                'Unlimited history',
                '24/7 Dedicated manager',
                'Uncapped API access'
            ],
            notIncluded: [],
            icon: <Crown size={24} className="text-amber-400" />,
            btnText: 'Contact Sales',
            btnLink: '/contact',
            isPopular: false
        }
    ];

    return (
        <div className="animate-fade-in pb-20">
            <div className="pt-20 pb-16 text-center">
                <h1 className="text-5xl md:text-6xl font-black text-white mb-6">Simple, Powerful <span className="text-indigo-500">Pricing</span></h1>
                <p className="text-gray-400 max-w-2xl mx-auto text-lg">Choose the plan that best fits your forensic analysis needs.</p>
            </div>

            <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {plans.map((plan, i) => (
                    <div
                        key={i}
                        className={`
              relative glass-panel p-10 rounded-[32px] border transition-all hover:scale-[1.02]
              ${plan.isPopular ? 'border-indigo-500/50 bg-indigo-500/5 shadow-2xl shadow-indigo-600/10' : 'border-white/5 bg-white/5'}
            `}
                    >
                        {plan.isPopular && (
                            <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest rounded-full">
                                Most Popular
                            </div>
                        )}

                        <div className="mb-8">
                            <div className="p-3 bg-white/5 rounded-2xl w-fit mb-4">{plan.icon}</div>
                            <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                            <p className="text-gray-500 text-sm leading-relaxed">{plan.desc}</p>
                        </div>

                        <div className="flex items-baseline gap-1 mb-8">
                            <span className="text-4xl font-black text-white">{plan.price !== 'Custom' && '$'}{plan.price}</span>
                            {plan.price !== 'Custom' && <span className="text-gray-500 font-medium">/month</span>}
                        </div>

                        <Link
                            to={plan.btnLink}
                            className={`
                w-full py-4 rounded-xl font-bold mb-8 flex items-center justify-center transition-all
                ${plan.isPopular ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30' : 'bg-white/10 hover:bg-white/20 text-white'}
              `}
                        >
                            {plan.btnText}
                        </Link>

                        <div className="space-y-4">
                            {plan.features.map((feature, j) => (
                                <div key={j} className="flex items-center gap-3 text-sm text-gray-300">
                                    <Check size={16} className="text-indigo-400 flex-shrink-0" />
                                    {feature}
                                </div>
                            ))}
                            {plan.notIncluded.map((feature, j) => (
                                <div key={j} className="flex items-center gap-3 text-sm text-gray-600 line-through">
                                    <X size={16} className="flex-shrink-0" />
                                    {feature}
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-20 max-w-3xl mx-auto text-center">
                <div className="p-8 glass-panel rounded-3xl border border-white/5">
                    <h4 className="text-xl font-bold text-white mb-4">Need a custom solution?</h4>
                    <p className="text-gray-400 text-sm mb-6 leading-relaxed">
                        We offer specialized API integration, on-premise deployment, and custom model training for government agencies and large corporations.
                    </p>
                    <button className="text-indigo-400 font-bold hover:underline">Get in touch with our security experts →</button>
                </div>
            </div>
        </div>
    );
}
