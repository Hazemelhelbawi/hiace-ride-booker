import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { LogOut, User, Loader2, Bus } from 'lucide-react';

const Navbar: React.FC = () => {
  const { user, logout, isAuthenticated, isLoading } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/auth');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 bg-card border-b border-border backdrop-blur-sm bg-card/95 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 hover:opacity-90 transition-all group">
            <div className="relative flex items-center gap-1">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
                <Bus className="w-5 h-5 text-white" />
              </div>
              <div className="text-2xl font-black tracking-tight">
                <span className="text-foreground">Book</span>
                <span className="text-primary">Bus</span>
              </div>
            </div>
          </Link>

          {/* Center Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <Link 
              to="/" 
              className={`text-sm font-medium transition-colors hover:text-primary ${
                isActive('/') ? 'text-primary' : 'text-foreground'
              }`}
            >
              {t('nav.home')}
            </Link>
            {!user?.isAdmin && (
              <>
                <Link 
                  to="/#routes" 
                  className="text-sm font-medium transition-colors hover:text-primary text-foreground"
                >
                  {t('nav.destinations')}
                </Link>
                <Link 
                  to="/#about" 
                  className="text-sm font-medium transition-colors hover:text-primary text-foreground"
                >
                  {t('nav.about')}
                </Link>
              </>
            )}
            {user?.isAdmin && (
              <Link 
                to="/admin" 
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  isActive('/admin') ? 'text-primary' : 'text-foreground'
                }`}
              >
                {t('nav.dashboard')}
              </Link>
            )}
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-4">
            <LanguageSwitcher />
            
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
            ) : isAuthenticated ? (
              <>
                <Button
                  variant="ghost"
                  onClick={() => navigate('/profile')}
                  className="hidden md:flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary hover:bg-secondary/80"
                >
                  <User className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-foreground">{user?.name}</span>
                </Button>
                <Button 
                  variant="outline" 
                  onClick={handleLogout} 
                  className="gap-2 border-2 hover:border-primary hover:text-primary"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden md:inline">{t('nav.logout')}</span>
                </Button>
              </>
            ) : (
              <Button
                onClick={() => navigate('/auth')}
                className="bg-primary hover:bg-primary-dark text-white font-semibold px-6"
              >
                {t('nav.login')}
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
