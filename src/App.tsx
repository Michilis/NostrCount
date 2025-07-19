
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { NDKProvider } from './contexts/NDKContext';
import { Header } from './components/Header';
import { Home } from './pages/Home';
import { Dashboard } from './pages/Dashboard';
import { CounterDetail } from './pages/CounterDetail';
import { BrowseCounters } from './pages/BrowseCounters';
import { Test } from './pages/Test';
import './index.css';

function App() {
  return (
    <NDKProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Header />
          <main>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/counter/:slug" element={<CounterDetail />} />
              <Route path="/browse" element={<BrowseCounters />} />
              <Route path="/test" element={<Test />} />
            </Routes>
          </main>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
            }}
          />
        </div>
      </Router>
    </NDKProvider>
  );
}

export default App; 