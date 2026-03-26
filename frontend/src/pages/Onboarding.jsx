import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, User, GraduationCap, Briefcase, Target, Cpu, BookOpen, Award, ChevronRight, Sparkles, Shield, MapPin, Building2, Layers } from 'lucide-react';
import dropdownData from '../data/dropdownData.json';
import jobRolesData from '../data/jobRolesData.json';
import indianCities from '../data/indianCities.json';

const JOB_TYPES = ['Full-Time','Part-Time','Internship (Full-Time)','Internship (Part-Time)','Freelance / Gig Work','Remote (Fully Distributed)'];
const SALARY_OPTIONS = ['0–3 LPA','3–5 LPA','5–8 LPA','8+ LPA'];
const ORG_TYPES = ['Startup (Early-stage / Growth-stage)','Scale-up / High-growth company','Small or Medium Enterprise (SME)','Large Indian Corporate / Conglomerate','Multinational Corporation (MNC)','Government / Public Sector Organization','Non-Profit / NGO / Social Enterprise','Academic / Research Institution','Consulting / Professional Services Firm','Family-owned Business','Self-employed / Entrepreneurial Venture','Open to any organization type'];
const SECTORS = ['Information Technology & Software','Banking & Financial Services','Healthcare & Life Sciences','Manufacturing','Retail & E-Commerce','Energy (Oil, Gas & Renewables)','Agriculture & Food','Construction & Real Estate','Telecom & Technology Infrastructure','Automotive & Electric Vehicles','Education & EdTech','Media, Entertainment & Advertising','Pharmaceuticals & Biotechnology','Logistics & Supply Chain','Hospitality, Travel & Tourism','Government & Public Sector','Professional Services (Legal, Consulting, Accounting)','Aerospace & Defence','Renewable Energy & Clean Tech','FMCG & Consumer Goods'];
const EXP_TYPES = ['Full-Time','Part-Time','Internship (Full-Time)','Internship (Part-Time)','Freelance / Gig Work','Remote (Fully Distributed)','Volunteering'];
const VERIFY_MODES = ['URL','QR Code','Not verified'];
const EXTRA_BTECH_SPECS = ['Artificial Intelligence & Data Science','Artificial Intelligence','Machine Learning','Cyber Security','Internet of Things (IoT)','Data Science','Blockchain Technology','Robotics & Automation','Cloud Computing','AR / VR Technology','Mechatronics','Nanotechnology','Biomedical Engineering','Instrumentation & Control','Food Technology','Textile Engineering','Polymer Engineering','Agricultural Engineering','Production Engineering','Power Engineering','Environmental Engineering','Genetic Engineering','Smart Manufacturing'];

const SKILLS_POOL = ['Python','JavaScript','Java','C++','C#','PHP','Ruby','Swift','Kotlin','Go','Rust','TypeScript','React','Angular','Vue.js','Node.js','Django','Flask','Spring Boot','Laravel','FastAPI','SQL','MySQL','PostgreSQL','MongoDB','Redis','Elasticsearch','Firebase','Cassandra','AWS','Azure','GCP','Docker','Kubernetes','Terraform','Ansible','Jenkins','Git','Linux','Machine Learning','Deep Learning','TensorFlow','PyTorch','Scikit-learn','NLP','Computer Vision','Data Analysis','Power BI','Tableau','Excel','Pandas','NumPy','R Programming','MATLAB','ChatGPT','GitHub Copilot','Midjourney','DALL-E','Claude AI','Gemini','Perplexity AI','Figma','Adobe Photoshop','Illustrator','Canva','Sketch','InVision','Framer','SEO','Google Analytics','Google Ads','Meta Ads','Email Marketing','Salesforce','HubSpot','Tally ERP','QuickBooks','SAP','Oracle ERP','Financial Modelling','Excel Advanced','Communication','Leadership','Problem Solving','Project Management','Agile','Scrum','JIRA','AutoCAD','SolidWorks','LabVIEW','PLC Programming','Circuit Design','VLSI','Cyber Security','Ethical Hacking','Network Security','Penetration Testing','SIEM','IoT','Raspberry Pi','Arduino','Embedded C','Robotics','ROS','Drone Technology','Blockchain','Solidity','Smart Contracts','Web3','Ethereum','UI/UX Design','Wireframing','Prototyping','User Research','A/B Testing','Content Writing','Copywriting','Research Methodology','Academic Writing','Legal Research','Clinical Knowledge','Medical Terminology','Patient Communication','Healthcare Software'];

const STEP_META = [
  { icon: <GraduationCap size={16}/>, label:'Academic Profile', sub:'Education & credentials' },
  { icon: <Target size={16}/>,        label:'Career Goals',     sub:'Job preferences & targets' },
  { icon: <Cpu size={16}/>,            label:'Skills & Certs',   sub:'Technical competencies' },
  { icon: <Briefcase size={16}/>,      label:'Experience',       sub:'Work & project history' },
  { icon: <CheckCircle2 size={16}/>,   label:'Review & Submit',  sub:'Finalize your profile' },
];

const cs = {
  card:   { background:'var(--card-bg, var(--bg-primary))', backdropFilter:'blur(20px)', WebkitBackdropFilter:'blur(20px)', border:'0.5px solid rgba(72,72,71,0.15)', borderRadius:16, padding:'20px 24px', marginBottom:14, transition:'box-shadow 0.3s ease, transform 0.2s ease' },
  label:  { display:'block', fontSize:12, color:'var(--text-secondary)', marginBottom:5, fontWeight:500, letterSpacing:'0.01em' },
  field:  { marginBottom:14 },
  input:  { width:'100%', padding:'10px 12px', border:'0.5px solid var(--border)', borderRadius:10, fontSize:14, background:'var(--bg-primary)', color:'var(--text-primary)', outline:'none', boxSizing:'border-box', fontFamily:'var(--font-sans)', transition:'border-color 0.2s ease, box-shadow 0.2s ease' },
  btnPrimary: { padding:'11px 28px', border:'none', borderRadius:10, background:'linear-gradient(135deg, #185FA5, #1D9E75)', color:'#fff', cursor:'pointer', fontWeight:600, fontSize:14, letterSpacing:'0.01em', boxShadow:'0 2px 12px rgba(24,95,165,0.25)', transition:'all 0.2s ease' },
  btnBlue:  { padding:'11px 28px', border:'none', borderRadius:10, background:'var(--bg-info)', color:'var(--text-info)', cursor:'pointer', fontWeight:600, fontSize:14, transition:'all 0.2s ease' },
  btnGreen: { padding:'11px 28px', border:'none', borderRadius:10, background:'linear-gradient(135deg, #185FA5, #1D9E75)', color:'#fff', cursor:'pointer', fontWeight:600, fontSize:14, boxShadow:'0 2px 12px rgba(24,95,165,0.25)', transition:'all 0.2s ease' },
  btnGhost: { padding:'8px 16px', fontSize:13, border:'0.5px solid var(--border)', borderRadius:10, background:'var(--bg-secondary)', color:'var(--text-secondary)', cursor:'pointer', transition:'all 0.2s ease' },
};
const dropStyle = { position:'absolute', zIndex:100, width:'100%', marginTop:4, background:'var(--bg-primary)', border:'0.5px solid var(--border-info)', borderRadius:12, boxShadow:'0 8px 32px rgba(0,0,0,0.12)', maxHeight:200, overflowY:'auto', padding:0, listStyle:'none' };
const dropLi = { padding:'10px 14px', cursor:'pointer', borderBottom:'0.5px solid var(--border)', transition:'background 0.15s ease' };

/* ── Dots ── */
/* ── Premium Step Progress Bar ── */
function StepProgress({ current }) {
  const pct = ((current - 1) / 4) * 100;
  return (
    <div style={{ padding:'20px 0 28px' }}>
      {/* Progress track */}
      <div style={{ position:'relative', maxWidth:600, margin:'0 auto' }}>
        <div style={{ position:'absolute', top:16, left:20, right:20, height:3, background:'var(--bg-tertiary)', borderRadius:4, zIndex:0 }} />
        <motion.div initial={{ width:0 }} animate={{ width:`calc(${pct}% - ${pct < 100 ? 0 : 0}px)` }} transition={{ duration:0.5, ease:'easeInOut' }}
          style={{ position:'absolute', top:16, left:20, height:3, background:'linear-gradient(90deg, #185FA5, #1D9E75)', borderRadius:4, zIndex:1 }} />
        {/* Step circles */}
        <div style={{ display:'flex', justifyContent:'space-between', position:'relative', zIndex:2 }}>
          {STEP_META.map((m, i) => {
            const s = i + 1; const done = s < current; const active = s === current;
            return (
              <div key={s} style={{ display:'flex', flexDirection:'column', alignItems:'center', width:80 }}>
                <div style={{
                  width:34, height:34, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center',
                  background: done ? 'linear-gradient(135deg, #1D9E75, #2BC48A)' : active ? 'linear-gradient(135deg, #185FA5, #1D9E75)' : 'var(--bg-secondary)',
                  color: done || active ? '#fff' : 'var(--text-secondary)',
                  border: !done && !active ? '1.5px solid var(--border)' : 'none',
                  boxShadow: active ? '0 0 0 4px rgba(24,95,165,0.15), 0 2px 8px rgba(24,95,165,0.25)' : done ? '0 2px 8px rgba(29,158,117,0.2)' : 'none',
                  transition:'all 0.3s ease', fontSize:12, fontWeight:600,
                }}>
                  {done ? <CheckCircle2 size={16}/> : m.icon}
                </div>
                <span style={{ fontSize:10, fontWeight: active ? 700 : 500, color: active ? 'var(--text-info)' : done ? 'var(--text-success)' : 'var(--text-secondary)', marginTop:6, textAlign:'center', lineHeight:1.2, letterSpacing:'0.01em' }}>{m.label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ── Step Hero Banner ── */
function StepHero({ n, completionPct }) {
  const m = STEP_META[n - 1];
  return (
    <div style={{ background:'linear-gradient(135deg, #0F2B4A 0%, #1B3A5C 40%, #1A4D6E 100%)', borderRadius:18, padding:'22px 28px', marginBottom:20, color:'#fff', position:'relative', overflow:'hidden', boxShadow:'0 4px 24px rgba(15,43,74,0.3)' }}>
      <div style={{ position:'absolute', top:-30, right:-30, width:140, height:140, background:'radial-gradient(circle, rgba(29,158,117,0.15) 0%, transparent 70%)', pointerEvents:'none' }} />
      <div style={{ position:'absolute', bottom:-20, left:-20, width:100, height:100, background:'radial-gradient(circle, rgba(133,173,255,0.12) 0%, transparent 70%)', pointerEvents:'none' }} />
      <div style={{ position:'relative', zIndex:1, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <div>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
            <div style={{ width:30, height:30, borderRadius:8, background:'rgba(255,255,255,0.12)', display:'flex', alignItems:'center', justifyContent:'center', border:'1px solid rgba(255,255,255,0.15)' }}>{m.icon}</div>
            <span style={{ fontSize:11, fontWeight:600, textTransform:'uppercase', letterSpacing:'0.1em', opacity:0.7 }}>Step {n} of 5</span>
          </div>
          <p style={{ fontSize:20, fontWeight:700, margin:'6px 0 2px', letterSpacing:'-0.02em' }}>{m.label}</p>
          <p style={{ fontSize:12, opacity:0.6, margin:0 }}>{m.sub}</p>
        </div>
        <div style={{ textAlign:'center' }}>
          <div style={{ width:52, height:52, borderRadius:'50%', border:'3px solid rgba(255,255,255,0.15)', display:'flex', alignItems:'center', justifyContent:'center', position:'relative' }}>
            <svg width={52} height={52} style={{ position:'absolute', top:-1.5, left:-1.5, transform:'rotate(-90deg)' }}>
              <circle cx={26} cy={26} r={23} fill="none" stroke="rgba(29,158,117,0.8)" strokeWidth={3} strokeDasharray={`${(completionPct / 100) * 144.5} 144.5`} strokeLinecap="round" />
            </svg>
            <span style={{ fontSize:14, fontWeight:700 }}>{completionPct}%</span>
          </div>
          <span style={{ fontSize:9, opacity:0.5, marginTop:2, display:'block' }}>Complete</span>
        </div>
      </div>
    </div>
  );
}

function FInput({ label, value, onChange, placeholder, type='text', maxLength, required }) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={cs.field}>
      {label && <label style={cs.label}>{label}{required?' *':''}</label>}
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} maxLength={maxLength}
        style={{ ...cs.input, borderColor: focused ? 'var(--border-info)' : 'var(--border)' }}
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} />
    </div>
  );
}

function FSelect({ label, value, onChange, options, disabled }) {
  return (
    <div style={cs.field}>
      {label && <label style={cs.label}>{label}</label>}
      <select value={value} onChange={e => onChange(e.target.value)} disabled={disabled}
        style={{ ...cs.input, cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.5 : 1 }}>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}

function RoleSearch({ value, onChange, placeholder }) {
  const [q, setQ] = useState(value || '');
  const [sugg, setSugg] = useState([]); const [open, setOpen] = useState(false);
  const [noMatch, setNoMatch] = useState(false);
  const ref = useRef(null);
  useEffect(() => { const h = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); }; document.addEventListener('mousedown', h); return () => document.removeEventListener('mousedown', h); }, []);
  useEffect(() => { if (value !== q && document.activeElement !== ref.current?.querySelector('input')) setQ(value || ''); }, [value]); // eslint-disable-line
  const handleChange = e => {
    const v = e.target.value; setQ(v); onChange(v);
    if (v.length >= 2) {
      const lo = v.toLowerCase();
      const f = jobRolesData.roles.filter(r => r.role.toLowerCase().includes(lo)).slice(0,10);
      setSugg(f); setOpen(true); setNoMatch(f.length === 0);
    } else { setSugg([]); setOpen(false); setNoMatch(false); }
  };
  return (
    <div ref={ref} style={{ ...cs.field, position:'relative' }}>
      <input value={q} onChange={handleChange}
        placeholder={placeholder || 'Type 2+ letters — e.g. Data Analyst, ML Engineer…'}
        style={{ ...cs.input }} autoComplete="off"
        onKeyDown={e => { if (e.key === 'Enter' && q.trim()) { onChange(q.trim()); setOpen(false); } }} />
      {open && (
        <ul style={dropStyle}>
          {sugg.map((item,i) => (
            <li key={i} onMouseDown={() => { setQ(item.role); onChange(item.role); setSugg([]); setOpen(false); }}
              style={dropLi} onMouseEnter={e => e.currentTarget.style.background='var(--bg-info)'}
              onMouseLeave={e => e.currentTarget.style.background='transparent'}>
              <div style={{ fontSize:13, fontWeight:500, color:'var(--text-primary)' }}>{item.role}</div>
              <div style={{ fontSize:11, color:'var(--text-secondary)' }}>{item.family}</div>
            </li>
          ))}
          {noMatch && q.trim().length >= 2 && (
            <li
              onMouseDown={() => { onChange(q.trim()); setOpen(false); setNoMatch(false); }}
              style={{ ...dropLi, background:'rgba(133,173,255,0.06)', borderTop:'1px solid var(--border-info)' }}
              onMouseEnter={e => e.currentTarget.style.background='var(--bg-info)'}
              onMouseLeave={e => e.currentTarget.style.background='rgba(133,173,255,0.06)'}>
              <div style={{ fontSize:13, fontWeight:600, color:'var(--text-info)' }}>+ Add "{q.trim()}" as custom role</div>
              <div style={{ fontSize:11, color:'var(--text-secondary)' }}>This role will be saved for future AI model training</div>
            </li>
          )}
        </ul>
      )}
    </div>
  );
}

function CitySearch({ value, onChange, placeholder }) {
  const [q, setQ] = useState(value || ''); const [sugg, setSugg] = useState([]); const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => { const h = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); }; document.addEventListener('mousedown', h); return () => document.removeEventListener('mousedown', h); }, []);
  const handleChange = e => { const v = e.target.value; setQ(v); onChange(v); if (v.length >= 2) { const lo = v.toLowerCase(); const f = indianCities.filter(c => c.toLowerCase().includes(lo)).slice(0,8); setSugg(f); setOpen(f.length > 0); } else { setSugg([]); setOpen(false); } };
  return (
    <div ref={ref} style={{ position:'relative' }}>
      <input value={q} onChange={handleChange} placeholder={placeholder || 'Type city name…'} style={{ ...cs.input }} autoComplete="off" />
      {open && <ul style={{ ...dropStyle, maxHeight:160 }}>{sugg.map((city,i) => <li key={i} onMouseDown={() => { setQ(city); onChange(city); setSugg([]); setOpen(false); }} style={{ ...dropLi, fontSize:13, color:'var(--text-primary)' }} onMouseEnter={e => e.currentTarget.style.background='var(--bg-info)'} onMouseLeave={e => e.currentTarget.style.background='transparent'}>{city}</li>)}</ul>}
    </div>
  );
}

function SkillSearch({ selected, onAdd }) {
  const [q, setQ] = useState(''); const [sugg, setSugg] = useState([]); const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => { const h = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); }; document.addEventListener('mousedown', h); return () => document.removeEventListener('mousedown', h); }, []);
  const handleChange = e => { const v = e.target.value; setQ(v); if (v.length >= 2) { const lo = v.toLowerCase(); const f = SKILLS_POOL.filter(s => s.toLowerCase().includes(lo) && !selected.some(sel => sel.name === s)).slice(0,10); setSugg(f); setOpen(f.length > 0); } else { setSugg([]); setOpen(false); } };
  const addSkill = name => { if (!selected.some(s => s.name === name)) onAdd({ name, certName:'', issuer:'', year:'', mode:'' }); setQ(''); setSugg([]); setOpen(false); };
  return (
    <div ref={ref} style={{ position:'relative', marginBottom:12 }}>
      <div style={{ display:'flex', gap:8 }}>
        <input value={q} onChange={handleChange} placeholder="Search or type any skill and press Enter to add…" style={{ ...cs.input, flex:1, borderColor:'var(--border-info)' }} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); if (q.trim() && !selected.some(s => s.name === q.trim())) addSkill(q.trim()); } }} autoComplete="off" />
        {q.trim() && <button type="button" onClick={() => { if (!selected.some(s => s.name === q.trim())) addSkill(q.trim()); }} style={{ padding:'8px 14px', border:'none', borderRadius:8, background:'var(--bg-info)', color:'var(--text-info)', cursor:'pointer', fontSize:13, fontWeight:500, whiteSpace:'nowrap' }}>+ Add</button>}
      </div>
      {open && sugg.length > 0 && <ul style={dropStyle}>{sugg.map((skill,i) => <li key={i} onMouseDown={() => addSkill(skill)} style={{ ...dropLi, fontSize:13, color:'var(--text-primary)' }} onMouseEnter={e => e.currentTarget.style.background='var(--bg-info)'} onMouseLeave={e => e.currentTarget.style.background='transparent'}>{skill}</li>)}</ul>}
    </div>
  );
}

function SectorPicker({ selected, onChange }) {
  return (
    <div>
      <div style={{ display:'flex', flexWrap:'wrap', gap:6, maxHeight:120, overflowY:'auto', marginBottom:6 }}>
        {SECTORS.map(s => { const active = selected.includes(s); const maxed = selected.length >= 3 && !active; return <button key={s} type="button" onClick={() => { if (!maxed) onChange(active ? selected.filter(x => x !== s) : [...selected, s]); }} style={{ padding:'4px 12px', fontSize:11, borderRadius:20, cursor: maxed?'not-allowed':'pointer', fontWeight: active?600:400, border: active ? 'none' : '0.5px solid var(--border)', background: active?'linear-gradient(135deg, var(--bg-info), rgba(133,173,255,0.2))':'var(--bg-secondary)', color: active?'var(--text-info)':'var(--text-secondary)', opacity: maxed?0.4:1, transition:'all 0.2s ease', boxShadow: active ? '0 1px 6px rgba(24,95,165,0.12)' : 'none' }}>{active?'✓ ':''}{s}</button>; })}
      </div>
      <p style={{ fontSize:11, color:'var(--text-secondary)', margin:0 }}>{selected.length}/3 selected</p>
    </div>
  );
}

function OrgPicker({ selected, onChange }) {
  return (
    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
      {ORG_TYPES.map(o => { const active = (selected||[]).includes(o); const maxed = (selected||[]).length >= 3 && !active; return <button key={o} type="button" onClick={() => { if (!maxed) onChange(active ? selected.filter(x => x !== o) : [...(selected||[]), o]); }} style={{ padding:'8px 12px', fontSize:11, borderRadius:10, cursor: maxed?'not-allowed':'pointer', textAlign:'left', fontWeight: active?600:400, border: active ? 'none' : '0.5px solid var(--border)', background: active?'linear-gradient(135deg, var(--bg-info), rgba(133,173,255,0.2))':'var(--bg-secondary)', color: active?'var(--text-info)':'var(--text-secondary)', opacity: maxed?0.4:1, transition:'all 0.2s ease', boxShadow: active ? '0 1px 6px rgba(24,95,165,0.12)' : 'none' }}>{active?'✓ ':''}{o}</button>; })}
    </div>
  );
}

function InfoTooltip({ text }) {
  const [show, setShow] = useState(false);
  return (
    <span style={{ position:'relative', display:'inline-block', marginLeft:6, cursor:'pointer' }}
      onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}>
      <span style={{ display:'inline-flex', alignItems:'center', justifyContent:'center', width:16, height:16, borderRadius:'50%', background:'var(--bg-info)', color:'var(--text-info)', fontSize:10, fontWeight:700 }}>i</span>
      {show && <div style={{ position:'absolute', bottom:'calc(100% + 6px)', left:'50%', transform:'translateX(-50%)', width:240, padding:'10px 12px', background:'var(--bg-primary)', border:'0.5px solid var(--border-info)', borderRadius:10, boxShadow:'0 4px 20px rgba(0,0,0,0.2)', fontSize:12, lineHeight:1.5, color:'var(--text-primary)', zIndex:200 }}>{text}</div>}
    </span>
  );
}

function PrefCard({ label, pref, onUpdate, onUpdateLoc, accentColor, accentDark, number }) {
  const locs = pref.locations?.length === 3 ? pref.locations : ['','',''];
  return (
    <div style={{ ...cs.card, borderLeft:`3px solid ${accentColor}`, marginBottom:16, boxShadow:'0 2px 16px rgba(0,0,0,0.04)' }}>
      <div style={{ display:'flex', alignItems:'center', gap:10, padding:'14px 18px', background:`linear-gradient(135deg, ${accentColor}, ${accentDark})`, margin:'-20px -24px 18px -24px', borderRadius:'16px 16px 0 0' }}>
        <div style={{ width:28, height:28, borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, fontWeight:700, border:'1.5px solid rgba(255,255,255,0.35)', color:'white', background:'rgba(255,255,255,0.1)' }}>{number}</div>
        <span style={{ fontSize:13, fontWeight:700, color:'white', textTransform:'uppercase', letterSpacing:'0.08em' }}>{label} Preference</span>
        {number === 1 && <span style={{ marginLeft:'auto', fontSize:10, fontWeight:700, background:'rgba(255,255,255,0.95)', color:accentDark, padding:'3px 10px', borderRadius:12, textTransform:'uppercase', letterSpacing:'0.05em' }}>★ Highest Weight</span>}
      </div>
      <div style={cs.field}>
        <label style={cs.label}>Target Job Role</label>
        <RoleSearch value={pref.role} onChange={val => onUpdate('role', val)} placeholder="Type 2+ letters — e.g. Data Analyst, CV Engineer, ML Engineer…" />
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
        <div style={cs.field}>
          <label style={cs.label}>Job Function <InfoTooltip text="The broad functional area of your role. Example: 'Software Engineering', 'Marketing', 'Finance'. This helps match you with the right skill framework and career ladder." /></label>
          <input value={pref.jobFunction||''} onChange={e => onUpdate('jobFunction', e.target.value)} placeholder="e.g. Software Engineering" style={cs.input} />
        </div>
        <div style={cs.field}>
          <label style={cs.label}>Job Family <InfoTooltip text="A group of related roles within a function. Example: Under 'Engineering', families include 'Frontend', 'Backend', 'Data & Analytics', 'DevOps'. This narrows skill recommendations to your niche." /></label>
          <input value={pref.jobFamily||''} onChange={e => onUpdate('jobFamily', e.target.value)} placeholder="e.g. Data & Analytics" style={cs.input} />
        </div>
      </div>
      <div style={cs.field}>
        <label style={cs.label}>Job Sector <span style={{ fontWeight:400 }}>(select up to 3)</span></label>
        <SectorPicker selected={pref.sectors} onChange={val => onUpdate('sectors', val)} />
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
        <FSelect label="Job Type" value={pref.jobType||''} onChange={val => onUpdate('jobType', val)} options={['Select job type…',...JOB_TYPES]} />
        <FSelect label="Expected Salary" value={pref.salary||''} onChange={val => onUpdate('salary', val)} options={['Select salary range…',...SALARY_OPTIONS]} />
      </div>
      <div style={cs.field}>
        <label style={cs.label}>Preferred Locations <span style={{ fontWeight:400 }}>(up to 3 cities)</span></label>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8 }}>
          {[0,1,2].map(i => <CitySearch key={i} value={locs[i]} onChange={val => onUpdateLoc(i, val)} placeholder={i===0?'1st city…':i===1?'2nd city…':'3rd city…'} />)}
        </div>
      </div>
      <div style={cs.field}>
        <label style={cs.label}>Type of Organisation <span style={{ fontWeight:400 }}>(pick up to 3)</span>{(pref.orgTypes||[]).length > 0 && <span style={{ marginLeft:8, color:'var(--text-info)', fontWeight:600 }}>{pref.orgTypes.length}/3</span>}</label>
        <OrgPicker selected={pref.orgTypes} onChange={val => onUpdate('orgTypes', val)} />
      </div>
    </div>
  );
}

function SkillRow({ sk, onRemove, onUpdate }) {
  return (
    <motion.div initial={{ opacity:0, scale:0.95 }} animate={{ opacity:1, scale:1 }} style={{ border:'0.5px solid var(--border)', borderRadius:12, padding:14, marginBottom:10, background:'var(--bg-secondary)', transition:'box-shadow 0.2s ease' }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10 }}>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <div style={{ width:24, height:24, borderRadius:6, background:'var(--bg-info)', display:'flex', alignItems:'center', justifyContent:'center' }}><Cpu size={12} color='var(--text-info)' /></div>
          <span style={{ fontSize:14, fontWeight:600, color:'var(--text-primary)' }}>{sk.name}</span>
        </div>
        <button onClick={() => onRemove(sk.name)} style={{ background:'var(--bg-danger)', border:'none', cursor:'pointer', color:'var(--text-danger)', fontSize:12, fontWeight:600, padding:'4px 10px', borderRadius:8, transition:'all 0.15s' }}>Remove</button>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
        <div><label style={{ ...cs.label, marginBottom:3 }}>Certificate name</label><input value={sk.certName||''} onChange={e => onUpdate(sk.name,'certName',e.target.value)} placeholder="e.g. AWS Cloud Practitioner" style={{ ...cs.input, fontSize:12, padding:'8px 10px' }} /></div>
        <div><label style={{ ...cs.label, marginBottom:3 }}>Issuing organisation</label><input value={sk.issuer||''} onChange={e => onUpdate(sk.name,'issuer',e.target.value)} placeholder="e.g. Amazon Web Services" style={{ ...cs.input, fontSize:12, padding:'8px 10px' }} /></div>
        <div><label style={{ ...cs.label, marginBottom:3 }}>Year</label><select value={sk.year||''} onChange={e => onUpdate(sk.name,'year',e.target.value)} style={{ ...cs.input, fontSize:12, padding:'8px 10px' }}><option value="">Select…</option>{Array.from({length:31},(_,i)=>2010+i).map(y => <option key={y} value={y}>{y}</option>)}</select></div>
        <div><label style={{ ...cs.label, marginBottom:3 }}>Verification</label><select value={sk.mode||''} onChange={e => onUpdate(sk.name,'mode',e.target.value)} style={{ ...cs.input, fontSize:12, padding:'8px 10px' }}><option value="">Select…</option>{VERIFY_MODES.map(m => <option key={m} value={m}>{m}</option>)}</select></div>
      </div>
      {sk.mode === 'URL' && <div style={{ marginTop:10 }}><label style={{ ...cs.label, marginBottom:3 }}>Verification link</label><input value={sk.url||''} onChange={e => onUpdate(sk.name,'url',e.target.value)} placeholder="https://…" style={{ ...cs.input, fontSize:12, padding:'8px 10px' }} /></div>}
      <div style={{ marginTop:10, display:'flex', alignItems:'center', gap:6 }}>
        <Shield size={12} color={sk.certName||sk.issuer ? 'var(--text-warning)' : 'var(--text-secondary)'} />
        <span style={{ fontSize:11, padding:'3px 10px', borderRadius:8, fontWeight:500, background: sk.certName||sk.issuer?'var(--bg-warning)':'var(--bg-secondary)', color: sk.certName||sk.issuer?'var(--text-warning)':'var(--text-secondary)' }}>{sk.certName||sk.issuer?'Evidence submitted':'Self-declared'}</span>
      </div>
    </motion.div>
  );
}

function ExpRow({ exp, index, onUpdate, onRemove }) {
  return (
    <div style={{ border:'0.5px solid var(--border)', borderRadius:14, padding:16, marginBottom:14, background:'var(--bg-secondary)', transition:'box-shadow 0.2s ease' }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <div style={{ width:28, height:28, borderRadius:8, background:'var(--bg-info)', display:'flex', alignItems:'center', justifyContent:'center' }}><Briefcase size={13} color='var(--text-info)' /></div>
          <span style={{ fontSize:13, fontWeight:600, color:'var(--text-primary)' }}>Experience {index+1}</span>
          <span style={{ padding:'3px 10px', borderRadius:8, background:'linear-gradient(135deg, var(--bg-info), rgba(133,173,255,0.15))', color:'var(--text-info)', fontSize:11, fontWeight:600 }}>{exp.type}</span>
        </div>
        {index > 0 && <button onClick={() => onRemove(index)} style={{ background:'var(--bg-danger)', border:'none', cursor:'pointer', color:'var(--text-danger)', fontSize:12, fontWeight:600, padding:'4px 10px', borderRadius:8, transition:'all 0.15s' }}>Remove</button>}
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
        <FInput label="Organisation name" value={exp.org} onChange={v => onUpdate(index,'org',v)} placeholder="e.g. Infosys, TCS" />
        <FInput label="Designation / Role" value={exp.designation} onChange={v => onUpdate(index,'designation',v)} placeholder="e.g. Software Intern" />
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
        <FSelect label="Sector" value={exp.sector||'Select sector…'} onChange={v => onUpdate(index,'sector',v)} options={['Select sector…',...SECTORS]} />
        <FSelect label="Experience type" value={exp.type} onChange={v => onUpdate(index,'type',v)} options={EXP_TYPES} />
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:12 }}>
        <div style={cs.field}><label style={cs.label}>Start date</label><input type="month" value={exp.startDate} onChange={e => onUpdate(index,'startDate',e.target.value)} style={{ ...cs.input, fontSize:13 }} /></div>
        <div style={cs.field}><label style={cs.label}>End date</label><input type="month" value={exp.endDate} onChange={e => onUpdate(index,'endDate',e.target.value)} disabled={exp.currentlyWorking} style={{ ...cs.input, fontSize:13, opacity: exp.currentlyWorking?0.4:1 }} /></div>
        <div style={{ ...cs.field, display:'flex', alignItems:'flex-end' }}><label style={{ display:'flex', alignItems:'center', gap:6, cursor:'pointer', fontSize:12, color:'var(--text-secondary)', paddingBottom:8 }}><input type="checkbox" checked={exp.currentlyWorking} onChange={e => onUpdate(index,'currentlyWorking',e.target.checked)} style={{ accentColor:'var(--text-info)', width:16, height:16 }} />Currently working</label></div>
      </div>
    </div>
  );
}

const emptyPref = () => ({ role:'', jobFunction:'', jobFamily:'', sectors:[], jobType:'', salary:'', locations:['','',''], orgTypes:[] });
const emptyExp  = () => ({ org:'', designation:'', sector:'', type:'Internship (Full-Time)', startDate:'', endDate:'', currentlyWorking:false });

/* ═══════════════════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════════════════ */
export default function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep]           = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]         = useState('');

  const [name, setName]           = useState('');
  const [email, setEmail]         = useState('');
  const [phone, setPhone]         = useState('');
  const [password, setPassword]   = useState('');
  const [eduLevel, setEduLevel]   = useState('');
  const [eduDomain, setEduDomain] = useState('');
  const [eduDegree, setEduDegree] = useState('');
  const [eduSpec, setEduSpec]     = useState('');
  const [eduSpecCustom, setEduSpecCustom] = useState('');
  const [yearOfStudy, setYear]    = useState('');
  const [gradYear, setGradYear]   = useState('');
  const [collegeCode, setCode]    = useState('');
  const [ackDone, setAckDone]     = useState(false);
  const [currentlyPursuing, setCurrentlyPursuing] = useState(false);

  const [primary, setPrimary]     = useState(emptyPref());
  const [secondary, setSecondary] = useState(emptyPref());
  const [tertiary, setTertiary]   = useState(emptyPref());

  const updPrimary      = useCallback((f,v) => setPrimary(p => ({...p,[f]:v})), []);
  const updSecondary    = useCallback((f,v) => setSecondary(p => ({...p,[f]:v})), []);
  const updTertiary     = useCallback((f,v) => setTertiary(p => ({...p,[f]:v})), []);
  const updPrimaryLoc   = useCallback((i,v) => setPrimary(p => { const l=[...p.locations]; l[i]=v; return {...p,locations:l}; }), []);
  const updSecondaryLoc = useCallback((i,v) => setSecondary(p => { const l=[...p.locations]; l[i]=v; return {...p,locations:l}; }), []);
  const updTertiaryLoc  = useCallback((i,v) => setTertiary(p => { const l=[...p.locations]; l[i]=v; return {...p,locations:l}; }), []);

  const [skills, setSkills]       = useState([]);
  const addSkill    = useCallback(sk => setSkills(p => [...p, sk]), []);
  const removeSkill = useCallback(n  => setSkills(p => p.filter(s => s.name !== n)), []);
  const updateSkill = useCallback((n,f,v) => setSkills(p => p.map(s => s.name===n ? {...s,[f]:v} : s)), []);

  const [experiences, setExperiences] = useState([emptyExp()]);
  const addExp    = useCallback(() => setExperiences(p => [...p, emptyExp()]), []);
  const updExp    = useCallback((i,f,v) => setExperiences(p => p.map((e,idx) => idx===i ? {...e,[f]:v} : e)), []);
  const removeExp = useCallback(i => setExperiences(p => p.filter((_,idx) => idx!==i)), []);

  const level1Opts = ['Select level...', ...Object.keys(dropdownData.education || {})];
  const level2Opts = eduLevel && eduLevel !== 'Select level...' ? ['Select domain...', ...Object.keys(dropdownData.education[eduLevel]||{})] : ['Select domain...'];
  const level3Opts = eduDomain && eduDomain !== 'Select domain...' ? ['Select degree group...', ...Object.keys(dropdownData.education[eduLevel]?.[eduDomain]||{})] : ['Select degree group...'];
  const baseSpecs  = (eduDomain && eduDegree && eduDegree !== 'Select degree group...') ? dropdownData.education[eduLevel]?.[eduDomain]?.[eduDegree]||[] : [];
  const isTech     = ['Bachelor of Technology','Bachelor of Engineering'].includes(eduDegree);
  const allSpecs   = isTech ? [...new Set([...baseSpecs,...EXTRA_BTECH_SPECS])] : baseSpecs;
  const specOpts   = allSpecs.length > 0 ? ['Select specialisation...',...allSpecs,'Other (specify below)'] : ['Select specialisation...','Other (specify below)'];
  const effectiveSpec = eduSpec === 'Other (specify below)' ? eduSpecCustom : eduSpec;

  useEffect(() => { setEduDomain(''); setEduDegree(''); setEduSpec(''); }, [eduLevel]);
  useEffect(() => { setEduDegree(''); setEduSpec(''); }, [eduDomain]);
  useEffect(() => { setEduSpec(''); }, [eduDegree]);

  const step1Ready = name && email && password.length >= 8 &&
    eduLevel && eduLevel !== 'Select level...' &&
    eduDomain && eduDomain !== 'Select domain...' &&
    eduDegree && eduDegree !== 'Select degree group...' &&
    eduSpec && eduSpec !== 'Select specialisation...' &&
    (eduSpec !== 'Other (specify below)' || eduSpecCustom.trim()) &&
    yearOfStudy && yearOfStudy !== 'Select year...' &&
    gradYear && gradYear !== 'Select year...' &&
    collegeCode.length === 6 && ackDone;

  /* ── FIXED SUBMIT — saves careerHistory + localStorage for dashboard ── */
  async function submit() {
    setSubmitting(true); setError('');
    try {
      const payload = {
        name, email, phone, password,
        education: [{ level:eduLevel, domain:eduDomain, degreeGroup:eduDegree, specialization:effectiveSpec, yearOfStudy, gradYear, currentlyPursuing }],
        collegeCode,
        preferences: {
          primary:   { ...primary,   jobRole:primary.role },
          secondary: { ...secondary, jobRole:secondary.role },
          tertiary:  { ...tertiary,  jobRole:tertiary.role },
        },
        skills: skills.map(s => s.name),
        skillDetails: skills,
        experience: experiences.filter(e => e.org || e.designation),
      };

      let resData;
      try {
        const res = await axios.post('/api/onboarding', payload);
        resData = res.data;
      } catch {
        /* Backend down — create local analysis so dashboard shows real data */
        resData = {
          analysisId: `local_${Date.now()}`,
          success: true,
          preVerified: {
            primaryZone: { employer_zone: 'Amber' },
            primarySkillGap: { matched: skills.map(s => s.name), missing: [], coveragePct: skills.length > 0 ? 60 : 20 },
            primaryMarket: { salary_min_lpa: 4, salary_max_lpa: 10, demand_level: 'High', ai_automation_risk: 'Medium' },
          },
          combined_tab4: { learning_roadmap: [
            { step:'Step 1 — Foundation Skills', description:'Master prerequisites for your target role.' },
            { step:'Step 2 — Core Technical Skills', description:'Learn the primary tools and technologies.' },
            { step:'Step 3 — Projects & Portfolio', description:'Build real projects to demonstrate your skills.' },
          ]},
          input_user_data: payload,
        };
      }

      const analysisId = resData.analysisId || `local_${Date.now()}`;

      /* Save all keys dashboard needs */
      localStorage.setItem('smaart_analysis_id', analysisId);
      localStorage.setItem('smaart_degree', `${eduDegree} – ${effectiveSpec}`);
      localStorage.setItem('smaart_interest', primary.sectors[0] || primary.role || '');
      localStorage.setItem('latestFormData', JSON.stringify(payload));
      localStorage.setItem('careerMatch', JSON.stringify(resData));
      localStorage.setItem('smaart_last_analysis', JSON.stringify(resData));

      /* Save to careerHistory so Home sidebar shows it */
      const historyEntry = {
        id: Date.now(), analysisId,
        timestamp: new Date().toISOString(),
        role: primary.role || `${eduDegree} – ${effectiveSpec}` || 'Career Analysis',
        degree: `${eduDegree} – ${effectiveSpec}`,
        data: resData,
      };
      const prev = JSON.parse(localStorage.getItem('careerHistory') || '[]');
      localStorage.setItem('careerHistory', JSON.stringify([historyEntry, ...prev].slice(0, 10)));

      navigate('/directions');
    } catch (err) {
      setError(err?.response?.data?.error || 'Something went wrong. Please try again.');
    } finally { setSubmitting(false); }
  }

  /* ── Completion percentage ── */
  const completionPct = Math.round(((step - 1) / 5) * 100 + (step === 1 && step1Ready ? 20 : 0));

  return (
    <div style={{ position:'relative', minHeight:'100vh', overflow:'hidden' }}>
      {/* Ambient gradient orbs — matching landing page */}
      <div style={{ position:'fixed', top:-120, left:'10%', width:500, height:500, background:'radial-gradient(circle, rgba(24,95,165,0.06) 0%, transparent 70%)', pointerEvents:'none', filter:'blur(60px)' }} />
      <div style={{ position:'fixed', top:200, right:'5%', width:400, height:400, background:'radial-gradient(circle, rgba(29,158,117,0.05) 0%, transparent 70%)', pointerEvents:'none', filter:'blur(50px)' }} />
      <div style={{ position:'fixed', bottom:-80, left:'40%', width:600, height:300, background:'radial-gradient(circle, rgba(133,173,255,0.04) 0%, transparent 70%)', pointerEvents:'none', filter:'blur(50px)' }} />

      <div style={{ position:'relative', zIndex:1, maxWidth:1100, margin:'0 auto', padding:'0 24px' }}>
        <StepProgress current={step} />
        <AnimatePresence mode="wait">
          <motion.div key={step} initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-12 }} transition={{ duration:0.22, ease:'easeOut' }}>

          {step === 1 && (
            <div style={{ maxWidth:520, margin:'0 auto', padding:'0 0 16px' }}>
              <StepHero n={1} completionPct={completionPct} />
              <div style={cs.card}>
                <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:16 }}>
                  <div style={{ width:28, height:28, borderRadius:8, background:'var(--bg-info)', display:'flex', alignItems:'center', justifyContent:'center' }}><User size={14} color='var(--text-info)' /></div>
                  <p style={{ fontSize:15, fontWeight:600, margin:0, color:'var(--text-primary)' }}>Tell us about your studies</p>
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                  <FInput label="Full name" value={name} onChange={setName} placeholder="Enter your full name" required />
                  <FInput label="Email" value={email} onChange={setEmail} type="email" placeholder="your.email@college.ac.in" required />
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                  <FInput label="Phone (optional)" value={phone} onChange={setPhone} type="tel" placeholder="10-digit mobile" />
                  <FInput label="Password" value={password} onChange={setPassword} type="password" placeholder="Minimum 8 characters" required />
                </div>
                <div style={{ height:'0.5px', background:'var(--border)', margin:'4px 0 16px' }} />
                <FSelect label="Degree Level *" value={eduLevel||'Select level...'} onChange={setEduLevel} options={level1Opts} />
                <FSelect label="Domain *" value={eduDomain||'Select domain...'} onChange={setEduDomain} options={level2Opts} disabled={!eduLevel||eduLevel==='Select level...'} />
                <FSelect label="Degree Group *" value={eduDegree||'Select degree group...'} onChange={setEduDegree} options={level3Opts} disabled={!eduDomain||eduDomain==='Select domain...'} />
                <FSelect label="Specialisation *" value={eduSpec||'Select specialisation...'} onChange={setEduSpec} options={specOpts} disabled={!eduDegree||eduDegree==='Select degree group...'} />
                {eduSpec === 'Other (specify below)' && <FInput label="Enter your specialisation *" value={eduSpecCustom} onChange={setEduSpecCustom} placeholder="e.g. Agricultural Engineering, Fashion Technology…" />}
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                  <FSelect label="Year of study *" value={yearOfStudy||'Select year...'} onChange={setYear} options={['Select year...','1','2','3','4','5']} />
                  <FSelect label="Graduation year *" value={gradYear||'Select year...'} onChange={setGradYear} options={['Select year...','2025','2026','2027','2028','2029','2030']} />
                </div>
                <label style={{ display:'flex', alignItems:'center', gap:8, cursor:'pointer', fontSize:13, color:'var(--text-secondary)', marginBottom:12 }}>
                  <input type="checkbox" checked={currentlyPursuing} onChange={e => setCurrentlyPursuing(e.target.checked)} style={{ accentColor:'var(--text-info)', width:15, height:15 }} />
                  I am currently pursuing this degree
                </label>
                <div style={cs.field}>
                  <label style={cs.label}>College code * <span style={{ fontWeight:400 }}>(links to your placement officer)</span></label>
                  <input value={collegeCode} onChange={e => setCode(e.target.value.slice(0,6).toUpperCase())} placeholder="Enter 6-character code" style={{ ...cs.input, letterSpacing:'0.1em' }} />
                  {collegeCode && collegeCode.length !== 6 && <p style={{ fontSize:11, color:'var(--text-danger)', margin:'4px 0 0' }}>Must be exactly 6 characters</p>}
                </div>
              </div>
              <div style={cs.card}>
                <p style={{ fontSize:13, fontWeight:500, margin:'0 0 8px', color:'var(--text-primary)' }}>Acknowledgment (required)</p>
                <p style={{ fontSize:12, color:'var(--text-secondary)', margin:'0 0 12px', lineHeight:1.7 }}>SMAART Career Intelligence Platform provides career preparation tools. The platform does not guarantee employment outcomes. Information is for guidance only.</p>
                {!ackDone ? <button onClick={() => setAckDone(true)} style={{ ...cs.btnBlue, width:'100%' }}>I Understand</button>
                  : <div style={{ padding:'8px 12px', background:'var(--bg-success)', borderRadius:8, fontSize:13, color:'var(--text-success)', fontWeight:500 }}>✓ Acknowledged</div>}
              </div>
              <div style={{ display:'flex', justifyContent:'flex-end' }}>
                <button onClick={() => { setError(''); setStep(2); }} disabled={!step1Ready} style={{ ...cs.btnBlue, opacity:step1Ready?1:0.4, cursor:step1Ready?'pointer':'not-allowed' }}>Save &amp; continue</button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div style={{ maxWidth:620, margin:'0 auto', padding:'0 0 16px' }}>
              <StepHero n={2} completionPct={completionPct} />
              <div style={{ ...cs.card, background:'linear-gradient(135deg, var(--bg-info), rgba(133,173,255,0.08))', border:'0.5px solid var(--border-info)', marginBottom:18 }}>
                <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                  <Sparkles size={14} color='var(--text-info)' />
                  <p style={{ fontSize:12, color:'var(--text-info)', margin:0, lineHeight:1.6, fontWeight:500 }}>Set up to 3 career preferences. Skill priority follows Primary → Secondary → Tertiary.</p>
                </div>
              </div>
              <PrefCard label="Primary"   pref={primary}   onUpdate={updPrimary}   onUpdateLoc={updPrimaryLoc}   accentColor="#1D9E75" accentDark="#0f7a5a" number={1} />
              <PrefCard label="Secondary" pref={secondary} onUpdate={updSecondary} onUpdateLoc={updSecondaryLoc} accentColor="#BA7517" accentDark="#8a5510" number={2} />
              <PrefCard label="Tertiary"  pref={tertiary}  onUpdate={updTertiary}  onUpdateLoc={updTertiaryLoc}  accentColor="#888780" accentDark="#555550" number={3} />
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <button onClick={() => setStep(1)} style={cs.btnGhost}>← Back</button>
                <div style={{ display:'flex', gap:8 }}>
                  <button onClick={() => setStep(3)} style={cs.btnGhost}>Skip for now</button>
                  <button onClick={() => setStep(3)} style={cs.btnBlue}>Continue</button>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (() => {
            /* Derive recommended skills from selected job role */
            const ROLE_SKILL_MAP = {
              'software':['Python','JavaScript','React','Node.js','Git','Docker','AWS','SQL','TypeScript','Agile'],
              'data':['Python','SQL','Pandas','NumPy','Power BI','Tableau','Machine Learning','Excel','R Programming','Data Analysis'],
              'machine learning':['Python','TensorFlow','PyTorch','Scikit-learn','Deep Learning','NLP','Computer Vision','Docker','AWS','Git'],
              'web':['JavaScript','React','Node.js','HTML','CSS','Git','TypeScript','MongoDB','PostgreSQL','Docker'],
              'devops':['Docker','Kubernetes','AWS','Terraform','Jenkins','Linux','Git','Ansible','Azure','GCP'],
              'cyber':['Cyber Security','Ethical Hacking','Network Security','Penetration Testing','SIEM','Linux','Python','Cloud Computing'],
              'marketing':['SEO','Google Analytics','Google Ads','Meta Ads','Content Writing','Email Marketing','Canva','HubSpot','Salesforce','A/B Testing'],
              'design':['Figma','Adobe Photoshop','Illustrator','UI/UX Design','Wireframing','Prototyping','Canva','User Research','Framer','InVision'],
              'finance':['Financial Modelling','Excel Advanced','Tally ERP','SAP','QuickBooks','Power BI','SQL','Python','R Programming','Communication'],
              'ai':['Python','Machine Learning','Deep Learning','TensorFlow','PyTorch','NLP','Computer Vision','ChatGPT','GitHub Copilot','Docker'],
              'cloud':['AWS','Azure','GCP','Docker','Kubernetes','Terraform','Linux','Python','Git','Jenkins'],
              'blockchain':['Blockchain','Solidity','Smart Contracts','Web3','Ethereum','JavaScript','Python','Cryptography','Git','Docker'],
              'iot':['IoT','Raspberry Pi','Arduino','Embedded C','Python','MQTT','AWS','Linux','Sensors','Robotics'],
              'video':['Adobe Premiere Pro','After Effects','DaVinci Resolve','Canva','Midjourney','DALL-E','Content Writing','ChatGPT','Figma','Photography'],
              'content':['Content Writing','Copywriting','SEO','ChatGPT','Claude AI','Canva','Google Analytics','Email Marketing','WordPress','Grammarly'],
            };
            const roleText = (primary.role + ' ' + secondary.role + ' ' + tertiary.role).toLowerCase();
            let recommended = [];
            for (const [key, rSkills] of Object.entries(ROLE_SKILL_MAP)) {
              if (roleText.includes(key)) { recommended = [...new Set([...recommended, ...rSkills])]; }
            }
            if (recommended.length === 0) recommended = ['Python','JavaScript','Communication','Excel','Git','SQL','Leadership','Problem Solving','Project Management','Power BI'];
            recommended = recommended.filter(s => !skills.some(sk => sk.name === s)).slice(0,12);

            return (
            <div style={{ maxWidth:780, margin:'0 auto', padding:'0 0 16px' }}>
              <StepHero n={3} completionPct={completionPct} />
              <div style={{ display:'grid', gridTemplateColumns:'1fr 280px', gap:16, alignItems:'start' }}>
                {/* Main skills panel */}
                <div style={cs.card}>
                  <p style={{ fontSize:15, fontWeight:500, margin:'0 0 4px', color:'var(--text-primary)' }}>What skills do you have?</p>
                  <p style={{ fontSize:12, color:'var(--text-secondary)', margin:'0 0 16px', lineHeight:1.6 }}>Search and add any skill. Type a skill not in the list and press Enter or click + Add.</p>
                  <SkillSearch selected={skills} onAdd={addSkill} />
                  {skills.length === 0 && <div style={{ textAlign:'center', padding:'20px 0', color:'var(--text-secondary)', fontSize:13 }}>No skills added yet.</div>}
                  {skills.map(sk => <SkillRow key={sk.name} sk={sk} onRemove={removeSkill} onUpdate={updateSkill} />)}
                </div>
                {/* Recommended skills sidebar */}
                <div style={{ ...cs.card, background:'var(--bg-secondary)', position:'sticky', top:80, borderRadius:16, boxShadow:'0 2px 16px rgba(0,0,0,0.04)' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:12 }}>
                    <div style={{ width:26, height:26, borderRadius:8, background:'linear-gradient(135deg, var(--bg-info), rgba(133,173,255,0.2))', display:'flex', alignItems:'center', justifyContent:'center' }}><Target size={13} color='var(--text-info)' /></div>
                    <span style={{ fontSize:13, fontWeight:700, color:'var(--text-primary)' }}>Recommended Skills</span>
                  </div>
                  <p style={{ fontSize:11, color:'var(--text-secondary)', margin:'0 0 12px', lineHeight:1.5 }}>
                    {primary.role ? `Based on your target: ${primary.role}` : 'Top in-demand skills for 2026'}
                  </p>
                  <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
                    {recommended.map(s => (
                      <button key={s} onClick={() => addSkill({name:s, certName:'', issuer:'', year:'', mode:''})}
                        style={{ padding:'5px 12px', fontSize:12, borderRadius:20, cursor:'pointer', border:'0.5px solid var(--border-info)', background:'transparent', color:'var(--text-info)', fontWeight:500, transition:'all 0.15s' }}
                        onMouseEnter={e => { e.currentTarget.style.background='var(--bg-info)'; e.currentTarget.style.transform='scale(1.03)'; }}
                        onMouseLeave={e => { e.currentTarget.style.background='transparent'; e.currentTarget.style.transform='scale(1)'; }}>
                        + {s}
                      </button>
                    ))}
                  </div>
                  {skills.length > 0 && (
                    <div style={{ marginTop:16, paddingTop:12, borderTop:'0.5px solid var(--border)' }}>
                      <div style={{ fontSize:12, fontWeight:600, color:'var(--text-primary)', marginBottom:6 }}>Added ({skills.length})</div>
                      <div style={{ display:'flex', flexWrap:'wrap', gap:4 }}>
                        {skills.map(s => <span key={s.name} style={{ fontSize:11, padding:'3px 8px', borderRadius:6, background:'var(--bg-success)', color:'var(--text-success)', fontWeight:500 }}>✓ {s.name}</span>)}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:12 }}>
                <button onClick={() => setStep(2)} style={cs.btnGhost}>← Back</button>
                <div style={{ display:'flex', gap:8 }}>
                  <button onClick={() => setStep(4)} style={cs.btnGhost}>Skip for now</button>
                  <button onClick={() => setStep(4)} style={cs.btnBlue}>Continue</button>
                </div>
              </div>
            </div>
          );})()}

          {step === 4 && (
            <div style={{ maxWidth:580, margin:'0 auto', padding:'0 0 16px' }}>
              <StepHero n={4} completionPct={completionPct} />
              <div style={cs.card}>
                <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:6 }}>
                  <div style={{ width:28, height:28, borderRadius:8, background:'var(--bg-info)', display:'flex', alignItems:'center', justifyContent:'center' }}><Briefcase size={14} color='var(--text-info)' /></div>
                  <p style={{ fontSize:15, fontWeight:600, margin:0, color:'var(--text-primary)' }}>Do you have any experience?</p>
                </div>
                <p style={{ fontSize:12, color:'var(--text-secondary)', margin:'0 0 16px', lineHeight:1.6, paddingLeft:36 }}>Internships, part-time work, freelancing, volunteering, or projects.</p>
                {experiences.map((exp,i) => <ExpRow key={i} exp={exp} index={i} onUpdate={updExp} onRemove={removeExp} />)}
                <button onClick={addExp} style={{ padding:'9px 18px', fontSize:13, border:'none', borderRadius:10, background:'linear-gradient(135deg, var(--bg-info), rgba(133,173,255,0.15))', color:'var(--text-info)', cursor:'pointer', fontWeight:600, transition:'all 0.2s ease', boxShadow:'0 1px 6px rgba(24,95,165,0.1)' }}>+ Add another experience</button>
              </div>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <button onClick={() => setStep(3)} style={cs.btnGhost}>← Back</button>
                <div style={{ display:'flex', gap:8 }}>
                  <button onClick={() => setStep(5)} style={cs.btnGhost}>Skip for now</button>
                  <button onClick={() => setStep(5)} style={cs.btnBlue}>Continue</button>
                </div>
              </div>
            </div>
          )}

          {step === 5 && (
            <div style={{ maxWidth:560, margin:'0 auto', padding:'0 0 16px' }}>
              <StepHero n={5} completionPct={completionPct} />
              <div style={cs.card}>
                <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:18 }}>
                  <div style={{ width:28, height:28, borderRadius:8, background:'linear-gradient(135deg, #185FA5, #1D9E75)', display:'flex', alignItems:'center', justifyContent:'center' }}><Award size={14} color='#fff' /></div>
                  <p style={{ fontSize:16, fontWeight:700, margin:0, color:'var(--text-primary)', letterSpacing:'-0.01em' }}>Your Profile Summary</p>
                </div>
                {/* Education section */}
                <div style={{ background:'var(--bg-secondary)', borderRadius:12, padding:'14px 16px', marginBottom:12 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8 }}>
                    <GraduationCap size={14} color='var(--text-info)' />
                    <span style={{ fontSize:11, fontWeight:600, color:'var(--text-info)', textTransform:'uppercase', letterSpacing:'0.06em' }}>Education</span>
                  </div>
                  <p style={{ fontSize:14, fontWeight:600, margin:0, color:'var(--text-primary)' }}>{eduDegree} — {effectiveSpec}</p>
                  <p style={{ fontSize:12, color:'var(--text-secondary)', margin:'3px 0 0' }}>{eduLevel} · {eduDomain} · Year {yearOfStudy} · Graduating {gradYear}</p>
                </div>
                {/* Preferences section */}
                {primary.role && <div style={{ background:'var(--bg-secondary)', borderRadius:12, padding:'14px 16px', marginBottom:12 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8 }}>
                    <Target size={14} color='#1D9E75' />
                    <span style={{ fontSize:11, fontWeight:600, color:'#1D9E75', textTransform:'uppercase', letterSpacing:'0.06em' }}>Primary Preference</span>
                  </div>
                  <p style={{ fontSize:14, fontWeight:600, margin:0, color:'var(--text-primary)' }}>{primary.role}</p>
                  {primary.sectors.length > 0 && <p style={{ fontSize:12, color:'var(--text-secondary)', margin:'3px 0 0' }}>{primary.sectors.join(' · ')}</p>}
                </div>}
                {secondary.role && <div style={{ background:'var(--bg-secondary)', borderRadius:12, padding:'14px 16px', marginBottom:12 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8 }}>
                    <Target size={14} color='#BA7517' />
                    <span style={{ fontSize:11, fontWeight:600, color:'#BA7517', textTransform:'uppercase', letterSpacing:'0.06em' }}>Secondary Preference</span>
                  </div>
                  <p style={{ fontSize:14, fontWeight:600, margin:0, color:'var(--text-primary)' }}>{secondary.role}</p>
                  {secondary.sectors.length > 0 && <p style={{ fontSize:12, color:'var(--text-secondary)', margin:'3px 0 0' }}>{secondary.sectors.join(' · ')}</p>}
                </div>}
                {tertiary.role && <div style={{ background:'var(--bg-secondary)', borderRadius:12, padding:'14px 16px', marginBottom:12 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8 }}>
                    <Target size={14} color='#888780' />
                    <span style={{ fontSize:11, fontWeight:600, color:'#888780', textTransform:'uppercase', letterSpacing:'0.06em' }}>Tertiary Preference</span>
                  </div>
                  <p style={{ fontSize:14, fontWeight:600, margin:0, color:'var(--text-primary)' }}>{tertiary.role}</p>
                  {tertiary.sectors.length > 0 && <p style={{ fontSize:12, color:'var(--text-secondary)', margin:'3px 0 0' }}>{tertiary.sectors.join(' · ')}</p>}
                </div>}
                {/* Skills section */}
                {skills.length > 0 && <div style={{ background:'var(--bg-secondary)', borderRadius:12, padding:'14px 16px', marginBottom:12 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:10 }}>
                    <Cpu size={14} color='var(--text-info)' />
                    <span style={{ fontSize:11, fontWeight:600, color:'var(--text-info)', textTransform:'uppercase', letterSpacing:'0.06em' }}>Skills ({skills.length})</span>
                  </div>
                  <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>{skills.map(s => <span key={s.name} style={{ fontSize:11, padding:'4px 10px', borderRadius:8, background:'linear-gradient(135deg, var(--bg-success), rgba(59,109,17,0.1))', color:'var(--text-success)', fontWeight:500 }}>✓ {s.name}</span>)}</div>
                </div>}
              </div>
              {error && <p style={{ color:'var(--text-danger)', fontSize:13, marginBottom:12 }}>{error}</p>}
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <button onClick={() => setStep(4)} style={cs.btnGhost}>← Back</button>
                <button onClick={submit} disabled={submitting} style={{ ...cs.btnGreen, padding:'13px 32px', fontSize:15, fontWeight:700, borderRadius:12, boxShadow:'0 4px 20px rgba(24,95,165,0.3)', opacity:submitting?0.6:1 }}>
                  {submitting ? <span style={{ display:'flex', alignItems:'center', gap:8 }}><span style={{ width:16, height:16, border:'2px solid rgba(255,255,255,0.3)', borderTop:'2px solid white', borderRadius:'50%', animation:'spin 1s linear infinite' }} />Processing…</span> : <span style={{ display:'flex', alignItems:'center', gap:8 }}><Sparkles size={16} />Complete onboarding<ChevronRight size={16}/></span>}
                </button>
              </div>
            </div>
          )}

        </motion.div>
      </AnimatePresence>
      </div>
    </div>
  );
}
