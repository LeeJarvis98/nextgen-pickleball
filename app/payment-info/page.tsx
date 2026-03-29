import { Suspense } from 'react';
import PaymentInfoPage from './PaymentInfoPage';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import styles from './PaymentInfoPage.module.css';


export const metadata = {
  title: 'Thông Tin Chuyển Khoản — NextGen Pickleball',
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
    <Suspense fallback={<div className={styles.fallback} />}>
      <PaymentInfoPage paymentSettings={paymentSettings} />
    </Suspense>
  );
}
