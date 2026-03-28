import { Suspense } from 'react';
import StatusResultsPage from './StatusResultsPage';
import styles from './page.module.css';

export const metadata = {
  title: 'Tra cứu đăng ký — NextGen Pickleball',
};

export default function Page() {
  return (
    <Suspense fallback={<div className={styles.fallback} />}>
      <StatusResultsPage />
    </Suspense>
  );
}