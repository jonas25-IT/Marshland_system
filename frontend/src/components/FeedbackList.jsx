import React from 'react';
import { MessageSquare, Calendar, Star, User } from 'lucide-react';
import StarRating from './StarRating';

const FeedbackList = ({ feedbacks, loading = false, showUser = false }) => {
  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="animate-pulse">
              <div className="flex justify-between items-start mb-3">
                <div className="h-4 bg-gray-200 rounded w-32"></div>
                <div className="h-4 bg-gray-200 rounded w-24"></div>
              </div>
              <div className="flex gap-1 mb-3">
                {[1, 2, 3, 4, 5].map((star) => (
                  <div key={star} className="h-4 w-4 bg-gray-200 rounded"></div>
                ))}
              </div>
              <div className="h-12 bg-gray-200 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!feedbacks || feedbacks.length === 0) {
    return (
      <div className="text-center py-8">
        <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Feedback Yet</h3>
        <p className="text-gray-600">
          {showUser ? "You haven't submitted any feedback yet." : "No feedback available."}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {feedbacks.map((feedback) => (
        <div key={feedback.feedbackId} className="bg-white rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow">
          {/* Header */}
          <div className="flex justify-between items-start mb-3">
            <div className="flex-1">
              {showUser && feedback.user && (
                <div className="flex items-center gap-2 mb-2">
                  <User className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-900">
                    {feedback.user.firstName} {feedback.user.lastName}
                  </span>
                </div>
              )}
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar className="h-4 w-4" />
                <span>
                  {new Date(feedback.submittedAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <StarRating rating={feedback.rating} readonly size="sm" />
              <span className="text-sm font-medium text-gray-900">
                {feedback.rating}.0
              </span>
            </div>
          </div>

          {/* Comments */}
          {feedback.comments && (
            <div className="mt-3 pt-3 border-t border-gray-100">
              <p className="text-gray-700 whitespace-pre-wrap">
                {feedback.comments}
              </p>
            </div>
          )}

          {/* Booking Info */}
          {feedback.booking && (
            <div className="mt-3 pt-3 border-t border-gray-100">
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>Visit Date: {new Date(feedback.booking.visitDate.visitDate).toLocaleDateString()}</span>
                <span>Visitors: {feedback.booking.numberOfVisitors}</span>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default FeedbackList;
