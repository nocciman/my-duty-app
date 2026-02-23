import React, { useState, useEffect } from 'react';
import { initializeApp, getApps } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged, signInWithCustomToken } from 'firebase/auth';
import { getFirestore, collection, doc, setDoc, getDoc, addDoc, updateDoc, deleteDoc, onSnapshot } from 'firebase/firestore';

// --- アイコンコンポーネント (SVG) ---
const IconHome = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 18 0 9 9 0 0 0-18 0"/><path d="M12 7v5l3 3"/></svg>;
const IconCalendar = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><path d="M16 2v4"/><path d="M8 2v4"/><path d="M3 10h18"/></svg>;
const IconUsers = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>;
const IconSettings = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1Z"/></svg>;
const IconTrash = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>;
const IconPlus = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
const IconClose = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
const IconChevronRight = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>;
const IconLogOut = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>;

// --- 管理者パスワードの設定 ---
const MASTER_ADMIN_PASSCODE = "2525"; 

// --- Firebase Configuration ---
const getFirebaseConfig = () => {
  if (typeof __firebase_config !== 'undefined' && __firebase_config) {
    try {
      const config = JSON.parse(__firebase_config);
      if (config && config.apiKey) return config;
    } catch (e) {
      console.error("Firebase config parse error", e);
    }
  }
  return {
    apiKey: "AIzaSyDEw9TJCXWJlAoDgc1X1XCMl0LMKxrzLgg",
    authDomain: "duty-manager-33163.firebaseapp.com",
    projectId: "duty-manager-33163",
    storageBucket: "duty-manager-33163.firebasestorage.app",
    messagingSenderId: "709632134796",
    appId: "1:709632134796:web:62292d919b0dc83b7735a9",
    measurementId: "G-S05NOL39E0"
  };
};

const firebaseApp = getApps().length === 0 ? initializeApp(getFirebaseConfig()) : getApps()[0];
const auth = getAuth(firebaseApp);
const db = getFirestore(firebaseApp);

const rawAppId = typeof __app_id !== 'undefined' ? __app_id : 'duty-manager-v3-final';
const appId = String(rawAppId).replace(/\//g, '_');

export default function App() {
  const [user, setUser] = useState(null);
  const [groupId, setGroupId] = useState(null); 
  const [groupList, setGroupList] = useState([]);
  const [members, setMembers] = useState([]);
  const [events, setEvents] = useState([]);
  const [activeTab, setActiveTab] = useState('home');
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);

  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [adminPassInput, setAdminPassInput] = useState("");

  const [settings, setSettings] = useState({ appName: "当番管理", taskName: "用具" });
  const [modal, setModal] = useState({ open: false, title: '', content: '', onConfirm: null });
  const [isScheduleFormOpen, setIsScheduleFormOpen] = useState(false);

  // 一括作成用 State
  const [creationMode, setCreationMode] = useState('single');
  const [bulkStart, setBulkStart] = useState(new Date().toISOString().split('T')[0]);
  const [bulkEnd, setBulkEnd] = useState('');
  const [bulkDays, setBulkDays] = useState([0, 6]); // 初期値：土日

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const days = ['日', '月', '火', '水', '木', '金', '土'];
    const d = new Date(dateStr);
    return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日(${days[d.getDay()]})`;
  };

  const closeModal = () => setModal({ ...modal, open: false });

  // 1. Firebase 認証
  useEffect(() => {
    const initAuth = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (error) {
        console.error("Auth error:", error);
        const currentDomain = window.location.hostname;
        setErrorMsg(`認証エラー。Firebaseの設定を確認してください。\n(Domain: ${currentDomain})`);
      }
    };
    initAuth();

    const handleHashChange = () => setGroupId(window.location.hash.replace('#', '') || null);
    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return () => {
      unsubscribe();
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  // 2. 団体一覧取得 (管理者のみ)
  useEffect(() => {
    if (!user || groupId || !isAdminAuthenticated) return;
    const groupsRef = collection(db, 'artifacts', appId, 'public', 'data', 'groups');
    const unsub = onSnapshot(groupsRef, (snap) => {
      setGroupList(snap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)));
      setLoading(false);
    }, (err) => {
      console.error(err);
      setLoading(false);
    });
    return () => unsub();
  }, [user, groupId, isAdminAuthenticated]);

  // 3. 部屋別データ同期
  useEffect(() => {
    if (!user || !groupId) {
      if (!groupId) setLoading(false); 
      return;
    }
    setLoading(true);

    const membersCol = collection(db, 'artifacts', appId, 'public', 'data', `${groupId}_members`);
    const eventsCol = collection(db, 'artifacts', appId, 'public', 'data', `${groupId}_events`);
    const configDoc = doc(db, 'artifacts', appId, 'public', 'data', 'config', groupId);

    const unsubM = onSnapshot(membersCol, (s) => {
      setMembers(s.docs.map(d => ({ id: d.id, ...d.data() })).sort((a,b) => (a.count || 0) - (b.count || 0)));
      setLoading(false);
    }, () => setLoading(false));
    
    const unsubE = onSnapshot(eventsCol, (s) => {
      setEvents(s.docs.map(d => ({ id: d.id, ...d.data() })).sort((a,b) => new Date(b.date) - new Date(a.date)));
    });
    
    const unsubS = onSnapshot(configDoc, (d) => { 
      if (d.exists()) {
          const data = d.data();
          setSettings({ appName: String(data.appName || "当番管理"), taskName: String(data.taskName || "用具") });
      }
    });
    
    return () => { unsubM(); unsubE(); unsubS(); };
  }, [user, groupId]);

  const getDocRef = (baseName, id) => doc(db, 'artifacts', appId, 'public', 'data', `${groupId}_${baseName}`, id);
  const getColRef = (baseName) => collection(db, 'artifacts', appId, 'public', 'data', `${groupId}_${baseName}`);

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    const groupName = e.target.groupName.value.trim();
    if (!groupName || !user) return;
    const newGroupId = 'group_' + Date.now().toString(36);
    await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'groups', newGroupId), { name: String(groupName), createdAt: new Date().toISOString() });
    await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'config', newGroupId), { appName: String(groupName), taskName: "用具" });
    e.target.reset();
    window.location.hash = newGroupId;
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    const name = e.target.memberName.value.trim();
    if (!name || !user) return;
    let initialCount = 0;
    if (members.length > 0) initialCount = Math.floor(members.reduce((sum, m) => sum + (m.count || 0), 0) / members.length);
    await addDoc(getColRef('members'), { name: String(name), count: initialCount, active: true, createdAt: new Date().toISOString() });
    e.target.reset();
  };

  // 予定作成（単発）
  const handleProcessEvent = async (e) => {
    e.preventDefault();
    const date = e.target.date.value;
    const sets = parseInt(e.target.sets.value);
    const activeM = members.filter(m => m.active);
    if (activeM.length < sets) {
      setModal({ open: true, title: 'メンバー不足', content: '担当可能なメンバーが足りません。' });
      return;
    }
    
    const futureAssignments = events.filter(ev => !ev.completed).flatMap(ev => ev.assignedIds);
    const sortedMembers = [...activeM].sort((a, b) => {
       const scoreA = (a.count || 0) + futureAssignments.filter(id => id === a.id).length;
       const scoreB = (b.count || 0) + futureAssignments.filter(id => id === b.id).length;
       return scoreA - scoreB;
    });

    const selected = sortedMembers.slice(0, sets);
    await addDoc(getColRef('events'), { date, numSets: sets, assignedIds: selected.map(m => m.id), assignedNames: selected.map(m => String(m.name)), completed: false, createdAt: new Date().toISOString() });
    setIsScheduleFormOpen(false);
  };

  // 予定作成（一括）
  const handleBulkProcessEvent = async (e) => {
    e.preventDefault();
    if (bulkDays.length === 0 || !bulkEnd) return;
    
    const start = new Date(bulkStart);
    const end = new Date(bulkEnd);
    const sets = parseInt(e.target.bulkSets.value);
    const activeM = members.filter(m => m.active);
    
    const datesToSchedule = [];
    let curr = new Date(start);
    while (curr <= end) {
      if (bulkDays.includes(curr.getDay())) {
        datesToSchedule.push(curr.toISOString().split('T')[0]);
      }
      curr.setDate(curr.getDate() + 1);
    }

    if (datesToSchedule.length === 0) {
      setModal({ open: true, title: '該当なし', content: '指定期間内に該当する曜日がありません。' });
      return;
    }

    setModal({
      open: true, title: '一括作成の確認', content: `${datesToSchedule.length}件の予定を作成しますか？`,
      onConfirm: async () => {
        let futureAssignments = events.filter(ev => !ev.completed).flatMap(ev => ev.assignedIds);
        for (const d of datesToSchedule) {
          const sorted = [...activeM].sort((a, b) => {
            const scoreA = (a.count || 0) + futureAssignments.filter(id => id === a.id).length;
            const scoreB = (b.count || 0) + futureAssignments.filter(id => id === b.id).length;
            return scoreA - scoreB;
          });
          const selected = sorted.slice(0, sets);
          await addDoc(getColRef('events'), { date: d, numSets: sets, assignedIds: selected.map(m => m.id), assignedNames: selected.map(m => String(m.name)), completed: false, createdAt: new Date().toISOString() });
          futureAssignments.push(...selected.map(m => m.id));
        }
        setIsScheduleFormOpen(false);
        setModal({ ...modal, open: false });
      }
    });
  };

  const completeEvent = async (event) => {
    setModal({
      open: true, title: '完了の確認', content: '当番を完了として記録し、回数を加算しますか？',
      onConfirm: async () => {
        for (const mid of event.assignedIds) {
          const mRef = getDocRef('members', mid);
          const mSnap = await getDoc(mRef);
          if (mSnap.exists()) await updateDoc(mRef, { count: (mSnap.data().count || 0) + 1 });
        }
        await updateDoc(getDocRef('events', event.id), { completed: true });
        setModal({ ...modal, open: false });
      }
    });
  };

  const checkAdminAuth = () => {
    if (adminPassInput === MASTER_ADMIN_PASSCODE) setIsAdminAuthenticated(true);
    else setModal({ open: true, title: "認証失敗", content: "パスワードが正しくありません。" });
  };

  if (errorMsg) return (
    <div className="min-h-screen bg-red-50 flex items-center justify-center p-8 font-sans">
      <div className="bg-white p-8 rounded-3xl shadow-xl max-w-sm border-2 border-red-100 text-center animate-in zoom-in-95">
        <h2 className="text-red-600 font-black text-xl mb-4 text-center">⚠️ 接続エラー</h2>
        <p className="text-slate-600 text-sm leading-relaxed mb-6 whitespace-pre-wrap font-bold">{errorMsg}</p>
        <button onClick={() => window.location.reload()} className="w-full bg-red-600 text-white font-bold py-4 rounded-2xl shadow-lg">再読み込み</button>
      </div>
    </div>
  );

  if (loading) return <div className="flex flex-col h-screen items-center justify-center bg-slate-50 font-sans p-10 text-center text-slate-400 font-black tracking-widest uppercase">Connecting...</div>;

  // --- 管理者ロック画面 ---
  if (!groupId && !isAdminAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-5 font-sans">
        <div className="w-full max-w-md bg-white rounded-[2.5rem] p-10 shadow-2xl text-center animate-in fade-in zoom-in-95 duration-300">
          <div className="text-5xl mb-6">🔒</div>
          <h1 className="text-2xl font-black text-indigo-600 mb-2 tracking-tight uppercase font-black">ADMIN LOCK</h1>
          <p className="text-slate-400 text-sm mb-8 leading-relaxed font-bold">管理者用パスワードを入力してください</p>
          <input type="password" placeholder="Password" value={adminPassInput} onChange={(e) => setAdminPassInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && checkAdminAuth()} className="w-full p-5 rounded-2xl bg-slate-50 border-none ring-1 ring-slate-200 font-bold text-center text-xl mb-6 outline-none focus:ring-2 focus:ring-indigo-500 transition-all" autoFocus />
          <button onClick={checkAdminAuth} className="w-full bg-indigo-600 text-white font-black py-5 rounded-2xl shadow-xl active:scale-95 transition-all">ログイン</button>
        </div>
      </div>
    );
  }

  // --- 団体一覧画面 ---
  if (!groupId && isAdminAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-5 font-sans">
        <div className="w-full max-w-md bg-white rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden">
          <div className="text-center mb-10">
            <div className="text-5xl mb-2">📋</div>
            <h1 className="text-3xl font-black text-indigo-600 tracking-tighter">DUTY MANAGER</h1>
            <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest mt-2 bg-slate-50 py-1 rounded-full inline-block px-4">Admin Dashboard</p>
          </div>
          <div className="space-y-8">
            <div>
              <h3 className="text-xs font-black text-slate-400 mb-3 uppercase tracking-widest ml-1">登録済みの団体</h3>
              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                {groupList.map(g => (
                  <div key={g.id} className="flex gap-2 group">
                    <button onClick={() => window.location.hash = g.id} className="flex-1 p-5 bg-white border-2 border-slate-100 rounded-2xl text-left flex justify-between items-center font-bold shadow-sm hover:border-indigo-500 transition-all overflow-hidden">
                      <span className="text-indigo-900 truncate font-black">{String(g.name)}</span><IconChevronRight />
                    </button>
                    <button onClick={() => { setModal({ open: true, title: "部屋の削除", content: `「${g.name}」を完全に削除しますか？\n中身のデータも全て消去されます。`, onConfirm: async () => { await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'groups', g.id)); setModal({...modal, open: false}); } }); }} className="p-5 bg-red-50 text-red-300 hover:text-red-500 rounded-2xl transition-all shadow-sm"><IconTrash /></button>
                  </div>
                ))}
              </div>
            </div>
            <div className="pt-8 border-t border-slate-100">
              <h3 className="text-xs font-black text-slate-400 mb-3 uppercase tracking-widest ml-1">団体を追加</h3>
              <form onSubmit={handleCreateGroup} className="flex gap-2">
                <input name="groupName" placeholder="団体名を入力" className="flex-1 p-4 bg-slate-50 rounded-2xl font-bold outline-none ring-1 ring-slate-200 focus:ring-2 focus:ring-indigo-500 transition-all" required />
                <button type="submit" className="bg-indigo-600 text-white px-6 rounded-2xl font-black shadow-lg active:scale-95 transition-all">作成</button>
              </form>
            </div>
            <button onClick={() => setIsAdminAuthenticated(false)} className="w-full py-4 text-slate-300 text-[10px] font-bold uppercase tracking-[0.2em] hover:text-slate-500 transition-colors">Log out Admin</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-28 max-w-md mx-auto shadow-2xl font-sans relative overflow-x-hidden">
      {modal.open && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-[2rem] w-full max-w-xs overflow-hidden shadow-2xl p-8 text-center animate-in zoom-in-95">
            <h3 className="text-2xl font-black mb-4">{modal.title}</h3>
            <p className="text-slate-600 mb-6 font-bold">{modal.content}</p>
            <div className="flex gap-2">
              {modal.onConfirm ? (
                <>
                  <button onClick={closeModal} className="flex-1 py-4 font-bold text-slate-400 active:bg-slate-50 transition">いいえ</button>
                  <button onClick={modal.onConfirm} className="flex-1 py-4 font-bold text-indigo-600 border-l border-slate-100 active:bg-indigo-50 transition">はい</button>
                </>
              ) : <button onClick={closeModal} className="w-full py-4 font-bold text-indigo-600">閉じる</button>}
            </div>
          </div>
        </div>
      )}

      <header className="bg-white border-b border-slate-200 px-6 py-5 sticky top-0 z-40 flex justify-between items-center shadow-sm">
        <div className="flex flex-col">
          <h1 className="text-xl font-black truncate max-w-[200px] tracking-tight">{settings.appName}</h1>
          <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest mt-1 font-black">{settings.taskName}当番</p>
        </div>
        <button onClick={() => setActiveTab('settings')} className="p-3 bg-slate-50 rounded-full text-slate-400 hover:text-indigo-600 transition-colors"><IconSettings /></button>
      </header>

      <main className="p-5">
        {activeTab === 'home' && (
          <div className="space-y-8 animate-in fade-in duration-500">
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm text-center relative overflow-hidden">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-4">次回の当番</span>
              {events.filter(e => !e.completed).length > 0 ? (
                (() => {
                  const next = events.filter(e => !e.completed).sort((a,b) => new Date(a.date) - new Date(b.date))[0];
                  return (
                    <div className="space-y-6">
                      <div className="text-3xl font-black text-slate-800">{formatDate(next.date)}</div>
                      <div className="flex flex-wrap justify-center gap-2 mt-4 px-2">
                        {(next.assignedNames || []).map((name, i) => (
                          <div key={i} className="flex items-center justify-between bg-indigo-600 text-white px-5 py-2.5 rounded-2xl shadow-lg">
                            <span className="text-xl font-bold">{String(name)} さん</span>
                          </div>
                        ))}
                      </div>
                      <button onClick={() => completeEvent(next)} className="w-full bg-emerald-500 text-white font-black text-3xl py-6 rounded-[2rem] shadow-xl active:scale-95 transition-all mt-6 shadow-emerald-50">完了</button>
                    </div>
                  );
                })()
              ) : <p className="py-12 text-slate-400 font-bold italic text-center text-sm font-black uppercase">No Schedule</p>}
            </div>
          </div>
        )}

        {activeTab === 'schedule' && (
          <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
            {!isScheduleFormOpen ? (
              <div className="space-y-4">
                <button onClick={() => { setCreationMode('single'); setIsScheduleFormOpen(true); }} className="w-full bg-indigo-600 text-white font-black py-4 rounded-2xl flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all shadow-indigo-100"><IconPlus /> 予定を追加</button>
                {events.filter(e => !e.completed).sort((a, b) => new Date(a.date) - new Date(b.date)).map(e => (
                  <div key={e.id} className="bg-white p-5 rounded-[2rem] border border-slate-100 flex justify-between items-center shadow-sm">
                    <div className="max-w-[70%]">
                      <div className="text-xl font-black text-slate-800">{formatDate(e.date)}</div>
                      <div className="text-xs font-bold text-indigo-500 uppercase mt-1 truncate font-black">担当: {(e.assignedNames || []).join(', ')}</div>
                    </div>
                    <button onClick={async () => { setModal({ open: true, title: "予定の削除", content: "消去しますか？", onConfirm: async () => { await deleteDoc(getDocRef('events', e.id)); setModal({...modal, open: false}); } }); }} className="p-3 text-slate-300 hover:text-red-500 transition-colors"><IconTrash /></button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 animate-in zoom-in-95 shadow-lg relative">
                <button onClick={() => setIsScheduleFormOpen(false)} className="absolute top-6 right-6 p-2 text-slate-400 bg-slate-50 rounded-full transition-colors"><IconClose /></button>
                <div className="flex mb-8 bg-slate-100 p-1 rounded-xl mr-12">
                  <button onClick={() => setCreationMode('single')} className={`flex-1 py-2 text-xs font-black rounded-lg transition-all ${creationMode === 'single' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400'}`}>単発</button>
                  <button onClick={() => setCreationMode('bulk')} className={`flex-1 py-2 text-xs font-black rounded-lg transition-all ${creationMode === 'bulk' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400'}`}>一括</button>
                </div>

                <h3 className="font-black text-2xl mb-8">{creationMode === 'single' ? '新規予定の登録' : '期間で一括作成'}</h3>
                
                {creationMode === 'single' ? (
                  <form onSubmit={handleProcessEvent} className="space-y-6">
                    <div><label className="text-[10px] font-black text-slate-400 uppercase mb-2 block ml-1 tracking-widest font-black">実施日</label><input name="date" type="date" required className="w-full p-5 rounded-2xl bg-slate-50 font-bold ring-1 ring-slate-200 outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-black" defaultValue={new Date().toISOString().split('T')[0]} /></div>
                    <div><label className="text-[10px] font-black text-slate-400 uppercase mb-2 block ml-1 tracking-widest font-black">担当人数</label><select name="sets" className="w-full p-5 rounded-2xl bg-slate-50 font-bold ring-1 ring-slate-200 outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-black"><option value="1">1名担当</option><option value="2">2名担当</option></select></div>
                    <button type="submit" className="w-full bg-indigo-600 text-white font-black py-5 rounded-2xl shadow-xl active:scale-95 transition-all">登録して自動決定</button>
                  </form>
                ) : (
                  <form onSubmit={handleBulkProcessEvent} className="space-y-6">
                    <div className="grid grid-cols-2 gap-2">
                      <div><label className="text-[10px] font-black text-slate-400 uppercase mb-2 block font-black">開始日</label><input type="date" value={bulkStart} onChange={e => setBulkStart(e.target.value)} className="w-full p-4 rounded-xl bg-slate-50 font-bold ring-1 ring-slate-200 outline-none font-black" /></div>
                      <div><label className="text-[10px] font-black text-slate-400 uppercase mb-2 block font-black">終了日</label><input type="date" value={bulkEnd} onChange={e => setBulkEnd(e.target.value)} className="w-full p-4 rounded-xl bg-slate-50 font-bold ring-1 ring-slate-200 outline-none font-black" /></div>
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block font-black">対象の曜日</label>
                      <div className="flex gap-1 justify-between">
                        {['日','月','火','水','木','金','土'].map((d, i) => (
                          <button key={i} type="button" onClick={() => bulkDays.includes(i) ? setBulkDays(bulkDays.filter(v => v !== i)) : setBulkDays([...bulkDays, i])} className={`flex-1 py-3 text-xs font-black rounded-lg transition-all ${bulkDays.includes(i) ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400'}`}>{d}</button>
                        ))}
                      </div>
                    </div>
                    <div><label className="text-[10px] font-black text-slate-400 uppercase mb-2 block font-black">1日あたりの人数</label><select name="bulkSets" className="w-full p-4 rounded-xl bg-slate-50 font-bold ring-1 ring-slate-200 outline-none font-black"><option value="1">1名担当</option><option value="2">2名担当</option></select></div>
                    <button type="submit" className="w-full bg-indigo-600 text-white font-black py-5 rounded-2xl shadow-xl">一括選出を実行</button>
                  </form>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'members' && (
          <div className="space-y-6 animate-in slide-in-from-left-4 duration-500">
            <form onSubmit={handleAddMember} className="flex gap-2 p-2 bg-white rounded-3xl border border-slate-200 shadow-sm focus-within:ring-2 focus-within:ring-indigo-500 transition-all">
              <input name="memberName" type="text" placeholder="名前を追加" className="flex-1 bg-transparent px-4 font-bold outline-none font-black" />
              <button type="submit" className="bg-indigo-600 text-white p-4 rounded-2xl active:scale-95 shadow-md"><IconPlus /></button>
            </form>
            <div className="space-y-3">
              {members.map(m => (
                <div key={m.id} className={`p-4 rounded-[2rem] border flex items-center justify-between transition-all ${m.active ? 'bg-white shadow-sm border-slate-100' : 'bg-slate-100 border-transparent opacity-60'}`}>
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-white shadow-sm ${m.active ? 'bg-indigo-500' : 'bg-slate-400'}`}>{String(m.name).charAt(0)}</div>
                    <div>
                      <div className="font-bold text-lg font-black text-slate-800">{String(m.name)} <span className="text-xs font-normal opacity-50">さん</span></div>
                      <div className="text-[10px] text-indigo-500 font-bold uppercase tracking-widest font-black">回数: {m.count || 0}</div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleToggleMember(m)} className="text-[10px] font-bold px-4 py-2 border rounded-xl hover:bg-slate-50 transition-colors font-black">{m.active ? '休止' : '復帰'}</button>
                    <button onClick={() => handleDeleteMember(m)} className="p-3 text-slate-300 hover:text-red-500 transition-colors"><IconTrash /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="bg-white p-8 rounded-[3rem] space-y-8 animate-in slide-in-from-right-2 duration-300 shadow-sm border border-slate-200">
            <h3 className="font-black text-2xl tracking-tight text-slate-800 text-center font-black">設定</h3>
            <div className="space-y-6">
              <div><label className="text-[10px] font-black text-slate-400 mb-2 block ml-1 uppercase tracking-widest text-center font-black">部屋の名前</label><input type="text" value={settings.appName} onChange={async (e) => { 
                const newName = String(e.target.value); setSettings(s => ({ ...s, appName: newName })); 
                await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'config', groupId), { appName: newName, taskName: settings.taskName }); 
                if (groupId !== 'default') await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'groups', groupId), { name: newName });
              }} className="w-full p-5 rounded-2xl bg-slate-50 font-bold ring-1 ring-slate-200 outline-none text-center font-black" /></div>
              
              <div><label className="text-[10px] font-black text-slate-400 mb-2 block ml-1 uppercase tracking-widest text-center font-black">当番の名称</label><input type="text" value={settings.taskName} onChange={async (e) => { 
                const newTask = String(e.target.value); setSettings(s => ({ ...s, taskName: newTask })); 
                await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'config', groupId), { appName: settings.appName, taskName: newTask }); 
              }} className="w-full p-5 rounded-2xl bg-slate-50 font-bold ring-1 ring-slate-200 outline-none text-center font-black" /></div>

              <div className="pt-6 border-t border-slate-100">
                <button onClick={() => { setAdminPassInput(""); setIsAdminAuthenticated(false); window.location.hash = ''; setGroupId(null); setActiveTab('home'); }} className="w-full bg-slate-100 text-slate-500 font-black py-5 rounded-2xl flex justify-center items-center gap-2 active:bg-slate-200 transition-colors uppercase text-[10px] tracking-widest font-black"><IconLogOut /> 別の部屋を選ぶ</button>
              </div>
            </div>
            <button onClick={() => setActiveTab('home')} className="w-full bg-slate-900 text-white font-black py-5 rounded-2xl shadow-xl active:scale-95 transition-all shadow-slate-200">完了</button>
          </div>
        )}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-100 flex justify-around items-center px-6 py-5 z-50 max-w-md mx-auto rounded-t-[2.5rem] shadow-2xl">
        <button onClick={() => setActiveTab('home')} className={`flex flex-col items-center gap-2 transition-all ${activeTab === 'home' ? 'text-indigo-600 scale-110' : 'text-slate-300'}`}><IconHome /><span className="text-[9px] font-black uppercase tracking-widest leading-none font-black">履歴</span></button>
        <button onClick={() => setActiveTab('schedule')} className={`flex flex-col items-center gap-2 transition-all ${activeTab === 'schedule' ? 'text-indigo-600 scale-110' : 'text-slate-300'}`}><IconCalendar /><span className="text-[9px] font-black uppercase tracking-widest leading-none font-black">予定</span></button>
        <button onClick={() => setActiveTab('members')} className={`flex flex-col items-center gap-2 transition-all ${activeTab === 'members' ? 'text-indigo-600 scale-110' : 'text-slate-300'}`}><IconUsers /><span className="text-[9px] font-black uppercase tracking-widest leading-none font-black">名簿</span></button>
      </nav>
    </div>
  );
}