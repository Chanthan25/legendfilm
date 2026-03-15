/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import BackToTop from './components/BackToTop';
import Home from './pages/Home';
import DramaDetails from './pages/DramaDetails';
import Review from './pages/Review';
import Categories from './pages/Categories';
import Search from './pages/Search';
import Disclaimer from './pages/Disclaimer';
import Profile from './pages/Profile';
import Auth from './pages/Auth';
import Create from './pages/Create';
import Notifications from './pages/Notifications';
import { AuthProvider } from './lib/AuthContext';

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-zinc-950 text-zinc-50 font-sans flex flex-col">
          <Navbar />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/drama/:id" element={<DramaDetails />} />
              <Route path="/review/:id" element={<Review />} />
              <Route path="/categories" element={<Categories />} />
              <Route path="/search" element={<Search />} />
              <Route path="/create" element={<Create />} />
              <Route path="/disclaimer" element={<Disclaimer />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/profile/:id" element={<Profile />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/notifications" element={<Notifications />} />
            </Routes>
          </main>
          <Footer />
          <BackToTop />
        </div>
      </Router>
    </AuthProvider>
  );
}
