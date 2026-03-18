import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Target, Zap, BarChart3, Award, Clock, Plus, X } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const Home = () => {
    const navigate = useNavigate();
    const [showHistorySidebar, setShowHistorySidebar] = useState(false);
    const [historyEntries, setHistoryEntries] = useState([]);

    useEffect(() => {
        setHistoryEntries(JSON.parse(localStorage.getItem('careerHistory') || '[]'));
    }, []);

    const loadHistoryEntry = (entry) => {
        localStorage.setItem('careerMatch', JSON.stringify(entry.data));
        navigate('/dashboard');
    };

    const startNewEntry = () => {
        localStorage.removeItem('latestFormData');
        navigate('/onboarding');
    };
    return (
        <div className="space-y-24 py-16">
            <section className="relative flex flex-col items-center text-center">
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="max-w-3xl space-y-6"
                >
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-primary/10 border border-primary/20 text-primary font-bold text-[10px] tracking-widest uppercase mb-4">
                        <Zap size={14} className="animate-pulse" />
                        AI Intelligence Protocol
                    </div>

                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight outfit leading-tight text-text-primary capitalize">
                        Architecting Your <br />
                        <span className="text-text-secondary">Future Career</span>
                    </h1>

                    <p className="text-sm text-text-secondary max-w-2xl mx-auto leading-relaxed">
                        Stop guessing your professional trajectory. SMAART uses high-fidelity intelligence to analyze your academic baseline, match industry-verified roles, and provide a clinical roadmap to employment.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
                        <Link to="/onboarding" className="btn btn-primary h-10 px-6 font-semibold">
                            Build Your Career Profile
                            <ChevronRight size={16} />
                        </Link>
                        <button onClick={() => setShowHistorySidebar(true)} className="btn btn-outline h-10 px-6 font-semibold flex items-center gap-2 justify-center">
                            <Clock size={16} /> View History
                        </button>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2, duration: 0.6 }}
                    className="mt-16 w-full max-w-4xl"
                >
                    <div className="glass-card p-2 shadow-sm relative">
                        <div className="bg-background border border-surface-border rounded overflow-hidden shadow-inner">
                            <div className="h-8 border-b border-surface-border flex items-center px-4 gap-2 bg-surface">
                                <div className="w-2.5 h-2.5 rounded-full bg-surface-border"></div>
                                <div className="w-2.5 h-2.5 rounded-full bg-surface-border"></div>
                                <div className="w-2.5 h-2.5 rounded-full bg-surface-border"></div>
                            </div>
                            <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4 bg-background">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="h-24 rounded bg-surface border border-surface-border p-4 flex flex-col gap-3">
                                        <div className="w-6 h-6 rounded bg-surface-hover"></div>
                                        <div className="w-full h-2 bg-surface-hover rounded"></div>
                                    </div>
                                ))}
                                <div className="md:col-span-2 h-48 rounded bg-surface border border-surface-border p-6 space-y-4">
                                    <div className="w-1/3 h-4 bg-surface-hover rounded"></div>
                                    <div className="w-full h-16 bg-surface-hover rounded"></div>
                                </div>
                                <div className="h-48 rounded bg-surface border border-surface-border p-6 space-y-3">
                                    <div className="w-1/2 h-4 bg-surface-hover rounded mb-4"></div>
                                    {[1, 2, 3].map(i => <div key={i} className="h-6 bg-surface-hover rounded"></div>)}
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </section>

            <section className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                {[
                    {
                        icon: <Target className="text-primary" size={20} />,
                        title: "Algorithmic Matching",
                        desc: "Cross-references your academic genesis to find your optimal career vector."
                    },
                    {
                        icon: <BarChart3 className="text-secondary" size={20} />,
                        title: "Gap Synthesis",
                        desc: "Pinpoints exactly which competencies are missing from your profile."
                    },
                    {
                        icon: <Award className="text-accent" size={20} />,
                        title: "Verified Identity",
                        desc: "Consolidates your achievements into a recognized digital passport."
                    }
                ].map((feature, i) => (
                    <motion.div
                        key={i}
                        whileHover={{ y: -2 }}
                        className="glass-card p-6 flex flex-col items-start gap-4 hover:border-primary/30"
                    >
                        <div className="w-10 h-10 rounded border border-surface-border flex items-center justify-center bg-surface-hover">
                            {feature.icon}
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-lg font-bold text-text-primary tracking-tight">{feature.title}</h3>
                            <p className="text-text-secondary text-sm leading-relaxed">
                                {feature.desc}
                            </p>
                        </div>
                    </motion.div>
                ))}
            </section>

            {/* History Sidebar */}
            <AnimatePresence>
                {showHistorySidebar && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="fixed inset-0 z-[2000] bg-black/60 backdrop-blur-sm"
                            onClick={() => setShowHistorySidebar(false)}
                        />
                        <motion.div
                            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="fixed top-0 right-0 w-80 h-full bg-surface border-l border-surface-border shadow-2xl z-[2001] flex flex-col text-left"
                        >
                            <div className="p-5 border-b border-surface-border flex justify-between items-center bg-surface w-full">
                                <h3 className="text-sm font-bold text-text-primary uppercase tracking-widest flex items-center gap-2">
                                    <Clock size={16} className="text-primary" /> Analysis History
                                </h3>
                                <button onClick={() => setShowHistorySidebar(false)} className="text-text-secondary hover:text-text-primary p-1">
                                    <X size={18} />
                                </button>
                            </div>
                            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-background">
                                {historyEntries.length === 0 ? (
                                    <p className="text-xs text-text-secondary text-center mt-10">No past analysis available.</p>
                                ) : (
                                    historyEntries.map((entry, i) => (
                                        <div
                                            key={entry.id}
                                            onClick={() => loadHistoryEntry(entry)}
                                            className="p-4 bg-surface border border-surface-border rounded-lg cursor-pointer hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/5 group"
                                        >
                                            <div className="flex justify-between items-start mb-2">
                                                <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded font-bold uppercase tracking-widest">Run 0{historyEntries.length - i}</span>
                                                <span className="text-[10px] text-text-secondary font-medium">{new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                            </div>
                                            <h4 className="text-xs font-bold text-text-primary mb-1 group-hover:text-primary transition-colors">{entry.role}</h4>
                                            <p className="text-[10px] text-text-secondary uppercase tracking-widest">
                                                {new Date(entry.timestamp).toLocaleDateString()}
                                            </p>
                                        </div>
                                    ))
                                )}
                            </div>
                            <div className="p-4 bg-surface border-t border-surface-border">
                                <button onClick={startNewEntry} className="btn w-full btn-primary py-2.5 text-[10px] uppercase font-bold tracking-widest flex items-center justify-center gap-2">
                                    <Plus size={14} /> Start New Vectors
                                </button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Home;
