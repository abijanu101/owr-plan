import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

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

export default function Signup() {
    const navigate = useNavigate();
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
        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email,
                    password: formData.password
                })
            });
            const data = await res.json();

            if (data.success) {
                // Account created successfully, redirect to home or dashboard
                navigate('/');
            } else {
                setError(data.message || 'Signup failed. Please try again.');
            }
        } catch (err) {
            setError('Could not reach the server. Please try again later.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-full w-full flex items-center justify-center px-4 py-8">
            <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="text-center mb-6">
                    <h1 className="text-3xl sm:text-4xl font-bold text-primary mb-2">Create Account</h1>
                    <p className="text-muted text-sm sm:text-base">Join us and start planning beautifully!</p>
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
                                placeholder="Your sweet name"
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
                                placeholder="cute_user@example.com"
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
    );
}
