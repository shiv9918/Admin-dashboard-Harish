import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/AdminLayout';
import { collection, query, orderBy, limit, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { FileText, Image as ImageIcon, Activity, TrendingUp, Users, Eye } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export const Dashboard = () => {
  const [stats, setStats] = useState({
    totalPages: 0,
    publishedPages: 0,
    draftPages: 0,
    totalMedia: 0,
    recentActivity: [],
  });
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const pagesSnapshot = await getDocs(collection(db, 'pages'));
      const pages = pagesSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      
      const mediaSnapshot = await getDocs(collection(db, 'media'));
      
      const activityQuery = query(
        collection(db, 'activity_logs'),
        orderBy('timestamp', 'desc'),
        limit(5)
      );
      const activitySnapshot = await getDocs(activityQuery);
      const activities = activitySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setStats({
        totalPages: pages.length,
        publishedPages: pages.filter((p) => p.status === 'published').length,
        draftPages: pages.filter((p) => p.status === 'draft').length,
        totalMedia: mediaSnapshot.size,
        recentActivity: activities,
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      icon: FileText,
      label: 'Total Pages',
      value: stats.totalPages,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      icon: Eye,
      label: 'Published',
      value: stats.publishedPages,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      icon: FileText,
      label: 'Drafts',
      value: stats.draftPages,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
    },
    {
      icon: ImageIcon,
      label: 'Media Files',
      value: stats.totalMedia,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
  ];

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div className="flex justify-between items-center pb-4 border-b border-border/40">
          <div>
            <h1
              className="text-4xl font-bold text-primary mb-2"
              style={{ fontFamily: 'Manrope, sans-serif', letterSpacing: '-0.02em' }}
            >
              Dashboard
            </h1>
            <p className="text-muted" style={{ fontFamily: 'Inter, sans-serif' }}>
              Welcome back, {user?.email?.split('@')[0]}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((card, index) => {
            const Icon = card.icon;
            return (
              <div
                key={index}
                data-testid={`stat-card-${card.label.toLowerCase().replace(' ', '-')}`}
                className="bg-white border border-border rounded-lg p-6 shadow-sm hover:shadow-md transition-all duration-200 transform hover:-translate-y-0.5"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-lg ${card.bgColor}`}>
                    <Icon className={card.color} size={24} strokeWidth={1.5} />
                  </div>
                </div>
                <div>
                  <p className="text-3xl font-bold text-primary mb-1">{card.value}</p>
                  <p className="text-sm text-muted" style={{ fontFamily: 'Inter, sans-serif' }}>
                    {card.label}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white border border-border rounded-lg p-6 shadow-sm">
            <h2
              className="text-xl font-semibold text-primary mb-6"
              style={{ fontFamily: 'Manrope, sans-serif' }}
            >
              Recent Activity
            </h2>
            <div className="space-y-4">
              {stats.recentActivity.length > 0 ? (
                stats.recentActivity.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-start gap-3 p-3 rounded-lg hover:bg-surface transition-colors"
                  >
                    <div className="p-2 rounded-full bg-accent/10">
                      <Activity size={16} className="text-accent" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-primary font-medium">{activity.action}</p>
                      <p className="text-xs text-muted mt-1">
                        {new Date(activity.timestamp?.toDate?.() || activity.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted text-center py-8">No recent activity</p>
              )}
            </div>
          </div>

          <div className="bg-white border border-border rounded-lg p-6 shadow-sm">
            <h2
              className="text-xl font-semibold text-primary mb-6"
              style={{ fontFamily: 'Manrope, sans-serif' }}
            >
              Quick Actions
            </h2>
            <div className="space-y-3">
              <a
                href="/admin/pages/new"
                data-testid="quick-action-new-page"
                className="block p-4 border border-border rounded-lg hover:border-accent hover:bg-accent/5 transition-all"
              >
                <div className="flex items-center gap-3">
                  <FileText size={20} className="text-accent" />
                  <div>
                    <p className="font-medium text-primary">Create New Page</p>
                    <p className="text-xs text-muted">Start writing content</p>
                  </div>
                </div>
              </a>
              <a
                href="/admin/media"
                data-testid="quick-action-upload-media"
                className="block p-4 border border-border rounded-lg hover:border-accent hover:bg-accent/5 transition-all"
              >
                <div className="flex items-center gap-3">
                  <ImageIcon size={20} className="text-accent" />
                  <div>
                    <p className="font-medium text-primary">Upload Media</p>
                    <p className="text-xs text-muted">Add images and files</p>
                  </div>
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};
