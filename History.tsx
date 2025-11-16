
import React from 'react';
import { VideoPost } from '../types';
import { HistoryIcon } from '../constants';

interface HistoryProps {
    history: VideoPost[];
}

const History: React.FC<HistoryProps> = ({ history }) => {
    return (
        <div className="h-full w-full bg-[var(--frame-bg-color)] text-[var(--text-color)] flex flex-col transition-colors duration-300">
            <header className="flex-shrink-0 p-4 border-b-2 border-[var(--border-color)] transition-colors duration-300">
                <h1 className="text-2xl font-black font-display text-center">Watch History</h1>
            </header>
            <main className="flex-grow overflow-y-auto p-1">
                {history.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center text-[var(--text-color)] p-8">
                        <div className="w-24 h-24 flex items-center justify-center bg-[var(--bg-color)] rounded-full mb-6">
                            <HistoryIcon className="w-12 h-12 text-[var(--text-color)] opacity-40" />
                        </div>
                        <h2 className="text-2xl font-black font-display">Your History is Empty</h2>
                        <p className="mt-2 max-w-xs opacity-70">
                            Start watching some videos! Any clips you view will show up here for you to easily find again.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-3 gap-1">
                        {history.map(post => (
                            <div key={post.id} className="aspect-[9/16] relative bg-[var(--bg-color)] rounded-md overflow-hidden group">
                                <img src={post.posterUrl} alt={post.caption} className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-2 text-white">
                                    <p className="text-xs font-bold">@{post.user.username}</p>
                                    <p className="text-xs truncate">{post.caption}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
};

export default History;
