const admin = require('firebase-admin');
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

// Handle private key formatting
let privateKey = process.env.FIREBASE_PRIVATE_KEY;
if (privateKey && privateKey.startsWith('"')) {
    privateKey = JSON.parse(privateKey);
}

try {
    admin.initializeApp({
        projectId: process.env.FIREBASE_PROJECT_ID,
        privateKey: privateKey,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    });
    console.log('Firebase initialized successfully');
} catch (error) {
    console.error('Firebase initialization error:', error);
    process.exit(1);
}

const db = admin.firestore();

// Extension POSTs to this endpoint
app.post('/api/add-item', async (req, res) => {
    try {
        const { url, price, category, title, userId } = req.body;

        if (!userId) {
            return res.status(400).json({ error: 'userId required' });
        }

        // Write to Firestore
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