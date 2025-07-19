import React from 'react';
import { Link } from 'react-router-dom';
import { Plus, Calendar, Eye, Zap, Shield, Users, ArrowRight, RefreshCw } from 'lucide-react';
import { CounterCard } from '../components/CounterCard';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { useCounters } from '../hooks/useCounters';
import { useNDK } from '../contexts/NDKContext';
import { calculateDaysDiff } from '../utils/date';

export const Home: React.FC = () => {
  const { isConnected, ndk } = useNDK();
  const { counters, loading, error, refetch } = useCounters(undefined, true); // Public counters only

  console.log('Home: Render state', { 
    isConnected, 
    ndkConnected: !!ndk, 
    countersCount: counters.length, 
    loading, 
    error 
  });

  // Sort counters by days (most recent/upcoming first) and take the first 6
  const featuredCounters = React.useMemo(() => {
    const sorted = [...counters].sort((a, b) => {
      const daysA = calculateDaysDiff(a.date, a.type);
      const daysB = calculateDaysDiff(b.date, b.type);
      return Math.abs(daysB) - Math.abs(daysA);
    });
    return sorted.slice(0, 6);
  }, [counters]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-600 to-purple-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Track Your Life Milestones
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100 max-w-3xl mx-auto">
              Count the days since your last achievement or until your next big event.
              Built on Nostr.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {isConnected ? (
                <Link
                  to="/dashboard"
                  className="inline-flex items-center gap-2 px-8 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
                >
                  <Plus className="w-5 h-5" />
                  Create Your First Counter
                </Link>
              ) : (
                <button
                  onClick={() => window.scrollTo({ top: 800, behavior: 'smooth' })}
                  className="inline-flex items-center gap-2 px-8 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
                >
                  <Calendar className="w-5 h-5" />
                  Get Started
                </button>
              )}
              <Link
                to="/browse"
                className="inline-flex items-center gap-2 px-8 py-3 border-2 border-white text-white rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors"
              >
                <Eye className="w-5 h-5" />
                Browse Public Counters
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why NostrCount?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Experience the future of personal tracking with decentralized technology
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Censorship Resistant
              </h3>
              <p className="text-gray-600">
                Your data is stored on the Nostr network, ensuring no single entity can control or delete your progress.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Social & Shareable
              </h3>
              <p className="text-gray-600">
                Share your milestones with friends and family. Get support from the community on your journey.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="w-8 h-8 text-yellow-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Lightning Zaps
              </h3>
              <p className="text-gray-600">
                Support others on their journey with Lightning Network tips. Every sat counts!
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Counters Section */}
      <div className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-12">
            <div className="text-center md:text-left">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Featured Counters
              </h2>
              <p className="text-xl text-gray-600">
                See what others are tracking and celebrating
              </p>
            </div>
            <div className="mt-4 md:mt-0 flex gap-2">
              <button
                onClick={refetch}
                disabled={loading}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 inline mr-1 ${loading ? 'animate-spin' : ''}`} />
                {loading ? 'Loading...' : 'Refetch'}
              </button>
              <Link
                to="/browse"
                className="inline-flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                View All Counters
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
          
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <LoadingSpinner size="lg" />
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <RefreshCw className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Error Loading Counters
              </h3>
              <p className="text-gray-600 mb-6">{error}</p>
              <button
                onClick={refetch}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : featuredCounters.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredCounters.map((counter) => (
                <Link
                  key={counter.id}
                  to={`/counter/${counter.slug}`}
                  className="block transform hover:scale-105 transition-transform"
                >
                  <CounterCard counter={counter} />
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No public counters yet
              </h3>
              <p className="text-gray-600 mb-6">
                Be the first to create and share a public counter!
              </p>
              {isConnected && (
                <Link
                  to="/dashboard"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Create First Counter
                </Link>
              )}
            </div>
          )}
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-blue-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Start Tracking?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join the decentralized movement. Track your progress, share your journey, 
            and celebrate your milestones with the world.
          </p>
          {isConnected ? (
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 px-8 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Create Your First Counter
            </Link>
          ) : (
            <p className="text-blue-100 mb-4">
              Connect your Nostr account to get started
            </p>
          )}
        </div>
      </div>
    </div>
  );
}; 