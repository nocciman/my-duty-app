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
const IconEdit = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>;
const IconSlide = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m18 8 4 4-4 4"/><path d="M2 12h20"/><path d="m6 8-4 4 4 4"/></svg>;
const IconUndo = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7v6h6"/><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"/></svg>;

// --- Firebase Configuration ---
const getFirebaseConfig = () => {
  if (typeof __firebase_config !== 'undefined' && __firebase_config) {
    try {
      const config = JSON.parse(__firebase_config);
      if (config && config.apiKey) return config;
    } catch (e) { console.error("Firebase config parse error:", e); }
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

const firebaseConfig = getFirebaseConfig();
const firebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(firebaseApp);
const db = getFirestore(firebaseApp);

// パス構造を完全に固定
const appId = 'duty-manager-v6-production';

// 管理者パスワード
const MASTER_ADMIN_PASSCODE = "2525"; 

export default function App() {
  const [user, setUser] = useState(null);
  const [groupId, setGroupId] = useState(null); 
  const [groupList, setGroupList] = useState([]);
  const [members, setMembers] = useState([]);
  const [events, setEvents] = useState([]);
  const [activeTab, setActiveTab] = useState('home');
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState({ appName: "当番管理", taskName: "用具" });
  const [errorMsg, setErrorMsg] = useState(null);
  
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [adminPassInput, setAdminPassInput] = useState("");

  const [modal, setModal] = useState({ open: false, title: '', content: '', onConfirm: null });
  const [slideModal, setSlideModal] = useState({ open: false, event: null, index: -1, absentName: '', candidates: [] });

  const [editingMemberId, setEditingMemberId] = useState(null);
  const [editMemberName, setEditMemberName] = useState("");
  const [editMemberCount, setEditMemberCount] = useState(0);

  const [isScheduleFormOpen, setIsScheduleFormOpen] = useState(false);
  const [creationMode, setCreationMode] = useState('single');
  const [bulkStart, setBulkStart] = useState(new Date().toISOString().split('T')[0]);
  const [bulkEnd, setBulkEnd] = useState('');
  const [bulkDays, setBulkDays] = useState([0, 6]);
  
  const [selectedEventIds, setSelectedEventIds] = useState([]); // 一括削除用

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const days = ['日', '月', '火', '水', '木', '金', '土'];
    const d = new Date(dateStr);
    return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日(${days[d.getDay()]})`;
  };

  const closeModal = () => setModal({ ...modal, open: false });

  // 1. Firebase Auth Initializer
  useEffect(() => {
    const initAuth = async () => {
      try {
        await signInAnonymously(auth);
      } catch (error) { 
        console.error("Auth error:", error); 
        setErrorMsg(`認証エラーが発生しました。\n(Error: ${error.code})`);
      }
    };
    initAuth();

    const handleHashChange = () => setGroupId(window.location.hash.replace('#', '') || null);
    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
    });
    return () => {
      unsubscribe();
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  useEffect(() => {
    setSelectedEventIds([]);
  }, [activeTab]);

  // 2. 団体一覧の取得
  useEffect(() => {
    if (!user || groupId) return;
    setLoading(true);
    const groupsRef = collection(db, 'artifacts', appId, 'public', 'data', 'groups');
    const unsub = onSnapshot(groupsRef, (snap) => {
      setGroupList(snap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)));
      setLoading(false);
    }, (err) => {
      console.error("Groups snapshot error:", err);
      setLoading(false);
    });
    return () => unsub();
  }, [user, groupId]);

  // 3. 部屋別データの同期
  useEffect(() => {
    if (!user || !groupId) {
      if (!groupId) setLoading(false); 
      return;
    }
    setLoading(true);

    const mCol = collection(db, 'artifacts', appId, 'public', 'data', `${groupId}_members`);
    const eCol = collection(db, 'artifacts', appId, 'public', 'data', `${groupId}_events`);
    const sConfig = doc(db, 'artifacts', appId, 'public', 'data', 'config', groupId);

    const unsubM = onSnapshot(mCol, (s) => {
      setMembers(s.docs.map(d => ({ id: d.id, ...d.data() })).sort((a,b) => (a.count || 0) - (b.count || 0)));
      setLoading(false);
    });
    
    const unsubE = onSnapshot(eCol, (s) => {
      setEvents(s.docs.map(d => ({ id: d.id, ...d.data() })).sort((a,b) => new Date(b.date) - new Date(a.date)));
    });
    
    const unsubS = onSnapshot(sConfig, (d) => { 
      if (d.exists()) setSettings(d.data());
    });
    
    return () => { unsubM(); unsubE(); unsubS(); };
  }, [user, groupId]);

  const getDocRef = (baseName, id) => doc(db, 'artifacts', appId, 'public', 'data', `${groupId}_${baseName}`, id);
  const getColRef = (baseName) => collection(db, 'artifacts', appId, 'public', 'data', `${groupId}_${baseName}`);

  // --- 自動再計算ロジック（全体をリバランスする） ---
  const rebalanceFutureEvents = async (currentMembersList, currentEventsList) => {
    if (!user) return;
    
    const futureEvents = currentEventsList.filter(e => !e.completed).sort((a, b) => new Date(a.date) - new Date(b.date));
    if (futureEvents.length === 0) return;

    const activeM = currentMembersList.filter(m => m.active);
    if (activeM.length === 0) return;

    const virtualCounts = {};
    const lastAssignedDates = {};
    
    activeM.forEach(m => { 
      virtualCounts[m.id] = m.count || 0; 
      lastAssignedDates[m.id] = 0; 
    });

    const completedEvents = currentEventsList.filter(e => e.completed);
    completedEvents.forEach(e => {
      const time = new Date(e.date).getTime();
      (e.assignedIds || []).forEach(id => {
        if (virtualCounts[id] !== undefined && lastAssignedDates[id] < time) {
          lastAssignedDates[id] = time;
        }
      });
    });

    for (const ev of futureEvents) {
      const available = [...activeM].sort((a, b) => {
        if (virtualCounts[a.id] !== virtualCounts[b.id]) {
          return virtualCounts[a.id] - virtualCounts[b.id]; 
        }
        if (lastAssignedDates[a.id] !== lastAssignedDates[b.id]) {
          return lastAssignedDates[a.id] - lastAssignedDates[b.id]; 
        }
        return a.id.localeCompare(b.id);
      });

      const selected = available.slice(0, ev.numSets);
      const evTime = new Date(ev.date).getTime();
      
      selected.forEach(m => { 
        virtualCounts[m.id] += 1; 
        lastAssignedDates[m.id] = evTime;
      });

      const currentIdsStr = (ev.assignedIds || []).join(',');
      const newIdsStr = selected.map(m => m.id).join(',');
      const currentNamesStr = (ev.assignedNames || []).join(',');
      const newNamesStr = selected.map(m => m.name).join(',');

      // 担当者が変わる場合、または「名前」が変更された場合はDBを更新する
      if (currentIdsStr !== newIdsStr || currentNamesStr !== newNamesStr) {
        await updateDoc(getDocRef('events', ev.id), {
          assignedIds: selected.map(m => m.id),
          assignedNames: selected.map(m => m.name)
        });
      }
    }
  };

  // --- ハンドラー ---

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!user) return;
    const name = e.target.memberName.value.trim();
    if (!name) return;
    
    let initialCount = 0;
    if (members.length > 0) initialCount = Math.floor(members.reduce((sum, m) => sum + (m.count || 0), 0) / members.length);
    
    const docRef = await addDoc(getColRef('members'), { name, count: initialCount, active: true, createdAt: new Date().toISOString() });
    e.target.reset();

    const newMember = { id: docRef.id, name, count: initialCount, active: true };
    await rebalanceFutureEvents([...members, newMember], events);
  };

  const handleUpdateMember = async (e) => {
    e.preventDefault();
    if (!user || !editingMemberId) return;
    
    const newName = editMemberName.trim();
    const newCount = parseInt(editMemberCount) || 0;

    try {
      // 1. メンバー情報を更新
      await updateDoc(getDocRef('members', editingMemberId), { 
        name: newName, 
        count: newCount 
      });

      // 2. このメンバーが含まれる「すべてのイベント（履歴も含む）」の名前を一気に書き換える
      const eventsToUpdate = events.filter(ev => ev.assignedIds && ev.assignedIds.includes(editingMemberId));
      const updatedEvents = [...events];

      await Promise.all(eventsToUpdate.map(async (ev) => {
        const newAssignedNames = ev.assignedNames.map((n, idx) => 
          ev.assignedIds[idx] === editingMemberId ? newName : n
        );
        
        await updateDoc(getDocRef('events', ev.id), {
          assignedNames: newAssignedNames
        });
        
        // ローカルステート用にも反映
        const evIndex = updatedEvents.findIndex(e => e.id === ev.id);
        if (evIndex !== -1) {
          updatedEvents[evIndex] = { ...ev, assignedNames: newAssignedNames };
        }
      }));

      // 3. 最新の状態で未来の予定を再計算
      const updatedMembers = members.map(m => m.id === editingMemberId ? { ...m, name: newName, count: newCount } : m);
      await rebalanceFutureEvents(updatedMembers, updatedEvents);

      setEditingMemberId(null);
    } catch (err) {
      console.error(err);
      setModal({ open: true, title: 'エラー', content: '更新中にエラーが発生しました。', onConfirm: null });
    }
  };

  const handleToggleMember = async (m) => {
    if (!user) return;
    await updateDoc(getDocRef('members', m.id), { active: !m.active });
    const updatedMembers = members.map(member => member.id === m.id ? { ...member, active: !m.active } : member);
    await rebalanceFutureEvents(updatedMembers, events);
  };

  const handleDeleteMember = async (m) => {
    if (!user) return;
    if (confirm(`${m.name}さんを名簿から削除（退会）しますか？\n※未完了の予定からは自動的に外れ、他の人が割り当てられます。過去の履歴には名前が残ります。`)) {
      await deleteDoc(getDocRef('members', m.id));
      const updatedMembers = members.filter(member => member.id !== m.id);
      await rebalanceFutureEvents(updatedMembers, events);
    }
  };

  const handleProcessEvent = async (e) => {
    e.preventDefault();
    if (!user) return;
    const date = e.target.date.value;
    const sets = parseInt(e.target.sets.value);
    const activeM = members.filter(m => m.active);
    
    if (activeM.length < sets) {
      setModal({ open: true, title: '人数不足', content: '担当可能なメンバーが足りません。' });
      return;
    }

    const docRef = await addDoc(getColRef('events'), { 
      date, numSets: sets, 
      assignedIds: [], assignedNames: [], 
      completed: false, createdAt: new Date().toISOString() 
    });

    const newEvent = { id: docRef.id, date, numSets: sets, assignedIds: [], assignedNames: [], completed: false };
    await rebalanceFutureEvents(members, [...events, newEvent]);

    setIsScheduleFormOpen(false);
  };

  const handleBulkProcessEvent = async (e) => {
    e.preventDefault();
    if (!user || bulkDays.length === 0 || !bulkEnd) return;
    const start = new Date(bulkStart);
    const end = new Date(bulkEnd);
    const sets = parseInt(e.target.bulkSets.value);
    const activeM = members.filter(m => m.active);
    
    if (activeM.length < sets) {
      setModal({ open: true, title: '人数不足', content: '担当可能なメンバーが足りません。' });
      return;
    }

    const existingDates = events.map(ev => ev.date);
    const dates = [];
    let curr = new Date(start);
    
    while (curr <= end) {
      if (bulkDays.includes(curr.getDay())) {
        const y = curr.getFullYear();
        const m = String(curr.getMonth() + 1).padStart(2, '0');
        const d = String(curr.getDate()).padStart(2, '0');
        const dateStr = `${y}-${m}-${d}`;
        
        if (!existingDates.includes(dateStr)) {
          dates.push(dateStr);
        }
      }
      curr.setDate(curr.getDate() + 1);
    }
    
    if (dates.length === 0) {
      setModal({ open: true, title: '対象の日付がありません', content: '指定した期間に該当する日付がないか、すでに予定が作成されています。', onConfirm: null });
      return;
    }

    setModal({
      open: true, title: '一括作成', content: `新しく ${dates.length} 件の予定を作成しますか？\n（すでに予定がある日付はスキップされます）`,
      onConfirm: async () => {
        const newEvents = [];
        for (const d of dates) {
          const docRef = await addDoc(getColRef('events'), { 
            date: d, numSets: sets, 
            assignedIds: [], assignedNames: [], 
            completed: false, createdAt: new Date().toISOString() 
          });
          newEvents.push({ id: docRef.id, date: d, numSets: sets, assignedIds: [], assignedNames: [], completed: false });
        }
        
        await rebalanceFutureEvents(members, [...events, ...newEvents]);
        setIsScheduleFormOpen(false); 
        closeModal();
      }
    });
  };

  const toggleEventSelection = (id) => {
    setSelectedEventIds(prev => prev.includes(id) ? prev.filter(e => e !== id) : [...prev, id]);
  };

  const handleBulkDelete = () => {
    setModal({
      open: true,
      title: '一括削除の確認',
      content: `選択した ${selectedEventIds.length} 件の予定を完全に削除しますか？\n（削除後、残りの予定は公平に再割り当てされます）`,
      onConfirm: async () => {
        for (const id of selectedEventIds) {
          await deleteDoc(getDocRef('events', id));
        }
        const remainingEvents = events.filter(e => !selectedEventIds.includes(e.id));
        await rebalanceFutureEvents(members, remainingEvents);
        
        setSelectedEventIds([]);
        closeModal();
      }
    });
  };

  const openSlideModal = (event, index) => {
    const absentId = event.assignedIds[index];
    const absentName = event.assignedNames[index];
    const otherInEvent = event.assignedIds.filter((_, i) => i !== index);
    const futureEvents = events.filter(e => !e.completed && e.id !== event.id).sort((a,b) => new Date(a.date) - new Date(b.date));
    let candidates = [];
    
    futureEvents.forEach(fe => {
      fe.assignedIds.forEach((id, feIdx) => {
        if (id !== absentId && !otherInEvent.includes(id)) {
          if (!candidates.find(c => c.memberId === id)) {
            candidates.push({ type: 'swap', memberId: id, memberName: fe.assignedNames[feIdx], eventDate: fe.date, swapEvent: fe, feIndex: feIdx });
          }
        }
      });
    });
    
    const allAssigned = events.filter(e => !e.completed).flatMap(e => e.assignedIds);
    const unassigned = members.filter(m => m.active && !allAssigned.includes(m.id) && m.id !== absentId && !otherInEvent.includes(m.id));
    unassigned.sort((a,b) => (a.count || 0) - (b.count || 0)).forEach(m => {
      if (!candidates.find(c => c.memberId === m.id)) candidates.push({ type: 'replace', memberId: m.id, memberName: m.name, count: m.count || 0 });
    });
    
    setSlideModal({ open: true, event, index, absentName, candidates: candidates.slice(0, 3) });
  };

  const executeSlide = async (candidate) => {
    if (!user) return;
    const { event, index, absentName } = slideModal;
    const absentId = event.assignedIds[index];
    if (candidate.type === 'swap') {
      const newIds = [...event.assignedIds]; const newNames = [...event.assignedNames];
      newIds[index] = candidate.memberId; newNames[index] = candidate.memberName;
      await updateDoc(getDocRef('events', event.id), { assignedIds: newIds, assignedNames: newNames });
      const fe = candidate.swapEvent;
      const feIds = [...fe.assignedIds]; const feNames = [...fe.assignedNames];
      feIds[candidate.feIndex] = absentId; feNames[candidate.feIndex] = absentName;
      await updateDoc(getDocRef('events', fe.id), { assignedIds: feIds, assignedNames: feNames });
    } else {
      const newIds = [...event.assignedIds]; const newNames = [...event.assignedNames];
      newIds[index] = candidate.memberId; newNames[index] = candidate.memberName;
      await updateDoc(getDocRef('events', event.id), { assignedIds: newIds, assignedNames: newNames });
    }
    setSlideModal({ ...slideModal, open: false });
  };

  const completeEvent = async (event) => {
    setModal({
      open: true, title: '完了の確認', content: '担当者の回数を1回加算して履歴に移動しますか？',
      onConfirm: async () => {
        if (!user) return;
        for (const mid of event.assignedIds) {
          const mRef = getDocRef('members', mid);
          const mSnap = await getDoc(mRef);
          if (mSnap.exists()) await updateDoc(mRef, { count: (mSnap.data().count || 0) + 1 });
        }
        await updateDoc(getDocRef('events', event.id), { completed: true });
        closeModal();
      }
    });
  };

  const undoComplete = async (event) => {
    setModal({
      open: true, title: '取消の確認', content: '完了を取り消します。回数も1回分差し引かれます。',
      onConfirm: async () => {
        if (!user) return;
        for (const mid of event.assignedIds) {
          const mRef = getDocRef('members', mid);
          const mSnap = await getDoc(mRef);
          if (mSnap.exists()) await updateDoc(mRef, { count: Math.max(0, (mSnap.data().count || 0) - 1) });
        }
        await updateDoc(getDocRef('events', event.id), { completed: false });
        closeModal();
      }
    });
  };

  const checkAdminAuth = () => {
    if (adminPassInput === MASTER_ADMIN_PASSCODE) setIsAdminAuthenticated(true);
    else setModal({ open: true, title: "失敗", content: "パスワードが正しくありません。" });
  };

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    const groupName = e.target.groupName.value.trim();
    if (!groupName || !user) return;
    const newGroupId = 'group_' + Date.now().toString(36);
    try {
      await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'groups', newGroupId), { name: String(groupName), createdAt: new Date().toISOString() });
      await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'config', newGroupId), { appName: String(groupName), taskName: "用具" });
      e.target.reset();
      window.location.hash = newGroupId;
    } catch (e) {
      setModal({ open: true, title: "エラー", content: "作成に失敗しました。" });
    }
  };

  if (errorMsg) return (
    <div className="min-h-screen bg-red-50 flex items-center justify-center p-8 font-sans">
      <div className="bg-white p-8 rounded-3xl shadow-xl max-w-sm border-2 border-red-100 text-center animate-in zoom-in-95">
        <h2 className="text-red-600 font-black text-xl mb-4 text-center">⚠️ エラーが発生しました</h2>
        <p className="text-slate-600 text-sm leading-relaxed mb-6 whitespace-pre-wrap font-bold">{errorMsg}</p>
        <button onClick={() => window.location.reload()} className="w-full bg-red-600 text-white font-bold py-4 rounded-2xl shadow-lg">再読み込み</button>
      </div>
    </div>
  );

  if (loading) return <div className="flex h-screen items-center justify-center font-black text-slate-400 tracking-widest uppercase">Connecting...</div>;

  if (!groupId && !isAdminAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-5 font-sans">
        <div className="w-full max-w-md bg-white rounded-[2.5rem] p-10 shadow-2xl text-center animate-in zoom-in-95">
          <div className="text-5xl mb-6">🔒</div>
          <h1 className="text-2xl font-black text-indigo-600 mb-2 tracking-tight uppercase">Admin Lock</h1>
          <p className="text-slate-400 text-sm mb-8 font-bold leading-relaxed">管理者用パスワードを入力してください</p>
          <input type="password" value={adminPassInput} onChange={e => setAdminPassInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && checkAdminAuth()} className="w-full p-5 rounded-2xl bg-slate-50 border-none ring-1 ring-slate-200 font-bold text-center text-xl mb-6 outline-none focus:ring-2 focus:ring-indigo-500 transition-all" autoFocus />
          <button onClick={checkAdminAuth} className="w-full bg-indigo-600 text-white font-black py-5 rounded-2xl shadow-xl active:scale-95 transition">ログイン</button>
        </div>
      </div>
    );
  }

  if (!groupId && isAdminAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-5 font-sans">
        <div className="w-full max-w-md bg-white rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden">
          <div className="text-center mb-10">
            <div className="text-5xl mb-2">📋</div>
            <h1 className="text-3xl font-black text-indigo-600 tracking-tighter">DUTY MANAGER</h1>
            <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest mt-2 bg-slate-50 py-1 rounded-full inline-block px-4 font-black tracking-widest">Admin Dashboard</p>
          </div>
          <div className="space-y-8">
            <div>
              <h3 className="text-xs font-black text-slate-400 mb-3 uppercase tracking-widest ml-1">登録済みの団体</h3>
              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                {groupList.map(g => (
                  <div key={g.id} className="flex gap-2 group">
                    <button onClick={() => window.location.hash = g.id} className="flex-1 p-5 bg-white border-2 border-slate-100 rounded-2xl text-left flex justify-between items-center font-bold shadow-sm hover:border-indigo-500 transition-all overflow-hidden">
                      <span className="text-indigo-900 truncate font-black">{g.name}</span><IconChevronRight />
                    </button>
                    <button onClick={() => { setModal({ open: true, title: "削除", content: `「${g.name}」を完全に削除しますか？`, onConfirm: async () => { await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'groups', g.id)); closeModal(); } }); }} className="p-5 bg-red-50 text-red-300 hover:text-red-500 rounded-2xl transition shadow-sm"><IconTrash /></button>
                  </div>
                ))}
                {groupList.length === 0 && <p className="text-slate-300 text-sm text-center py-8 italic font-bold">団体はまだありません</p>}
              </div>
            </div>
            <div className="pt-8 border-t border-slate-100">
              <h3 className="text-xs font-black text-slate-400 mb-3 uppercase tracking-widest ml-1 font-black">団体を追加</h3>
              <form onSubmit={handleCreateGroup} className="flex gap-2">
                <input name="groupName" placeholder="団体名を入力" className="flex-1 p-4 bg-slate-50 rounded-2xl font-bold outline-none ring-1 ring-slate-200 focus:ring-2 focus:ring-indigo-500 transition-all" required />
                <button type="submit" className="bg-indigo-600 text-white px-6 rounded-2xl font-black shadow-lg">作成</button>
              </form>
            </div>
            <button onClick={() => setIsAdminAuthenticated(false)} className="w-full py-4 text-slate-300 text-[10px] font-bold uppercase tracking-[0.2em] hover:text-slate-500 transition-colors font-black">Logout Admin Session</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-28 max-w-md mx-auto shadow-2xl font-sans relative overflow-x-hidden">
      {/* 汎用モーダル */}
      {modal.open && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm transition-all">
          <div className="bg-white rounded-[2rem] w-full max-w-xs overflow-hidden shadow-2xl p-8 text-center animate-in zoom-in-95">
            <h3 className="text-2xl font-black mb-4">{modal.title}</h3>
            <p className="text-slate-600 mb-6 font-bold leading-relaxed">{modal.content}</p>
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

      {/* 交代モーダル */}
      {slideModal.open && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-[2.5rem] w-full max-w-sm overflow-hidden shadow-2xl p-8 animate-in zoom-in-95">
            <h3 className="text-2xl font-black mb-2 text-slate-800">当番の交代</h3>
            <p className="text-slate-500 text-sm mb-6 font-bold tracking-tight">{slideModal.absentName}さんの代わりに誰に担当してもらいますか？</p>
            <div className="space-y-3">
              {slideModal.candidates.map((c, i) => (
                <button key={i} onClick={() => executeSlide(c)} className="w-full text-left p-5 rounded-2xl border-2 border-slate-100 hover:border-indigo-500 active:bg-indigo-50 transition-all">
                  <div className="font-black text-slate-800 text-lg">{c.memberName} さん</div>
                  <div className="text-[10px] font-bold text-indigo-500 mt-1 uppercase tracking-widest">{c.type === 'swap' ? `🔄 ${formatDate(c.eventDate)} と交換` : `✅ 累計回数: ${c.count}回`}</div>
                </button>
              ))}
              {slideModal.candidates.length === 0 && <p className="text-center py-4 text-slate-400 text-xs font-bold">交代可能なメンバーが登録されていません</p>}
            </div>
            <button onClick={() => setSlideModal({ ...slideModal, open: false })} className="w-full py-5 text-slate-400 font-bold mt-4 font-black">キャンセル</button>
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
          <div className="space-y-10 animate-in fade-in duration-500">
            {/* 次回の当番 */}
            <div className="bg-white p-8 rounded-[3.5rem] border-2 border-slate-100 shadow-sm text-center relative overflow-hidden">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-4">次回の当番</span>
              {events.filter(e => !e.completed).length > 0 ? (
                (() => {
                  const next = events.filter(e => !e.completed).sort((a,b) => new Date(a.date) - new Date(b.date))[0];
                  return (
                    <div className="space-y-6">
                      <div className="text-3xl font-black text-slate-800 tracking-tighter">{formatDate(next.date)}</div>
                      <div className="space-y-3">
                        {next.assignedNames.map((name, i) => (
                          <div key={i} className="flex items-center justify-between bg-indigo-600 text-white px-7 py-5 rounded-[2.5rem] shadow-xl shadow-indigo-100">
                            <span className="text-3xl font-black tracking-wide">{name} <span className="text-lg font-normal opacity-80">さん</span></span>
                            <button onClick={() => openSlideModal(next, i)} className="flex items-center gap-2 px-4 py-2 bg-white/20 active:bg-white/30 rounded-2xl transition text-sm font-bold"><IconSlide /> 交代</button>
                          </div>
                        ))}
                      </div>
                      <button onClick={() => completeEvent(next)} className="w-full bg-emerald-500 text-white font-black text-3xl py-7 rounded-[2.5rem] shadow-2xl active:scale-95 transition-transform mt-4 shadow-emerald-50">完了しました</button>
                    </div>
                  );
                })()
              ) : <p className="py-12 text-slate-300 font-black uppercase text-xs tracking-widest font-black">予定がありません</p>}
            </div>

            {/* 履歴 */}
            <section className="space-y-4">
              <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest ml-2 font-black">履歴</h3>
              <div className="space-y-3">
                {events.filter(e => e.completed).sort((a,b) => new Date(b.date) - new Date(a.date)).map(e => (
                  <div key={e.id} className="bg-white p-5 rounded-3xl border border-slate-100 flex justify-between items-center shadow-sm">
                    <div>
                      <div className="text-[10px] font-bold text-slate-300 uppercase tracking-widest font-black">{formatDate(e.date)}</div>
                      <div className="font-black text-slate-600 text-xl leading-none mt-1">{e.assignedNames.join(', ')} <span className="text-sm font-normal">さん</span></div>
                    </div>
                    <button onClick={() => undoComplete(e)} className="p-3 text-slate-400 hover:text-indigo-500 active:bg-slate-50 rounded-2xl transition" title="取消"><IconUndo /></button>
                  </div>
                ))}
                {events.filter(e => e.completed).length === 0 && <p className="text-center py-10 text-slate-200 text-xs font-black uppercase tracking-widest font-black">No History</p>}
              </div>
            </section>
          </div>
        )}

        {activeTab === 'schedule' && (
          <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
            {!isScheduleFormOpen ? (
              <div className="space-y-4">
                <button onClick={() => setIsScheduleFormOpen(true)} className="w-full bg-indigo-600 text-white font-black py-5 rounded-[2rem] flex items-center justify-center gap-2 shadow-lg active:scale-95 transition shadow-indigo-100 font-black"><IconPlus /> 予定を追加</button>
                
                <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest ml-2 mt-6 font-black flex justify-between items-center">
                  待機中の予定
                  {selectedEventIds.length > 0 && (
                    <button onClick={handleBulkDelete} className="bg-red-50 text-red-500 px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1 active:scale-95 transition-all">
                      <IconTrash /> {selectedEventIds.length}件を削除
                    </button>
                  )}
                </h3>
                
                {events.filter(e => !e.completed).sort((a, b) => new Date(a.date) - new Date(b.date)).map(e => (
                  <div key={e.id} className={`bg-white p-5 rounded-[2rem] border ${selectedEventIds.includes(e.id) ? 'border-indigo-300 ring-2 ring-indigo-50' : 'border-slate-100'} flex justify-between items-center shadow-sm transition-all`}>
                    <div className="flex items-center gap-4 overflow-hidden">
                      <input 
                        type="checkbox" 
                        className="w-5 h-5 accent-indigo-600 rounded-md shrink-0 border-slate-300"
                        checked={selectedEventIds.includes(e.id)}
                        onChange={() => toggleEventSelection(e.id)}
                      />
                      <div className="overflow-hidden">
                        <div className="text-xl font-black text-slate-800">{formatDate(e.date)}</div>
                        <div className="text-xs font-bold text-indigo-500 uppercase mt-1 truncate font-black tracking-widest">担当: {e.assignedNames.join(', ')}</div>
                      </div>
                    </div>
                    <div className="flex gap-1 shrink-0 ml-2">
                      <button onClick={async () => { 
                        setModal({ 
                          open: true, title: "予定の削除", content: "消去しますか？\n（削除後、残りの予定は自動で公平に割り当て直されます）", 
                          onConfirm: async () => { 
                            await deleteDoc(getDocRef('events', e.id)); 
                            const remainingEvents = events.filter(ev => ev.id !== e.id);
                            await rebalanceFutureEvents(members, remainingEvents);
                            setModal({...modal, open: false}); 
                          } 
                        }); 
                      }} className="p-3 text-slate-300 hover:text-red-500 transition-colors"><IconTrash /></button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white p-8 rounded-[3rem] border border-slate-200 animate-in zoom-in-95 shadow-xl relative">
                <button onClick={() => setIsScheduleFormOpen(false)} className="absolute top-8 right-8 p-2 text-slate-400 bg-slate-50 rounded-full transition-colors hover:text-red-500"><IconClose /></button>
                <div className="flex mb-8 bg-slate-100 p-2 rounded-2xl mr-12">
                  <button onClick={() => setCreationMode('single')} className={`flex-1 py-3 text-xs font-black rounded-xl transition-all ${creationMode === 'single' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400'}`}>単発</button>
                  <button onClick={() => setCreationMode('bulk')} className={`flex-1 py-3 text-xs font-black rounded-xl transition-all ${creationMode === 'bulk' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400'}`}>一括作成</button>
                </div>
                {creationMode === 'single' ? (
                  <form onSubmit={handleProcessEvent} className="space-y-6">
                    <div><label className="text-[10px] font-black text-slate-400 uppercase mb-2 block font-black tracking-widest">実施日</label><input name="date" type="date" required className="w-full p-5 rounded-2xl bg-slate-50 font-black outline-none border-none ring-1 ring-slate-200 focus:ring-2 focus:ring-indigo-500" defaultValue={new Date().toISOString().split('T')[0]} /></div>
                    <div><label className="text-[10px] font-black text-slate-400 uppercase mb-2 block font-black tracking-widest">担当人数</label><select name="sets" className="w-full p-5 rounded-2xl bg-slate-50 font-black outline-none border-none ring-1 ring-slate-200 focus:ring-2 focus:ring-indigo-500"><option value="1">1名担当</option><option value="2">2名担当</option></select></div>
                    <button type="submit" className="w-full bg-indigo-600 text-white font-black py-5 rounded-[1.5rem] shadow-xl active:scale-95 transition-all mt-4 font-black uppercase tracking-widest">全体を公平に自動割り当て</button>
                  </form>
                ) : (
                  <form onSubmit={handleBulkProcessEvent} className="space-y-6">
                    <div className="grid grid-cols-2 gap-3">
                      <div><label className="text-[10px] font-black text-slate-400 mb-2 block font-black font-black">開始日</label><input type="date" value={bulkStart} onChange={e => setBulkStart(e.target.value)} className="w-full p-4 rounded-2xl bg-slate-50 font-black text-sm border-none ring-1 ring-slate-200" /></div>
                      <div><label className="text-[10px] font-black text-slate-400 mb-2 block font-black font-black">終了日</label><input type="date" value={bulkEnd} onChange={e => setBulkEnd(e.target.value)} className="w-full p-4 rounded-2xl bg-slate-50 font-black text-sm border-none ring-1 ring-slate-200" /></div>
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-slate-400 mb-3 block font-black font-black">対象の曜日</label>
                      <div className="flex gap-1 justify-between">
                        {['日','月','火','水','木','金','土'].map((d, i) => (
                          <button key={i} type="button" onClick={() => bulkDays.includes(i) ? setBulkDays(bulkDays.filter(v => v !== i)) : setBulkDays([...bulkDays, i])} className={`flex-1 py-3 text-xs font-black rounded-xl transition-all ${bulkDays.includes(i) ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-100 text-slate-400'}`}>{d}</button>
                        ))}
                      </div>
                    </div>
                    <div><label className="text-[10px] font-black text-slate-400 mb-2 block font-black font-black">1日あたりの人数</label><select name="bulkSets" className="w-full p-4 rounded-2xl bg-slate-50 font-black border-none ring-1 ring-slate-200"><option value="1">1名担当</option><option value="2">2名担当</option></select></div>
                    <button type="submit" className="w-full bg-indigo-600 text-white font-black py-5 rounded-[1.5rem] shadow-xl mt-4 font-black uppercase tracking-widest">全体を公平に一括作成</button>
                  </form>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'members' && (
          <div className="space-y-6 animate-in slide-in-from-left-4 duration-500">
            <form onSubmit={handleAddMember} className="flex gap-2 p-2 bg-white rounded-[2rem] border border-slate-200 shadow-sm focus-within:ring-2 focus-within:ring-indigo-500 transition-all">
              <input name="memberName" type="text" placeholder="名前を入力" className="flex-1 bg-transparent px-5 font-bold outline-none font-black" />
              <button type="submit" className="bg-indigo-600 text-white p-5 rounded-2xl active:scale-95 shadow-md shadow-indigo-100"><IconPlus /></button>
            </form>

            <div className="space-y-3">
              <div className="flex justify-between px-4 text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1 font-black">
                <span>保護者・メンバー (計 {members.length} 名)</span>
                <span>累計回数 / 操作</span>
              </div>
              {members.map(m => (
                <div key={m.id} className={`p-5 rounded-[2.5rem] border flex items-center justify-between transition-all ${m.active ? 'bg-white shadow-sm border-slate-100' : 'bg-slate-100 border-transparent opacity-60'}`}>
                  {editingMemberId === m.id ? (
                    <form onSubmit={handleEditMember} className="flex gap-2 items-center w-full animate-in fade-in duration-300">
                      <input type="text" value={editMemberName} onChange={e => setEditMemberName(e.target.value)} className="flex-1 p-3 rounded-xl border border-indigo-200 font-black outline-none font-black" autoFocus />
                      <input type="number" value={editMemberCount} onChange={e => setEditMemberCount(e.target.value)} className="w-20 p-3 rounded-xl border border-indigo-200 font-black text-center font-black" />
                      <button type="submit" className="bg-indigo-600 text-white p-3 rounded-xl"><IconPlus /></button>
                      <button type="button" onClick={() => setEditingMemberId(null)} className="p-3 text-slate-400"><IconClose /></button>
                    </form>
                  ) : (
                    <>
                      <div className="flex items-center gap-4">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-white shadow-sm ${m.active ? 'bg-indigo-500' : 'bg-slate-400'}`}>{m.name.charAt(0)}</div>
                        <div>
                          <div className="font-black text-xl text-slate-800 flex items-center gap-2">
                            {m.name} <span className="text-xs font-normal opacity-50 font-black">さん</span>
                            <button onClick={() => { setEditingMemberId(m.id); setEditMemberName(m.name); setEditMemberCount(m.count || 0); }} className="p-1 text-slate-200 hover:text-indigo-600 transition-colors"><IconEdit /></button>
                          </div>
                          <div className="text-xs text-indigo-500 font-bold uppercase font-black tracking-widest font-black">累計回数: {m.count || 0}回</div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => handleToggleMember(m)} className={`px-4 py-2 rounded-xl text-[10px] font-black transition-colors ${m.active ? 'bg-slate-100 text-slate-500' : 'bg-indigo-100 text-indigo-700'} font-black`}>{m.active ? '休止' : '復帰'}</button>
                        <button onClick={() => handleDeleteMember(m)} className="p-3 text-slate-100 hover:text-red-500 transition-colors"><IconTrash /></button>
                      </div>
                    </>
                  )}
                </div>
              ))}
              {members.length === 0 && <p className="text-center py-10 text-slate-200 text-xs font-black tracking-widest uppercase font-black">No Members</p>}
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="bg-white p-8 rounded-[3.5rem] space-y-8 animate-in slide-in-from-right-2 duration-300 shadow-xl border border-slate-100">
            <h3 className="font-black text-2xl tracking-tight text-slate-800 text-center font-black uppercase font-black">App Settings</h3>
            <div className="space-y-6">
              <div>
                <label className="text-[10px] font-black text-slate-400 mb-2 block ml-1 uppercase tracking-widest text-center font-black">部屋の名前</label>
                <input type="text" value={settings.appName} onChange={async (e) => { const newName = String(e.target.value); setSettings(s => ({ ...s, appName: newName })); await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'config', groupId), { ...settings, appName: newName }); await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'groups', groupId), { name: newName }); }} className="w-full p-5 rounded-[1.5rem] bg-slate-50 font-bold ring-1 ring-slate-200 outline-none text-center font-black" />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 mb-2 block ml-1 uppercase tracking-widest text-center font-black">当番の名称</label>
                <input type="text" value={settings.taskName} onChange={async (e) => { const newTask = String(e.target.value); setSettings(s => ({ ...s, taskName: newTask })); await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'config', groupId), { ...settings, taskName: newTask }); }} className="w-full p-5 rounded-[1.5rem] bg-slate-50 font-bold ring-1 ring-slate-200 outline-none text-center font-black" />
              </div>
              <div className="pt-8 border-t border-slate-100">
                <button onClick={() => { setAdminPassInput(""); setIsAdminAuthenticated(false); window.location.hash = ''; setGroupId(null); setActiveTab('home'); }} className="w-full bg-slate-100 text-slate-500 font-black py-6 rounded-[1.5rem] flex justify-center items-center gap-2 active:bg-slate-200 transition-colors uppercase text-[11px] tracking-[0.2em] font-black"><IconLogOut /> 部屋を選び直す</button>
              </div>
            </div>
            <button onClick={() => setActiveTab('home')} className="w-full bg-slate-900 text-white font-black py-6 rounded-[1.5rem] shadow-2xl active:scale-95 transition-all font-black">設定を完了する</button>
          </div>
        )}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-100 flex justify-around items-center px-6 py-5 z-50 max-w-md mx-auto rounded-t-[3rem] shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
        <button onClick={() => setActiveTab('home')} className={`flex flex-col items-center gap-2 transition-all ${activeTab === 'home' ? 'text-indigo-600 scale-110' : 'text-slate-300'}`}><IconHome /><span className="text-[10px] font-black uppercase tracking-widest leading-none font-black">履歴</span></button>
        <button onClick={() => setActiveTab('schedule')} className={`flex flex-col items-center gap-2 transition-all ${activeTab === 'schedule' ? 'text-indigo-600 scale-110' : 'text-slate-300'}`}><IconCalendar /><span className="text-[10px] font-black uppercase tracking-widest leading-none font-black">予定</span></button>
        <button onClick={() => setActiveTab('members')} className={`flex flex-col items-center gap-2 transition-all ${activeTab === 'members' ? 'text-indigo-600 scale-110' : 'text-slate-300'}`}><IconUsers /><span className="text-[10px] font-black uppercase tracking-widest leading-none font-black">名簿</span></button>
      </nav>
    </div>
  );
}