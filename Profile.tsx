
import React, { useState } from 'react';
import { User, VideoPost } from '../types';
import { SettingsIcon, GridIcon, HeartIcon, CoinIcon, BarChartIcon } from '../constants';
import CreatorDashboard from './CreatorDashboard';

interface ProfileProps {
    user: User;
    posts: VideoPost[];
    onOpenSettings: () => void;
    onOpenWallet: () => void;
}

const Profile: React.FC<ProfileProps> = ({ user, posts, onOpenSettings, onOpenWallet }) => {
    
    const [activeTab, setActiveTab] = useState<'videos' | 'dashboard'>('videos');
    
    const formatCount = (count: number): string => {
        if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
        if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
        return count.toString();
    };
    
    const isCurrentUser = user.id === 'u_current';

    return (
        <div className="h-full w-full bg-[var(--frame-bg-color)] text-[var(--text-color)] flex flex-col transition-colors duration-300">
            <header className="flex-shrink-0 flex justify-between items-center p-4 border-b-2 border-[var(--border-color)]">
                <div className="w-8"></div>
                <h1 className="text-2xl font-black font-display text-center">@{user.username}</h1>
                <button onClick={onOpenSettings} className="p-1 rounded-full hover:bg-[var(--text-color)]/10">
                    <SettingsIcon className="w-7 h-7" />
                </button>
            </header>

            <main className="flex-grow overflow-y-auto">
                <div className="p-6 flex flex-col items-center">
                    <img src={user.avatarUrl} alt={user.username} className="w-28 h-28 rounded-full object-cover p-1 bg-[var(--frame-bg-color)] border-2 border-[var(--border-color)]" />
                    <p className="text-center mt-4 font-medium opacity-80">{user.bio}</p>
                </div>

                <div className="grid grid-cols-4 justify-around items-center px-4 py-2 text-center">
                    <div className="font-display"><p className="text-2xl font-black">{formatCount(user.followingCount)}</p><p className="text-sm opacity-70 font-bold">Following</p></div>
                    <div className="font-display"><p className="text-2xl font-black">{formatCount(user.followerCount)}</p><p className="text-sm opacity-70 font-bold">Followers</p></div>
                    <div className="font-display"><p className="text-2xl font-black">{formatCount(user.totalLikes)}</p><p className="text-sm opacity-70 font-bold">Likes</p></div>
                    <div className="font-display"><p className="text-2xl font-black">{formatCount(user.vibeCoinBalance)}</p><p className="text-sm opacity-70 font-bold">VibeCoins</p></div>
                </div>

                <div className="p-4 grid grid-cols-2 gap-3">
                    <button className="w-full py-3 text-lg font-bold text-center border-2 border-[var(--border-color)] rounded-xl hover:bg-[var(--text-color)]/5 transition-colors">
                        Edit Profile
                    </button>
                    <button onClick={onOpenWallet} className="w-full py-3 text-lg font-bold text-center border-2 border-[var(--border-color)] rounded-xl hover:bg-[var(--text-color)]/5 transition-colors flex items-center justify-center gap-2">
                        <CoinIcon className="w-6 h-6" /> My Wallet
                    </button>
                </div>
                
                 <div className="border-t-2 border-[var(--border-color)] grid grid-cols-2">
                    <button 
                        onClick={() => setActiveTab('videos')}
                        className={`py-3 flex justify-center items-center transition-colors ${activeTab === 'videos' ? 'text-[var(--accent-color)] border-t-2 border-[var(--accent-color)] -mt-[2px]' : 'opacity-50'}`}
                    >
                         <GridIcon className="w-7 h-7" />
                    </button>
                    {isCurrentUser && (
                        <button 
                             onClick={() => setActiveTab('dashboard')}
                            className={`py-3 flex justify-center items-center transition-colors ${activeTab === 'dashboard' ? 'text-[var(--accent-color)] border-t-2 border-[var(--accent-color)] -mt-[2px]' : 'opacity-50'}`}
                        >
                             <BarChartIcon className="w-7 h-7" />
                        </button>
                    )}
                </div>

                {activeTab === 'videos' && (
                    <div className="grid grid-cols-3 gap-1 p-1">
                        {posts.map(post => (
                            <div key={post.id} className="aspect-[9/16] relative bg-[var(--bg-color)] rounded-md overflow-hidden group profile-video-thumb">
                                <img src={post.posterUrl} alt={post.caption} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                                <div className="absolute bottom-1 left-2 text-white flex items-center gap-1 font-bold text-sm">
                                    <HeartIcon filled className="w-4 h-4" />
                                    <span>{formatCount(post.likes)}</span>
                                </div>
                            </div>
                        ))}
                         {posts.length === 0 && (
                            <div className="col-span-3 flex flex-col items-center justify-center h-48 opacity-60 text-center">
                                <svg className="w-16 h-16 mb-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M14.7,4.3C14.2,3.8,13.6,3.4,13,3.2C12.4,3,11.7,2.9,11,3c-0.7,0-1.4,0.2-2,0.5c-0.6,0.3-1.2,0.7-1.7,1.2L3,9"></path><path d="M9,3l1.7,1.2C11.3,4.7,11.8,5,12.4,5.1c0.6,0.1,1.2,0,1.8-0.2c-0.6-0.2-1.2-0.6-1.6-1L17,3"></path><path d="M21,15l-4.2-3.8C16.2,10.7,15.7,10.4,15.1,10.3c-0.6-0.1-1.2,0-1.8,0.2c-0.6,0.2-1.2,0.6-1.6,1L9,13"></path><line x1="3" y1="21" x2="21" y2="3"></line></svg>
                                <h2 className="text-xl font-bold">No Posts Yet</h2>
                                <p>Videos you upload will appear here.</p>
                            </div>
                        )}
                    </div>
                )}
                
                {activeTab === 'dashboard' && isCurrentUser && (
                    <CreatorDashboard user={user} posts={posts} />
                )}

            </main>
        </div>
    );
};

export default Profile;
