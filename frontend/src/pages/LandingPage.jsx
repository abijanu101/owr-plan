import { Link } from 'react-router-dom';
import planPreview from '../assets/plan_preview.png';
import resultsPreview from '../assets/results_preview.png';
import Button from '../components/UI/Button';

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-default overflow-x-hidden">
            {/* Hero Section */}
            <section className="relative pt-20 pb-32 px-6 overflow-hidden">
                {/* Background Patterns */}
                <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                    <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                        <defs>
                            <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                                <path d="M 10 0 L 0 0 0 10" fill="none" stroke="var(--color-primary)" strokeWidth="0.5" />
                            </pattern>
                        </defs>
                        <rect width="100" height="100" fill="url(#grid)" />
                    </svg>
                </div>

                <div className="max-w-6xl mx-auto text-center relative z-10">
                    <h1 className="text-6xl md:text-8xl font-black mb-6 tracking-tighter animate-fade-in">
                        <span className="text-primary italic">Plan</span> Together. <br />
                        <span className="text-neutral">Stress</span> Less.
                    </h1>
                    <p className="text-xl md:text-2xl text-neutral max-w-2xl mx-auto mb-12 opacity-80 leading-relaxed">
                        OwrPlan helps groups coordinate schedules, manage activities, and settle expenses in one unified experience.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                        <Link to="/signup">
                            <Button className="px-10 py-5 text-xl">
                                Get Started Free
                            </Button>
                        </Link>
                        <Link to="/login">
                            <Button variant="secondary" className="px-10 py-5 text-xl border-2 border-primary/30">
                                Sign In
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Floating Previews */}
                <div className="mt-24 relative max-w-5xl mx-auto">
                    <div className="absolute -top-12 -left-12 w-64 h-64 bg-primary/20 rounded-full blur-[100px]" />
                    <div className="absolute -bottom-12 -right-12 w-64 h-64 bg-accent/30 rounded-full blur-[100px]" />

                    <div className="relative grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                        <div className="group relative rounded-2xl overflow-hidden border border-primary/20 shadow-2xl transition-transform hover:-translate-y-2">
                            <img src={planPreview} alt="Plan Interface" className="w-full h-auto opacity-90 group-hover:opacity-100 transition-opacity" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6">
                                <p className="text-neutral font-bold">Sophisticated constraint-based planning</p>
                            </div>
                        </div>
                        <div className="group relative rounded-2xl overflow-hidden border border-primary/20 shadow-2xl transition-transform hover:-translate-y-2 md:translate-y-12">
                            <img src={resultsPreview} alt="Results Interface" className="w-full h-auto opacity-90 group-hover:opacity-100 transition-opacity" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6">
                                <p className="text-neutral font-bold">Optimized results in seconds</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-24 px-6 bg-accent/20">
                <div className="max-w-6xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                        <div className="p-8 rounded-3xl bg-raised border border-primary/10 hover:border-primary/30 transition-colors">
                            <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-6">
                                <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h3 className="text-2xl font-bold text-neutral mb-4">Availability Sync</h3>
                            <p className="text-neutral opacity-70">Find the perfect time for everyone without the endless "when are you free?" messages.</p>
                        </div>

                        <div className="p-8 rounded-3xl bg-raised border border-primary/10 hover:border-primary/30 transition-colors">
                            <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-6">
                                <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                            </div>
                            <h3 className="text-2xl font-bold text-neutral mb-4">Shared Ledgers</h3>
                            <p className="text-neutral opacity-70">Track group expenses and settle up fairly. No more complicated spreadsheets.</p>
                        </div>

                        <div className="p-8 rounded-3xl bg-raised border border-primary/10 hover:border-primary/30 transition-colors">
                            <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-6">
                                <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                            </div>
                            <h3 className="text-2xl font-bold text-neutral mb-4">Group Management</h3>
                            <p className="text-neutral opacity-70">Organize your social circles into groups for quick and easy planning sessions.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 border-t border-primary/10 text-center">
                <p className="text-neutral opacity-50 font-bold">© 2026 OwrPlan ✦ Crafted for connection.</p>
            </footer>
        </div>
    );
}
