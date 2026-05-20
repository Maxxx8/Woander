import React, { useState, useEffect } from 'react';
import { Home, Edit, Trash2, Eye, MapPin, Users, DollarSign, CheckCircle, Clock, XCircle } from 'lucide-react';
import { supabase } from '../shared/supabase';
import { useAuth } from '../shared/AuthContext';

interface Property {
  id: string;
  title: string;
  description: string;
  property_type: string;
  location_city: string;
  location_state: string;
  price_per_night: number;
  max_guests: number;
  bedrooms: number;
  bathrooms: number;
  featured_image: string;
  status: string;
  rating_average: number;
  rating_count: number;
  view_count: number;
  booking_count: number;
  created_at: string;
}

const MyProperties: React.FC = () => {
  const { user } = useAuth();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

  useEffect(() => {
    if (user) {
      fetchProperties();
    }
  }, [user]);

  const fetchProperties = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('property_listings')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProperties(data || []);
    } catch (error) {
      console.error('Error fetching properties:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (propertyId: string) => {
    if (!confirm('Are you sure you want to delete this property listing?')) return;

    try {
      const { error } = await supabase
        .from('property_listings')
        .delete()
        .eq('id', propertyId);

      if (error) throw error;
      fetchProperties();
    } catch (error) {
      console.error('Error deleting property:', error);
      alert('Failed to delete property');
    }
  };

  const filteredProperties = filter === 'all'
    ? properties
    : properties.filter(p => p.status === filter);

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { icon: Clock, color: 'bg-yellow-100 text-yellow-800', text: 'Pending Review' },
      approved: { icon: CheckCircle, color: 'bg-green-100 text-green-800', text: 'Approved' },
      rejected: { icon: XCircle, color: 'bg-red-100 text-red-800', text: 'Rejected' },
      inactive: { icon: XCircle, color: 'bg-gray-100 text-gray-800', text: 'Inactive' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.inactive;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${config.color}`}>
        <Icon className="w-4 h-4" />
        {config.text}
      </span>
    );
  };

  if (!user) {
    return (
      <div className="text-center py-12">
        <Home className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">Please log in to manage your properties</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading your properties...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">My Property Listings</h2>
        <div className="flex gap-2">
          {(['all', 'pending', 'approved', 'rejected'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === status
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {filteredProperties.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl">
          <Home className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 text-lg mb-2">No properties found</p>
          <p className="text-gray-500 text-sm">
            {filter === 'all'
              ? 'Start by adding your first property listing'
              : `No ${filter} properties`}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {filteredProperties.map((property) => (
            <div key={property.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <div className="md:flex">
                <div className="md:w-1/3">
                  <img
                    src={property.featured_image || 'https://images.pexels.com/photos/1732414/pexels-photo-1732414.jpeg?auto=compress&cs=tinysrgb&w=800'}
                    alt={property.title}
                    className="h-full w-full object-cover"
                  />
                </div>

                <div className="p-6 md:w-2/3">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-1">{property.title}</h3>
                      <div className="flex items-center gap-2 text-gray-600 text-sm">
                        <MapPin className="w-4 h-4" />
                        <span>{property.location_city}, {property.location_state}</span>
                      </div>
                    </div>
                    {getStatusBadge(property.status)}
                  </div>

                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {property.description}
                  </p>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <DollarSign className="w-4 h-4 text-green-600" />
                      <span className="font-semibold">₹{property.price_per_night}/night</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <Users className="w-4 h-4 text-blue-600" />
                      <span>{property.max_guests} guests</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <Home className="w-4 h-4 text-orange-600" />
                      <span>{property.bedrooms} beds</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <Eye className="w-4 h-4 text-gray-600" />
                      <span>{property.view_count} views</span>
                    </div>
                  </div>

                  {property.rating_count > 0 && (
                    <div className="flex items-center gap-2 mb-4">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <svg
                            key={i}
                            className={`w-4 h-4 ${
                              i < Math.floor(property.rating_average)
                                ? 'text-yellow-400 fill-current'
                                : 'text-gray-300'
                            }`}
                            viewBox="0 0 20 20"
                          >
                            <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                          </svg>
                        ))}
                      </div>
                      <span className="text-sm text-gray-600">
                        {property.rating_average.toFixed(1)} ({property.rating_count} reviews)
                      </span>
                    </div>
                  )}

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => window.location.href = `/property/${property.id}`}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                    >
                      <Eye className="w-4 h-4" />
                      View
                    </button>
                    <button
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
                    >
                      <Edit className="w-4 h-4" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(property.id)}
                      className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors flex items-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </div>

                  {property.status === 'pending' && (
                    <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-sm text-yellow-800">
                        Your property is under review. We'll notify you once it's approved!
                      </p>
                    </div>
                  )}

                  {property.status === 'rejected' && (
                    <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-sm text-red-800">
                        This listing was not approved. Please review our guidelines and resubmit with corrections.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyProperties;
