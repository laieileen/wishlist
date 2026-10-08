export default function AuthPanel({
    authMode,
    setAuthMode,
    email,
    setEmail,
    password,
    setPassword,
    authBusy,
    authFeedback,
    authFeedbackType,
    onSubmit,
}) {
    const setMode = (mode) => {
        setAuthMode(mode);
    };

    return (
        <main className="auth-layout">
            <section className="auth-copy">
                {/* <p className="eyebrow">A LITTLE PLACE FOR THE THINGS YOU LOVE</p> */}
                <h1>Your wishlist<span></span></h1>
                <p className="intro-copy">Sign in to keep your wishlist items saved, wherever you browse</p>
                <div className="auth-note-art" aria-hidden="true">
                    <span className="art-ticket">things worth keeping</span>
                    <span className="art-flower">✳</span>
                    <span className="art-dot" />
                </div>
            </section>
            <section className="auth-form-panel" aria-labelledby="auth-heading">
                <p className="eyebrow">YOUR COLLECTION, YOURS</p>
                <h2 id="auth-heading">{authMode === 'signup' ? 'Create your account' : authMode === 'reset' ? 'Reset your password' : 'Welcome back'}</h2>
                {authMode === 'reset' ? (
                    <button type="button" className="auth-link back-to-signin" onClick={() => setMode('signin')}>Back to sign in</button>
                ) : (
                    <div className="auth-mode" role="group" aria-label="Account action">
                        <button type="button" className={authMode === 'signin' ? 'active' : ''} onClick={() => setMode('signin')}>Sign in</button>
                        <button type="button" className={authMode === 'signup' ? 'active' : ''} onClick={() => setMode('signup')}>Create account</button>
                    </div>
                )}
                <form className="auth-form" onSubmit={onSubmit}>
                    <label htmlFor="email">Email</label>
                    <input id="email" type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} />
                    {authMode !== 'reset' && <>
                        <label htmlFor="password">Password</label>
                        <input id="password" type="password" autoComplete={authMode === 'signup' ? 'new-password' : 'current-password'} minLength="6" required value={password} onChange={(event) => setPassword(event.target.value)} />
                    </>}
                    {authFeedback && <p className={`auth-feedback ${authFeedbackType}`} role={authFeedbackType === 'error' ? 'alert' : 'status'}>{authFeedback}</p>}
                    <button className="auth-submit" type="submit" disabled={authBusy}>
                        {authBusy ? 'Please wait...' : authMode === 'signup' ? 'Create account' : authMode === 'reset' ? 'Send reset email' : 'Sign in'}
                    </button>
                    {authMode === 'signin' && <button type="button" className="auth-link" onClick={() => setMode('reset')}>Forgot password?</button>}
                </form>
            </section>
        </main>
    );
}
