import React, { useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { BottomNav } from '@/components/layout/BottomNav';
import { ToastContainer } from '@/components/shared/ToastContainer';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/button';

export default function App({ isSignupConfirmation = false }) {
  const { dataError, refreshData, loading, authLoading, session, isAdmin, adminRoleLoading } = useApp();
  const location = useLocation();
  const navigate = useNavigate();
  const isCandidateArea = location.pathname.startsWith('/candidat-dashboard');

  useEffect(() => {
    if (
      !isSignupConfirmation ||
      authLoading ||
      adminRoleLoading ||
      !session?.user.email_confirmed_at
    ) {
      return;
    }

    navigate(isAdmin ? '/admin' : '/candidat-dashboard', { replace: true });
  }, [adminRoleLoading, authLoading, isAdmin, isSignupConfirmation, navigate, session]);

  return (
    <div className={`min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between selection:bg-amber-400 selection:text-black ${isCandidateArea ? 'pb-0' : 'pb-[calc(4rem+env(safe-area-inset-bottom))] lg:pb-0'}`}>
      {!isCandidateArea && <Navbar />}
      {dataError && (
        <div role="alert" className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-red-50 border-b border-red-200 px-4 py-3 text-sm text-red-800">
          <span>{dataError}</span>
          <Button size="sm" className="text-black" variant="outline" disabled={loading} onClick={() => void refreshData()}>
            {loading ? 'Connexion…' : 'Réessayer'}
          </Button>
        </div>
      )}
      <main className="flex-1">
        <Outlet />
      </main>
      {!isCandidateArea && <Footer />}
      {!isCandidateArea && <BottomNav />}
      <ToastContainer />
    </div>
  );
}
