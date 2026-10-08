const FIREBASE_API_KEY = 'AIzaSyBVNjUtlL2LEpNEnHmrzJOiMHrTgWLo6C';
const AUTH_URL = 'https://identitytoolkit.googleapis.com/v1';
const TOKEN_URL = 'https://securetoken.googleapis.com/v1';
const API_URL = 'https://wishlist-yu2x.onrender.com/api/add-item';
const PRESET_CATEGORIES = ['Keyboards', 'Fitness', 'Books', 'Tech', 'Games'];

let currentUrl = '';
let currentTitle = '';
let idToken = '';

const authPanel = document.getElementById('auth-panel');
const savePanel = document.getElementById('save-panel');
const authStatus = document.getElementById('auth-status');
const saveStatus = document.getElementById('status');

const setStatus = (element, message, type = '') => {
    element.textContent = message;
    element.className = type;
};

const showAuthPanel = (message = '', type = 'error') => {
    authPanel.hidden = false;
    savePanel.hidden = true;
    setStatus(authStatus, message, type);
};

const showSavePanel = (email) => {
    authPanel.hidden = true;
    savePanel.hidden = false;
    document.getElementById('signed-in-email').textContent = email;
    setStatus(saveStatus, '');
};

const getStoredRefreshToken = () => new Promise((resolve) => {
    chrome.storage.local.get('refreshToken', (result) => resolve(result.refreshToken || ''));
});

const requestJson = async (url, options) => {
    const response = await fetch(url, options);
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
        const error = new Error(payload.error?.message || `Request failed (${response.status})`);
        error.status = response.status;
        throw error;
    }
    return payload;
};

const authErrorMessage = (code) => {
    if (['EMAIL_NOT_FOUND', 'INVALID_PASSWORD', 'INVALID_LOGIN_CREDENTIALS'].includes(code)) {
        return 'Email or password is incorrect.';
    }
    if (code === 'USER_DISABLED') return 'This account has been disabled.';
    if (code === 'TOO_MANY_ATTEMPTS_TRY_LATER') return 'Too many attempts. Try again later.';
    return 'Could not sign in. Check your details and try again.';
};

const signIn = async (email, password) => requestJson(
    `${AUTH_URL}/accounts:signInWithPassword?key=${FIREBASE_API_KEY}`,
    {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, returnSecureToken: true }),
    }
);

const restoreSession = async () => {
    const refreshToken = await getStoredRefreshToken();
    if (!refreshToken) {
        showAuthPanel();
        return;
    }

    try {
        const session = await requestJson(`${TOKEN_URL}/token?key=${FIREBASE_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({ grant_type: 'refresh_token', refresh_token: refreshToken }),
        });
        idToken = session.id_token;
        await chrome.storage.local.set({ refreshToken: session.refresh_token });
        const stored = await chrome.storage.local.get('email');
        showSavePanel(stored.email || 'Signed in');
    } catch (error) {
        if (error.status === 400 || error.status === 401) {
            await chrome.storage.local.remove(['refreshToken', 'email']);
            showAuthPanel('Your session expired. Please sign in again.');
        } else {
            showAuthPanel('Could not reach Firebase. Check your connection and try again.');
        }
    }
};

document.getElementById('auth-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    const submitButton = document.getElementById('auth-submit');
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;
    submitButton.disabled = true;
    submitButton.textContent = 'Signing in...';
    setStatus(authStatus, '');

    try {
        const session = await signIn(email, password);
        idToken = session.idToken;
        await chrome.storage.local.set({ refreshToken: session.refreshToken, email: session.email });
        document.getElementById('login-password').value = '';
        showSavePanel(session.email);
    } catch (error) {
        const code = error.message.split(' : ')[0];
        showAuthPanel(authErrorMessage(code));
    } finally {
        submitButton.disabled = false;
        submitButton.textContent = 'Sign in';
    }
});

document.getElementById('forgot-password').addEventListener('click', async () => {
    const emailInput = document.getElementById('login-email');
    const resetButton = document.getElementById('forgot-password');
    const email = emailInput.value.trim();
    if (!emailInput.reportValidity()) return;

    resetButton.disabled = true;
    resetButton.textContent = 'Sending...';
    setStatus(authStatus, '');
    try {
        await requestJson(`${AUTH_URL}/accounts:sendOobCode?key=${FIREBASE_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ requestType: 'PASSWORD_RESET', email }),
        });
        setStatus(authStatus, 'Password reset email sent. Check your inbox.', 'success');
    } catch {
        setStatus(authStatus, 'Could not send a reset email. Check the address and try again.', 'error');
    } finally {
        resetButton.disabled = false;
        resetButton.textContent = 'Forgot password?';
    }
});

document.getElementById('sign-out').addEventListener('click', async () => {
    idToken = '';
    await chrome.storage.local.remove(['refreshToken', 'email']);
    document.getElementById('login-password').value = '';
    showAuthPanel();
});

const categoryInput = document.getElementById('category');
const suggestionsBox = document.getElementById('suggestions');

categoryInput.addEventListener('input', (event) => {
    const typed = event.target.value.toLowerCase().trim();
    suggestionsBox.innerHTML = '';
    if (!typed) {
        suggestionsBox.classList.remove('show');
        return;
    }

    const matches = PRESET_CATEGORIES.filter((category) => category.toLowerCase().includes(typed));
    matches.forEach((category) => {
        const item = document.createElement('div');
        item.className = 'suggestion-item preset';
        item.textContent = category;
        item.addEventListener('click', () => {
            categoryInput.value = category;
            suggestionsBox.classList.remove('show');
        });
        suggestionsBox.appendChild(item);
    });

    if (!matches.some((category) => category.toLowerCase() === typed)) {
        const createItem = document.createElement('div');
        createItem.className = 'suggestion-item create-new';
        createItem.textContent = `Create "${typed}"`;
        createItem.addEventListener('click', () => {
            categoryInput.value = typed;
            suggestionsBox.classList.remove('show');
        });
        suggestionsBox.appendChild(createItem);
    }
    suggestionsBox.classList.add('show');
});

categoryInput.addEventListener('blur', () => {
    setTimeout(() => suggestionsBox.classList.remove('show'), 150);
});

document.getElementById('save-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    const price = Number(document.getElementById('price').value);
    const category = categoryInput.value.trim();
    const submitButton = document.getElementById('submit');

    if (!idToken) {
        showAuthPanel('Your session expired. Please sign in again.');
        return;
    }
    if (!Number.isFinite(price) || price < 0 || !category) {
        setStatus(saveStatus, 'Enter a valid price and category to continue.', 'error');
        return;
    }

    submitButton.disabled = true;
    submitButton.textContent = 'Saving...';
    setStatus(saveStatus, '');
    try {
        await requestJson(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${idToken}`,
            },
            body: JSON.stringify({ url: currentUrl, price, category, title: currentTitle }),
        });
        setStatus(saveStatus, 'Saved. You can find it in your wishlist.', 'success');
        setTimeout(() => window.close(), 1500);
    } catch (error) {
        if (error.status === 401) {
            idToken = '';
            await chrome.storage.local.remove(['refreshToken', 'email']);
            showAuthPanel('Your session expired. Please sign in again.');
        } else {
            setStatus(saveStatus, 'Could not save this item. Please try again.', 'error');
        }
    } finally {
        submitButton.disabled = false;
        submitButton.textContent = 'Save to wishlist';
    }
});

chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const activeTab = tabs[0];
    currentUrl = activeTab?.url || '';
    currentTitle = activeTab?.title || '';
    document.getElementById('title').value = currentTitle;
    const source = document.getElementById('source');
    source.textContent = currentUrl ? new URL(currentUrl).hostname : 'Page address unavailable';
    if (currentUrl.startsWith('http://') || currentUrl.startsWith('https://')) source.href = currentUrl;
    restoreSession();
});