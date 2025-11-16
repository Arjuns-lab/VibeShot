import React, { useState } from 'react';
import { UserIcon, LockIcon } from '../constants';

interface LoginProps {
    onLogin: (username: string) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!username.trim()) {
            setError('Please enter a username.');
            return;
        }
        setError('');
        onLogin(username);
    };

    return (
        <div className="h-full w-full bg-[var(--frame-bg-color)] text-[var(--text-color)] flex flex-col justify-center items-center p-8 transition-colors duration-300 font-display">
            <div className="text-center mb-10">
                <h1 className="text-6xl font-brand bg-clip-text text-transparent bg-gradient-to-br from-[var(--accent-color)] to-[var(--secondary-color)]">
                    VibeShot
                </h1>
                <p className="text-lg font-bold opacity-70 mt-2">Log in to continue</p>
            </div>
            
            <form onSubmit={handleSubmit} className="w-full max-w-xs flex flex-col gap-4">
                <div className="relative">
                    <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 opacity-40" />
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Username"
                        className="w-full bg-[var(--bg-color)] border-2 border-[var(--border-color)] rounded-xl py-3 pl-10 pr-3 text-[var(--text-color)] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)] font-medium text-base transition-colors"
                        aria-label="Username"
                    />
                </div>
                <div className="relative">
                    <LockIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 opacity-40" />
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Password"
                        className="w-full bg-[var(--bg-color)] border-2 border-[var(--border-color)] rounded-xl py-3 pl-10 pr-3 text-[var(--text-color)] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)] font-medium text-base transition-colors"
                        aria-label="Password"
                    />
                </div>
                
                {error && <p className="text-red-500 text-sm text-center font-semibold">{error}</p>}
                
                <button 
                    type="submit"
                    className="w-full py-3 mt-4 text-lg font-bold text-white bg-gradient-to-br from-[var(--accent-color)] to-[var(--secondary-color)] rounded-xl transition-transform hover:scale-105 shadow-lg"
                >
                    Log In
                </button>
            </form>

            <div className="text-center mt-8 text-sm font-semibold">
                <a href="#" className="opacity-70 hover:opacity-100 transition-opacity">Forgot Password?</a>
                <p className="mt-4 opacity-70">
                    Don't have an account? <a href="#" className="font-bold text-[var(--accent-color)] hover:underline">Sign Up</a>
                </p>
            </div>
        </div>
    );
};

export default Login;