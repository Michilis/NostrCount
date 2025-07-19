import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, Eye, EyeOff, Share2, Trash2, Edit, ExternalLink } from 'lucide-react';
import type { Counter } from '../types';
import { calculateDaysDiff, formatDate } from '../utils/date';
import { useNDK } from '../contexts/NDKContext';

interface CounterCardProps {
  counter: Counter;
  onDelete?: (slug: string) => void;
  onEdit?: (counter: Counter) => void;
  onShare?: (counter: Counter) => void;
  showActions?: boolean;
}

export const CounterCard: React.FC<CounterCardProps> = ({
  counter,
  onDelete,
  onEdit,
  onShare,
  showActions = false,
}) => {
  const { user } = useNDK();
  const isOwner = user?.pubkey === counter.pubkey;
  
  const daysDiff = calculateDaysDiff(counter.date, counter.type);
  const isOverdue = counter.type === 'until' && daysDiff < 0;
  
  const getDayText = () => {
    if (counter.type === 'since') {
      return daysDiff === 0 ? 'Today' : `${daysDiff} days`;
    } else {
      if (daysDiff === 0) return 'Today';
      if (daysDiff > 0) return `${daysDiff} days`;
      return `${Math.abs(daysDiff)} days ago`;
    }
  };

  const getTypeText = () => {
    if (counter.type === 'since') {
      return 'since';
    } else {
      return isOverdue ? 'since' : 'until';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 border border-gray-200">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <Link 
            to={`/counter/${counter.slug}`}
            className="text-lg font-semibold text-gray-900 leading-tight hover:text-blue-600 transition-colors"
          >
            {counter.title}
          </Link>
          
          <div className="flex items-center gap-2">
            {counter.visibility === 'private' ? (
              <EyeOff className="w-4 h-4 text-gray-400" />
            ) : (
              <Eye className="w-4 h-4 text-gray-400" />
            )}
            
            {showActions && (
              <div className="flex items-center gap-1">
                <Link
                  to={`/counter/${counter.slug}`}
                  className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                  title="View counter"
                >
                  <ExternalLink className="w-4 h-4" />
                </Link>
                
                {onShare && (
                  <button
                    onClick={() => onShare(counter)}
                    className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                    title="Share counter"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                )}
                
                {isOwner && onEdit && (
                  <button
                    onClick={() => onEdit(counter)}
                    className="p-1 text-gray-400 hover:text-green-600 transition-colors"
                    title="Edit counter"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                )}
                
                {isOwner && onDelete && (
                  <button
                    onClick={() => onDelete(counter.slug)}
                    className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                    title="Delete counter"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
        
        <div className="text-center py-4">
          <div className={`text-4xl font-bold mb-2 ${
            isOverdue ? 'text-red-600' : 'text-blue-600'
          }`}>
            {getDayText()}
          </div>
          
          <div className="text-gray-600 text-sm">
            {getTypeText()} {formatDate(counter.date)}
          </div>
        </div>
        
        <div className="flex items-center justify-between text-sm text-gray-500 pt-4 border-t border-gray-100">
          <div className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            <span>{formatDate(counter.date)}</span>
          </div>
          
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>Created {new Date(counter.createdAt * 1000).toLocaleDateString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
}; 