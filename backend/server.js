const admin = require('firebase-admin');
console.log('Firebase admin imported');

const express = require('express');
const cors = require('cors');
require('dotenv').config();

console.log('About to initialize Firebase');
console.log('PROJECT_ID:', process.env.FIREBASE_PROJECT_ID);

try {
    admin.initializeApp({
        projectId: process.env.FIREBASE_PROJECT_ID,
        privateKey: process.env.FIREBASE_PRIVATE_KEY,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    });
    console.log('Firebase initialized');
} catch (e) {
    console.error('Init error:', e.message);
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