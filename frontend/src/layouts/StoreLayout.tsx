import { Outlet } from 'react-router-dom';
import SEO from '../components/SEO';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';

export default function StoreLayout() {
  return (
    <div className="flex flex-col min-h-screen">
      <SEO />
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
