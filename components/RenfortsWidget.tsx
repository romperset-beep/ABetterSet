
import React, { useState, useMemo } from 'react';
import { useProject } from '../context/ProjectContext';
import { Department, Reinforcement } from '../types';
import { Users, ChevronLeft, ChevronRight, UserPlus, X, Calendar } from 'lucide-react';

export const RenfortsWidget: React.FC = () => {
    const { project, updateProjectDetails, user, currentDept } = useProject();
    const [selectedDate, setSelectedDate] = useState(new Date());

    // Helper to get week days
    const getWeekDays = (date: Date) => {
        const start = new Date(date);
        const day = start.getDay();
        const diff = start.getDate() - day + (day === 0 ? -6 : 1); // Monday start
        start.setDate(diff);

        const days = [];
        for (let i = 0; i < 7; i++) {
            const d = new Date(start);
            d.setDate(start.getDate() + i);
            days.push(d);
        }
        return days;
    };

    const days = getWeekDays(selectedDate);
    const weekStart = days[0];
    const weekEnd = days[6];

    const changeWeek = (direction: 'prev' | 'next') => {
        const newDate = new Date(selectedDate);
        newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
        setSelectedDate(newDate);
    };

    // State for simple adding
    const [newDesc, setNewDesc] = useState('');
    const [addingToDate, setAddingToDate] = useState<string | null>(null);

    // Helpers
    const getReinforcements = (dateStr: string, dept: string) => {
        return (project.reinforcements || []).filter(r => r.date === dateStr && r.department === dept);
    };

    const handleAddReinforcement = async (dateStr: string) => {
        if (!newDesc.trim()) return;

        const existing = (project.reinforcements || []).find(r => r.date === dateStr && r.department === (user?.department === 'PRODUCTION' && currentDept !== 'PRODUCTION' ? currentDept : user?.department));

        // Determine target department
        // If Production is viewing a specific dept -> Add for that dept? No, usually Prod adds for Prod?
        // User request: "accessible pour la production rangé par département".
        // Let's assume Production adds for "currentDept" if selected, otherwise blocked?
        // Actually, let's keep it simple: You add for YOUR department unless you are Prod, then ???
        // Let's assume Prod can switch context using the global selector.
        // If Prod is in "PRODUCTION" mode, they see ALL. Can they add? Maybe not easily without picking dept.
        // Let's restricts: Department adds for THEM.
        // Prod adds for... Prod? 
        // Or Prod manages ALL?
        // Let's use `currentDept` from context.

        const targetDept = user?.department === 'PRODUCTION' ? currentDept : user?.department;
        if (!targetDept) return;

        let newReinforcements = [...(project.reinforcements || [])];

        if (existing) {
            const updated = { ...existing, names: [...existing.names, newDesc.trim()] };
            newReinforcements = newReinforcements.map(r => r.id === existing.id ? updated : r);
        } else {
            const newR: Reinforcement = {
                id: `${dateStr}_${targetDept}`,
                date: dateStr,
                department: targetDept as any,
                names: [newDesc.trim()]
            };
            newReinforcements.push(newR);
        }

        await updateProjectDetails({ reinforcements: newReinforcements });
        setNewDesc('');
        setAddingToDate(null);
    };

    const handleRemoveReinforcement = async (dateStr: string, dept: string, nameIndex: number) => {
        if (!window.confirm('Supprimer ce renfort ?')) return;

        const existing = (project.reinforcements || []).find(r => r.date === dateStr && r.department === dept);
        if (!existing) return;

        const newNames = existing.names.filter((_, i) => i !== nameIndex);
        let newReinforcements = [...(project.reinforcements || [])];

        if (newNames.length === 0) {
            // Remove object if empty
            newReinforcements = newReinforcements.filter(r => r.id !== existing.id);
        } else {
            newReinforcements = newReinforcements.map(r => r.id === existing.id ? { ...existing, names: newNames } : r);
        }

        await updateProjectDetails({ reinforcements: newReinforcements });
    };

    // Calculate Total Reinforcements for the Week per Department
    // For Production View summary

    return (
        <div className="space-y-6 max-w-7xl mx-auto p-4 md:p-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-cinema-800 p-6 rounded-xl border border-cinema-700">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-indigo-500/20 rounded-xl text-indigo-400">
                        <Users className="h-8 w-8" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-white">Renforts Équipe</h2>
                        <p className="text-slate-400">
                            {user?.department === 'PRODUCTION' && currentDept === 'PRODUCTION'
                                ? "Vue d'ensemble des renforts par département"
                                : `Gestion des renforts : ${currentDept}`}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-4 bg-cinema-900 rounded-lg p-1 border border-cinema-700">
                    <button onClick={() => changeWeek('prev')} className="p-2 text-slate-400 hover:text-white transition-colors">
                        <ChevronLeft className="h-5 w-5" />
                    </button>
                    <div className="text-center px-4">
                        <div className="text-xs text-slate-500 uppercase font-bold">Semaine du</div>
                        <div className="text-white font-mono">{weekStart.toLocaleDateString()}</div>
                    </div>
                    <button onClick={() => changeWeek('next')} className="p-2 text-slate-400 hover:text-white transition-colors">
                        <ChevronRight className="h-5 w-5" />
                    </button>
                </div>
            </div>

            {/* Matrix View */}
            <div className="grid grid-cols-1 lg:grid-cols-7 gap-4">
                {days.map((day) => {
                    const dateStr = day.toISOString().split('T')[0];
                    const isToday = new Date().toISOString().split('T')[0] === dateStr;

                    return (
                        <div key={dateStr} className={`bg-cinema-800 rounded-xl border ${isToday ? 'border-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.2)]' : 'border-cinema-700'} flex flex-col h-full min-h-[300px]`}>
                            {/* Day Header */}
                            <div className={`p-3 text-center border-b ${isToday ? 'bg-indigo-500/10 border-indigo-500' : 'bg-cinema-900/50 border-cinema-700'}`}>
                                <div className={`text-sm font-bold uppercase ${isToday ? 'text-indigo-400' : 'text-slate-400'}`}>
                                    {day.toLocaleDateString('fr-FR', { weekday: 'short' }).replace('.', '')}
                                </div>
                                <div className={`text-xl font-bold ${isToday ? 'text-white' : 'text-slate-200'}`}>
                                    {day.getDate()}
                                </div>
                            </div>

                            {/* Content */}
                            <div className="flex-1 p-3 space-y-3 overflow-y-auto">

                                {/* If Production View: Show ALL Departments */}
                                {user?.department === 'PRODUCTION' && currentDept === 'PRODUCTION' ? (
                                    <div className="space-y-3">
                                        {/* Group by Dept */}
                                        {Object.values(Department).map(dept => {
                                            const items = getReinforcements(dateStr, dept);
                                            if (!items.length || !items[0].names.length) return null;

                                            return (
                                                <div key={dept} className="bg-cinema-900/50 rounded-lg p-2 border border-cinema-700">
                                                    <div className="text-[10px] text-slate-500 font-bold uppercase mb-1">{dept}</div>
                                                    <div className="space-y-1">
                                                        {items[0].names.map((name, idx) => (
                                                            <div key={idx} className="flex justify-between items-center group">
                                                                <span className="text-xs text-white truncate">{name}</span>
                                                                <button
                                                                    onClick={() => handleRemoveReinforcement(dateStr, dept, idx)}
                                                                    className="hidden group-hover:block text-red-400 hover:text-red-300"
                                                                >
                                                                    <X className="h-3 w-3" />
                                                                </button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                        {/* Empty State for Prod if no data at all for this day */}
                                        {!(project.reinforcements || []).some(r => r.date === dateStr) && (
                                            <div className="text-center py-4 opacity-30">
                                                <Users className="h-6 w-6 mx-auto mb-2 text-slate-500" />
                                                <p className="text-[10px]">Aucun renfort</p>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    // Department View (or Prod filtered)
                                    <div className="h-full flex flex-col">
                                        <div className="flex-1 space-y-2">
                                            {/* Show existing */}
                                            {(() => {
                                                const targetDept = user?.department === 'PRODUCTION' ? currentDept : user?.department;
                                                // If Prod is in "Production" mode, we handled above. 
                                                // If Prod selected a Dept, or if User is Dept.

                                                const items = getReinforcements(dateStr, targetDept as string);

                                                return items.length > 0 && items[0].names.length > 0 ? (
                                                    items[0].names.map((name, idx) => (
                                                        <div key={idx} className="bg-slate-700/30 px-3 py-2 rounded-lg flex justify-between items-center border border-transparent hover:border-slate-600 transition-colors group">
                                                            <span className="text-sm text-slate-200">{name}</span>
                                                            <button
                                                                onClick={() => handleRemoveReinforcement(dateStr, targetDept as string, idx)}
                                                                className="text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                                                            >
                                                                <X className="h-4 w-4" />
                                                            </button>
                                                        </div>
                                                    ))
                                                ) : (
                                                    !addingToDate && (
                                                        <div onClick={() => setAddingToDate(dateStr)} className="h-full flex flex-col items-center justify-center text-slate-600 hover:text-indigo-400 cursor-pointer transition-colors border-2 border-dashed border-cinema-700 hover:border-indigo-500/50 rounded-lg p-4 min-h-[100px]">
                                                            <UserPlus className="h-6 w-6 mb-2" />
                                                            <span className="text-xs font-medium">Ajouter</span>
                                                        </div>
                                                    )
                                                );
                                            })()}
                                        </div>

                                        {/* Add Input */}
                                        {addingToDate === dateStr && (
                                            <div className="mt-2 animate-in fade-in slide-in-from-bottom-2">
                                                <input
                                                    autoFocus
                                                    type="text"
                                                    placeholder="Nom..."
                                                    className="w-full bg-cinema-900 border border-indigo-500 rounded-lg px-3 py-2 text-sm text-white focus:outline-none mb-2"
                                                    value={newDesc}
                                                    onChange={e => setNewDesc(e.target.value)}
                                                    onKeyDown={e => {
                                                        if (e.key === 'Enter') handleAddReinforcement(dateStr);
                                                        if (e.key === 'Escape') { setAddingToDate(null); setNewDesc(''); }
                                                    }}
                                                    onBlur={() => {
                                                        // Optional: Save on blur or cancel? Let's cancel to prevent accident
                                                        // setAddingToDate(null); 
                                                    }}
                                                />
                                                <div className="flex gap-2 justify-end">
                                                    <button onClick={() => setAddingToDate(null)} className="text-xs text-slate-400 hover:text-white px-2 py-1">Annuler</button>
                                                    <button onClick={() => handleAddReinforcement(dateStr)} className="text-xs bg-indigo-600 text-white px-3 py-1 rounded hover:bg-indigo-500">OK</button>
                                                </div>
                                            </div>
                                        )}

                                        {/* Mini Add Button if list not empty */}
                                        {addingToDate !== dateStr && getReinforcements(dateStr, user?.department === 'PRODUCTION' ? currentDept : user?.department || '').length > 0 && (
                                            <button
                                                onClick={() => setAddingToDate(dateStr)}
                                                className="mt-2 w-full py-2 flex items-center justify-center gap-2 text-xs text-slate-500 hover:text-indigo-400 hover:bg-cinema-700/30 rounded-lg transition-colors border border-transparent hover:border-cinema-700"
                                            >
                                                <UserPlus className="h-3 w-3" />
                                                Ajouter
                                            </button>
                                        )}
                                    </div>
                                )}

                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
