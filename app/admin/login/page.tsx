import { Suspense } from 'react';
import AdminLoginForm from './AdminLoginForm';

export const metadata = { title: 'Admin Login NextGen Pickleball' };

export default function AdminLoginPage() {
  return (
    <Suspense>
      <AdminLoginForm />
    </Suspense>
  );
}
