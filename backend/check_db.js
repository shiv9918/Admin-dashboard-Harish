
const { initializeApp } = require("firebase/app");
const { getFirestore, collection, getDocs, query, where, doc, getDoc } = require("firebase/firestore");

// Manually load .env since we're running plain node
require('dotenv').config({ path: '../frontend/.env' });

const firebaseConfig = {
    apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
    authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
    storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.REACT_APP_FIREBASE_APP_ID,
    measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID
};

console.log("Using PID:", firebaseConfig.projectId);

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function check() {
    console.log("--- Checking Document ID: home ---");
    const d = await getDoc(doc(db, 'pages', 'home'));
    if (d.exists()) {
        console.log("FOUND BY ID 'home':", JSON.stringify(d.data(), null, 2));
    } else {
        console.log("NOT FOUND BY ID 'home'");
    }

    console.log("\n--- Checking Query slug: home ---");
    const q = query(collection(db, 'pages'), where('slug', '==', 'home'));
    const snap = await getDocs(q);
    if (!snap.empty) {
        snap.forEach(doc => {
            console.log(`FOUND BY SLUG query (ID: ${doc.id}):`, JSON.stringify(doc.data(), null, 2));
        });
    } else {
        console.log("NOT FOUND BY SLUG query");
    }
}

check();
