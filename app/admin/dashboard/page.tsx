import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { verifyAdminToken, COOKIE_NAME } from '@/lib/admin-auth';
import AdminDashboard from './AdminDashboard';

export const metadata = { title: 'Admin Dashboard | NextGen Pickleball' };

export default async function AdminDashboardPage() {
  const jar = await cookies();
  const token = jar.get(COOKIE_NAME)?.value;
  if (!token) redirect('/admin/login');
  try {
    await verifyAdminToken(token);
  } catch {
    redirect('/admin/login');
  }
  return <AdminDashboard />;
}