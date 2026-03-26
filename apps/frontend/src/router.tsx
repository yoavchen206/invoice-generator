import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';
import { Login } from '@/pages/Login';
import { Dashboard } from '@/pages/Dashboard';
import { InvoiceList } from '@/pages/InvoiceList';
import { InvoiceDetail } from '@/pages/InvoiceDetail';
import { InvoiceCreate } from '@/pages/InvoiceCreate';
import { InvoiceSuccess } from '@/pages/InvoiceSuccess';
import { ClientList } from '@/pages/ClientList';
import { ClientForm } from '@/pages/ClientForm';
import { Settings } from '@/pages/Settings';
import { AuthGuard } from '@/components/layout/AuthGuard';

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/',
    element: (
      <AuthGuard>
        <AppShell />
      </AuthGuard>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="/dashboard" replace />,
      },
      {
        path: 'dashboard',
        element: <Dashboard />,
      },
      {
        path: 'invoices',
        element: <InvoiceList />,
      },
      {
        path: 'invoices/create',
        element: <InvoiceCreate />,
      },
      {
        path: 'invoices/success',
        element: <InvoiceSuccess />,
      },
      {
        path: 'invoices/:invoiceId',
        element: <InvoiceDetail />,
      },
      {
        path: 'clients',
        element: <ClientList />,
      },
      {
        path: 'clients/new',
        element: <ClientForm />,
      },
      {
        path: 'clients/:clientId/edit',
        element: <ClientForm />,
      },
      {
        path: 'settings',
        element: <Settings />,
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/dashboard" replace />,
  },
]);
