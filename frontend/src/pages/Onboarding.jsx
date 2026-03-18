import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus, Loader2, Award, Briefcase,
    Star, Database, CheckCircle, X,
    Sparkles, Building2, MapPin, IndianRupee, Briefcase as BriefcaseIcon, Search
} from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import dropdownData from '../data/dropdownData.json';
import jobRolesData from '../data/jobRolesData.json';
import indianCities from '../data/indianCities.json';

/* ─── Constants ─────────────────────────────── */
const JOB_TYPES = [
    "Full-Time", "Part-Time", "Internship (Full-Time)",
    "Internship (Part-Time)", "Freelance / Gig Work", "Remote (Fully Distributed)"
];
const SALARY_OPTIONS = ["0–3 LPA", "3–5 LPA", "5–8 LPA", "8+ LPA"];
const ORG_TYPES = [
    "Startup (Early-stage / Growth-stage)",
    "Scale-up / High-growth company",
    "Small or Medium Enterprise (SME)",
    "Large Indian Corporate / Conglomerate",
    "Multinational Corporation (MNC)",
    "Government / Public Sector Organization",
    "Non-Profit / NGO / Social Enterprise",
    "Academic / Research Institution",
    "Consulting / Professional Services Firm",
    "Family-owned Business",
    "Self-employed / Entrepreneurial Venture",
    "Open to any organization type"
];
const SECTORS = [
    "Information Technology & Software",
    "Banking & Financial Services",
    "Healthcare & Life Sciences",
    "Manufacturing",
    "Retail & E-Commerce",
    "Energy (Oil, Gas & Renewables)",
    "Agriculture & Food",
    "Construction & Real Estate",
    "Telecom & Technology Infrastructure",
    "Automotive & Electric Vehicles",
    "Education & EdTech",
    "Media, Entertainment & Advertising",
    "Pharmaceuticals & Biotechnology",
    "Logistics & Supply Chain",
    "Hospitality, Travel & Tourism",
    "Government & Public Sector",
    "Professional Services (Legal, Consulting, Accounting)",
    "Aerospace & Defence",
    "Renewable Energy & Clean Tech",
    "FMCG & Consumer Goods"
];
const PREF_TIERS = ['primary', 'secondary', 'tertiary'];
const PREF_LABELS = ['Primary', 'Secondary', 'Tertiary'];
const PREF_COLORS = [
    'border-primary/50 bg-primary/5',
    'border-primary/30 bg-primary/[0.03]',
    'border-primary/20 bg-primary/[0.02]',
];
const PREF_ACCENT = ['text-primary', 'text-primary/80', 'text-primary/60'];

const emptyPref = () => ({ role: '', roleSuggestions: [], sectors: [], jobType: '', salary: '', locations: ['', '', ''], orgTypes: [] });
const emptyEdu = () => ({ degreeLevel: '', domain: '', degreeGroup: '', specialization: '', specialization2: '', currentlyPursuing: false, isOtherSpec: false, isOtherSpec2: false, isDualSpecialization: false });
const emptyExp = () => ({ orgName: '', designation: '', designationOther: false, sector: '', sectorOther: '', startDate: '', endDate: '', currentlyWorking: false });
const emptyCert = () => ({ name: '', issuer: '', year: new Date().getFullYear().toString(), mode: 'URL', url: '', fileUrl: '', skills: [] });

/* ─── Role Search Autocomplete ───────────────── */
const RoleSearch = ({ value, onChange, placeholder = 'Type 2+ letters to search roles...' }) => {
    const [query, setQuery] = useState(value || '');
    const [suggestions, setSuggestions] = useState([]);
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const handleInput = (e) => {
        const q = e.target.value;
        setQuery(q);
        onChange(q);
        if (q.length >= 2) {
            const lower = q.toLowerCase();
            const filtered = jobRolesData.roles
                .filter(r => r.role.toLowerCase().includes(lower))
                .slice(0, 10);
            setSuggestions(filtered);
            setOpen(filtered.length > 0);
        } else {
            setSuggestions([]);
            setOpen(false);
        }
    };

    const select = (item) => {
        setQuery(item.role);
        onChange(item.role);
        setSuggestions([]);
        setOpen(false);
    };

    return (
        <div ref={ref} className="relative">
            <div className="relative">
                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none" />
                <input
                    className="input-field pl-8 pr-3"
                    value={query}
                    onChange={handleInput}
                    placeholder={placeholder}
                    autoComplete="off"
                />
            </div>
            <AnimatePresence>
                {open && (
                    <motion.ul
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        className="absolute z-50 w-full mt-1 bg-surface border border-surface-border rounded-lg shadow-xl max-h-52 overflow-y-auto"
                    >
                        {suggestions.map((item, i) => (
                            <li
                                key={i}
                                onMouseDown={() => select(item)}
                                className="px-4 py-2.5 hover:bg-primary/10 cursor-pointer transition-colors"
                            >
                                <div className="text-[12px] font-semibold text-text-primary">{item.role}</div>
                                <div className="text-[10px] text-text-secondary">{item.family}</div>
                            </li>
                        ))}
                    </motion.ul>
                )}
            </AnimatePresence>
        </div>
    );
};

/* ─── Location Autocomplete ─────────────────── */
const LocationSearch = ({ value, onChange, placeholder }) => {
    const [query, setQuery] = useState(value || '');
    const [suggestions, setSuggestions] = useState([]);
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const handleInput = (e) => {
        const q = e.target.value;
        setQuery(q);
        onChange(q);
        if (q.length >= 2) {
            const lower = q.toLowerCase();
            const filtered = indianCities.filter(c => c.toLowerCase().includes(lower)).slice(0, 8);
            setSuggestions(filtered);
            setOpen(filtered.length > 0);
        } else {
            setSuggestions([]);
            setOpen(false);
        }
    };

    const select = (city) => {
        setQuery(city);
        onChange(city);
        setSuggestions([]);
        setOpen(false);
    };

    return (
        <div ref={ref} className="relative">
            <div className="relative">
                <MapPin size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none" />
                <input
                    className="input-field pl-8"
                    value={query}
                    onChange={handleInput}
                    placeholder={placeholder || 'Type city name...'}
                    autoComplete="off"
                />
            </div>
            <AnimatePresence>
                {open && (
                    <motion.ul
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        className="absolute z-50 w-full mt-1 bg-surface border border-surface-border rounded-lg shadow-xl max-h-44 overflow-y-auto"
                    >
                        {suggestions.map((city, i) => (
                            <li
                                key={i}
                                onMouseDown={() => select(city)}
                                className="px-4 py-2 text-[12px] font-semibold text-text-primary hover:bg-primary/10 cursor-pointer transition-colors flex items-center gap-2"
                            >
                                <MapPin size={10} className="text-primary shrink-0" />{city}
                            </li>
                        ))}
                    </motion.ul>
                )}
            </AnimatePresence>
        </div>
    );
};

/* ─── Sector Multi-Select (up to 3) with Other ─── */
const SectorPicker = ({ selected, onChange }) => {
    const hasOther = selected.some(s => !SECTORS.includes(s));
    const otherVal = hasOther ? (selected.find(s => !SECTORS.includes(s)) || '') : '';

    const toggle = (s) => {
        if (selected.includes(s)) { onChange(selected.filter(x => x !== s)); }
        else if (selected.length < 3) { onChange([...selected, s]); }
    };

    const toggleOther = () => {
        if (hasOther) { onChange(selected.filter(s => SECTORS.includes(s))); }
        else if (selected.length < 3) { onChange([...selected, '']); }
    };

    const setOtherText = (val) => {
        const withoutOther = selected.filter(s => SECTORS.includes(s));
        onChange([...withoutOther, val]);
    };

    return (
        <div className="space-y-2">
            <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pr-1">
                {SECTORS.map(s => {
                    const active = selected.includes(s);
                    const maxed = selected.length >= 3 && !active;
                    return (
                        <button key={s} type="button" onClick={() => !maxed && toggle(s)}
                            className={`text-[10px] font-bold px-2.5 py-1 rounded-full border transition-all ${active ? 'bg-primary text-white border-primary shadow-sm shadow-primary/20'
                                : maxed ? 'bg-surface text-text-secondary/40 border-surface-border cursor-not-allowed'
                                    : 'bg-surface text-text-secondary border-surface-border hover:border-primary/40 hover:text-primary'
                                }`}
                        >
                            {active && <span className="mr-1">✓</span>}{s}
                        </button>
                    );
                })}
                <button type="button" onClick={toggleOther}
                    className={`text-[10px] font-bold px-2.5 py-1 rounded-full border transition-all ${hasOther ? 'bg-amber-500 text-white border-amber-500'
                        : selected.length >= 3 ? 'bg-surface text-text-secondary/40 border-surface-border cursor-not-allowed'
                            : 'bg-surface text-text-secondary border-dashed border-surface-border hover:border-amber-400 hover:text-amber-500'
                        }`}
                >
                    {hasOther ? '✓ Other' : '+ Other'}
                </button>
            </div>
            {hasOther && (
                <input
                    className="input-field border-amber-400/40 bg-amber-400/5"
                    placeholder="Type your sector..."
                    value={otherVal}
                    onChange={e => setOtherText(e.target.value)}
                    autoFocus
                />
            )}
        </div>
    );
};

/* ─── Main Component ─────────────────────────── */
const Onboarding = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);

    const freshFormData = () => ({
        education: [emptyEdu()],
        preferences: {
            primary: emptyPref(),
            secondary: emptyPref(),
            tertiary: emptyPref(),
        },
        experience: [emptyExp()],
        hasExperience: true,
        skills: [],
        certifications: [emptyCert()],
        hasCertifications: true
    });

    const [formData, setFormData] = useState(() => {
        const draft = localStorage.getItem('onboardingDraft');
        if (draft) { try { return JSON.parse(draft); } catch (e) { /* ignore */ } }
        const saved = localStorage.getItem('latestFormData');
        if (saved) { try { return JSON.parse(saved); } catch (e) { /* ignore */ } }
        return freshFormData();
    });

    /* ── Auto-save to localStorage on every change ── */
    useEffect(() => {
        localStorage.setItem('onboardingDraft', JSON.stringify(formData));
    }, [formData]);

    /* ── Education helpers ── */
    const updateEdu = (index, field, val) => {
        const newEdu = [...formData.education];
        if (field === 'degreeLevel') {
            newEdu[index] = { ...newEdu[index], degreeLevel: val, domain: '', degreeGroup: '', specialization: '', isOtherSpec: false };
        } else if (field === 'domain') {
            newEdu[index] = { ...newEdu[index], domain: val, degreeGroup: '', specialization: '', isOtherSpec: false };
        } else if (field === 'degreeGroup') {
            newEdu[index] = { ...newEdu[index], degreeGroup: val, specialization: '', isOtherSpec: false };
        } else if (field === 'specialization' && val === 'Other') {
            newEdu[index] = { ...newEdu[index], isOtherSpec: true, specialization: '' };
        } else {
            newEdu[index] = { ...newEdu[index], [field]: val };
        }
        setFormData(p => ({ ...p, education: newEdu }));
    };
    const addEdu = () => setFormData(p => ({ ...p, education: [...p.education, emptyEdu()] }));
    const removeEdu = (i) => {
        if (formData.education.length <= 1) return;
        setFormData(p => ({ ...p, education: p.education.filter((_, idx) => idx !== i) }));
    };

    /* ── Preference helpers ── */
    const updatePref = (tier, field, val) => {
        setFormData(p => ({ ...p, preferences: { ...p.preferences, [tier]: { ...p.preferences[tier], [field]: val } } }));
    };
    const updatePrefLocation = (tier, idx, val) => {
        const locs = [...(formData.preferences[tier].locations || ['', '', ''])];
        locs[idx] = val;
        updatePref(tier, 'locations', locs);
    };

    /* ── Experience helpers ── */
    const updateExp = (i, field, val) => {
        const newExp = [...formData.experience];
        newExp[i] = { ...newExp[i], [field]: val };
        setFormData(p => ({ ...p, experience: newExp }));
    };
    const addExp = () => setFormData(p => ({ ...p, experience: [...p.experience, emptyExp()] }));

    /* ── Cert helpers ── */
    const updateCert = (i, field, val) => {
        const newCerts = [...formData.certifications];
        newCerts[i] = { ...newCerts[i], [field]: val };
        setFormData(p => ({ ...p, certifications: newCerts }));
    };
    const addCert = () => setFormData(p => ({ ...p, certifications: [...p.certifications, emptyCert()] }));

    /* ── Submit ── */
    const handleSubmit = async () => {
        if (formData.hasCertifications) {
            for (let i = 0; i < formData.certifications.length; i++) {
                const cert = formData.certifications[i];
                if (!cert.name || !cert.issuer || !cert.year) {
                    alert(`Please fill Name, Issuer, and Year for Certificate ${i + 1}.`);
                    return;
                }
                if (cert.mode === 'URL' && !cert.url) {
                    alert(`Please provide the Credential URL for Certificate ${i + 1}.`);
                    return;
                }
                if ((cert.mode === 'SCAN' || cert.mode === 'QR') && !cert.fileUrl) {
                    alert(`Please upload evidence (PDF/Image) for Certificate ${i + 1}.`);
                    return;
                }
                if (!cert.skills || cert.skills.length === 0) {
                    alert(`Please add at least one skill demonstrated by Certificate ${i + 1}.`);
                    return;
                }
            }
        }

        setLoading(true);
        try {
            // Aggregate all skills from certifications and remove duplicates
            const allCertSkills = formData.certifications.flatMap(cert => cert.skills || []);
            const uniqueSkills = [...new Set([...formData.skills, ...allCertSkills])];
            
            const submissionData = {
                ...formData,
                experience: formData.hasExperience ? formData.experience : [],
                certifications: formData.hasCertifications ? formData.certifications : [],
                skills: uniqueSkills
            };

            const res = await axios.post(`http://${window.location.hostname}:5000/api/onboarding`, submissionData);
            const pastHistory = JSON.parse(localStorage.getItem('careerHistory') || '[]');
            const newAttempt = { id: Date.now(), timestamp: new Date().toLocaleString(), role: submissionData.preferences.primary.role || 'Target Profile', data: res.data };
            localStorage.setItem('careerHistory', JSON.stringify([newAttempt, ...pastHistory].slice(0, 10)));
            localStorage.setItem('latestFormData', JSON.stringify(submissionData));
            localStorage.setItem('careerMatch', JSON.stringify(res.data));
            localStorage.removeItem('onboardingDraft');
            navigate('/dashboard');
        } catch (err) {
            console.error('Submission failed', err);
            alert('Failed to generate career report. The AI server might be having issues, or inputs are invalid. Check console for details.');
            // Do not navigate to dashboard on error
        } finally {
            setLoading(false);
        }
    };

    const next = () => setStep(s => s + 1);
    const back = () => setStep(s => s - 1);

    /* ── Reset all form data ── */
    const resetForm = () => {
        if (!window.confirm('Are you sure you want to reset all form data? This cannot be undone.')) return;
        setFormData(freshFormData());
        setStep(1);
        localStorage.removeItem('onboardingDraft');
    };

    /* ─── Preference Card ─────────────────────── */
    const renderPrefCard = (tier, label, colorClass, accentClass) => {
        const data = formData.preferences[tier];
        const locs = data.locations?.length === 3 ? data.locations : ['', '', ''];

        return (
            <motion.div
                key={tier}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={`relative rounded-xl border-2 p-5 space-y-4 ${colorClass} transition-all`}
            >
                {/* Header */}
                <div className="flex items-center gap-3 pb-3 border-b border-surface-border/50">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black border ${accentClass} border-current`}>
                        {PREF_TIERS.indexOf(tier) + 1}
                    </div>
                    <span className={`text-xs font-black uppercase tracking-widest ${accentClass}`}>{label} Preference</span>
                    {tier === 'primary' && (
                        <span className="ml-auto text-[9px] font-bold bg-primary/20 text-primary px-2 py-0.5 rounded-full uppercase tracking-widest flex items-center gap-1">
                            <Star size={8} /> Highest Weight
                        </span>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* 1. Job Role — Typeahead */}
                    <div className="space-y-1.5 md:col-span-2">
                        <label className="text-[10px] font-bold text-text-secondary uppercase tracking-widest flex items-center gap-1.5">
                            <Search size={10} className={accentClass} /> Target Job Role
                        </label>
                        <RoleSearch
                            value={data.role}
                            onChange={(val) => updatePref(tier, 'role', val)}
                            placeholder="Type 2+ letters — e.g. Data Scientist, UX Designer..."
                        />
                    </div>

                    {/* 2. Job Sector (up to 3) */}
                    <div className="space-y-1.5 md:col-span-2">
                        <label className="text-[10px] font-bold text-text-secondary uppercase tracking-widest flex items-center gap-1.5">
                            <Database size={10} className={accentClass} /> Job Sector
                            <span className="text-[9px] font-normal text-text-secondary">(Select up to 3)</span>
                            {data.sectors.length > 0 && (
                                <span className="ml-auto text-[9px] font-bold text-primary">{data.sectors.length}/3 selected</span>
                            )}
                        </label>
                        <SectorPicker selected={data.sectors} onChange={(val) => updatePref(tier, 'sectors', val)} />
                    </div>

                    {/* 3. Job Type */}
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-text-secondary uppercase tracking-widest flex items-center gap-1.5">
                            <BriefcaseIcon size={10} className={accentClass} /> Job Type
                        </label>
                        <select className="input-field" value={data.jobType} onChange={e => updatePref(tier, 'jobType', e.target.value)}>
                            <option value="">Select job type...</option>
                            {JOB_TYPES.map(o => <option key={o} value={o}>{o}</option>)}
                        </select>
                    </div>

                    {/* 4. Expected Salary */}
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-text-secondary uppercase tracking-widest flex items-center gap-1.5">
                            <IndianRupee size={10} className={accentClass} /> Expected Salary
                        </label>
                        <select className="input-field" value={data.salary} onChange={e => updatePref(tier, 'salary', e.target.value)}>
                            <option value="">Select salary range...</option>
                            {SALARY_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                        </select>
                    </div>

                    {/* 5. Preferred Locations (up to 3) */}
                    <div className="space-y-1.5 md:col-span-2">
                        <label className="text-[10px] font-bold text-text-secondary uppercase tracking-widest flex items-center gap-1.5">
                            <MapPin size={10} className={accentClass} /> Preferred Locations
                            <span className="text-[9px] font-normal text-text-secondary">(Type city name — up to 3)</span>
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                            {[0, 1, 2].map(i => (
                                <LocationSearch
                                    key={i}
                                    value={locs[i]}
                                    onChange={val => updatePrefLocation(tier, i, val)}
                                    placeholder={i === 0 ? '1st choice city...' : i === 1 ? '2nd choice city...' : '3rd choice city...'}
                                />
                            ))}
                        </div>
                    </div>

                    {/* 6. Type of Organisation */}
                    <div className="space-y-2 md:col-span-2">
                        <label className="text-[10px] font-bold text-text-secondary uppercase tracking-widest flex items-center gap-1.5">
                            <Building2 size={10} className={accentClass} /> What type of organization would you prefer to join?
                            <span className="ml-auto text-[9px] font-bold">
                                {(data.orgTypes || []).length > 0
                                    ? <span className="text-primary">{data.orgTypes.length}/3 selected</span>
                                    : <span className="text-text-secondary">Pick up to 3</span>}
                            </span>
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                            {ORG_TYPES.map(o => {
                                const checked = (data.orgTypes || []).includes(o);
                                const maxed = (data.orgTypes || []).length >= 3 && !checked;
                                const toggle = () => {
                                    if (maxed) return;
                                    const current = data.orgTypes || [];
                                    const next = checked ? current.filter(x => x !== o) : [...current, o];
                                    updatePref(tier, 'orgTypes', next);
                                };
                                return (
                                    <button key={o} type="button" onClick={toggle}
                                        className={`flex items-center gap-2.5 text-left px-3 py-2.5 rounded-lg border transition-all w-full ${checked
                                            ? 'bg-primary/10 border-primary/40 text-primary'
                                            : maxed
                                                ? 'bg-surface border-surface-border text-text-secondary/40 cursor-not-allowed'
                                                : 'bg-surface border-surface-border text-text-secondary hover:border-primary/30 hover:text-text-primary'
                                            }`}
                                    >
                                        <div className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-all ${checked ? 'bg-primary border-primary' : 'border-surface-border'
                                            }`}>
                                            {checked && <CheckCircle size={10} className="text-white" />}
                                        </div>
                                        <span className="text-[11px] font-medium leading-tight">{o}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </motion.div>
        );
    };

    /* ─── Render ─────────────────────────────── */
    return (
        <div className="max-w-4xl mx-auto py-8">
            {/* Progress Bar */}
            <div className="mb-10">
                <div className="flex justify-between mb-2 relative">
                    <div className="absolute top-1/2 left-0 w-full h-px bg-surface-border -translate-y-1/2 z-0"></div>
                    {['1. Education', '2. Career Preferences', '3. Work Experience', '4. Certifications'].map((label, i) => (
                        <div key={label} className="flex flex-col items-center flex-1 z-10 relative">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center mb-2 text-xs font-bold border ${step > i ? 'border-primary bg-primary text-white' : 'border-surface-border bg-surface text-text-secondary'}`}>
                                {step > i + 1 ? <CheckCircle size={10} /> : i + 1}
                            </div>
                            <span className={`text-[9px] font-bold uppercase tracking-widest ${step > i ? 'text-text-primary' : 'text-text-secondary'}`}>{label}</span>
                        </div>
                    ))}
                </div>
                <div className="flex justify-end mt-2">
                    <button onClick={resetForm} className="text-[9px] font-bold uppercase tracking-widest text-red-400 hover:text-red-500 bg-red-400/10 hover:bg-red-400/20 px-3 py-1.5 rounded-lg border border-red-400/20 transition-all flex items-center gap-1.5">
                        <X size={10} /> Reset All
                    </button>
                </div>
            </div>

            <AnimatePresence mode="wait">
                {/* ── STEP 1: Education ── */}
                {step === 1 && (
                    <motion.div key="step1" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-8">
                        <div className="flex justify-between items-center bg-surface p-6 rounded-xl border border-surface-border shadow-sm">
                            <div className="space-y-1">
                                <h2 className="text-xl font-bold text-text-primary tracking-tight uppercase flex items-center gap-2">
                                    <Database size={18} className="text-primary" /> Academic Journey
                                </h2>
                                <p className="text-text-secondary text-[11px] leading-relaxed max-w-md">Tell us about your education so our AI can map your career readiness.</p>
                            </div>
                            <button onClick={addEdu} className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center hover:bg-primary hover:text-white transition-all shadow-sm border border-primary/20" title="Add another qualification">
                                <Plus size={20} />
                            </button>
                        </div>

                        <div className="space-y-6">
                            {formData.education.map((edu, idx) => {
                                const domains = edu.degreeLevel ? Object.keys(dropdownData.education[edu.degreeLevel] || {}) : [];
                                const groups = (edu.degreeLevel && edu.domain && edu.domain !== 'Other') ? Object.keys(dropdownData.education[edu.degreeLevel][edu.domain] || {}) : [];
                                const specs = (edu.degreeLevel && edu.domain && edu.degreeGroup && edu.domain !== 'Other' && edu.degreeGroup !== 'Other') ? (dropdownData.education[edu.degreeLevel][edu.domain][edu.degreeGroup] || []) : [];

                                return (
                                    <motion.div key={idx} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="glass-card relative border-l-4 border-primary/40 group/card pb-4">
                                        <div className="absolute -top-3 left-6 flex items-center h-6">
                                            <div className="bg-primary px-3 py-1 rounded-full shadow-lg shadow-primary/30 flex items-center gap-2 border border-white/10">
                                                <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></div>
                                                <span className="text-[10px] font-black text-white uppercase tracking-tighter">Qualification 0{idx + 1}</span>
                                            </div>
                                        </div>
                                        {formData.education.length > 1 && (
                                            <button onClick={() => removeEdu(idx)} className="absolute -top-3 -right-3 w-7 h-7 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-all opacity-0 group-hover/card:opacity-100 shadow-lg z-30 transform hover:scale-110">
                                                <X size={14} strokeWidth={3} />
                                            </button>
                                        )}

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">Degree Level</label>
                                                <select className="input-field" value={edu.degreeLevel} onChange={e => updateEdu(idx, 'degreeLevel', e.target.value)}>
                                                    <option value="">Select your highest degree level...</option>
                                                    {Object.keys(dropdownData.education).map(l => <option key={l} value={l}>{l}</option>)}
                                                </select>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">Domain</label>
                                                <select className="input-field" disabled={!edu.degreeLevel} value={edu.domain} onChange={e => updateEdu(idx, 'domain', e.target.value)}>
                                                    <option value="">Choose the main field of study...</option>
                                                    {domains.map(d => <option key={d} value={d}>{d}</option>)}
                                                </select>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">Degree Group</label>
                                                <select className="input-field" disabled={!edu.domain} value={edu.degreeGroup} onChange={e => updateEdu(idx, 'degreeGroup', e.target.value)}>
                                                    <option value="">Select your degree category...</option>
                                                    {groups.map(g => <option key={g} value={g}>{g}</option>)}
                                                </select>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-bold text-text-secondary uppercase tracking-widest flex items-center gap-2">
                                                    Specialization {edu.isDualSpecialization ? '1' : ''} <Sparkles size={10} className="text-amber-400" />
                                                </label>
                                                {edu.isOtherSpec ? (
                                                    <div className="flex gap-2 relative">
                                                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-primary opacity-50"><Plus size={14} /></div>
                                                        <input className="input-field pl-9 border-primary/30 bg-primary/5" placeholder="Enter custom specialization..." value={edu.specialization} onChange={e => updateEdu(idx, 'specialization', e.target.value)} />
                                                        <button onClick={() => updateEdu(idx, 'isOtherSpec', false)} className="text-[10px] text-primary font-bold uppercase underline shrink-0 hover:text-primary-hover transition-colors">Choose List</button>
                                                    </div>
                                                ) : (
                                                    <select className="input-field border-l-4 border-l-amber-400/30" disabled={!edu.degreeGroup} value={edu.specialization} onChange={e => updateEdu(idx, 'specialization', e.target.value)}>
                                                        <option value="">Choose your specific specialization...</option>
                                                        {specs.map(s => <option key={s} value={s}>{s}</option>)}
                                                        <option value="N/A">Not Applicable (N/A)</option>
                                                        <option value="Other">+ Other / Custom Specialization</option>
                                                    </select>
                                                )}
                                            </div>

                                            {edu.isDualSpecialization && (
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-bold text-text-secondary uppercase tracking-widest flex items-center gap-2">
                                                        Specialization 2 <Sparkles size={10} className="text-amber-400" />
                                                    </label>
                                                    {edu.isOtherSpec2 ? (
                                                        <div className="flex gap-2 relative">
                                                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-primary opacity-50"><Plus size={14} /></div>
                                                            <input className="input-field pl-9 border-primary/30 bg-primary/5" placeholder="Enter custom specialization..." value={edu.specialization2} onChange={e => updateEdu(idx, 'specialization2', e.target.value)} />
                                                            <button onClick={() => updateEdu(idx, 'isOtherSpec2', false)} className="text-[10px] text-primary font-bold uppercase underline shrink-0 hover:text-primary-hover transition-colors">Choose List</button>
                                                        </div>
                                                    ) : (
                                                        <select className="input-field border-l-4 border-l-amber-400/30" disabled={!edu.degreeGroup} value={edu.specialization2} onChange={e => updateEdu(idx, 'specialization2', e.target.value)}>
                                                            <option value="">Choose your second specialization...</option>
                                                            {specs.map(s => <option key={s} value={s}>{s}</option>)}
                                                            <option value="N/A">Not Applicable (N/A)</option>
                                                            <option value="Other">+ Other / Custom Specialization</option>
                                                        </select>
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        <div className="mt-6 pt-4 border-t border-surface-border flex flex-wrap items-center gap-6">
                                            <label className="flex items-center gap-3 cursor-pointer group/check">
                                                <input type="checkbox" className="w-4 h-4 rounded border-surface-border text-primary focus:ring-primary cursor-pointer" checked={edu.currentlyPursuing} onChange={e => updateEdu(idx, 'currentlyPursuing', e.target.checked)} />
                                                <span className="text-[11px] font-bold text-text-secondary uppercase tracking-widest group-hover/check:text-text-primary transition-colors">Currently pursuing this degree</span>
                                            </label>

                                            <label className="flex items-center gap-3 cursor-pointer group/dual">
                                                <input type="checkbox" className="w-4 h-4 rounded border-surface-border text-amber-500 focus:ring-amber-500 cursor-pointer" checked={edu.isDualSpecialization} onChange={e => updateEdu(idx, 'isDualSpecialization', e.target.checked)} />
                                                <span className="text-[11px] font-bold text-text-secondary uppercase tracking-widest group-hover/dual:text-text-primary transition-colors flex items-center gap-2">
                                                    Dual Specialization <Plus size={10} className="text-amber-500" />
                                                </span>
                                            </label>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>

                        <div className="flex justify-end pt-4">
                            <button onClick={next} className="btn btn-primary px-10 py-3 text-[11px] uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-[1.02] transition-transform">
                                Continue to Career Preferences
                            </button>
                        </div>
                    </motion.div>
                )}

                {/* ── STEP 2: Career Preferences ── */}
                {step === 2 && (
                    <motion.div key="step2" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="space-y-6">
                        <div className="glass-card space-y-1 border-b border-surface-border pb-4">
                            <h2 className="text-xl font-bold text-text-primary tracking-tight uppercase flex items-center gap-2">
                                <Star size={20} className="text-primary" /> Career Preferences
                            </h2>
                            <p className="text-text-secondary text-xs">Define your ideal career path across up to 4 preference levels. Our AI weights them to find your best match.</p>
                        </div>

                        <div className="space-y-5">
                            {PREF_TIERS.map((tier, i) => renderPrefCard(tier, PREF_LABELS[i], PREF_COLORS[i], PREF_ACCENT[i]))}
                        </div>

                        <div className="flex gap-4 pt-4">
                            <button onClick={back} className="btn btn-outline flex-1 h-12 uppercase tracking-widest text-xs font-bold shadow-sm">Back</button>
                            <button onClick={next} className="btn btn-primary flex-[2] h-12 text-[11px] uppercase tracking-widest font-bold shadow-lg shadow-primary/20">Continue to Work Experience</button>
                        </div>
                    </motion.div>
                )}

                {/* ── STEP 3: Work Experience ── */}
                {step === 3 && (
                    <motion.div key="step3" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="space-y-6 glass-card">
                        <div className="flex justify-between items-center border-b border-surface-border pb-4">
                            <h2 className="text-xl font-bold text-text-primary flex items-center gap-2 tracking-tight uppercase">
                                <Briefcase size={18} className="text-primary" /> Work Experience
                            </h2>
                            <div className="flex items-center gap-4">
                                <label className="flex items-center gap-2 cursor-pointer text-[10px] font-bold text-text-secondary uppercase tracking-wide">
                                    <input type="checkbox" className="w-3 h-3 rounded text-primary focus:ring-primary" checked={formData.hasExperience === false} onChange={e => setFormData(p => ({...p, hasExperience: !e.target.checked}))} />
                                    I don't have experience
                                </label>
                                {formData.hasExperience !== false && (
                                    <button onClick={addExp} className="btn btn-outline py-1.5 px-3 text-[10px] font-bold uppercase tracking-widest gap-1 h-8">
                                        <Plus size={12} /> Add Experience
                                    </button>
                                )}
                            </div>
                        </div>
                        {formData.hasExperience !== false && (
                        <div className="space-y-4">
                            {formData.experience.map((exp, i) => (
                                <div key={i} className="p-4 rounded-lg bg-background border border-surface-border space-y-4 relative group">
                                    {formData.experience.length > 1 && (
                                        <button onClick={() => { const n = formData.experience.filter((_, idx) => idx !== i); setFormData(p => ({ ...p, experience: n })); }} className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-all opacity-0 group-hover:opacity-100 shadow-md z-10">
                                            <X size={12} />
                                        </button>
                                    )}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <label className="text-[9px] font-medium text-text-secondary uppercase tracking-widest">Organization</label>
                                            <input className="input-field py-1.5" placeholder="Company Name" value={exp.orgName} onChange={e => updateExp(i, 'orgName', e.target.value)} />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[9px] font-medium text-text-secondary uppercase tracking-widest">Designation</label>
                                            {exp.designationOther ? (
                                                <div className="flex gap-2">
                                                    <input
                                                        className="input-field py-1.5 flex-1 border-amber-400/40 bg-amber-400/5"
                                                        placeholder="Enter your designation..."
                                                        value={exp.designation}
                                                        onChange={e => updateExp(i, 'designation', e.target.value)}
                                                        autoFocus
                                                    />
                                                    <button
                                                        onClick={() => { updateExp(i, 'designationOther', false); updateExp(i, 'designation', ''); }}
                                                        className="text-[9px] text-primary font-bold uppercase underline shrink-0"
                                                    >Search</button>
                                                </div>
                                            ) : (
                                                <div className="space-y-1">
                                                    <RoleSearch
                                                        value={exp.designation}
                                                        onChange={val => updateExp(i, 'designation', val)}
                                                        placeholder="Type 2+ letters — e.g. Software Engineer..."
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => updateExp(i, 'designationOther', true)}
                                                        className="text-[9px] text-text-secondary hover:text-primary font-bold uppercase tracking-widest underline"
                                                    >Not listed? Enter manually</button>
                                                </div>
                                            )}
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[9px] font-medium text-text-secondary uppercase tracking-widest">Sector</label>
                                            {exp.sectorOther !== undefined && !SECTORS.includes(exp.sector) && exp.sector !== '' ? (
                                                <div className="flex gap-2">
                                                    <input
                                                        className="input-field py-1.5 flex-1 border-amber-400/40 bg-amber-400/5"
                                                        placeholder="Enter your sector..."
                                                        value={exp.sector}
                                                        onChange={e => updateExp(i, 'sector', e.target.value)}
                                                        autoFocus
                                                    />
                                                    <button
                                                        onClick={() => updateExp(i, 'sector', '')}
                                                        className="text-[9px] text-primary font-bold uppercase underline shrink-0"
                                                    >Choose List</button>
                                                </div>
                                            ) : (
                                                <select className="input-field py-1.5" value={exp.sector} onChange={e => {
                                                    if (e.target.value === '__other__') { updateExp(i, 'sector', ' '); }
                                                    else { updateExp(i, 'sector', e.target.value); }
                                                }}>
                                                    <option value="">Select sector...</option>
                                                    {SECTORS.map(s => <option key={s} value={s}>{s}</option>)}
                                                    <option value="__other__">+ Other (type your own)</option>
                                                </select>
                                            )}
                                        </div>
                                        <div className="grid grid-cols-2 gap-2">
                                            <div className="space-y-1">
                                                <label className="text-[9px] font-medium text-text-secondary uppercase tracking-widest">From</label>
                                                <input type="date" className="input-field py-1.5 text-xs text-text-primary" value={exp.startDate} max={new Date().toISOString().split('T')[0]} onChange={e => updateExp(i, 'startDate', e.target.value)} />
                                            </div>
                                            {!exp.currentlyWorking && (
                                                <div className="space-y-1">
                                                    <label className="text-[9px] font-medium text-text-secondary uppercase tracking-widest">To</label>
                                                    <input type="date" className="input-field py-1.5 text-xs text-text-primary" value={exp.endDate} min={exp.startDate} max={new Date().toISOString().split('T')[0]} onChange={e => updateExp(i, 'endDate', e.target.value)} />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <label className="flex items-center gap-2 cursor-pointer w-fit p-1.5 px-3 border border-surface-border rounded bg-surface">
                                        <input type="checkbox" className="w-3 h-3 text-primary focus:ring-primary" checked={exp.currentlyWorking} onChange={e => updateExp(i, 'currentlyWorking', e.target.checked)} />
                                        <span className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">Currently Working Here</span>
                                    </label>
                                </div>
                            ))}
                        </div>
                        )}
                        <div className="flex gap-4">
                            <button onClick={back} className="btn btn-outline flex-1 h-10 uppercase tracking-widest text-xs">Back</button>
                            <button onClick={next} className="btn btn-primary flex-[2] h-10 text-[11px] uppercase tracking-widest">Continue to Certifications</button>
                        </div>
                    </motion.div>
                )}

                {/* ── STEP 4: Certifications ── */}
                {step === 4 && (
                    <motion.div key="step4" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6 glass-card">
                        <div className="text-center space-y-1 pb-4 border-b border-surface-border">
                            <Award className="mx-auto text-primary mb-2" size={24} />
                            <h2 className="text-xl font-bold text-text-primary uppercase tracking-tight">Certifications</h2>
                            <p className="text-text-secondary text-xs">Add your professional certifications and the skills they demonstrate.</p>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-4">
                                <div className="flex justify-between items-center bg-surface-hover p-2 px-4 rounded border border-surface-border">
                                    <h4 className="font-bold flex items-center gap-2 text-xs uppercase tracking-tight text-text-primary"><Database size={14} className="text-primary" /> Credentials</h4>
                                    <div className="flex items-center gap-4">
                                        <label className="flex items-center gap-2 cursor-pointer text-[10px] font-bold text-text-secondary uppercase tracking-wide">
                                            <input type="checkbox" className="w-3 h-3 rounded text-primary focus:ring-primary" checked={!formData.hasCertifications} onChange={e => setFormData(p => ({...p, hasCertifications: !e.target.checked}))} />
                                            I don't have certificates
                                        </label>
                                        {formData.hasCertifications && (
                                            <button onClick={addCert} className="text-[9px] font-bold text-primary bg-primary/10 px-2 py-1 rounded hover:bg-primary/20 transition-all uppercase">+ Add Cert</button>
                                        )}
                                    </div>
                                </div>
                                {formData.hasCertifications && (
                                    <div className="space-y-3">
                                        {formData.certifications.map((cert, i) => (
                                            <div key={i} className="space-y-3 border-l-2 border-primary/20 pl-4 pb-3 relative group glass-card p-4">
                                                {formData.certifications.length > 1 && (
                                                    <button onClick={() => { const n = formData.certifications.filter((_, idx) => idx !== i); setFormData(p => ({ ...p, certifications: n })); }} className="absolute top-2 right-2 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 opacity-0 group-hover:opacity-100 shadow-sm transition-all z-10">
                                                        <X size={10} />
                                                    </button>
                                                )}
                                                {/* Row 1: cert fields */}
                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                                                    <div className="space-y-1">
                                                        <label className="text-[9px] font-medium text-text-secondary uppercase tracking-widest">Certificate Name</label>
                                                        <input className="input-field py-1.5 text-[11px]" placeholder="e.g. AWS Certified..." value={cert.name} onChange={e => updateCert(i, 'name', e.target.value)} />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <label className="text-[9px] font-medium text-text-secondary uppercase tracking-widest">Issuer</label>
                                                        <input className="input-field py-1.5 text-[11px]" placeholder="e.g. Amazon" value={cert.issuer} onChange={e => updateCert(i, 'issuer', e.target.value)} />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <label className="text-[9px] font-medium text-text-secondary uppercase tracking-widest">Year</label>
                                                        <select className="input-field py-1.5 text-[11px]" value={cert.year} onChange={e => updateCert(i, 'year', e.target.value)}>
                                                            <option value="">Year</option>
                                                            {Array.from({ length: 40 }, (_, k) => new Date().getFullYear() - k).map(y => <option key={y} value={y}>{y}</option>)}
                                                        </select>
                                                    </div>
                                                    <div className="space-y-1">
                                                        <label className="text-[9px] font-medium text-text-secondary uppercase tracking-widest">Validation Method</label>
                                                        <select className="input-field py-1.5 text-[11px] border-primary/40 bg-primary/5" value={cert.mode} onChange={e => updateCert(i, 'mode', e.target.value)}>
                                                            <option value="URL">Direct HTML Link</option>
                                                            <option value="SCAN">Scan Certificate PDF/Image</option>
                                                            <option value="QR">Scan QR Code</option>
                                                        </select>
                                                    </div>
                                                </div>
                                                
                                                {/* Row 1.5: Validation Input */}
                                                <div className="p-3 bg-surface rounded-lg border border-surface-border">
                                                    {cert.mode === 'URL' && (
                                                        <div className="space-y-1">
                                                            <label className="text-[9px] font-medium text-text-secondary uppercase tracking-widest flex items-center gap-1"><Sparkles size={10} className="text-primary"/> Credential URL <span className="text-[8px] text-text-secondary opacity-70">(Required to prevent fake entries)</span></label>
                                                            <input className="input-field py-1.5 text-[11px]" placeholder="https://credly.com/..." value={cert.url} onChange={e => updateCert(i, 'url', e.target.value)} />
                                                        </div>
                                                    )}
                                                    {(cert.mode === 'SCAN' || cert.mode === 'QR') && (
                                                        <div className="space-y-2">
                                                            <label className="text-[9px] font-medium text-text-secondary uppercase tracking-widest flex items-center gap-1"><Sparkles size={10} className="text-primary"/> Upload Evidence <span className="text-[8px] text-text-secondary opacity-70">(Required to prevent fake entries)</span></label>
                                                            <div className="flex items-center gap-3">
                                                                <input type="file" className="text-[10px] file:mr-3 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-[10px] file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 text-text-secondary cursor-pointer" accept="image/*,.pdf" onChange={e => updateCert(i, 'fileUrl', e.target.files[0]?.name || '')} />
                                                                {cert.fileUrl && <span className="text-[10px] text-green-500 font-bold flex items-center gap-1"><CheckCircle size={10}/> Attached: {cert.fileUrl}</span>}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Row 2: Skills tag-input */}
                                                <div className="space-y-1.5 pt-2 border-t border-surface-border/50">
                                                    <label className="text-[9px] font-bold text-text-secondary uppercase tracking-widest flex items-center gap-1.5">
                                                        <Star size={9} className="text-primary" /> Skills Demonstrated
                                                        {(cert.skills || []).length > 0 && (
                                                            <span className="ml-1 text-primary">{cert.skills.length} added</span>
                                                        )}
                                                    </label>
                                                    {(cert.skills || []).length > 0 && (
                                                        <div className="flex flex-wrap gap-1.5 p-2 bg-surface rounded border border-surface-border">
                                                            {(cert.skills || []).map((sk, si) => (
                                                                <span key={si} className="flex items-center gap-1 bg-primary/10 text-primary border border-primary/20 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                                                                    {sk}
                                                                    <button type="button"
                                                                        onClick={() => updateCert(i, 'skills', cert.skills.filter((_, idx) => idx !== si))}
                                                                        className="w-3 h-3 rounded-full bg-primary/20 hover:bg-red-500 hover:text-white flex items-center justify-center transition-colors"
                                                                    >
                                                                        <X size={7} strokeWidth={3} />
                                                                    </button>
                                                                </span>
                                                            ))}
                                                        </div>
                                                    )}
                                                    <div className="relative">
                                                        <input
                                                            className="input-field py-1.5 text-[11px] pr-20"
                                                            placeholder="Type a skill & press Enter..."
                                                            onKeyDown={e => {
                                                                if (e.key === 'Enter') {
                                                                    e.preventDefault();
                                                                    const val = e.target.value.trim();
                                                                    if (!val) return;
                                                                    const cur = cert.skills || [];
                                                                    if (cur.some(s => s.toLowerCase() === val.toLowerCase())) {
                                                                        e.target.classList.add('border-red-400', 'bg-red-400/5');
                                                                        setTimeout(() => e.target.classList.remove('border-red-400', 'bg-red-400/5'), 1000);
                                                                        return;
                                                                    }
                                                                    updateCert(i, 'skills', [...cur, val]);
                                                                    e.target.value = '';
                                                                }
                                                            }}
                                                        />
                                                        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[8px] font-bold text-text-secondary uppercase pointer-events-none">Enter ↵</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                            </div>
                        </div>

                        <div className="flex gap-4 mt-6">
                            <button onClick={back} className="btn btn-outline flex-1 h-12 uppercase tracking-widest text-xs font-bold shadow-sm">Back</button>
                            <button onClick={handleSubmit} disabled={loading} className="btn btn-primary flex-[2] h-12 text-sm font-bold uppercase tracking-widest shadow-md">
                                {loading ? (
                                    <div className="flex items-center justify-center gap-2">
                                        <Loader2 size={16} className="animate-spin text-white" />
                                        <span>Synthesizing...</span>
                                    </div>
                                ) : "Generate Career Report"}
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Onboarding;
