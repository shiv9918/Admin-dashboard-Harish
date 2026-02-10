
const { initializeApp } = require("firebase/app");
const { getFirestore, collection, doc, setDoc, getDoc, serverTimestamp } = require("firebase/firestore");

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

console.log("Seeding pages for project:", firebaseConfig.projectId);

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const data = [
    {
        id: 'home',
        slug: 'home',
        title: 'Dr. Harish <br /> <span class="text-[#913c07]">Chandra</span>',
        content: `
  <p>
    <span class="font-semibold text-gray-800">Dr. Harish Chandra</span> is an accomplished academician serving as an Assistant Professor of Mathematics in the Department of Mathematics and Scientific Computing at Madan Mohan Malaviya University of Technology (MMMUT), Gorakhpur.
  </p>
  <p>
    With nearly two decades of experience in teaching, research, and academic administration, he has made significant contributions to higher education. He earned his Ph.D. in Mathematics from the University of Lucknow and is a UGC-NET qualified scholar (JRF & SRF).
  </p>
`,
        status: 'published'
    },
    {
        id: 'profile',
        slug: 'profile',
        title: 'Profile',
        content: '<p>Welcome to the Profile page.</p>',
        status: 'published'
    },
    {
        id: 'teaching',
        slug: 'teaching',
        title: 'Teaching',
        content: '<p>Information about courses taught.</p>',
        status: 'published'
    },
    {
        id: 'research',
        slug: 'research',
        title: 'Research',
        content: '<p>Details about research publications and interests.</p>',
        status: 'published'
    },
    {
        id: 'administration',
        slug: 'administration',
        title: 'Administration',
        content: '<p>Administrative roles and responsibilities.</p>',
        status: 'published'
    },
    {
        id: 'gallery',
        slug: 'gallery',
        title: 'Gallery',
        content: '<p>Photo gallery.</p>',
        status: 'published'
    },
    {
        id: 'contact',
        slug: 'contact',
        title: 'Contact',
        content: '<p>Contact information.</p>',
        status: 'published'
    }
];

async function seed() {
    for (const page of data) {
        const docRef = doc(db, 'pages', page.id);
        try {
            const d = await getDoc(docRef);
            if (!d.exists()) {
                console.log(`Creating page: ${page.slug}`);
                await setDoc(docRef, {
                    ...page,
                    createdAt: serverTimestamp(),
                    updatedAt: serverTimestamp(),
                    seoTitle: `${page.title.replace(/<[^>]*>?/gm, '')} - Dr. Harish Chandra`,
                    seoDescription: `Official ${page.slug} page`,
                    seoKeywords: `Harish Chandra, ${page.slug}`
                });
            } else {
                console.log(`Skipping existing page: ${page.slug}`);
            }
        } catch (e) {
            console.error(`Error processing ${page.slug}:`, e);
        }
    }
    console.log("Seeding complete.");
}

seed();
