const admin = require('firebase-admin');
const express = require('express');
const cors = require('cors');
require('dotenv').config();

console.log('Firebase admin imported');
console.log('About to initialize Firebase');

let privateKey = process.env.FIREBASE_PRIVATE_KEY;
if (typeof privateKey === 'string' && !privateKey.includes('\n')) {
    privateKey = privateKey.replace(/\\n/g, '\n');
}

const serviceAccount = {
    projectId: process.env.FIREBASE_PROJECT_ID,
    privateKey: privateKey,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
};

try {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
    });
    console.log('Firebase initialized');
} catch (e) {
    console.error('Firebase init failed:', e.message);
    process.exit(1);
}

const db = admin.firestore();
console.log('Firestore db created');

const app = express();
app.use(express.json());
app.use(cors());

app.get('/', (_req, res) => {
    res.json({ service: 'wishlist-backend', status: 'ok' });
});

const requireAuthentication = async (req, res, next) => {
    const authorization = req.get('authorization') || '';
    const token = authorization.match(/^Bearer\s+(.+)$/i)?.[1];

    if (!token) {
        return res.status(401).json({ error: 'Authentication required' });
    }

    try {
        req.authUser = await admin.auth().verifyIdToken(token);
        next();
    } catch {
        res.status(401).json({ error: 'Invalid or expired authentication token' });
    }
};

app.post('/api/add-item', requireAuthentication, async (req, res) => {
    try {
        const { url, price, category, title } = req.body;
        const parsedPrice = Number(price);
        let parsedUrl;

        try {
            parsedUrl = new URL(url);
        } catch {
            return res.status(400).json({ error: 'A valid item URL is required' });
        }

        if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
            return res.status(400).json({ error: 'Item URL must use HTTP or HTTPS' });
        }

        if (!Number.isFinite(parsedPrice) || parsedPrice < 0) {
            return res.status(400).json({ error: 'A valid non-negative price is required' });
        }

        if (typeof category !== 'string' || !category.trim() || category.length > 40) {
            return res.status(400).json({ error: 'A category of 1 to 40 characters is required' });
        }

        if (typeof title !== 'string' || !title.trim() || title.length > 300) {
            return res.status(400).json({ error: 'A title of 1 to 300 characters is required' });
        }

        await db
            .collection('wishlists')
            .doc(req.authUser.uid)
            .collection('items')
            .add({
                url: parsedUrl.href,
                price: parsedPrice,
                category: category.trim(),
                title: title.trim(),
                dateAdded: new Date(),
            });

        res.json({ success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to save wishlist item' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));