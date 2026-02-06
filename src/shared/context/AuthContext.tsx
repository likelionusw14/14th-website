import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';

interface User {
    id: number;
    studentId: string;
    name: string | null;
    role: 'GUEST' | 'BABY_LION' | 'ADMIN';
    major?: string | null;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (token: string, user: User) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 프로덕션에서는 nginx 프록시를 통해 상대 경로 사용, 개발 환경에서는 localhost 사용
// VITE_API_URL이 명시적으로 설정되지 않은 경우:
// - 개발 환경: http://localhost:4000 사용
// - 프로덕션: 빈 문자열로 상대 경로 사용 (nginx 프록시 활용)
export const API_BASE_URL = import.meta.env.VITE_API_URL || 
    (import.meta.env.MODE === 'development' ? 'http://localhost:4000' : '');

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
    const [isLoading, setIsLoading] = useState(true);

    const logout = useCallback(() => {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
    }, []);

    useEffect(() => {
        const initAuth = async () => {
            // #region agent log
            fetch('http://127.0.0.1:7243/ingest/6b883636-1481-4250-a61b-b80d8e085cc6',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AuthContext.tsx:30',message:'initAuth started',data:{hasToken:!!localStorage.getItem('token')},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
            // #endregion
            const storedToken = localStorage.getItem('token');
            if (storedToken) {
                try {
                    // #region agent log
                    fetch('http://127.0.0.1:7243/ingest/6b883636-1481-4250-a61b-b80d8e085cc6',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AuthContext.tsx:35',message:'Fetching /api/auth/me',data:{tokenLength:storedToken.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
                    // #endregion
                    // Verify token validity with backend
                    const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
                        headers: { Authorization: `Bearer ${storedToken}` }
                    });
                    // #region agent log
                    fetch('http://127.0.0.1:7243/ingest/6b883636-1481-4250-a61b-b80d8e085cc6',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AuthContext.tsx:40',message:'Response received',data:{status:response.status,ok:response.ok},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
                    // #endregion
                    const result = await response.json();
                    // #region agent log
                    fetch('http://127.0.0.1:7243/ingest/6b883636-1481-4250-a61b-b80d8e085cc6',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AuthContext.tsx:43',message:'Result parsed',data:{success:result.success,hasUser:!!result.user},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
                    // #endregion
                    if (result.success) {
                        setUser(result.user);
                        setToken(storedToken);
                    } else {
                        logout();
                    }
                } catch (error) {
                    // #region agent log
                    fetch('http://127.0.0.1:7243/ingest/6b883636-1481-4250-a61b-b80d8e085cc6',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AuthContext.tsx:50',message:'Error in initAuth',data:{error:error instanceof Error?error.message:String(error)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
                    // #endregion
                    console.error("Session verification failed", error);
                    logout();
                }
            }
            setIsLoading(false);
        };

        initAuth();
    }, [logout]);

    const login = (newToken: string, newUser: User) => {
        localStorage.setItem('token', newToken);
        setToken(newToken);
        setUser(newUser);
    };

    return (
        <AuthContext.Provider value={{ user, token, isAuthenticated: !!user, isLoading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
