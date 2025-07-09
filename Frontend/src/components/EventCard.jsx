import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Users, Clock } from 'lucide-react';

const EventCard = ({ event, onRegister, isRegistered = false }) => {
  const eventDate = new Date(event.date);
  const isUpcoming = eventDate > new Date();
  const spotsLeft = event.capacity - event.currentRegistrations;

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden">
      {event.posterUrl && (
        <img 
          src={event.posterUrl} 
          alt={event.title}
          className="w-full h-48 object-cover"
        />
      )}
      
      <div className="p-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xl font-semibold text-gray-800 hover:text-blue-600 transition-colors">
            <Link to={`/events/${event._id}`}>
              {event.title}
            </Link>
          </h3>
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
            isUpcoming ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
          }`}>
            {isUpcoming ? 'Upcoming' : 'Past'}
          </span>
        </div>
        
        <p className="text-gray-600 mb-4 line-clamp-2">{event.description}</p>
        
        <div className="space-y-2 mb-4">
          <div className="flex items-center text-gray-600">
            <Calendar className="h-4 w-4 mr-2" />
            <span className="text-sm">
              {eventDate.toLocaleDateString()} at {eventDate.toLocaleTimeString([], { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </span>
          </div>
          
          <div className="flex items-center text-gray-600">
            <MapPin className="h-4 w-4 mr-2" />
            <span className="text-sm">{event.venue}</span>
          </div>
          
          <div className="flex items-center text-gray-600">
            <Users className="h-4 w-4 mr-2" />
            <span className="text-sm">
              {spotsLeft} spots left ({event.currentRegistrations}/{event.capacity})
            </span>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <Link 
            to={`/events/${event._id}`}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            View Details
          </Link>
          
          {isUpcoming && onRegister && (
            <button
              onClick={() => onRegister(event._id)}
              disabled={isRegistered || spotsLeft === 0}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                isRegistered 
                  ? 'bg-green-100 text-green-800 cursor-not-allowed'
                  : spotsLeft === 0
                  ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {isRegistered ? 'Registered' : spotsLeft === 0 ? 'Full' : 'Register'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventCard;