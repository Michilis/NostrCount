import React, { useState } from 'react';
import { Zap } from 'lucide-react';
import type { Counter, UserProfile } from '../types';
import { extractLightningAddress } from '../utils/nostr';

interface ZapButtonProps {
  counter: Counter;
  userProfile: UserProfile | null;
  className?: string;
}

export const ZapButton: React.FC<ZapButtonProps> = ({
  counter,
  userProfile,
  className = '',
}) => {
  const [isZapping, setIsZapping] = useState(false);
  const [zapAmount, setZapAmount] = useState(1000);
  const [zapComment, setZapComment] = useState('');
  const [showZapForm, setShowZapForm] = useState(false);

  const lightningAddress = userProfile ? extractLightningAddress(userProfile) : null;

  if (!lightningAddress) {
    return null;
  }

  const handleZap = async () => {
    if (!lightningAddress) return;

    try {
      setIsZapping(true);
      
      // Create a simple Lightning payment URL
      const lightningUrl = `lightning:${lightningAddress}?amount=${zapAmount}&comment=${encodeURIComponent(zapComment || `Zapped ${counter.title}`)}`;
      
      // Open the Lightning URL
      window.open(lightningUrl, '_blank');
      
      setShowZapForm(false);
    } catch (error) {
      console.error('Error creating zap:', error);
    } finally {
      setIsZapping(false);
    }
  };

  const zapAmounts = [100, 500, 1000, 5000, 10000];

  if (showZapForm) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-md w-full p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Zap {counter.title}
            </h3>
            <button
              onClick={() => setShowZapForm(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Amount (sats)
              </label>
              <div className="grid grid-cols-3 gap-2 mb-2">
                {zapAmounts.map((amount) => (
                  <button
                    key={amount}
                    onClick={() => setZapAmount(amount)}
                    className={`px-3 py-2 rounded-md border font-medium transition-colors ${
                      zapAmount === amount
                        ? 'bg-yellow-500 text-white border-yellow-500'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {amount}
                  </button>
                ))}
              </div>
              <input
                type="number"
                value={zapAmount}
                onChange={(e) => setZapAmount(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                placeholder="Custom amount"
                min="1"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Comment (optional)
              </label>
              <textarea
                value={zapComment}
                onChange={(e) => setZapComment(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                rows={3}
                placeholder="Add a comment..."
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowZapForm(false)}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleZap}
                disabled={isZapping}
                className="flex-1 px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition-colors font-medium disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Zap className="w-4 h-4" />
                {isZapping ? 'Creating...' : 'Zap'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={() => setShowZapForm(true)}
      className={`inline-flex items-center gap-2 px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition-colors font-medium ${className}`}
    >
      <Zap className="w-4 h-4" />
      Zap
    </button>
  );
}; 