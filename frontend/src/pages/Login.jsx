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

export default function Login() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (!formData.email || !formData.password) {
            setError('Please enter both email and password.');
            return;
        }

        setIsLoading(true);
        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const data = await res.json();

            if (data.success) {
                // You could set AuthContext here, or just redirect
                navigate('/');
            } else {
                setError(data.message || 'Login failed. Please check your credentials.');
            }
        } catch (err) {
            setError('Could not reach the server. Please try again later.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-full w-full flex items-center justify-center px-4 py-12">
            <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="text-center mb-8">
                    <h1 className="text-3xl sm:text-4xl font-bold text-primary mb-2">Welcome Back</h1>
                    <p className="text-muted text-sm sm:text-base">Login to pick up where you left off!</p>
                </div>

                <SectionCard>
                    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                        {error && (
                            <div className="bg-red-900/30 border border-red-500/40 rounded-xl px-4 py-3 text-sm text-red-300 text-center animate-in fade-in">
                                {error}
                            </div>
                        )}

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

                        <div className="flex flex-col gap-1.5 mb-2">
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

                        <PrimaryBtn disabled={isLoading}>
                            {isLoading ? '⏳ Logging in...' : 'Login ✦'}
                        </PrimaryBtn>

                        <p className="text-center text-sm mt-4 text-muted font-bold">
                            Don't have an account?{' '}
                            <Link to="/signup" className="text-primary hover:text-white transition-colors">
                                Sign up here
                            </Link>
                        </p>
                    </form>
                </SectionCard>
            </div>
        </div>
    );
}
