import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    // On mount, check if there's an active session (cookie-based)
    useEffect(() => {
        const checkSession = async () => {
            try {
                const res = await fetch('/api/auth/me', { credentials: 'include' });
                if (res.ok) {
                    const data = await res.json();
                    if (data.success) setUser(data.data.user);
                }
            } catch {
                // No active session
            } finally {
                setIsLoading(false);
            }
        };
        checkSession();
    }, []);

    const login = async (email, password) => {
        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
                credentials: 'include'
            });
            const data = await res.json();
            if (data.success) {
                setUser(data.data.user);
                return { success: true };
            }
            return { success: false, message: data.message || 'Login failed' };
        } catch (err) {
            return { success: false, message: 'Could not reach the server' };
        }
    };

    const signup = async (name, email, password) => {
        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password }),
                credentials: 'include'
            });
            const data = await res.json();
            if (data.success) {
                setUser(data.data.user);
                return { success: true };
            }
            return { success: false, message: data.message || 'Signup failed' };
        } catch (err) {
            return { success: false, message: 'Could not reach the server' };
        }
    };

    const logout = async () => {
        try {
            await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
        } catch { /* ignore */ }
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, isLoading, login, signup, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
