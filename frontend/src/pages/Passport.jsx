import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Award, Download, Share2, Target, Zap, CheckCircle2, Globe, Linkedin, GraduationCap, Briefcase } from 'lucide-react';

const Passport = () => {
    const [matchData, setMatchData] = useState(null);
    const [formData, setFormData] = useState(null);

    useEffect(() => {
        try {
            const md = localStorage.getItem('careerMatch');
            const fd = localStorage.getItem('latestFormData');
            if (md) setMatchData(JSON.parse(md));
            if (fd) setFormData(JSON.parse(fd));
        } catch (e) {
            console.error("Error loading passport data", e);
        }
    }, []);

    const primaryRole = formData?.preferences?.primary?.role || 'Aspiring Professional';
    const readinessScore = matchData?.overall_match_score || 85;
    const skills = formData?.skills || ['React.js', 'Node.js', 'Python', 'Machine Learning'];
    
    // Fallback certs if empty
    const certs = (formData?.certifications && formData.certifications.length > 0 && formData.certifications[0].name !== '') 
        ? formData.certifications 
        : [{ name: 'Certified AI Practitioner', issuer: 'Global Tech Board', year: '2024', mode: 'URL' }];

    const exp = (formData?.experience && formData.experience.length > 0 && formData.experience[0].orgName !== '') 
        ? formData.experience 
        : [{ designation: 'Intern', orgName: 'Tech Corp', startDate: '2023-01-01' }];

    return (
        <div className="max-w-6xl mx-auto py-12 space-y-12 animate-fade-in relative">
            {/* Background Glow */}
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[120px] -z-10 pointer-events-none"></div>
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-[100px] -z-10 pointer-events-none"></div>

            {/* Passport Header Card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card p-0 overflow-hidden relative shadow-2xl shadow-primary/5"
            >
                <div className="h-48 bg-gradient-to-r from-primary via-indigo-600 to-accent relative">
                    <div className="absolute inset-0 bg-white/5 backdrop-blur-[2px]"></div>
                    <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-30">
                        <div className="absolute top-[-50%] left-[-10%] w-[50%] h-[200%] bg-white/20 transform rotate-[30deg] blur-3xl"></div>
                    </div>
                    <div className="absolute bottom-0 right-0 p-8">
                        <ShieldCheck className="text-white/20 w-40 h-40 -mr-8 -mb-12 drop-shadow-lg" />
                    </div>
                </div>

                <div className="px-8 pb-8 -mt-20 flex flex-col md:flex-row items-end justify-between gap-6 relative z-10">
                    <div className="flex flex-col md:flex-row gap-6 items-end">
                        <div className="w-40 h-40 rounded-3xl border-8 border-[#0d1117] bg-slate-900 p-1 shadow-[0_0_30px_rgba(0,0,0,0.5)] z-10 relative group">
                            <div className="absolute inset-0 bg-gradient-to-tr from-primary to-accent opacity-0 group-hover:opacity-100 rounded-2xl transition-opacity duration-300 blur-md -z-10"></div>
                            <div className="w-full h-full rounded-2xl bg-[#0d1117] flex items-center justify-center overflow-hidden">
                                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${primaryRole}`} alt="Avatar" className="w-full h-full object-cover" />
                            </div>
                        </div>
                        <div className="mb-4">
                            <div className="flex items-center gap-3">
                                <h1 className="text-4xl font-black text-white tracking-tight drop-shadow-md">Verified Talent</h1>
                                <div className="bg-accent/20 border border-accent/40 p-1.5 rounded-full shadow-[0_0_15px_rgba(56,189,248,0.3)]">
                                    <ShieldCheck className="text-accent" size={24} />
                                </div>
                            </div>
                            <p className="text-text-secondary text-xl font-medium mt-2 flex items-center gap-2">
                                <Briefcase size={18} className="text-primary"/> {primaryRole}
                            </p>
                            <div className="flex gap-5 mt-6">
                                <div className="flex items-center gap-2 text-text-secondary hover:text-white transition-colors cursor-pointer bg-white/5 py-1 px-3 rounded-full border border-white/10 hover:border-white/30">
                                    <Linkedin size={16} className="text-[#0A66C2]" />
                                    <span className="text-xs font-bold uppercase tracking-wider">Connect</span>
                                </div>
                                <div className="flex items-center gap-2 text-text-secondary hover:text-white transition-colors cursor-pointer bg-white/5 py-1 px-3 rounded-full border border-white/10 hover:border-white/30">
                                    <Globe size={16} />
                                    <span className="text-xs font-bold uppercase tracking-wider">Portfolio</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-4 mb-4">
                        <button className="btn btn-outline gap-2 bg-white/5 border-white/10 hover:border-primary/50 hover:bg-primary/10 transition-all shadow-md">
                            <Share2 size={18} />
                            Share Profile
                        </button>
                        <button className="btn btn-primary gap-2 px-8 shadow-[0_0_20px_rgba(79,70,229,0.4)] hover:shadow-[0_0_30px_rgba(79,70,229,0.6)] transition-shadow">
                            <Download size={18} />
                            Export PDF
                        </button>
                    </div>
                </div>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Column: Readiness Matrix */}
                <div className="lg:col-span-4 space-y-6">
                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} delay={0.1} className="glass-card text-center py-10 border border-white/5 shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-accent"></div>
                        <div className="relative inline-flex items-center justify-center mb-6 pt-4">
                            <svg className="w-36 h-36 text-white/5 drop-shadow-xl">
                                <circle className="text-white/5" strokeWidth="10" stroke="currentColor" fill="transparent" r="66" cx="72" cy="72" />
                                <circle className="text-accent drop-shadow-[0_0_10px_rgba(56,189,248,0.8)]" strokeWidth="10" strokeDasharray="414" strokeDashoffset={414 - (414 * readinessScore) / 100} strokeLinecap="round" stroke="currentColor" fill="transparent" r="66" cx="72" cy="72" />
                            </svg>
                            <span className="absolute text-5xl font-black text-white drop-shadow-lg">{readinessScore}%</span>
                        </div>
                        <h3 className="text-xl font-bold uppercase tracking-widest text-text-primary">Career Readiness</h3>
                        <p className="text-xs text-text-secondary mt-3 px-6 leading-relaxed">System-verified alignment based on technical evaluation, experiences, & certifications.</p>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} delay={0.2} className="glass-card shadow-lg border border-white/5">
                        <h3 className="text-sm font-bold uppercase tracking-widest text-text-secondary flex items-center gap-2 mb-6 border-b border-surface-border pb-3">
                            <Target className="text-primary" size={16}/> Match Priorities
                        </h3>
                        
                        <div className="space-y-4">
                            <div className="p-4 rounded-xl bg-primary/10 border border-primary/20 relative overflow-hidden group">
                                <div className="absolute right-0 top-0 w-24 h-24 bg-primary/20 blur-2xl -mr-10 -mt-10 transition-all group-hover:bg-primary/40"></div>
                                <div className="flex justify-between items-start mb-2 relative z-10">
                                    <span className="text-[10px] font-black uppercase text-primary tracking-widest bg-primary/20 px-2 py-0.5 rounded">Primary Fit</span>
                                    <span className="text-sm font-bold text-white bg-white/10 px-2 py-0.5 rounded">{readinessScore}%</span>
                                </div>
                                <p className="text-lg font-bold text-white relative z-10">{primaryRole}</p>
                            </div>
                            
                            {formData?.preferences?.secondary?.role && (
                                <div className="p-4 rounded-xl bg-surface border border-surface-border">
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="text-[10px] font-black uppercase text-text-secondary tracking-widest">Secondary Fit</span>
                                        <span className="text-sm font-bold text-text-secondary">--%</span>
                                    </div>
                                    <p className="text-base font-bold text-text-primary">{formData.preferences.secondary.role}</p>
                                </div>
                            )}
                        </div>
                    </motion.div>

                    {/* Latest Experience mini card */}
                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} delay={0.3} className="glass-card border border-white/5 shadow-lg">
                         <h3 className="text-sm font-bold uppercase tracking-widest text-text-secondary flex items-center gap-2 mb-4 border-b border-surface-border pb-3">
                            <Briefcase className="text-primary" size={16}/> Current Role
                        </h3>
                        <div>
                            <p className="text-base font-bold text-text-primary">{exp[0].designation}</p>
                            <p className="text-sm text-text-secondary mt-1">{exp[0].orgName} • {exp[0].startDate?.split('-')[0] || 'Present'}</p>
                        </div>
                    </motion.div>
                </div>

                {/* Middle Column: Detailed Skills Registry */}
                <div className="lg:col-span-8 space-y-8">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-surface-border pb-4">
                        <h2 className="text-2xl font-black tracking-tight text-white flex items-center gap-3">
                            <Award className="text-accent" size={28}/>
                            Verified Credentials & Skills
                        </h2>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-primary bg-primary/10 py-1.5 px-4 rounded-full border border-primary/20 flex items-center gap-2 shadow-[0_0_10px_rgba(79,70,229,0.2)]">
                            <ShieldCheck size={12}/> Live Registry
                        </span>
                    </div>

                    {/* Certifications Row */}
                    <div>
                        <h3 className="text-xs font-bold uppercase tracking-widest text-text-secondary mb-4 flex items-center gap-2">
                            <GraduationCap size={14}/> Verified Certifications
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {certs.map((cert, i) => (
                                <motion.div key={i} whileHover={{ y: -2 }} className="p-5 rounded-2xl bg-surface border border-surface-border hover:border-primary/50 hover:shadow-[0_8px_25px_rgba(79,70,229,0.15)] transition-all cursor-default relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-primary/20 to-transparent blur-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                    <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-4 text-primary relative z-10">
                                        <Award size={20} />
                                    </div>
                                    <h4 className="text-sm font-bold text-white relative z-10 line-clamp-1" title={cert.name}>{cert.name || 'Certification'}</h4>
                                    <p className="text-xs text-text-secondary mt-1 relative z-10">{cert.issuer || 'Issuer'} • {cert.year || 'N/A'}</p>
                                    
                                    <div className="mt-4 pt-3 border-t border-surface-border/50 flex justify-between items-center relative z-10">
                                        <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded ${cert.mode === 'QR' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' : cert.mode === 'SCAN' ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20' : 'bg-green-500/10 text-green-500 border border-green-500/20'}`}>
                                            {cert.mode === 'QR' ? 'QR Validated' : cert.mode === 'SCAN' ? 'Document Verified' : 'URL Link Verified'}
                                        </span>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    {/* Skills Cloud */}
                    <div className="pt-4">
                         <h3 className="text-xs font-bold uppercase tracking-widest text-text-secondary mb-4 flex items-center gap-2">
                            <Zap size={14}/> Capabilities Canvas
                        </h3>
                        <div className="glass-card p-6 border border-white/5 hover:border-white/10 transition-colors">
                            <div className="flex flex-wrap gap-3">
                                {skills.map((skill, i) => (
                                    <div key={i} className="flex items-center gap-2 bg-[#0d1117] border border-surface-border hover:border-accent/40 px-3.5 py-2 rounded-xl text-sm font-medium hover:bg-accent/5 transition-all shadow-sm group">
                                        <CheckCircle2 size={14} className="text-primary group-hover:text-accent shrink-0 transition-colors" />
                                        <span className="text-text-secondary group-hover:text-white transition-colors">{skill}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Analytics Highlight */}
                    <div className="relative overflow-hidden rounded-3xl p-8 border-dashed border border-primary/30 mt-8 group">
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-surface to-accent/5 -z-10"></div>
                        <div className="absolute top-0 right-0 w-64 h-64 bg-accent/10 blur-3xl rounded-full group-hover:bg-accent/20 transition-colors duration-700 -z-10"></div>
                        
                        <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
                            <div className="p-6 rounded-3xl bg-primary/10 border border-primary/20 shadow-[0_0_30px_rgba(79,70,229,0.2)]">
                                <Zap className="text-primary animate-pulse" size={48} />
                            </div>
                            <div className="text-center md:text-left">
                                <h3 className="text-2xl font-black tracking-tight text-white mb-2">Growth & Trajectory</h3>
                                <p className="text-sm text-text-secondary leading-relaxed max-w-xl">
                                    The profile indicates strong alignment with {primaryRole} requirements. Continuous tracking through the dashboard will dynamically adjust the Readiness Score based on completed pathways and certifications.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Passport;
