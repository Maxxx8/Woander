import React, { useState } from 'react';
import { X, MapPin, Image as ImageIcon, Info, Mountain, Upload, Loader } from 'lucide-react';
import { supabase } from '../shared/supabase';
import { useAuth } from '../shared/AuthContext';

interface AddGemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const AddGemModal: React.FC<AddGemModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [uploadMethod, setUploadMethod] = useState<'url' | 'upload'>('upload');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    latitude: '',
    longitude: '',
    category: 'other',
    difficulty_level: 'easy',
    image_url: '',
    best_time_to_visit: '',
    tips: ''
  });

  const categories = [
    { value: 'cafe', label: 'Café' },
    { value: 'viewpoint', label: 'Viewpoint' },
    { value: 'waterfall', label: 'Waterfall' },
    { value: 'trail', label: 'Trail' },
    { value: 'beach', label: 'Beach' },
    { value: 'other', label: 'Other' }
  ];

  const difficulties = [
    { value: 'easy', label: 'Easy', description: 'Accessible to most people' },
    { value: 'moderate', label: 'Moderate', description: 'Requires some effort' },
    { value: 'challenging', label: 'Challenging', description: 'For experienced explorers' }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Image size must be less than 5MB');
      return;
    }

    setSelectedFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const uploadImage = async (): Promise<string> => {
    if (!selectedFile || !user) {
      throw new Error('No file selected or user not authenticated');
    }

    setUploading(true);
    try {
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

      const { error: uploadError, data } = await supabase.storage
        .from('gem-images')
        .upload(fileName, selectedFile, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('gem-images')
        .getPublicUrl(fileName);

      return publicUrl;
    } finally {
      setUploading(false);
    }
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      alert('Please enter a title');
      return false;
    }
    if (!formData.description.trim() || formData.description.length < 50) {
      alert('Please provide a detailed description (at least 50 characters)');
      return false;
    }
    if (!formData.location.trim()) {
      alert('Please enter a location');
      return false;
    }
    if (uploadMethod === 'upload' && !selectedFile) {
      alert('Please select an image to upload');
      return false;
    }
    if (uploadMethod === 'url' && !formData.image_url.trim()) {
      alert('Please provide an image URL');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      alert('Please sign in to submit a hidden gem');
      return;
    }

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      let imageUrl = formData.image_url.trim();

      if (uploadMethod === 'upload' && selectedFile) {
        imageUrl = await uploadImage();
      }

      const gemData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        location: formData.location.trim(),
        latitude: formData.latitude ? parseFloat(formData.latitude) : null,
        longitude: formData.longitude ? parseFloat(formData.longitude) : null,
        category: formData.category,
        difficulty_level: formData.difficulty_level,
        image_url: imageUrl,
        best_time_to_visit: formData.best_time_to_visit.trim() || null,
        tips: formData.tips.trim() || null,
        submitted_by: user.id,
        verification_status: 'pending'
      };

      const { error: gemError } = await supabase
        .from('hidden_gems')
        .insert(gemData);

      if (gemError) throw gemError;

      const { data: contribution } = await supabase
        .from('user_contributions')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (contribution) {
        await supabase
          .from('user_contributions')
          .update({
            gems_discovered: contribution.gems_discovered + 1,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', user.id);
      } else {
        await supabase
          .from('user_contributions')
          .insert({
            user_id: user.id,
            gems_discovered: 1,
            gems_verified: 0,
            total_votes_received: 0,
            explorer_level: 1
          });
      }

      setFormData({
        title: '',
        description: '',
        location: '',
        latitude: '',
        longitude: '',
        category: 'other',
        difficulty_level: 'easy',
        image_url: '',
        best_time_to_visit: '',
        tips: ''
      });
      setSelectedFile(null);
      setPreviewUrl('');
      setUploadMethod('upload');

      alert('Your hidden gem has been submitted for review! It will appear once verified.');
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error submitting gem:', error);
      alert('Failed to submit hidden gem. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-gray-900 bg-opacity-75" onClick={onClose} />

        <div className="relative inline-block w-full max-w-3xl p-8 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-2xl rounded-2xl">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>

          <div className="mb-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-gradient-to-br from-coral-500 to-sunset-500 rounded-xl flex items-center justify-center">
                <MapPin className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-gray-900">Add Your Discovery</h2>
                <p className="text-gray-600">Share a hidden gem with the community</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="e.g., Secret Waterfall Trail"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Description <span className="text-red-500">*</span>
                  <span className="text-gray-500 font-normal ml-2">(min 50 characters)</span>
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Describe what makes this place special, what visitors can expect, and why it's worth discovering..."
                  rows={4}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all resize-none"
                  required
                />
                <p className="text-sm text-gray-500 mt-1">{formData.description.length} characters</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Location <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    placeholder="City, State/Region"
                    className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                  required
                >
                  {categories.map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Latitude <span className="text-gray-500 font-normal">(optional)</span>
                </label>
                <input
                  type="number"
                  step="any"
                  name="latitude"
                  value={formData.latitude}
                  onChange={handleInputChange}
                  placeholder="e.g., 12.9716"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Longitude <span className="text-gray-500 font-normal">(optional)</span>
                </label>
                <input
                  type="number"
                  step="any"
                  name="longitude"
                  value={formData.longitude}
                  onChange={handleInputChange}
                  placeholder="e.g., 77.5946"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Difficulty Level <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {difficulties.map(diff => (
                    <button
                      key={diff.value}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, difficulty_level: diff.value }))}
                      className={`p-4 border-2 rounded-xl transition-all ${
                        formData.difficulty_level === diff.value
                          ? 'border-coral-500 bg-coral-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-center mb-2">
                        <Mountain className={`h-5 w-5 ${
                          formData.difficulty_level === diff.value ? 'text-coral-500' : 'text-gray-400'
                        }`} />
                      </div>
                      <div className="font-semibold text-gray-900 text-sm">{diff.label}</div>
                      <div className="text-xs text-gray-500 mt-1">{diff.description}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Image <span className="text-red-500">*</span>
                </label>

                <div className="flex gap-2 mb-4">
                  <button
                    type="button"
                    onClick={() => setUploadMethod('upload')}
                    className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-all ${
                      uploadMethod === 'upload'
                        ? 'bg-gradient-to-r from-coral-500 to-coral-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <Upload className="h-4 w-4 inline mr-2" />
                    Upload from Device
                  </button>
                  <button
                    type="button"
                    onClick={() => setUploadMethod('url')}
                    className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-all ${
                      uploadMethod === 'url'
                        ? 'bg-gradient-to-r from-coral-500 to-coral-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <ImageIcon className="h-4 w-4 inline mr-2" />
                    Image URL
                  </button>
                </div>

                {uploadMethod === 'upload' ? (
                  <div>
                    <div className="relative">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileSelect}
                        className="hidden"
                        id="image-upload"
                      />
                      <label
                        htmlFor="image-upload"
                        className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-teal-500 hover:bg-teal-50 transition-all"
                      >
                        {previewUrl ? (
                          <div className="relative w-full h-full">
                            <img
                              src={previewUrl}
                              alt="Preview"
                              className="w-full h-full object-cover rounded-xl"
                            />
                            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity rounded-xl">
                              <p className="text-white font-semibold">Click to change image</p>
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center">
                            <Upload className="h-12 w-12 text-gray-400 mb-2" />
                            <p className="text-gray-600 font-semibold mb-1">Click to upload</p>
                            <p className="text-sm text-gray-500">PNG, JPG, WEBP, GIF up to 5MB</p>
                          </div>
                        )}
                      </label>
                    </div>
                    {selectedFile && (
                      <p className="text-sm text-gray-600 mt-2">
                        Selected: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                      </p>
                    )}
                  </div>
                ) : (
                  <div>
                    <div className="relative">
                      <ImageIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="url"
                        name="image_url"
                        value={formData.image_url}
                        onChange={handleInputChange}
                        placeholder="https://example.com/image.jpg"
                        className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                      />
                    </div>
                    <p className="text-sm text-gray-500 mt-1">Use Pexels, Unsplash, or other image hosting services</p>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Best Time to Visit <span className="text-gray-500 font-normal">(optional)</span>
                </label>
                <input
                  type="text"
                  name="best_time_to_visit"
                  value={formData.best_time_to_visit}
                  onChange={handleInputChange}
                  placeholder="e.g., October to March"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Insider Tips <span className="text-gray-500 font-normal">(optional)</span>
                </label>
                <input
                  type="text"
                  name="tips"
                  value={formData.tips}
                  onChange={handleInputChange}
                  placeholder="e.g., Arrive early to avoid crowds"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
              <div className="flex gap-3">
                <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-900">
                  <p className="font-semibold mb-1">Submission Guidelines</p>
                  <ul className="list-disc list-inside space-y-1 text-blue-800">
                    <li>Your discovery will be reviewed before appearing publicly</li>
                    <li>Provide accurate and helpful information</li>
                    <li>Only submit places you have personally visited</li>
                    <li>Respect local communities and private property</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-coral-500 to-sunset-500 text-white font-bold rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader className="h-5 w-5 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Upload className="h-5 w-5" />
                    Submit Discovery
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddGemModal;
