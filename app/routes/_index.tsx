import { json, type MetaFunction } from '@remix-run/cloudflare';
import { ClientOnly } from 'remix-utils/client-only';
import { BaseChat } from '~/components/chat/BaseChat';
import { Chat } from '~/components/chat/Chat.client';
import { Header } from '~/components/header/Header';
import BackgroundRays from '~/components/ui/BackgroundRays';
import AuthModal from '~/components/auth/AuthModal';
import { useState, useEffect } from 'react';
import type { User } from '~/lib/services/userService';

export const meta: MetaFunction = () => {
  return [{ title: 'Boongle AI' }, { name: 'description', content: 'Build fullstack web apps in seconds.' }];
};

export const loader = () => json({});

/**
 * Landing page component for Bolt
 * Note: Settings functionality should ONLY be accessed through the sidebar menu.
 * Do not add settings button/panel to this landing page as it was intentionally removed
 * to keep the UI clean and consistent with the design system.
 */
export default function Index() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Check for existing user session on component mount
  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setCurrentUser(user);
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('currentUser');
      }
    } else {
      // Show auth modal if no user is logged in
      setShowAuthModal(true);
    }
  }, []);

  const handleAuthSuccess = (user: User) => {
    setCurrentUser(user);
    setShowAuthModal(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    setCurrentUser(null);
    setShowAuthModal(true);
  };

  // Show loading state while checking authentication
  if (currentUser === null && !showAuthModal) {
    return (
      <div className="flex flex-col h-full w-full bg-bolt-elements-background-depth-1">
        <BackgroundRays />
        <div className="flex items-center justify-center h-full">
          <div className="text-white text-lg">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full w-full bg-bolt-elements-background-depth-1">
      <BackgroundRays />
      <Header onLogout={handleLogout} currentUser={currentUser} />
      {currentUser ? (
        <ClientOnly fallback={<div className="flex items-center justify-center h-full"><div className="text-white text-lg">Loading chat...</div></div>}>{() => <Chat />}</ClientOnly>
      ) : (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-white mb-4">Welcome to Bolt AI</h1>
            <p className="text-gray-400 mb-8">Please sign in to continue</p>
            <button
              onClick={() => setShowAuthModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              Sign In
            </button>
          </div>
        </div>
      )}
      
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onAuthSuccess={handleAuthSuccess}
      />
    </div>
  );
}
