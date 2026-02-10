const { initializeApp } = require("firebase/app");
const { getFirestore, doc, getDoc } = require("firebase/firestore");
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

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function check() {
    for (const id of ['home', 'gallery', 'profile', 'teaching', 'research', 'contact']) {
        const d = await getDoc(doc(db, 'pages', id));
        if (d.exists()) {
            console.log(`--- ${id} ---`);
            console.log(JSON.stringify(d.data(), null, 2));
        } else {
            console.log(`--- ${id} NOT FOUND ---`);
        }
    }
}

check();
