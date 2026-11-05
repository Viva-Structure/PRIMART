import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { ToastContainer } from '@/components/shared/ToastContainer';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/button';

export default function App() {
  const { dataError, refreshData, loading } = useApp();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between selection:bg-amber-400 selection:text-black">
      <Navbar />
      {dataError && (
        <div role="alert" className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-red-50 border-b border-red-200 px-4 py-3 text-sm text-red-800">
          <span>{dataError}</span>
          <Button size="sm" variant="outline" disabled={loading} onClick={() => void refreshData()}>
            {loading ? 'Connexion…' : 'Réessayer'}
          </Button>
        </div>
      )}
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <ToastContainer />
    </div>
  );
}
