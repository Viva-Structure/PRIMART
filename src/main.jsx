import { StrictMode, lazy, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { ToastContainer } from './components/shared/ToastContainer';

const App = lazy(() => import('./App.jsx'));
const Home = lazy(() => import('./views/Home.jsx'));
const CandidatesPage = lazy(() => import('./views/CandidatesPage.jsx'));
const CandidateDetailPage = lazy(() => import('./views/CandidateDetailPage.jsx'));
const CategoriesPage = lazy(() => import('./views/CategoriesPage.jsx'));
const LeaderboardPage = lazy(() => import('./views/LeaderboardPage.jsx'));
const LiveBroadcastPage = lazy(() => import('./views/LiveBroadcastPage.jsx'));
const ResultsPage = lazy(() => import('./views/ResultsPage.jsx'));
const Register = lazy(() => import('./views/register.jsx'));
const CandidateDashboard = lazy(() => import('./views/CandidateDashboard.jsx'));
const AccountAccess = lazy(() => import('./views/AccountAccess.jsx'));
const AdminOverview = lazy(() => import('./views/admin/AdminOverview.jsx'));
const AdminModeration = lazy(() => import('./views/admin/AdminModeration.jsx'));
const AdminVotes = lazy(() => import('./views/admin/AdminVotes.jsx'));
const AdminPayments = lazy(() => import('./views/admin/AdminPayments.jsx'));
const AdminSettings = lazy(() => import('./views/admin/AdminSettings.jsx'));
const AdminCategories = lazy(() => import('./views/admin/AdminCategories.jsx'));

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: 'candidats',
        element: <CandidatesPage />,
      },
      {
        path: 'candidat/:id',
        element: <CandidateDetailPage />,
      },
      {
        path: 'categories',
        element: <CategoriesPage />,
      },
      {
        path: 'classement',
        element: <LeaderboardPage />,
      },
      {
        path: 'resultats',
        element: <ResultsPage />,
      },
      {
        path: 'candidater',
        element: <Register />,
      },
      {
        path: 'connexion',
        element: <AccountAccess />,
      },
      {
        path: 'register',
        element: <Register />,
      },
      {
        path: 'candidat-dashboard',
        element: <CandidateDashboard />,
      },
    ],
  },
  // Broadcast TV mode (standalone fullscreen, no navbar/footer)
  {
    path: '/direct-tv',
    element: (
      <>
        <LiveBroadcastPage />
        <ToastContainer />
      </>
    ),
  },
  // Admin space routes
  {
    path: '/admin',
    element: (
      <>
        <AdminOverview />
        <ToastContainer />
      </>
    ),
  },
  {
    path: '/admin/moderation',
    element: (
      <>
        <AdminModeration />
        <ToastContainer />
      </>
    ),
  },
  {
    path: '/admin/votes',
    element: (
      <>
        <AdminVotes />
        <ToastContainer />
      </>
    ),
  },
  {
    path: '/admin/paiements',
    element: (
      <>
        <AdminPayments />
        <ToastContainer />
      </>
    ),
  },
  {
    path: '/admin/parametres',
    element: (
      <>
        <AdminSettings />
        <ToastContainer />
      </>
    ),
  },
  {
    path: '/admin/categories',
    element: (
      <>
        <AdminCategories />
        <ToastContainer />
      </>
    ),
  },
]);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AppProvider>
      <Suspense fallback={<div role="status" className="mx-auto flex min-h-64 max-w-7xl items-center justify-center px-4 text-sm font-medium text-slate-700">Chargement de la page…</div>}>
        <RouterProvider router={router} />
      </Suspense>
    </AppProvider>
  </StrictMode>
);
