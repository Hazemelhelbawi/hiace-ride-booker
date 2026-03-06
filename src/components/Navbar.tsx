import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { LogOut, User, Loader2, Menu } from 'lucide-react';
import logo from '@/assets/logo.png';

const Navbar: React.FC = () => {
  const { user, logout, isAuthenticated, isLoading } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    setMobileOpen(false);
    await logout();
    navigate('/auth');
  };

  const isActive = (path: string) => location.pathname === path;

  const navLinks = (
    <>
      <Link
        to="/"
        onClick={() => setMobileOpen(false)}
        className={`text-sm font-medium transition-colors hover:text-primary ${
          isActive('/') ? 'text-primary' : 'text-foreground'
        }`}
      >
        {t('nav.home')}
      </Link>
      {!user?.isAdmin && (
        <>
          <Link
            to="/destinations"
            onClick={() => setMobileOpen(false)}
            className={`text-sm font-medium transition-colors hover:text-primary ${
              isActive('/destinations') ? 'text-primary' : 'text-foreground'
            }`}
          >
            {t('nav.destinations')}
          </Link>
          <Link
            to="/about"
            onClick={() => setMobileOpen(false)}
            className={`text-sm font-medium transition-colors hover:text-primary ${
              isActive('/about') ? 'text-primary' : 'text-foreground'
            }`}
          >
            {t('nav.about')}
          </Link>
        </>
      )}
      {user?.isAdmin && (
        <Link
          to="/admin"
          onClick={() => setMobileOpen(false)}
          className={`text-sm font-medium transition-colors hover:text-primary ${
            isActive('/admin') ? 'text-primary' : 'text-foreground'
          }`}
        >
          {t('nav.dashboard')}
        </Link>
      )}
    </>
  );

  return (
    <nav className="sticky top-0 z-50 bg-card border-b border-border backdrop-blur-sm bg-card/95 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 hover:opacity-90 transition-all flex-shrink-0">
            <img src={logo} alt="Everyday Bus" className="h-10 md:h-12 w-auto" />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks}
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2 md:gap-4">
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
                  className="hidden md:flex gap-2 border-2 hover:border-primary hover:text-primary"
                >
                  <LogOut className="w-4 h-4" />
                  <span>{t('nav.logout')}</span>
                </Button>
              </>
            ) : (
              <Button
                onClick={() => navigate('/auth')}
                className="hidden md:flex bg-primary hover:bg-primary-dark text-white font-semibold px-6"
              >
                {t('nav.login')}
              </Button>
            )}

            {/* Mobile Burger Menu */}
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="w-6 h-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-72 pt-12">
                <div className="flex flex-col gap-6">
                  {/* Mobile Nav Links */}
                  <div className="flex flex-col gap-4">
                    {navLinks}
                  </div>

                  <div className="border-t border-border pt-4 flex flex-col gap-3">
                    {isLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin text-muted-foreground mx-auto" />
                    ) : isAuthenticated ? (
                      <>
                        <Button
                          variant="ghost"
                          onClick={() => { navigate('/profile'); setMobileOpen(false); }}
                          className="justify-start gap-2"
                        >
                          <User className="w-4 h-4" />
                          {user?.name}
                        </Button>
                        <Button
                          variant="outline"
                          onClick={handleLogout}
                          className="justify-start gap-2"
                        >
                          <LogOut className="w-4 h-4" />
                          {t('nav.logout')}
                        </Button>
                      </>
                    ) : (
                      <Button
                        onClick={() => { navigate('/auth'); setMobileOpen(false); }}
                        className="bg-primary hover:bg-primary-dark text-white font-semibold"
                      >
                        {t('nav.login')}
                      </Button>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
