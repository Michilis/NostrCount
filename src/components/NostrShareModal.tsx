import React, { useState } from 'react';
import { X, Send, Loader2 } from 'lucide-react';
import { useNDK } from '../contexts/NDKContext';
import type { Counter } from '../types';
import toast from 'react-hot-toast';

interface NostrShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  counter: Counter;
}

export const NostrShareModal: React.FC<NostrShareModalProps> = ({
  isOpen,
  onClose,
  counter,
}) => {
  const { ndk, user } = useNDK();
  const [content, setContent] = useState('');
  const [isPublishing, setIsPublishing] = useState(false);

  // Generate default share text
  const defaultShareText = `Check out my ${counter.type === 'since' ? 'progress' : 'countdown'}: ${counter.title}`;
  
  // Initialize content with default text when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setContent(defaultShareText);
    }
  }, [isOpen, defaultShareText]);

  const handlePublish = async () => {
    if (!ndk || !user) {
      toast.error('Please log in to share on Nostr');
      return;
    }

    if (!content.trim()) {
      toast.error('Please enter a message to share');
      return;
    }

    try {
      setIsPublishing(true);

      // Create NIP-1 text note event
      const { NDKEvent } = await import('@nostr-dev-kit/ndk');
      const event = new NDKEvent(ndk);
      
      event.kind = 1; // Text note
      event.content = content;
      
      // Add counter event as a reference
      event.tags = [
        ['e', counter.id, '', 'mention'], // Reference the counter event
        ['p', counter.pubkey, '', 'mention'], // Reference the counter author
      ];

      console.log('Publishing Nostr share event:', {
        content: event.content,
        tags: event.tags,
        kind: event.kind,
      });

      await event.sign();
      await event.publish();

      toast.success('Shared on Nostr successfully!');
      onClose();
    } catch (error) {
      console.error('Error publishing Nostr share:', error);
      toast.error('Failed to share on Nostr. Please try again.');
    } finally {
      setIsPublishing(false);
    }
  };

  const handleClose = () => {
    if (!isPublishing) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Share on Nostr
          </h3>
          <button
            onClick={handleClose}
            disabled={isPublishing}
            className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your message
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your message..."
              className="w-full h-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              disabled={isPublishing}
            />
          </div>

          <div className="text-xs text-gray-500 mb-4">
            This will publish a NIP-1 text note that references the counter.
          </div>

          {/* Counter preview */}
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <div className="text-sm text-gray-600 mb-2">Sharing counter:</div>
            <div className="font-medium text-gray-900">{counter.title}</div>
            <div className="text-sm text-gray-600">
              {counter.type === 'since' ? 'Days since' : 'Days until'} {new Date(counter.date).toLocaleDateString()}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
          <button
            onClick={handleClose}
            disabled={isPublishing}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg font-medium hover:bg-gray-200 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handlePublish}
            disabled={isPublishing || !content.trim()}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPublishing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Publishing...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Share on Nostr
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}; 