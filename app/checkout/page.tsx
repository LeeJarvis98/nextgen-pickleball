import { Suspense } from 'react';
import CheckoutPage from './CheckoutPage';

export const metadata = {
  title: 'Xac nhan dang ky — NextGen Pickleball',
};

export default function Page() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', backgroundColor: '#0e0e0e' }} />}>
      <CheckoutPage />
    </Suspense>
  );
}