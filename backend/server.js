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

app.post('/api/add-item', async (req, res) => {
    try {
        const { url, price, category, title, userId } = req.body;

        if (!userId) {
            return res.status(400).json({ error: 'userId required' });
        }

        await db
            .collection('wishlists')
            .doc(userId)
            .collection('items')
            .add({
                url,
                price: parseFloat(price) || 0,
                category,
                title,
                dateAdded: new Date(),
            });

        res.json({ success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));