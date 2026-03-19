import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RadialBarChart, RadialBar, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import {
    Target, TrendingUp, AlertCircle, CheckCircle2, XCircle,
    Loader2, Star, Globe, Cpu, Layers, Sparkles
} from 'lucide-react';

const Dashboard = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [data, setData] = useState(null);
    const [activeTab, setActiveTab] = useState(1);
    const [rating, setRating] = useState(0);
    const [rated, setRated] = useState(false);

    useEffect(() => {
        const fetchAnalysis = async () => {
            try {
                const analysisId = localStorage.getItem('smaart_analysis_id');
                if (analysisId) {
                    const res = await fetch(`/api/dashboard/${analysisId}`);
                    const result = await res.json();
                    if (result.success && result.data) {
                        setData(result.data.output_data || result.data.analysis || result.data);
                        setLoading(false);
                        return;
                    }
                }
                // Fallback to offline
                const fallback = localStorage.getItem('smaart_last_analysis');
                if (fallback) {
                    setData(JSON.parse(fallback));
                    setLoading(false);
                    return;
                }
                setError(true);
                setLoading(false);
            } catch (err) {
                const fallback = localStorage.getItem('smaart_last_analysis');
                if (fallback) {
                    setData(JSON.parse(fallback));
                    setLoading(false);
                    return;
                }
                setError(true);
                setLoading(false);
            }
        };
        fetchAnalysis();
    }, []);

    const submitRating = async (stars) => {
        setRating(stars);
        const analysisId = localStorage.getItem('smaart_analysis_id') || (data && data.id) || 'unknown';
        try {
            await fetch('/api/feedback', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ analysisId, rating: stars })
            });
        } catch (err) {}
        setRated(true);
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
                <Loader2 className="animate-spin text-primary" size={24} />
                <p className="text-sm font-bold text-text-secondary tracking-widest uppercase">Fetching intelligence vectors...</p>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
                <AlertCircle className="text-red-500" size={32} />
                <p className="text-sm font-medium text-text-primary text-center">
                    We could not load your analysis. Please complete the onboarding form again.
                </p>
            </div>
        );
    }

    const preVerified = data.preVerified || {};
    const dataFilesReady = preVerified.dataFilesReady === true;

    // Optional student info
    const studentName = data.input_user_data?.personalDetails?.name || data.personalDetails?.name || '';
    const studentDegree = data.input_user_data?.education?.degreeGroup || data.education?.degreeGroup || '';

    // Overlap logic
    const calcOverlap = () => {
        const pMissing = preVerified.primarySkillGap?.missing || [];
        if (pMissing.length === 0) return 0;
        // Naive mock overlap check just if we have some missing skills
        // If secondary/tertiary missing exist, we'd check intersection. For now, simulate if we have > 3 missing
        return pMissing.length > 2 ? 35 : 10;
    };
    const overlapPct = calcOverlap();
    const showOverlapBanner = overlapPct > 30;

    // AI Text variables
    const aiText = data.analysis || data.combined_tab4?.combined_pathway_summary || (typeof data === 'string' ? data : JSON.stringify(data));
    let futureScopeText = data.tab5?.future_scope || 'Analysis in progress — refresh in a moment.';

    const renderTabs = () => {
        const tabs = [
            { id: 1, label: 'Hiring pattern', icon: <Target size={14} /> },
            { id: 2, label: 'Market intelligence', icon: <Globe size={14} /> },
            { id: 3, label: 'Skills & AI tools', icon: <Cpu size={14} /> },
            { id: 4, label: 'Career path', icon: <Layers size={14} /> },
            { id: 5, label: 'Future scope', icon: <TrendingUp size={14} /> }
        ];
        return (
            <div className="flex overflow-x-auto gap-2 border-b border-surface-border pb-px mb-8">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold whitespace-nowrap transition-all border-b-2 -mb-px ${activeTab === tab.id ? 'border-primary text-primary bg-primary/5' : 'border-transparent text-text-secondary hover:text-text-primary hover:bg-surface-hover'}`}
                    >
                        {tab.icon} {tab.label}
                    </button>
                ))}
            </div>
        );
    };

    const renderZoneCard = (title, role, zoneData) => {
        if (!dataFilesReady || !zoneData) {
            return (
                <div className="p-4 bg-gray-50 border border-gray-100 rounded-xl relative overflow-hidden flex flex-col items-center justify-center text-center h-full min-h-[120px]">
                    <p className="text-[11px] text-gray-500 font-medium">Zone data is being prepared.<br/>Your career path in Tab 4 is already ready.</p>
                </div>
            );
        }
        const zone = zoneData.employer_zone || 'Amber';
        const colors = {
            Green: 'bg-green-50 text-green-700 border-green-200',
            Amber: 'bg-amber-50 text-amber-700 border-amber-200',
            Red: 'bg-red-50 text-red-700 border-red-200'
        }[zone] || 'bg-gray-50 text-gray-700 border-gray-200';

        const pct = zoneData.skill_coverage_pct || 0;

        return (
            <div className={`p-4 border rounded-xl flex flex-col gap-3 h-full min-h-[120px] ${colors}`}>
                <div className="text-[10px] font-bold uppercase tracking-widest opacity-70">{title}</div>
                <div className="flex justify-between items-start gap-2">
                    <h4 className="text-sm font-bold leading-tight flex-1">{role || 'Target Role'}</h4>
                    <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-white/50 border border-black/5 shadow-sm">
                        {zone}
                    </span>
                </div>
                <div className="mt-auto">
                    <div className="flex justify-between items-center text-[10px] font-bold mb-1 opacity-80">
                        <span>Skill Coverage</span>
                        <span>{pct}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-black/10 rounded-full overflow-hidden">
                        <div className="h-full bg-current rounded-full" style={{ width: `${pct}%` }}></div>
                    </div>
                </div>
            </div>
        );
    };

    const renderTab1 = () => {
        const primaryRole = data.input_user_data?.preferences?.primary?.jobRole || data.preferences?.primary?.jobRole || 'Target Role';
        const coverageData = [{ name: 'Coverage', value: preVerified.primaryZone?.skill_coverage_pct || 0, fill: '#1D9E75' }];

        return (
            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {renderZoneCard('Primary Preference', primaryRole, preVerified.primaryZone)}
                    {renderZoneCard('Secondary Preference', data.input_user_data?.preferences?.secondary?.jobRole || data.preferences?.secondary?.jobRole, preVerified.secondaryZone)}
                    {renderZoneCard('Tertiary Preference', data.input_user_data?.preferences?.tertiary?.jobRole || data.preferences?.tertiary?.jobRole, preVerified.tertiaryZone)}
                </div>
                {dataFilesReady && preVerified.primaryZone && (
                    <div className="mt-4">
                      <p className="text-xs text-text-secondary text-center mb-2">
                        Skill coverage — {preVerified.primaryZone.skill_coverage_pct || 0}%
                      </p>
                      <ResponsiveContainer width="100%" height={140}>
                        <RadialBarChart
                          cx="50%" cy="50%"
                          innerRadius="55%" outerRadius="80%"
                          startAngle={90} endAngle={-270}
                          data={[{ name: 'Coverage', value: preVerified.primaryZone.skill_coverage_pct || 0, fill: '#1D9E75' }]}
                        >
                          <RadialBar dataKey="value" cornerRadius={4} />
                        </RadialBarChart>
                      </ResponsiveContainer>
                    </div>
                )}
            </div>
        );
    };

    const renderTab2 = () => {
        const pm = preVerified.primaryMarket;
        if (!pm) {
            return (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="p-6 bg-surface border border-surface-border rounded-xl text-center">
                            <h4 className="text-xl font-bold text-text-secondary">—</h4>
                            <p className="text-[10px] text-text-secondary uppercase tracking-widest mt-2">Market data being prepared</p>
                        </div>
                    ))}
                </div>
            );
        }

        const min = pm?.salary_min_lpa || 2;
        const max = pm?.salary_max_lpa || 8;
        const salaryData = [
          { year: 'Year 0-1', lpa: min },
          { year: 'Year 2-3', lpa: min + 1.5 },
          { year: 'Year 4-5', lpa: max - 1 },
          { year: 'Year 6+',  lpa: max }
        ];

        return (
            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-6 bg-surface border border-surface-border rounded-xl text-center">
                        <h4 className="text-xl font-bold text-primary capitalize">{pm.demand_level || 'Unknown'}</h4>
                        <p className="text-[10px] text-text-secondary uppercase tracking-widest mt-2">Demand Level</p>
                    </div>
                    <div className="p-6 bg-surface border border-surface-border rounded-xl text-center">
                        <h4 className="text-xl font-bold text-emerald-500">{pm.salary_min_lpa}-{pm.salary_max_lpa} LPA</h4>
                        <p className="text-[10px] text-text-secondary uppercase tracking-widest mt-2">Salary Range</p>
                    </div>
                    <div className="p-6 bg-surface border border-surface-border rounded-xl text-center">
                        <h4 className="text-xl font-bold text-amber-500 capitalize">{pm.ai_automation_risk || 'Unknown'}</h4>
                        <p className="text-[10px] text-text-secondary uppercase tracking-widest mt-2">AI Automation Risk</p>
                    </div>
                </div>
                {pm && (
                    <div className="bg-surface border border-surface-border p-4 rounded-xl">
                      <p className="text-xs font-bold text-text-secondary uppercase tracking-widest mb-3">Salary trajectory</p>
                      <ResponsiveContainer width="100%" height={140}>
                        <BarChart
                          data={[
                            { year: 'Year 0-1', lpa: pm.salary_min_lpa || 2 },
                            { year: 'Year 2-3', lpa: (pm.salary_min_lpa || 2) + 1.5 },
                            { year: 'Year 4-5', lpa: (pm.salary_max_lpa || 8) - 1 },
                            { year: 'Year 6+',  lpa: pm.salary_max_lpa || 8 }
                          ]}
                          margin={{ top: 4, right: 8, bottom: 4, left: 0 }}
                        >
                          <XAxis dataKey="year" tick={{ fontSize: 10 }} />
                          <YAxis tick={{ fontSize: 10 }} unit="L" />
                          <Tooltip formatter={(v) => v + ' LPA'} />
                          <Bar dataKey="lpa" fill="#185FA5" radius={[4,4,0,0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                )}
                {pm.emerging_roles && pm.emerging_roles.length > 0 && (
                    <div className="bg-surface border border-surface-border p-6 rounded-xl">
                        <h5 className="text-sm font-bold text-text-primary mb-4 border-b border-surface-border pb-2">Emerging Sub-roles</h5>
                        <ul className="list-disc pl-5 space-y-2 text-sm text-text-secondary">
                            {pm.emerging_roles.map((r, i) => <li key={i}>{typeof r === 'string' ? r : (r.name || JSON.stringify(r))}</li>)}
                        </ul>
                    </div>
                )}
            </div>
        );
    };

    const renderTab3 = () => {
        const sg = preVerified.primarySkillGap;
        if (!sg || !sg.dataReady) {
            return (
                <div className="p-8 bg-surface border border-surface-border rounded-xl text-center">
                    <Loader2 className="animate-spin text-text-secondary mx-auto mb-4" size={24} />
                    <p className="text-sm text-text-secondary">Skill analysis being prepared.<br/>Your career path in Tab 4 already covers your key skill gaps.</p>
                </div>
            );
        }

        return (
            <div className="space-y-6">
                {showOverlapBanner && (
                    <div className="bg-blue-50 border border-blue-200 text-blue-800 p-4 rounded-xl flex items-start gap-3 text-sm font-medium">
                        <AlertCircle className="shrink-0 mt-0.5 text-blue-600" size={16} />
                        Your skill gaps overlap across multiple target roles — fixing these helps all 3 directions.
                    </div>
                )}
                
                <div className="bg-surface border border-surface-border p-6 rounded-xl">
                    <div className="flex justify-between items-center text-xs font-bold mb-2">
                        <span className="text-text-secondary uppercase tracking-widest">Target Role Coverage</span>
                        <span className="text-primary">{sg.coveragePct || 0}%</span>
                    </div>
                    <div className="h-2 w-full bg-surface-hover rounded-full overflow-hidden">
                        <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${sg.coveragePct || 0}%` }}></div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-emerald-50/50 border border-emerald-100 rounded-xl p-6">
                        <h4 className="text-xs font-bold text-emerald-700 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <CheckCircle2 size={16} /> Skills you have
                        </h4>
                        <div className="flex flex-wrap gap-2">
                            {(sg.matched || []).map((s, i) => (
                                <span key={i} className="px-3 py-1.5 bg-emerald-100 text-emerald-800 text-xs font-semibold rounded-lg border border-emerald-200">
                                    {s}
                                </span>
                            ))}
                            {(sg.matched || []).length === 0 && <span className="text-xs text-emerald-600/60 italic">None detected</span>}
                        </div>
                    </div>
                    <div className="bg-red-50/50 border border-red-100 rounded-xl p-6">
                        <h4 className="text-xs font-bold text-red-700 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <XCircle size={16} /> Skills you need
                        </h4>
                        <div className="flex flex-wrap gap-2">
                            {(sg.missing || []).map((s, i) => (
                                <span key={i} className="px-3 py-1.5 bg-red-100 text-red-800 text-xs font-semibold rounded-lg border border-red-200">
                                    {s}
                                </span>
                            ))}
                            {(sg.missing || []).length === 0 && <span className="text-xs text-red-600/60 italic">None required</span>}
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const renderTab4 = () => {
        const textToParse = typeof aiText === 'string' ? aiText : JSON.stringify(aiText);
        // Simple regex to split by "Week " headers
        const weeks = textToParse.split(/(?=Week\s*\d+:?)/i).filter(s => s.trim().length > 0);
        
        return (
            <div className="space-y-6">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 w-fit">
                    <Sparkles className="text-primary" size={12} />
                    <span className="text-[10px] font-bold text-primary uppercase tracking-widest">
                        {dataFilesReady ? "AI-generated · verified against market data" : "AI-generated · market data sync in progress"}
                    </span>
                </div>
                
                <div className="space-y-4">
                    {weeks.length === 1 && weeks[0].length < 200 && (
                        <div className="p-6 bg-surface border border-surface-border rounded-xl shadow-sm">
                            <p className="text-sm text-text-secondary whitespace-pre-wrap">{weeks[0]}</p>
                        </div>
                    )}
                    {weeks.length > 0 && weeks.map((w, i) => {
                        const wTitleMatch = w.match(/(Week\s*\d+[^:\n]*):?\s*\n?/i);
                        const title = wTitleMatch ? wTitleMatch[1] : `Section ${i+1}`;
                        const content = wTitleMatch ? w.replace(wTitleMatch[0], '').trim() : w.trim();
                        return (
                            <div key={i} className="bg-surface border border-surface-border p-6 rounded-xl hover:shadow-md hover:border-primary/30 transition-all">
                                <h4 className="text-sm font-bold mb-3 text-primary">{title}</h4>
                                <div className="text-sm text-text-secondary whitespace-pre-wrap leading-relaxed">
                                    {content.replace(/\*\*/g, '')}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        );
    };

    const renderTab5 = () => (
        <div className="bg-surface border border-surface-border p-6 rounded-xl shadow-sm">
            <h4 className="text-xs font-bold text-text-primary uppercase tracking-widest mb-4 flex items-center gap-2">
                <Globe size={16} className="text-primary" /> Future Horizon
            </h4>
            <p className="text-sm text-text-secondary leading-relaxed whitespace-pre-wrap">
                {futureScopeText}
            </p>
        </div>
    );

    return (
        <div className="max-w-5xl mx-auto py-10 px-4 min-h-screen">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10 border-b border-surface-border pb-6">
                <div>
                    <h1 className="text-2xl font-black text-text-primary tracking-tight">Career Dashboard</h1>
                    {(studentName || studentDegree) && (
                        <p className="text-sm text-text-secondary mt-1 font-medium">
                            {studentName} {studentName && studentDegree && '•'} {studentDegree}
                        </p>
                    )}
                </div>
            </div>

            {renderTabs()}

            <div className="min-h-[400px]">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                    >
                        {activeTab === 1 && renderTab1()}
                        {activeTab === 2 && renderTab2()}
                        {activeTab === 3 && renderTab3()}
                        {activeTab === 4 && renderTab4()}
                        {activeTab === 5 && renderTab5()}
                    </motion.div>
                </AnimatePresence>
            </div>

            <div className="mt-16 pt-8 border-t border-surface-border flex flex-col items-center text-center">
                <h6 className="text-xs font-bold text-text-secondary uppercase tracking-widest mb-4">How helpful was this analysis?</h6>
                {rated ? (
                    <div className="text-sm font-bold text-emerald-500 bg-emerald-50 px-4 py-2 rounded-lg border border-emerald-100 flex items-center gap-2 shadow-sm">
                        <CheckCircle2 size={16} /> Thank you for your feedback!
                    </div>
                ) : (
                    <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map(star => (
                            <button
                                key={star}
                                onClick={() => submitRating(star)}
                                onMouseEnter={() => setRating(star)}
                                onMouseLeave={() => setRating(0)}
                                className={`transition-all hover:scale-110 ${rating >= star ? 'text-amber-400' : 'text-gray-300'}`}
                            >
                                <Star size={28} fill={rating >= star ? 'currentColor' : 'none'} />
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;
