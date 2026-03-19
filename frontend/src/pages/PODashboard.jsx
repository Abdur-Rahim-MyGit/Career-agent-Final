import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Loader2, Users, AlertTriangle, Target, CheckCircle2, AlertCircle, Clock } from 'lucide-react';

const PODashboard = () => {
    const { collegeCode: urlCollegeCode } = useParams();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [data, setData] = useState(null);

    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                const code = urlCollegeCode || localStorage.getItem('smaart_college_code') || 'DEFAULT_CODE';
                const res = await fetch(`/api/po/${code}/dashboard`);
                const result = await res.json();
                if (result.success) {
                    setData(result.data);
                } else {
                    setError(result.message || 'Failed to load dashboard data');
                }
            } catch (err) {
                setError('An error occurred while fetching data');
            } finally {
                setLoading(false);
            }
        };
        fetchDashboard();
    }, [urlCollegeCode]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
                <Loader2 className="animate-spin text-primary" size={24} />
                <p className="text-sm font-bold text-text-secondary tracking-widest uppercase">Loading PO Dashboard...</p>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
                <AlertCircle className="text-red-500" size={32} />
                <p className="text-sm font-medium text-text-primary text-center">
                    {error || "Could not load dashboard data."}
                </p>
            </div>
        );
    }

    const { totalStudents = 0, zones = { Green: 0, Amber: 0, Red: 0 }, roles = [], students = [] } = data;
    const { Green = 0, Amber = 0, Red = 0 } = zones;
    const totalZones = Green + Amber + Red || 1; // avoid div by 0

    const greenPct = ((Green / totalZones) * 100).toFixed(1);
    const amberPct = ((Amber / totalZones) * 100).toFixed(1);
    const redPct = ((Red / totalZones) * 100).toFixed(1);

    // Get top 5 roles
    // Assume roles is either an object { roleName: count } or array [{role, count}]
    let topRoles = [];
    if (Array.isArray(roles)) {
        topRoles = [...roles].sort((a,b) => (b.count || b.value || 0) - (a.count || a.value || 0)).slice(0, 5);
    } else {
        topRoles = Object.entries(roles).map(([role, count]) => ({ role, count })).sort((a,b) => b.count - a.count).slice(0, 5);
    }
    const maxRoleCount = topRoles.length > 0 ? (topRoles[0].count || topRoles[0].value) : 1;

    // Red zone students
    const redStudents = students.filter(s => s.zone === 'Red' || s.employer_zone === 'Red' || s.primaryZone?.employer_zone === 'Red' || s.zones === 'Red');
    // Sort by most recently active LAST (longest inactive FIRST)
    // assuming lastActive is ISO string or timestamp
    redStudents.sort((a, b) => {
        const timeA = new Date(a.lastActive || 0).getTime();
        const timeB = new Date(b.lastActive || 0).getTime();
        return timeA - timeB; // ascending gives oldest dates first
    });

    const displayStudents = redStudents.slice(0, 10);
    const remainingStudents = redStudents.length - displayStudents.length;

    return (
        <div className="max-w-6xl mx-auto py-10 px-4 min-h-screen">
            {/* Header */}
            <div className="mb-10 border-b border-surface-border pb-6">
                <div className="flex items-center gap-2 mb-2">
                    <Target className="text-primary" size={24} />
                    <h1 className="text-xl font-black text-text-primary tracking-tight uppercase">Placement Officer Dashboard</h1>
                </div>
                <h2 className="text-3xl font-black text-text-primary mb-2">
                    {data.collegeName || "Sri Ramakrishna College of Arts and Science"}
                </h2>
                <div className="text-sm font-medium text-text-secondary flex gap-4">
                    <span>Degrees: {data.degrees?.join(', ') || 'B.Sc CS, BCA, IT'}</span>
                    <span>•</span>
                    <span>Batches: {data.batches?.join(', ') || '2023-2026'}</span>
                </div>
            </div>

            {/* Metrics Row */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-10">
                <div className="bg-surface border border-surface-border p-6 rounded-xl shadow-sm flex flex-col justify-center">
                    <p className="text-xs font-bold text-text-secondary uppercase tracking-widest mb-1">Total Students</p>
                    <h3 className="text-3xl font-black text-text-primary flex items-center gap-2">
                        <Users size={24} className="text-primary" /> {totalStudents}
                    </h3>
                </div>
                <div className="bg-green-50 border border-green-200 p-6 rounded-xl shadow-sm flex flex-col justify-center">
                    <p className="text-xs font-bold text-green-700 uppercase tracking-widest mb-1">Green Zone</p>
                    <h3 className="text-3xl font-black text-green-700">{Green}</h3>
                </div>
                <div className="bg-amber-50 border border-amber-200 p-6 rounded-xl shadow-sm flex flex-col justify-center">
                    <p className="text-xs font-bold text-amber-700 uppercase tracking-widest mb-1">Amber Zone</p>
                    <h3 className="text-3xl font-black text-amber-700">{Amber}</h3>
                </div>
                <div className="bg-red-50 border border-red-200 p-6 rounded-xl shadow-sm flex flex-col justify-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 bg-red-600 text-white text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-bl-lg">
                        Need Attention
                    </div>
                    <p className="text-xs font-bold text-red-700 uppercase tracking-widest mb-1">Red Zone</p>
                    <h3 className="text-3xl font-black text-red-700">{Red}</h3>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
                {/* Engagement Distribution */}
                <div className="bg-surface border border-surface-border p-6 rounded-xl shadow-sm flex flex-col justify-center">
                    <h4 className="text-sm font-bold text-text-primary mb-6 flex items-center gap-2">
                        <CheckCircle2 size={16} className="text-primary" /> Engagement Distribution
                    </h4>
                    
                    <div className="flex h-12 w-full rounded-lg overflow-hidden mb-4 shadow-inner border border-black/5">
                        <div className="bg-green-500 h-full flex items-center justify-center text-white font-bold text-xs" style={{ width: `${greenPct}%` }}>
                            {greenPct > 10 && `${greenPct}%`}
                        </div>
                        <div className="bg-amber-500 h-full flex items-center justify-center text-white font-bold text-xs" style={{ width: `${amberPct}%` }}>
                            {amberPct > 10 && `${amberPct}%`}
                        </div>
                        <div className="bg-red-500 h-full flex items-center justify-center text-white font-bold text-xs" style={{ width: `${redPct}%` }}>
                            {redPct > 10 && `${redPct}%`}
                        </div>
                    </div>
                    
                    <div className="flex justify-between items-center text-xs font-semibold text-text-secondary">
                        <div className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-green-500"></span> Green ({Green})</div>
                        <div className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-amber-500"></span> Amber ({Amber})</div>
                        <div className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-red-500"></span> Red ({Red})</div>
                    </div>
                </div>

                {/* Direction Distribution */}
                <div className="bg-surface border border-surface-border p-6 rounded-xl shadow-sm">
                    <h4 className="text-sm font-bold text-text-primary mb-6 flex items-center gap-2">
                        <Target size={16} className="text-primary" /> Top 5 Job Directions
                    </h4>
                    <div className="space-y-4">
                        {topRoles.length === 0 ? (
                            <p className="text-sm text-text-secondary italic">No direction data available</p>
                        ) : (
                            topRoles.map((r, i) => {
                                const wPct = (((r.count || r.value) / maxRoleCount) * 100).toFixed(1);
                                return (
                                    <div key={i} className="flex flex-col gap-1">
                                        <div className="flex justify-between text-xs font-bold">
                                            <span className="text-text-primary">{r.role}</span>
                                            <span className="text-text-secondary">{r.count || r.value}</span>
                                        </div>
                                        <div className="h-2 w-full bg-surface-hover rounded-full overflow-hidden">
                                            <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${wPct}%` }}></div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>

            {/* Students Needing Attention */}
            <div className="mb-10">
                <h4 className="text-base font-bold text-text-primary mb-4 flex items-center gap-2">
                    <AlertTriangle size={18} className="text-red-500" /> Students Needing Attention
                </h4>
                <div className="bg-surface border border-surface-border rounded-xl shadow-sm overflow-hidden">
                    {displayStudents.length === 0 ? (
                        <div className="p-8 text-center text-sm text-text-secondary font-medium">
                            No students currently in the Red zone. Great job!
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-surface-hover border-b border-surface-border">
                                        <th className="p-4 text-xs font-bold text-text-secondary uppercase tracking-widest whitespace-nowrap">Name</th>
                                        <th className="p-4 text-xs font-bold text-text-secondary uppercase tracking-widest whitespace-nowrap">Direction</th>
                                        <th className="p-4 text-xs font-bold text-text-secondary uppercase tracking-widest whitespace-nowrap">Last Active</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {displayStudents.map((s, i) => (
                                        <tr key={i} className="border-b border-surface-border last:border-0 hover:bg-red-50/30 transition-colors group">
                                            <td className="p-4">
                                                <button 
                                                    onClick={() => console.log('View student:', s)}
                                                    className="text-sm font-bold text-text-primary group-hover:text-primary transition-colors text-left"
                                                >
                                                    {s.name || s.personalDetails?.name || 'Unknown Student'}
                                                </button>
                                            </td>
                                            <td className="p-4 text-sm font-medium text-text-secondary">
                                                {s.direction || s.preferences?.primary?.jobRole || 'Undeclared'}
                                            </td>
                                            <td className="p-4 text-sm font-medium text-text-secondary flex items-center gap-1.5 whitespace-nowrap">
                                                <Clock size={14} className="opacity-50" />
                                                {s.lastActive ? new Date(s.lastActive).toLocaleDateString() : 'Never'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {remainingStudents > 0 && (
                                <div className="p-4 border-t border-surface-border bg-surface-hover/50 text-center">
                                    <button className="text-xs font-bold text-text-secondary uppercase tracking-widest hover:text-text-primary">
                                        + {remainingStudents} more students
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Footer Note */}
            <div className="mt-16 pt-8 border-t border-surface-border text-center flex flex-col gap-2 pb-10">
                <p className="text-xs font-bold text-text-secondary uppercase tracking-widest">
                    All data filtered to your college only. Individual student details are private.
                </p>
                <p className="text-xs font-semibold text-text-secondary opacity-70">
                    Engagement indicators are internal tools to identify students needing support.
                </p>
            </div>
        </div>
    );
};

export default PODashboard;
