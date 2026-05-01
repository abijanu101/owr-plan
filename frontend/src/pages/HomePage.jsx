import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function HomePage() {
    const navigate = useNavigate();
    const { user } = useAuth();

    return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
            <div className="text-center">
                <h1 className="text-5xl font-bold mb-4 text-gray-800">Welcome to OwrPlan</h1>
                <p className="text-xl text-gray-600 mb-8">Organize your activities and manage your groups effortlessly</p>
                {user && <p className="text-lg text-gray-500 mb-8">Hello, <span className="font-semibold">{user.name}</span>!</p>}
                
                <button
                    onClick={() => navigate('/entities')}
                    className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-8 rounded-lg text-lg transition"
                >
                    View Entities
                </button>
            </div>
        </div>
    );
}