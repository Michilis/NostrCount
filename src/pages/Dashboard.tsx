import React, { useState } from 'react';
import { Plus, Search } from 'lucide-react';
import { CounterCard } from '../components/CounterCard';
import { CounterFormModal } from '../components/CounterFormModal';
import { EditCounterModal } from '../components/EditCounterModal';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { useCounters } from '../hooks/useCounters';
import { useCreateCounter, useDeleteCounter } from '../hooks/useCounters';
import { useNDK } from '../contexts/NDKContext';
import type { Counter, CounterFormData } from '../types';
import toast from 'react-hot-toast';

export const Dashboard: React.FC = () => {
  const { user, isConnected } = useNDK();
  const { counters, loading, refetch } = useCounters(user?.pubkey);
  const { createCounter, loading: creating } = useCreateCounter();
  const { deleteCounter } = useDeleteCounter();
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingCounter, setEditingCounter] = useState<Counter | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'since' | 'until'>('all');
  const [filterVisibility, setFilterVisibility] = useState<'all' | 'public' | 'private'>('all');

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Please log in to access your dashboard
          </h1>
          <p className="text-gray-600">
            Connect your Nostr account to create and manage your counters.
          </p>
        </div>
      </div>
    );
  }

  const filteredCounters = counters.filter(counter => {
    const matchesSearch = counter.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || counter.type === filterType;
    const matchesVisibility = filterVisibility === 'all' || counter.visibility === filterVisibility;
    
    return matchesSearch && matchesType && matchesVisibility;
  });

  const handleCreateCounter = async (formData: CounterFormData) => {
    try {
      await createCounter(formData);
      toast.success('Counter created successfully!');
      refetch();
    } catch (error) {
      toast.error('Failed to create counter. Please try again.');
    }
  };

  const handleDeleteCounter = async (slug: string) => {
    if (!window.confirm('Are you sure you want to delete this counter?')) {
      return;
    }

    try {
      await deleteCounter(slug);
      toast.success('Counter deleted successfully!');
      refetch();
    } catch (error) {
      toast.error('Failed to delete counter. Please try again.');
    }
  };

  const handleShareCounter = (counter: Counter) => {
    const url = `${window.location.origin}/counter/${counter.slug}`;
    navigator.clipboard.writeText(url);
    toast.success('Counter link copied to clipboard!');
  };

  const handleEditCounter = (counter: Counter) => {
    setEditingCounter(counter);
    setShowEditModal(true);
  };

  const handleUpdateCounter = () => {
    // The counter list will be refreshed automatically via refetch
    refetch();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              My Counters
            </h1>
            <p className="text-gray-600">
              Track your progress and celebrate your milestones
            </p>
          </div>
          
          <button
            onClick={() => setShowCreateModal(true)}
            className="mt-4 md:mt-0 inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Create Counter
          </button>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search counters..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Types</option>
                <option value="since">Days Since</option>
                <option value="until">Days Until</option>
              </select>
              
              <select
                value={filterVisibility}
                onChange={(e) => setFilterVisibility(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Visibility</option>
                <option value="public">Public</option>
                <option value="private">Private</option>
              </select>
            </div>
          </div>
        </div>

        {/* Counters Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : filteredCounters.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCounters.map((counter) => (
              <CounterCard
                key={counter.id}
                counter={counter}
                onDelete={handleDeleteCounter}
                onEdit={handleEditCounter}
                onShare={handleShareCounter}
                showActions={true}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12">
              {counters.length === 0 ? (
                <>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No counters yet
                  </h3>
                  <p className="text-gray-500 mb-6">
                    Create your first counter to start tracking your progress
                  </p>
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="w-5 h-5" />
                    Create Your First Counter
                  </button>
                </>
              ) : (
                <>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No counters match your filters
                  </h3>
                  <p className="text-gray-500">
                    Try adjusting your search or filter settings
                  </p>
                </>
              )}
            </div>
          </div>
        )}

        {/* Create Counter Modal */}
        <CounterFormModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateCounter}
          isLoading={creating}
        />

        {/* Edit Counter Modal */}
        {editingCounter && (
          <EditCounterModal
            isOpen={showEditModal}
            onClose={() => {
              setShowEditModal(false);
              setEditingCounter(null);
            }}
            counter={editingCounter}
            onUpdate={handleUpdateCounter}
          />
        )}
      </div>
    </div>
  );
}; 