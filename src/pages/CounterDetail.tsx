import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock, User, Copy, MessageCircle, Edit, Trash2 } from 'lucide-react';
import { CounterCard } from '../components/CounterCard';
import { ZapButton } from '../components/ZapButton';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { NostrShareModal } from '../components/NostrShareModal';
import { EditCounterModal } from '../components/EditCounterModal';
import { useCounter } from '../hooks/useCounters';
import { useDeleteCounter } from '../hooks/useCounters';
import { useNDK } from '../contexts/NDKContext';
import type { UserProfile } from '../types';
import toast from 'react-hot-toast';

export const CounterDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { counter, loading, error } = useCounter(slug!);
  const { fetchUserProfile, user } = useNDK();
  const { deleteCounter } = useDeleteCounter();
  const [authorProfile, setAuthorProfile] = useState<UserProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [showNostrShareModal, setShowNostrShareModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    if (counter && counter.pubkey) {
      setLoadingProfile(true);
      fetchUserProfile(counter.pubkey)
        .then(setAuthorProfile)
        .catch(console.error)
        .finally(() => setLoadingProfile(false));
    }
  }, [counter, fetchUserProfile]);

  const handleShare = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    toast.success('Counter link copied to clipboard!');
  };

  const handleShareNostr = () => {
    if (!counter) return;
    setShowNostrShareModal(true);
  };

  const handleEditCounter = () => {
    if (!counter) return;
    setShowEditModal(true);
  };

  const handleDeleteCounter = async () => {
    if (!counter) return;
    
    if (!window.confirm('Are you sure you want to delete this counter?')) {
      return;
    }

    try {
      await deleteCounter(counter.slug);
      toast.success('Counter deleted successfully!');
      // Redirect to home page after deletion
      window.location.href = '/';
    } catch (error) {
      toast.error('Failed to delete counter. Please try again.');
    }
  };

  const handleUpdateCounter = () => {
    // Refresh the page to show updated counter
    window.location.reload();
  };

  const isOwner = user?.pubkey === counter?.pubkey;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !counter) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Counter not found
          </h1>
          <p className="text-gray-600 mb-6">
            The counter you're looking for doesn't exist or has been deleted.
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-8 font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        {/* Counter Display */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-8">
            <div className="max-w-md mx-auto">
              <CounterCard counter={counter} />
            </div>
          </div>
        </div>

        {/* Author Info */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mt-6 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Counter Details
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <User className="w-5 h-5 text-gray-400" />
              <div>
                <span className="text-gray-600">Created by:</span>
                {loadingProfile ? (
                  <LoadingSpinner size="sm" className="ml-2" />
                ) : (
                  <div className="flex items-center gap-2 mt-1">
                    {authorProfile?.picture && (
                      <img
                        src={authorProfile.picture}
                        alt={authorProfile.name || 'Author'}
                        className="w-6 h-6 rounded-full"
                      />
                    )}
                    <span className="font-medium text-gray-900">
                      {authorProfile?.display_name || 
                       authorProfile?.name || 
                       `${counter.pubkey.slice(0, 8)}...${counter.pubkey.slice(-8)}`}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-gray-400" />
              <div>
                <span className="text-gray-600">Target date:</span>
                <div className="font-medium text-gray-900 mt-1">
                  {new Date(counter.date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-gray-400" />
              <div>
                <span className="text-gray-600">Created:</span>
                <div className="font-medium text-gray-900 mt-1">
                  {new Date(counter.createdAt * 1000).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mt-6 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Actions
          </h3>
          
          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleShare}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
            >
              <Copy className="w-4 h-4" />
              Copy Link
            </button>
            
            <button
              onClick={handleShareNostr}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              Share on Nostr
            </button>

            {isOwner && (
              <>
                <button
                  onClick={handleEditCounter}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
                >
                  <Edit className="w-4 h-4" />
                  Edit Counter
                </button>
                
                <button
                  onClick={handleDeleteCounter}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete Counter
                </button>
              </>
            )}

            {authorProfile && (
              <ZapButton
                counter={counter}
                userProfile={authorProfile}
                className="flex-shrink-0"
              />
            )}
          </div>
        </div>

        {/* Nostr Details */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mt-6 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Nostr Details
          </h3>
          
          <div className="space-y-3 text-sm">
            <div>
              <span className="text-gray-600">Event ID:</span>
              <code className="ml-2 px-2 py-1 bg-gray-100 rounded text-xs font-mono">
                {counter.id}
              </code>
            </div>
            
            <div>
              <span className="text-gray-600">Author Pubkey:</span>
              <code className="ml-2 px-2 py-1 bg-gray-100 rounded text-xs font-mono">
                {counter.pubkey}
              </code>
            </div>
            
            <div>
              <span className="text-gray-600">Kind:</span>
              <code className="ml-2 px-2 py-1 bg-gray-100 rounded text-xs font-mono">
                30078
              </code>
            </div>
          </div>
        </div>
      </div>

      {/* Nostr Share Modal */}
      {counter && (
        <NostrShareModal
          isOpen={showNostrShareModal}
          onClose={() => setShowNostrShareModal(false)}
          counter={counter}
        />
      )}

      {/* Edit Counter Modal */}
      {counter && (
        <EditCounterModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          counter={counter}
          onUpdate={handleUpdateCounter}
        />
      )}
    </div>
  );
}; 