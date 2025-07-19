import React, { useState, useEffect } from 'react';
import { X, Calendar, Eye, EyeOff } from 'lucide-react';
import type { CounterFormData } from '../types';
import { getTodayISOString, isDateValid } from '../utils/date';
import { deriveCounterType } from '../utils/nostr';

interface CounterFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CounterFormData) => Promise<void>;
  initialData?: CounterFormData;
  isLoading?: boolean;
}

export const CounterFormModal: React.FC<CounterFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isLoading = false,
}) => {
  const [formData, setFormData] = useState<CounterFormData>({
    title: '',
    date: getTodayISOString(),
    type: 'since',
    visibility: 'private',
  });

  const [errors, setErrors] = useState<Partial<CounterFormData>>({});

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({
        title: '',
        date: getTodayISOString(),
        type: 'since',
        visibility: 'private',
      });
    }
    setErrors({});
  }, [initialData, isOpen]);

  // Auto-derive type from date
  const derivedType = deriveCounterType(formData.date);
  const typeDescription = derivedType === 'since' ? 'Days Since' : 'Days Until';

  const validateForm = (): boolean => {
    const newErrors: Partial<CounterFormData> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.length > 100) {
      newErrors.title = 'Title must be 100 characters or less';
    }

    if (!formData.date) {
      newErrors.date = 'Date is required';
    } else if (!isDateValid(formData.date)) {
      newErrors.date = 'Invalid date format';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      // Use the derived type instead of the form type
      const submitData = {
        ...formData,
        type: derivedType,
      };
      await onSubmit(submitData);
      onClose();
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  const handleInputChange = (
    field: keyof CounterFormData,
    value: string
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {initialData ? 'Edit Counter' : 'Create Counter'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            disabled={isLoading}
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.title ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="e.g., Quit smoking"
              disabled={isLoading}
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600">{errors.title}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date
            </label>
            <div className="relative">
              <input
                type="date"
                value={formData.date}
                onChange={(e) => handleInputChange('date', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.date ? 'border-red-500' : 'border-gray-300'
                }`}
                disabled={isLoading}
              />
              <Calendar className="absolute right-3 top-2.5 w-5 h-5 text-gray-400 pointer-events-none" />
            </div>
            {errors.date && (
              <p className="mt-1 text-sm text-red-600">{errors.date}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Counter Type
            </label>
            <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-md">
              <p className="text-sm text-gray-700">
                <span className="font-medium">{typeDescription}</span>
                <span className="text-gray-500 ml-2">
                  (auto-detected from date)
                </span>
              </p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Visibility
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleInputChange('visibility', 'private')}
                className={`px-4 py-2 rounded-md border font-medium transition-colors flex items-center justify-center gap-2 ${
                  formData.visibility === 'private'
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
                disabled={isLoading}
              >
                <EyeOff className="w-4 h-4" />
                Private
              </button>
              <button
                type="button"
                onClick={() => handleInputChange('visibility', 'public')}
                className={`px-4 py-2 rounded-md border font-medium transition-colors flex items-center justify-center gap-2 ${
                  formData.visibility === 'public'
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
                disabled={isLoading}
              >
                <Eye className="w-4 h-4" />
                Public
              </button>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors font-medium"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium disabled:opacity-50"
              disabled={isLoading}
            >
              {isLoading ? 'Saving...' : initialData ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}; 