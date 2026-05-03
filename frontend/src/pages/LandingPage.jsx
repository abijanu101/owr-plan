import { Link } from 'react-router-dom';
import laptopPlan from '../assets/laptop_simple_plan.png';
import mobilePlan from '../assets/mobile_simple_plan.png';
import laptopResults from '../assets/laptop_plan_results.png';

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-[var(--bg-primary)] overflow-hidden selection:bg-[var(--color-primary)] selection:text-[var(--bg-primary)]">
            {/* --- Floating Branding & Auth Buttons --- */}
            <div className="absolute top-0 left-0 w-full p-6 md:p-10 flex items-center justify-between z-50 pointer-events-none">
                <div className="pointer-events-auto flex items-center gap-3">
                    <img src="/favicon.svg" alt="OwrPlan Logo" className="w-8 h-8 md:w-10 md:h-10 animate-fade-in" />
                    <span className="text-xl md:text-2xl font-black tracking-tight text-[var(--color-primary)] opacity-90 drop-shadow-sm">OwrPlan</span>
                </div>
                <div className="pointer-events-auto flex items-center gap-4">
                    <Link to="/login" className="text-sm md:text-base font-bold text-[var(--text-muted)] hover:text-[var(--text-neutral)] transition-colors px-2">
                        Log In
                    </Link>
                    <Link to="/signup" className="text-sm md:text-base font-bold text-[var(--bg-primary)] bg-[var(--color-primary)] px-5 py-2 md:px-6 md:py-2.5 rounded-full hover:brightness-110 hover:shadow-[0_0_20px_rgba(255,163,132,0.3)] transition-all active:scale-95">
                        Sign Up
                    </Link>
                </div>
            </div>

            {/* --- Animated Ambient Background --- */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-[var(--color-primary)]/20 rounded-full blur-[120px] mix-blend-screen animate-pulse" style={{ animationDuration: '8s' }} />
                <div className="absolute bottom-[-20%] right-[-10%] w-[60vw] h-[60vw] bg-purple-900/20 rounded-full blur-[150px] mix-blend-screen animate-pulse" style={{ animationDuration: '12s', animationDelay: '2s' }} />
                
                {/* Subtle Grid Pattern */}
                <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(var(--text-neutral) 1px, transparent 1px), linear-gradient(90deg, var(--text-neutral) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
            </div>



            {/* --- Hero Section --- */}
            <main className="relative z-10 flex flex-col items-center pt-16 md:pt-24 px-4 text-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--bg-raised)] border border-[var(--border-subtle)] mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <span className="w-2 h-2 rounded-full bg-[var(--color-primary)] animate-pulse" />
                    <span className="text-xs font-bold uppercase tracking-widest text-[var(--text-muted)]">Now with AI Scheduling</span>
                </div>

                <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter mb-6 leading-[1.1] animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100">
                    <span className="text-[var(--text-neutral)]">Plan</span>{' '}
                    <span className="italic text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-primary)] to-orange-400">Together.</span><br/>
                    <span className="text-[var(--text-neutral)]">Stress</span>{' '}
                    <span className="italic text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-primary)] to-orange-400">Less.</span>
                </h1>

                <p className="max-w-2xl text-lg md:text-2xl text-[var(--text-muted)] mb-10 leading-relaxed font-medium animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
                    The smartest way to coordinate group schedules, share ledgers, and manage activities—all in one beautifully simple place.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
                    <Link to="/signup" className="group relative inline-flex items-center justify-center px-8 py-4 font-bold text-[var(--bg-primary)] bg-[var(--color-primary)] rounded-full overflow-hidden transition-transform active:scale-95">
                        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
                        <span className="relative z-10 flex items-center gap-2">
                            Get Started Free 
                            <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
                        </span>
                    </Link>
                    <Link to="/login" className="inline-flex items-center justify-center px-8 py-4 font-bold text-[var(--text-neutral)] bg-transparent border-2 border-[var(--border-subtle)] hover:border-[var(--color-primary)]/50 hover:bg-white/5 rounded-full transition-all active:scale-95">
                        See How It Works
                    </Link>
                </div>

                {/* --- Gorgeous Mockup Showcase --- */}
                <div className="relative mt-20 w-full max-w-6xl mx-auto px-4 sm:px-10 pb-32 animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-500">
                    {/* Main Laptop Image */}
                    <div className="relative z-10 rounded-2xl md:rounded-[2rem] overflow-hidden border border-[var(--border-subtle)]/50 shadow-[0_20px_60px_-15px_rgba(255,163,132,0.2)] bg-[var(--bg-raised)]">
                        <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-primary)]/80 via-transparent to-transparent z-10 pointer-events-none" />
                        <img 
                            src={laptopPlan} 
                            alt="OwrPlan Desktop Interface" 
                            className="w-full h-auto object-cover opacity-90 hover:opacity-100 transition-opacity duration-500"
                        />
                        {/* Overlay text in the gradient */}
                        <div className="absolute bottom-6 left-8 right-8 z-20 flex justify-between items-end">
                            <div>
                                <h3 className="text-2xl font-bold text-[var(--text-neutral)]">Powerful Scheduling</h3>
                                <p className="text-[var(--text-muted)] text-sm">Constraint-based auto generation</p>
                            </div>
                        </div>
                    </div>

                    {/* Overlapping Mobile Image - Floating Right */}
                    <div className="absolute -bottom-10 -right-4 sm:-right-8 md:right-8 z-20 w-48 sm:w-64 md:w-80 rounded-3xl overflow-hidden border-4 border-[var(--bg-primary)] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.8)] rotate-2 hover:rotate-0 transition-transform duration-500">
                        <img 
                            src={mobilePlan} 
                            alt="OwrPlan Mobile Interface" 
                            className="w-full h-auto object-cover"
                        />
                    </div>
                    
                    {/* Overlapping Results Image - Floating Left */}
                    <div className="absolute top-1/2 -left-4 sm:-left-8 md:left-0 -translate-y-1/2 z-0 w-56 sm:w-72 md:w-96 rounded-2xl overflow-hidden border border-[var(--border-subtle)]/50 shadow-[0_20px_50px_-10px_rgba(0,0,0,0.5)] -rotate-3 hover:rotate-0 transition-transform duration-500 opacity-60 hover:opacity-100 hover:z-30">
                        <img 
                            src={laptopResults} 
                            alt="OwrPlan Results" 
                            className="w-full h-auto object-cover"
                        />
                    </div>
                </div>
            </main>

            {/* --- Features Grid (Glassmorphism) --- */}
            <section className="relative z-10 py-32 px-6 bg-[var(--bg-primary)]">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-20">
                        <h2 className="text-4xl md:text-5xl font-black text-[var(--text-neutral)] mb-6">Everything you need to <span className="text-[var(--color-primary)]">unite</span> your group.</h2>
                        <p className="text-xl text-[var(--text-muted)] max-w-2xl mx-auto">Stop herding cats. Start enjoying your time together.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Feature 1 */}
                        <div className="relative group p-8 rounded-[2rem] bg-white/[0.02] border border-white/5 backdrop-blur-xl hover:bg-white/[0.04] hover:border-[var(--color-primary)]/30 transition-all duration-300">
                            <div className="absolute inset-0 bg-gradient-to-b from-[var(--color-primary)]/5 to-transparent rounded-[2rem] opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="relative z-10">
                                <div className="w-16 h-16 rounded-2xl bg-[var(--bg-raised)] border border-[var(--border-subtle)] flex items-center justify-center mb-6 text-[var(--color-primary)] group-hover:scale-110 transition-transform duration-300 shadow-[0_0_20px_rgba(255,163,132,0.1)]">
                                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                </div>
                                <h3 className="text-2xl font-bold text-[var(--text-neutral)] mb-3">AI Scheduling</h3>
                                <p className="text-[var(--text-muted)] leading-relaxed">Paste anyone's messy availability text, and our AI instantly parses it into your group's structured timeline.</p>
                            </div>
                        </div>

                        {/* Feature 2 */}
                        <div className="relative group p-8 rounded-[2rem] bg-white/[0.02] border border-white/5 backdrop-blur-xl hover:bg-white/[0.04] hover:border-[var(--color-primary)]/30 transition-all duration-300 md:-translate-y-8">
                            <div className="absolute inset-0 bg-gradient-to-b from-[var(--color-primary)]/5 to-transparent rounded-[2rem] opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="relative z-10">
                                <div className="w-16 h-16 rounded-2xl bg-[var(--bg-raised)] border border-[var(--border-subtle)] flex items-center justify-center mb-6 text-[var(--color-primary)] group-hover:scale-110 transition-transform duration-300 shadow-[0_0_20px_rgba(255,163,132,0.1)]">
                                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                                </div>
                                <h3 className="text-2xl font-bold text-[var(--text-neutral)] mb-3">Shared Ledgers</h3>
                                <p className="text-[var(--text-muted)] leading-relaxed">Track who paid for what and let OwrPlan calculate the simplest way to settle up the balances.</p>
                            </div>
                        </div>

                        {/* Feature 3 */}
                        <div className="relative group p-8 rounded-[2rem] bg-white/[0.02] border border-white/5 backdrop-blur-xl hover:bg-white/[0.04] hover:border-[var(--color-primary)]/30 transition-all duration-300">
                            <div className="absolute inset-0 bg-gradient-to-b from-[var(--color-primary)]/5 to-transparent rounded-[2rem] opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="relative z-10">
                                <div className="w-16 h-16 rounded-2xl bg-[var(--bg-raised)] border border-[var(--border-subtle)] flex items-center justify-center mb-6 text-[var(--color-primary)] group-hover:scale-110 transition-transform duration-300 shadow-[0_0_20px_rgba(255,163,132,0.1)]">
                                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                                </div>
                                <h3 className="text-2xl font-bold text-[var(--text-neutral)] mb-3">Instant Consensus</h3>
                                <p className="text-[var(--text-muted)] leading-relaxed">No more infinite scrolling in group chats. Propose times, set constraints, and let the app find the perfect slot.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- CTA Section --- */}
            <section className="relative z-10 py-24 px-6 border-t border-[var(--border-subtle)]/30">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-4xl font-black text-[var(--text-neutral)] mb-8">Ready to bring the group chat to life?</h2>
                    <Link to="/signup" className="inline-flex items-center justify-center px-10 py-5 font-black text-xl text-[var(--bg-primary)] bg-[var(--color-primary)] rounded-full hover:brightness-110 hover:shadow-[0_0_30px_rgba(255,163,132,0.4)] transition-all active:scale-95">
                        Start Planning Now ✦
                    </Link>
                </div>
            </section>


        </div>
    );
}
