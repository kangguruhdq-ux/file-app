import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { NotificationProvider } from './context/NotificationContext';
import MobileFrame from './components/MobileFrame';
import BottomNavigation from './components/BottomNavigation';
import SplashScreen from './pages/SplashScreen';
import OnboardingScreen from './pages/OnboardingScreen';
import LoginScreen from './pages/LoginScreen';
import HomeScreen from './pages/HomeScreen';
import TransferScreen from './pages/TransferScreen';
import FilesScreen from './pages/FilesScreen';
import ProfileScreen from './pages/ProfileScreen';
import PricingScreen from './pages/PricingScreen';
import ShareLinkView from './pages/ShareLinkView';
import CustomerServiceScreen from './pages/CustomerServiceScreen';
import MobileAdminApp from './pages/admin/MobileAdminApp';

function MainApp() {
  const { user, loading } = useAuth();
  const { isDark } = useTheme();

  // Navigation states
  const [showSplash, setShowSplash] = useState(true);
  const [showAuth, setShowAuth] = useState(false);
  const [activeTab, setActiveTab] = useState('home'); // 'home' | 'files' | 'transfer' | 'account' | 'pricing' | 'cs' | 'admin'

  // Global tab navigation listener
  useEffect(() => {
    const handleNavigate = (e) => {
      if (e.detail?.tab) {
        setActiveTab(e.detail.tab);
      }
    };
    window.addEventListener('app:navigate-tab', handleNavigate);
    return () => window.removeEventListener('app:navigate-tab', handleNavigate);
  }, []);

  // Check URL for public share link: /share/:token
  const pathname = window.location.pathname;
  const isShareLink = pathname.startsWith('/share/');
  const shareToken = isShareLink ? pathname.split('/share/')[1] : null;

  if (isShareLink && shareToken) {
    return (
      <ShareLinkView
        token={shareToken}
        onBackToApp={() => {
          window.history.pushState({}, '', '/');
          window.location.reload();
        }}
      />
    );
  }

  if (showSplash) {
    return (
      <MobileFrame>
        <SplashScreen onFinish={() => setShowSplash(false)} />
      </MobileFrame>
    );
  }

  // Not logged in and not guest
  if (!user && !loading) {
    if (showAuth) {
      return (
        <MobileFrame>
          <LoginScreen onBackToOnboarding={() => setShowAuth(false)} />
        </MobileFrame>
      );
    }
    return (
      <MobileFrame>
        <OnboardingScreen
          onGetStarted={() => setShowAuth(true)}
          onLoginClick={() => setShowAuth(true)}
        />
      </MobileFrame>
    );
  }

  // Pure Mobile Admin Panel View
  if (activeTab === 'admin' && user?.role === 'admin') {
    return (
      <MobileFrame>
        <MobileAdminApp onCloseAdmin={() => setActiveTab('account')} />
      </MobileFrame>
    );
  }

  const hideBottomNav = activeTab === 'pricing' || activeTab === 'cs' || activeTab === 'admin';

  return (
    <SocketProvider user={user}>
      <MobileFrame>
        <div className={`flex-1 flex flex-col overflow-hidden ${isDark ? 'dark' : ''}`}>
          {/* Active Mobile Screen */}
          <div className="flex-1 flex flex-col overflow-y-auto">
            {activeTab === 'home' && (
              <HomeScreen
                onNavigateTab={(tab) => setActiveTab(tab)}
                onOpenCS={() => setActiveTab('cs')}
              />
            )}
            {activeTab === 'files' && <FilesScreen />}
            {activeTab === 'transfer' && <TransferScreen />}
            {activeTab === 'account' && (
              <ProfileScreen
                onNavigatePricing={() => setActiveTab('pricing')}
                onOpenAdmin={() => setActiveTab('admin')}
                onOpenCS={() => setActiveTab('cs')}
              />
            )}
            {activeTab === 'pricing' && (
              <PricingScreen onBack={() => setActiveTab('home')} />
            )}
            {activeTab === 'cs' && (
              <CustomerServiceScreen onBack={() => setActiveTab('home')} />
            )}
          </div>

          {/* Mobile Bottom Navigation Bar */}
          {!hideBottomNav && (
            <BottomNavigation
              activeTab={activeTab}
              setActiveTab={setActiveTab}
            />
          )}
        </div>
      </MobileFrame>
    </SocketProvider>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <NotificationProvider>
          <AuthProvider>
            <MainApp />
          </AuthProvider>
        </NotificationProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
