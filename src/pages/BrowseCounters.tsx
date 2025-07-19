import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Search, Calendar, Eye } from 'lucide-react';
import { CounterCard } from '../components/CounterCard';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { useCounters } from '../hooks/useCounters';
import { calculateDaysDiff } from '../utils/date';

export const BrowseCounters: React.FC = () => {
  const { counters, loading, error } = useCounters(undefined, true); // Public counters only
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'since' | 'until'>('all');

  // Filter and search counters
  const filteredCounters = useMemo(() => {
    let filtered = counters;

    // Filter by type
    if (filterType !== 'all') {
      filtered = filtered.filter(counter => counter.type === filterType);
    }

    // Filter by search term
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(counter =>
        counter.title.toLowerCase().includes(term) ||
        counter.date.includes(term)
      );
    }

    // Sort by days (most recent/upcoming first)
    filtered.sort((a, b) => {
      const daysA = calculateDaysDiff(a.date, a.type);
      const daysB = calculateDaysDiff(b.date, b.type);
      return Math.abs(daysB) - Math.abs(daysA);
    });

    return filtered;
  }, [counters, searchTerm, filterType]);

  const stats = useMemo(() => {
    const total = counters.length;
    const since = counters.filter(c => c.type === 'since').length;
    const until = counters.filter(c => c.type === 'until').length;
    return { total, since, until };
  }, [counters]);

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Error Loading Counters</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Browse Public Counters
              </h1>
              <p className="text-gray-600">
                Discover and celebrate milestones from around the Nostr network
              </p>
            </div>
            <div className="mt-4 md:mt-0">
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Calendar className="w-4 h-4" />
                Create Counter
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
              <div className="text-sm text-gray-600">Total Counters</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.since}</div>
              <div className="text-sm text-gray-600">Days Since</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.until}</div>
              <div className="text-sm text-gray-600">Days Until</div>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search counters by title or date..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Type Filter */}
            <div className="flex gap-2">
              <button
                onClick={() => setFilterType('all')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filterType === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilterType('since')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-1 ${
                  filterType === 'since'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Eye className="w-4 h-4" />
                Since
              </button>
              <button
                onClick={() => setFilterType('until')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-1 ${
                  filterType === 'until'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Calendar className="w-4 h-4" />
                Until
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Counters Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : filteredCounters.length > 0 ? (
          <>
            <div className="mb-6">
              <p className="text-gray-600">
                Showing {filteredCounters.length} of {counters.length} counters
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredCounters.map((counter) => (
                <Link
                  key={counter.id}
                  to={`/counter/${counter.slug}`}
                  className="block transform hover:scale-105 transition-transform"
                >
                  <CounterCard counter={counter} />
                </Link>
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {searchTerm || filterType !== 'all' ? 'No counters found' : 'No public counters yet'}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || filterType !== 'all'
                ? 'Try adjusting your search terms or filters'
                : 'Be the first to create and share a public counter!'}
            </p>
            {!searchTerm && filterType === 'all' && (
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Calendar className="w-4 h-4" />
                Create First Counter
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}; 