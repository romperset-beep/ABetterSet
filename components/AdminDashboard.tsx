import React, { useEffect, useState } from 'react';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from '../services/firebase';
import { User } from '../types';
import { ShieldCheck, Search, Users, Building2, Calendar, Film } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export const AdminDashboard: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                // Fetch all users
                // Note: In a real large-scale app, we'd paginate. For now, fetch all.
                const q = query(collection(db, 'users'));
                const snapshot = await getDocs(q);
                const userList = snapshot.docs.map(doc => ({ ...doc.data() } as User));
                setUsers(userList);
            } catch (error) {
                console.error("Error fetching users:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchUsers();
    }, []);

    const filteredUsers = users.filter(u =>
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.productionName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.filmTitle.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Group by Production
    const stats = {
        totalUsers: users.length,
        activeProductions: new Set(users.map(u => u.productionName)).size,
        activeFilms: new Set(users.map(u => u.filmTitle)).size
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-cinema-800 p-6 rounded-xl border border-cinema-700 shadow-lg relative overflow-hidden group hover:border-eco-500/50 transition-all">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Users className="h-24 w-24 text-eco-500" />
                    </div>
                    <h3 className="text-slate-400 text-sm font-medium uppercase tracking-wider mb-2">Utilisateurs Total</h3>
                    <p className="text-4xl font-bold text-white mb-1">{stats.totalUsers}</p>
                    <p className="text-xs text-eco-400 font-medium">Inscrits sur la plateforme</p>
                </div>

                <div className="bg-cinema-800 p-6 rounded-xl border border-cinema-700 shadow-lg relative overflow-hidden group hover:border-purple-500/50 transition-all">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Building2 className="h-24 w-24 text-purple-500" />
                    </div>
                    <h3 className="text-slate-400 text-sm font-medium uppercase tracking-wider mb-2">Productions Actives</h3>
                    <p className="text-4xl font-bold text-white mb-1">{stats.activeProductions}</p>
                    <p className="text-xs text-purple-400 font-medium">Sociétés distinctes</p>
                </div>

                <div className="bg-cinema-800 p-6 rounded-xl border border-cinema-700 shadow-lg relative overflow-hidden group hover:border-blue-500/50 transition-all">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Film className="h-24 w-24 text-blue-500" />
                    </div>
                    <h3 className="text-slate-400 text-sm font-medium uppercase tracking-wider mb-2">Projets / Films</h3>
                    <p className="text-4xl font-bold text-white mb-1">{stats.activeFilms}</p>
                    <p className="text-xs text-blue-400 font-medium">Espaces de travail créés</p>
                </div>
            </div>

            {/* User List */}
            <div className="bg-cinema-800 border border-cinema-700 rounded-xl overflow-hidden shadow-2xl">
                <div className="p-6 border-b border-cinema-700 flex flex-col md:flex-row justify-between md:items-center gap-4 bg-cinema-800/50">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-red-500/20 rounded-lg">
                            <ShieldCheck className="h-6 w-6 text-red-500" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">Administration Globale</h2>
                            <p className="text-sm text-slate-400">Vue d'ensemble de tous les utilisateurs</p>
                        </div>
                    </div>

                    <div className="relative">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                        <input
                            type="text"
                            placeholder="Rechercher un utilisateur, film..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-cinema-900 border border-cinema-700 text-white text-sm rounded-lg pl-10 pr-4 py-2 focus:ring-2 focus:ring-eco-500 focus:outline-none w-full md:w-64"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-cinema-900/50 text-slate-400 text-xs uppercase tracking-wider border-b border-cinema-700">
                                <th className="px-6 py-4 font-semibold">Utilisateur</th>
                                <th className="px-6 py-4 font-semibold">Département</th>
                                <th className="px-6 py-4 font-semibold">Projet Actuel</th>
                                <th className="px-6 py-4 font-semibold">Dernière Activité</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-cinema-700 text-sm">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                                        Chargement de la base de données...
                                    </td>
                                </tr>
                            ) : filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                                        Aucun utilisateur trouvé.
                                    </td>
                                </tr>
                            ) : (
                                filteredUsers.map((u, index) => {
                                    // Try to find the latest access date
                                    let lastActive = 'Inconnue';
                                    let timestamp = 0;

                                    // Check projectHistory for latest date
                                    if (u.projectHistory && u.projectHistory.length > 0) {
                                        const sorted = [...u.projectHistory].sort((a, b) =>
                                            new Date(b.lastAccess).getTime() - new Date(a.lastAccess).getTime()
                                        );
                                        if (sorted[0].lastAccess) {
                                            timestamp = new Date(sorted[0].lastAccess).getTime();
                                            lastActive = format(new Date(sorted[0].lastAccess), "d MMM yyyy 'à' HH:mm", { locale: fr });
                                        }
                                    }

                                    // Check status based on "recency" (e.g., active in last 10 mins)
                                    // This is an approximation since we don't have real-time presence yet
                                    const isOnline = (Date.now() - timestamp) < 10 * 60 * 1000;

                                    return (
                                        <tr key={index} className="hover:bg-cinema-700/30 transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center text-xs font-bold text-white border border-slate-600">
                                                        {u.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <div className="font-medium text-white">{u.name}</div>
                                                        <div className="text-xs text-slate-500">{u.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-cinema-700 text-slate-300 border border-cinema-600">
                                                    {u.department}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div>
                                                    <div className="text-white font-medium">{u.filmTitle}</div>
                                                    <div className="text-xs text-slate-500">{u.productionName}</div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500 animate-pulse' : 'bg-slate-600'}`} title={isOnline ? "En ligne (récent)" : "Hors ligne"}></div>
                                                    <span className="text-slate-400">{lastActive}</span>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
