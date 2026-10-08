import { useEffect, useState } from 'react';
import { initializeApp } from 'firebase/app';
import { createUserWithEmailAndPassword, getAuth, onAuthStateChanged, sendPasswordResetEmail, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { getFirestore, collection, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import AuthPanel from './components/AuthPanel';
import ExtensionGuide from './components/ExtensionGuide';
import WishlistBoard from './components/WishlistBoard';
import './App.css';

const firebaseConfig = {
  projectId: 'wishlist-tracker-3486e',
  apiKey: 'AIzaSyBVNjUtlL2LEpNEnHmrzJOiMHrTgWLo6C4',
  authDomain: 'wishlist-tracker-3486e.firebaseapp.com',
  storageBucket: 'wishlist-tracker-3486e.firebasestorage.app',
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const getAddedTime = (dateAdded) => {
  if (dateAdded && typeof dateAdded.toMillis === 'function') return dateAdded.toMillis();
  if (dateAdded instanceof Date) return dateAdded.getTime();
  if (dateAdded?.seconds) return dateAdded.seconds * 1000;
  return 0;
};

export default function App() {
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState('All');
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState('');
  const [user, setUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);
  const [authMode, setAuthMode] = useState('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authBusy, setAuthBusy] = useState(false);
  const [authFeedback, setAuthFeedback] = useState('');
  const [authFeedbackType, setAuthFeedbackType] = useState('error');

  useEffect(() => {
    return onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthReady(true);
    });
  }, []);

  useEffect(() => {
    if (!user) {
      setItems([]);
      setLoading(false);
      setFilter('All');
      setQuery('');
      return undefined;
    }

    setLoading(true);
    const unsubscribe = onSnapshot(
      collection(db, 'wishlists', user.uid, 'items'),
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setItems(data.sort((a, b) => getAddedTime(b.dateAdded) - getAddedTime(a.dateAdded)));
        setLoading(false);
        setError('');
      },
      () => {
        setError('Your wishlist could not be loaded. Check your connection and try again.');
        setLoading(false);
      }
    );
    return unsubscribe;
  }, [user]);

  const categories = ['All', ...new Set(items.map((item) => item.category || 'Uncategorized'))];
  const normalizedQuery = query.trim().toLowerCase();
  const filtered = items.filter((item) => {
    const category = item.category || 'Uncategorized';
    const matchesCategory = filter === 'All' || category === filter;
    const matchesQuery = !normalizedQuery || `${item.title || ''} ${category}`.toLowerCase().includes(normalizedQuery);
    return matchesCategory && matchesQuery;
  });
  const totalValue = items.reduce((sum, item) => sum + (Number(item.price) || 0), 0);

  const handleDelete = async (itemId) => {
    setDeletingId(itemId);
    setError('');
    try {
      await deleteDoc(doc(db, 'wishlists', user.uid, 'items', itemId));
    } catch {
      setError('That item could not be removed. Please try again.');
    } finally {
      setDeletingId('');
    }
  };

  const handleAuthSubmit = async (event) => {
    event.preventDefault();
    setAuthBusy(true);
    setAuthFeedback('');
    try {
      if (authMode === 'reset') {
        await sendPasswordResetEmail(auth, email.trim());
        setAuthFeedback('Password reset email sent. Check your inbox.');
        setAuthFeedbackType('success');
      } else if (authMode === 'signup') {
        await createUserWithEmailAndPassword(auth, email.trim(), password);
      } else {
        await signInWithEmailAndPassword(auth, email.trim(), password);
      }
    } catch (authError) {
      setAuthFeedback(authError.message || 'Could not complete the request. Please try again.');
      setAuthFeedbackType('error');
    } finally {
      setAuthBusy(false);
    }
  };

  const handleSignOut = async () => {
    setError('');
    try {
      await signOut(auth);
    } catch {
      setError('Could not sign out. Please try again.');
    }
  };

  return (
    <div className="App">
      <header className="topbar">
        <a className="wordmark" href="/" aria-label="Wishlist home"><span className="brand-mark">W</span> keepsake</a>
        {user ? (
          <div className="session-control">
            <span className="topbar-note">{user.email}</span>
            <button type="button" onClick={handleSignOut}>Sign out</button>
          </div>
        ) : <span className="topbar-note">YOUR PERSONAL COLLECTION</span>}
      </header>

      {!authReady ? (
        <main className="auth-loading" role="status">Checking your session...</main>
      ) : !user ? (
        <AuthPanel
          authMode={authMode}
          setAuthMode={(mode) => { setAuthMode(mode); setAuthFeedback(''); }}
          email={email}
          setEmail={setEmail}
          password={password}
          setPassword={setPassword}
          authBusy={authBusy}
          authFeedback={authFeedback}
          authFeedbackType={authFeedbackType}
          onSubmit={handleAuthSubmit}
        />
      ) : (
        <WishlistBoard
          items={items}
          filtered={filtered}
          categories={categories}
          filter={filter}
          setFilter={setFilter}
          query={query}
          setQuery={setQuery}
          totalValue={totalValue}
          loading={loading}
          error={error}
          deletingId={deletingId}
          onDelete={handleDelete}
        />
      )}
      {authReady && <ExtensionGuide />}
      {authReady && <footer className="site-footer"><span>Collected with care.</span><span>KEEPSAKE / WISHLIST</span></footer>}
    </div>
  );
}