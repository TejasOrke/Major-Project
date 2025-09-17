import Navbar from "../components/Navbar";
import { useEffect, useState, useRef, useCallback } from "react";
import { FaUserGraduate, FaBriefcase, FaFileAlt, FaChartBar, FaTools, FaRobot } from "react-icons/fa";
import { FiTrendingUp, FiLayers, FiActivity } from "react-icons/fi";
import { AreaChart, Area, PieChart, Pie, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { Link } from 'react-router-dom';
import { getStudents, getInternships, getPlacements, getLORs } from '../api';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [students, setStudents] = useState([]);
  const [internships, setInternships] = useState([]);
  const [placements, setPlacements] = useState([]);
  const [lors, setLors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) setUser(JSON.parse(storedUser));
    (async () => {
      try {
        setLoading(true);
        const [stuRes, intRes, plaRes, lorRes] = await Promise.all([
          getStudents().catch(()=>({ data: [] })),
          getInternships().catch(()=>({ data: [] })),
          getPlacements().catch(()=>({ data: [] })),
          getLORs().catch(()=>({ data: [] }))
        ]);
        setStudents(stuRes.data || []);
        setInternships(intRes.data || []);
        setPlacements(plaRes.data || []);
        setLors(lorRes.data || []);
      } catch (e) { console.error('[Dashboard] fetch error', e); setError('Failed to load some data'); }
      finally { setLoading(false); }
    })();
  }, []);

  // Dummy datasets ONLY for graphs (requested); still using real counts elsewhere
  const placementData = [
    { name: 'Jan', count: 5 },
    { name: 'Feb', count: 9 },
    { name: 'Mar', count: 7 },
    { name: 'Apr', count: 12 },
    { name: 'May', count: 10 },
    { name: 'Jun', count: 14 }
  ];
  const internshipData = [
    { name: 'SDE', value: 22 },
    { name: 'Data Science', value: 15 },
    { name: 'DevOps', value: 9 },
    { name: 'Cybersecurity', value: 6 },
    { name: 'AI/ML', value: 11 }
  ];
  const lorData = [
    { name: 'Pending', value: 8, color: '#FBBF24' },
    { name: 'Approved', value: 15, color: '#3B82F6' },
    { name: 'Completed', value: 12, color: '#10B981' },
    { name: 'Rejected', value: 3, color: '#F97316' }
  ];
  const PALETTE = ['#6366F1','#10B981','#F59E0B','#F43F5E','#06B6D4','#8B5CF6','#EC4899','#84CC16'];

  const counts = {
    students: students.length,
    internships: internships.length,
    placements: placements.length,
    lors: lors.length,
    aiEligible: students.filter(s => Array.isArray(s.skills) && s.skills.length >= 3).length
  };

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center text-gray-400 bg-gradient-to-br from-gray-950 via-gray-900 to-black">Loading dashboard data...</div>;
  }

  return (
    <div className="app-main min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black text-white soft-scroll transition-all relative">
      <div className="w-full">
        <Navbar />
        <div className="max-w-7xl mx-auto p-8 space-y-12 fade-in">
          {error && <div className="rounded-md bg-red-600/20 border border-red-500/40 px-4 py-2 text-xs text-red-200">{error}</div>}
          <ImageCarousel />
          <div className="grid xl:grid-cols-[1fr_15rem] gap-10 items-start">
            <div className="space-y-12">
              <div className="grid xl:grid-cols-3 gap-8 items-start">
                <div className="xl:col-span-2 space-y-8">
                  <Panel title="Placement Trends" icon={<FiTrendingUp className="text-indigo-300" />}> 
                    <div className="h-72">
                      {placementData.length ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={placementData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                            <XAxis dataKey="name" stroke="#aaa" />
                            <YAxis stroke="#aaa" />
                            <Tooltip contentStyle={{ background:'#1f2937', border:'1px solid #374151' }} labelStyle={{ color:'#fff' }} />
                            <Legend />
                            <Area type="monotone" dataKey="count" stroke="#6366F1" fill="#6366F1" fillOpacity={0.35} />
                          </AreaChart>
                        </ResponsiveContainer>
                      ) : <div className="flex h-full items-center justify-center text-xs text-gray-500">No placement data</div>}
                    </div>
                  </Panel>
                  <Panel title="Internship Distribution" icon={<FiLayers className="text-fuchsia-300" />}> 
                    <div className="h-72">
                      {internshipData.length ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie data={internshipData} cx="50%" cy="50%" outerRadius={90} dataKey="value" label={({name, percent}) => `${name} ${(percent*100).toFixed(0)}%`}>
                              {internshipData.map((entry,i)=>(<Cell key={i} fill={PALETTE[i % PALETTE.length]} />))}
                            </Pie>
                            <Tooltip contentStyle={{ background:'#1f2937', border:'1px solid #374151' }} />
                            <Legend />
                          </PieChart>
                        </ResponsiveContainer>
                      ) : <div className="flex h-full items-center justify-center text-xs text-gray-500">No internship data</div>}
                    </div>
                  </Panel>
                </div>
                <div className="space-y-8">
                  <Panel title="LOR Status" icon={<FiActivity className="text-emerald-300" />}> 
                    <div className="h-72">
                      {lorData.length ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie data={lorData} cx="50%" cy="50%" outerRadius={90} dataKey="value" label={({name, percent}) => `${name} ${(percent*100).toFixed(0)}%`}>
                              {lorData.map((entry,i)=>(<Cell key={i} fill={entry.color} />))}
                            </Pie>
                            <Tooltip contentStyle={{ background:'#1f2937', border:'1px solid #374151' }} />
                            <Legend />
                          </PieChart>
                        </ResponsiveContainer>
                      ) : <div className="flex h-full items-center justify-center text-xs text-gray-500">No LOR data</div>}
                    </div>
                  </Panel>
                  <Panel title="Recent Activity" icon={<FiActivity className="text-pink-300" />}> 
                    <div className="flex h-72 items-center justify-center text-xs text-gray-500">No activity feed available</div>
                  </Panel>
                </div>
              </div>
            </div>
            <div className="hidden xl:block">
              <QuickActionsRail user={user} counts={counts} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Panel({ title, icon, children }) {
  return (
    <div className="glass rounded-2xl p-6 shadow-lg card-hover">
      <div className="flex items-center gap-3 mb-5">
        <span className="text-lg">{icon}</span>
        <h2 className="panel-title">{title}</h2>
      </div>
      {children}
    </div>
  );
}

function QuickActionsRail({ user, counts }) {
  const items = [
    { to: '/students', label: 'Students', icon: <FaUserGraduate />, count: counts.students },
    { to: '/internships', label: 'Internships', icon: <FaBriefcase />, count: counts.internships },
    { to: '/lors', label: 'LORs', icon: <FaFileAlt />, count: counts.lors },
    { to: '/placements', label: 'Placements', icon: <FaChartBar />, count: counts.placements },
    { to: '/students', label: 'AI LOR', icon: <FaRobot />, count: counts.aiEligible },
  ];
  if (user?.role === 'admin') items.push({ to: '/approve-user', label: 'Admin', icon: <FaTools />, color: 'from-rose-500 to-rose-600', count: 0 });
  return (
    <div className="flex flex-col gap-4 sticky top-32">
      {items.map((it,i) => (
        <Link key={i} to={it.to} title={it.label} className="group relative flex items-center gap-3 px-3 py-3 rounded-2xl theme-surface hover:bg-white/10 hover:border-white/20 transition overflow-hidden w-full">
          <span className="absolute inset-0 opacity-0 group-hover:opacity-100 theme-gradient-accent blur-lg transition" />
          <span className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-[rgba(var(--color-accent)/0.15)] border border-[rgba(var(--color-accent)/0.35)] shadow text-lg text-[rgba(var(--color-accent)/0.9)] group-hover:text-white group-hover:border-[rgba(var(--color-accent)/0.5)]">
            {it.icon}
          </span>
          <span className="relative flex flex-col leading-tight max-w-[6.5rem]">
            <span className="text-[11px] uppercase tracking-wider text-gray-400 group-hover:text-gray-200 truncate">{it.label}</span>
            <span className="text-xs font-semibold text-white/90 group-hover:text-white">{it.count}</span>
          </span>
          <span className="absolute -right-4 -top-4 w-14 h-14 rounded-full bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-60 transition pointer-events-none" />
        </Link>
      ))}
    </div>
  );
}

function ImageCarousel() {
  const slides = [
    { src: 'https://images.unsplash.com/photo-1529070538774-1843cb3265df?auto=format&fit=crop&w=1200&q=60', caption: 'Empowering Student Success' },
    { src: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=60', caption: 'Streamlined Internship Tracking' },
    { src: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=1200&q=60', caption: 'Data-Driven Placement Insights' },
    { src: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=60', caption: 'Intelligent LOR Generation' }
  ];
  const [index, setIndex] = useState(0);
  const timeoutRef = useRef(null);
  const DELAY = 5000;
  const reset = () => { if (timeoutRef.current) clearTimeout(timeoutRef.current); };
  const next = useCallback(() => setIndex(i => (i + 1) % slides.length), [slides.length]);
  const prev = () => setIndex(i => (i - 1 + slides.length) % slides.length);
  useEffect(() => { reset(); timeoutRef.current = setTimeout(next, DELAY); return () => reset(); }, [index, next]);
  return (
    <div className="relative group rounded-3xl overflow-hidden h-[300px] md:h-[380px] glass shadow-xl">
      <div className="absolute inset-0 flex transition-transform duration-700 ease-out" style={{ transform: `translateX(-${index * 100}%)` }}>
        {slides.map((s, i) => (
          <div key={i} className="relative min-w-full h-full select-none">
            <img src={s.src} alt={s.caption} className="object-cover w-full h-full opacity-80" loading="lazy" onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=1200&q=60'; }} />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent" />
            <div className="absolute bottom-6 left-8 right-8">
              <h3 className="text-2xl md:text-3xl font-bold tracking-tight text-white drop-shadow-lg max-w-xl">{s.caption}</h3>
            </div>
          </div>
        ))}
      </div>
      <button onClick={prev} className="opacity-0 group-hover:opacity-100 transition absolute top-1/2 -translate-y-1/2 left-4 bg-black/40 hover:bg-black/60 w-10 h-10 rounded-full flex items-center justify-center text-white backdrop-blur border border-white/10">‹</button>
      <button onClick={next} className="opacity-0 group-hover:opacity-100 transition absolute top-1/2 -translate-y-1/2 right-4 bg-black/40 hover:bg-black/60 w-10 h-10 rounded-full flex items-center justify-center text-white backdrop-blur border border-white/10">›</button>
      <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-3">
        {slides.map((_, i) => (
          <button key={i} onClick={() => setIndex(i)} className={`h-2 rounded-full transition-all ${i === index ? 'w-8 bg-white' : 'w-3 bg-white/40 hover:bg-white/70'}`} />
        ))}
      </div>
    </div>
  );
}