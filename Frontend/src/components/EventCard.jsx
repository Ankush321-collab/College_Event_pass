import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Users, ArrowRight } from 'lucide-react';

const EventCard = ({ event, onRegister, isRegistered = false }) => {
  const eventDate = new Date(event.date);
  const isUpcoming = eventDate > new Date();
  const spotsLeft = event.capacity - event.currentRegistrations;
  const isEventFull = spotsLeft === 0;

  return (
    <div className="group relative bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl dark:hover:shadow-gray-700/50 transition-all duration-300 overflow-hidden transform hover:-translate-y-1 hover:scale-[1.02] border border-gray-200 dark:border-gray-700">
      {/* Poster image with gradient overlay */}
      {event.posterUrl && (
        <div className="relative h-48 sm:h-56 overflow-hidden">
          <img 
            src={event.posterUrl} 
            alt={event.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          {/* Status badge */}
          <span className={`absolute top-3 right-3 px-2.5 py-1 text-xs font-semibold rounded-full shadow-sm ${
            isUpcoming 
              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100' 
              : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
          }`}>
            {isUpcoming ? 'Upcoming' : 'Past'}
          </span>
        </div>
      )}
      
      {/* Card content */}
      <div className="p-5 sm:p-6">
        <div className="mb-4">
          <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200 line-clamp-2">
            <Link to={`/events/${event._id}`} className="hover:underline">
              {event.title}
            </Link>
          </h3>
        </div>
        
        <p className="text-gray-600 dark:text-gray-300 mb-5 line-clamp-2 text-sm sm:text-base">
          {event.description}
        </p>
        
        {/* Event details */}
        <div className="space-y-3 mb-6">
          <div className="flex items-center text-gray-600 dark:text-gray-400">
            <Calendar className="h-4 w-4 sm:h-5 sm:w-5 mr-2 sm:mr-3 text-blue-500 dark:text-blue-400 flex-shrink-0" />
            <span className="text-xs sm:text-sm">
              {eventDate.toLocaleDateString('en-US', { 
                weekday: 'short', 
                month: 'short', 
                day: 'numeric' 
              })}
              <span className="mx-1">•</span>
              {eventDate.toLocaleTimeString([], { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </span>
          </div>
          
          <div className="flex items-center text-gray-600 dark:text-gray-400">
            <MapPin className="h-4 w-4 sm:h-5 sm:w-5 mr-2 sm:mr-3 text-red-500 dark:text-red-400 flex-shrink-0" />
            <span className="text-xs sm:text-sm line-clamp-1">{event.venue}</span>
          </div>
          
          <div className="flex items-center text-gray-600 dark:text-gray-400">
            <Users className="h-4 w-4 sm:h-5 sm:w-5 mr-2 sm:mr-3 text-purple-500 dark:text-purple-400 flex-shrink-0" />
            <span className="text-xs sm:text-sm">
              {isEventFull ? 'Event full' : `${spotsLeft} spots left`}
              <span className="text-gray-400 dark:text-gray-500 ml-1">
                ({event.currentRegistrations}/{event.capacity})
              </span>
            </span>
          </div>
        </div>
        
        {/* Action buttons */}
        <div className="flex items-center justify-between">
          <Link 
            to={`/events/${event._id}`}
            className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm font-medium transition-colors duration-200"
          >
            View details
            <ArrowRight className="h-4 w-4 ml-1" />
          </Link>
          
          {isUpcoming && onRegister && (
            <button
              onClick={() => onRegister(event._id)}
              disabled={isRegistered || isEventFull}
              className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-md text-xs sm:text-sm font-medium transition-all duration-200 ${
                isRegistered 
                  ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200 cursor-not-allowed'
                  : isEventFull
                  ? 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700 dark:hover:bg-blue-800 shadow-sm hover:shadow-md'
              }`}
            >
              {isRegistered ? 'Registered' : isEventFull ? 'Full' : 'Register'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventCard;