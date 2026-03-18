import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Target, Moon, Sun } from 'lucide-react';

const Layout = ({ children }) => {
    // Default to dark theme as requested by the user
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');

    useEffect(() => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');

    return (
        <div className="min-h-screen flex flex-col bg-background text-text-primary transition-colors duration-300">
            <nav className="sticky top-0 z-50 bg-background/90 backdrop-blur-md border-b border-surface-border">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-14 items-center">
                        <div className="flex items-center gap-3">
                            <Target className="text-primary w-5 h-5 shadow-sm" />
                            <span className="text-lg font-bold outfit tracking-tight text-text-primary">SMAART</span>
                        </div>

                        <div className="hidden md:flex items-center gap-6">
                            {[
                                { to: "/", label: "Home" },
                                { to: "/dashboard", label: "Dashboard" },
                                { to: "/passport", label: "Skills Passport" },
                                { to: "/insights", label: "Market Insights" },
                                { to: "/admin", label: "Admin" }
                            ].map(item => (
                                <NavLink
                                    key={item.to}
                                    to={item.to}
                                    className={({ isActive }) =>
                                        `text-sm font-bold transition-all ${isActive ? "text-primary border-b-2 border-primary -mb-px" : "text-text-secondary hover:text-text-primary"}`
                                    }
                                >
                                    {item.label}
                                </NavLink>
                            ))}
                        </div>

                        <div className="flex items-center gap-3">
                            {/* Theme Toggle Button */}
                            <button
                                onClick={toggleTheme}
                                className="p-2 rounded-lg bg-surface border border-surface-border text-text-secondary hover:text-text-primary hover:border-text-secondary/30 transition-all"
                                aria-label="Toggle Theme"
                                title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
                            >
                                {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
                            </button>

                            <button className="text-sm font-medium text-text-secondary hover:text-text-primary transition-all mx-2">Sign In</button>
                            <NavLink to="/onboarding" className="btn btn-primary h-8 px-4 text-xs font-bold shadow-lg shadow-primary/20">
                                Get Started
                            </NavLink>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="flex-grow w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                {children}
            </main>

            <footer className="border-t border-surface-border py-8 mt-12 bg-background/50">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-xs">
                        <div className="flex items-center gap-2 text-text-secondary">
                            <Target className="w-4 h-4" />
                            <span className="font-bold outfit tracking-tight">SMAART</span>
                            <span className="ml-2">© 2026 AI Systems. All rights reserved.</span>
                        </div>
                        <div className="flex gap-6">
                            <a href="#" className="text-text-secondary hover:text-text-primary transition-all">Privacy Policy</a>
                            <a href="#" className="text-text-secondary hover:text-text-primary transition-all">Terms of Service</a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Layout;
