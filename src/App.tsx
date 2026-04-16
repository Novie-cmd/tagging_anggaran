/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo } from 'react';
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
  Target
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

type View = 'dashboard' | 'opd' | 'program' | 'tag' | 'tagging';

export default function App() {
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  
  // App State (In a real app, this would be from a context or database)
  const [opds] = useState<OPD[]>(INITIAL_OPDS);
  const [programs] = useState<Program[]>(INITIAL_PROGRAMS);
  const [activities] = useState<Activity[]>(INITIAL_ACTIVITIES);
  const [subActivities] = useState<SubActivity[]>(INITIAL_SUB_ACTIVITIES);
  const [tags] = useState<Tag[]>(INITIAL_TAGS);
  const [budgetTags, setBudgetTags] = useState<BudgetTag[]>(INITIAL_BUDGET_TAGS);

  const toggleTag = (subActivityId: string, tagId: string) => {
    setBudgetTags(prev => {
      const exists = prev.some(bt => bt.subActivityId === subActivityId && bt.tagId === tagId);
      if (exists) {
        return prev.filter(bt => !(bt.subActivityId === subActivityId && bt.tagId === tagId));
      }
      return [...prev, { subActivityId, tagId }];
    });
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'master', label: 'Data Master', icon: Database, children: [
      { id: 'opd', label: 'Master OPD', icon: Building2 },
      { id: 'program', label: 'Program/Kegiatan', icon: FolderTree },
      { id: 'tag', label: 'Master Tagging', icon: Target },
    ]},
    { id: 'tagging', label: 'Tagging Anggaran', icon: Tags },
  ];

  return (
    <div className="flex h-screen bg-[#F0F2F5] font-sans text-[#1A1A1A] overflow-hidden">
      {/* Sidebar */}
      <aside 
        className={`${isSidebarOpen ? 'w-72' : 'w-20'} bg-[#1E293B] text-white transition-all duration-300 ease-in-out flex flex-col z-20 shadow-xl`}
      >
        <div className="p-6 flex items-center gap-3 border-b border-slate-700/50">
          <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center shrink-0">
            <span className="font-bold text-lg italic text-white">N</span>
          </div>
          {isSidebarOpen && (
            <div className="overflow-hidden whitespace-nowrap">
              <h1 className="font-bold text-lg tracking-tight">E-TAGGING NTB</h1>
              <p className="text-[10px] text-slate-400 font-medium tracking-widest uppercase italic">Provinsi NTB</p>
            </div>
          )}
        </div>

        <nav className="flex-1 overflow-y-auto py-6 px-3 custom-scrollbar">
          <ul className="space-y-2">
            {navItems.map((item) => (
              <li key={item.id}>
                {item.children ? (
                  <div className="space-y-1">
                    {isSidebarOpen && (
                      <p className="px-4 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">
                        {item.label}
                      </p>
                    )}
                    {item.children.map(child => (
                      <button
                        key={child.id}
                        onClick={() => setCurrentView(child.id as View)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                          currentView === child.id 
                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' 
                            : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                        }`}
                      >
                        <child.icon size={20} />
                        {isSidebarOpen && <span className="font-medium text-sm">{child.label}</span>}
                      </button>
                    ))}
                  </div>
                ) : (
                  <button
                    onClick={() => setCurrentView(item.id as View)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                      currentView === item.id 
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' 
                        : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <item.icon size={20} />
                    {isSidebarOpen && <span className="font-medium text-sm">{item.label}</span>}
                  </button>
                )}
              </li>
            ))}
          </ul>
        </nav>

        <div className="p-4 border-t border-slate-700/50">
          <button 
            onClick={() => setSidebarOpen(!isSidebarOpen)}
            className="w-full flex items-center justify-center p-2 rounded-lg hover:bg-slate-800 transition-colors text-slate-400"
          >
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-20 bg-white border-b border-slate-200 px-8 flex items-center justify-between sticky top-0 z-10 shrink-0">
          <div>
            <h2 className="text-xl font-bold text-slate-800 tracking-tight">
              {currentView === 'dashboard' && 'Beranda Dashboard'}
              {currentView === 'opd' && 'Master Data OPD'}
              {currentView === 'program' && 'Program & Kegiatan'}
              {currentView === 'tag' && 'Master Tagging'}
              {currentView === 'tagging' && 'Tagging Anggaran'}
            </h2>
            <p className="text-xs text-slate-500 font-medium italic">
              Sistem Informasi Pelabelan Anggaran Tematik Daerah
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="bg-slate-100 p-2 px-3 rounded-full flex items-center gap-2 text-xs font-semibold text-slate-600 hidden md:flex">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              TA 2024
            </div>
            <div className="w-10 h-10 rounded-full bg-slate-200 border-2 border-white shadow-sm flex items-center justify-center font-bold text-slate-500">
              U
            </div>
          </div>
        </header>

        {/* View Container */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
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
              {currentView === 'opd' && <MasterOPDView opds={opds} />}
              {currentView === 'program' && <MasterProgramView opds={opds} programs={programs} activities={activities} subActivities={subActivities} />}
              {currentView === 'tag' && <MasterTagView tags={tags} />}
              {currentView === 'tagging' && (
                <TaggingView 
                  subActivities={subActivities} 
                  tags={tags} 
                  budgetTags={budgetTags} 
                  onToggleTag={toggleTag}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
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
        .filter(Boolean) as SubActivity[];
      
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
          { label: 'Total Anggaran', value: `Rp ${(totalBudget / 1e9).toFixed(2)} M`, color: 'bg-blue-500' },
          { label: 'Anggaran Terpapar', value: `Rp ${(taggedBudget / 1e9).toFixed(2)} M`, color: 'bg-emerald-500' },
          { label: 'Tingkat Tagging', value: `${taggingPercentage.toFixed(1)}%`, color: 'bg-orange-500' },
          { label: 'Jumlah Tag Aktif', value: chartData.length, color: 'bg-purple-500' },
        ].map((stat, i) => (
          <motion.div 
            key={stat.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200"
          >
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">{stat.label}</p>
            <div className="flex items-end justify-between">
              <h3 className="text-2xl font-black text-slate-800">{stat.value}</h3>
              <div className={`${stat.color} w-2 h-8 rounded-full opacity-20`}></div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Pie Chart */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-bold text-slate-800 italic">Distribusi Anggaran per Tagging</h3>
            <BarChart3 size={20} className="text-slate-400" />
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
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                />
                <Legend layout="vertical" align="right" verticalAlign="middle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bar Chart */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-bold text-slate-800 italic">Jumlah Sub-Kegiatan per Tagging</h3>
            <Target size={20} className="text-slate-400" />
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748B' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748B' }} />
                <Tooltip cursor={{ fill: '#F8FAFC' }} />
                <Bar dataKey="count" radius={[10, 10, 0, 0]}>
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

function MasterOPDView({ opds }: { opds: OPD[] }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
        <div className="flex items-center gap-4">
          <div className="bg-white border border-slate-200 rounded-lg p-2 px-3 flex items-center gap-2">
            <Search size={16} className="text-slate-400" />
            <input type="text" placeholder="Cari OPD..." className="bg-transparent border-none outline-none text-sm w-48 lg:w-64" />
          </div>
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-blue-700 transition-colors">
          <Plus size={18} /> Tambah OPD
        </button>
      </div>
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-slate-100 italic text-[11px] uppercase tracking-widest text-slate-400">
            <th className="px-6 py-4 font-bold">Kode</th>
            <th className="px-6 py-4 font-bold">Nama OPD</th>
            <th className="px-6 py-4 font-bold text-center">Aksi</th>
          </tr>
        </thead>
        <tbody>
          {opds.map((opd) => (
            <tr key={opd.id} className="border-b border-slate-50 hover:bg-slate-50/80 transition-colors group">
              <td className="px-6 py-4 font-mono text-xs text-blue-600 font-semibold">{opd.code}</td>
              <td className="px-6 py-4 font-bold text-slate-700">{opd.name}</td>
              <td className="px-6 py-4 flex justify-center gap-2">
                <button className="p-2 text-slate-400 hover:text-blue-600 transition-colors">Edit</button>
                <button className="p-2 text-slate-400 hover:text-red-600 transition-colors">Hapus</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function MasterProgramView({ opds, programs, activities, subActivities }: { opds: OPD[], programs: Program[], activities: Activity[], subActivities: SubActivity[] }) {
  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center justify-between">
         <div className="flex items-center gap-4">
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-2 px-3 flex items-center gap-2">
            <Filter size={16} className="text-slate-400" />
            <select className="bg-transparent border-none outline-none text-sm font-medium text-slate-600">
              <option>Semua OPD</option>
              {opds.map(opd => <option key={opd.id}>{opd.name}</option>)}
            </select>
          </div>
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-blue-700 transition-colors">
          <Plus size={18} /> Tambah Penomoran
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-100 italic text-[11px] uppercase tracking-widest text-slate-400">
              <th className="px-6 py-4 font-bold">Kode</th>
              <th className="px-6 py-4 font-bold">Nomenklatur (Program / Kegiatan / Sub-Kegiatan)</th>
              <th className="px-6 py-4 font-bold text-right">Anggaran</th>
            </tr>
          </thead>
          <tbody>
            {programs.map(p => (
              <>
                <tr key={p.id} className="bg-slate-50/50">
                  <td className="px-6 py-3 font-mono text-xs font-bold text-slate-900">{p.code}</td>
                  <td className="px-6 py-3 font-black text-slate-800 text-sm uppercase">{p.name}</td>
                  <td className="px-6 py-3"></td>
                </tr>
                {activities.filter(a => a.programId === p.id).map(a => (
                  <>
                    <tr key={a.id} className="bg-white">
                      <td className="px-6 py-3 font-mono text-xs font-semibold text-slate-500 pl-10">{a.code}</td>
                      <td className="px-6 py-3 font-bold text-slate-700 text-sm">{a.name}</td>
                      <td className="px-6 py-3"></td>
                    </tr>
                    {subActivities.filter(s => s.activityId === a.id).map(s => (
                      <tr key={s.id} className="bg-white border-b border-slate-50">
                        <td className="px-6 py-3 font-mono text-xs text-blue-500 pl-16">{s.code}</td>
                        <td className="px-6 py-3 text-slate-600 text-sm italic">{s.name}</td>
                        <td className="px-6 py-3 text-right font-mono font-bold text-slate-900">Rp {s.budget.toLocaleString()}</td>
                      </tr>
                    ))}
                  </>
                ))}
              </>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function MasterTagView({ tags }: { tags: Tag[] }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-6 border-b border-slate-100 flex items-center justify-between">
        <h3 className="font-bold text-slate-800 italic">Daftar Label Tagging</h3>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-blue-700 transition-colors">
          <Plus size={18} /> Tambah Tag
        </button>
      </div>
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-slate-100 italic text-[11px] uppercase tracking-widest text-slate-400">
            <th className="px-6 py-4 font-bold">Warna</th>
            <th className="px-6 py-4 font-bold">Nama Tag</th>
            <th className="px-6 py-4 font-bold">Tipe</th>
            <th className="px-6 py-4 font-bold text-center">Aksi</th>
          </tr>
        </thead>
        <tbody>
          {tags.map((tag) => (
            <tr key={tag.id} className="border-b border-slate-50">
              <td className="px-6 py-4">
                <div className="w-6 h-6 rounded-full shadow-inner" style={{ backgroundColor: tag.color }}></div>
              </td>
              <td className="px-6 py-4 font-bold text-slate-700">{tag.name}</td>
              <td className="px-6 py-4">
                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-tight ${
                  tag.type === 'Prioritas Nasional' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'
                }`}>
                  {tag.type}
                </span>
              </td>
              <td className="px-6 py-4 flex justify-center gap-2 text-sm">
                <button className="text-slate-400 hover:text-blue-600 font-bold">Edit</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
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
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-wrap gap-4 items-center justify-between">
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-2 px-4 flex items-center gap-3 w-full md:w-96">
          <Search size={18} className="text-slate-400" />
          <input 
            type="text" 
            placeholder="Cari Sub-Kegiatan..." 
            className="bg-transparent border-none outline-none text-sm w-full font-medium"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex gap-2">
          {tags.map(tag => (
            <div key={tag.id} className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-full">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: tag.color }}></div>
              <span className="text-[10px] font-bold text-slate-600 uppercase tracking-tight">{tag.name}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filtered.map(sub => (
          <motion.div 
            layout
            key={sub.id} 
            className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:border-blue-300 transition-all group"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded font-bold">{sub.code}</span>
                  <span className="text-xs font-bold text-slate-400 uppercase italic">Sub-Kegiatan</span>
                </div>
                <h4 className="font-bold text-slate-800 leading-tight">{sub.name}</h4>
                <p className="text-xs font-mono font-black text-slate-900 mt-1">Rp {sub.budget.toLocaleString()}</p>
              </div>

              <div className="flex flex-wrap gap-2">
                {tags.map(tag => {
                  const isActive = budgetTags.some(bt => bt.subActivityId === sub.id && bt.tagId === tag.id);
                  return (
                    <button
                      key={tag.id}
                      onClick={() => onToggleTag(sub.id, tag.id)}
                      className={`px-4 py-2 rounded-full text-[10px] font-black uppercase transition-all flex items-center gap-2 border-2 ${
                        isActive 
                          ? 'bg-blue-600 border-blue-600 text-white shadow-md' 
                          : 'bg-white border-slate-200 text-slate-400 hover:border-blue-400 hover:text-blue-500'
                      }`}
                    >
                      <div className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-white' : ''}`} style={{ backgroundColor: isActive ? '#FFF' : tag.color }}></div>
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

