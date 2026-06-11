import { createBrowserRouter, Outlet } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { ProtectedRoute } from './components/ProtectedRoute';

import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LogInPage';
import { RegisterPage } from './pages/RegisterPage';
import { SearchPage } from './pages/SearchPage';
import { TechnicianProfilePage } from './pages/TechnicianProfilePage';
import { PostsPage } from './pages/PostsPage';
import { PostDetailPage } from './pages/PostDetailPage';
import { CreatePostPage } from './pages/CreatePostPage';
import { EditPostPage } from './pages/EditPostPage';
import { DashboardPage } from './pages/DashboardPage';
import { ProfilePage } from './pages/ProfilePage';
import { MyProjectsPage } from './pages/MyProjectsPage';
import { NearbyMapPage } from './pages/NearbyMapPage';
import { NotFoundPage } from './pages/NotFoundPage';

import { AdminLayout } from './pages/admin/AdminLayout';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminAdsPage } from './pages/admin/AdminAdsPage';
import { AdminBoostsPage } from './pages/admin/AdminBoostsPage';

import { BoostPaymentPage } from './pages/BoostPaymentPage';
import { DonationPage } from './pages/DonationPage';
import { AdminLoginPage } from './pages/AdminLoginPage';
import { AdminDonationsPage } from './pages/admin/AdminDonationsPage';

function RootLayout() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'search', element: <SearchPage /> },
      { path: 'technician/:id', element: <TechnicianProfilePage /> },
      { path: 'posts', element: <PostsPage /> },
      { path: 'posts/:id', element: <PostDetailPage /> },

      {
      element: <ProtectedRoute />,
      children: [
        { path: 'dashboard', element: <DashboardPage /> },
        { path: 'user-dashboard', element: <DashboardPage /> },
        { path: 'professional-dashboard', element: <DashboardPage /> },
        { path: 'profile', element: <ProfilePage /> },
        { path: 'my-projects', element: <MyProjectsPage /> },
        { path: 'nearby', element: <NearbyMapPage /> },
        { path: 'posts/create', element: <CreatePostPage /> },
        { path: 'posts/:id/edit', element: <EditPostPage /> },
      ],
    },

      { path: '*', element: <NotFoundPage /> },
    ],
  },

  {
    path: '/admin',
    element: <AdminLayout />,
    children: [
      { index: true, element: <AdminDashboardPage /> },
      { path: 'ads', element: <AdminAdsPage /> },
      { path: 'boosts', element: <AdminBoostsPage /> },
      { path: 'donations', element: <AdminDonationsPage /> },
    ],
  },

  {
    path: '/boost-payment',
    element: <BoostPaymentPage />,
  },

  {
    path: '/donate',
    element: <DonationPage />,
  },

  {
    path: '/login',
    element: <LoginPage />,
  },

  {
    path: '/admin-login',
    element: <AdminLoginPage />,
  },

  {
  path: '/register',
  element: <RegisterPage />,
},
{
  path: '/register-user',
  element: <RegisterPage fixedRole="user" />,
},
{
  path: '/register-professional',
  element: <RegisterPage fixedRole="technician" />,
},
]);