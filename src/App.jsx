import React, { useState, useEffect } from 'react';
import { initializeApp, getApps } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged, signInWithCustomToken } from 'firebase/auth';
import { getFirestore, collection, doc, setDoc, getDoc, addDoc, updateDoc, deleteDoc, onSnapshot } from 'firebase/firestore';

// --- アイコンコンポーネント (SVGを直接定義して安定性を確保) ---
const IconHome = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 18 0 9 9 0 0 0-18 0"/><path d="M12 7v5l3 3"/></svg>;
const IconCalendar = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><path d="M16 2v4"/><path d="M8 2v4"/><path d="M3 10h18"/></svg>;
const IconUsers = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>;
const IconSettings = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1Z"/></svg>;
const IconEdit = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>;
const IconTrash = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>;
const IconPlus = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
const IconClose = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
const IconChevronRight = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>;
const IconLogOut = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>;
const IconSlide = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m18 8 4 4-4 4"/><path d="M2 12h20"/><path d="m6 8-4 4 4 4"/></svg>;

// --- Firebase Configuration ---
const getFirebaseConfig = () => {
  if (typeof __firebase_config !== 'undefined') {
    try {
      return JSON.parse(__firebase_config);
    } catch (e) {
      console.error("Firebase config parse error", e);
    }
  }
  // あなたのFirebase情報
  return {
    apiKey: "AIzaSyDEw9TJCXWJiAoDgc1XlXCMIOLMKxrzLgg",
    authDomain: "duty-manager-33163.firebaseapp.com",
    projectId: "duty-manager-33163",
    storageBucket: "duty-manager-33163.firebasestorage.app",
    messagingSenderId: "709632134796",
    appId: "1:709632134796:web:62292d919b0dc83b7735a9"
  };
};

const app = getApps().length === 0 ? initializeApp(getFirebaseConfig()) : getApps()[0];
const auth = getAuth(app);
const db = getFirestore(app);
// スラッシュが含まれるとFirestoreのパスが壊れるためサニタイズ（_に置換）する
const appId = typeof __app_id !== 'undefined' ? String(__app_id).replace(/\//g, '_') : 'duty-manager-production-v1';

export default function App() {
  const [user, setUser] = useState(null);
  const [groupId, setGroupId] = useState(null); 
  const [groupList, setGroupList] = useState([]);
  const [members, setMembers] = useState([]);
  const [events, setEvents] = useState([]);
  const [activeTab, setActiveTab] = useState('home');
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState({ appName: "当番管理", taskName: "用具" });
  
  const [modal, setModal] = useState({ open: false, title: '', content: '', onConfirm: null });
  const [slideModal, setSlideModal] = useState({ open: false, event: null, index: -1, absentName: '', candidates: [] });
  
  const [editingEvent, setEditingEvent] = useState(null);
  const [editingMemberId, setEditingMemberId] = useState(null);
  const [editMemberName, setEditMemberName] = useState("");
  const [editMemberCount, setEditMemberCount] = useState(0);

  const [isScheduleFormOpen, setIsScheduleFormOpen] = useState(false);
  const [historyLimit, setHistoryLimit] = useState(5);

  const [creationMode, setCreationMode] = useState('single');
  const [bulkStart, setBulkStart] = useState(new Date().toISOString().split('T')[0]);
  const [bulkEnd, setBulkEnd] = useState('');
  const [bulkDays, setBulkDays] = useState([0]);

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const days = ['日', '月', '火', '水', '木', '金', '土'];
    const d = new Date(dateStr);
    return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日(${days[d.getDay()]})`;
  };

  const closeModal = () => setModal({ ...modal, open: false });

  useEffect(() => {
    const init = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (error) {
        console.error("Auth error:", error);
      }
    };
    init();

    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash) setGroupId(hash);
      else setGroupId(null);
    };
    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    const unsub = onAuthStateChanged(auth, setUser);
    return () => {
      unsub();
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  useEffect(() => {
    if (!user) return;
    const groupsRef = collection(db, 'artifacts', appId, 'public', 'data', 'groups');
    const unsub = onSnapshot(groupsRef, (snap) => {
      setGroupList(snap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)));
      if (!groupId) setLoading(false);
    });
    return () => unsub();
  }, [user, groupId]);

  useEffect(() => {
    if (!user || !groupId) return;
    setLoading(true);

    const membersColName = groupId === 'default' ? 'members' : `${groupId}_members`;
    const eventsColName = groupId === 'default' ? 'events' : `${groupId}_events`;
    const configPathArgs = groupId === 'default' 
      ? ['artifacts', appId, 'public', 'data', 'config', 'settings']
      : ['artifacts', appId, 'public', 'data', 'config', groupId];

    const mRef = collection(db, 'artifacts', appId, 'public', 'data', membersColName);
    const eRef = collection(db, 'artifacts', appId, 'public', 'data', eventsColName);
    const sRef = doc(db, ...configPathArgs);

    const unsubM = onSnapshot(mRef, (s) => {
      setMembers(s.docs.map(d => ({ id: d.id, ...d.data() })).sort((a,b) => (a.count || 0) - (b.count || 0)));
      setLoading(false);
    });
    const unsubE = onSnapshot(eRef, (s) => {
      setEvents(s.docs.map(d => ({ id: d.id, ...d.data() })).sort((a,b) => new Date(b.date) - new Date(a.date)));
    });
    const unsubS = onSnapshot(sRef, (d) => { 
      if (d.exists()) setSettings(d.data());
      else setSettings({ appName: "当番管理", taskName: "用具" });
    });
    
    return () => { unsubM(); unsubE(); unsubS(); };
  }, [user, groupId]);

  const getDocRef = (baseName, id) => doc(db, 'artifacts', appId, 'public', 'data', groupId === 'default' ? baseName : `${groupId}_${baseName}`, id);
  const getColRef = (baseName) => collection(db, 'artifacts', appId, 'public', 'data', groupId === 'default' ? baseName : `${groupId}_${baseName}`);

  const autoReassignFutureEvents = async (currentMembersList) => {
    const futureEvents = events.filter(e => !e.completed).sort((a, b) => new Date(a.date) - new Date(b.date));
    if (futureEvents.length === 0) return;
    const activeM = currentMembersList.filter(m => m.active);
    if (activeM.length === 0) return;
    const virtualCounts = {};
    activeM.forEach(m => { virtualCounts[m.id] = m.count || 0; });
    for (const ev of futureEvents) {
      const available = [...activeM].sort((a, b) => virtualCounts[a.id] - virtualCounts[b.id]);
      const selected = available.slice(0, ev.numSets);
      selected.forEach(m => { virtualCounts[m.id] += 1; });
      if (ev.assignedIds.join(',') !== selected.map(m => m.id).join(',')) {
        await updateDoc(getDocRef('events', ev.id), {
          assignedIds: selected.map(m => m.id),
          assignedNames: selected.map(m => m.name)
        });
      }
    }
  };

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    const groupName = e.target.groupName.value.trim();
    if (!groupName) return;
    const newGroupId = 'group_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
    await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'groups', newGroupId), { name: groupName, createdAt: new Date().toISOString() });
    await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'config', newGroupId), { appName: groupName, taskName: "用具" });
    e.target.reset();
    window.location.hash = newGroupId;
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    const name = e.target.memberName.value.trim();
    if (!name) return;
    let initialCount = 0;
    const activeMembers = members.filter(m => m.active);
    if (activeMembers.length > 0) {
      const totalCount = activeMembers.reduce((sum, m) => sum + (m.count || 0), 0);
      initialCount = Math.floor(totalCount / activeMembers.length);
    }
    const docRef = await addDoc(getColRef('members'), { name, count: initialCount, active: true, createdAt: new Date().toISOString() });
    e.target.reset();
    const newMember = { id: docRef.id, name, count: initialCount, active: true };
    await autoReassignFutureEvents([...members, newMember]);
  };

  const handleProcessEvent = async (e) => {
    e.preventDefault();
    const date = e.target.date.value;
    const sets = parseInt(e.target.sets.value);
    const activeM = members.filter(m => m.active);
    if (activeM.length < sets) {
      setModal({ open: true, title: 'メンバー不足', content: '当番に割り当て可能なメンバーが足りません。', onConfirm: null });
      return;
    }
    let currentFutureAssignments = events.filter(ev => !ev.completed).flatMap(ev => ev.assignedIds);
    if (editingEvent) currentFutureAssignments = events.filter(ev => !ev.completed && ev.id !== editingEvent.id).flatMap(ev => ev.assignedIds);
    const sortedMembers = [...activeM].sort((a, b) => {
       const scoreA = (a.count || 0) + currentFutureAssignments.filter(id => id === a.id).length;
       const scoreB = (b.count || 0) + currentFutureAssignments.filter(id => id === b.id).length;
       return scoreA - scoreB;
    });
    const selected = sortedMembers.slice(0, sets);
    const data = { date, numSets: sets, assignedIds: selected.map(m => m.id), assignedNames: selected.map(m => m.name) };
    try {
      if (editingEvent) {
        await updateDoc(getDocRef('events', editingEvent.id), data);
        setEditingEvent(null);
      } else {
        await addDoc(getColRef('events'), { ...data, completed: false, createdAt: new Date().toISOString() });
      }
      setIsScheduleFormOpen(false);
    } catch (err) { setModal({ open: true, title: 'エラー', content: '保存に失敗しました。', onConfirm: null }); }
  };

  const openSlideModal = (event, index) => {
    const absentId = event.assignedIds[index];
    const absentName = event.assignedNames[index];
    const otherAssignedIdsInThisEvent = event.assignedIds.filter((_, i) => i !== index);
    let candidates = [];
    const futureEvents = events.filter(e => !e.completed && e.id !== event.id && new Date(e.date) >= new Date(event.date)).sort((a, b) => new Date(a.date) - new Date(b.date));
    futureEvents.forEach(fe => {
      fe.assignedIds.forEach((id, feIndex) => {
        if (id !== absentId && !otherAssignedIdsInThisEvent.includes(id)) {
          if (!candidates.find(c => c.memberId === id)) candidates.push({ type: 'swap', memberId: id, memberName: fe.assignedNames[feIndex], eventId: fe.id, eventDate: fe.date, eventIndex: feIndex, swapEvent: fe });
        }
      });
    });
    if (candidates.length < 3) {
      const allAssignedIds = events.filter(e => !e.completed).flatMap(e => e.assignedIds);
      const availableMembers = members.filter(m => m.active && !allAssignedIds.includes(m.id) && m.id !== absentId && !otherAssignedIdsInThisEvent.includes(m.id));
      const sortedMembers = [...availableMembers].sort((a, b) => (a.count || 0) - (b.count || 0));
      sortedMembers.forEach(m => { if (!candidates.find(c => c.memberId === m.id)) candidates.push({ type: 'replace', memberId: m.id, memberName: m.name, count: m.count || 0 }); });
    }
    candidates = candidates.slice(0, 3);
    if (candidates.length === 0) {
      setModal({ open: true, title: '交代不可', content: '交代できるメンバーがいません。', onConfirm: null });
      return;
    }
    setSlideModal({ open: true, event, index, absentName, candidates });
  };

  const executeSlide = async (candidate) => {
    const { event, index, absentName } = slideModal;
    const absentId = event.assignedIds[index];
    if (candidate.type === 'swap') {
      const newCurrentIds = [...event.assignedIds];
      const newCurrentNames = [...event.assignedNames];
      newCurrentIds[index] = candidate.memberId;
      newCurrentNames[index] = candidate.memberName;
      await updateDoc(getDocRef('events', event.id), { assignedIds: newCurrentIds, assignedNames: newCurrentNames });
      const fe = candidate.swapEvent;
      const newSwapIds = [...fe.assignedIds];
      const newSwapNames = [...fe.assignedNames];
      newSwapIds[candidate.eventIndex] = absentId;
      newSwapNames[candidate.eventIndex] = absentName;
      await updateDoc(getDocRef('events', fe.id), { assignedIds: newSwapIds, assignedNames: newSwapNames });
    } else {
      const newIds = [...event.assignedIds];
      const newNames = [...event.assignedNames];
      newIds[index] = candidate.memberId;
      newNames[index] = candidate.memberName;
      await updateDoc(getDocRef('events', event.id), { assignedIds: newIds, assignedNames: newNames });
    }
    setSlideModal({ ...slideModal, open: false });
  };

  const completeEvent = async (event) => {
    setModal({
      open: true, title: '完了の確認', content: '担当が完了しましたか？',
      onConfirm: async () => {
        for (const mid of event.assignedIds) {
          const mRef = getDocRef('members', mid);
          const mSnap = await getDoc(mRef);
          if (mSnap.exists()) await updateDoc(mRef, { count: (mSnap.data().count || 0) + 1 });
        }
        await updateDoc(getDocRef('events', event.id), { completed: true });
        setModal({ open: false, title: '', content: '', onConfirm: null });
      }
    });
  };

  if (loading) return <div className="flex h-screen items-center justify-center font-bold text-slate-400 text-lg">読み込み中...</div>;

  if (!groupId) {
    return (
      <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-5">
        <div className="w-full max-w-md bg-white rounded-[2.5rem] p-8 shadow-2xl">
          <div className="text-center mb-10">
            <div className="text-5xl mb-2">📋</div>
            <h1 className="text-3xl font-black text-indigo-600">DUTY MANAGER</h1>
          </div>
          <div className="space-y-8">
            <div>
              <h3 className="text-xs font-black text-slate-400 mb-3">部屋に入る</h3>
              <div className="space-y-3">
                <button onClick={() => window.location.hash = 'default'} className="w-full p-5 bg-slate-50 rounded-2xl text-left flex justify-between items-center font-bold">
                  <span>共通グループ</span><IconChevronRight />
                </button>
                {groupList.map(g => (
                  <button key={g.id} onClick={() => window.location.hash = g.id} className="w-full p-5 bg-white border border-slate-100 rounded-2xl text-left flex justify-between items-center font-bold shadow-sm">
                    <span>{g.name}</span><IconChevronRight />
                  </button>
                ))}
              </div>
            </div>
            <div className="pt-8 border-t border-slate-100">
              <h3 className="text-xs font-black text-slate-400 mb-3">新しい部屋を作る</h3>
              <form onSubmit={handleCreateGroup} className="flex gap-2">
                <input name="groupName" placeholder="団体名" className="flex-1 p-4 bg-slate-50 rounded-2xl font-bold outline-none" required />
                <button type="submit" className="bg-indigo-600 text-white px-6 rounded-2xl font-black">作成</button>
              </form>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-28 max-w-md mx-auto shadow-2xl font-sans relative">
      {modal.open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-[2rem] w-full max-w-xs overflow-hidden shadow-2xl p-8 text-center">
            <h3 className="text-2xl font-black mb-4">{modal.title}</h3>
            <p className="text-slate-600 mb-6">{modal.content}</p>
            <div className="flex gap-2">
              {modal.onConfirm ? (
                <>
                  <button onClick={closeModal} className="flex-1 py-4 font-bold text-slate-400">いいえ</button>
                  <button onClick={modal.onConfirm} className="flex-1 py-4 font-bold text-indigo-600">はい</button>
                </>
              ) : <button onClick={closeModal} className="w-full py-4 font-bold text-indigo-600">閉じる</button>}
            </div>
          </div>
        </div>
      )}

      {slideModal.open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-[2rem] w-full max-w-sm overflow-hidden shadow-2xl p-8">
            <h3 className="text-2xl font-black mb-6 text-slate-800">当番の交代</h3>
            <div className="space-y-4">
              {slideModal.candidates.map((c, i) => (
                <button key={i} onClick={() => executeSlide(c)} className="w-full text-left p-5 rounded-2xl border-2 border-slate-100 hover:border-indigo-500 font-bold">
                  <div className="text-xl">{c.memberName} さん</div>
                  <div className="text-xs text-indigo-500 mt-2">{c.type === 'swap' ? `🔄 ${formatDate(c.eventDate)} と交換` : `✅ 回数: ${c.count}回`}</div>
                </button>
              ))}
              <button onClick={() => setSlideModal({ ...slideModal, open: false })} className="w-full py-4 font-bold text-slate-400 mt-4">キャンセル</button>
            </div>
          </div>
        </div>
      )}

      <header className="bg-white border-b border-slate-200 px-6 py-5 sticky top-0 z-40 flex justify-between items-center shadow-sm">
        <div>
          <h1 className="text-xl font-black truncate max-w-[200px]">{settings.appName}</h1>
          <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest leading-none mt-1">{settings.taskName}当番</p>
        </div>
        <button onClick={() => setActiveTab('settings')} className="p-3 bg-slate-50 rounded-full text-slate-400"><IconSettings /></button>
      </header>

      <main className="p-5">
        {activeTab === 'home' && (
          <div className="space-y-8 animate-in fade-in duration-500">
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm text-center">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-4">次回の当番</span>
              {events.filter(e => !e.completed).length > 0 ? (
                (() => {
                  const next = events.filter(e => !e.completed).sort((a,b) => new Date(a.date) - new Date(b.date))[0];
                  return (
                    <div className="space-y-6">
                      <div className="text-3xl font-black">{formatDate(next.date)}</div>
                      <div className="space-y-4">
                        {next.assignedNames.map((name, i) => (
                          <div key={i} className="flex items-center justify-between bg-indigo-600 text-white px-6 py-4 rounded-[2rem] shadow-lg">
                            <span className="text-2xl font-bold">{name} さん</span>
                            <button onClick={() => openSlideModal(next, i)} className="flex items-center gap-2 px-4 py-2 bg-white/20 rounded-xl text-sm font-bold"><IconSlide /> 交代</button>
                          </div>
                        ))}
                      </div>
                      <button onClick={() => completeEvent(next)} className="w-full bg-emerald-500 text-white font-black text-3xl py-6 rounded-[2rem] shadow-xl shadow-emerald-100 active:scale-95 transition-all mt-6">完了</button>
                    </div>
                  );
                })()
              ) : <p className="py-12 text-slate-400 font-bold">予定なし</p>}
            </div>
            
            <section className="space-y-4">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest ml-2">履歴</h3>
              <div className="space-y-3">
                {events.filter(e => e.completed).slice(0, historyLimit).map(e => (
                  <div key={e.id} className="bg-white p-5 rounded-3xl border border-slate-100 flex justify-between items-center">
                    <div>
                      <div className="text-[10px] text-slate-400 font-bold mb-1">{formatDate(e.date)}</div>
                      <div className="font-bold text-slate-700 text-lg">{e.assignedNames.join(', ')} さん</div>
                    </div>
                  </div>
                ))}
                {events.filter(e => e.completed).length > historyLimit && (
                  <button onClick={() => setHistoryLimit(l => l + 10)} className="w-full py-4 text-sm font-bold text-indigo-600 bg-indigo-50 rounded-2xl">もっと見る</button>
                )}
              </div>
            </section>
          </div>
        )}

        {activeTab === 'schedule' && (
          <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
            {!isScheduleFormOpen ? (
              <div className="space-y-4">
                <button onClick={() => setIsScheduleFormOpen(true)} className="w-full bg-indigo-600 text-white font-black py-4 rounded-2xl flex items-center justify-center gap-2"><IconPlus /> 予定を追加</button>
                {events.filter(e => !e.completed).sort((a, b) => new Date(a.date) - new Date(b.date)).map(e => (
                  <div key={e.id} className="bg-white p-5 rounded-[2rem] border border-slate-100 flex justify-between items-center shadow-sm">
                    <div>
                      <div className="text-xl font-black">{formatDate(e.date)}</div>
                      <div className="text-xs font-bold text-indigo-500 uppercase mt-1">担当: {e.assignedNames.join(', ')}</div>
                    </div>
                    <button onClick={async () => { if(confirm('削除しますか？')) await deleteDoc(getDocRef('events', e.id)); }} className="p-3 text-slate-200"><IconTrash /></button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 animate-in zoom-in-95">
                <button onClick={() => setIsScheduleFormOpen(false)} className="absolute top-6 right-6 p-2 text-slate-400"><IconClose /></button>
                <h3 className="font-black text-2xl mb-8">新規予定の登録</h3>
                <form onSubmit={handleProcessEvent} className="space-y-6">
                  <div><label className="text-[10px] font-black text-slate-400 uppercase mb-2 block">実施日</label><input name="date" type="date" required className="w-full p-5 rounded-2xl bg-slate-50 font-bold" defaultValue={new Date().toISOString().split('T')[0]} /></div>
                  <div><label className="text-[10px] font-black text-slate-400 uppercase mb-2 block">担当人数</label><select name="sets" className="w-full p-5 rounded-2xl bg-slate-50 font-bold"><option value="1">1名担当</option><option value="2">2名担当</option></select></div>
                  <button type="submit" className="w-full bg-indigo-600 text-white font-black py-5 rounded-2xl">登録して自動決定</button>
                </form>
              </div>
            )}
          </div>
        )}

        {activeTab === 'members' && (
          <div className="space-y-6 animate-in slide-in-from-left-4 duration-500">
            <form onSubmit={handleAddMember} className="flex gap-2 p-2 bg-white rounded-3xl border border-slate-200">
              <input name="memberName" type="text" placeholder="名前を追加" className="flex-1 bg-transparent px-5 font-bold outline-none" />
              <button type="submit" className="bg-indigo-600 text-white p-5 rounded-2xl"><IconPlus /></button>
            </form>
            <div className="space-y-3">
              {members.map(m => (
                <div key={m.id} className={`p-5 rounded-[2rem] border flex items-center justify-between ${m.active ? 'bg-white shadow-sm' : 'bg-slate-100 opacity-60'}`}>
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-white ${m.active ? 'bg-indigo-500' : 'bg-slate-400'}`}>{m.name.charAt(0)}</div>
                    <div><div className="font-bold text-lg">{m.name} さん</div><div className="text-xs text-indigo-500 font-bold uppercase tracking-widest">回数: {m.count || 0}</div></div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleToggleMember(m)} className="text-[10px] font-bold px-4 py-2 border rounded-xl">{m.active ? '休止' : '復帰'}</button>
                    <button onClick={() => handleDeleteMember(m)} className="p-2 text-slate-200"><IconTrash /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="bg-white p-8 rounded-[3rem] space-y-8 animate-in slide-in-from-right-2 duration-300">
            <h3 className="font-black text-2xl">アプリ設定</h3>
            <div className="space-y-6">
              <div><label className="text-[10px] font-black text-slate-400 mb-2 block">部屋の名前</label><input type="text" value={settings.appName} onChange={async (e) => { const s = { ...settings, appName: e.target.value }; setSettings(s); await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'config', groupId === 'default' ? 'settings' : groupId), s); if (groupId !== 'default') await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'groups', groupId), { name: e.target.value }); }} className="w-full p-5 rounded-2xl bg-slate-50 font-bold" /></div>
              <div><label className="text-[10px] font-black text-slate-400 mb-2 block">当番の名前</label><input type="text" value={settings.taskName} onChange={async (e) => { const s = { ...settings, taskName: e.target.value }; setSettings(s); await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'config', groupId === 'default' ? 'settings' : groupId), s); }} className="w-full p-5 rounded-2xl bg-slate-50 font-bold" /></div>
              <div className="pt-6 border-t border-slate-100"><button onClick={() => { window.location.hash = ''; setGroupId(null); setActiveTab('home'); }} className="w-full bg-slate-100 text-slate-500 font-bold py-5 rounded-2xl flex justify-center items-center gap-2"><IconLogOut /> 部屋を選び直す</button></div>
            </div>
            <button onClick={() => setActiveTab('home')} className="w-full bg-slate-900 text-white font-bold py-5 rounded-2xl">完了</button>
          </div>
        )}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 flex justify-around items-center px-6 py-5 z-50 max-w-md mx-auto rounded-t-[2.5rem] shadow-2xl">
        <button onClick={() => setActiveTab('home')} className={`flex flex-col items-center gap-2 ${activeTab === 'home' ? 'text-indigo-600' : 'text-slate-300'}`}><IconHome /><span className="text-[9px] font-black uppercase">履歴</span></button>
        <button onClick={() => setActiveTab('schedule')} className={`flex flex-col items-center gap-2 ${activeTab === 'schedule' ? 'text-indigo-600' : 'text-slate-300'}`}><IconCalendar /><span className="text-[9px] font-black uppercase">予定</span></button>
        <button onClick={() => setActiveTab('members')} className={`flex flex-col items-center gap-2 ${activeTab === 'members' ? 'text-indigo-600' : 'text-slate-300'}`}><IconUsers /><span className="text-[9px] font-black uppercase">名簿</span></button>
      </nav>
    </div>
  );
}