
import React from 'react';
import { AutoscrollIcon, SignalIcon, TrashIcon, InfoIcon, ChevronRightIcon } from '../constants';

interface SettingsProps {
    theme: string;
    setTheme: (theme: 'light' | 'dark') => void;
    isDataSaverEnabled: boolean;
    onDataSaverToggle: (enabled: boolean) => void;
    isAutoScrollEnabled: boolean;
    onAutoScrollToggle: (enabled: boolean) => void;
    onClearHistory: () => void;
    onLogout: () => void;
    onClose: () => void;
}

const Settings: React.FC<SettingsProps> = ({ 
    theme, 
    setTheme, 
    isDataSaverEnabled,
    onDataSaverToggle,
    isAutoScrollEnabled,
    onAutoScrollToggle,
    onClearHistory,
    onLogout,
    onClose 
}) => {
    return (
        <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-center items-end sm:items-center"
            onClick={onClose}
        >
            <div 
                className="bg-[var(--frame-bg-color)] text-[var(--text-color)] w-full max-w-sm rounded-t-3xl sm:rounded-3xl p-6 shadow-xl border-4 border-[var(--border-color)] flex flex-col gap-4"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center">
                    <h2 className="text-3xl font-black font-display">Settings</h2>
                    <button onClick={onClose} className="text-2xl font-bold opacity-60 hover:opacity-100">&times;</button>
                </div>

                {/* Theme Section */}
                <div className="space-y-2 font-display">
                    <h3 className="text-lg font-bold px-2">Theme</h3>
                    <div className="flex gap-2">
                        <button 
                            onClick={() => setTheme('light')}
                            className={`w-full py-2 font-bold rounded-xl border-2 ${theme === 'light' ? 'border-[var(--accent-color)] bg-[var(--accent-color)]/10 text-[var(--accent-color)]' : 'border-transparent bg-[var(--bg-color)]'}`}
                        >
                            💧 Light
                        </button>
                        <button 
                            onClick={() => setTheme('dark')}
                            className={`w-full py-2 font-bold rounded-xl border-2 ${theme === 'dark' ? 'border-[var(--accent-color)] bg-[var(--accent-color)]/10 text-[var(--accent-color)]' : 'border-transparent bg-[var(--bg-color)]'}`}
                        >
                            🔮 Dark
                        </button>
                    </div>
                </div>

                {/* Playback Section */}
                <div className="space-y-2 font-display">
                     <h3 className="text-lg font-bold px-2">Playback</h3>
                     <div className="bg-[var(--bg-color)] rounded-2xl p-2 space-y-1">
                        <div className="flex justify-between items-center p-2">
                           <div className="flex items-center gap-3">
                                <AutoscrollIcon className="w-6 h-6" />
                                <span className="font-bold">Auto-scroll</span>
                           </div>
                           <label className="toggle-switch">
                                <input type="checkbox" checked={isAutoScrollEnabled} onChange={(e) => onAutoScrollToggle(e.target.checked)} />
                                <span className="toggle-slider"></span>
                           </label>
                        </div>
                     </div>
                </div>

                {/* Data & Privacy Section */}
                <div className="space-y-2 font-display">
                     <h3 className="text-lg font-bold px-2">Data & Privacy</h3>
                     <div className="bg-[var(--bg-color)] rounded-2xl p-2 space-y-1">
                        <div className="flex justify-between items-center p-2">
                           <div className="flex items-center gap-3">
                                <SignalIcon className="w-6 h-6" />
                                <span className="font-bold">Data Saver</span>
                           </div>
                           <label className="toggle-switch">
                                <input type="checkbox" checked={isDataSaverEnabled} onChange={(e) => onDataSaverToggle(e.target.checked)} />
                                <span className="toggle-slider"></span>
                           </label>
                        </div>
                        <button onClick={onClearHistory} className="w-full flex justify-between items-center p-2 rounded-lg hover:bg-[var(--frame-bg-color)] transition-colors">
                           <div className="flex items-center gap-3">
                                <TrashIcon className="w-6 h-6 text-red-500"/>
                                <span className="font-bold text-red-500">Clear Watch History</span>
                           </div>
                        </button>
                     </div>
                </div>

                {/* About Section */}
                <div className="space-y-2 font-display">
                     <h3 className="text-lg font-bold px-2">About</h3>
                     <div className="bg-[var(--bg-color)] rounded-2xl p-2 space-y-1">
                         <a href="#" className="w-full flex justify-between items-center p-2 rounded-lg hover:bg-[var(--frame-bg-color)] transition-colors">
                           <div className="flex items-center gap-3">
                                <InfoIcon className="w-6 h-6"/>
                                <span className="font-bold">Help Center</span>
                           </div>
                           <ChevronRightIcon className="w-5 h-5 opacity-50" />
                        </a>
                        <a href="#" className="w-full flex justify-between items-center p-2 rounded-lg hover:bg-[var(--frame-bg-color)] transition-colors">
                           <div className="flex items-center gap-3">
                                <InfoIcon className="w-6 h-6"/>
                                <span className="font-bold">Terms of Service</span>
                           </div>
                           <ChevronRightIcon className="w-5 h-5 opacity-50" />
                        </a>
                     </div>
                </div>
                
                 <button 
                    onClick={onLogout}
                    className="w-full py-2.5 mt-2 text-lg font-bold border-2 border-red-500/50 text-red-500 rounded-xl transition-colors hover:bg-red-500/10"
                >
                    Log Out
                </button>
            </div>
        </div>
    );
};

export default Settings;
