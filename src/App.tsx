/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Database, 
  Tags, 
  ChevronRight, 
  Menu, 
  X, 
  Search,
  Plus,
  Filter,
  BarChart3,
  Building2,
  FolderTree,
  Target,
  FileText,
  Edit2,
  Trash2,
  Save,
  ChevronDown,
  Upload,
  LogOut,
  LogIn
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';

import { 
  INITIAL_OPDS, 
  INITIAL_PROGRAMS, 
  INITIAL_ACTIVITIES, 
  INITIAL_SUB_ACTIVITIES, 
  INITIAL_TAGS, 
  INITIAL_BUDGET_TAGS 
} from './mockData';
import { OPD, Program, Activity, SubActivity, Tag, BudgetTag } from './types';

// Firebase Imports
import { auth, db } from './firebase';
import { 
  onAuthStateChanged, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut,
  User
} from 'firebase/auth';
import { 
  collection, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  setDoc,
  serverTimestamp,
  getDocFromServer
} from 'firebase/firestore';

type View = 'dashboard' | 'opd' | 'program' | 'tag' | 'tagging' | 'laporan';

export default function App() {
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  
  // App State
  const [opds, setOpds] = useState<OPD[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [subActivities, setSubActivities] = useState<SubActivity[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [budgetTags, setBudgetTags] = useState<BudgetTag[]>([]);

  // Auth Effect
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      setIsAuthReady(true);
      if (u) {
        // Bootstrap user document if not exists
        const userRef = doc(db, 'users', u.uid);
        await setDoc(userRef, {
          email: u.email,
          displayName: u.displayName,
          role: u.email === 'noviharyanto062@gmail.com' ? 'admin' : 'user'
        }, { merge: true });
      }
    });
    return () => unsubscribe();
  }, []);

  // Data Listeners Effect
  useEffect(() => {
    if (!user) {
      setOpds([]);
      setPrograms([]);
      setActivities([]);
      setSubActivities([]);
      setTags([]);
      setBudgetTags([]);
      return;
    }

    // Test Firestore Connection
    const testConnection = async () => {
      try {
        await getDocFromServer(doc(db, '_connection_test', 'ping'));
      } catch (error) {
        if(error instanceof Error && error.message.includes('the client is offline')) {
          console.error("Firestore Error: Client is offline. Checklist configuration.");
        }
      }
    };
    testConnection();

    const unsubscribers = [
      onSnapshot(collection(db, 'opds'), s => setOpds(s.docs.map(d => ({ ...d.data(), id: d.id } as OPD)))),
      onSnapshot(collection(db, 'tags'), s => setTags(s.docs.map(d => ({ ...d.data(), id: d.id } as Tag)))),
      onSnapshot(collection(db, 'programs'), s => setPrograms(s.docs.map(d => ({ ...d.data(), id: d.id } as Program)))),
      onSnapshot(collection(db, 'activities'), s => setActivities(s.docs.map(d => ({ ...d.data(), id: d.id } as Activity)))),
      onSnapshot(collection(db, 'subActivities'), s => setSubActivities(s.docs.map(d => ({ ...d.data(), id: d.id } as SubActivity)))),
      onSnapshot(collection(db, 'budgetTags'), s => setBudgetTags(s.docs.map(d => d.data() as BudgetTag))),
    ];

    return () => unsubscribers.forEach(u => u());
  }, [user]);

  // Auth Handlers
  const login = async () => {
    try {
      const provider = new GoogleAuthProvider();
      // Force account selection to avoid persistent block sessions
      provider.setCustomParameters({ prompt: 'select_account' });
      await signInWithPopup(auth, provider);
    } catch (err: any) {
      console.error("Firebase Login Error:", err);
      // Map specific error codes to user-friendly messages
      let message = "Terjadi kesalahan saat login.";
      if (err.code === 'auth/operation-not-allowed') {
        message = "Metode login Google belum diaktifkan di Firebase Console.";
      } else if (err.code === 'auth/unauthorized-domain') {
        message = "Domain ini belum diizinkan untuk login di Firebase Console.";
      } else if (err.code === 'auth/popup-blocked') {
        message = "Popup diblokir oleh browser. Harap izinkan popup untuk situs ini.";
      } else if (err.code === 'auth/cancelled-popup-request') {
        message = "Proses login dibatalkan karena popup ditutup.";
      }
      alert(`Login Gagal (${err.code}): ${message}\n\n${err.message}`);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setCurrentView('dashboard');
    } catch (err) {
      console.error(err);
    }
  };

  // CRUD Handlers
  const addOPD = async (o: Omit<OPD, 'id'>) => {
    await addDoc(collection(db, 'opds'), { ...o, createdAt: serverTimestamp() });
  };
  const updateOPD = async (updated: OPD) => {
    const { id, ...data } = updated;
    await updateDoc(doc(db, 'opds', id), data);
  };
  const deleteOPD = async (id: string) => {
    await deleteDoc(doc(db, 'opds', id));
  };

  const addTag = async (t: Omit<Tag, 'id'>) => {
    await addDoc(collection(db, 'tags'), { ...t, createdAt: serverTimestamp() });
  };
  const updateTag = async (updated: Tag) => {
    const { id, ...data } = updated;
    await updateDoc(doc(db, 'tags', id), data);
  };
  const deleteTag = async (id: string) => {
    await deleteDoc(doc(db, 'tags', id));
  };

  const addProgram = async (p: Omit<Program, 'id'>) => {
    await addDoc(collection(db, 'programs'), { ...p, createdAt: serverTimestamp() });
  };
  const addActivity = async (a: Omit<Activity, 'id'>) => {
    await addDoc(collection(db, 'activities'), { ...a, createdAt: serverTimestamp() });
  };
  const addSubActivity = async (s: Omit<SubActivity, 'id'>) => {
    await addDoc(collection(db, 'subActivities'), { ...s, createdAt: serverTimestamp() });
  };
  const deleteSubActivity = async (id: string) => {
    await deleteDoc(doc(db, 'subActivities', id));
  };

  const toggleTag = async (subActivityId: string, tagId: string) => {
    const docId = `${subActivityId}_${tagId}`;
    const exists = budgetTags.some(bt => bt.subActivityId === subActivityId && bt.tagId === tagId);
    if (exists) {
      await deleteDoc(doc(db, 'budgetTags', docId));
    } else {
      await setDoc(doc(db, 'budgetTags', docId), { subActivityId, tagId });
    }
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'master', label: 'Data Master', icon: Database, children: [
      { id: 'opd', label: 'Master OPD', icon: Building2 },
      { id: 'program', label: 'Program/Kegiatan', icon: FolderTree },
      { id: 'tag', label: 'Master Tagging', icon: Target },
    ]},
    { id: 'tagging', label: 'Tagging Anggaran', icon: Tags },
    { id: 'laporan', label: 'Laporan Tagging', icon: FileText },
  ];

  if (!isAuthReady) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-primary gap-4">
        <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin" />
        <p className="text-white/60 text-sm font-medium animate-pulse">Menghubungkan ke Server...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-[#F1F5F9] p-4 font-sans">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white w-full max-w-[400px] rounded-[16px] border border-border shadow-2xl overflow-hidden p-8 flex flex-col items-center text-center"
        >
          <div className="w-16 h-20 rounded-[8px] bg-[#FFD700] flex items-center justify-center mb-6 shadow-lg">
            <span className="font-bold text-xl text-primary text-center leading-tight uppercase">NTB</span>
          </div>
          <h2 className="text-2xl font-bold text-text-main mb-2">E-Tagging NTB</h2>
          <p className="text-text-muted text-sm mb-8">Sistem Informasi Tagging Anggaran Prioritas Provinsi Nusa Tenggara Barat</p>
          
          <button 
            onClick={login}
            className="w-full flex items-center justify-center gap-3 bg-primary text-white px-6 py-4 rounded-[8px] font-bold text-sm shadow-xl hover:bg-opacity-90 transition-all active:scale-95 group"
          >
            <LogIn size={20} className="group-hover:translate-x-1 transition-transform" /> 
            Masuk dengan Google
          </button>
          
          <p className="mt-8 text-[11px] text-text-muted leading-relaxed">
            Gunakan akun email resmi <b>@gmail.com</b> atau <b>@ntbprov.go.id</b><br/>
            untuk mengakses database BKAD.
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background font-sans text-text-main overflow-hidden">
      {/* Sidebar */}
      <aside 
        className={`${isSidebarOpen ? 'w-[260px]' : 'w-20'} bg-primary text-white transition-all duration-300 ease-in-out flex flex-col z-20 border-r border-white/10 shadow-xl`}
      >
        <div className="p-6 pb-8 flex items-center gap-3">
          <div className="w-8 h-10 rounded-[4px] bg-[#FFD700] flex items-center justify-center shrink-0 shadow-sm">
            <span className="font-bold text-[10px] text-primary text-center leading-tight uppercase">NTB</span>
          </div>
          {isSidebarOpen && (
            <div className="overflow-hidden whitespace-nowrap">
              <h1 className="font-bold text-sm tracking-tight leading-none">SiTAG Anggaran</h1>
              <p className="text-[10px] text-white/70 font-medium italic">Provinsi NTB</p>
            </div>
          )}
        </div>

        <nav className="flex-1 overflow-y-auto py-2 custom-scrollbar">
          <ul className="space-y-1">
            {navItems.map((item) => (
              <li key={item.id}>
                {item.children ? (
                  <div className="mt-4">
                    {isSidebarOpen && (
                      <p className="px-6 py-2 text-[11px] font-bold text-white/40 uppercase tracking-[0.1em]">
                        {item.label}
                      </p>
                    )}
                    {item.children.map(child => (
                      <button
                        key={child.id}
                        onClick={() => setCurrentView(child.id as View)}
                        className={`w-full flex items-center gap-3 px-6 py-3 transition-colors relative group ${
                          currentView === child.id 
                            ? 'bg-white/10 text-white' 
                            : 'text-white/60 hover:bg-white/5 hover:text-white'
                        }`}
                      >
                        {currentView === child.id && <div className="absolute left-0 top-0 bottom-0 w-1 bg-accent" />}
                        <child.icon size={18} className={currentView === child.id ? 'text-accent' : ''} />
                        {isSidebarOpen && <span className="font-medium text-[14px]">{child.label}</span>}
                      </button>
                    ))}
                  </div>
                ) : (
                  <button
                    onClick={() => setCurrentView(item.id as View)}
                    className={`w-full flex items-center gap-3 px-6 py-3 transition-colors relative group ${
                      currentView === item.id 
                        ? 'bg-white/10 text-white' 
                        : 'text-white/60 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    {currentView === item.id && <div className="absolute left-0 top-0 bottom-0 w-1 bg-accent" />}
                    <item.icon size={18} className={currentView === item.id ? 'text-accent' : ''} />
                    {isSidebarOpen && <span className="font-medium text-[14px]">{item.label}</span>}
                  </button>
                )}
              </li>
            ))}
          </ul>
        </nav>

        <div className="p-4 border-t border-white/10">
          <button 
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-2 text-white/40 hover:text-white transition-colors text-[12px] font-medium"
          >
            <LogOut size={16} />
            {isSidebarOpen && <span>Logout Sesi</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-[72px] bg-surface border-b border-border px-8 flex items-center justify-between sticky top-0 z-10 shrink-0">
          <div>
            <h2 className="text-[18px] font-semibold text-text-main tracking-tight">
              {currentView === 'dashboard' && 'Dashboard Ringkasan'}
              {currentView === 'opd' && 'Master Data OPD'}
              {currentView === 'program' && 'Program & Kegiatan'}
              {currentView === 'tag' && 'Master Tagging'}
              {currentView === 'tagging' && 'Tagging Anggaran'}
            </h2>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-right hidden md:block">
              <p className="text-sm font-semibold text-text-main leading-none">{user?.displayName || 'Admin BKAD'}</p>
              <p className="text-[12px] text-text-muted">{user?.email || 'Provinsi NTB'}</p>
            </div>
            <div className="w-9 h-9 rounded-full bg-border overflow-hidden flex items-center justify-center font-bold text-text-muted text-sm shadow-sm ring-2 ring-background">
              {user?.photoURL ? (
                <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                user?.displayName?.charAt(0) || 'B'
              )}
            </div>
          </div>
        </header>

        {/* View Container */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-background">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentView}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {currentView === 'dashboard' && (
                <DashboardView 
                  subActivities={subActivities} 
                  tags={tags} 
                  budgetTags={budgetTags} 
                />
              )}
              {currentView === 'opd' && (
                <MasterOPDView 
                  opds={opds} 
                  onAdd={addOPD}
                  onUpdate={updateOPD}
                  onDelete={deleteOPD}
                />
              )}
              {currentView === 'program' && (
                <MasterProgramView 
                  opds={opds} 
                  programs={programs} 
                  activities={activities} 
                  subActivities={subActivities} 
                  onAddProgram={addProgram}
                  onAddActivity={addActivity}
                  onAddSubActivity={addSubActivity}
                  onDeleteSubActivity={deleteSubActivity}
                />
              )}
              {currentView === 'tag' && (
                <MasterTagView 
                  tags={tags} 
                  onAdd={addTag}
                  onUpdate={updateTag}
                  onDelete={deleteTag}
                />
              )}
              {currentView === 'tagging' && (
                <TaggingView 
                  subActivities={subActivities} 
                  tags={tags} 
                  budgetTags={budgetTags} 
                  onToggleTag={toggleTag}
                />
              )}
              {currentView === 'laporan' && (
                <LaporanView 
                  subActivities={subActivities} 
                  tags={tags} 
                  budgetTags={budgetTags} 
                  opds={opds}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

// --- Shared Components ---

function Modal({ title, isOpen, onClose, children }: { title: string, isOpen: boolean, onClose: () => void, children: React.ReactNode }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-[2px]">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-surface w-full max-w-md rounded-[12px] border border-border shadow-2xl overflow-hidden"
      >
        <div className="p-4 px-6 border-b border-border flex items-center justify-between bg-slate-50">
          <h3 className="font-bold text-text-main text-[16px]">{title}</h3>
          <button onClick={onClose} className="text-text-muted hover:text-text-main transition-colors p-1 hover:bg-slate-200 rounded">
            <X size={20} />
          </button>
        </div>
        <div className="p-6">
          {children}
        </div>
      </motion.div>
    </div>
  );
}

// --- View Components ---

function DashboardView({ subActivities, tags, budgetTags }: { subActivities: SubActivity[], tags: Tag[], budgetTags: BudgetTag[] }) {
  const chartData = useMemo(() => {
    return tags.map(tag => {
      const associatedSubActivities = budgetTags
        .filter(bt => bt.tagId === tag.id)
        .map(bt => subActivities.find(s => s.id === bt.subActivityId))
        .filter((s): s is SubActivity => s !== undefined);
      
      const totalBudget = associatedSubActivities.reduce((sum, s) => sum + s.budget, 0);
      return {
        name: tag.name,
        value: totalBudget,
        count: associatedSubActivities.length,
        color: tag.color
      };
    }).filter(d => d.value > 0);
  }, [subActivities, tags, budgetTags]);

  const totalBudget = subActivities.reduce((sum, s) => sum + s.budget, 0);
  const taggedBudget = chartData.reduce((sum, d) => sum + d.value, 0);
  const taggingPercentage = (taggedBudget / totalBudget) * 100;

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Total Anggaran 2024', value: `Rp ${(totalBudget / 1e9).toFixed(2)} T`, trend: 'Terkunci: 92%' },
          { label: 'Sub-Kegiatan Tertagging', value: budgetTags.length.toLocaleString(), trend: '+12 minggu ini' },
          { label: 'Alokasi Stunting', value: `Rp ${(taggedBudget / 1e9).toFixed(2)} M`, trend: 'Prioritas Utama', isAccent: true },
          { label: 'Tingkat Tagging', value: `${taggingPercentage.toFixed(1)}%`, trend: 'Target: 100%' },
        ].map((stat, i) => (
          <motion.div 
            key={stat.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            className="bg-surface p-5 rounded-[8px] border border-border shadow-[0_1px_3px_rgba(0,0,0,0.05)]"
          >
            <p className="text-[12px] font-semibold text-text-muted uppercase tracking-tight mb-2">{stat.label}</p>
            <h3 className="text-[24px] font-bold text-primary">{stat.value}</h3>
            <p className={`text-[12px] mt-1 font-medium ${stat.isAccent ? 'text-accent' : 'text-[#059669]'}`}>{stat.trend}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Pie Chart */}
        <div className="bg-surface p-8 rounded-[8px] border border-border shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-semibold text-text-main text-[14px]">Distribusi Anggaran per Tagging</h3>
            <BarChart3 size={18} className="text-text-muted" />
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number) => `Rp ${value.toLocaleString()}`}
                  contentStyle={{ borderRadius: '8px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                />
                <Legend layout="vertical" align="right" verticalAlign="middle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bar Chart */}
        <div className="bg-surface p-8 rounded-[8px] border border-border shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-semibold text-text-main text-[14px]">Jumlah Sub-Kegiatan per Tagging</h3>
            <Target size={18} className="text-text-muted" />
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748B' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748B' }} />
                <Tooltip cursor={{ fill: '#F8FAFC' }} />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

function MasterOPDView({ opds, onAdd, onUpdate, onDelete }: { 
  opds: OPD[], 
  onAdd: (o: Omit<OPD, 'id'>) => void,
  onUpdate: (o: OPD) => void,
  onDelete: (id: string) => void
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOpd, setEditingOpd] = useState<OPD | null>(null);
  const [formData, setFormData] = useState({ name: '', code: '' });

  const filtered = opds.filter(o => o.name.toLowerCase().includes(searchTerm.toLowerCase()) || o.code.includes(searchTerm));

  const openAdd = () => {
    setEditingOpd(null);
    setFormData({ name: '', code: '' });
    setIsModalOpen(true);
  };

  const openEdit = (opd: OPD) => {
    setEditingOpd(opd);
    setFormData({ name: opd.name, code: opd.code });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingOpd) {
      onUpdate({ ...editingOpd, ...formData });
    } else {
      onAdd(formData);
    }
    setIsModalOpen(false);
  };

  const handleImportExcel = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Mock logic for importing
      alert(`Importing ${file.name}... (Fitur ini sedang dalam pengembangan simulasinya)`);
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-surface rounded-[8px] border border-border shadow-[0_1px_3px_rgba(0,0,0,0.05)] overflow-hidden">
        <div className="p-4 border-b border-border flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-4">
            <div className="bg-surface border border-border rounded-[4px] p-2 px-3 flex items-center gap-2">
              <Search size={14} className="text-text-muted" />
              <input 
                type="text" 
                placeholder="Cari OPD..." 
                className="bg-transparent border-none outline-none text-[13px] w-48 lg:w-64" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <label className="bg-slate-100 text-text-muted px-4 py-2 rounded-[4px] text-[12px] font-semibold flex items-center gap-2 hover:bg-slate-200 transition-colors shadow-sm cursor-pointer border border-border">
              <Upload size={16} /> Import Excel
              <input type="file" accept=".xlsx, .xls, .csv" className="hidden" onChange={handleImportExcel} />
            </label>
            <button 
              onClick={openAdd}
              className="bg-primary text-white px-4 py-2 rounded-[4px] text-[12px] font-semibold flex items-center gap-2 hover:bg-opacity-90 transition-colors shadow-sm"
            >
              <Plus size={16} /> Tambah OPD
            </button>
          </div>
        </div>
        <table className="w-full text-left border-collapse text-[13px]">
          <thead>
            <tr className="bg-[#F8FAFC]">
              <th className="px-6 py-4 font-semibold text-text-muted border-b border-border">Kode</th>
              <th className="px-6 py-4 font-semibold text-text-muted border-b border-border">Nama OPD</th>
              <th className="px-6 py-4 font-semibold text-text-muted border-b border-border text-center">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((opd) => (
              <tr key={opd.id} className="hover:bg-slate-50 transition-colors group border-b border-border">
                <td className="px-6 py-4 font-mono text-[11px] text-primary font-semibold">{opd.code}</td>
                <td className="px-6 py-4 font-semibold text-text-main">{opd.name}</td>
                <td className="px-6 py-4">
                  <div className="flex justify-center gap-2">
                    <button 
                      onClick={() => openEdit(opd)}
                      className="p-1 px-3 text-primary hover:bg-primary/10 rounded transition-all font-medium flex items-center gap-1.5"
                    >
                      <Edit2 size={12} /> Edit
                    </button>
                    <button 
                      onClick={() => onDelete(opd.id)}
                      className="p-1 px-3 text-red-600 hover:bg-red-50 rounded transition-all font-medium flex items-center gap-1.5"
                    >
                      <Trash2 size={12} /> Hapus
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal title={editingOpd ? 'Edit OPD' : 'Tambah OPD'} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-text-muted uppercase tracking-wider">Kode OPD</label>
            <input 
              required
              className="w-full bg-background border border-border rounded p-2 text-[13px] outline-none focus:border-primary"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              placeholder="Contoh: 1.01.01"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-text-muted uppercase tracking-wider">Nama OPD</label>
            <input 
              required
              className="w-full bg-background border border-border rounded p-2 text-[13px] outline-none focus:border-primary"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Contoh: Dinas Kesehatan"
            />
          </div>
          <div className="pt-4 flex gap-3">
            <button 
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="flex-1 py-2 text-[12px] font-bold text-text-muted border border-border rounded hover:bg-slate-50"
            >
              BATAL
            </button>
            <button 
              type="submit"
              className="flex-1 py-2 text-[12px] font-bold text-white bg-primary rounded hover:bg-opacity-90 flex items-center justify-center gap-2"
            >
              <Save size={14} /> SIMPAN DATA
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

function MasterProgramView({ 
  opds, programs, activities, subActivities,
  onAddProgram, onAddActivity, onAddSubActivity, onDeleteSubActivity
}: { 
  opds: OPD[], 
  programs: Program[], 
  activities: Activity[], 
  subActivities: SubActivity[],
  onAddProgram: (p: Omit<Program, 'id'>) => void,
  onAddActivity: (a: Omit<Activity, 'id'>) => void,
  onAddSubActivity: (s: Omit<SubActivity, 'id'>) => void,
  onDeleteSubActivity: (id: string) => void
}) {
  const [selectedOpdId, setSelectedOpdId] = useState<string>('all');
  const [expandedProgramIds, setExpandedProgramIds] = useState<Set<string>>(new Set());
  const [expandedActivityIds, setExpandedActivityIds] = useState<Set<string>>(new Set());
  
  const [modalMode, setModalMode] = useState<'program' | 'activity' | 'sub'>('program');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [parentOpdId, setParentOpdId] = useState<string>(opds[0]?.id || '');
  const [parentProgramId, setParentProgramId] = useState<string>('');
  const [parentActivityId, setParentActivityId] = useState<string>('');

  const [formData, setFormData] = useState({ name: '', code: '', budget: 0 });

  const toggleProgram = (id: string) => {
    const next = new Set(expandedProgramIds);
    if (next.has(id)) next.delete(id); else next.add(id);
    setExpandedProgramIds(next);
  };

  const toggleActivity = (id: string) => {
    const next = new Set(expandedActivityIds);
    if (next.has(id)) next.delete(id); else next.add(id);
    setExpandedActivityIds(next);
  };

  const openAddProgram = () => {
    setModalMode('program');
    setFormData({ name: '', code: '', budget: 0 });
    setParentOpdId(selectedOpdId === 'all' ? opds[0]?.id : selectedOpdId);
    setIsModalOpen(true);
  };

  const openAddActivity = (programId: string) => {
    setModalMode('activity');
    setFormData({ name: '', code: '', budget: 0 });
    setParentProgramId(programId);
    setIsModalOpen(true);
  };

  const openAddSub = (activityId: string) => {
    setModalMode('sub');
    setFormData({ name: '', code: '', budget: 0 });
    setParentActivityId(activityId);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (modalMode === 'program') {
      onAddProgram({ name: formData.name, code: formData.code, opdId: parentOpdId });
    } else if (modalMode === 'activity') {
      onAddActivity({ name: formData.name, code: formData.code, programId: parentProgramId });
    } else {
      onAddSubActivity({ name: formData.name, code: formData.code, activityId: parentActivityId, budget: formData.budget });
    }
    setIsModalOpen(false);
  };

  const filteredPrograms = programs.filter(p => selectedOpdId === 'all' || p.opdId === selectedOpdId);

  const handleImportExcel = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      alert(`Importing ${file.name}... (Fitur ini sedang dalam pengembangan simulasinya)`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-surface p-4 px-6 rounded-[8px] border border-border flex items-center justify-between shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
         <div className="flex items-center gap-4">
          <div className="bg-surface border border-border rounded-[4px] p-2 px-3 flex items-center gap-2">
            <Filter size={14} className="text-text-muted" />
            <select 
              value={selectedOpdId}
              onChange={(e) => setSelectedOpdId(e.target.value)}
              className="bg-transparent border-none outline-none text-[13px] font-medium text-text-main"
            >
              <option value="all">Semua OPD</option>
              {opds.map(opd => <option key={opd.id} value={opd.id}>{opd.name}</option>)}
            </select>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <label className="bg-slate-100 text-text-muted px-4 py-2 rounded-[4px] text-[12px] font-semibold flex items-center gap-2 hover:bg-slate-200 transition-colors shadow-sm cursor-pointer border border-border">
            <Upload size={16} /> Import Excel
            <input type="file" accept=".xlsx, .xls, .csv" className="hidden" onChange={handleImportExcel} />
          </label>
          <button 
            onClick={openAddProgram}
            className="bg-primary text-white px-4 py-2 rounded-[4px] text-[12px] font-semibold flex items-center gap-2 hover:bg-opacity-90 transition-colors shadow-sm"
          >
            <Plus size={16} /> Tambah Program
          </button>
        </div>
      </div>

      <div className="bg-surface rounded-[8px] border border-border shadow-[0_1px_3px_rgba(0,0,0,0.05)] overflow-hidden">
        <table className="w-full text-left border-collapse text-[13px]">
          <thead>
            <tr className="bg-[#F8FAFC]">
              <th className="px-6 py-4 font-semibold text-text-muted border-b border-border">Kode</th>
              <th className="px-6 py-4 font-semibold text-text-muted border-b border-border">Nomanclature</th>
              <th className="px-6 py-4 font-semibold text-text-muted border-b border-border text-right">Anggaran</th>
              <th className="px-6 py-4 font-semibold text-text-muted border-b border-border text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filteredPrograms.map(p => (
              <React.Fragment key={p.id}>
                <tr className="bg-slate-50/50 group">
                  <td className="px-6 py-3 font-mono text-[11px] font-bold text-text-main flex items-center gap-2">
                    <button onClick={() => toggleProgram(p.id)} className="p-1 hover:bg-white rounded transition-colors">
                      {expandedProgramIds.has(p.id) ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                    </button>
                    {p.code}
                  </td>
                  <td className="px-6 py-3 font-bold text-text-main text-[13px] uppercase">{p.name}</td>
                  <td className="px-6 py-3"></td>
                  <td className="px-6 py-3 text-right">
                    <button 
                      onClick={() => openAddActivity(p.id)}
                      className="text-[10px] font-bold bg-primary/10 text-primary px-2 py-1 rounded hover:bg-primary/20 transition-colors"
                    >
                      TAMBAH KEGIATAN
                    </button>
                  </td>
                </tr>
                {expandedProgramIds.has(p.id) && activities.filter(a => a.programId === p.id).map(a => (
                  <React.Fragment key={a.id}>
                    <tr className="bg-surface group">
                      <td className="px-6 py-3 font-mono text-[11px] font-semibold text-text-muted pl-12 flex items-center gap-2">
                        <button onClick={() => toggleActivity(a.id)} className="p-1 hover:bg-slate-100 rounded transition-colors">
                          {expandedActivityIds.has(a.id) ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                        </button>
                        {a.code}
                      </td>
                      <td className="px-6 py-3 font-semibold text-text-main text-[13px]">{a.name}</td>
                      <td className="px-6 py-3"></td>
                      <td className="px-6 py-3 text-right">
                         <button 
                          onClick={() => openAddSub(a.id)}
                          className="text-[10px] font-bold bg-amber-500/10 text-amber-600 px-2 py-1 rounded hover:bg-amber-500/20 transition-colors"
                        >
                          TAMBAH SUB
                        </button>
                      </td>
                    </tr>
                    {expandedActivityIds.has(a.id) && subActivities.filter(s => s.activityId === a.id).map(s => (
                      <tr key={s.id} className="bg-surface hover:bg-slate-50 transition-colors border-b border-border last:border-0 group">
                        <td className="px-6 py-3 font-mono text-[11px] text-primary pl-24">{s.code}</td>
                        <td className="px-6 py-3 text-text-muted text-[13px]">{s.name}</td>
                        <td className="px-6 py-3 text-right font-mono font-bold text-primary">Rp {s.budget.toLocaleString()}</td>
                        <td className="px-6 py-3 text-right">
                          <button 
                            onClick={() => onDeleteSubActivity(s.id)}
                            className="p-1.5 text-text-muted hover:text-red-600 transition-colors opacity-0 group-hover:opacity-100"
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </React.Fragment>
                ))}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      <Modal 
        title={`Tambah ${modalMode === 'program' ? 'Program' : modalMode === 'activity' ? 'Kegiatan' : 'Sub-Kegiatan'}`} 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-text-muted uppercase tracking-wider">Kode</label>
            <input 
              required
              className="w-full bg-background border border-border rounded p-2 text-[13px] outline-none focus:border-primary"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              placeholder="Contoh: 1.01.01"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-text-muted uppercase tracking-wider">Nomenklatur</label>
            <input 
              required
              className="w-full bg-background border border-border rounded p-2 text-[13px] outline-none focus:border-primary"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Contoh: Program Pelayanan"
            />
          </div>
          {modalMode === 'sub' && (
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-text-muted uppercase tracking-wider">Anggaran (Rp)</label>
              <input 
                required
                type="number"
                className="w-full bg-background border border-border rounded p-2 text-[13px] outline-none focus:border-primary"
                value={formData.budget}
                onChange={(e) => setFormData({ ...formData, budget: parseInt(e.target.value) || 0 })}
              />
            </div>
          )}
          <div className="pt-4 flex gap-3">
            <button 
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="flex-1 py-2 text-[12px] font-bold text-text-muted border border-border rounded hover:bg-slate-50"
            >
              BATAL
            </button>
            <button 
              type="submit"
              className="flex-1 py-2 text-[12px] font-bold text-white bg-primary rounded hover:bg-opacity-90 flex items-center justify-center gap-2"
            >
              <Save size={14} /> SIMPAN DATA
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

function MasterTagView({ tags, onAdd, onUpdate, onDelete }: { 
  tags: Tag[],
  onAdd: (t: Omit<Tag, 'id'>) => void,
  onUpdate: (t: Tag) => void,
  onDelete: (id: string) => void
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const [formData, setFormData] = useState({ name: '', color: '#000000', type: 'Daerah' as const });

  const openAdd = () => {
    setEditingTag(null);
    setFormData({ name: '', color: '#FFD700', type: 'Daerah' });
    setIsModalOpen(true);
  };

  const openEdit = (tag: Tag) => {
    setEditingTag(tag);
    setFormData({ name: tag.name, color: tag.color, type: tag.type });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingTag) {
      onUpdate({ ...editingTag, ...formData });
    } else {
      onAdd(formData);
    }
    setIsModalOpen(false);
  };

  const handleImportExcel = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      alert(`Importing ${file.name}... (Fitur ini sedang dalam pengembangan simulasinya)`);
    }
  };

  return (
    <div className="bg-surface rounded-[8px] border border-border shadow-[0_1px_3px_rgba(0,0,0,0.05)] overflow-hidden">
      <div className="p-4 px-6 border-b border-border flex items-center justify-between bg-slate-50/50">
        <h3 className="font-semibold text-text-main text-[14px]">Daftar Tagging Prioritas</h3>
        <div className="flex items-center gap-2">
          <label className="bg-slate-100 text-text-muted px-4 py-2 rounded-[4px] text-[12px] font-semibold flex items-center gap-2 hover:bg-slate-200 transition-colors shadow-sm cursor-pointer border border-border">
            <Upload size={16} /> Import Excel
            <input type="file" accept=".xlsx, .xls, .csv" className="hidden" onChange={handleImportExcel} />
          </label>
          <button 
            onClick={openAdd}
            className="bg-primary text-white px-4 py-2 rounded-[4px] text-[12px] font-semibold flex items-center gap-2 hover:bg-opacity-90 transition-colors shadow-sm"
          >
            <Plus size={16} /> Tambah Tagging
          </button>
        </div>
      </div>
      <table className="w-full text-left border-collapse text-[13px]">
        <thead>
          <tr className="bg-[#F8FAFC]">
            <th className="px-6 py-4 font-semibold text-text-muted border-b border-border">Warna</th>
            <th className="px-6 py-4 font-semibold text-text-muted border-b border-border">Kategori Tagging</th>
            <th className="px-6 py-4 font-semibold text-text-muted border-b border-border">Prioritas</th>
            <th className="px-6 py-4 font-semibold text-text-muted border-b border-border text-right">Aksi</th>
          </tr>
        </thead>
        <tbody>
          {tags.map((tag) => (
            <tr key={tag.id} className="hover:bg-slate-50 transition-colors border-b border-border">
              <td className="px-6 py-4">
                <div className="w-4 h-4 rounded-full shadow-inner" style={{ backgroundColor: tag.color }}></div>
              </td>
              <td className="px-6 py-4">
                <span className={`inline-block px-3 py-1 rounded-[99px] text-[11px] font-medium border ${
                  tag.name.toLowerCase().includes('stunting') ? 'bg-[#FEE2E2] text-[#991B1B] border-[#FECACA]' :
                  tag.name.toLowerCase().includes('kemiskinan') ? 'bg-[#FEF3C7] text-[#92400E] border-[#FDE68A]' :
                  tag.name.toLowerCase().includes('digital') ? 'bg-[#DBEAFE] text-[#1E40AF] border-[#BFDBFE]' :
                  'bg-[#E2E8F0] text-text-main border-border'
                }`}>
                  {tag.name}
                </span>
              </td>
              <td className="px-6 py-4 text-text-muted font-medium">
                {tag.type === 'Prioritas Nasional' ? 'Nasional' : 'Daerah'}
              </td>
              <td className="px-6 py-4 text-right">
                <div className="flex justify-end gap-2">
                  <button 
                    onClick={() => openEdit(tag)}
                    className="p-1 px-3 text-primary hover:bg-primary/10 rounded font-medium flex items-center gap-1.5"
                  >
                    <Edit2 size={12} /> Edit
                  </button>
                  <button 
                    onClick={() => onDelete(tag.id)}
                    className="p-1 px-3 text-red-600 hover:bg-red-50 rounded font-medium flex items-center gap-1.5"
                  >
                    <Trash2 size={12} /> Hapus
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <Modal title={editingTag ? 'Edit Tagging' : 'Tambah Tagging'} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-text-muted uppercase tracking-wider">Nama Tagging</label>
            <input 
              required
              className="w-full bg-background border border-border rounded p-2 text-[13px] outline-none focus:border-primary"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Contoh: Digitalisasi"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-text-muted uppercase tracking-wider">Warna</label>
            <div className="flex gap-2">
              <input 
                type="color"
                className="w-10 h-10 border-none bg-transparent cursor-pointer"
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
              />
              <input 
                className="flex-1 bg-background border border-border rounded p-2 text-[13px] outline-none"
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
              />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-text-muted uppercase tracking-wider">Tipe Prioritas</label>
            <select 
              className="w-full bg-background border border-border rounded p-2 text-[13px] outline-none focus:border-primary"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
            >
              <option value="Daerah">Prioritas Daerah</option>
              <option value="Prioritas Nasional">Prioritas Nasional</option>
            </select>
          </div>
          <div className="pt-4 flex gap-3">
            <button 
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="flex-1 py-2 text-[12px] font-bold text-text-muted border border-border rounded hover:bg-slate-50"
            >
              BATAL
            </button>
            <button 
              type="submit"
              className="flex-1 py-2 text-[12px] font-bold text-white bg-primary rounded hover:bg-opacity-90 flex items-center justify-center gap-2"
            >
              <Save size={14} /> SIMPAN DATA
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

function LaporanView({ subActivities, tags, budgetTags, opds }: { 
  subActivities: SubActivity[], 
  tags: Tag[], 
  budgetTags: BudgetTag[],
  opds: OPD[]
}) {
  const [selectedTag, setSelectedTag] = useState<string>('all');
  
  const reportData = useMemo(() => {
    let filteredTags = tags;
    if (selectedTag !== 'all') {
      filteredTags = tags.filter(t => t.id === selectedTag);
    }

    return filteredTags.map(tag => {
      const links = budgetTags.filter(bt => bt.tagId === tag.id);
      const items = links.map(link => {
        const sub = subActivities.find(s => s.id === link.subActivityId);
        return sub;
      }).filter(Boolean) as SubActivity[];

      const totalBudget = items.reduce((sum, s) => sum + s.budget, 0);

      return {
        tag,
        items,
        totalBudget
      };
    }).filter(d => d.items.length > 0);
  }, [tags, budgetTags, subActivities, selectedTag]);

  return (
    <div className="space-y-6">
      <div className="bg-surface p-4 px-6 rounded-[8px] border border-border flex flex-wrap gap-4 items-center justify-between shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
        <div className="flex items-center gap-4">
          <div className="bg-surface border border-border rounded-[4px] p-2 px-3 flex items-center gap-2">
            <Filter size={14} className="text-text-muted" />
            <select 
              value={selectedTag}
              onChange={(e) => setSelectedTag(e.target.value)}
              className="bg-transparent border-none outline-none text-[13px] font-medium text-text-main"
            >
              <option value="all">Semua Kategori Tagging</option>
              {tags.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>
        </div>
        <button className="bg-primary text-white px-4 py-2 rounded-[4px] text-[12px] font-semibold flex items-center gap-2 hover:bg-opacity-90 transition-colors shadow-sm">
          <FileText size={16} /> Export PDF/Excel
        </button>
      </div>

      <div className="space-y-8">
        {reportData.map(({ tag, items, totalBudget }) => (
          <div key={tag.id} className="bg-surface rounded-[8px] border border-border shadow-[0_1px_3px_rgba(0,0,0,0.05)] overflow-hidden">
            <div className="p-4 px-6 bg-slate-50/50 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: tag.color }}></div>
                <h3 className="font-bold text-text-main text-[15px] uppercase tracking-tight">{tag.name}</h3>
                <span className="text-[11px] font-bold text-text-muted bg-white border border-border px-2 py-0.5 rounded">
                  {items.length} Sub-Kegiatan
                </span>
              </div>
              <div className="text-right">
                <p className="text-[10px] uppercase font-bold text-text-muted tracking-wider leading-none">Total Alokasi</p>
                <p className="text-[16px] font-bold text-primary">Rp {totalBudget.toLocaleString()}</p>
              </div>
            </div>
            
            <table className="w-full text-left border-collapse text-[13px]">
              <thead>
                <tr className="bg-white">
                  <th className="px-6 py-3 font-semibold text-text-muted border-b border-border w-1/4">Kode Sub-Kegiatan</th>
                  <th className="px-6 py-3 font-semibold text-text-muted border-b border-border">Nama Sub-Kegiatan</th>
                  <th className="px-6 py-3 font-semibold text-text-muted border-b border-border text-right">Anggaran</th>
                </tr>
              </thead>
              <tbody>
                {items.map(sub => (
                  <tr key={sub.id} className="hover:bg-slate-50 transition-colors border-b border-border last:border-0 font-medium">
                    <td className="px-6 py-3 font-mono text-[11px] text-primary">{sub.code}</td>
                    <td className="px-6 py-3 text-text-main">{sub.name}</td>
                    <td className="px-6 py-3 text-right font-mono text-primary">Rp {sub.budget.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
        {reportData.length === 0 && (
          <div className="bg-surface p-12 text-center rounded-[8px] border border-border italic text-text-muted shadow-sm">
            Tidak ada data tagging untuk kriteria ini.
          </div>
        )}
      </div>
    </div>
  );
}

function TaggingView({ subActivities, tags, budgetTags, onToggleTag }: { 
  subActivities: SubActivity[], 
  tags: Tag[], 
  budgetTags: BudgetTag[],
  onToggleTag: (sId: string, tId: string) => void
}) {
  const [searchTerm, setSearchTerm] = useState('');
  
  const filtered = useMemo(() => {
    return subActivities.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()) || s.code.includes(searchTerm));
  }, [subActivities, searchTerm]);

  return (
    <div className="space-y-6">
      <div className="bg-surface p-4 px-6 rounded-[8px] border border-border flex flex-wrap gap-4 items-center justify-between shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
        <div className="bg-background border border-border rounded-[4px] p-2 px-4 flex items-center gap-3 w-full md:w-96">
          <Search size={16} className="text-text-muted" />
          <input 
            type="text" 
            placeholder="Cari Sub-Kegiatan..." 
            className="bg-transparent border-none outline-none text-[13px] w-full font-medium"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex gap-2">
          {tags.map(tag => (
            <div key={tag.id} className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-[4px] border border-border">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: tag.color }}></div>
              <span className="text-[10px] font-bold text-text-muted uppercase tracking-tight">{tag.name}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filtered.map(sub => (
          <motion.div 
            layout
            key={sub.id} 
            className="bg-surface p-6 rounded-[8px] border border-border hover:border-accent transition-all group shadow-[0_1px_3px_rgba(0,0,0,0.05)]"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-[11px] bg-slate-100 text-primary px-2 py-0.5 rounded font-bold border border-border">{sub.code}</span>
                  <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Sub-Kegiatan</span>
                </div>
                <h4 className="font-bold text-text-main leading-tight text-[15px]">{sub.name}</h4>
                <p className="text-[14px] font-mono font-bold text-primary">Rp {sub.budget.toLocaleString()}</p>
              </div>

              <div className="flex flex-wrap gap-2 md:justify-end shrink-0">
                {tags.map(tag => {
                  const isActive = budgetTags.some(bt => bt.subActivityId === sub.id && bt.tagId === tag.id);
                  return (
                    <button
                      key={tag.id}
                      onClick={() => onToggleTag(sub.id, tag.id)}
                      className={`px-3 py-1.5 rounded-[4px] text-[11px] font-semibold transition-all flex items-center gap-2 border-2 ${
                        isActive 
                          ? 'bg-primary border-primary text-white shadow-sm' 
                          : 'bg-surface border-border text-text-muted hover:border-accent hover:text-accent'
                      }`}
                    >
                      {!isActive && <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: tag.color }}></div>}
                      {tag.name}
                    </button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

