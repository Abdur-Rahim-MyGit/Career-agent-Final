import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Loader2, AlertCircle } from 'lucide-react';

export default function Login() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [errorMsg, setErrorMsg] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMsg('');
        setIsSubmitting(true);

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const data = await res.json();
            
            if (res.ok && data.success) {
                localStorage.setItem('smaart_token', data.token);
                navigate('/dashboard');
            } else {
                setErrorMsg(data.message || 'Invalid credentials');
            }
        } catch (err) {
            setErrorMsg('A network error occurred. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-background py-16 px-4 selection:bg-primary/20 flex flex-col items-center justify-center">
            
            <div className="mb-8 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 mb-4">
                    <span className="text-xl font-bold text-primary">S</span>
                </div>
                <h1 className="text-3xl font-black text-text-primary tracking-tight outfit">Welcome Back</h1>
                <p className="text-sm text-text-secondary mt-2">Enter your credentials to access your dashboard.</p>
            </div>

            <div className="w-full max-w-md bg-surface border border-surface-border rounded-2xl p-8 shadow-xl">
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-xs font-bold text-text-secondary uppercase mb-2 tracking-wider">Email Address</label>
                        <input 
                            type="email" 
                            name="email" 
                            value={formData.email} 
                            onChange={handleChange} 
                            required
                            className="w-full bg-background border border-surface-border rounded-lg px-4 py-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-gray-500 font-medium text-text-primary" 
                            placeholder="your@email.com" 
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-text-secondary uppercase mb-2 tracking-wider">Password</label>
                        <input 
                            type="password" 
                            name="password" 
                            value={formData.password} 
                            onChange={handleChange} 
                            required
                            className="w-full bg-background border border-surface-border rounded-lg px-4 py-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-gray-500 font-medium text-text-primary" 
                            placeholder="••••••••" 
                        />
                    </div>

                    {errorMsg && (
                        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center gap-2 text-red-500 text-sm font-semibold">
                            <AlertCircle size={16} />
                            {errorMsg}
                        </div>
                    )}

                    <button 
                        type="submit" 
                        disabled={isSubmitting} 
                        className="w-full bg-primary text-white py-3 rounded-lg text-sm font-bold flex items-center justify-center gap-2 hover:bg-primary/90 transition-all shadow-md shadow-primary/20 disabled:opacity-70 mt-4"
                    >
                        {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : 'Sign In'}
                    </button>
                </form>

                <div className="mt-8 text-center border-t border-surface-border pt-6">
                    <p className="text-sm font-medium text-text-secondary">
                        Don't have an account?{' '}
                        <Link to="/onboarding" className="text-primary hover:text-primary/80 transition-colors font-bold">
                            Start onboarding
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
