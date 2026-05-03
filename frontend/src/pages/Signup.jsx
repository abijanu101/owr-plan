import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Label({ children }) {
    return <span className="text-xs font-bold tracking-widest uppercase text-muted">{children}</span>;
}

function SectionCard({ children, className = '' }) {
    return (
        <div className={`bg-[var(--bg-raised)]/60 border border-[var(--border-subtle)]/40 rounded-2xl p-6 sm:p-8 ${className}`}>
            {children}
        </div>
    );
}

function PrimaryBtn({ children, onClick, disabled, type = 'submit', className = '' }) {
    return (
        <button type={type} onClick={onClick} disabled={disabled}
            className={`w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-full font-bold transition-all cursor-pointer active:scale-95 ${disabled ? 'opacity-40 cursor-not-allowed' : 'hover:brightness-110'} bg-[var(--color-primary)] text-[var(--bg-primary)] ${className}`}>
            {children}
        </button>
    );
}

const PatternSides = () => (
    <div className="hidden lg:block absolute inset-0 z-0 pointer-events-none">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" className="absolute inset-0">
            <defs>
                <pattern id="waves" width="240" height="240" patternUnits="userSpaceOnUse">
                    <path d="M0 60 C 60 120, 120 0, 180 60 S 240 120, 240 60" fill="none" stroke="var(--color-primary)" strokeWidth="1.5" opacity="0.4" />
                    <path d="M0 180 C 60 240, 120 120, 180 180 S 240 240, 240 180" fill="none" stroke="var(--text-neutral)" strokeWidth="1" opacity="0.3" />
                    <path d="M0 120 C 60 180, 120 60, 180 120 S 240 180, 240 120" fill="none" stroke="var(--bg-accent)" strokeWidth="2.5" opacity="0.6" />
                    <circle cx="180" cy="60" r="4" fill="var(--color-primary)" opacity="0.6" />
                    <circle cx="60" cy="180" r="3" fill="var(--text-neutral)" opacity="0.5" />
                    <circle cx="120" cy="120" r="2" fill="var(--color-primary)" opacity="0.3" />
                </pattern>
                <radialGradient id="vignette" cx="50%" cy="50%" r="60%">
                    <stop offset="30%" stopColor="var(--bg-primary)" stopOpacity="1" />
                    <stop offset="100%" stopColor="var(--bg-primary)" stopOpacity="0" />
                </radialGradient>
            </defs>
            <rect width="100%" height="100%" fill="url(#waves)" />
            {/* Overlay that hides the pattern in the center and reveals it on the edges */}
            <rect width="100%" height="100%" fill="url(#vignette)" />
        </svg>
        
        {/* Animated ambient glow behind the form */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[60vw] md:w-[40vw] md:h-[40vw] bg-[var(--color-primary)]/10 rounded-full blur-[100px] pointer-events-none z-0 animate-pulse" style={{ animationDuration: '6s' }} />
    </div>
);

export default function Signup() {
    const navigate = useNavigate();
    const { signup } = useAuth();
    const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
            setError('Please fill out all fields.');
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        setIsLoading(true);
        const result = await signup(formData.name, formData.email, formData.password);

        if (result.success) {
            navigate('/dashboard');
        } else {
            setError(result.message);
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-full w-full relative flex items-center justify-center overflow-hidden bg-[var(--bg-primary)]">
            <PatternSides />
            <div className="relative z-10 w-full max-w-md px-4 sm:px-6 py-8">
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="text-center mb-6">
                        <h1 className="text-3xl sm:text-4xl font-bold text-primary mb-2">Create Account</h1>
                        <p className="text-muted text-sm sm:text-base">Join us and start planning!</p>
                    </div>

                    <SectionCard>
                        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                            {error && (
                                <div className="bg-red-900/30 border border-red-500/40 rounded-xl px-4 py-3 text-sm text-red-300 text-center animate-in fade-in">
                                    {error}
                                </div>
                            )}

                            <div className="flex flex-col gap-1.5">
                                <Label>Full Name</Label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="your name"
                                    className="w-full bg-transparent text-lg font-bold text-neutral placeholder-[var(--text-muted)]/40 outline-none border-b-2 border-[var(--border-subtle)]/40 focus:border-[var(--color-primary)]/60 pb-2 transition-all"
                                />
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <Label>Email</Label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="user@example.com"
                                    className="w-full bg-transparent text-lg font-bold text-neutral placeholder-[var(--text-muted)]/40 outline-none border-b-2 border-[var(--border-subtle)]/40 focus:border-[var(--color-primary)]/60 pb-2 transition-all"
                                />
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <Label>Password</Label>
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="••••••••"
                                    className="w-full bg-transparent text-lg font-bold tracking-widest text-neutral placeholder-[var(--text-muted)]/40 outline-none border-b-2 border-[var(--border-subtle)]/40 focus:border-[var(--color-primary)]/60 pb-2 transition-all"
                                />
                            </div>

                            <div className="flex flex-col gap-1.5 mb-2">
                                <Label>Confirm Password</Label>
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    placeholder="••••••••"
                                    className="w-full bg-transparent text-lg font-bold tracking-widest text-neutral placeholder-[var(--text-muted)]/40 outline-none border-b-2 border-[var(--border-subtle)]/40 focus:border-[var(--color-primary)]/60 pb-2 transition-all"
                                />
                            </div>

                            <PrimaryBtn disabled={isLoading} className="mt-2">
                                {isLoading ? '⏳ Signing up...' : 'Sign Up ✦'}
                            </PrimaryBtn>

                            <p className="text-center text-sm mt-3 text-muted font-bold">
                                Already have an account?{' '}
                                <Link to="/login" className="text-primary hover:text-white transition-colors">
                                    Login here
                                </Link>
                            </p>
                        </form>
                    </SectionCard>
                </div>
            </div>
        </div>
    );
}
