import React, { useState, useEffect } from 'react';
import { X, Save, Loader2 } from 'lucide-react';
import { useNDK } from '../contexts/NDKContext';
import type { Counter, CounterFormData } from '../types';
import toast from 'react-hot-toast';

interface EditCounterModalProps {
  isOpen: boolean;
  onClose: () => void;
  counter: Counter;
  onUpdate: (updatedCounter: Counter) => void;
}

export const EditCounterModal: React.FC<EditCounterModalProps> = ({
  isOpen,
  onClose,
  counter,
  onUpdate,
}) => {
  const { publishEvent } = useNDK();
  const [formData, setFormData] = useState<CounterFormData>({
    title: '',
    date: '',
    type: 'since',
    visibility: 'public',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form data when modal opens
  useEffect(() => {
    if (isOpen && counter) {
      setFormData({
        title: counter.title,
        date: counter.date,
        type: counter.type,
        visibility: counter.visibility,
      });
    }
  }, [isOpen, counter]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast.error('Title is required');
      return;
    }

    if (!formData.date) {
      toast.error('Date is required');
      return;
    }

    try {
      setIsSubmitting(true);

      // Create updated event data
      const eventData = {
        kind: 30078,
        content: '',
        tags: [
          ['type', formData.type],
          ['title', formData.title],
          ['date', formData.date],
          ['visibility', formData.visibility],
        ],
        created_at: Math.floor(Date.now() / 1000),
      };

      console.log('Updating counter with data:', eventData);

      // Publish the updated event
      const event = await publishEvent(eventData);
      
      // Convert to Counter object
      const { eventToCounter } = await import('../utils/nostr');
      const updatedCounter = eventToCounter(event);
      
      if (updatedCounter) {
        onUpdate(updatedCounter);
        toast.success('Counter updated successfully!');
        onClose();
      } else {
        throw new Error('Failed to parse updated counter');
      }
    } catch (error) {
      console.error('Error updating counter:', error);
      toast.error('Failed to update counter. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Edit Counter
          </h3>
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter counter title"
              disabled={isSubmitting}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date
            </label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isSubmitting}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as 'since' | 'until' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isSubmitting}
            >
              <option value="since">Days Since</option>
              <option value="until">Days Until</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Visibility
            </label>
            <select
              value={formData.visibility}
              onChange={(e) => setFormData({ ...formData, visibility: e.target.value as 'public' | 'private' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isSubmitting}
            >
              <option value="public">Public</option>
              <option value="private">Private</option>
            </select>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg font-medium hover:bg-gray-200 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !formData.title.trim() || !formData.date}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Update Counter
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}; 