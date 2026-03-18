import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Target, TrendingUp, AlertCircle, CheckCircle2, BookOpen,
    ShieldCheck, Loader2, BarChart3, Binary, Clock, Plus, RefreshCw, X,
    Cpu, Globe, Zap, ArrowRight, MessageSquare, Database, Sparkles, Star, Globe2, Layers,
    Map, AlertTriangle, Award, Briefcase, Download
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Dashboard = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [isRegenerating, setIsRegenerating] = useState(false);
    const [activeTab, setActiveTab] = useState(1);
    const [activeVector, setActiveVector] = useState('primary');
    const [matchData, setMatchData] = useState(() => {
        const stored = localStorage.getItem('careerMatch');
        return stored ? JSON.parse(stored) : null;
    });
    const [showAcknowledgement, setShowAcknowledgement] = useState(() => {
        const stored = localStorage.getItem('careerMatch');
        if (stored) {
            const data = JSON.parse(stored);
            const checkZone = data.analysis?.zone || data.analysis?.primary?.zone;
            return checkZone === 'Red';
        }
        return false;
    });
    const [chatOpen, setChatOpen] = useState(false);
    const [chatMessage, setChatMessage] = useState("");
    const [showHistorySidebar, setShowHistorySidebar] = useState(false);
    const [showJobsModal, setShowJobsModal] = useState(false);
    const [showPathwayModal, setShowPathwayModal] = useState(false);
    const [historyEntries, setHistoryEntries] = useState(() => {
        return JSON.parse(localStorage.getItem('careerHistory') || '[]');
    });
    const [chatHistory, setChatHistory] = useState([
        { role: 'ai', text: 'Diagnostic active. How can I assist you with your roadmap in ' + (matchData?.recommendations?.primary || 'your chosen field') + '?' }
    ]);
    const [completedSteps, setCompletedSteps] = useState({});

    useEffect(() => {
        setTimeout(() => setLoading(false), 2000);
    }, []);

    const loadHistoryEntry = (entry) => {
        setMatchData(entry.data);
        setShowHistorySidebar(false);
    };

    const startNewEntry = () => {
        localStorage.removeItem('latestFormData');
        navigate('/onboarding');
    };

    const deleteHistoryEntry = (e, id) => {
        e.stopPropagation();
        const updated = historyEntries.filter(entry => entry.id !== id);
        setHistoryEntries(updated);
        localStorage.setItem('careerHistory', JSON.stringify(updated));
    };

    const regenerateAnalysis = async () => {
        const storedFormData = localStorage.getItem('latestFormData');
        if (!storedFormData) {
            alert("No saved input data found. Please complete the onboarding again.");
            return;
        }
        setIsRegenerating(true);
        try {
            const parsedData = JSON.parse(storedFormData);
            const res = await axios.post(`http://${window.location.hostname}:5000/api/onboarding`, parsedData);
            
            const newAttempt = { 
                id: Date.now(), 
                timestamp: new Date().toLocaleString(), 
                role: parsedData.preferences.primary.role || 'Target Profile', 
                data: res.data 
            };
            
            const pastHistory = JSON.parse(localStorage.getItem('careerHistory') || '[]');
            const updatedHistory = [newAttempt, ...pastHistory].slice(0, 10);
            
            localStorage.setItem('careerHistory', JSON.stringify(updatedHistory));
            localStorage.setItem('careerMatch', JSON.stringify(res.data));
            
            setHistoryEntries(updatedHistory);
            setMatchData(res.data);
            
            const checkZone = res.data.analysis?.zone || res.data.analysis?.primary?.zone;
            setShowAcknowledgement(checkZone === 'Red');
            setActiveTab(1);
        } catch (err) {
            console.error('Failed to regenerate analysis:', err);
            alert("Failed to regenerate data. Please check connection and try again.");
        } finally {
            setIsRegenerating(false);
        }
    };

    const sendMessage = async () => {
        if (!chatMessage.trim()) return;
        setChatHistory(prev => [...prev, { role: 'user', text: chatMessage }]);
        setChatMessage("");

        setTimeout(() => {
            const currentTab2 = matchData?.analysis?.[activeVector]?.tab2;
            const firstSkill = currentTab2?.must_have?.[0];
            const skillName = typeof firstSkill === 'string' ? firstSkill : (firstSkill?.skill || 'core skills');

            setChatHistory(prev => [...prev, {
                role: 'ai',
                text: `Acknowledged. I recommend focusing on ${skillName} to accelerate your transition.`
            }]);
        }, 800);
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
                <Loader2 className="animate-spin text-primary" size={24} />
                <div className="text-center">
                    <h2 className="text-sm font-bold text-text-primary tracking-widest uppercase">System Initialization</h2>
                    <p className="text-xs text-text-secondary mt-1">Fetching intelligence vectors...</p>
                </div>
            </div>
        );
    }

    if (!matchData) return <div className="text-center py-20 text-sm font-medium text-text-secondary">No profile detected. Please complete onboarding.</div>;

    const { analysis, recommendations } = matchData;

    const isLegacy = !!analysis.tabs;
    const pTab = (isLegacy ? analysis.tabs : analysis.primary) || {};
    const sTab = (isLegacy ? analysis.tabs : analysis.secondary) || {};
    const tTab = (isLegacy ? analysis.tabs : analysis.tertiary) || {};
    const tab4Data = (isLegacy ? analysis.tabs?.tab4 : analysis.combined_tab4) || {};

    const currentTabs = (activeVector === 'primary' ? pTab : (activeVector === 'secondary' ? sTab : tTab)) || {};

    const overallZoneMessage = analysis.zone_message || pTab.zone_message || '';
    const currentZone = currentTabs.zone || 'Amber';

    const zoneStyles = {
        Green: { c: 'text-emerald-500', bg: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400', border: 'border-emerald-200 dark:border-emerald-500/20', icon: <CheckCircle2 size={16} /> },
        Amber: { c: 'text-amber-500', bg: 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400', border: 'border-amber-200 dark:border-amber-500/20', icon: <TrendingUp size={16} /> },
        Red: { c: 'text-red-500', bg: 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400', border: 'border-red-200 dark:border-red-500/20', icon: <AlertCircle size={16} /> }
    };
    const currentStyle = zoneStyles[currentZone] || zoneStyles.Amber;

    const getPathwaySteps = () => {
        if (!isLegacy && tab4Data?.learning_roadmap) {
            return tab4Data.learning_roadmap;
        }
        const role = recommendations[activeVector] || 'this role';
        if (activeVector === 'primary') {
            return [
                { title: 'Core Fundamentals', desc: `Mastering prerequisites for the primary ${role} transition vector.` },
                { title: 'Intermediate Tools', desc: `Building a solid toolchain specifically for ${role}.` },
                { title: 'Advanced Synthesis', desc: `Synthesizing complex concepts required for ${role}.` },
                { title: 'Real Projects', desc: `Deploying market-ready portfolios demonstrating ${role} capability.` },
                { title: 'Industry Certification', desc: `Validating your ${role} expertise with recognized credentials.` }
            ];
        } else if (activeVector === 'secondary') {
            return [
                { title: 'Transitional Basics', desc: `Bridging the core skill gap toward ${role}.` },
                { title: 'Secondary Frameworks', desc: `Learning the essential frameworks supporting ${role}.` },
                { title: 'Hybrid Synthesis', desc: `Blending your existing background with new ${role} concepts.` },
                { title: 'Adaptive Projects', desc: `Showcasing flexibility with cross-functional ${role} builds.` },
                { title: 'Competency Badging', desc: `Securing targeted micro-credentials for ${role}.` }
            ];
        } else {
            return [
                { title: 'Exploratory Concepts', desc: `Grasping the broad theoretical boundaries of ${role}.` },
                { title: 'Fallback Toolchain', desc: `Familiarizing yourself with the baseline tools for ${role}.` },
                { title: 'Foundational Exercises', desc: `Completing basic tutorials to prove ${role} functional capability.` },
                { title: 'Base Readiness', desc: `Achieving minimum viable readiness for this alternate vector.` },
                { title: 'Contingency Proof', desc: `Gathering basic credentials to keep ${role} open as a viable fallback.` }
            ];
        }
    };

    return (
        <div className="max-w-6xl mx-auto py-8">
            {/* Primary Top Header */}
            <div className="flex flex-col items-center text-center space-y-4 mb-10 border-b border-surface-border pb-8">
                <div className="flex flex-col md:flex-row items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-500 text-white flex items-center justify-center relative shadow-lg shadow-primary/20">
                        <Database size={24} />
                        <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-500 border-2 border-surface flex items-center justify-center">
                            <Sparkles size={8} className="text-white" />
                        </div>
                    </div>
                    <h1 className="text-3xl font-extrabold text-text-primary tracking-tight">Career Intelligence Agent</h1>
                    <div className="flex items-center p-1 rounded-xl bg-surface border border-surface-border shadow-sm ml-0 md:ml-4 gap-1">
                        <button
                            onClick={() => setShowHistorySidebar(true)}
                            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-[11px] font-bold text-text-secondary hover:text-text-primary hover:bg-surface-hover uppercase tracking-widest transition-colors"
                        >
                            <Clock size={14} /> History
                        </button>
                        <button onClick={startNewEntry} className="w-8 h-8 flex items-center justify-center rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-colors" title="Start New Analysis">
                            <Plus size={16} />
                        </button>
                        <button 
                            onClick={regenerateAnalysis} 
                            disabled={isRegenerating}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-widest transition-colors ${isRegenerating ? 'text-primary opacity-70 cursor-wait' : 'text-text-secondary hover:text-text-primary hover:bg-surface-hover'}`}
                            title="Regenerate from strict input data"
                        >
                            <RefreshCw size={14} className={isRegenerating ? "animate-spin" : ""} /> {isRegenerating ? 'Regenerating' : 'Regenerate'}
                        </button>
                        <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-[11px] font-bold text-text-secondary hover:text-text-primary hover:bg-surface-hover uppercase tracking-widest transition-colors">
                            <Cpu size={14} /> Simulate
                        </button>
                    </div>
                </div>
                <p className="text-[13px] text-text-secondary font-medium tracking-wide">
                    AI-Powered Career Intelligence Engine — combining structured career data with<br />
                    personalized AI analysis to build your career roadmap
                </p>
            </div>

            <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-8">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="bg-surface-hover text-text-secondary px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest border border-surface-border">CORE SECURE</div>
                        <div className="bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest border border-emerald-200 dark:border-emerald-500/20 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                            Live Sync
                        </div>
                    </div>
                    <h2 className="text-xl font-bold text-text-primary tracking-tight uppercase">Career Intelligence Report</h2>
                </div>

                <div className={`px-4 py-3 rounded-md border ${currentStyle.bg} ${currentStyle.border} flex flex-col gap-2 relative group cursor-pointer`}>
                    <div className="flex justify-between items-center gap-6">
                        <div className="text-left">
                            <p className="text-[9px] font-bold uppercase tracking-widest opacity-80">Compatibility Zone</p>
                            <p className={`text-lg font-bold uppercase`}>{currentZone} Zone</p>
                            {currentTabs.preparation_time && <p className="text-[10px] opacity-80 mt-0.5">Prep: {currentTabs.preparation_time}</p>}
                        </div>
                        <div className="w-8 h-8 rounded bg-background border border-surface-border flex items-center justify-center">
                            {currentStyle.icon}
                        </div>
                    </div>
                    {currentTabs.match_explanation && (
                        <div className="hidden group-hover:block absolute top-full right-0 mt-2 p-3 bg-surface border border-surface-border rounded-lg shadow-xl w-64 z-50 text-[10px] text-text-secondary leading-relaxed">
                            <strong className="text-text-primary block mb-1">Analysis Logic:</strong>
                            {currentTabs.match_explanation}
                        </div>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                {[
                    { id: 'primary', title: recommendations.primary, tier: 'Priority 1', label: 'Primary Path', icon: <Target className="text-primary" size={14} /> },
                    { id: 'secondary', title: recommendations.secondary, tier: 'Priority 2', label: 'Secondary Path', icon: <TrendingUp className={activeVector === 'secondary' ? "text-primary" : "text-text-secondary"} size={14} /> },
                    { id: 'tertiary', title: recommendations.tertiary, tier: 'Priority 3', label: 'Alternate Path', icon: <Zap className={activeVector === 'tertiary' ? "text-primary" : "text-text-secondary"} size={14} /> }
                ].map((item) => (
                    <div
                        key={item.id}
                        onClick={() => setActiveVector(item.id)}
                        className={`glass-card flex flex-col justify-between h-32 cursor-pointer transition-all ${activeVector === item.id ? 'ring-2 ring-primary bg-primary/5 shadow-lg shadow-primary/10' : 'hover:bg-surface-hover hover:border-text-secondary/30'}`}
                    >
                        <div>
                            <span className="text-[9px] font-bold text-text-secondary uppercase tracking-widest block mb-2">{item.tier}</span>
                            <h3 className={`text-base font-bold leading-tight ${activeVector === item.id ? 'text-primary' : 'text-text-primary'}`}>{item.title}</h3>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] font-medium text-text-secondary mt-2">
                            {item.icon} {item.label}
                        </div>
                    </div>
                ))}
            </div>

            <div className="space-y-6">
                <div className="flex gap-1 border-b border-surface-border pb-px">
                    {[
                        { id: 1, label: 'Market Intel', icon: <Globe size={14} /> },
                        { id: 2, label: 'Technical Skills', icon: <Binary size={14} /> },
                        { id: 3, label: 'AI Tools', icon: <Cpu size={14} /> },
                        { id: 4, label: 'Learning Pathway', icon: <Layers size={14} /> },
                        { id: 5, label: 'Future Scope', icon: <Globe2 size={14} /> }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold transition-all border-b-2 -mb-px ${activeTab === tab.id ? 'border-primary text-primary bg-primary/5' : 'border-transparent text-text-secondary hover:text-text-primary hover:bg-surface-hover'}`}
                        >
                            {tab.icon} {tab.label}
                        </button>
                    ))}
                </div>

                <div className="min-h-[300px]">
                    <AnimatePresence mode="wait">
                        {activeTab === 1 && (
                            <motion.div key="t1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                                <div className="lg:col-span-2 glass-card space-y-5">
                                    <div className="flex items-center gap-2 mb-2 border-b border-surface-border pb-3">
                                        <BarChart3 className="text-primary" size={16} />
                                        <h4 className="text-sm font-bold text-text-primary uppercase tracking-widest">Economic Indicators & Market Landscape</h4>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-3 bg-surface border border-surface-border rounded-md">
                                            <p className="text-[9px] text-text-secondary uppercase tracking-widest mb-1.5">Yearly Growth</p>
                                            <p className="text-sm font-bold text-text-primary">{currentTabs.tab1.job_demand}</p>
                                        </div>
                                        <div className="p-3 bg-surface border border-surface-border rounded-md">
                                            <p className="text-[9px] text-text-secondary uppercase tracking-widest mb-1.5">Average Salary Range</p>
                                            <p className="text-sm font-bold text-emerald-500">{currentTabs.tab1.salary_range}</p>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="p-4 bg-surface border border-surface-border rounded-md">
                                            <h6 className="text-[10px] font-bold text-primary uppercase tracking-widest mb-1.5 flex items-center gap-1.5"><Globe2 size={12} /> Typical Employers (India)</h6>
                                            <p className="text-xs text-text-secondary leading-relaxed">{currentTabs.tab1.typical_employers_india || 'Top IT Consultancies, Product Startups, and Enterprise Organizations.'}</p>
                                        </div>
                                        <div className="p-4 bg-surface border border-surface-border rounded-md">
                                            <h6 className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest mb-1.5 flex items-center gap-1.5"><TrendingUp size={12} /> Common Entry Paths</h6>
                                            <p className="text-xs text-text-secondary leading-relaxed">{currentTabs.tab1.common_entry_paths || 'Through campus placements, structured internships, or direct junior applications.'}</p>
                                        </div>
                                    </div>
                                    <div className="p-4 bg-primary/5 border border-primary/20 rounded-md">
                                        <h5 className="text-[9px] font-bold text-primary uppercase tracking-widest mb-2 flex items-center gap-1"><Cpu size={12} /> AI Automation Impact</h5>
                                        <p className="text-xs text-text-primary leading-relaxed font-medium">"{currentTabs.tab1.ai_impact || currentTabs.tab1.ai_narrative}"</p>
                                    </div>
                                    <button onClick={() => setShowJobsModal(true)} className="btn btn-primary w-full py-2.5 text-[10px] uppercase font-bold tracking-widest mt-4">
                                        Explore Active Job Roles
                                    </button>
                                </div>
                                <div className="glass-card space-y-4">
                                    <h4 className="text-[10px] uppercase tracking-widest font-bold pb-2 border-b border-surface-border text-text-primary">Emerging Sub-Roles</h4>
                                    <p className="text-[10px] text-text-secondary italic -mt-2 leading-relaxed">{currentTabs.tab1.role_description}</p>
                                    <div className="space-y-2">
                                        {(currentTabs.tab1?.emerging_roles || []).map((r, i) => {
                                            const rName = typeof r === 'string' ? r : r.name;
                                            const rDesc = typeof r === 'string' ? '' : r.description;
                                            return (
                                                <div key={i} className="p-3 cursor-default bg-surface hover:bg-surface-hover border border-surface-border rounded-md flex items-start gap-3 transition-colors">
                                                    <div className="text-[9px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded shrink-0 mt-0.5">0{i + 1}</div>
                                                    <div>
                                                        <span className="text-xs font-semibold text-text-primary block">{rName}</span>
                                                        {rDesc && <span className="text-[10px] text-text-secondary mt-1 block leading-snug">{rDesc}</span>}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {activeTab === 2 && (
                            <motion.div key="t2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-6">
                                <div className="glass-card relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-48 h-48 bg-red-500/5 rounded-full blur-3xl pointer-events-none"></div>
                                    <h5 className="text-sm font-bold text-red-500 mb-6 flex items-center gap-2 border-b border-surface-border pb-3 relative z-10">
                                        <AlertCircle size={16} /> CRITICAL / MUST-HAVE SKILLS
                                    </h5>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 relative z-10">
                                        {(currentTabs.tab2?.must_have || []).map((s, i) => {
                                            const skillName = typeof s === 'string' ? s : s.skill;
                                            const priority = typeof s === 'string' ? '' : s.priority;
                                            const desc = typeof s === 'string' ? '' : s.description;
                                            return (
                                                <div key={i} className="group flex flex-col p-4 bg-gradient-to-br from-surface to-surface-hover border border-surface-border hover:border-red-500/40 rounded-xl transition-all hover:shadow-[0_0_20px_rgba(239,68,68,0.1)]">
                                                    <div className="flex items-start justify-between mb-3 gap-2">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center text-red-500 font-bold text-[11px] shrink-0">0{i + 1}</div>
                                                            <span className="text-sm text-text-primary leading-tight font-bold group-hover:text-red-400 transition-colors">{skillName}</span>
                                                        </div>
                                                    </div>
                                                    {priority && (
                                                        <div className="mb-3">
                                                            <span className="inline-block text-[9px] bg-red-500/10 text-red-500 border border-red-500/20 px-2 py-0.5 rounded-full font-bold uppercase tracking-widest">
                                                                Level: {priority}
                                                            </span>
                                                        </div>
                                                    )}
                                                    {desc && <span className="text-[11px] text-text-secondary leading-relaxed mt-auto">{desc}</span>}
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                                <div className="glass-card relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none"></div>
                                    <h5 className="text-sm font-bold text-emerald-500 mb-6 flex items-center gap-2 border-b border-surface-border pb-3 relative z-10">
                                        <ShieldCheck size={16} /> DIFFERENTIATOR / NICE-TO-HAVE SKILLS
                                    </h5>
                                    <div className="flex flex-wrap gap-3 relative z-10">
                                        {(currentTabs.tab2?.nice_to_have || []).map((s, i) => (
                                            <div key={i} className="flex items-center gap-2 py-2 px-4 bg-surface border border-surface-border hover:border-emerald-500/40 rounded-full transition-all hover:bg-emerald-500/5 cursor-default hover:shadow-[0_0_10px_rgba(16,185,129,0.1)]">
                                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 shadow-[0_0_5px_rgba(16,185,129,0.5)]"></div>
                                                <span className="text-xs font-semibold text-text-primary">{s}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {activeTab === 3 && (
                            <motion.div key="t3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <h6 className="text-[10px] font-bold text-text-secondary uppercase tracking-widest border-b border-surface-border pb-2">AI Tools & Platforms</h6>
                                        <div className="grid grid-cols-1 gap-2">
                                            {(currentTabs.tab3?.ai_tools || currentTabs.tab3?.must_have_ai_skills || []).map((t, i) => {
                                                const tName = typeof t === 'string' ? t : t.name;
                                                const tCat = typeof t === 'string' ? 'Tool' : t.category;
                                                const tUsage = typeof t === 'string' ? '' : t.usage;
                                                return (
                                                    <div key={i} className="p-3 bg-surface border border-surface-border rounded-md">
                                                        <div className="flex justify-between items-start mb-1">
                                                            <span className="text-xs font-bold text-text-primary">{tName}</span>
                                                            <span className="text-[9px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded uppercase">{tCat}</span>
                                                        </div>
                                                        {tUsage && <p className="text-[10px] text-text-secondary mt-1 leading-snug">{tUsage}</p>}
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    </div>
                                    <div className="space-y-6">
                                        <div className="space-y-2">
                                            <h6 className="text-[10px] font-bold text-text-secondary uppercase tracking-widest border-b border-surface-border pb-2">AI Exposure & Human Value</h6>
                                            {currentTabs.tab3?.ai_exposure ? (
                                                <div className="p-4 bg-primary/5 border border-primary/20 rounded-md space-y-3">
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-[10px] text-text-secondary font-bold uppercase">Exposure Level</span>
                                                        <span className="text-xs font-bold text-primary">{currentTabs.tab3.ai_exposure.percentage} ({currentTabs.tab3.ai_exposure.level})</span>
                                                    </div>
                                                    <div className="space-y-1 text-[10px]">
                                                        <p><strong className="text-text-primary">AI Assists With:</strong> <span className="text-text-secondary">{currentTabs.tab3.ai_exposure.tasks_assisted}</span></p>
                                                        <p><strong className="text-text-primary">Human Value:</strong> <span className="text-text-secondary">{currentTabs.tab3.ai_exposure.human_value}</span></p>
                                                    </div>
                                                </div>
                                            ) : (
                                                <p className="text-xs text-text-secondary italic">Exposure data generating...</p>
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            <h6 className="text-[10px] font-bold text-text-secondary uppercase tracking-widest border-b border-surface-border pb-2">Top Human Skills</h6>
                                            <div className="flex flex-wrap gap-2">
                                                {(currentTabs.tab3?.human_skills || []).map((hs, i) => (
                                                    <span key={i} className="text-[10px] bg-background border border-surface-border px-2 py-1 rounded-sm text-text-primary">{hs}</span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {activeTab === 4 && (
                            <motion.div key="t4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                                <div className="p-6 bg-gradient-to-r from-primary/10 via-surface to-accent/5 border border-primary/20 shadow-lg rounded-2xl relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-3xl -mr-10 -mt-20 group-hover:bg-primary/20 transition-all duration-700"></div>
                                    <div className="flex items-center gap-4 mb-4 relative z-10">
                                        <div className="bg-primary/20 p-3 rounded-xl border border-primary/30 shadow-[0_0_15px_rgba(79,70,229,0.2)]">
                                            <Sparkles className="text-primary" size={24} />
                                        </div>
                                        <div>
                                            <h4 className="text-xl font-black uppercase tracking-tight text-white drop-shadow-sm">Personalized Learning Pathway</h4>
                                            <p className="text-xs font-bold text-primary tracking-widest uppercase mt-1">Accelerated Trajectory Active</p>
                                        </div>
                                    </div>
                                    <p className="text-sm text-text-secondary leading-relaxed max-w-4xl relative z-10">
                                        {tab4Data.combined_pathway_summary || `A structured and dynamic roadmap designed to bridge the missing skill gap towards ${recommendations?.primary || 'your target role'}, leveraging modern tools and foundational certifications.`}
                                    </p>
                                </div>

                                {tab4Data.skill_gap && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="glass-card shadow-lg border border-emerald-500/20 relative overflow-hidden">
                                            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-2xl rounded-full pointer-events-none"></div>
                                            <h6 className="text-xs font-black text-emerald-500 uppercase tracking-widest mb-4 flex items-center gap-2 relative z-10">
                                                <CheckCircle2 size={16}/> Current Competency
                                            </h6>
                                            <div className="flex flex-wrap gap-2 relative z-10 justify-start">
                                                {(tab4Data.skill_gap?.current_skills || []).map((s, i) => <span key={i} className="text-[11px] font-bold bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-lg text-emerald-400">{s}</span>)}
                                            </div>
                                        </div>
                                        <div className="glass-card shadow-lg border border-amber-500/20 relative overflow-hidden">
                                            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 blur-2xl rounded-full pointer-events-none"></div>
                                            <h6 className="text-xs font-black text-amber-500 uppercase tracking-widest mb-4 flex items-center gap-2 relative z-10">
                                                <AlertCircle size={16}/> Target Competency
                                            </h6>
                                            <div className="flex flex-wrap gap-2 relative z-10 justify-start">
                                                {(tab4Data.skill_gap?.missing_skills || []).map((s, i) => <span key={i} className="text-[11px] font-bold bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-lg text-amber-500">{s}</span>)}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="glass-card mt-8 p-0 overflow-hidden shadow-2xl border border-white/10">
                                    <div className="bg-gradient-to-r from-surface to-[#0d1117] px-6 py-4 border-b border-surface-border flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                                        <h3 className="text-lg font-black text-white flex items-center gap-3">
                                            <Target className="text-accent" size={24}/> What Needs To Be Done
                                        </h3>
                                        <span className="text-[10px] uppercase tracking-widest font-bold bg-white/5 px-3 py-1.5 rounded-full text-text-secondary border border-white/10">
                                            {getPathwaySteps().length} Steps • ~{getPathwaySteps().length * 15}h Total
                                        </span>
                                    </div>
                                    <div className="divide-y divide-surface-border">
                                        {getPathwaySteps().map((step, i) => {
                                            const isChecked = completedSteps[i];
                                            const estimatedHours = 10 + (i * 5);
                                            return (
                                                <div key={i} className={`p-6 transition-all duration-300 flex gap-6 ${isChecked ? 'bg-emerald-500/5' : 'hover:bg-white/5'}`}>
                                                    <div className="flex flex-col items-center gap-2 pt-1">
                                                        <div 
                                                            onClick={() => setCompletedSteps(prev => ({ ...prev, [i]: !prev[i] }))}
                                                            className={`w-8 h-8 rounded-lg border-2 flex items-center justify-center cursor-pointer transition-all ${isChecked ? 'bg-emerald-500 border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.4)]' : 'bg-surface border-surface-border hover:border-primary'}`}
                                                        >
                                                            {isChecked && <CheckCircle2 size={16} className="text-[#0d1117]" />}
                                                        </div>
                                                        {i < getPathwaySteps().length - 1 && <div className={`w-0.5 h-full min-h-[40px] ${isChecked ? 'bg-emerald-500/30' : 'bg-surface-border'}`}></div>}
                                                    </div>
                                                    <div className="flex-1 pb-4">
                                                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-2 gap-2">
                                                            <h4 className={`text-base font-bold uppercase tracking-tight transition-colors ${isChecked ? 'text-emerald-400 line-through opacity-70' : 'text-white'}`}>
                                                                {step.title || step.step}
                                                            </h4>
                                                            <span className="flex items-center w-max gap-1.5 text-[10px] font-bold text-text-secondary bg-surface px-2.5 py-1 rounded border border-surface-border uppercase tracking-widest">
                                                                <Clock size={12}/> {estimatedHours}h
                                                            </span>
                                                        </div>
                                                        <p className={`text-sm leading-relaxed max-w-3xl transition-all ${isChecked ? 'text-text-secondary/50 line-through' : 'text-text-secondary'}`}>
                                                            {step.desc || step.description}
                                                        </p>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-6">
                                    <div className="glass-card p-6 shadow-xl border border-white/5 hover:border-primary/30 transition-all group">
                                        <div className="bg-primary/10 w-12 h-12 rounded-xl flex items-center justify-center mb-4 border border-primary/20 group-hover:scale-110 transition-transform">
                                            <Award size={24} className="text-primary"/>
                                        </div>
                                        <h6 className="text-sm font-black text-white mb-4 uppercase tracking-widest">Recommended Certs</h6>
                                        <div className="space-y-4">
                                            {(tab4Data.certifications || []).map((d, i) => {
                                                const isStr = typeof d === 'string';
                                                return (
                                                    <div key={i} className="pl-4 border-l-2 border-primary/30">
                                                        {isStr ? <span className="text-xs font-semibold text-text-secondary">{d}</span> : (
                                                            <>
                                                                <span className="font-bold text-sm text-white block mb-0.5">{d.name}</span>
                                                                <span className="text-[10px] text-text-secondary block font-medium">{d.issuer} • {d.difficulty} • {d.duration}</span>
                                                            </>
                                                        )}
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    </div>
                                    
                                    <div className="glass-card p-6 shadow-xl border border-white/5 hover:border-accent/30 transition-all group">
                                        <div className="bg-accent/10 w-12 h-12 rounded-xl flex items-center justify-center mb-4 border border-accent/20 group-hover:scale-110 transition-transform">
                                            <BookOpen size={24} className="text-accent"/>
                                        </div>
                                        <h6 className="text-sm font-black text-white mb-4 uppercase tracking-widest">Free Courses</h6>
                                        <div className="space-y-4">
                                            {(tab4Data.free_courses || []).map((d, i) => {
                                                const isStr = typeof d === 'string';
                                                return (
                                                    <div key={i} className="pl-4 border-l-2 border-accent/30">
                                                        {isStr ? <span className="text-xs font-semibold text-text-secondary">{d}</span> : (
                                                            <>
                                                                <span className="font-bold text-sm text-white block mb-0.5">{d.course_name}</span>
                                                                <div className="flex justify-between items-center text-[10px] font-medium mt-1">
                                                                    <span className="text-text-secondary">On {d.platform}</span>
                                                                    <span className="text-emerald-400 font-bold uppercase tracking-widest">{d.link_status}</span>
                                                                </div>
                                                            </>
                                                        )}
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    </div>

                                    <div className="glass-card p-6 shadow-xl border border-white/5 hover:border-indigo-500/30 transition-all group">
                                        <div className="bg-indigo-500/10 w-12 h-12 rounded-xl flex items-center justify-center mb-4 border border-indigo-500/20 group-hover:scale-110 transition-transform">
                                            <Briefcase size={24} className="text-indigo-400"/>
                                        </div>
                                        <h6 className="text-sm font-black text-white mb-4 uppercase tracking-widest">Portfolio Projects</h6>
                                        <div className="space-y-4">
                                            {(tab4Data.projects || []).map((d, i) => {
                                                const isStr = typeof d === 'string';
                                                return (
                                                    <div key={i} className="pl-4 border-l-2 border-indigo-500/30">
                                                        {isStr ? <span className="text-xs font-semibold text-text-secondary">{d}</span> : (
                                                            <>
                                                                <span className="font-bold text-sm text-white block mb-0.5 leading-tight">{d.project_name}</span>
                                                                <span className="text-[10px] text-text-secondary block mb-2 leading-relaxed">{d.description}</span>
                                                                <span className="text-[9px] font-black text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded uppercase tracking-wider block w-fit">{d.skills_demonstrated}</span>
                                                            </>
                                                        )}
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex flex-col md:flex-row gap-6 mt-8">
                                    <button onClick={() => setShowPathwayModal(true)} className="btn btn-primary shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:shadow-[0_0_30px_rgba(79,70,229,0.5)] w-full py-4 text-xs font-black tracking-widest uppercase flex items-center justify-center gap-3 flex-1 transition-all">
                                        <Layers size={18} /> Interactive Pathway Diagram
                                    </button>
                                    <button className="btn btn-outline bg-white/5 border-white/10 hover:border-white/30 hover:bg-white/10 w-full py-4 text-xs font-black tracking-widest uppercase flex-1 flex items-center justify-center gap-3 transition-all">
                                        <Download size={18}/> Export Roadmap PDF
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {activeTab === 5 && (
                            <motion.div key="t5" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                                <div className="glass-card">
                                    <div className="flex items-center gap-3 border-b border-surface-border pb-4 mb-4">
                                        <div className="bg-primary/10 p-2 rounded-full"><Star className="text-primary" size={16} /></div>
                                        <h4 className="text-sm font-bold uppercase tracking-widest text-text-primary">Future Scope & Beneficiaries</h4>
                                    </div>
                                    <p className="text-xs text-text-secondary leading-relaxed mb-6 font-medium">
                                        {currentTabs.tab5?.future_scope || `Exploring the future horizon for ${recommendations?.[activeVector] || 'this role'}. Generative models indicate stable long-term trajectory.`}
                                    </p>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="p-4 bg-surface border border-surface-border rounded-md">
                                            <h6 className="text-[10px] font-bold text-primary uppercase tracking-widest mb-2 flex items-center gap-2">
                                                <Target size={12} /> Target Audience / Beneficiaries
                                            </h6>
                                            <p className="text-xs text-text-secondary leading-relaxed">
                                                {currentTabs.tab5?.target_audience || 'Enterprise organizations, SMBs, and digital platforms integrating AI capability.'}
                                            </p>
                                        </div>
                                        <div className="p-4 bg-surface border border-surface-border rounded-md">
                                            <h6 className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                                                <TrendingUp size={12} /> Growth Trajectory (5-10 yrs)
                                            </h6>
                                            <p className="text-xs text-text-secondary leading-relaxed">
                                                {currentTabs.tab5?.growth_trajectory || 'High expansion likelihood as AI permeates underlying business operations.'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            <div className="bg-surface border border-surface-border p-4 rounded-lg mt-12 mb-8 max-w-4xl mx-auto text-center">
                <p className="text-[10px] text-text-secondary italic leading-relaxed">
                    <span className="font-bold text-primary">Disclaimer:</span> The insights and roadmap pathways generated above are intelligent estimations dynamically created based on your specific combination of academic background, stated interests, and past experience. This intelligence tool serves as a professional guiding framework rather than a guaranteed career outcome.
                </p>
            </div>

            <div className="fixed bottom-6 right-6 z-[100]">
                <AnimatePresence>
                    {chatOpen && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                            className="bg-surface border border-surface-border rounded-lg w-[320px] h-[400px] shadow-2xl flex flex-col overflow-hidden mb-4"
                        >
                            <div className="p-3 bg-surface-hover border-b border-surface-border flex justify-between items-center">
                                <span className="text-[10px] font-bold text-text-primary uppercase tracking-widest flex items-center gap-2">
                                    <Sparkles size={12} className="text-primary" />
                                    Terminal Agent
                                </span>
                                <button onClick={() => setChatOpen(false)} className="text-text-secondary hover:text-text-primary text-xs">×</button>
                            </div>
                            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-background">
                                {chatHistory.map((m, i) => (
                                    <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[85%] p-2.5 rounded-md text-[11px] leading-relaxed border ${m.role === 'user' ? 'bg-primary text-white border-primary' : 'bg-surface text-text-primary border-surface-border'}`}>
                                            {m.text}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="p-3 bg-surface border-t border-surface-border flex gap-2">
                                <input
                                    className="input-field py-1.5 px-3 text-[11px]"
                                    placeholder="Input query..."
                                    value={chatMessage}
                                    onChange={e => setChatMessage(e.target.value)}
                                    onKeyPress={e => e.key === 'Enter' && sendMessage()}
                                />
                                <button onClick={sendMessage} className="bg-primary text-white p-2 rounded-md hover:bg-primary-dark transition-colors">
                                    <ArrowRight size={14} />
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
                <button
                    onClick={() => setChatOpen(!chatOpen)}
                    className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center shadow-lg hover:bg-primary-dark transition-all relative ml-auto"
                >
                    <MessageSquare size={16} />
                </button>
            </div>

            {showAcknowledgement && (
                <div className="fixed inset-0 z-[1000] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                    <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="max-w-sm w-full bg-surface border border-surface-border rounded-lg p-6 text-center space-y-4 shadow-2xl">
                        <AlertCircle size={24} className="text-red-500 mx-auto" />
                        <div className="space-y-2">
                            <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider">Red Zone Notification</h3>
                            <p className="text-xs text-text-secondary leading-relaxed">"{overallZoneMessage || 'This role usually requires a different educational background. Additional preparation of approximately 6–12 months may be required.'}"</p>
                        </div>
                        <button
                            onClick={() => setShowAcknowledgement(false)}
                            className="bg-red-500 hover:bg-red-600 text-white w-full py-2.5 rounded-md text-[10px] font-bold uppercase tracking-widest mt-4 transition-colors"
                        >
                            Acknowledge Risk
                        </button>
                    </motion.div>
                </div>
            )}

            {showPathwayModal && (
                <div className="fixed inset-0 z-[3000] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                    <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="max-w-2xl w-full bg-surface border border-surface-border rounded-lg p-6 shadow-2xl relative">
                        <div className="flex justify-between items-center border-b border-surface-border pb-4 mb-6">
                            <h3 className="text-sm font-bold text-text-primary uppercase tracking-widest flex items-center gap-2">
                                <Layers size={16} className="text-primary" /> Learning Pathway Diagram ({activeVector})
                            </h3>
                            <button onClick={() => setShowPathwayModal(false)}><X size={18} className="text-text-secondary hover:text-text-primary" /></button>
                        </div>
                        <div className="flex flex-col gap-4 relative">
                            <div className="absolute left-[15px] top-4 bottom-4 w-0.5 bg-surface-border z-0"></div>
                            {getPathwaySteps().map((step, i) => (
                                <div key={i} className="flex items-center gap-4 z-10">
                                    <div className="w-8 h-8 rounded-full bg-background border-2 border-primary flex items-center justify-center text-[10px] font-bold text-primary shrink-0">0{i + 1}</div>
                                    <div className="bg-background border border-surface-border p-3 rounded-md flex-1">
                                        <h4 className="text-[11px] font-bold text-text-primary uppercase tracking-widest">{step.title || step.step}</h4>
                                        <p className="text-[10px] text-text-secondary mt-1">{step.desc || step.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            )}

            {showJobsModal && (
                <div className="fixed inset-0 z-[3000] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                    <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="max-w-md w-full bg-surface border border-surface-border rounded-lg p-6 shadow-2xl text-center">
                        <h3 className="text-sm font-bold text-text-primary uppercase tracking-widest flex justify-center items-center gap-2 mb-4">
                            <Target size={16} className="text-primary" /> Active Job Roles
                        </h3>
                        <p className="text-xs text-text-secondary mb-6">Connecting to real-time employer hiring grids...</p>
                        <div className="space-y-3">
                            <div className="p-3 bg-background border border-surface-border rounded flex justify-between items-center text-left">
                                <div><h4 className="text-xs font-bold text-text-primary">Junior Coordinator</h4><p className="text-[9px] text-text-secondary uppercase">TechCorp Inc.</p></div>
                                <span className="text-[10px] bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded font-bold">92% Match</span>
                            </div>
                            <div className="p-3 bg-background border border-surface-border rounded flex justify-between items-center text-left">
                                <div><h4 className="text-xs font-bold text-text-primary">Systems Analyst I</h4><p className="text-[9px] text-text-secondary uppercase">Global Stack</p></div>
                                <span className="text-[10px] bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded font-bold">88% Match</span>
                            </div>
                            <div className="p-3 bg-background border border-surface-border rounded flex justify-between items-center text-left">
                                <div><h4 className="text-xs font-bold text-text-primary">Process Executive</h4><p className="text-[9px] text-text-secondary uppercase">Stark Industries</p></div>
                                <span className="text-[10px] bg-amber-500/10 text-amber-500 px-2 py-0.5 rounded font-bold">75% Match</span>
                            </div>
                        </div>
                        <button onClick={() => setShowJobsModal(false)} className="btn btn-primary w-full py-2 text-[10px] uppercase font-bold mt-6">Close Explorer</button>
                    </motion.div>
                </div>
            )}

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
                            className="fixed top-0 right-0 w-80 h-full bg-surface border-l border-surface-border shadow-2xl z-[2001] flex flex-col"
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
                                            <div className="flex justify-between items-start mb-2 group/btn">
                                                <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded font-bold uppercase tracking-widest">Run 0{historyEntries.length - i}</span>
                                                <div className="flex items-center gap-3">
                                                    <span className="text-[10px] text-text-secondary font-medium">{new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                    <button 
                                                        onClick={(e) => deleteHistoryEntry(e, entry.id)}
                                                        className="text-red-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-red-400/10"
                                                        title="Delete entry"
                                                    >
                                                        <X size={12} strokeWidth={3} />
                                                    </button>
                                                </div>
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
                                    <Plus size={14} /> Start New Analysis
                                </button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Dashboard;
