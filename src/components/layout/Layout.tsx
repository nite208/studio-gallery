import type { JSX } from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';
import styles from './Layout.module.css';

export function Layout(): JSX.Element {
  return (
    <div className={styles.wrapper}>
      <Header />
      <main className={styles.main}>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
