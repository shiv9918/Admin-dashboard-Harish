import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Lock, Mail } from 'lucide-react';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/admin/dashboard', { replace: true });
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }
    setLoading(true);

    try {
      await login(email, password);
      toast.success('Login successful!');
      // Do NOT set loading to false here, as we want to transition to redirect
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Invalid email or password');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1656991955761-8b1a8eb24049?crop=entropy&cs=srgb&fm=jpg&q=85)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm"></div>
      </div>

      <div className="relative z-10 w-full max-w-md px-6">
        <div className="bg-white border border-border rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <h1
              className="text-3xl font-bold text-primary mb-2"
              style={{ fontFamily: 'Manrope, sans-serif', letterSpacing: '-0.02em' }}
            >
              Content Hub
            </h1>
            <p className="text-muted" style={{ fontFamily: 'Inter, sans-serif' }}>
              Sign in to manage your content
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-primary mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={18} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  data-testid="login-email-input"
                  className="w-full pl-10 pr-4 py-2.5 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all"
                  placeholder="admin@example.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-primary mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={18} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  data-testid="login-password-input"
                  className="w-full pl-10 pr-4 py-2.5 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              data-testid="login-submit-button"
              className="w-full bg-primary text-primary-foreground py-3 rounded-md font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-md"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 p-4 bg-secondary/50 rounded-md">
            <p className="text-xs text-muted text-center">
              Demo: admin@example.com / password123
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
