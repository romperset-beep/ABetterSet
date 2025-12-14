import React, { useState } from 'react';
import { useProject } from '../context/ProjectContext';
import { Department, Reinforcement, ReinforcementDetail } from '../types';
import { Users, ChevronLeft, ChevronRight, UserPlus, X, Calendar, Phone, Mail, User } from 'lucide-react';

export const RenfortsWidget: React.FC = () => {
    const { project, updateProjectDetails, user, currentDept, addNotification } = useProject();
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
    const weekEnd = days[6]; // Not used but good to have

    const changeWeek = (direction: 'prev' | 'next') => {
        const newDate = new Date(selectedDate);
        newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
        setSelectedDate(newDate);
    };

    // State for Enhanced Adding
    const [newName, setNewName] = useState('');
    const [newPhone, setNewPhone] = useState('');
    const [newEmail, setNewEmail] = useState('');
    const [addingToDate, setAddingToDate] = useState<string | null>(null);

    // Helpers
    const getReinforcements = (dateStr: string, dept: string) => {
        return (project.reinforcements || []).filter(r => r.date === dateStr && r.department === dept);
    };

    const getStaffList = (r: Reinforcement): ReinforcementDetail[] => {
        if (r.staff && r.staff.length > 0) return r.staff;
        // Legacy fallback
        if (r.names && r.names.length > 0) {
            return r.names.map((n, i) => ({ id: `${r.id}_legacy_${i}`, name: n }));
        }
        return [];
    };

    const handleAddReinforcement = async (dateStr: string) => {
        if (!newName.trim()) return;

        const targetDept = user?.department === 'PRODUCTION' ? currentDept : user?.department;
        if (!targetDept) return;

        const existing = (project.reinforcements || []).find(r => r.date === dateStr && r.department === targetDept);
        let newReinforcements = [...(project.reinforcements || [])];

        const newStaff: ReinforcementDetail = {
            id: `staff_${Date.now()}`,
            name: newName.trim(),
            phone: newPhone.trim(),
            email: newEmail.trim()
        };

        if (existing) {
            // Migrate legacy names if mixed? Or just append to staff.
            // Best to unify.
            const currentStaff = getStaffList(existing);
            const updatedStaff = [...currentStaff, newStaff];

            // Update logic: we now use 'staff' primarily.
            const updated = { ...existing, staff: updatedStaff };
            // Clear legacy names to avoid duplication display if we used fallback
            if (updated.names) delete (updated as any).names;

            newReinforcements = newReinforcements.map(r => r.id === existing.id ? updated : r);
        } else {
            const newR: Reinforcement = {
                id: `${dateStr}_${targetDept}`,
                date: dateStr,
                department: targetDept as any,
                staff: [newStaff]
            };
            newReinforcements.push(newR);
        }

        await updateProjectDetails({ reinforcements: newReinforcements });

        // Notification Logic
        if (user?.department !== 'PRODUCTION') {
            addNotification(
                `Nouveau Renfort : ${newStaff.name} (${targetDept}) pour le ${new Date(dateStr).toLocaleDateString()}`,
                'INFO',
                'PRODUCTION'
            );
        }

        setNewName('');
        setNewPhone('');
        setNewEmail('');
        setAddingToDate(null);
    };

    const handleRemoveReinforcement = async (dateStr: string, dept: string, staffId: string) => {
        if (!window.confirm('Supprimer ce renfort ?')) return;

        const existing = (project.reinforcements || []).find(r => r.date === dateStr && r.department === dept);
        if (!existing) return;

        const currentStaff = getStaffList(existing);
        const newStaff = currentStaff.filter(s => s.id !== staffId);

        let newReinforcements = [...(project.reinforcements || [])];

        if (newStaff.length === 0) {
            newReinforcements = newReinforcements.filter(r => r.id !== existing.id);
        } else {
            const updated = { ...existing, staff: newStaff };
            if (updated.names) delete (updated as any).names;
            newReinforcements = newReinforcements.map(r => r.id === existing.id ? updated : r);
        }

        await updateProjectDetails({ reinforcements: newReinforcements });
    };

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
                                        {Object.values(Department).map(dept => {
                                            const items = getReinforcements(dateStr, dept);
                                            const staffList = items.length ? getStaffList(items[0]) : [];
                                            if (!staffList.length) return null;

                                            return (
                                                <div key={dept} className="bg-cinema-900/50 rounded-lg p-2 border border-cinema-700">
                                                    <div className="text-[10px] text-slate-500 font-bold uppercase mb-2 border-b border-cinema-700 pb-1">{dept}</div>
                                                    <div className="space-y-2">
                                                        {staffList.map((s) => (
                                                            <div key={s.id} className="group relative">
                                                                <div className="flex justify-between items-start">
                                                                    <div>
                                                                        <span className="text-xs text-white font-medium block">{s.name}</span>
                                                                        <div className="flex flex-col gap-0.5 mt-0.5">
                                                                            {s.phone && (
                                                                                <a href={`tel:${s.phone}`} className="text-[10px] text-slate-400 flex items-center gap-1 hover:text-indigo-400">
                                                                                    <Phone className="h-2 w-2" /> {s.phone}
                                                                                </a>
                                                                            )}
                                                                            {s.email && (
                                                                                <a href={`mailto:${s.email}`} className="text-[10px] text-slate-400 flex items-center gap-1 hover:text-indigo-400">
                                                                                    <Mail className="h-2 w-2" /> {s.email}
                                                                                </a>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                    <button
                                                                        onClick={() => handleRemoveReinforcement(dateStr, dept, s.id)}
                                                                        className="hidden group-hover:block text-red-400 hover:text-red-300"
                                                                        title="Supprimer"
                                                                    >
                                                                        <X className="h-3 w-3" />
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                        {/* Empty State for Prod if no data */}
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
                                            {(() => {
                                                const targetDept = user?.department === 'PRODUCTION' ? currentDept : user?.department;
                                                const items = getReinforcements(dateStr, targetDept as string);
                                                const staffList = items.length ? getStaffList(items[0]) : [];

                                                return staffList.length > 0 ? (
                                                    staffList.map((s) => (
                                                        <div key={s.id} className="bg-slate-700/30 px-3 py-2 rounded-lg flex justify-between items-start border border-transparent hover:border-slate-600 transition-colors group">
                                                            <div>
                                                                <div className="text-sm text-slate-200 font-medium">{s.name}</div>
                                                                <div className="flex flex-col mt-1 gap-0.5">
                                                                    {s.phone && (
                                                                        <div className="text-[10px] text-slate-400 flex items-center gap-1">
                                                                            <Phone className="h-2.5 w-2.5" /> {s.phone}
                                                                        </div>
                                                                    )}
                                                                    {s.email && (
                                                                        <div className="text-[10px] text-slate-400 flex items-center gap-1">
                                                                            <Mail className="h-2.5 w-2.5" /> {s.email}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>

                                                            <button
                                                                onClick={() => handleRemoveReinforcement(dateStr, targetDept as string, s.id)}
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

                                        {/* Enhanced Add Input */}
                                        {addingToDate === dateStr && (
                                            <div className="mt-2 animate-in fade-in slide-in-from-bottom-2 bg-cinema-900/80 p-3 rounded-lg border border-indigo-500/50 shadow-lg relative z-10">
                                                <div className="space-y-2 mb-3">
                                                    <div className="relative">
                                                        <User className="h-3 w-3 absolute left-2 top-2.5 text-slate-500" />
                                                        <input
                                                            autoFocus
                                                            type="text"
                                                            placeholder="Nom (Requis)"
                                                            className="w-full bg-cinema-800 border border-cinema-700 rounded px-2 py-1.5 pl-7 text-xs text-white focus:outline-none focus:border-indigo-500"
                                                            value={newName}
                                                            onChange={e => setNewName(e.target.value)}
                                                        />
                                                    </div>
                                                    <div className="relative">
                                                        <Phone className="h-3 w-3 absolute left-2 top-2.5 text-slate-500" />
                                                        <input
                                                            type="text"
                                                            placeholder="Téléphone"
                                                            className="w-full bg-cinema-800 border border-cinema-700 rounded px-2 py-1.5 pl-7 text-xs text-white focus:outline-none focus:border-indigo-500"
                                                            value={newPhone}
                                                            onChange={e => setNewPhone(e.target.value)}
                                                        />
                                                    </div>
                                                    <div className="relative">
                                                        <Mail className="h-3 w-3 absolute left-2 top-2.5 text-slate-500" />
                                                        <input
                                                            type="email"
                                                            placeholder="Email"
                                                            className="w-full bg-cinema-800 border border-cinema-700 rounded px-2 py-1.5 pl-7 text-xs text-white focus:outline-none focus:border-indigo-500"
                                                            value={newEmail}
                                                            onChange={e => setNewEmail(e.target.value)}
                                                            onKeyDown={e => {
                                                                if (e.key === 'Enter') handleAddReinforcement(dateStr);
                                                            }}
                                                        />
                                                    </div>
                                                </div>

                                                <div className="flex gap-2 justify-end">
                                                    <button onClick={() => { setAddingToDate(null); setNewName(''); setNewPhone(''); setNewEmail(''); }} className="text-xs text-slate-400 hover:text-white px-2 py-1">Annuler</button>
                                                    <button
                                                        onClick={() => handleAddReinforcement(dateStr)}
                                                        disabled={!newName.trim()}
                                                        className="text-xs bg-indigo-600 text-white px-3 py-1 rounded hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                                    >
                                                        OK
                                                    </button>
                                                </div>
                                            </div>
                                        )}

                                        {/* Mini Add Button */}
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
