import { useState, useEffect } from 'react';
import { MapPin, Calendar, DollarSign, ChevronDown, ChevronUp, Trash2 } from 'lucide-react';
import { supabase, Adventure, ItineraryDay } from '../shared/supabase';

export default function MyAdventures({ onLoginRequired }: { onLoginRequired: () => void }) {
  const [adventures, setAdventures] = useState<Adventure[]>([]);
  const [expandedAdventure, setExpandedAdventure] = useState<string | null>(null);
  const [itineraries, setItineraries] = useState<{ [key: string]: ItineraryDay[] }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAdventures();
  }, []);

  const fetchAdventures = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error: fetchError } = await supabase
        .from('adventures')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) {
        console.error('Fetch error:', fetchError);
        setError('');
        setAdventures([]);
      } else {
        setAdventures(data || []);
      }
    } catch (err) {
      console.error('Error:', err);
      setError('');
      setAdventures([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchItinerary = async (adventureId: string) => {
    try {
      const { data, error: fetchError } = await supabase
        .from('itinerary_days')
        .select('*')
        .eq('adventure_id', adventureId)
        .order('day_number', { ascending: true });

      if (fetchError) throw fetchError;

      setItineraries(prev => ({ ...prev, [adventureId]: data || [] }));
    } catch (err) {
      console.error('Failed to fetch itinerary:', err);
    }
  };

  const toggleExpand = async (adventureId: string) => {
    if (expandedAdventure === adventureId) {
      setExpandedAdventure(null);
    } else {
      setExpandedAdventure(adventureId);
      if (!itineraries[adventureId]) {
        await fetchItinerary(adventureId);
      }
    }
  };

  const deleteAdventure = async (adventureId: string) => {
    if (!confirm('Are you sure you want to delete this adventure?')) return;

    try {
      const { error: deleteError } = await supabase
        .from('adventures')
        .delete()
        .eq('id', adventureId);

      if (deleteError) throw deleteError;

      setAdventures(adventures.filter(a => a.id !== adventureId));
      if (expandedAdventure === adventureId) {
        setExpandedAdventure(null);
      }
    } catch (err) {
      alert('Failed to delete adventure: ' + (err instanceof Error ? err.message : 'Unknown error'));
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const calculateDayTotal = (day: ItineraryDay) => {
    return day.accommodation_cost + day.activities_cost + day.meals_cost + day.transport_cost;
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading your adventures...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  if (adventures.length === 0 && !loading) {
    return (
      <div className="text-center py-12">
        <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">No Adventures Yet</h3>
        <p className="text-gray-600">Create your first adventure to start planning your dream trip!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {adventures.map(adventure => {
        const isExpanded = expandedAdventure === adventure.id;
        const itinerary = itineraries[adventure.id] || [];

        return (
          <div key={adventure.id} className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow">
            <div
              className="p-6 cursor-pointer"
              onClick={() => toggleExpand(adventure.id)}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{adventure.title}</h3>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      <span>{adventure.destination}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(adventure.start_date)} - {formatDate(adventure.end_date)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <DollarSign className="w-4 h-4" />
                      <span className="font-semibold">{adventure.currency} {adventure.total_cost.toFixed(2)}</span>
                    </div>
                  </div>
                  {adventure.description && (
                    <p className="mt-3 text-gray-700">{adventure.description}</p>
                  )}
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteAdventure(adventure.id);
                    }}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                  {isExpanded ? (
                    <ChevronUp className="w-6 h-6 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-6 h-6 text-gray-400" />
                  )}
                </div>
              </div>
            </div>

            {isExpanded && (
              <div className="border-t border-gray-200 bg-gray-50 p-6">
                <h4 className="font-semibold text-gray-900 mb-4">Itinerary</h4>
                {itinerary.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No itinerary details added.</p>
                ) : (
                  <div className="space-y-4">
                    {itinerary.map((day) => (
                      <div key={day.id} className="bg-white border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h5 className="font-semibold text-gray-900">Day {day.day_number}: {day.title}</h5>
                            {day.accommodation && (
                              <p className="text-sm text-gray-600 mt-1">Staying at: {day.accommodation}</p>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-blue-600">
                              {adventure.currency} {calculateDayTotal(day).toFixed(2)}
                            </p>
                          </div>
                        </div>

                        {day.description && (
                          <p className="text-gray-700 mb-3">{day.description}</p>
                        )}

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                          {day.accommodation_cost > 0 && (
                            <div className="bg-gray-50 p-2 rounded">
                              <p className="text-gray-600">Accommodation</p>
                              <p className="font-semibold">{adventure.currency} {day.accommodation_cost.toFixed(2)}</p>
                            </div>
                          )}
                          {day.activities_cost > 0 && (
                            <div className="bg-gray-50 p-2 rounded">
                              <p className="text-gray-600">Activities</p>
                              <p className="font-semibold">{adventure.currency} {day.activities_cost.toFixed(2)}</p>
                            </div>
                          )}
                          {day.meals_cost > 0 && (
                            <div className="bg-gray-50 p-2 rounded">
                              <p className="text-gray-600">Meals</p>
                              <p className="font-semibold">{adventure.currency} {day.meals_cost.toFixed(2)}</p>
                            </div>
                          )}
                          {day.transport_cost > 0 && (
                            <div className="bg-gray-50 p-2 rounded">
                              <p className="text-gray-600">Transport</p>
                              <p className="font-semibold">{adventure.currency} {day.transport_cost.toFixed(2)}</p>
                            </div>
                          )}
                        </div>

                        {day.notes && (
                          <p className="mt-3 text-sm text-gray-600 italic">Note: {day.notes}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
