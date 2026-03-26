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

/* ── design tokens (Stitch MCP "Digital Oracle" — Premium SaaS) ────── */
const C = {
  card: { background:'var(--card-bg, var(--bg-primary))', backdropFilter:'blur(24px)', WebkitBackdropFilter:'blur(24px)', border:'0.5px solid rgba(72,72,71,0.15)', borderRadius:18, padding:'22px 26px', marginBottom:14, transition:'box-shadow 0.35s cubic-bezier(.4,0,.2,1), transform 0.25s cubic-bezier(.4,0,.2,1), border-color 0.3s', boxShadow:'0 1px 3px rgba(0,0,0,0.06), 0 8px 24px rgba(0,0,0,0.04)' },
  cardInfo: { background:'linear-gradient(135deg, rgba(133,173,255,0.10) 0%, rgba(110,159,255,0.04) 100%)', backdropFilter:'blur(20px)', WebkitBackdropFilter:'blur(20px)', border:'0.5px solid rgba(133,173,255,0.18)', borderRadius:18, padding:'22px 26px', marginBottom:14 },
  cardNested: { background:'var(--surface-high, var(--bg-tertiary))', borderRadius:14, padding:'16px 20px', marginBottom:10, border:'0.5px solid rgba(72,72,71,0.08)' },
};

function Badge({ text, bg, fg }) {
  return <span style={{ display:'inline-flex', alignItems:'center', padding:'3px 10px', borderRadius:20, background:bg, color:fg, fontSize:10.5, fontWeight:600, letterSpacing:'0.02em', lineHeight:1.4 }}>{text}</span>;
}

function Bar({ pct, color, width, height }) {
  return (
    <div style={{ height:height||7, background:'rgba(128,128,128,0.12)', borderRadius:20, width:width||'100%', overflow:'hidden' }}>
      <div style={{ height:'100%', width:`${Math.min(pct,100)}%`, background:color ? `linear-gradient(90deg, ${color}, ${color}dd)` : 'linear-gradient(90deg, #1D9E75, #2BC48A)', borderRadius:20, transition:'width 1s cubic-bezier(.4,0,.2,1)', boxShadow: pct > 0 ? `0 0 8px ${color||'#1D9E75'}40` : 'none' }} />
    </div>
  );
}

function SH({ title, sub, icon }) {
  return (
    <div style={{ margin:'24px 0 14px', display:'flex', alignItems:'center', gap:10 }}>
      {icon && <div style={{ width:28, height:28, borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center', background:'rgba(133,173,255,0.10)', color:'var(--text-info)' }}>{icon}</div>}
      <div>
        <p style={{ fontSize:15, fontWeight:700, margin:0, color:'var(--text-primary)', letterSpacing:'-0.01em' }}>{title}</p>
        {sub && <p style={{ fontSize:11.5, color:'var(--text-secondary)', margin:'2px 0 0', fontWeight:400 }}>{sub}</p>}
      </div>
    </div>
  );
}

/* ── zone helpers ───────────────────────────────────────────────────── */
const ZONE_STYLE = {
  Green: { bg:'var(--bg-success)', fg:'var(--text-success)', border:'#1D9E75' },
  Amber: { bg:'var(--bg-warning)', fg:'var(--text-warning)', border:'#BA7517' },
  Red:   { bg:'var(--bg-danger)',  fg:'var(--text-danger)',  border:'#A32D2D' },
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
  const projects = data.combined_tab4?.projects?.length > 0 ? data.combined_tab4.projects : (data.role_projects?.length > 0 ? data.role_projects : FALLBACK_PROJECTS);

  // ── Rich AI Tools Fallback ──
  const FALLBACK_AI_MUST = [
    { tool_name:'GitHub Copilot', used_for:'AI-powered code completion, generation, and refactoring — 10× faster coding', priority:'CRITICAL', where_to_learn:'Free for students via GitHub Education (github.com/education)' },
    { tool_name:'ChatGPT / Claude', used_for:'System design analysis, code review, debugging assistance, documentation generation', priority:'CRITICAL', where_to_learn:'Free tier at openai.com / claude.ai' },
  ];
  const FALLBACK_AI_NICE = [
    { tool_name:'SonarQube Community', used_for:'Static code analysis, vulnerability detection, and code quality gates', priority:'HIGH', where_to_learn:'Free open-source edition at sonarqube.org' },
    { tool_name:'Cursor IDE', used_for:'AI-native code editor with inline generation and full codebase context', priority:'HIGH', where_to_learn:'Free plan at cursor.sh' },
    { tool_name:'v0 by Vercel', used_for:'AI-powered UI component generation from text prompts', priority:'MEDIUM', where_to_learn:'Free at v0.dev' },
    { tool_name:'Perplexity AI', used_for:'AI-powered research assistant for technical documentation and API references', priority:'MEDIUM', where_to_learn:'Free at perplexity.ai' },
    { tool_name:'Aider', used_for:'Open-source AI pair programming in terminal with full repo awareness', priority:'LOW', where_to_learn:'Free at aider.chat' },
  ];
  const aiMust = data.combined_tab3?.must_have?.length > 0 ? data.combined_tab3.must_have : FALLBACK_AI_MUST;
  const aiNice = data.combined_tab3?.nice_to_have?.length > 0 ? data.combined_tab3.nice_to_have : FALLBACK_AI_NICE;

  // ── Growth Skills (added when "all matched" but still need to develop more) ──
  const GROWTH_SKILLS = [
    'System Design & Architecture', 'Cloud Fundamentals (AWS/Azure/GCP)', 'CI/CD Pipelines (GitHub Actions)',
    'Docker & Containerization', 'TypeScript', 'Testing & TDD (Jest/Vitest)', 'GraphQL',
    'Kubernetes Basics', 'Microservices Architecture', 'Performance Optimization',
    'Security Best Practices (OWASP)', 'Database Design (SQL + NoSQL)',
  ];
  const effectiveMissing = missing.length > 0 ? missing : GROWTH_SKILLS.filter(s => !matched.some(m => m.toLowerCase().includes(s.split(' ')[0].toLowerCase())));
  const effectiveTotal = matched.length + effectiveMissing.length;
  const effectiveCoverage = effectiveTotal > 0 ? Math.round((matched.length / effectiveTotal) * 100) : 0;

  // ── Recommended Skills Fallback for Learning Path ──
  const FALLBACK_RECOMMENDED = [
    { skill_name:'Object-Oriented Programming', priority:'CRITICAL', is_matched: matched.some(s => /oop|object/i.test(s)), where_to_learn:'freeCodeCamp (free) / Coursera' },
    { skill_name:'System Design', priority:'CRITICAL', is_matched: matched.some(s => /system.design/i.test(s)), where_to_learn:'System Design Primer (GitHub) / YouTube' },
    { skill_name:'Cloud Fundamentals', priority:'HIGH', is_matched: matched.some(s => /cloud|aws|azure|gcp/i.test(s)), where_to_learn:'AWS Skill Builder free tier / Microsoft Learn' },
    { skill_name:'CI/CD Basics', priority:'HIGH', is_matched: matched.some(s => /ci.cd|github.actions/i.test(s)), where_to_learn:'GitHub Actions free docs' },
    { skill_name:'Database Design', priority:'HIGH', is_matched: matched.some(s => /database|sql|mongo/i.test(s)), where_to_learn:'SQLZoo (free) / MongoDB University' },
    { skill_name:'Docker & Containers', priority:'MEDIUM', is_matched: matched.some(s => /docker|container/i.test(s)), where_to_learn:'Docker official free docs' },
    { skill_name:'TypeScript', priority:'MEDIUM', is_matched: matched.some(s => /typescript/i.test(s)), where_to_learn:'TypeScript Handbook (typescriptlang.org)' },
    { skill_name:'Testing & TDD', priority:'MEDIUM', is_matched: matched.some(s => /test|jest|vitest/i.test(s)), where_to_learn:'Testing JavaScript (free course)' },
    { skill_name:'GraphQL', priority:'LOW', is_matched: matched.some(s => /graphql/i.test(s)), where_to_learn:'How To GraphQL (free)' },
    { skill_name:'Kubernetes', priority:'LOW', is_matched: matched.some(s => /kubernetes|k8s/i.test(s)), where_to_learn:'Kubernetes.io interactive tutorials (free)' },
  ];
  const recommendedSkills = data.combined_tab4?.recommended_skills?.length > 0 ? data.combined_tab4.recommended_skills : FALLBACK_RECOMMENDED;

  // ── Enriched Cluster Roles for Hiring Pattern ──
  const EXTRA_CLUSTER_ROLES = [
    { n:'Full Stack Developer',  s:'₹5-12L', ai:'Medium', d:Math.max(0,matched.length-1), t:effectiveTotal, a:effectiveMissing.length+1, zone:'Green' },
    { n:'DevOps Engineer',       s:'₹6-15L', ai:'Low',    d:Math.max(0,matched.length-2), t:effectiveTotal, a:effectiveMissing.length+2, zone:'Amber' },
    { n:'Backend Developer',     s:'₹5-10L', ai:'Medium', d:Math.max(0,matched.length),   t:effectiveTotal, a:effectiveMissing.length,   zone:'Green' },
    { n:'Cloud Engineer',        s:'₹8-18L', ai:'Low',    d:Math.max(0,matched.length-3), t:effectiveTotal, a:effectiveMissing.length+3, zone:'Amber' },
    { n:'Data Engineer',         s:'₹6-14L', ai:'Low',    d:Math.max(0,matched.length-2), t:effectiveTotal, a:effectiveMissing.length+2, zone:'Red' },
  ];
  const baseCluster = [
    { n:primaryRole, s: pm ? `₹${pm.salary_min_lpa}-${pm.salary_max_lpa}L` : '₹4-10L', ai: pm?.ai_automation_risk||'Medium', d:matched.length, t:effectiveTotal, a:effectiveMissing.length, zone: pv.primaryZone?.employer_zone||'Amber' },
    secondaryRole && { n:secondaryRole, s:'₹3-7L', ai:'Low', d:Math.max(0,matched.length-1), t:effectiveTotal, a:effectiveMissing.length+1, zone: pv.secondaryZone?.employer_zone||'Amber' },
    tertiaryRole  && { n:tertiaryRole,  s:'₹2-6L', ai:'Moderate', d:Math.max(0,matched.length-2), t:effectiveTotal, a:effectiveMissing.length+2, zone: pv.tertiaryZone?.employer_zone||'Red' },
  ].filter(Boolean);
  const clusterRoles = baseCluster.length < 3 ? [...baseCluster, ...EXTRA_CLUSTER_ROLES.slice(0, 5 - baseCluster.length)] : baseCluster;

  const eduZone   = pv?.primaryZone?.employer_zone || 'Amber';
  const skillZone = coveragePct >= 50 ? 'Green' : coveragePct >= 25 ? 'Amber' : 'Red';
  const expArr    = JSON.parse(localStorage.getItem('smaart_experience') || '[]');
  const expZone   = expArr.length > 0 ? 'Green' : 'Amber';

  const indicators = [
    { label:'Education – Role Fit',          zone:eduZone,   green:'Your degree is commonly accepted for this role.', amber:'Your degree is somewhat related. Strong skills can help.', red:'Your degree is not usually preferred. Extra certifications needed.' },
    { label:'Skills – Role Match',           zone:skillZone, green:'You have most key skills for this role.',          amber:'You have some skills but need to develop more.',          red:'Significant upskilling is required before applying.' },
    { label:'Work Experience – Role Match',  zone:expZone,   green:'Your experience is relevant and strengthens your profile.', amber:'Limited experience — internships will help.',          red:'No relevant experience yet. Projects will build your profile.' },
  ];

  const tier1 = effectiveMissing.slice(0, Math.ceil(effectiveMissing.length/3));
  const tier2 = effectiveMissing.slice(Math.ceil(effectiveMissing.length/3), Math.ceil(effectiveMissing.length*2/3));
  const tier3 = effectiveMissing.slice(Math.ceil(effectiveMissing.length*2/3));

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
    <div style={{ maxWidth:1100, margin:'0 auto', fontFamily:'var(--font-sans)', padding:'0 4px' }}>

      {/* ── Premium Header ── */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20, paddingBottom:16, borderBottom:'0.5px solid rgba(72,72,71,0.12)' }}>
        <div>
          <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:6 }}>
            <span style={{ fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.1em', padding:'3px 10px', borderRadius:20, background:'linear-gradient(135deg, rgba(133,173,255,0.15), rgba(133,173,255,0.08))', color:'var(--text-info)', border:'0.5px solid rgba(133,173,255,0.2)' }}>
              ✦ Career Intelligence
            </span>
            <span style={{ display:'inline-flex', alignItems:'center', gap:4, fontSize:10, fontWeight:700, textTransform:'uppercase', padding:'3px 10px', borderRadius:20, background:'linear-gradient(135deg, rgba(29,158,117,0.15), rgba(29,158,117,0.08))', color:'var(--text-success)', border:'0.5px solid rgba(29,158,117,0.2)' }}>
              <span style={{ width:5, height:5, borderRadius:'50%', background:'currentColor', animation:'pulse 2s infinite', boxShadow:'0 0 6px currentColor' }} />
              Live
            </span>
          </div>
          <p style={{ fontSize:20, fontWeight:700, margin:0, color:'var(--text-primary)', letterSpacing:'-0.02em' }}>Career Intelligence Dashboard</p>
          <p style={{ fontSize:12, color:'var(--text-secondary)', margin:'3px 0 0', fontWeight:400 }}>AI-powered career analysis for {primaryRole || 'your target role'}</p>
        </div>
        <button onClick={regenerate} disabled={regen}
          style={{ display:'flex', alignItems:'center', gap:6, padding:'9px 18px', border:'0.5px solid rgba(133,173,255,0.25)', borderRadius:12, background:'linear-gradient(135deg, rgba(133,173,255,0.08), rgba(133,173,255,0.03))', color:'var(--text-info)', cursor:regen?'wait':'pointer', fontSize:12, fontWeight:600, transition:'all 0.2s', backdropFilter:'blur(8px)' }}>
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
                <span style={{ display:'inline-block', width:10, height:10, borderRadius:'50%', background:zst.border, flexShrink:0 }} />
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

      {/* ── Premium Direction Banner ── */}
      <div style={{ background:'linear-gradient(135deg, #0F2B4A 0%, #1B3A5C 40%, #1A4D6E 100%)', borderRadius:18, padding:'24px 28px', marginBottom:20, color:'#fff', position:'relative', overflow:'hidden', boxShadow:'0 4px 24px rgba(15,43,74,0.3)' }}>
        {/* Ambient glow */}
        <div style={{ position:'absolute', top:-40, right:-40, width:160, height:160, background:'radial-gradient(circle, rgba(29,158,117,0.15) 0%, transparent 70%)', pointerEvents:'none' }} />
        <div style={{ position:'absolute', bottom:-30, left:-30, width:120, height:120, background:'radial-gradient(circle, rgba(133,173,255,0.12) 0%, transparent 70%)', pointerEvents:'none' }} />
        <div style={{ position:'relative', zIndex:1 }}>
          <p style={{ fontSize:11, opacity:0.6, margin:0, fontWeight:500, textTransform:'uppercase', letterSpacing:'0.1em' }}>Career Direction</p>
          <p style={{ fontSize:22, fontWeight:700, margin:'6px 0 4px', letterSpacing:'-0.02em' }}>{direction}</p>
          <div style={{ display:'flex', gap:20, fontSize:12, opacity:0.6, marginBottom:16 }}>
            <span style={{ display:'flex', alignItems:'center', gap:4 }}><Target size={12}/> {clusterRoles.length} roles</span>
            <span style={{ display:'flex', alignItems:'center', gap:4 }}><Cpu size={12}/> {total} skills tracked</span>
            <span style={{ display:'flex', alignItems:'center', gap:4 }}><CheckCircle2 size={12}/> {matched.length} developed</span>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:14 }}>
            <div style={{ flex:1, height:8, background:'rgba(255,255,255,0.10)', borderRadius:20, overflow:'hidden' }}>
              <div style={{ width:`${coveragePct}%`, height:'100%', background:'linear-gradient(90deg, #1D9E75, #2BC48A)', transition:'width 1.2s cubic-bezier(.4,0,.2,1)', borderRadius:20, boxShadow:'0 0 12px rgba(29,158,117,0.4)' }} />
            </div>
            <span style={{ fontSize:14, fontWeight:700, whiteSpace:'nowrap' }}>{coveragePct}%</span>
          </div>
        </div>
      </div>

      {/* ── Premium Pill Tabs ── */}
      <div style={{ display:'flex', gap:6, marginBottom:22, overflowX:'auto', padding:'4px', background:'var(--bg-secondary)', borderRadius:14, border:'0.5px solid rgba(72,72,71,0.08)' }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            style={{
              padding:'10px 18px', border:'none', borderRadius:10,
              background: activeTab === t.id ? 'var(--bg-primary)' : 'transparent',
              boxShadow: activeTab === t.id ? '0 1px 4px rgba(0,0,0,0.08), 0 2px 12px rgba(0,0,0,0.04)' : 'none',
              cursor:'pointer', whiteSpace:'nowrap', fontSize:12.5,
              fontWeight: activeTab === t.id ? 600 : 400,
              color: activeTab === t.id ? 'var(--text-primary)' : 'var(--text-secondary)',
              display:'flex', alignItems:'center', gap:6, transition:'all 0.25s cubic-bezier(.4,0,.2,1)',
              flex:1, justifyContent:'center',
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
                        <Badge text={r.s} bg="var(--bg-secondary)" fg="var(--text-secondary)" />
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
              {/* Skill Coverage Summary */}
              <div style={{ ...C.cardInfo, display:'flex', alignItems:'center', gap:12, marginBottom:16 }}>
                <div style={{ width:36, height:36, borderRadius:10, background:'linear-gradient(135deg,#1D9E75,#2BC48A)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, boxShadow:'0 2px 8px #1D9E7540' }}>
                  <Cpu size={18} color="#fff" />
                </div>
                <div style={{ flex:1 }}>
                  <p style={{ fontSize:13, fontWeight:600, margin:'0 0 2px', color:'var(--text-primary)' }}>Skill Coverage: {matched.length} matched · {effectiveMissing.length} to develop</p>
                  <p style={{ fontSize:12, color:'var(--text-secondary)', margin:0 }}>Based on industry requirements for {primaryRole}. Your next focus: <strong style={{ color:'var(--text-info)' }}>{effectiveMissing[0] || 'Advanced topics'}</strong></p>
                </div>
              </div>

              <SH title="Must Have Skills" sub={`${matched.length} skills you already have matched`} icon={<CheckCircle2 size={14}/>} />
              <div style={{ display:'flex', flexWrap:'wrap', gap:7, marginBottom:20 }}>
                {matched.map((sk,i) => (
                  <div key={i} style={{ padding:'5px 12px', background:'var(--bg-success)', color:'var(--text-success)', borderRadius:16, fontSize:12, fontWeight:500, display:'flex', alignItems:'center', gap:5 }}>
                    <CheckCircle2 size={12} /> {sk}
                  </div>
                ))}
                {matched.length === 0 && <p style={{ fontSize:13, color:'var(--text-secondary)' }}>No matched skills yet.</p>}
              </div>

              <SH title="Skills to Develop" sub={`${effectiveMissing.length} skills prioritised by industry demand`} icon={<XCircle size={14}/>} />
              <div style={C.card}>
                {[
                  { tier:'CRITICAL', label:'Foundation', color:'danger', skills:tier1 },
                  { tier:'HIGH',     label:'Specialisation', color:'warning', skills:tier2 },
                  { tier:'MEDIUM',   label:'Growth', color:'secondary', skills:tier3 },
                ].map(({ tier, label, color, skills }) => skills.map((sk,i) => (
                  <div key={`${tier}-${i}`} style={{ display:'flex', alignItems:'center', gap:10, padding:'9px 0', borderBottom:'0.5px solid var(--border)' }}>
                    <Badge text={tier} bg={`var(--bg-${color})`} fg={`var(--text-${color})`} />
                    <span style={{ fontSize:13, flex:1, color:'var(--text-primary)', fontWeight:500 }}>{sk}</span>
                    <span style={{ fontSize:11, color:'var(--text-secondary)' }}>{label}</span>
                  </div>
                )))}
                {effectiveMissing.length === 0 && <p style={{ fontSize:13, color:'var(--text-success)', margin:0 }}>✓ You have all the required skills!</p>}
              </div>
            </div>
          )}

          {/* TAB 3 — AI Tools (Enhanced) */}
          {activeTab === 'AI Tools' && (
            <div>
              <SH title="AI Tools for this Role" icon={<Sparkles size={14}/>} sub="Tools recommended by industry for this career path" />

              {/* AI Impact Banner */}
              <div style={{ ...C.cardInfo, display:'flex', alignItems:'center', gap:12, marginBottom:16 }}>
                <div style={{ width:36, height:36, borderRadius:10, background:'linear-gradient(135deg,#6e4ff6,#85adff)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, boxShadow:'0 2px 8px rgba(110,79,246,0.3)' }}>
                  <Sparkles size={18} color="#fff" />
                </div>
                <div>
                  <p style={{ fontSize:13, fontWeight:600, margin:'0 0 2px', color:'var(--text-primary)' }}>AI Tools are Career Differentiators in {new Date().getFullYear()}</p>
                  <p style={{ fontSize:12, color:'var(--text-secondary)', margin:0 }}>Employers increasingly ask: "What AI tools do you use?" — These are curated for your role.</p>
                </div>
              </div>

              {/* Must Have Tools */}
              <p style={{ fontSize:14, fontWeight:700, margin:'20px 0 10px', color:'var(--text-primary)', fontFamily:"'Manrope', sans-serif" }}>
                🔴 Must Have <span style={{ fontSize:11, fontWeight:400, color:'var(--text-secondary)', marginLeft:4 }}>({aiMust.length} tools)</span>
              </p>
              {aiMust.length > 0
                ? <div style={{ display:'flex', flexDirection:'column', gap:10, marginBottom:20 }}>
                    {aiMust.map((t, i) => {
                      const isObj = typeof t === 'object';
                      const name = isObj ? t.tool_name : t;
                      const usedFor = isObj ? t.used_for : null;
                      const priority = isObj ? t.priority : 'CRITICAL';
                      const learnUrl = isObj ? t.where_to_learn : null;
                      return (
                        <motion.div key={i} initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{delay:i*0.08}}
                          style={{ ...C.card, marginBottom:0, display:'flex', flexDirection:'column', gap:8, borderLeft:'3px solid #ff716c' }}>
                          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                            <span style={{ fontSize:14, fontWeight:600, color:'var(--text-primary)' }}>{name}</span>
                            <Badge text={priority} bg="var(--bg-danger)" fg="var(--text-danger)" />
                          </div>
                          {usedFor && <p style={{ fontSize:12, color:'var(--text-secondary)', margin:0, lineHeight:1.5 }}>💡 {usedFor}</p>}
                          {learnUrl && (
                            <a href={learnUrl.includes('http') ? learnUrl : `https://${learnUrl.match(/\(([^)]+)\)/)?.[1] || learnUrl}`}
                              target="_blank" rel="noopener noreferrer"
                              style={{ fontSize:11, color:'var(--text-info)', textDecoration:'none', display:'flex', alignItems:'center', gap:4 }}>
                              <ExternalLink size={11} /> {learnUrl.replace(/\(.*?\)/g, '').trim()}
                            </a>
                          )}
                        </motion.div>
                      );
                    })}
                  </div>
                : <div style={{ ...C.card, marginBottom:16 }}><p style={{ fontSize:12, color:'var(--text-secondary)', margin:0 }}>No must-have tools identified for this role yet.</p></div>
              }

              {/* Nice to Have Tools */}
              <p style={{ fontSize:14, fontWeight:700, margin:'20px 0 10px', color:'var(--text-primary)', fontFamily:"'Manrope', sans-serif" }}>
                🟡 Nice to Have <span style={{ fontSize:11, fontWeight:400, color:'var(--text-secondary)', marginLeft:4 }}>({aiNice.length} tools)</span>
              </p>
              {aiNice.length > 0
                ? <div style={{ display:'flex', flexDirection:'column', gap:10, marginBottom:16 }}>
                    {aiNice.map((t, i) => {
                      const isObj = typeof t === 'object';
                      const name = isObj ? t.tool_name : t;
                      const usedFor = isObj ? t.used_for : null;
                      const priority = isObj ? t.priority : 'LOW';
                      const learnUrl = isObj ? t.where_to_learn : null;
                      return (
                        <motion.div key={i} initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{delay:i*0.08}}
                          style={{ ...C.card, marginBottom:0, display:'flex', flexDirection:'column', gap:8, borderLeft:'3px solid var(--text-warning)' }}>
                          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                            <span style={{ fontSize:14, fontWeight:600, color:'var(--text-primary)' }}>{name}</span>
                            <Badge text={priority} bg="var(--bg-warning)" fg="var(--text-warning)" />
                          </div>
                          {usedFor && <p style={{ fontSize:12, color:'var(--text-secondary)', margin:0, lineHeight:1.5 }}>💡 {usedFor}</p>}
                          {learnUrl && (
                            <a href={learnUrl.includes('http') ? learnUrl : `https://${learnUrl.match(/\(([^)]+)\)/)?.[1] || learnUrl}`}
                              target="_blank" rel="noopener noreferrer"
                              style={{ fontSize:11, color:'var(--text-info)', textDecoration:'none', display:'flex', alignItems:'center', gap:4 }}>
                              <ExternalLink size={11} /> {learnUrl.replace(/\(.*?\)/g, '').trim()}
                            </a>
                          )}
                        </motion.div>
                      );
                    })}
                  </div>
                : <div style={{ ...C.card, marginBottom:16 }}><p style={{ fontSize:12, color:'var(--text-secondary)', margin:0 }}>No nice-to-have tools identified yet.</p></div>
              }

              {/* Tip */}
              <div style={{ ...C.card, backgroundImage:'linear-gradient(135deg, rgba(133,173,255,0.08) 0%, rgba(155,255,206,0.04) 100%)', padding:'14px 18px' }}>
                <p style={{ fontSize:12, color:'var(--text-secondary)', margin:0, lineHeight:1.6 }}>
                  <strong style={{ color:'var(--text-primary)' }}>💼 Pro Tip:</strong> Mention these tools in your resume and interviews. Employers in {new Date().getFullYear()} value AI tool proficiency as a top hiring signal.
                </p>
              </div>
            </div>
          )}

          {/* TAB 4 — Learning Path (REDESIGNED) */}
          {activeTab === 'Learning Path' && (
            <div>
              {/* AI Learning Estimate Banner */}
              <div style={{ ...C.cardInfo, display:'flex', alignItems:'center', gap:12, marginTop:16 }}>
                <div style={{ width:36, height:36, borderRadius:10, background:'linear-gradient(135deg,#185FA5,#1E88E5)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, boxShadow:'0 2px 8px #185FA540' }}>
                  <Zap size={18} color="#fff" />
                </div>
                <div>
                  <p style={{ fontSize:13, fontWeight:600, margin:'0 0 2px', color:'var(--text-info)' }}>AI Learning Estimate</p>
                  <p style={{ fontSize:12, color:'var(--text-info)', margin:0, lineHeight:1.5, opacity:0.85 }}>
                    Based on your skill coverage ({coveragePct}%), reaching <strong>Green Zone</strong> will take approximately <strong>{coveragePct >= 50 ? '1-2' : coveragePct >= 25 ? '3-4' : '5-6'} months</strong> of consistent learning.
                  </p>
                </div>
              </div>

              {/* ── Recommended Skills for This Role ── */}
              {recommendedSkills.length > 0 && (
                <>
                  <SH title={`Recommended Skills for ${primaryRole}`} sub={`${recommendedSkills.filter(s=>s.is_matched).length}/${recommendedSkills.length} skills matched`} icon={<Layers size={14}/>} />
                  {/* Skill Progress by Tier */}
                  <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(150px, 1fr))', gap:8, marginBottom:12 }}>
                    {[{tier:'CRITICAL',label:'Critical',color:'#E53935'},{tier:'HIGH',label:'High',color:'#F59E0B'},{tier:'MEDIUM',label:'Medium',color:'#1D9E75'},{tier:'LOW',label:'Low',color:'#6B7280'}].map(({tier,label,color}) => {
                      const tierSkills = recommendedSkills.filter(s => s.priority?.toUpperCase() === tier);
                      if (tierSkills.length === 0) return null;
                      const tierMatched = tierSkills.filter(s => s.is_matched).length;
                      const tierPct = Math.round((tierMatched / tierSkills.length) * 100);
                      return (
                        <div key={tier} style={{ padding:'10px 12px', borderRadius:10, background:'var(--card-bg)', border:'0.5px solid var(--border)' }}>
                          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:6 }}>
                            <span style={{ fontSize:11, fontWeight:600, color, textTransform:'uppercase', letterSpacing:0.5 }}>{label}</span>
                            <span style={{ fontSize:11, color:'var(--text-secondary)' }}>{tierMatched}/{tierSkills.length}</span>
                          </div>
                          <div style={{ height:4, borderRadius:2, background:'var(--bg-secondary)', overflow:'hidden' }}>
                            <div style={{ height:'100%', borderRadius:2, background:color, width:`${tierPct}%`, transition:'width 0.5s ease' }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  {/* Individual Skill Cards */}
                  <div style={C.card}>
                    {recommendedSkills.map((sk, i) => {
                      const priorityColors = { CRITICAL:'#E53935', HIGH:'#F59E0B', MEDIUM:'#1D9E75', LOW:'#6B7280' };
                      const pColor = priorityColors[sk.priority?.toUpperCase()] || '#6B7280';
                      return (
                        <div key={i} style={{ display:'flex', alignItems:'flex-start', gap:10, padding:'10px 0', borderBottom: i < recommendedSkills.length-1 ? '0.5px solid var(--border)' : 'none' }}>
                          <div style={{ width:24, height:24, borderRadius:'50%', background: sk.is_matched ? 'var(--bg-success)' : 'var(--bg-secondary)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, marginTop:2 }}>
                            {sk.is_matched ? <CheckCircle2 size={13} color='var(--text-success)' /> : <XCircle size={13} color='var(--text-secondary)' />}
                          </div>
                          <div style={{ flex:1, minWidth:0 }}>
                            <div style={{ display:'flex', alignItems:'center', gap:6, flexWrap:'wrap' }}>
                              <span style={{ fontSize:13, fontWeight:600, color: sk.is_matched ? 'var(--text-success)' : 'var(--text-primary)' }}>{sk.skill_name}</span>
                              <span style={{ fontSize:9, padding:'1px 6px', borderRadius:4, background:pColor+'20', color:pColor, fontWeight:700, letterSpacing:0.5, textTransform:'uppercase' }}>{sk.priority}</span>
                              {sk.is_matched && <span style={{ fontSize:10, color:'var(--text-success)', fontWeight:500 }}>✓ Matched</span>}
                            </div>
                            {sk.where_to_learn && !sk.is_matched && (
                              <p style={{ fontSize:11, color:'var(--text-secondary)', margin:'3px 0 0', lineHeight:1.5 }}>
                                <span style={{ fontWeight:500, color:'var(--text-info)' }}>Where to learn:</span> {sk.where_to_learn}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}

              {/* Career Roadmap Timeline */}
              <SH title="Career Roadmap" sub={`${roadmap.length} steps to industry readiness`} icon={<Rocket size={14}/>} />
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

                  /* ── Course links per roadmap step ── */
                  const STEP_COURSES = [
                    [ // Step 1 - Foundation
                      { title:'Python for Everybody', platform:'Coursera', url:'https://www.coursera.org/specializations/python' },
                      { title:'CS50 — Intro to CS', platform:'Harvard/YouTube', url:'https://www.youtube.com/watch?v=8mAITcNt710' },
                      { title:'NPTEL — Programming in C', platform:'NPTEL IIT', url:'https://nptel.ac.in/courses/106105171' },
                    ],
                    [ // Step 2 - Core Technical
                      { title:'NPTEL — Data Structures & Algorithms', platform:'NPTEL IIT Madras', url:'https://nptel.ac.in/courses/106106127' },
                      { title:'React Full Course 2024', platform:'YouTube', url:'https://www.youtube.com/watch?v=CgkZ7MvWUAA' },
                      { title:'Machine Learning Specialization', platform:'Coursera/Stanford', url:'https://www.coursera.org/specializations/machine-learning-introduction' },
                    ],
                    [ // Step 3 - Advanced
                      { title:'NPTEL — Deep Learning', platform:'NPTEL IIT Ropar', url:'https://nptel.ac.in/courses/106106184' },
                      { title:'Full Stack Open (Helsinki)', platform:'Open Course', url:'https://fullstackopen.com/' },
                      { title:'AWS Cloud Practitioner', platform:'AWS', url:'https://aws.amazon.com/training/learn-about/cloud-practitioner/' },
                    ],
                    [ // Step 4 - Projects
                      { title:'Build 5 Projects (freeCodeCamp)', platform:'YouTube', url:'https://www.youtube.com/watch?v=pMFjJ4ENrCk' },
                      { title:'GitHub Portfolio Guide', platform:'GitHub', url:'https://docs.github.com/en/get-started/start-your-journey/setting-up-your-profile' },
                    ],
                  ];
                  const stepCourses = s.courses || s.resources || STEP_COURSES[Math.min(i, STEP_COURSES.length - 1)] || [];

                  return (
                    <div key={i} style={{ display:'flex', gap:0, position:'relative' }}>
                      {/* Timeline line */}
                      <div style={{ display:'flex', flexDirection:'column', alignItems:'center', width:32, flexShrink:0 }}>
                        <div style={{
                          width:28, height:28, borderRadius:'50%', background:st.bg, border:`2px solid ${st.border}`,
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
                        <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:3, flexWrap:'wrap' }}>
                          <p style={{ fontSize:13, fontWeight:600, margin:0, color:s.status==='locked' ? 'var(--text-secondary)' : 'var(--text-primary)' }}>{s.step||s.title||`Step ${i+1}`}</p>
                          <Badge text={st.label} bg={st.bg} fg={st.fg} />
                          {s.duration && <span style={{ fontSize:11, color:'var(--text-secondary)', display:'flex', alignItems:'center', gap:3 }}><Clock size={10}/>{s.duration}</span>}
                        </div>
                        <p style={{ fontSize:12, color:'var(--text-secondary)', margin:0, lineHeight:1.5 }}>{s.description}</p>
                        {/* Expandable skill details with where-to-learn */}
                        {s.skills && s.skills.length > 0 && (
                          <div style={{ marginTop:8, display:'flex', flexWrap:'wrap', gap:6 }}>
                            {s.skills.map((sk, j) => (
                              <div key={j} style={{ padding:'4px 10px', borderRadius:8, background:'var(--bg-secondary)', border:'0.5px solid var(--border)', fontSize:11 }}>
                                <span style={{ fontWeight:600, color:'var(--text-primary)' }}>{sk.name}</span>
                                {sk.where && <span style={{ color:'var(--text-secondary)', display:'block', marginTop:2 }}>{sk.where}</span>}
                              </div>
                            ))}
                          </div>
                        )}
                        {/* ── Course redirect links ── */}
                        {stepCourses.length > 0 && (
                          <div style={{ marginTop:10, padding:'8px 10px', borderRadius:10, background:'var(--bg-secondary)', border:'0.5px solid var(--border)' }}>
                            <p style={{ fontSize:11, fontWeight:600, color:'var(--text-secondary)', margin:'0 0 6px', textTransform:'uppercase', letterSpacing:'0.05em' }}>📚 Recommended Courses</p>
                            {stepCourses.map((course, ci) => {
                              const platformColors = { Coursera:'#0056D2', 'Coursera/Stanford':'#0056D2', edX:'#02262B', 'NPTEL IIT':'#E65100', 'NPTEL IIT Madras':'#E65100', 'NPTEL IIT Ropar':'#E65100', YouTube:'#FF0000', 'Harvard/YouTube':'#FF0000', 'Open Course':'#1D9E75', AWS:'#FF9900', GitHub:'#171515' };
                              const pCol = platformColors[course.platform] || 'var(--text-info)';
                              return (
                                <a key={ci} href={course.url} target="_blank" rel="noreferrer"
                                  style={{ display:'flex', alignItems:'center', gap:8, padding:'5px 0', textDecoration:'none', borderBottom: ci < stepCourses.length - 1 ? '0.5px solid var(--border)' : 'none' }}>
                                  <span style={{ width:20, height:20, borderRadius:5, background:pCol+'18', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                                    <BookOpen size={10} color={pCol} />
                                  </span>
                                  <span style={{ flex:1 }}>
                                    <span style={{ fontSize:12, fontWeight:500, color:'var(--text-primary)' }}>{course.title}</span>
                                    <span style={{ fontSize:10, color:pCol, marginLeft:6, fontWeight:600 }}>{course.platform}</span>
                                  </span>
                                  <ExternalLink size={12} color="var(--text-info)" />
                                </a>
                              );
                            })}
                          </div>
                        )}
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
                        <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap' }}>
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
