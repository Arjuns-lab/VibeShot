import React from 'react';
import { User, VideoPost } from '../types';
import { HeartIcon, CoinIcon } from '../constants';

interface CreatorDashboardProps {
    user: User;
    posts: VideoPost[];
}

const CreatorDashboard: React.FC<CreatorDashboardProps> = ({ user, posts }) => {

    const totalEngagement = posts.reduce((sum, post) => sum + post.likes + post.comments + post.shares, 0);
    const estimatedRevenue = (totalEngagement * 0.035).toFixed(2); // Simulated revenue
    const topPerformingPost = posts.length > 0 ? posts.reduce((max, post) => post.likes > max.likes ? post : max, posts[0]) : null;

    const StatCard: React.FC<{ title: string; value: string; subtext: string; children: React.ReactNode }> = ({ title, value, subtext, children }) => (
        <div className="bg-[var(--bg-color)] p-4 rounded-2xl">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-[var(--frame-bg-color)] rounded-full">
                    {children}
                </div>
                <div>
                    <p className="text-sm font-bold opacity-70">{title}</p>
                    <p className="text-2xl font-black">{value}</p>
                    <p className="text-xs opacity-60">{subtext}</p>
                </div>
            </div>
        </div>
    );
    
    return (
        <div className="p-4 space-y-6 font-display">
            <h2 className="text-2xl font-black text-center">Creator Dashboard</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                 <StatCard title="Est. Revenue (30d)" value={`$${estimatedRevenue}`} subtext="Based on engagement">
                    <CoinIcon className="w-6 h-6 text-yellow-500" />
                </StatCard>
                 <StatCard title="Total Engagement" value={totalEngagement.toLocaleString()} subtext="Likes, comments, shares">
                    <HeartIcon className="w-6 h-6 text-red-500" filled />
                </StatCard>
            </div>
            
            <div>
                <h3 className="text-lg font-bold mb-2">Top Performing Vibe</h3>
                {topPerformingPost ? (
                     <div className="flex items-center gap-3 bg-[var(--bg-color)] p-2 rounded-2xl">
                        <img src={topPerformingPost.posterUrl} alt="Top post" className="w-16 h-24 object-cover rounded-lg" />
                        <div className="flex-grow">
                            <p className="font-semibold truncate">{topPerformingPost.caption}</p>
                            <div className="flex items-center gap-4 text-sm mt-1 opacity-80">
                                <div className="flex items-center gap-1">
                                    <HeartIcon filled className="w-4 h-4 text-red-500" />
                                    <span>{topPerformingPost.likes.toLocaleString()}</span>
                                </div>
                                <p>Comments: {topPerformingPost.comments.toLocaleString()}</p>
                            </div>
                        </div>
                    </div>
                ) : (
                    <p className="text-center opacity-70 p-4 bg-[var(--bg-color)] rounded-2xl">You don't have any posts yet.</p>
                )}
            </div>
            
            <div className="text-center">
                <button className="w-full py-3 text-lg font-bold text-white bg-gradient-to-br from-[var(--accent-color)] to-[var(--secondary-color)] rounded-xl transition-transform hover:scale-105 shadow-lg disabled:opacity-50" disabled>
                    Set Up Payouts
                </button>
                <p className="text-xs opacity-60 mt-2">Payouts are conceptual in this demo.</p>
            </div>
        </div>
    );
};

export default CreatorDashboard;
