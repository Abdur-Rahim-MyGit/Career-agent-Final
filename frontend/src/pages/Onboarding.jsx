import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, ArrowRight, Plus, Trash2, Check, AlertCircle, Loader2 } from 'lucide-react';

const degreeOptions = ["B.Tech", "B.Sc", "B.Com", "BCA", "BBA", "M.Tech", "MBA", "M.Sc", "MCA", "BA", "MA", "Other"];
const specialisationsByDegree = {
    "B.Tech": ["Computer Science", "Information Technology", "Electronics", "Mechanical", "Civil", "AI/ML", "Cyber Security"],
    "B.Sc": ["Computer Science", "Information Technology", "Mathematics", "Physics", "Chemistry"],
    "BCA": ["General", "Data Science", "Cloud Computing"],
    "B.Com": ["General", "Finance", "Accounting", "Corporate Secretaryship"],
    "BBA": ["Marketing", "HR", "Finance", "Operations", "International Business"],
    "default": ["General", "Other"]
};
const interestAreas = [
    "Research/Writing/Content", "Education/Training", "Policy/Governance", 
    "Business Operations", "Digital Marketing", "Data/Analytics", 
    "Entrepreneurship", "Software Development", "Design/Creative", "Sales/BD", "Core Engineering", "Other"
];
const foundationSkills = [
    "Communication", "Data Analysis", "Python", "Java", "SQL", 
    "React", "Project Management", "Digital Marketing", "Machine Learning", "Content Writing"
];
const indianCities = [
    "Bangalore", "Mumbai", "Delhi NCR", "Hyderabad", "Chennai", "Pune", "Kolkata", "Ahmedabad", "Remote", "Any"
];
const orgTypeOptions = ['Startup', 'MNC', 'Government', 'NGO', 'Self-employed'];
const expectationsSectors = [
    "IT/Software", "Finance/Banking", "Education/EdTech", "Healthcare", "Manufacturing", 
    "E-commerce", "Consulting", "Media/Entertainment", "Retail", "Government"
];
const experienceTypes = ["Internship", "Part-time", "Volunteering", "Project", "Full-time"];

export default function Onboarding() {
    const navigate = useNavigate();
    
    // UI State
    const [step, setStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    
    // Form State
    const [formData, setFormData] = useState({
        // STEP 1
        name: '', email: '', phone: '', password: '', 
        degreeType: '', specialisation: '', yearOfStudy: '', graduationYear: '', collegeCode: '',
        ack: false,
        // STEP 2
        careerInterestArea: '', specificRole: '',
        // STEP 3
        skills: [], // array of { name, evidenceType, certificateId }
        // STEP 4
        experience: [{ id: Date.now(), org: '', role: '', type: 'Internship', start: '', end: '', current: false }],
        // STEP 5
        preferredSector: [],
        targetRole: '',
        expectedSalary: '',
        preferredLocation: [],
        orgType: []
    });

    // Handlers
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    // Array manipulation for multi-selects
    const handleMultiSelect = (field, value, maxItems) => {
        setFormData(prev => {
            let arr = [...prev[field]];
            if (arr.includes(value)) {
                arr = arr.filter(v => v !== value);
            } else if (arr.length < maxItems) {
                arr.push(value);
            }
            return { ...prev, [field]: arr };
        });
    };

    // Skill handlers
    const toggleSkill = (skillName) => {
        setFormData(prev => {
            const hasSkill = prev.skills.some(s => s.name === skillName);
            let newSkills = [...prev.skills];
            if (hasSkill) newSkills = newSkills.filter(s => s.name !== skillName);
            else newSkills.push({ name: skillName, evidenceType: '', certificateId: '' });
            return { ...prev, skills: newSkills };
        });
    };
    
    const updateSkill = (skillName, field, value) => {
        setFormData(prev => ({
            ...prev,
            skills: prev.skills.map(s => s.name === skillName ? { ...s, [field]: value } : s)
        }));
    };

    // Experience handlers
    const handleExpChange = (id, field, value) => {
        setFormData(prev => ({
            ...prev,
            experience: prev.experience.map(e => e.id === id ? { ...e, [field]: value } : e)
        }));
    };
    const addExperience = () => {
        setFormData(prev => ({
            ...prev,
            experience: [...prev.experience, { id: Date.now(), org: '', role: '', type: 'Internship', start: '', end: '', current: false }]
        }));
    };
    const removeExperience = (id) => {
        setFormData(prev => ({
            ...prev,
            experience: prev.experience.filter(e => e.id !== id)
        }));
    };

    // Validations & Navigation
    const validateStep1 = () => {
        if (!formData.name || !formData.email || !formData.password || !formData.degreeType || !formData.collegeCode || !formData.ack) {
            setErrorMsg("Please fill all required fields and accept the acknowledgment.");
            return false;
        }
        if (formData.collegeCode.length !== 6) {
            setErrorMsg("College code must be exactly 6 characters.");
            return false;
        }
        setErrorMsg("");
        return true;
    };

    const nextStep = () => {
        if (step === 1 && !validateStep1()) return;
        setStep(prev => Math.min(prev + 1, 5));
        window.scrollTo(0, 0);
    };
    
    const prevStep = () => setStep(prev => Math.max(prev - 1, 1));
    const skipStep = () => {
        setStep(prev => Math.min(prev + 1, 5));
        window.scrollTo(0, 0);
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        setErrorMsg("");
        
        // Prepare payload exactly as requested
        const payload = {
            name: formData.name,
            email: formData.email,
            phone: formData.phone || null,
            password: formData.password,
            education: {
                degreeType: formData.degreeType,
                specialisation: formData.specialisation || 'General',
                yearOfStudy: formData.yearOfStudy || '1',
                graduationYear: formData.graduationYear || '2025',
                degreeGroup: formData.degreeType // Using degreeType as fallback for degreeGroup
            },
            collegeCode: formData.collegeCode,
            careerInterest: {
                area: formData.careerInterestArea || null,
                specificRole: formData.specificRole || null
            },
            skills: formData.skills.filter(s => s.name).map(s => ({
                name: s.name,
                evidenceType: s.evidenceType || 'Self-taught',
                certificateId: s.certificateId || null
            })),
            experience: formData.experience.filter(e => e.org && e.role).map(e => ({
                org: e.org,
                role: e.role,
                type: e.type,
                start: e.start || null,
                end: e.current ? 'Present' : (e.end || null),
                current: e.current
            })),
            preferences: {
                primary: {
                    jobRole: formData.targetRole || null,
                    sector: formData.preferredSector,
                    salary: formData.expectedSalary || null,
                    location: formData.preferredLocation,
                    orgType: formData.orgType
                }
            }
        };

        try {
            const response = await fetch('/api/onboarding', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await response.json();
            
            if (data.success && data.analysisId) {
                localStorage.setItem('smaart_analysis_id', data.analysisId);
                localStorage.setItem('smaart_college_code', formData.collegeCode);
                navigate('/dashboard');
            } else {
                setErrorMsg(data.message || "Failed to process onboarding. Keep trying.");
                setIsSubmitting(false);
            }
        } catch (err) {
            setErrorMsg("A network error occurred. Please try again.");
            setIsSubmitting(false);
        }
    };

    // Derived dynamic lists
    const currentSpecialisations = specialisationsByDegree[formData.degreeType] || specialisationsByDegree["default"];

    const renderStepIndicator = () => (
        <div className="flex items-center justify-center gap-3 mb-8">
            <span className="text-sm font-bold text-text-secondary uppercase tracking-widest">Step {step} of 5</span>
            <div className="flex gap-1.5">
                {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} className={`w-2.5 h-2.5 rounded-full transition-all ${step === i ? 'bg-primary scale-125' : step > i ? 'bg-primary/40' : 'bg-surface-border'}`} />
                ))}
            </div>
        </div>
    );

    const renderStep1 = () => (
        <div className="space-y-6">
            <div className="text-center mb-8">
                <h2 className="text-2xl font-black text-text-primary">Academic Profile</h2>
                <p className="text-text-secondary mt-2">Let's start with your baseline academic details.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-bold text-text-secondary uppercase mb-2">Full Name *</label>
                    <input autoFocus type="text" name="name" value={formData.name} onChange={handleChange} className="w-full bg-surface border border-surface-border rounded-lg px-4 py-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-gray-400 font-medium" placeholder="E.g. Vikram Aditya" />
                </div>
                <div>
                    <label className="block text-xs font-bold text-text-secondary uppercase mb-2">Email Address *</label>
                    <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full bg-surface border border-surface-border rounded-lg px-4 py-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-gray-400 font-medium" placeholder="your@email.com" />
                </div>
                <div>
                    <label className="block text-xs font-bold text-text-secondary uppercase mb-2">Password *</label>
                    <input type="password" name="password" value={formData.password} onChange={handleChange} className="w-full bg-surface border border-surface-border rounded-lg px-4 py-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-gray-400 font-medium" placeholder="••••••••" />
                </div>
                <div>
                    <label className="block text-xs font-bold text-text-secondary uppercase mb-2">Phone (Optional)</label>
                    <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="w-full bg-surface border border-surface-border rounded-lg px-4 py-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-gray-400 font-medium" placeholder="+91 99999 99999" />
                </div>
            </div>

            <div className="h-px bg-surface-border my-8 w-full"></div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-bold text-text-secondary uppercase mb-2">Degree Type *</label>
                    <select name="degreeType" value={formData.degreeType} onChange={handleChange} className="w-full bg-surface border border-surface-border rounded-lg px-4 py-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all font-medium appearance-none">
                        <option value="">Select Degree</option>
                        {degreeOptions.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-xs font-bold text-text-secondary uppercase mb-2">Specialisation *</label>
                    <select name="specialisation" value={formData.specialisation} onChange={handleChange} disabled={!formData.degreeType} className="w-full bg-surface border border-surface-border rounded-lg px-4 py-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all font-medium appearance-none disabled:bg-gray-50 disabled:opacity-50">
                        <option value="">Select Specialisation</option>
                        {currentSpecialisations.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-xs font-bold text-text-secondary uppercase mb-2">Year of Study *</label>
                    <select name="yearOfStudy" value={formData.yearOfStudy} onChange={handleChange} className="w-full bg-surface border border-surface-border rounded-lg px-4 py-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all font-medium appearance-none">
                        <option value="">Select Year</option>
                        {[1, 2, 3, 4, 5].map(y => <option key={y} value={y}>Year {y}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-xs font-bold text-text-secondary uppercase mb-2">Graduation Year *</label>
                    <select name="graduationYear" value={formData.graduationYear} onChange={handleChange} className="w-full bg-surface border border-surface-border rounded-lg px-4 py-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all font-medium appearance-none">
                        <option value="">Select Year</option>
                        {[2025, 2026, 2027, 2028, 2029, 2030].map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                </div>
            </div>

            <div className="mt-6">
                <label className="block text-xs font-bold text-text-secondary uppercase mb-2">College Code * <span className="text-[10px] lowercase font-normal opacity-70">(Links to your Placement Officer)</span></label>
                <input type="text" name="collegeCode" maxLength={6} value={formData.collegeCode} onChange={(e) => setFormData({...formData, collegeCode: e.target.value.toUpperCase()})} className="w-full md:w-1/2 bg-surface border border-surface-border rounded-lg px-4 py-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-gray-400 font-bold tracking-widest uppercase" placeholder="XXXXXX" />
            </div>

            <div className={`mt-8 p-6 rounded-xl border transition-all ${formData.ack ? 'bg-primary/5 border-primary/30' : 'bg-surface border-surface-border'}`}>
                <h4 className="text-sm font-bold text-text-primary mb-2 flex items-center gap-2">
                    <AlertCircle size={16} className={formData.ack ? "text-primary" : "text-text-secondary"} /> Data Consent Acknowledgment
                </h4>
                <p className="text-xs text-text-secondary leading-relaxed mb-4">
                    By proceeding, you acknowledge that your academic, skill, and interest data will be processed by SMAART's intelligence engine to generate personalised career pathways. Your macro-insights may be visible to your designated Placement Officer.
                </p>
                <button type="button" onClick={() => setFormData({...formData, ack: !formData.ack})} className={`flex items-center gap-2 px-6 py-2 rounded-lg text-xs font-bold transition-all ${formData.ack ? 'bg-primary text-white' : 'bg-surface-hover text-text-secondary border border-surface-border'}`}>
                    {formData.ack && <Check size={14} />} I Understand
                </button>
            </div>
            {errorMsg && <p className="text-sm font-bold text-red-500 mt-4 text-center">{errorMsg}</p>}
            
            <div className="flex justify-end mt-8">
                <button onClick={nextStep} className="bg-text-primary text-surface px-8 py-3 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-black transition-all">
                    Save & Continue <ArrowRight size={16} />
                </button>
            </div>
        </div>
    );

    const renderStep2 = () => (
        <div className="space-y-6">
            <div className="text-center mb-8">
                <h2 className="text-2xl font-black text-text-primary">Career Interest</h2>
                <p className="text-text-secondary mt-2">What professional directions appeal to you the most?</p>
            </div>
            
            <div className="max-w-xl mx-auto space-y-6">
                <div>
                    <label className="block text-xs font-bold text-text-secondary uppercase mb-2">Broad Interest Area</label>
                    <select name="careerInterestArea" value={formData.careerInterestArea} onChange={handleChange} className="w-full bg-surface border border-surface-border rounded-lg px-4 py-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all font-medium appearance-none">
                        <option value="">Select an interest area</option>
                        {interestAreas.map(a => <option key={a} value={a}>{a}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-xs font-bold text-text-secondary uppercase mb-2">Specific Role <span className="text-[10px] opacity-70">(Optional)</span></label>
                    <input type="text" name="specificRole" value={formData.specificRole} onChange={handleChange} list="jobRoles" className="w-full bg-surface border border-surface-border rounded-lg px-4 py-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-gray-400 font-medium" placeholder="E.g. Frontend Developer, Data Analyst..." />
                    <datalist id="jobRoles">
                        <option value="Frontend Developer" />
                        <option value="Backend Developer" />
                        <option value="Data Scientist" />
                        <option value="Product Manager" />
                        <option value="Marketing Specialist" />
                        <option value="Business Analyst" />
                    </datalist>
                </div>
            </div>

            <div className="flex justify-between mt-12 pt-6 border-t border-surface-border max-w-xl mx-auto">
                <button onClick={skipStep} className="text-sm font-bold text-text-secondary px-6 py-3 hover:text-text-primary transition-all">Skip for now</button>
                <div className="flex gap-4">
                    <button onClick={prevStep} className="text-sm font-bold text-text-secondary px-6 py-3 border border-surface-border rounded-lg hover:bg-surface-hover transition-all">Back</button>
                    <button onClick={nextStep} className="bg-primary text-white px-8 py-3 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-primary/90 transition-all shadow-md shadow-primary/20">
                        Continue <ChevronRight size={16} />
                    </button>
                </div>
            </div>
        </div>
    );

    const renderStep3 = () => (
        <div className="space-y-6">
            <div className="text-center mb-8">
                <h2 className="text-2xl font-black text-text-primary">Skills & Certifications</h2>
                <p className="text-text-secondary mt-2">Check the foundational skills you already possess.</p>
            </div>
            
            <div className="max-w-2xl mx-auto space-y-4">
                {foundationSkills.map((skill, idx) => {
                    const isChecked = formData.skills.some(s => s.name === skill);
                    const skillData = formData.skills.find(s => s.name === skill) || {};
                    return (
                        <div key={idx} className={`p-4 rounded-xl border transition-all ${isChecked ? 'border-primary ring-1 ring-primary shadow-sm bg-white' : 'border-surface-border bg-surface'}`}>
                            <label className="flex items-center gap-3 cursor-pointer select-none">
                                <div className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${isChecked ? 'bg-primary border-primary text-white' : 'border-gray-300 bg-white'}`}>
                                    {isChecked && <Check size={14} strokeWidth={3} />}
                                </div>
                                <span className={`text-sm font-bold transition-all ${isChecked ? 'text-text-primary' : 'text-text-secondary'}`}>{skill}</span>
                            </label>
                            
                            {isChecked && (
                                <div className="mt-4 pt-4 border-t border-surface-border pl-8 animate-in slide-in-from-top-2 duration-200">
                                    <p className="text-[10px] font-bold text-text-secondary uppercase tracking-widest mb-3">How did you learn this?</p>
                                    <div className="flex flex-wrap gap-2 mb-4">
                                        {['Online course', 'Certification', 'College coursework', 'Self-taught'].map(type => (
                                            <button 
                                                key={type} 
                                                onClick={() => updateSkill(skill, 'evidenceType', type)}
                                                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all border ${skillData.evidenceType === type ? 'bg-primary/10 border-primary text-primary' : 'bg-surface hover:bg-surface-hover border-surface-border text-text-secondary'}`}
                                            >
                                                {type}
                                            </button>
                                        ))}
                                    </div>
                                    <div className="max-w-xs">
                                        <input 
                                            type="text" 
                                            value={skillData.certificateId || ''} 
                                            onChange={(e) => updateSkill(skill, 'certificateId', e.target.value)}
                                            placeholder="Certificate ID / URL (Optional)" 
                                            className="w-full bg-surface border border-surface-border rounded-lg px-3 py-2 text-xs focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-gray-400"
                                        />
                                    </div>
                                </div>
                            )}
                            <input type="checkbox" className="hidden" onChange={() => toggleSkill(skill)} checked={isChecked} />
                        </div>
                    );
                })}
            </div>

            <div className="flex justify-between mt-12 pt-6 border-t border-surface-border max-w-2xl mx-auto">
                <button onClick={skipStep} className="text-sm font-bold text-text-secondary px-6 py-3 hover:text-text-primary transition-all">Skip for now</button>
                <div className="flex gap-4">
                    <button onClick={prevStep} className="text-sm font-bold text-text-secondary px-6 py-3 border border-surface-border rounded-lg hover:bg-surface-hover transition-all">Back</button>
                    <button onClick={nextStep} className="bg-primary text-white px-8 py-3 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-primary/90 transition-all shadow-md shadow-primary/20">
                        Continue <ChevronRight size={16} />
                    </button>
                </div>
            </div>
        </div>
    );

    const renderStep4 = () => (
        <div className="space-y-6">
            <div className="text-center mb-8">
                <h2 className="text-2xl font-black text-text-primary">Experience & Projects</h2>
                <p className="text-text-secondary mt-2">List any internships, part-time work, or major projects.</p>
            </div>
            
            <div className="max-w-3xl mx-auto space-y-6">
                {formData.experience.map((exp, index) => (
                    <div key={exp.id} className="p-6 bg-surface border border-surface-border rounded-xl relative">
                        {formData.experience.length > 1 && (
                            <button onClick={() => removeExperience(exp.id)} className="absolute top-6 right-6 text-gray-400 hover:text-red-500 transition-colors">
                                <Trash2 size={18} />
                            </button>
                        )}
                        <h4 className="text-xs font-bold text-text-secondary uppercase tracking-widest mb-4">Entry {index + 1}</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-text-secondary uppercase mb-2">Organisation / Project Name</label>
                                <input type="text" value={exp.org} onChange={e => handleExpChange(exp.id, 'org', e.target.value)} className="w-full bg-white border border-surface-border rounded-lg px-4 py-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-gray-400 font-medium" placeholder="E.g. Acme Corp" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-text-secondary uppercase mb-2">Role / Title</label>
                                <input type="text" value={exp.role} onChange={e => handleExpChange(exp.id, 'role', e.target.value)} className="w-full bg-white border border-surface-border rounded-lg px-4 py-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-gray-400 font-medium" placeholder="E.g. Marketing Intern" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-text-secondary uppercase mb-2">Experience Type</label>
                                <select value={exp.type} onChange={e => handleExpChange(exp.id, 'type', e.target.value)} className="w-full bg-white border border-surface-border rounded-lg px-4 py-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all font-medium appearance-none">
                                    {experienceTypes.map(t => <option key={t} value={t}>{t}</option>)}
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="block text-xs font-bold text-text-secondary uppercase mb-2">Start Date</label>
                                    <input type="month" value={exp.start} onChange={e => handleExpChange(exp.id, 'start', e.target.value)} className="w-full bg-white border border-surface-border rounded-lg px-3 py-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all font-medium" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-text-secondary uppercase mb-2">End Date</label>
                                    <input type="month" value={exp.end} onChange={e => handleExpChange(exp.id, 'end', e.target.value)} disabled={exp.current} className="w-full bg-white border border-surface-border rounded-lg px-3 py-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all font-medium disabled:opacity-50 disabled:bg-gray-50" />
                                </div>
                            </div>
                        </div>
                        <div className="mt-4 flex items-center gap-2">
                            <input type="checkbox" id={`curr-${exp.id}`} checked={exp.current} onChange={e => handleExpChange(exp.id, 'current', e.target.checked)} className="rounded text-primary focus:ring-primary w-4 h-4 cursor-pointer" />
                            <label htmlFor={`curr-${exp.id}`} className="text-sm font-semibold text-text-secondary cursor-pointer select-none">Currently working here</label>
                        </div>
                    </div>
                ))}
                
                <button onClick={addExperience} className="w-full py-4 border-2 border-dashed border-surface-border rounded-xl text-sm font-bold text-text-secondary hover:text-primary hover:border-primary hover:bg-primary/5 transition-all flex items-center justify-center gap-2">
                    <Plus size={18} /> Add another entry
                </button>
            </div>

            <div className="flex justify-between mt-12 pt-6 border-t border-surface-border max-w-3xl mx-auto">
                <button onClick={skipStep} className="text-sm font-bold text-text-secondary px-6 py-3 hover:text-text-primary transition-all">Skip for now</button>
                <div className="flex gap-4">
                    <button onClick={prevStep} className="text-sm font-bold text-text-secondary px-6 py-3 border border-surface-border rounded-lg hover:bg-surface-hover transition-all">Back</button>
                    <button onClick={nextStep} className="bg-primary text-white px-8 py-3 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-primary/90 transition-all shadow-md shadow-primary/20">
                        Continue <ChevronRight size={16} />
                    </button>
                </div>
            </div>
        </div>
    );

    const renderStep5 = () => (
        <div className="space-y-6">
            <div className="text-center mb-8">
                <h2 className="text-2xl font-black text-text-primary">Career Expectations</h2>
                <p className="text-text-secondary mt-2">What does your ideal starting career look like?</p>
            </div>
            
            <div className="max-w-2xl mx-auto space-y-8">
                <div>
                    <div className="flex justify-between items-end mb-3">
                        <label className="block text-xs font-bold text-text-secondary uppercase">Preferred Sector <span className="text-[10px] lowercase opacity-70">(up to 3)</span></label>
                        <span className="text-xs font-bold text-primary">{formData.preferredSector.length}/3</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {expectationsSectors.map(s => {
                            const selected = formData.preferredSector.includes(s);
                            const maxedOut = !selected && formData.preferredSector.length >= 3;
                            return (
                                <button key={s} onClick={() => handleMultiSelect('preferredSector', s, 3)} disabled={maxedOut} className={`px-4 py-2 rounded-full text-xs font-bold transition-all border ${selected ? 'bg-primary border-primary text-white shadow-sm' : 'bg-surface border-surface-border text-text-secondary hover:border-gray-400'} ${maxedOut && 'opacity-50 cursor-not-allowed hidden md:inline-flex'}`}>
                                    {s}
                                </button>
                            )
                        })}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-xs font-bold text-text-secondary uppercase mb-2">Target Role</label>
                        <input type="text" value={formData.targetRole} onChange={e => setFormData({...formData, targetRole: e.target.value})} list="jobRoles5" className="w-full bg-surface border border-surface-border rounded-lg px-4 py-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-gray-400 font-medium" placeholder="E.g. Data Analyst" />
                        <datalist id="jobRoles5">
                            <option value="Associate Consultant" />
                            <option value="Graduate Engineer Trainee" />
                            <option value="Software Developer" />
                            <option value="Financial Analyst" />
                        </datalist>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-text-secondary uppercase mb-2">Expected Salary</label>
                        <select value={formData.expectedSalary} onChange={e => setFormData({...formData, expectedSalary: e.target.value})} className="w-full bg-surface border border-surface-border rounded-lg px-4 py-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all font-medium appearance-none">
                            <option value="">Select Range</option>
                            <option value="0-3 LPA">0-3 Lakhs / year</option>
                            <option value="3-5 LPA">3-5 Lakhs / year</option>
                            <option value="5-8 LPA">5-8 Lakhs / year</option>
                            <option value="8+ LPA">8+ Lakhs / year</option>
                        </select>
                    </div>
                </div>

                <div>
                    <div className="flex justify-between items-end mb-3">
                        <label className="block text-xs font-bold text-text-secondary uppercase">Preferred Location <span className="text-[10px] lowercase opacity-70">(up to 3)</span></label>
                        <span className="text-xs font-bold text-primary">{formData.preferredLocation.length}/3</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {indianCities.map(c => {
                            const selected = formData.preferredLocation.includes(c);
                            const maxedOut = !selected && formData.preferredLocation.length >= 3;
                            return (
                                <button key={c} onClick={() => handleMultiSelect('preferredLocation', c, 3)} disabled={maxedOut} className={`px-4 py-2 rounded-full text-xs font-bold transition-all border ${selected ? 'bg-primary border-primary text-white shadow-sm' : 'bg-surface border-surface-border text-text-secondary hover:border-gray-400'} ${maxedOut && 'opacity-50 cursor-not-allowed'}`}>
                                    {c}
                                </button>
                            )
                        })}
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-bold text-text-secondary uppercase mb-3">Preferred Organisation Type</label>
                    <div className="flex flex-wrap gap-2">
                        {orgTypeOptions.map(o => {
                            const selected = formData.orgType.includes(o);
                            return (
                                <button key={o} onClick={() => handleMultiSelect('orgType', o, 99)} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all border ${selected ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm' : 'bg-surface border-surface-border text-text-secondary hover:border-gray-400'}`}>
                                    {o}
                                </button>
                            )
                        })}
                    </div>
                </div>
            </div>

            {errorMsg && <p className="text-sm font-bold text-red-500 mt-6 text-center">{errorMsg}</p>}

            <div className="flex justify-between mt-12 pt-6 border-t border-surface-border max-w-2xl mx-auto">
                <button onClick={skipStep} className="text-sm font-bold text-text-secondary px-6 py-3 hover:text-text-primary transition-all invisible">Skip</button>
                <div className="flex gap-4">
                    <button onClick={prevStep} disabled={isSubmitting} className="text-sm font-bold text-text-secondary px-6 py-3 border border-surface-border rounded-lg hover:bg-surface-hover transition-all disabled:opacity-50">Back</button>
                    <button onClick={handleSubmit} disabled={isSubmitting} className="bg-emerald-600 text-white px-8 py-3 rounded-lg text-sm font-bold flex items-center justify-center gap-2 hover:bg-emerald-700 transition-all shadow-md shadow-emerald-600/20 disabled:opacity-70 min-w-[200px]">
                        {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : "Complete Onboarding"}
                    </button>
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-surface py-12 px-4 selection:bg-primary/20">
            <div className="max-w-4xl mx-auto">
                {renderStepIndicator()}
                
                <div className="bg-white rounded-2xl border border-surface-border shadow-sm p-6 md:p-12 min-h-[600px]">
                    {step === 1 && renderStep1()}
                    {step === 2 && renderStep2()}
                    {step === 3 && renderStep3()}
                    {step === 4 && renderStep4()}
                    {step === 5 && renderStep5()}
                </div>
            </div>
        </div>
    );
}
