import React, { useState } from 'react';
import { X, MessageSquare, Star, Check } from 'lucide-react';
import StarRating from './StarRating';

const FeedbackModal = ({ booking, isOpen, onClose, onSubmit }) => {
  const [rating, setRating] = useState(0);
  const [comments, setComments] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (rating === 0) {
      setError('Please select a rating');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const feedbackData = {
        rating,
        comments: comments.trim() || null
      };

      await onSubmit(feedbackData);
      
      // Reset form
      setRating(0);
      setComments('');
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit feedback');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setRating(0);
      setComments('');
      setError('');
      onClose();
    }
  };

  if (!isOpen || !booking) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary-600" />
            <h2 className="text-xl font-semibold text-gray-800">Submit Feedback</h2>
          </div>
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Booking Info */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-medium text-gray-800 mb-2">Booking Details</h3>
          <div className="text-sm text-gray-600 space-y-1">
            <p><span className="font-medium">Date:</span> {booking.visitDate}</p>
            <p><span className="font-medium">Visitors:</span> {booking.numberOfVisitors}</p>
            <p><span className="font-medium">Status:</span> 
              <span className={`ml-1 px-2 py-1 rounded text-xs ${
                booking.status === 'Approved' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
              }`}>
                {booking.status}
              </span>
            </p>
          </div>
        </div>

        {/* Feedback Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Rating */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rating <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center gap-2">
              <StarRating
                rating={rating}
                onChange={setRating}
                size="lg"
              />
              <span className="text-sm text-gray-600">
                {rating > 0 ? `${rating} star${rating > 1 ? 's' : ''}` : 'Select rating'}
              </span>
            </div>
          </div>

          {/* Comments */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Comments <span className="text-gray-400">(optional)</span>
            </label>
            <textarea
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="Share your experience at Rugezi Marshland..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
              rows={4}
              disabled={isSubmitting}
            />
            <p className="text-xs text-gray-500 mt-1">
              {comments.length}/500 characters
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || rating === 0}
              className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Submitting...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4" />
                  Submit Feedback
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FeedbackModal;
