import React, { useState } from 'react';
import { useProject } from '../context/ProjectContext';
import { Department } from '../types';
import { MessageSquare, Send, ArrowLeft, User } from 'lucide-react';

interface MemoWidgetProps {
    setActiveTab: (tab: string) => void;
}

export const MemoWidget: React.FC<MemoWidgetProps> = ({ setActiveTab }) => {
    const { user, userProfiles, addSocialPost, t } = useProject();

    // Memos Widget State
    const [memoContent, setMemoContent] = useState('');
    const [memoTarget, setMemoTarget] = useState<'GLOBAL' | 'DEPARTMENT' | 'USER'>('DEPARTMENT');
    const [memoTargetDept, setMemoTargetDept] = useState<Department | 'PRODUCTION'>(user?.department || 'PRODUCTION');
    const [memoTargetUserId, setMemoTargetUserId] = useState<string>('');
    const [memoSearchTerm, setMemoSearchTerm] = useState('');
    const [showMemoSuggestions, setShowMemoSuggestions] = useState(false);

    const handleSendMemo = (e: React.FormEvent) => {
        e.preventDefault();
        if (!memoContent.trim() || !user || !addSocialPost) return;

        const myProfile = userProfiles.find(p => p.email === user.email);

        // Cast to any to assume compatibility with SocialPost type if strict checks fail
        const newPost: any = {
            id: `post_${Date.now()}`,
            authorId: myProfile?.id,
            authorName: user.name,
            authorDepartment: user.department,
            content: memoContent,
            date: new Date().toISOString(),
            likes: 0,
            targetAudience: memoTarget,
            targetDept: memoTarget === 'DEPARTMENT' ? memoTargetDept : undefined,
            targetUserId: memoTarget === 'USER' ? memoTargetUserId : undefined
        };

        addSocialPost(newPost);
        setMemoContent('');
        alert('Mémo envoyé sur le Mur Social !');
        setActiveTab('dashboard'); // Return to dashboard after sending
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex items-center gap-4">
                <button
                    onClick={() => setActiveTab('dashboard')}
                    className="p-2 rounded-full bg-cinema-800 text-slate-400 hover:bg-cinema-700 hover:text-white transition-colors"
                >
                    <ArrowLeft className="h-6 w-6" />
                </button>
                <h2 className="text-3xl font-bold text-white flex items-center gap-3">
                    <MessageSquare className="h-8 w-8 text-pink-500" />
                    Mémo Rapide
                </h2>
            </div>

            <div className="bg-cinema-800 p-8 rounded-2xl border border-cinema-700 shadow-xl">
                <form onSubmit={handleSendMemo} className="space-y-6">

                    {/* Target Selection */}
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-400 uppercase tracking-wider">Destinataire</label>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <button
                                type="button"
                                onClick={() => setMemoTarget('DEPARTMENT')}
                                className={`p-4 rounded-xl border transition-all text-left ${memoTarget === 'DEPARTMENT'
                                        ? 'bg-pink-600/20 border-pink-500 text-white shadow-[0_0_15px_rgba(236,72,153,0.3)]'
                                        : 'bg-cinema-900 border-cinema-700 text-slate-400 hover:bg-cinema-700'
                                    }`}
                            >
                                <span className="font-bold block mb-1">Un Département</span>
                                <span className="text-xs opacity-70">Message ciblé</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setMemoTarget('GLOBAL')}
                                className={`p-4 rounded-xl border transition-all text-left ${memoTarget === 'GLOBAL'
                                        ? 'bg-pink-600/20 border-pink-500 text-white shadow-[0_0_15px_rgba(236,72,153,0.3)]'
                                        : 'bg-cinema-900 border-cinema-700 text-slate-400 hover:bg-cinema-700'
                                    }`}
                            >
                                <span className="font-bold block mb-1">Tout le monde</span>
                                <span className="text-xs opacity-70">Mur Global</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setMemoTarget('USER')}
                                className={`p-4 rounded-xl border transition-all text-left ${memoTarget === 'USER'
                                        ? 'bg-pink-600/20 border-pink-500 text-white shadow-[0_0_15px_rgba(236,72,153,0.3)]'
                                        : 'bg-cinema-900 border-cinema-700 text-slate-400 hover:bg-cinema-700'
                                    }`}
                            >
                                <span className="font-bold block mb-1">Une Personne</span>
                                <span className="text-xs opacity-70">Message Privé</span>
                            </button>
                        </div>
                    </div>

                    {/* Conditional Selectors */}
                    <div className="space-y-4 min-h-[80px]">
                        {memoTarget === 'DEPARTMENT' && (
                            <div className="animate-in fade-in slide-in-from-top-2">
                                <label className="text-xs text-slate-400 mb-1 block">Choisir le département cible</label>
                                <select
                                    value={memoTargetDept}
                                    onChange={(e) => setMemoTargetDept(e.target.value as any)}
                                    className="w-full bg-cinema-900 border border-cinema-600 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-pink-500 outline-none"
                                >
                                    <option value="" disabled>Sélectionner...</option>
                                    {Object.values(Department).map(d => <option key={d} value={d}>{d}</option>)}
                                    <option value="PRODUCTION">PRODUCTION</option>
                                </select>
                            </div>
                        )}

                        {memoTarget === 'USER' && (
                            <div className="relative animate-in fade-in slide-in-from-top-2">
                                <label className="text-xs text-slate-400 mb-1 block">Rechercher un destinataire</label>
                                <div className="relative">
                                    <User className="absolute left-4 top-3.5 h-5 w-5 text-slate-500" />
                                    <input
                                        type="text"
                                        placeholder="Nom de la personne..."
                                        value={memoSearchTerm}
                                        onChange={(e) => {
                                            setMemoSearchTerm(e.target.value);
                                            setShowMemoSuggestions(true);
                                        }}
                                        onFocus={() => setShowMemoSuggestions(true)}
                                        className="w-full bg-cinema-900 border border-cinema-600 rounded-xl pl-12 pr-4 py-3 text-white focus:ring-2 focus:ring-pink-500 outline-none"
                                    />
                                </div>
                                {showMemoSuggestions && memoSearchTerm && (
                                    <div className="absolute top-full left-0 w-full mt-1 bg-cinema-800 border border-cinema-600 rounded-xl shadow-2xl z-50 max-h-60 overflow-y-auto">
                                        {userProfiles
                                            .filter(u => `${u.firstName} ${u.lastName}`.toLowerCase().includes(memoSearchTerm.toLowerCase()))
                                            .map(u => (
                                                <div
                                                    key={u.id}
                                                    onClick={() => {
                                                        setMemoTargetUserId(u.id);
                                                        setMemoSearchTerm(`${u.firstName} ${u.lastName}`);
                                                        setShowMemoSuggestions(false);
                                                    }}
                                                    className="px-4 py-3 hover:bg-cinema-700 cursor-pointer flex items-center justify-between group border-b border-cinema-700/50 last:border-0"
                                                >
                                                    <span className="font-medium group-hover:text-white text-slate-300">{u.firstName} {u.lastName}</span>
                                                    <span className="text-xs text-slate-500 group-hover:text-slate-400">{u.department}</span>
                                                </div>
                                            ))
                                        }
                                        {userProfiles.filter(u => `${u.firstName} ${u.lastName}`.toLowerCase().includes(memoSearchTerm.toLowerCase())).length === 0 && (
                                            <div className="px-4 py-3 text-slate-500 text-sm text-center">Aucun résultat</div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Content Area */}
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-400 uppercase tracking-wider">Message</label>
                        <textarea
                            value={memoContent}
                            onChange={(e) => setMemoContent(e.target.value)}
                            placeholder="Quelles sont les nouvelles ?"
                            className="w-full bg-cinema-900 border border-cinema-600 rounded-xl p-4 text-white resize-none h-40 focus:ring-2 focus:ring-pink-500 outline-none placeholder:text-slate-600 leading-relaxed"
                        />
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={!memoContent.trim()}
                        className="w-full bg-pink-600 hover:bg-pink-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl text-lg shadow-lg shadow-pink-600/20 transform active:scale-[0.98] transition-all flex items-center justify-center gap-3"
                    >
                        <Send className="h-5 w-5" />
                        Envoyer le mémo
                    </button>
                </form>
            </div>
        </div>
    );
};
