import React, { useState, useMemo, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { VideoPost } from '../types';
import { SearchIcon, HeartIcon, TRENDING_TAGS } from '../constants';

interface DiscoverProps {
    posts: VideoPost[];
}

const Discover: React.FC<DiscoverProps> = ({ posts }) => {
    const [searchTerm, setSearchTerm] = useState('');
    
    // State for web search results
    const [webResult, setWebResult] = useState<{ text: string; sources: any[] } | null>(null);
    const [isSearching, setIsSearching] = useState(false);
    const [searchError, setSearchError] = useState<string | null>(null);

    useEffect(() => {
        // This effect runs when the component mounts.
        // We explicitly clear the search term and results to ensure a fresh state
        // every time the user navigates to the Discover page.
        setSearchTerm('');
        setWebResult(null);
        setSearchError(null);
    }, []);

    const formatCount = (count: number): string => {
        if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
        if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
        return count.toString();
    };
    
    const handleSearchSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const trimmedSearch = searchTerm.trim();
        if (!trimmedSearch) {
            setWebResult(null);
            setSearchError(null);
            return;
        }

        setIsSearching(true);
        setSearchError(null);
        setWebResult(null);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: `Provide a concise and informative summary about: "${trimmedSearch}". Include relevant facts and up-to-date information.`,
                config: {
                    tools: [{googleSearch: {}}],
                },
            });

            const text = response.text;
            const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
            
            setWebResult({ text, sources });

        } catch (error) {
            console.error("Error fetching web results:", error);
            setSearchError("Sorry, something went wrong while searching the web. Please try again.");
        } finally {
            setIsSearching(false);
        }
    };

    const filteredPosts = useMemo(() => {
        // Shuffle posts for a more dynamic "popular" feed
        const shuffledPosts = [...posts].sort(() => 0.5 - Math.random());
        const trimmedSearch = searchTerm.trim();
        if (!trimmedSearch) {
            return shuffledPosts;
        }
        const lowercasedTerm = trimmedSearch.toLowerCase();
        return shuffledPosts.filter(post => 
            post.caption.toLowerCase().includes(lowercasedTerm) ||
            post.user.username.toLowerCase().includes(lowercasedTerm) ||
            post.songTitle.toLowerCase().includes(lowercasedTerm)
        );
    }, [posts, searchTerm]);

    const isSearchActive = searchTerm.trim().length > 0;

    return (
        <div className="h-full w-full bg-[var(--frame-bg-color)] text-[var(--text-color)] flex flex-col transition-colors duration-300">
            <header className="flex-shrink-0 p-4 border-b-2 border-[var(--border-color)] transition-colors duration-300">
                <h1 className="text-2xl font-black font-display text-center">Discover</h1>
            </header>
            <main className="flex-grow overflow-y-auto p-4 space-y-6">
                {/* Search Bar */}
                <form onSubmit={handleSearchSubmit}>
                    <div className="relative">
                        <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 opacity-40" />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search accounts, videos, and sounds"
                            className="w-full bg-[var(--bg-color)] border-2 border-[var(--border-color)] rounded-xl py-3 pl-12 pr-4 text-[var(--text-color)] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)] font-medium text-base transition-colors"
                            aria-label="Search"
                        />
                    </div>
                </form>

                {/* Web Search Results */}
                {isSearching && (
                    <div className="flex justify-center items-center gap-2 p-4 text-center font-semibold opacity-70">
                        <div className="w-5 h-5 border-2 border-current border-r-transparent rounded-full animate-spin"></div>
                        Searching the web for the latest info...
                    </div>
                )}
                {searchError && (
                    <div className="bg-red-500/10 text-red-500 p-3 rounded-xl font-semibold">
                        {searchError}
                    </div>
                )}
                {webResult && (
                    <div>
                        <h2 className="text-lg font-bold font-display px-1">From the Web</h2>
                        <div className="mt-2 p-4 bg-[var(--bg-color)] rounded-xl">
                            <p className="whitespace-pre-wrap font-medium">{webResult.text}</p>
                            {webResult.sources.length > 0 && (
                                <div className="mt-4 pt-3 border-t border-[var(--border-color)]">
                                    <h3 className="text-sm font-bold opacity-70">Sources:</h3>
                                    <ul className="list-disc list-inside text-sm mt-1 space-y-1">
                                        {webResult.sources.map((source, index) => (
                                            source.web && source.web.uri && (
                                                <li key={index}>
                                                    <a href={source.web.uri} target="_blank" rel="noopener noreferrer" className="text-[var(--accent-color)] hover:underline break-words">
                                                        {source.web.title || source.web.uri}
                                                    </a>
                                                </li>
                                            )
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    </div>
                )}


                {/* Trending Tags (only show when not searching) */}
                {!isSearchActive && !isSearching && !webResult && (
                    <div>
                        <h2 className="text-lg font-bold font-display px-1">Trending</h2>
                        <div className="flex flex-wrap gap-2 mt-2">
                            {TRENDING_TAGS.map(tag => (
                                <button 
                                    key={tag} 
                                    onClick={() => setSearchTerm(tag.replace('#', ''))}
                                    className="px-3 py-1 bg-[var(--bg-color)] rounded-full font-semibold text-sm hover:bg-[var(--text-color)]/10 transition-colors"
                                >
                                    {tag}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Video Grid */}
                <div>
                     <h2 className="text-lg font-bold font-display px-1">{isSearchActive ? 'Matching Videos' : 'Popular'}</h2>
                     <div className="grid grid-cols-3 gap-1 mt-2">
                        {filteredPosts.map(post => (
                            <div key={post.id} className="aspect-[9/16] relative bg-[var(--bg-color)] rounded-md overflow-hidden group profile-video-thumb">
                                <img src={post.posterUrl} alt={post.caption} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                                <div className="absolute bottom-1 left-2 text-white flex items-center gap-1 font-bold text-sm">
                                    <HeartIcon filled className="w-4 h-4" />
                                    <span>{formatCount(post.likes)}</span>
                                </div>
                            </div>
                        ))}
                        {filteredPosts.length === 0 && (
                             <div className="col-span-3 flex flex-col items-center justify-center h-48 opacity-60 text-center p-4">
                                <SearchIcon className="w-16 h-16 mb-4" />
                                <h2 className="text-xl font-bold">No Results Found</h2>
                                {isSearchActive && <p>Try searching for something else.</p>}
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Discover;