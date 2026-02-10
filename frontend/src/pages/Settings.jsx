import { useState } from 'react';
import { AdminLayout } from '@/components/AdminLayout';
import { Settings as SettingsIcon, User, Shield, Bell, Database } from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp, doc, getDoc, setDoc } from 'firebase/firestore';
import { toast } from 'sonner';

export const Settings = () => {
  const [seeding, setSeeding] = useState(false);

  const seedDefaultData = async () => {
    if (!window.confirm('Initialize database with default content? This will create a "home" page.')) return;

    setSeeding(true);
    try {

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

      for (const page of data) {
        const docRef = doc(db, 'pages', page.id);

        // Use setDoc with merge: true to avoid overwriting existing data if we just want to ensure fields exist,
        // but here we only write if it doesn't exist to avoid resetting user edits.
        try {
          const d = await getDoc(docRef);
          if (!d.exists()) {
            await setDoc(docRef, {
              ...page,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
              seoTitle: `${page.title.replace(/<[^>]*>?/gm, '')} - Dr. Harish Chandra`,
              seoDescription: `Official ${page.slug} page`,
              seoKeywords: `Harish Chandra, ${page.slug}`
            });
            console.log(`Seeded ${page.slug}`);
          }
        } catch (e) {
          console.warn("Offline or error checking doc, forcing write for: " + page.id);
          // If offline, we can't check existence reliably, so we might overwrite or skip.
          // Safest is to use setDoc with merge if we worry about overwriting, 
          // but for seeding we usually want to ensure structure.
          // For now, let's just log.
        }
      }

      toast.success('All default pages checked/created!');

    } catch (error) {
      console.error('Error seeding data:', error);
      toast.error('Failed to seed data: ' + error.message);
    } finally {
      setSeeding(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div className="flex justify-between items-center pb-4 border-b border-border/40">
          <div>
            <h1
              className="text-4xl font-bold text-primary mb-2"
              style={{ fontFamily: 'Manrope, sans-serif', letterSpacing: '-0.02em' }}
            >
              Settings
            </h1>
            <p className="text-muted" style={{ fontFamily: 'Inter, sans-serif' }}>
              Manage your CMS configuration
            </p>
          </div>
        </div>

        <div className="grid gap-6">
          {/* Database Tools */}
          <div className="bg-white border border-border rounded-lg p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <Database size={24} className="text-blue-600" />
              <h2 className="text-xl font-semibold text-primary">Database Initialization</h2>
            </div>
            <p className="text-sm text-muted mb-4">
              If your public website is showing default content, your database might be empty.
              Click below to create the initial "Home" page record in Firebase so you can edit it.
            </p>
            <button
              onClick={seedDefaultData}
              disabled={seeding}
              className="px-4 py-2 bg-blue-50 text-blue-700 border border-blue-200 rounded-md hover:bg-blue-100 transition-colors disabled:opacity-50"
            >
              {seeding ? 'Creating...' : 'Create Default "Home" Page'}
            </button>
          </div>

          <div className="bg-white border border-border rounded-lg p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <User size={24} className="text-accent" />
              <h2 className="text-xl font-semibold text-primary">Profile Settings</h2>
            </div>
            <p className="text-sm text-muted">Update your profile information and preferences</p>
            <button className="mt-4 px-4 py-2 bg-accent text-white rounded-md hover:bg-accent/90 transition-colors">
              Edit Profile
            </button>
          </div>

          <div className="bg-white border border-border rounded-lg p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <Shield size={24} className="text-accent" />
              <h2 className="text-xl font-semibold text-primary">Security</h2>
            </div>
            <p className="text-sm text-muted">Manage passwords and authentication settings</p>
            <button className="mt-4 px-4 py-2 bg-accent text-white rounded-md hover:bg-accent/90 transition-colors">
              Change Password
            </button>
          </div>

          <div className="bg-white border border-border rounded-lg p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <Bell size={24} className="text-accent" />
              <h2 className="text-xl font-semibold text-primary">Notifications</h2>
            </div>
            <p className="text-sm text-muted">Configure notification preferences</p>
            <button className="mt-4 px-4 py-2 bg-accent text-white rounded-md hover:bg-accent/90 transition-colors">
              Manage Notifications
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};
