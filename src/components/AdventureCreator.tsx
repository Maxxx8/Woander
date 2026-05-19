import { useState } from 'react';
import { MapPin, Calendar, DollarSign, Plus, X } from 'lucide-react';
import { supabase } from '../shared/supabase';

interface ItineraryDayInput {
  day_number: number;
  title: string;
  description: string;
  accommodation: string;
  accommodation_cost: number;
  activities_cost: number;
  meals_cost: number;
  transport_cost: number;
  notes: string;
}

export default function AdventureCreator({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [title, setTitle] = useState('');
  const [destination, setDestination] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [days, setDays] = useState<ItineraryDayInput[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const addDay = () => {
    const newDay: ItineraryDayInput = {
      day_number: days.length + 1,
      title: '',
      description: '',
      accommodation: '',
      accommodation_cost: 0,
      activities_cost: 0,
      meals_cost: 0,
      transport_cost: 0,
      notes: '',
    };
    setDays([...days, newDay]);
  };

  const removeDay = (index: number) => {
    const newDays = days.filter((_, i) => i !== index);
    newDays.forEach((day, i) => {
      day.day_number = i + 1;
    });
    setDays(newDays);
  };

  const updateDay = (index: number, field: keyof ItineraryDayInput, value: string | number) => {
    const newDays = [...days];
    newDays[index] = { ...newDays[index], [field]: value };
    setDays(newDays);
  };

  const calculateTotalCost = () => {
    return days.reduce((total, day) => {
      return total + day.accommodation_cost + day.activities_cost + day.meals_cost + day.transport_cost;
    }, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setError('You must be logged in to create an adventure');
        setLoading(false);
        return;
      }

      const totalCost = calculateTotalCost();

      const { data: adventure, error: adventureError } = await supabase
        .from('adventures')
        .insert({
          user_id: user.id,
          title,
          destination,
          description,
          start_date: startDate,
          end_date: endDate,
          total_cost: totalCost,
          currency,
        })
        .select()
        .maybeSingle();

      if (adventureError) throw adventureError;
      if (!adventure) throw new Error('Failed to create adventure');

      if (days.length > 0) {
        const itineraryDays = days.map(day => ({
          adventure_id: adventure.id,
          ...day,
        }));

        const { error: daysError } = await supabase
          .from('itinerary_days')
          .insert(itineraryDays);

        if (daysError) throw daysError;
      }

      onSuccess();
      onClose();
    } catch (err) {
      console.error('Error creating adventure:', err);
      setError(err instanceof Error ? err.message : 'Failed to create adventure. Please make sure you are logged in and the database is set up correctly.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-4xl w-full my-8">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">Create Your Adventure</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Adventure Title
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., Summer European Tour"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MapPin className="w-4 h-4 inline mr-1" />
                Destination
              </label>
              <input
                type="text"
                required
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., Paris, France"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
              placeholder="Describe your adventure..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                Start Date
              </label>
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                End Date
              </label>
              <input
                type="date"
                required
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <DollarSign className="w-4 h-4 inline mr-1" />
                Currency
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
                <option value="JPY">JPY</option>
                <option value="AUD">AUD</option>
              </select>
            </div>
          </div>

          <div className="border-t pt-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Itinerary</h3>
              <button
                type="button"
                onClick={addDay}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Day
              </button>
            </div>

            {days.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No days added yet. Click "Add Day" to start planning your itinerary.</p>
            ) : (
              <div className="space-y-4">
                {days.map((day, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="font-semibold text-gray-900">Day {day.day_number}</h4>
                      <button
                        type="button"
                        onClick={() => removeDay(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <input
                        type="text"
                        placeholder="Day title"
                        value={day.title}
                        onChange={(e) => updateDay(index, 'title', e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                      <input
                        type="text"
                        placeholder="Accommodation"
                        value={day.accommodation}
                        onChange={(e) => updateDay(index, 'accommodation', e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <textarea
                      placeholder="Activities description"
                      value={day.description}
                      onChange={(e) => updateDay(index, 'description', e.target.value)}
                      className="w-full mt-3 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      rows={2}
                    />

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Accommodation</label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={day.accommodation_cost}
                          onChange={(e) => updateDay(index, 'accommodation_cost', parseFloat(e.target.value) || 0)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Activities</label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={day.activities_cost}
                          onChange={(e) => updateDay(index, 'activities_cost', parseFloat(e.target.value) || 0)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Meals</label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={day.meals_cost}
                          onChange={(e) => updateDay(index, 'meals_cost', parseFloat(e.target.value) || 0)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Transport</label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={day.transport_cost}
                          onChange={(e) => updateDay(index, 'transport_cost', parseFloat(e.target.value) || 0)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    <textarea
                      placeholder="Notes"
                      value={day.notes}
                      onChange={(e) => updateDay(index, 'notes', e.target.value)}
                      className="w-full mt-3 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      rows={1}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {days.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-gray-900">Total Estimated Cost:</span>
                <span className="text-2xl font-bold text-blue-600">
                  {currency} {calculateTotalCost().toFixed(2)}
                </span>
              </div>
            </div>
          )}
        </form>

        <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create Adventure'}
          </button>
        </div>
      </div>
    </div>
  );
}
