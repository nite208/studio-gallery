import type { JSX } from 'react';
import { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { PhotoCountContext } from './lib/photoCountContext';
import { Layout } from './components/layout/Layout';
import { HomePage } from './pages/HomePage';
import { AdminPage } from './pages/AdminPage';
import { NotFoundPage } from './pages/NotFoundPage';

export function App(): JSX.Element {
  const [photoCount, setPhotoCount] = useState<number>(0);

  return (
    <PhotoCountContext.Provider value={{ count: photoCount, setCount: setPhotoCount }}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="admin" element={<AdminPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </PhotoCountContext.Provider>
  );
}
