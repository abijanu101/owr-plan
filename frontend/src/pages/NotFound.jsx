import { Link } from 'react-router-dom';

export default function NotFound() {
    return (
        <div className="min-h-[80vh] flex flex-col items-center justify-center text-center px-6">
            <h1 className="text-9xl font-black text-primary mb-4 opacity-20">404</h1>
            <h2 className="text-4xl font-bold text-neutral mb-6">Page Not Found</h2>
            <p className="text-xl text-neutral max-w-md mb-12">
                Oops! The page you're looking for has vanished into the void. 
                Let's get you back on track.
            </p>
            <Link 
                to="/" 
                className="px-8 py-4 bg-primary text-[var(--bg-primary)] font-bold rounded-full hover:scale-105 transition-all shadow-lg shadow-primary/20"
            >
                Return Home
            </Link>
        </div>
    );
}
