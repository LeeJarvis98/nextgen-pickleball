import { Suspense } from 'react';
import CheckoutPage from './CheckoutPage';
import { createServerSupabaseClient } from '@/lib/supabase-server';

export const metadata = {
  title: 'Xac nhan dang ky — NextGen Pickleball',
};

const DEFAULT_PAYMENT_SETTINGS = {
  bank_name: 'TP Bank',
  bank_account: '6598 8393 979',
  account_holder: 'LE GIA VY',
  qr_url: '/QR.png',
};

async function fetchPaymentSettings() {
  try {
    const supabase = createServerSupabaseClient();
    const { data } = await supabase.from('site_settings').select('key, value');
    if (!data) return DEFAULT_PAYMENT_SETTINGS;
    const map: Record<string, string> = {};
    for (const row of data) map[row.key] = row.value;
    return { ...DEFAULT_PAYMENT_SETTINGS, ...map };
  } catch {
    return DEFAULT_PAYMENT_SETTINGS;
  }
}

export default async function Page() {
  const paymentSettings = await fetchPaymentSettings();
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', backgroundColor: '#0e0e0e' }} />}>
      <CheckoutPage paymentSettings={paymentSettings} />
    </Suspense>
  );
}