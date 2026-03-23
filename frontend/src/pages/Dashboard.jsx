import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Target, TrendingUp, Cpu, BookOpen, Star,
  CheckCircle2, XCircle, RefreshCw, Sparkles,
  BarChart3, Globe, Layers, Loader2,
  Award, ExternalLink, Clock, Rocket, Code2, Briefcase, GraduationCap, Zap,
} from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/* ── design tokens ──────────────────────────────────────────────────── */
const C = {
  card: { background:'var(--bg-primary)', border:'0.5px solid var(--border)', borderRadius:12, padding:'16px 20px', marginBottom:12 },
  cardInfo: { background:'var(--bg-info)', border:'0.5px solid var(--border-info)', borderRadius:12, padding:'16px 20px', marginBottom:12 },
};

function Badge({ text, bg, fg }) {
  return <span style={{ display:'inline-block', padding:'2px 8px', borderRadius:8, background:bg, color:fg, fontSize:11, fontWeight:500 }}>{text}</span>;
}

function Bar({ pct, color, width }) {
  return (
    <div style={{ height:6, background:'var(--border)', borderRadius:3, width:width||'100%', overflow:'hidden' }}>
      <div style={{ height:'100%', width:`${Math.min(pct,100)}%`, background:color||'#1D9E75', borderRadius:3, transition:'width 0.8s ease' }} />
    </div>
  );
}

function SH({ title, sub, icon }) {
  return (
    <div style={{ margin:'20px 0 12px', display:'flex', alignItems:'center', gap:8 }}>
      {icon && <span style={{ color:'var(--text-info)' }}>{icon}</span>}
      <div>
        <p style={{ fontSize:15, fontWeight:600, margin:0, color:'var(--text-primary)' }}>{title}</p>
        {sub && <p style={{ fontSize:12, color:'var(--text-secondary)', margin:'1px 0 0' }}>{sub}</p>}
      </div>
    </div>
  );
}

/* ── zone helpers ───────────────────────────────────────────────────── */
const ZONE_STYLE = {
  Green: { bg:'var(--bg-success)', fg:'var(--text-success)', dot:'🟢', border:'#1D9E75' },
  Amber: { bg:'var(--bg-warning)', fg:'var(--text-warning)', dot:'🟡', border:'#BA7517' },
  Red:   { bg:'var(--bg-danger)',  fg:'var(--text-danger)',  dot:'🔴', border:'#A32D2D' },
};
const zs = z => ZONE_STYLE[z] || ZONE_STYLE.Amber;

/* ══════════════════════════════════════════════════════════════════════
   MAIN
══════════════════════════════════════════════════════════════════════ */
export default function Dashboard() {
  const navigate = useNavigate();
  const [data, setData]         = useState(null);
  const [loading, setLoading]   = useState(true);
  const [regen, setRegen]       = useState(false);
  const [activeTab, setActiveTab] = useState('Hiring Pattern');
  const [rating, setRating]     = useState(0);
  const [hovered, setHovered]   = useState(0);
  const [rated, setRated]       = useState(false);
  const [redAck, setRedAck]     = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const id = localStorage.getItem('smaart_analysis_id');
        if (id) {
          const res = await fetch(`/api/dashboard/${id}`);
          const j = await res.json();
          if (j.success && j.data) { setData(j.data.output_data || j.data.analysis || j.data); setLoading(false); return; }
        }
        const fb = localStorage.getItem('smaart_last_analysis');
        if (fb) { setData(JSON.parse(fb)); setLoading(false); return; }
        setLoading(false);
      } catch {
        const fb = localStorage.getItem('smaart_last_analysis');
        if (fb) { setData(JSON.parse(fb)); setLoading(false); return; }
        setLoading(false);
      }
    })();
  }, []);

  const regenerate = async () => {
    const raw = localStorage.getItem('latestFormData');
    if (!raw) { navigate('/onboarding'); return; }
    setRegen(true);
    try {
      const res = await axios.post('/api/onboarding', JSON.parse(raw));
      localStorage.setItem('smaart_analysis_id', res.data?.analysisId || 'local');
      window.location.reload();
    } catch { setRegen(false); }
  };

  const submitRating = async stars => {
    setRating(stars); setRated(true);
    try { await axios.post('/api/feedback', { analysisId: localStorage.getItem('smaart_analysis_id')||'unknown', rating: stars }); } catch {}
  };

  /* ── loading ── */
  if (loading) return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', minHeight:'40vh', gap:12, fontFamily:'var(--font-sans)' }}>
      <Loader2 size={24} style={{ color:'var(--text-info)', animation:'spin 1s linear infinite' }} />
      <p style={{ fontSize:13, color:'var(--text-secondary)', margin:0 }}>Loading your career intelligence…</p>
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  if (!data) return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', minHeight:'40vh', gap:8, fontFamily:'var(--font-sans)' }}>
      <p style={{ fontSize:14, color:'var(--text-primary)', margin:0, fontWeight:500 }}>No analysis found.</p>
      <p style={{ fontSize:13, color:'var(--text-secondary)', margin:0 }}>Please complete onboarding first.</p>
      <button onClick={() => navigate('/onboarding')}
        style={{ marginTop:12, padding:'8px 20px', border:'none', borderRadius:8, background:'var(--bg-info)', color:'var(--text-info)', cursor:'pointer', fontWeight:500 }}>
        Start Onboarding
      </button>
    </div>
  );

  /* ── derive data ── */
  const pv = data.preVerified || {};
  const sg = pv.primarySkillGap || {};
  const pm = pv.primaryMarket || null;
  const matched = sg.matched || [];
  const missing = sg.missing || [];
  const coveragePct = sg.coveragePct || 0;
  const total = matched.length + missing.length;

  const direction = data.input_user_data?.interests?.area || localStorage.getItem('smaart_interest') || 'Career Direction';
  const primaryRole   = data.input_user_data?.preferences?.primary?.jobRole   || data.preferences?.primary?.jobRole   || 'Primary Role';
  const secondaryRole = data.input_user_data?.preferences?.secondary?.jobRole || data.preferences?.secondary?.jobRole || '';
  const tertiaryRole  = data.input_user_data?.preferences?.tertiary?.jobRole  || data.preferences?.tertiary?.jobRole  || '';
  const roadmap = data.combined_tab4?.learning_roadmap || [
    { step:'Foundation Skills', description:'Master prerequisites and theoretical fundamentals for this career direction.', icon:'book', status:'completed', duration:'~1 month' },
    { step:'Core Technical Skills', description:'Learn the primary tools, frameworks, and technologies used in this role.', icon:'code', status:'in-progress', duration:'~2 months' },
    { step:'Advanced Applications', description:'Apply your skills in complex, real-world scenarios and case studies.', icon:'rocket', status:'upcoming', duration:'~2 months' },
    { step:'Projects & Portfolio', description:'Build 3 production-ready projects demonstrating mastery for employers.', icon:'briefcase', status:'locked', duration:'~1 month' },
  ];

  // Smart fallback certificates based on role
  const FALLBACK_CERTS = [
    { name:'Google Data Analytics Professional Certificate', issuer:'Google / Coursera', hours:180, difficulty:'Beginner', url:'https://www.coursera.org/professional-certificates/google-data-analytics' },
    { name:'AWS Cloud Practitioner', issuer:'Amazon Web Services', hours:30, difficulty:'Beginner', url:'https://aws.amazon.com/certification/certified-cloud-practitioner/' },
    { name:'Meta Front-End Developer Professional Certificate', issuer:'Meta / Coursera', hours:210, difficulty:'Intermediate', url:'https://www.coursera.org/professional-certificates/meta-front-end-developer' },
  ];
  const certs = data.combined_tab4?.certifications?.length > 0 ? data.combined_tab4.certifications : FALLBACK_CERTS;

  // Smart fallback free courses
  const FALLBACK_COURSES = [
    { title:'Python for Everybody', platform:'Coursera', provider:'University of Michigan', hours:60, url:'https://www.coursera.org/specializations/python' },
    { title:'CS50: Introduction to Computer Science', platform:'edX', provider:'Harvard University', hours:100, url:'https://cs50.harvard.edu/' },
    { title:'Full Stack Open', platform:'Open Course', provider:'University of Helsinki', hours:120, url:'https://fullstackopen.com/' },
    { title:'NPTEL Programming in Java', platform:'NPTEL', provider:'IIT Kharagpur', hours:40, url:'https://nptel.ac.in/' },
  ];
  const courses = data.combined_tab4?.free_courses?.length > 0 ? data.combined_tab4.free_courses : FALLBACK_COURSES;

  // Smart fallback projects
  const FALLBACK_PROJECTS = [
    { title:'Personal Portfolio Website', description:'Build a responsive portfolio showcasing your skills and projects.', difficulty:'Beginner', tech:['HTML','CSS','JavaScript'] },
    { title:'REST API with Authentication', description:'Create a RESTful API with JWT auth, CRUD operations, and database.', difficulty:'Intermediate', tech:['Node.js','Express','MongoDB'] },
    { title:'Data Dashboard with Visualizations', description:'Build an interactive dashboard with charts, filters, and live data.', difficulty:'Advanced', tech:['React','Chart.js','Python'] },
  ];
  const projects = data.role_projects?.length > 0 ? data.role_projects : (data.projects?.length > 0 ? data.projects : FALLBACK_PROJECTS);
  const aiMust   = data.combined_tab3?.must_have || [];
  const aiNice   = data.combined_tab3?.nice_to_have || [];

  const clusterRoles = [
    { n:primaryRole,   s: pm ? `${pm.salary_min_lpa}-${pm.salary_max_lpa}L` : '3-8L', ai: pm?.ai_automation_risk||'Moderate', d:matched.length, t:total, a:missing.length, zone: pv.primaryZone?.employer_zone||'Amber' },
    secondaryRole && { n:secondaryRole,  s:'3-7L', ai:'Low',      d:Math.max(0,matched.length-1), t:total, a:missing.length+1, zone: pv.secondaryZone?.employer_zone||'Amber' },
    tertiaryRole  && { n:tertiaryRole,   s:'2-6L', ai:'Moderate', d:Math.max(0,matched.length-2), t:total, a:missing.length+2, zone: pv.tertiaryZone?.employer_zone||'Red'   },
  ].filter(Boolean);

  const eduZone   = pv?.primaryZone?.employer_zone || 'Amber';
  const skillZone = coveragePct >= 50 ? 'Green' : coveragePct >= 25 ? 'Amber' : 'Red';
  const expArr    = JSON.parse(localStorage.getItem('smaart_experience') || '[]');
  const expZone   = expArr.length > 0 ? 'Green' : 'Amber';

  const indicators = [
    { label:'Education – Role Fit',          zone:eduZone,   green:'Your degree is commonly accepted for this role.', amber:'Your degree is somewhat related. Strong skills can help.', red:'Your degree is not usually preferred. Extra certifications needed.' },
    { label:'Skills – Role Match',           zone:skillZone, green:'You have most key skills for this role.',          amber:'You have some skills but need to develop more.',          red:'Significant upskilling is required before applying.' },
    { label:'Work Experience – Role Match',  zone:expZone,   green:'Your experience is relevant and strengthens your profile.', amber:'Limited experience — internships will help.',          red:'No relevant experience yet. Projects will build your profile.' },
  ];

  const tier1 = missing.slice(0, Math.ceil(missing.length/3));
  const tier2 = missing.slice(Math.ceil(missing.length/3), Math.ceil(missing.length*2/3));
  const tier3 = missing.slice(Math.ceil(missing.length*2/3));

  const salMin = pm?.salary_min_lpa || 2;
  const salMax = pm?.salary_max_lpa || 8;

  const TABS = [
    { id:'Hiring Pattern',   icon:<Target size={14} />,   label:'Hiring Pattern' },
    { id:'Technical Skills', icon:<Cpu size={14} />,      label:'Technical Skills' },
    { id:'AI Tools',         icon:<Sparkles size={14} />, label:'AI Tools' },
    { id:'Learning Path',    icon:<BookOpen size={14} />, label:'Learning Path' },
  ];

  /* ── Red zone acknowledgement gate ── */
  if (eduZone === 'Red' && !redAck) return (
    <div style={{ maxWidth:520, margin:'40px auto', fontFamily:'var(--font-sans)' }}>
      <div style={{ ...C.card, borderLeft:'3px solid #A32D2D' }}>
        <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:12 }}>
          <span style={{ fontSize:24 }}>🔴</span>
          <p style={{ fontSize:15, fontWeight:600, margin:0, color:'var(--text-danger)' }}>Career Change Zone</p>
        </div>
        <p style={{ fontSize:13, color:'var(--text-primary)', margin:'0 0 8px', lineHeight:1.6 }}>
          This role usually needs a different educational background. Extra preparation: 6–12 months.
        </p>
        <p style={{ fontSize:12, color:'var(--text-secondary)', margin:'0 0 16px' }}>
          Students with a directly relevant degree start at 40–60% skill coverage. You would start at 5–15%. This is still achievable with dedicated effort.
        </p>
        <button onClick={() => setRedAck(true)}
          style={{ padding:'10px 20px', border:'none', borderRadius:8, background:'var(--bg-danger)', color:'var(--text-danger)', cursor:'pointer', fontWeight:500, fontSize:13, width:'100%' }}>
          I understand the additional preparation needed — Continue
        </button>
      </div>
    </div>
  );

  /* ══════════════════════════════════════════════════════════════
     RENDER
  ══════════════════════════════════════════════════════════════ */
  return (
    <div style={{ maxWidth:680, margin:'0 auto', fontFamily:'var(--font-sans)' }}>

      {/* ── Header ── */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16, paddingBottom:12, borderBottom:'0.5px solid var(--border)' }}>
        <div>
          <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:4 }}>
            <span style={{ fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.08em', padding:'2px 8px', borderRadius:10, background:'var(--bg-info)', color:'var(--text-info)' }}>
              Career Intelligence Report
            </span>
            <span style={{ display:'inline-flex', alignItems:'center', gap:4, fontSize:10, fontWeight:700, textTransform:'uppercase', padding:'2px 8px', borderRadius:10, background:'var(--bg-success)', color:'var(--text-success)' }}>
              <span style={{ width:6, height:6, borderRadius:'50%', background:'currentColor', animation:'pulse 2s infinite' }} />
              Active
            </span>
          </div>
          <p style={{ fontSize:18, fontWeight:600, margin:0, color:'var(--text-primary)' }}>Career Intelligence Dashboard</p>
        </div>
        <button onClick={regenerate} disabled={regen}
          style={{ display:'flex', alignItems:'center', gap:6, padding:'7px 14px', border:'0.5px solid var(--border)', borderRadius:8, background:'var(--bg-secondary)', color:'var(--text-secondary)', cursor:regen?'wait':'pointer', fontSize:12, fontWeight:500 }}>
          <RefreshCw size={13} style={regen ? { animation:'spin 1s linear infinite' } : {}} />
          {regen ? 'Regenerating…' : 'Regenerate'}
        </button>
      </div>

      {/* ── Vector Cards (Primary / Secondary / Tertiary) ── */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:8, marginBottom:16 }}>
        {clusterRoles.map((r, i) => {
          const zst = zs(r.zone);
          const labels = ['Primary','Secondary','Tertiary'];
          const icons  = [<Target size={12}/>, <TrendingUp size={12}/>, <Globe size={12}/>];
          return (
            <div key={i} style={{ ...C.card, borderLeft:`3px solid ${zst.border}`, marginBottom:0, padding:'12px 14px' }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:6 }}>
                <span style={{ fontSize:10, fontWeight:700, color:'var(--text-secondary)', textTransform:'uppercase', letterSpacing:'0.07em', display:'flex', alignItems:'center', gap:4 }}>
                  {icons[i]} {labels[i]}
                </span>
                <span style={{ padding:'1px 6px', borderRadius:6, background:zst.bg, color:zst.fg, fontSize:10, fontWeight:600 }}>{r.zone}</span>
              </div>
              <p style={{ fontSize:13, fontWeight:600, margin:'0 0 4px', color:'var(--text-primary)', lineHeight:1.3 }}>{r.n}</p>
              <p style={{ fontSize:11, color:'var(--text-secondary)', margin:0 }}>{r.a} skills away · ₹{r.s}</p>
            </div>
          );
        })}
      </div>

      {/* ── Employer Hiring Pattern Analysis ── */}
      <div style={C.card}>
        <p style={{ fontSize:13, fontWeight:600, margin:'0 0 12px', color:'var(--text-primary)', display:'flex', alignItems:'center', gap:6 }}>
          <Layers size={14} style={{ color:'var(--text-info)' }} /> Employer Hiring Pattern Analysis
        </p>
        {indicators.map((ind, i) => {
          const zst = zs(ind.zone);
          return (
            <div key={i} style={{ padding:'10px 0', borderBottom: i < 2 ? '0.5px solid var(--border)' : 'none' }}>
              <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:3 }}>
                <span style={{ fontSize:12 }}>{zst.dot}</span>
                <span style={{ fontSize:13, fontWeight:600, color:'var(--text-primary)', flex:1 }}>{ind.label}</span>
                <span style={{ padding:'1px 8px', borderRadius:6, background:zst.bg, color:zst.fg, fontSize:10, fontWeight:600 }}>{ind.zone}</span>
              </div>
              <p style={{ fontSize:12, color:'var(--text-secondary)', margin:0, paddingLeft:20, lineHeight:1.5 }}>
                {ind.zone === 'Green' ? ind.green : ind.zone === 'Amber' ? ind.amber : ind.red}
              </p>
            </div>
          );
        })}
      </div>

      {/* ── Direction Banner ── */}
      <div style={{ background:'#1B3A5C', borderRadius:12, padding:'20px 24px', marginBottom:16, color:'#fff' }}>
        <p style={{ fontSize:12, opacity:0.7, margin:0 }}>Career direction</p>
        <p style={{ fontSize:20, fontWeight:500, margin:'4px 0 2px' }}>{direction}</p>
        <div style={{ display:'flex', gap:16, fontSize:12, opacity:0.7, marginBottom:12 }}>
          <span>{clusterRoles.length} roles</span>
          <span>{total} unique skills</span>
          <span>{matched.length} skills developed</span>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <div style={{ flex:1, height:8, background:'rgba(255,255,255,0.15)', borderRadius:4, overflow:'hidden' }}>
            <div style={{ width:`${coveragePct}%`, height:'100%', background:'#1D9E75', transition:'width 1s ease' }} />
          </div>
          <span style={{ fontSize:14, fontWeight:500 }}>{matched.length} of {total} skills developed</span>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div style={{ display:'flex', gap:0, borderBottom:'0.5px solid var(--border)', marginBottom:20, overflowX:'auto' }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            style={{
              padding:'10px 16px', background:'none', border:'none',
              borderBottom: activeTab === t.id ? '2px solid var(--text-info)' : '2px solid transparent',
              cursor:'pointer', whiteSpace:'nowrap', fontSize:13,
              fontWeight: activeTab === t.id ? 600 : 400,
              color: activeTab === t.id ? 'var(--text-info)' : 'var(--text-secondary)',
              display:'flex', alignItems:'center', gap:6, transition:'all 0.15s',
            }}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* ── Tab Content ── */}
      <AnimatePresence mode="wait">
        <motion.div key={activeTab} initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-8 }} transition={{ duration:0.18 }}>

          {/* TAB 1 — Hiring Pattern */}
          {activeTab === 'Hiring Pattern' && (
            <div>
              <SH title="Roles in your cluster" sub="Sorted by distance — closest first" icon={<Target size={14}/>} />
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:20 }}>
                {clusterRoles.map((r, i) => {
                  const zst = zs(r.zone);
                  return (
                    <div key={i} style={C.card}>
                      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
                        <p style={{ fontSize:14, fontWeight:500, margin:0, color:'var(--text-primary)' }}>{r.n}</p>
                        <span style={{ padding:'1px 7px', borderRadius:6, background:zst.bg, color:zst.fg, fontSize:10, fontWeight:600 }}>{r.zone}</span>
                      </div>
                      <div style={{ display:'flex', gap:6, marginBottom:8 }}>
                        <Badge text={`₹${r.s}`} bg="var(--bg-secondary)" fg="var(--text-secondary)" />
                        <Badge text={`AI: ${r.ai}`} bg={r.ai==='Moderate'||r.ai==='Medium'?'var(--bg-warning)':'var(--bg-secondary)'} fg={r.ai==='Moderate'||r.ai==='Medium'?'var(--text-warning)':'var(--text-secondary)'} />
                      </div>
                      <Bar pct={r.t>0?Math.round((r.d/r.t)*100):0} color="#1D9E75" />
                      <p style={{ fontSize:11, color:'var(--text-secondary)', margin:'6px 0 0' }}>{r.d} of {r.t} skills · {r.a} away</p>
                    </div>
                  );
                })}
              </div>

              {pm && (
                <>
                  <SH title="Market Intelligence" icon={<BarChart3 size={14}/>} />
                  <div style={C.card}>
                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:10, marginBottom:12 }}>
                      {[
                        { label:'Demand Level', value:pm.demand_level, zn: pm.demand_level==='High'?'Green':pm.demand_level==='Medium'?'Amber':'Red' },
                        { label:'Salary Range', value:`₹${pm.salary_min_lpa}–${pm.salary_max_lpa}L`, zn:'Green' },
                        { label:'AI Risk', value:pm.ai_automation_risk, zn: pm.ai_automation_risk==='Low'?'Green':pm.ai_automation_risk==='Medium'?'Amber':'Red' },
                      ].map((m,i) => {
                        const zst = zs(m.zn);
                        return (
                          <div key={i} style={{ textAlign:'center', padding:'12px 8px', background:'var(--bg-secondary)', borderRadius:8 }}>
                            <p style={{ fontSize:11, color:'var(--text-secondary)', margin:'0 0 4px' }}>{m.label}</p>
                            <p style={{ fontSize:15, fontWeight:600, margin:0, color:zst.fg }}>{m.value}</p>
                          </div>
                        );
                      })}
                    </div>
                    <div style={{ paddingTop:12, borderTop:'0.5px solid var(--border)' }}>
                      <p style={{ fontSize:12, color:'var(--text-secondary)', margin:'0 0 6px' }}>Salary trajectory</p>
                      {[
                        { label:`Year 0-1: ${salMin}–${(salMin+1).toFixed(1)}L`, pct:25, color:'#BA7517' },
                        { label:`Year 2-3: ${(salMin+1).toFixed(1)}–${(salMin+3).toFixed(1)}L ← your target`, pct:50, color:'#1D9E75', bold:true },
                        { label:`Year 4-5: ${(salMin+3).toFixed(1)}–${(salMax-1).toFixed(1)}L`, pct:70, color:'#1D9E75' },
                        { label:`Year 6+: ${(salMax-1).toFixed(1)}–${salMax}L`, pct:90, color:'#1D9E75' },
                      ].map((row,i) => (
                        <div key={i} style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
                          <Bar pct={row.pct} color={row.color} width="56px" />
                          <span style={{ fontSize:11, fontWeight:row.bold?600:400, color:row.bold?'var(--text-success)':'var(--text-primary)' }}>{row.label}</span>
                        </div>
                      ))}
                    </div>
                    {pm.emerging_roles?.length > 0 && (
                      <div style={{ marginTop:12, paddingTop:12, borderTop:'0.5px solid var(--border)' }}>
                        <p style={{ fontSize:12, color:'var(--text-secondary)', margin:'0 0 6px', fontWeight:500 }}>Emerging roles</p>
                        <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
                          {pm.emerging_roles.map((r,i) => <Badge key={i} text={typeof r==='string'?r:r.name||r} bg="var(--bg-secondary)" fg="var(--text-secondary)" />)}
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          )}

          {/* TAB 2 — Technical Skills */}
          {activeTab === 'Technical Skills' && (
            <div>
              {missing[0] && (
                <div style={C.cardInfo}>
                  <p style={{ fontSize:12, color:'var(--text-info)', margin:0 }}>Next best skill to develop</p>
                  <p style={{ fontSize:15, fontWeight:600, margin:'4px 0', color:'var(--text-info)' }}>{missing[0]}</p>
                  <p style={{ fontSize:12, color:'var(--text-info)', margin:0 }}>Search "{missing[0]} free course" on Coursera, NPTEL, or YouTube</p>
                </div>
              )}

              <SH title="Must Have Skills" sub="Skills you already have matched" icon={<CheckCircle2 size={14}/>} />
              <div style={{ display:'flex', flexWrap:'wrap', gap:7, marginBottom:20 }}>
                {matched.map((sk,i) => (
                  <div key={i} style={{ padding:'5px 12px', background:'var(--bg-success)', color:'var(--text-success)', borderRadius:16, fontSize:12, fontWeight:500, display:'flex', alignItems:'center', gap:5 }}>
                    <CheckCircle2 size={12} /> {sk}
                  </div>
                ))}
                {matched.length === 0 && <p style={{ fontSize:13, color:'var(--text-secondary)' }}>No matched skills yet.</p>}
              </div>

              <SH title="Skills to Develop" sub="Prioritised by tier" icon={<XCircle size={14}/>} />
              <div style={C.card}>
                {[
                  { tier:'CRITICAL', label:'Foundation', color:'danger', skills:tier1 },
                  { tier:'HIGH',     label:'Specialisation', color:'warning', skills:tier2 },
                  { tier:'MEDIUM',   label:'Edge', color:'secondary', skills:tier3 },
                ].map(({ tier, label, color, skills }) => skills.map((sk,i) => (
                  <div key={`${tier}-${i}`} style={{ display:'flex', alignItems:'center', gap:10, padding:'9px 0', borderBottom:'0.5px solid var(--border)' }}>
                    <Badge text={tier} bg={`var(--bg-${color})`} fg={`var(--text-${color})`} />
                    <span style={{ fontSize:13, flex:1, color:'var(--text-primary)', fontWeight:500 }}>{sk}</span>
                    <span style={{ fontSize:11, color:'var(--text-secondary)' }}>{label}</span>
                  </div>
                )))}
                {missing.length === 0 && <p style={{ fontSize:13, color:'var(--text-success)', margin:0 }}>✓ You have all the required skills!</p>}
              </div>
            </div>
          )}

          {/* TAB 3 — AI Tools */}
          {activeTab === 'AI Tools' && (
            <div>
              <SH title="AI Tools for this Role" icon={<Sparkles size={14}/>} />
              <div style={C.card}>
                <p style={{ fontSize:13, fontWeight:600, margin:'0 0 10px', color:'var(--text-primary)' }}>Must Have</p>
                {aiMust.length > 0
                  ? <div style={{ display:'flex', flexWrap:'wrap', gap:7, marginBottom:16 }}>{aiMust.map((t,i) => <Badge key={i} text={t} bg="var(--bg-info)" fg="var(--text-info)" />)}</div>
                  : <p style={{ fontSize:12, color:'var(--text-secondary)', marginBottom:16 }}>No specific must-have tools listed yet.</p>
                }
                <p style={{ fontSize:13, fontWeight:600, margin:'0 0 10px', color:'var(--text-primary)', borderTop:'0.5px solid var(--border)', paddingTop:12 }}>Nice to Have</p>
                {aiNice.length > 0
                  ? <div style={{ display:'flex', flexWrap:'wrap', gap:7 }}>{aiNice.map((t,i) => <Badge key={i} text={t} bg="var(--bg-secondary)" fg="var(--text-secondary)" />)}</div>
                  : <p style={{ fontSize:12, color:'var(--text-secondary)', margin:0 }}>No nice-to-have tools listed yet.</p>
                }
              </div>
              <div style={{ padding:'12px 16px', background:'var(--bg-secondary)', borderRadius:8, marginTop:12 }}>
                <p style={{ fontSize:12, color:'var(--text-secondary)', margin:0, lineHeight:1.6 }}>
                  <strong style={{ color:'var(--text-primary)' }}>Tip:</strong> AI tools for this role are generated quarterly from real job postings. The data was last updated based on verified market signals.
                </p>
              </div>
            </div>
          )}

          {/* TAB 4 — Learning Path (REDESIGNED) */}
          {activeTab === 'Learning Path' && (
            <div>
              {/* AI Learning Estimate Banner */}
              <div style={{ ...C.cardInfo, display:'flex', alignItems:'center', gap:12, marginTop:16 }}>
                <div style={{ width:36, height:36, borderRadius:10, background:'#185FA5', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                  <Zap size={18} color="#fff" />
                </div>
                <div>
                  <p style={{ fontSize:13, fontWeight:600, margin:'0 0 2px', color:'var(--text-info)' }}>AI Learning Estimate</p>
                  <p style={{ fontSize:12, color:'var(--text-info)', margin:0, lineHeight:1.5, opacity:0.85 }}>
                    Based on your skill coverage ({coveragePct}%), reaching <strong>Green Zone</strong> will take approximately <strong>{coveragePct >= 50 ? '1-2' : coveragePct >= 25 ? '3-4' : '5-6'} months</strong> of consistent learning.
                  </p>
                </div>
              </div>

              {/* Career Roadmap Timeline */}
              <SH title="Career Roadmap" sub={`${roadmap.length} steps to industry readiness`} icon={<Layers size={14}/>} />
              <div style={C.card}>
                {roadmap.map((s, i) => {
                  const statusMap = {
                    completed: { bg:'var(--bg-success)', fg:'var(--text-success)', label:'Completed', dot:'#1D9E75' },
                    'in-progress': { bg:'var(--bg-info)', fg:'var(--text-info)', label:'In Progress', dot:'#185FA5' },
                    upcoming: { bg:'var(--bg-secondary)', fg:'var(--text-secondary)', label:'Upcoming', dot:'var(--border)' },
                    locked: { bg:'var(--bg-secondary)', fg:'var(--text-secondary)', label:'Locked', dot:'var(--border)' },
                  };
                  const st = statusMap[s.status] || statusMap.upcoming;
                  const iconMap = { book:<GraduationCap size={14}/>, code:<Code2 size={14}/>, rocket:<Rocket size={14}/>, briefcase:<Briefcase size={14}/> };
                  return (
                    <div key={i} style={{ display:'flex', gap:0, position:'relative' }}>
                      {/* Timeline line */}
                      <div style={{ display:'flex', flexDirection:'column', alignItems:'center', width:32, flexShrink:0 }}>
                        <div style={{
                          width:28, height:28, borderRadius:'50%', background:st.bg, border:`2px solid ${st.dot}`,
                          display:'flex', alignItems:'center', justifyContent:'center', color:st.fg, zIndex:1,
                          animation: s.status === 'in-progress' ? 'pulse 2s infinite' : 'none',
                        }}>
                          {s.status === 'completed' ? <CheckCircle2 size={14}/> : (iconMap[s.icon] || <span style={{ fontSize:11, fontWeight:700 }}>{i+1}</span>)}
                        </div>
                        {i < roadmap.length - 1 && (
                          <div style={{ width:2, flex:1, background: s.status === 'completed' ? '#1D9E75' : 'var(--border)', minHeight:20 }} />
                        )}
                      </div>
                      {/* Content */}
                      <div style={{ flex:1, paddingBottom: i < roadmap.length-1 ? 20 : 0, paddingLeft:12 }}>
                        <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:3 }}>
                          <p style={{ fontSize:13, fontWeight:600, margin:0, color:s.status==='locked' ? 'var(--text-secondary)' : 'var(--text-primary)' }}>{s.step||s.title||`Step ${i+1}`}</p>
                          <Badge text={st.label} bg={st.bg} fg={st.fg} />
                          {s.duration && <span style={{ fontSize:11, color:'var(--text-secondary)', display:'flex', alignItems:'center', gap:3 }}><Clock size={10}/>{s.duration}</span>}
                        </div>
                        <p style={{ fontSize:12, color:'var(--text-secondary)', margin:0, lineHeight:1.5 }}>{s.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Recommended Certificates */}
              <SH title="Recommended Certificates" sub={`${certs.length} industry-recognized certifications`} icon={<Award size={14}/>} />
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(280px, 1fr))', gap:10 }}>
                {certs.map((c, i) => {
                  const name = c.name || c;
                  const diff = c.difficulty || 'Beginner';
                  const diffStyle = diff === 'Beginner' ? { bg:'var(--bg-success)', fg:'var(--text-success)' } : diff === 'Intermediate' ? { bg:'var(--bg-warning)', fg:'var(--text-warning)' } : { bg:'var(--bg-danger)', fg:'var(--text-danger)' };
                  return (
                    <div key={i} style={{ ...C.card, display:'flex', flexDirection:'column', gap:8, marginBottom:0 }}>
                      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between' }}>
                        <div style={{ width:32, height:32, borderRadius:8, background:'var(--bg-info)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                          <Award size={16} color='var(--text-info)' />
                        </div>
                        <Badge text={diff} bg={diffStyle.bg} fg={diffStyle.fg} />
                      </div>
                      <p style={{ fontSize:13, fontWeight:600, margin:0, color:'var(--text-primary)', lineHeight:1.4 }}>{name}</p>
                      {c.issuer && <p style={{ fontSize:11, color:'var(--text-secondary)', margin:0 }}>{c.issuer}</p>}
                      <div style={{ display:'flex', alignItems:'center', gap:12, marginTop:'auto' }}>
                        {c.hours && <span style={{ fontSize:11, color:'var(--text-secondary)', display:'flex', alignItems:'center', gap:3 }}><Clock size={10}/> ~{c.hours}hrs</span>}
                        {c.url && <a href={c.url} target='_blank' rel='noreferrer' style={{ fontSize:11, color:'var(--text-info)', textDecoration:'none', display:'flex', alignItems:'center', gap:3, marginLeft:'auto' }}>Learn More <ExternalLink size={10}/></a>}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Free Courses */}
              <SH title="Free Courses" sub={`${courses.length} curated from top platforms`} icon={<BookOpen size={14}/>} />
              <div style={C.card}>
                {courses.map((c, i) => {
                  const platformColors = { Coursera:'#0056D2', edX:'#02262B', NPTEL:'#E65100', YouTube:'#FF0000', 'Open Course':'#1D9E75' };
                  const pColor = platformColors[c.platform] || 'var(--text-info)';
                  return (
                    <div key={i} style={{ display:'flex', alignItems:'center', gap:12, padding:'10px 0', borderBottom: i<courses.length-1 ? '0.5px solid var(--border)' : 'none' }}>
                      <div style={{ width:28, height:28, borderRadius:6, background: pColor+'18', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                        <BookOpen size={14} color={pColor} />
                      </div>
                      <div style={{ flex:1 }}>
                        <p style={{ fontSize:13, fontWeight:500, margin:'0 0 2px', color:'var(--text-primary)' }}>{c.title||c.name||c}</p>
                        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                          {c.platform && <Badge text={c.platform} bg={pColor+'18'} fg={pColor} />}
                          {c.provider && <span style={{ fontSize:11, color:'var(--text-secondary)' }}>{c.provider}</span>}
                          {c.hours && <span style={{ fontSize:11, color:'var(--text-secondary)', display:'flex', alignItems:'center', gap:3 }}><Clock size={10}/> ~{c.hours}hrs</span>}
                        </div>
                      </div>
                      {c.url && <a href={c.url} target='_blank' rel='noreferrer' style={{ color:'var(--text-info)', display:'flex' }}><ExternalLink size={14}/></a>}
                    </div>
                  );
                })}
              </div>

              {/* Recommended Projects */}
              <SH title="Recommended Projects" sub={`${projects.length} hands-on projects to build your portfolio`} icon={<Briefcase size={14}/>} />
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(280px, 1fr))', gap:10 }}>
                {projects.map((p, i) => {
                  const diff = p.difficulty || 'Beginner';
                  const diffStyle = diff === 'Beginner' ? { bg:'var(--bg-success)', fg:'var(--text-success)' } : diff === 'Intermediate' ? { bg:'var(--bg-warning)', fg:'var(--text-warning)' } : { bg:'var(--bg-danger)', fg:'var(--text-danger)' };
                  const tech = p.tech || p.technologies || p.tech_stack || [];
                  return (
                    <div key={i} style={{ ...C.card, display:'flex', flexDirection:'column', gap:6, marginBottom:0 }}>
                      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                        <div style={{ width:28, height:28, borderRadius:8, background:'var(--bg-secondary)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                          <Code2 size={14} color='var(--text-secondary)' />
                        </div>
                        <Badge text={diff} bg={diffStyle.bg} fg={diffStyle.fg} />
                      </div>
                      <p style={{ fontSize:13, fontWeight:600, margin:0, color:'var(--text-primary)' }}>{p.title||p.name||p}</p>
                      {p.description && <p style={{ fontSize:12, color:'var(--text-secondary)', margin:0, lineHeight:1.5 }}>{p.description}</p>}
                      {tech.length > 0 && (
                        <div style={{ display:'flex', flexWrap:'wrap', gap:4, marginTop:4 }}>
                          {(Array.isArray(tech) ? tech : [tech]).map((t,j) => (
                            <span key={j} style={{ fontSize:10, padding:'2px 7px', borderRadius:6, background:'var(--bg-info)', color:'var(--text-info)', fontWeight:500 }}>{t}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </motion.div>
      </AnimatePresence>

      {/* ── Rating ── */}
      <div style={{ textAlign:'center', padding:'20px 0', borderTop:'0.5px solid var(--border)', marginTop:24 }}>
        <p style={{ fontSize:12, color:'var(--text-secondary)', marginBottom:12 }}>How helpful was this analysis?</p>
        {rated
          ? <div style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'8px 16px', background:'var(--bg-success)', borderRadius:8, fontSize:13, color:'var(--text-success)', fontWeight:500 }}>
              <CheckCircle2 size={14} /> Thank you for your feedback!
            </div>
          : <div style={{ display:'flex', gap:8, justifyContent:'center' }}>
              {[1,2,3,4,5].map(star => (
                <button key={star} onClick={() => submitRating(star)}
                  onMouseEnter={() => setHovered(star)} onMouseLeave={() => setHovered(0)}
                  style={{ background:'none', border:'none', cursor:'pointer', fontSize:28, lineHeight:1, color:(hovered||rating)>=star?'#F59E0B':'var(--border)', transition:'color 0.1s' }}>
                  <Star size={24} fill={(hovered||rating)>=star?'#F59E0B':'none'} color={(hovered||rating)>=star?'#F59E0B':'var(--border)'} />
                </button>
              ))}
            </div>
        }
      </div>

      <style>{`
        @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes pulse { 0%{opacity:1} 50%{opacity:0.5} 100%{opacity:1} }
      `}</style>
    </div>
  );
}
