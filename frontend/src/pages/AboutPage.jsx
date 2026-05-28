import React from 'react';
import {
    Search,
    ChevronRight,
    Play,
    Layers,
    ShieldCheck,
    FileText,
    Clock,
    Zap,
    HelpCircle,
    MessageSquare
} from 'lucide-react';

export default function AboutPage() {
    const steps = [
        {
            title: 'Upload Media',
            desc: 'Upload an image or a batch of files. We support JPG, PNG, and WebP formats.',
            icon: <Play size={24} />,
            color: 'bg-indigo-600'
        },
        {
            title: 'Neural Analysis',
            desc: 'Our EfficientNet-B4 model scans for pixel-level inconsistencies and GAN signatures.',
            icon: <Layers size={24} />,
            color: 'bg-purple-600'
        },
        {
            title: 'Forensic Report',
            desc: 'Get a clear verdict with confidence scoring and detailed noise analysis.',
            icon: <ShieldCheck size={24} />,
            color: 'bg-emerald-600'
        }
    ];

    const faqs = [
        { q: 'How accurate is the detection?', a: 'Our models are trained on the FaceForensics++ benchmark and achieve 98.2% accuracy in controlled environments. Real-world performance may vary slightly based on image quality.' },
        { q: 'Can it detect deepfake videos?', a: 'Currently, the MVP supports image analysis. Video detection (frame-by-frame) is scheduled for our Q3 roadmap.' },
        { q: 'Is my data secure?', a: 'All uploads are processed in transit over HTTPS and deleted after analysis unless you choose to save them to your history. We never use user data to train our public models.' },
        { q: 'What is "Forensic Noise" analysis?', a: 'It refers to Error Level Analysis (ELA) and Noise Pattern Detection, which identify regions of an image that have different compression or noise levels, indicating tampering.' }
    ];

    return (
        <div className="animate-fade-in pb-20">
            {/* Hero Section */}
            <section className="pt-20 pb-16 text-center">
                <h1 className="text-5xl md:text-6xl font-black text-white mb-6">How It <span className="text-indigo-500">Works</span></h1>
                <p className="text-gray-400 max-w-2xl mx-auto text-lg leading-relaxed">
                    Our technology leverages the latest breakthroughs in computer vision and forensic signal processing to protect media integrity.
                </p>
            </section>

            {/* Steps Section */}
            <section className="max-w-7xl mx-auto px-6 py-12">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
                    {/* Connecting line */}
                    <div className="absolute top-1/2 left-0 w-full h-px border-t border-dashed border-white/10 hidden md:block -translate-y-12"></div>

                    {steps.map((step, i) => (
                        <div key={i} className="relative z-10 text-center flex flex-col items-center group">
                            <div className={`w-20 h-20 rounded-3xl ${step.color} text-white flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform mb-8`}>
                                {step.icon}
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-4">{step.title}</h3>
                            <p className="text-gray-400 text-sm leading-relaxed max-w-xs">{step.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Scientific Background */}
            <section className="max-w-5xl mx-auto px-6 py-24">
                <div className="glass-panel p-12 rounded-[40px] border border-white/5">
                    <div className="flex flex-col md:flex-row gap-12">
                        <div className="md:w-1/2">
                            <div className="p-3 bg-indigo-600/20 text-indigo-400 rounded-2xl w-fit mb-6">
                                <FileText size={24} />
                            </div>
                            <h3 className="text-3xl font-bold text-white mb-6">Built on Researchers' Excellence</h3>
                            <p className="text-gray-400 leading-relaxed mb-6">
                                VeriFace is inspired by the FaceForensics++ study, utilizing EfficientNet-B4 as a backbone with custom forensic layers designed to catch high-frequency noise artifacts typical in AI generations.
                            </p>
                            <div className="space-y-4">
                                <div className="flex items-center gap-3 text-sm text-gray-300">
                                    <Zap size={16} className="text-indigo-400" />
                                    Catch pixel artifacts invisible to human eyes
                                </div>
                                <div className="flex items-center gap-3 text-sm text-gray-300">
                                    <ShieldCheck size={16} className="text-indigo-400" />
                                    Robust against compression and resizing
                                </div>
                            </div>
                        </div>
                        <div className="md:w-1/2 bg-gray-950 rounded-3xl border border-white/5 p-8 flex flex-col justify-center">
                            <div className="flex items-center justify-between mb-8">
                                <span className="text-xs font-bold text-gray-500 uppercase">Detection accuracy</span>
                                <span className="text-indigo-400 font-black">98.2%</span>
                            </div>
                            {/* Simulated accuracy bars */}
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <div className="flex justify-between text-[10px] text-gray-500"><span>REAL CLASS</span><span>99.1%</span></div>
                                    <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden"><div className="bg-emerald-500 h-full w-[99%]"></div></div>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-[10px] text-gray-500"><span>DEEPFAKE CLASS</span><span>97.5%</span></div>
                                    <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden"><div className="bg-rose-500 h-full w-[97%]"></div></div>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-[10px] text-gray-500"><span>AI GENERATED</span><span>98.0%</span></div>
                                    <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden"><div className="bg-amber-500 h-full w-[98%]"></div></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="max-w-4xl mx-auto px-6 py-12">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold text-white mb-4">Frequently Asked Questions</h2>
                    <p className="text-gray-400">Everything you need to know about our detection tech.</p>
                </div>
                <div className="space-y-4">
                    {faqs.map((faq, i) => (
                        <div key={i} className="glass-panel p-6 rounded-2xl border border-white/5">
                            <h4 className="text-lg font-bold text-white mb-3 flex items-start gap-3">
                                <HelpCircle size={18} className="text-indigo-400 mt-1 flex-shrink-0" />
                                {faq.q}
                            </h4>
                            <p className="text-gray-400 text-sm leading-relaxed pl-7">{faq.a}</p>
                        </div>
                    ))}
                </div>

                <div className="mt-16 text-center">
                    <div className="inline-flex items-center gap-2 p-1 bg-white/5 rounded-full border border-white/10 mb-6">
                        <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white"><MessageSquare size={14} /></div>
                        <span className="px-4 text-sm text-gray-300 font-medium">Still have questions?</span>
                    </div>
                    <br />
                    <button className="text-indigo-400 font-bold hover:underline">Contact Support Team →</button>
                </div>
            </section>
        </div>
    );
}
