import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

export default function Register() {
    return (
        <div className="min-h-screen bg-background py-16 px-4 selection:bg-primary/20 flex flex-col items-center justify-center">
            
            <div className="mb-8 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 mb-4">
                    <span className="text-xl font-bold text-primary">S</span>
                </div>
                <h1 className="text-3xl font-black text-text-primary tracking-tight outfit">Create your SMAART account</h1>
                <p className="text-sm text-text-secondary mt-2 max-w-sm mx-auto">
                    Your account is created when you complete the onboarding form.
                </p>
            </div>

            <div className="w-full max-w-md bg-surface border border-surface-border rounded-2xl p-8 shadow-xl text-center flex flex-col items-center">
                
                <div className="w-16 h-16 rounded-full bg-surface-hover border border-surface-border flex items-center justify-center mb-6">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                        <div className="w-4 h-4 rounded-full bg-primary animate-pulse" />
                    </div>
                </div>

                <h2 className="text-lg font-bold text-text-primary mb-2">Ready to begin?</h2>
                <p className="text-sm text-text-secondary mb-8 leading-relaxed">
                    We'll guide you through a 5-step process to capture your academic baseline, career interests, and verified skills.
                </p>

                <Link 
                    to="/onboarding"
                    className="w-full bg-primary text-white py-3.5 rounded-lg text-sm font-bold flex items-center justify-center gap-2 hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
                >
                    Start onboarding <ChevronRight size={18} />
                </Link>

                <div className="mt-8 pt-6 border-t border-surface-border w-full">
                    <p className="text-sm font-medium text-text-secondary">
                        Already have an account?{' '}
                        <Link to="/login" className="text-primary hover:text-primary/80 transition-colors font-bold">
                            Login
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
