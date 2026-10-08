import { useEffect, useState } from 'react';
import { initializeApp } from 'firebase/app';
import { createUserWithEmailAndPassword, getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { getFirestore, collection, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
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

const formatPrice = (price) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(price) || 0);

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
    setError('');
    try {
      if (authMode === 'signup') {
        await createUserWithEmailAndPassword(auth, email.trim(), password);
      } else {
        await signInWithEmailAndPassword(auth, email.trim(), password);
      }
    } catch (authError) {
      setError(authError.message || 'Could not authenticate. Please try again.');
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
        <main className="auth-layout">
          <section className="auth-copy">
            <p className="eyebrow">A LITTLE PLACE FOR THE THINGS YOU LOVE</p>
            <h1>Your wishlist<span>.</span></h1>
            <p className="intro-copy">Sign in to keep your finds together, wherever you browse.</p>
          </section>
          <section className="auth-form-panel" aria-labelledby="auth-heading">
            <p className="eyebrow">YOUR COLLECTION, YOURS</p>
            <h2 id="auth-heading">{authMode === 'signup' ? 'Create your account' : 'Welcome back'}</h2>
            <div className="auth-mode" role="group" aria-label="Account action">
              <button type="button" className={authMode === 'signin' ? 'active' : ''} onClick={() => { setAuthMode('signin'); setError(''); }}>Sign in</button>
              <button type="button" className={authMode === 'signup' ? 'active' : ''} onClick={() => { setAuthMode('signup'); setError(''); }}>Create account</button>
            </div>
            <form className="auth-form" onSubmit={handleAuthSubmit}>
              <label htmlFor="email">Email</label>
              <input id="email" type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} />
              <label htmlFor="password">Password</label>
              <input id="password" type="password" autoComplete={authMode === 'signup' ? 'new-password' : 'current-password'} minLength="6" required value={password} onChange={(event) => setPassword(event.target.value)} />
              {error && <p className="notice error-notice" role="alert">{error}</p>}
              <button className="auth-submit" type="submit" disabled={authBusy}>
                {authBusy ? 'Please wait...' : authMode === 'signup' ? 'Create account' : 'Sign in'}
              </button>
            </form>
          </section>
        </main>
      ) : (
        <main>
        <section className="intro">
          <div>
            <p className="eyebrow">A LITTLE PLACE FOR THE THINGS YOU LOVE</p>
            <h1>Your wishlist<span>.</span></h1>
            <p className="intro-copy">Good finds, saved for the right moment.</p>
          </div>
          <div className="collection-stats" aria-label="Wishlist summary">
            <div><strong>{items.length}</strong><span>{items.length === 1 ? 'saved item' : 'saved items'}</span></div>
            <div><strong>{formatPrice(totalValue)}</strong><span>total wishlist value</span></div>
          </div>
        </section>

        <section className="collection" aria-label="Saved items">
          <div className="collection-heading">
            <div>
              <p className="eyebrow">THE COLLECTION</p>
              <h2>Saved things <span>{items.length}</span></h2>
            </div>
            <label className="search-box">
              <span aria-hidden="true">Search</span>
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Find something..."
                aria-label="Search wishlist"
              />
            </label>
          </div>

          <div className="filters" aria-label="Filter by category">
            {categories.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => setFilter(category)}
                className={filter === category ? 'active' : ''}
                aria-pressed={filter === category}
              >
                {category}
              </button>
            ))}
          </div>

          {error && <p className="notice error-notice" role="alert">{error}</p>}
          {loading ? (
            <div className="collection-message" role="status">Gathering your saved things...</div>
          ) : filtered.length > 0 ? (
            <div className="items-grid">
              {filtered.map((item) => {
                const category = item.category || 'Uncategorized';
                return (
                  <article key={item.id} className="item-card">
                    <div className="item-topline">
                      <span className="item-initial" aria-hidden="true">{(item.title || '?').trim().charAt(0).toUpperCase()}</span>
                      <span className="category">{category}</span>
                    </div>
                    <h3>{item.url ? <a href={item.url} target="_blank" rel="noopener noreferrer">{item.title || 'Untitled item'}</a> : item.title || 'Untitled item'}</h3>
                    <div className="item-footer">
                      <p className="price">{formatPrice(item.price)}</p>
                      <button
                        type="button"
                        onClick={() => handleDelete(item.id)}
                        className="delete-btn"
                        disabled={deletingId === item.id}
                        aria-label={`Remove ${item.title || 'item'}`}
                      >
                        {deletingId === item.id ? 'Removing...' : 'Remove'}
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="collection-message empty-state">
              <span className="empty-mark" aria-hidden="true">+</span>
              <h3>{items.length === 0 ? 'Your next favorite starts here.' : 'Nothing in this corner yet.'}</h3>
              <p>{items.length === 0 ? 'Save something from the browser extension and it will show up here.' : 'Try another category or search for a different item.'}</p>
              {items.length > 0 && (filter !== 'All' || query) && <button type="button" onClick={() => { setFilter('All'); setQuery(''); }}>Clear filters</button>}
            </div>
          )}
        </section>
        </main>
      )}
      <footer className="site-footer"><span>Collected with care.</span><span>KEEPSAKE / WISHLIST</span></footer>
    </div>
  );
}