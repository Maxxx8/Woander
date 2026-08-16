import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Save } from 'lucide-react';
import type { Tour } from '../shared/supabase';

interface GuideExperienceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  guideId: string;
  editingTour: Tour | null;
}

const TOUR_TYPES: Tour['tour_type'][] = [
  'cultural', 'adventure', 'food', 'history', 'nature', 'photography', 'walking', 'cycling', 'wildlife', 'spiritual', 'other',
];

const DIFFICULTY_LEVELS: Tour['difficulty_level'][] = ['easy', 'moderate', 'challenging', 'expert'];

const CURRENCIES = ['INR', 'USD', 'EUR', 'GBP', 'AUD', 'CAD', 'JPY'];

interface FormState {
  title: string;
  description: string;
  tour_type: Tour['tour_type'];
  duration_hours: string;
  price_per_person: string;
  currency: string;
  max_group_size: string;
  min_group_size: string;
  difficulty_level: Tour['difficulty_level'];
  meeting_point: string;
  ending_point: string;
  included_items: string[];
  excluded_items: string[];
  requirements: string[];
  cancellation_policy: string;
  featured_image: string;
  gallery_images: string[];
  location_city: string;
  location_state: string;
}

const DEFAULT_FORM: FormState = {
  title: '',
  description: '',
  tour_type: 'cultural',
  duration_hours: '2',
  price_per_person: '1000',
  currency: 'INR',
  max_group_size: '10',
  min_group_size: '1',
  difficulty_level: 'easy',
  meeting_point: '',
  ending_point: '',
  included_items: [],
  excluded_items: [],
  requirements: [],
  cancellation_policy: 'Free cancellation up to 24 hours before the tour',
  featured_image: '',
  gallery_images: [],
  location_city: '',
  location_state: '',
};

const GuideExperienceModal: React.FC<GuideExperienceModalProps> = ({
  isOpen, onClose, onSuccess, guideId, editingTour,
}) => {
  const [form, setForm] = useState<FormState>(DEFAULT_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [newIncluded, setNewIncluded] = useState('');
  const [newExcluded, setNewExcluded] = useState('');
  const [newRequirement, setNewRequirement] = useState('');
  const [newGalleryImage, setNewGalleryImage] = useState('');

  useEffect(() => {
    if (editingTour) {
      setForm({
        title: editingTour.title || '',
        description: editingTour.description || '',
        tour_type: editingTour.tour_type || 'cultural',
        duration_hours: String(editingTour.duration_hours || '2'),
        price_per_person: String(editingTour.price_per_person || '1000'),
        currency: editingTour.currency || 'INR',
        max_group_size: String(editingTour.max_group_size || '10'),
        min_group_size: String(editingTour.min_group_size || '1'),
        difficulty_level: editingTour.difficulty_level || 'easy',
        meeting_point: editingTour.meeting_point || '',
        ending_point: editingTour.ending_point || '',
        included_items: editingTour.included_items || [],
        excluded_items: editingTour.excluded_items || [],
        requirements: editingTour.requirements || [],
        cancellation_policy: editingTour.cancellation_policy || 'Free cancellation up to 24 hours before the tour',
        featured_image: editingTour.featured_image || '',
        gallery_images: editingTour.gallery_images || [],
        location_city: editingTour.location_city || '',
        location_state: editingTour.location_state || '',
      });
    } else {
      setForm(DEFAULT_FORM);
    }
    setError('');
  }, [editingTour, isOpen]);

  const update = (field: keyof FormState, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const addItem = (field: 'included_items' | 'excluded_items' | 'requirements', value: string, setter: (v: string) => void) => {
    if (!value.trim()) return;
    update(field, [...form[field], value.trim()]);
    setter('');
  };

  const removeItem = (field: 'included_items' | 'excluded_items' | 'requirements', index: number) => {
    update(field, form[field].filter((_, i) => i !== index));
  };

  const addGalleryImage = () => {
    if (!newGalleryImage.trim()) return;
    update('gallery_images', [...form.gallery_images, newGalleryImage.trim()]);
    setNewGalleryImage('');
  };

  const removeGalleryImage = (index: number) => {
    update('gallery_images', form.gallery_images.filter((_, i) => i !== index));
  };

  const validate = (): string | null => {
    if (!form.title.trim()) return 'Title is required';
    if (!form.price_per_person || Number(form.price_per_person) < 0) return 'A valid price is required';
    if (!form.duration_hours || Number(form.duration_hours) <= 0) return 'Duration must be greater than 0';
    if (Number(form.max_group_size) < Number(form.min_group_size)) return 'Max group size cannot be less than min group size';
    return null;
  };

  const handleSubmit = async () => {
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setSaving(true);
    setError('');

    const payload = {
      guide_id: guideId,
      title: form.title.trim(),
      description: form.description.trim(),
      tour_type: form.tour_type,
      duration_hours: Number(form.duration_hours),
      price_per_person: Number(form.price_per_person),
      currency: form.currency,
      max_group_size: Number(form.max_group_size),
      min_group_size: Number(form.min_group_size),
      difficulty_level: form.difficulty_level,
      meeting_point: form.meeting_point.trim(),
      ending_point: form.ending_point.trim(),
      included_items: form.included_items,
      excluded_items: form.excluded_items,
      requirements: form.requirements,
      cancellation_policy: form.cancellation_policy.trim() || 'Free cancellation up to 24 hours before the tour',
      featured_image: form.featured_image.trim() || null,
      gallery_images: form.gallery_images,
      location_city: form.location_city.trim(),
      location_state: form.location_state.trim(),
      is_active: true,
      is_featured: false,
    };

    try {
      const { supabase } = await import('../shared/supabase');

      if (editingTour) {
        const { error: updateError } = await supabase
          .from('tours')
          .update({
            title: payload.title,
            description: payload.description,
            tour_type: payload.tour_type,
            duration_hours: payload.duration_hours,
            price_per_person: payload.price_per_person,
            currency: payload.currency,
            max_group_size: payload.max_group_size,
            min_group_size: payload.min_group_size,
            difficulty_level: payload.difficulty_level,
            meeting_point: payload.meeting_point,
            ending_point: payload.ending_point,
            included_items: payload.included_items,
            excluded_items: payload.excluded_items,
            requirements: payload.requirements,
            cancellation_policy: payload.cancellation_policy,
            featured_image: payload.featured_image,
            gallery_images: payload.gallery_images,
            location_city: payload.location_city,
            location_state: payload.location_state,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingTour.id);

        if (updateError) {
          console.error('[GuideExperienceModal] Failed to update tour:', {
            code: updateError.code, message: updateError.message,
            details: updateError.details, hint: updateError.hint,
          });
          throw updateError;
        }
      } else {
        const { error: insertError } = await supabase
          .from('tours')
          .insert([payload]);

        if (insertError) {
          console.error('[GuideExperienceModal] Failed to create tour:', {
            code: insertError.code, message: insertError.message,
            details: insertError.details, hint: insertError.hint,
          });
          throw insertError;
        }
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      const userMsg = err?.code === '42501'
        ? 'You do not have permission to save this experience. Only approved guides can create experiences.'
        : 'Something went wrong while saving your experience. Please try again.';
      setError(userMsg);
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  const inputClass = 'w-full bg-[#0a150a] border border-[#1a3020] text-[#f5f0e8] px-4 py-3 font-light text-sm focus:outline-none focus:border-[#c9a84a]/40 transition-colors duration-300 placeholder:text-[#3a5a3a]';
  const labelClass = 'font-jetbrains text-[9px] text-[#7a9a7a] tracking-widest uppercase block mb-2';
  const sectionClass = 'border border-[#1a3020] p-5';

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#0d1a0d] border border-[#1a3020] max-w-2xl w-full my-8">

        <div className="flex items-start justify-between p-6 border-b border-[#1a3020] sticky top-0 bg-[#0d1a0d] z-10">
          <div>
            <p className="font-jetbrains text-[9px] text-[#c9a84a]/50 tracking-widest uppercase mb-1">
              {editingTour ? 'Edit Experience' : 'Create Experience'}
            </p>
            <p className="font-display text-lg font-light text-[#f5f0e8]">
              {editingTour ? 'Update your offering' : 'Add a new bookable experience'}
            </p>
          </div>
          <button onClick={onClose} className="text-[#7a9a7a] hover:text-[#f5f0e8] transition-colors duration-300 mt-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">

          {/* Basic Info */}
          <div className={sectionClass}>
            <p className="font-jetbrains text-[9px] text-[#c9a84a]/50 tracking-widest uppercase mb-4">Basic Information</p>
            <div className="space-y-4">
              <div>
                <label className={labelClass}>Title *</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={e => update('title', e.target.value)}
                  placeholder="e.g. Hidden Temples of Old Pune"
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Description</label>
                <textarea
                  value={form.description}
                  onChange={e => update('description', e.target.value)}
                  rows={3}
                  placeholder="Describe what makes this experience unique..."
                  className={`${inputClass} resize-none`}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Tour Type</label>
                  <select
                    value={form.tour_type}
                    onChange={e => update('tour_type', e.target.value)}
                    className={inputClass}
                  >
                    {TOUR_TYPES.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Duration (hours) *</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0.5"
                    value={form.duration_hours}
                    onChange={e => update('duration_hours', e.target.value)}
                    className={inputClass}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className={sectionClass}>
            <p className="font-jetbrains text-[9px] text-[#c9a84a]/50 tracking-widest uppercase mb-4">Pricing</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Price Per Person *</label>
                <input
                  type="number"
                  min="0"
                  value={form.price_per_person}
                  onChange={e => update('price_per_person', e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Currency</label>
                <select
                  value={form.currency}
                  onChange={e => update('currency', e.target.value)}
                  className={inputClass}
                >
                  {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Group & Difficulty */}
          <div className={sectionClass}>
            <p className="font-jetbrains text-[9px] text-[#c9a84a]/50 tracking-widest uppercase mb-4">Group & Difficulty</p>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className={labelClass}>Min Group</label>
                <input
                  type="number"
                  min="1"
                  value={form.min_group_size}
                  onChange={e => update('min_group_size', e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Max Group</label>
                <input
                  type="number"
                  min="1"
                  value={form.max_group_size}
                  onChange={e => update('max_group_size', e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Difficulty</label>
                <select
                  value={form.difficulty_level}
                  onChange={e => update('difficulty_level', e.target.value)}
                  className={inputClass}
                >
                  {DIFFICULTY_LEVELS.map(d => <option key={d} value={d}>{d.charAt(0).toUpperCase() + d.slice(1)}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Location */}
          <div className={sectionClass}>
            <p className="font-jetbrains text-[9px] text-[#c9a84a]/50 tracking-widest uppercase mb-4">Location</p>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className={labelClass}>City</label>
                <input
                  type="text"
                  value={form.location_city}
                  onChange={e => update('location_city', e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>State</label>
                <input
                  type="text"
                  value={form.location_state}
                  onChange={e => update('location_state', e.target.value)}
                  className={inputClass}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Meeting Point</label>
                <input
                  type="text"
                  value={form.meeting_point}
                  onChange={e => update('meeting_point', e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Ending Point</label>
                <input
                  type="text"
                  value={form.ending_point}
                  onChange={e => update('ending_point', e.target.value)}
                  className={inputClass}
                />
              </div>
            </div>
          </div>

          {/* Included / Excluded / Requirements */}
          <div className={sectionClass}>
            <p className="font-jetbrains text-[9px] text-[#c9a84a]/50 tracking-widest uppercase mb-4">What's Included / Excluded / Required</p>

            {/* Included */}
            <div className="mb-4">
              <label className={labelClass}>Included Items</label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={newIncluded}
                  onChange={e => setNewIncluded(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addItem('included_items', newIncluded, setNewIncluded); } }}
                  placeholder="e.g. Local guide, Entry tickets"
                  className={inputClass}
                />
                <button
                  onClick={() => addItem('included_items', newIncluded, setNewIncluded)}
                  className="flex-shrink-0 w-10 h-10 border border-[#1a3020] text-[#7a9a7a] hover:text-[#c9a84a] hover:border-[#c9a84a]/30 transition-colors duration-300 flex items-center justify-center"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              {form.included_items.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {form.included_items.map((item, i) => (
                    <span key={i} className="flex items-center gap-1 font-jetbrains text-[8px] text-[#7a9a7a] border border-[#1a3020] px-2 py-1 tracking-widest uppercase">
                      {item}
                      <button onClick={() => removeItem('included_items', i)} className="text-[#3a5a3a] hover:text-red-400/60">
                        <Trash2 className="w-2.5 h-2.5" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Excluded */}
            <div className="mb-4">
              <label className={labelClass}>Excluded Items</label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={newExcluded}
                  onChange={e => setNewExcluded(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addItem('excluded_items', newExcluded, setNewExcluded); } }}
                  placeholder="e.g. Transportation, Personal expenses"
                  className={inputClass}
                />
                <button
                  onClick={() => addItem('excluded_items', newExcluded, setNewExcluded)}
                  className="flex-shrink-0 w-10 h-10 border border-[#1a3020] text-[#7a9a7a] hover:text-[#c9a84a] hover:border-[#c9a84a]/30 transition-colors duration-300 flex items-center justify-center"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              {form.excluded_items.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {form.excluded_items.map((item, i) => (
                    <span key={i} className="flex items-center gap-1 font-jetbrains text-[8px] text-[#7a9a7a] border border-[#1a3020] px-2 py-1 tracking-widest uppercase">
                      {item}
                      <button onClick={() => removeItem('excluded_items', i)} className="text-[#3a5a3a] hover:text-red-400/60">
                        <Trash2 className="w-2.5 h-2.5" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Requirements */}
            <div>
              <label className={labelClass}>Requirements</label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={newRequirement}
                  onChange={e => setNewRequirement(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addItem('requirements', newRequirement, setNewRequirement); } }}
                  placeholder="e.g. Comfortable shoes, Water bottle"
                  className={inputClass}
                />
                <button
                  onClick={() => addItem('requirements', newRequirement, setNewRequirement)}
                  className="flex-shrink-0 w-10 h-10 border border-[#1a3020] text-[#7a9a7a] hover:text-[#c9a84a] hover:border-[#c9a84a]/30 transition-colors duration-300 flex items-center justify-center"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              {form.requirements.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {form.requirements.map((item, i) => (
                    <span key={i} className="flex items-center gap-1 font-jetbrains text-[8px] text-[#7a9a7a] border border-[#1a3020] px-2 py-1 tracking-widest uppercase">
                      {item}
                      <button onClick={() => removeItem('requirements', i)} className="text-[#3a5a3a] hover:text-red-400/60">
                        <Trash2 className="w-2.5 h-2.5" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Cancellation Policy */}
          <div className={sectionClass}>
            <label className={labelClass}>Cancellation Policy</label>
            <textarea
              value={form.cancellation_policy}
              onChange={e => update('cancellation_policy', e.target.value)}
              rows={2}
              className={`${inputClass} resize-none`}
            />
          </div>

          {/* Images */}
          <div className={sectionClass}>
            <p className="font-jetbrains text-[9px] text-[#c9a84a]/50 tracking-widest uppercase mb-4">Images</p>
            <div className="mb-4">
              <label className={labelClass}>Featured Image URL</label>
              <input
                type="text"
                value={form.featured_image}
                onChange={e => update('featured_image', e.target.value)}
                placeholder="https://..."
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Gallery Images</label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={newGalleryImage}
                  onChange={e => setNewGalleryImage(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addGalleryImage(); } }}
                  placeholder="https://..."
                  className={inputClass}
                />
                <button
                  onClick={addGalleryImage}
                  className="flex-shrink-0 w-10 h-10 border border-[#1a3020] text-[#7a9a7a] hover:text-[#c9a84a] hover:border-[#c9a84a]/30 transition-colors duration-300 flex items-center justify-center"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              {form.gallery_images.length > 0 && (
                <div className="space-y-1.5">
                  {form.gallery_images.map((url, i) => (
                    <div key={i} className="flex items-center justify-between gap-2 border border-[#1a3020] px-3 py-2">
                      <span className="text-[#7a9a7a] text-xs font-light truncate flex-1">{url}</span>
                      <button onClick={() => removeGalleryImage(i)} className="text-[#3a5a3a] hover:text-red-400/60 flex-shrink-0">
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {error && (
            <p className="font-jetbrains text-[9px] text-red-400/70 tracking-widest">{error}</p>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-[#1a3020] sticky bottom-0 bg-[#0d1a0d]">
          <button
            onClick={onClose}
            className="font-jetbrains text-[10px] tracking-widest text-[#7a9a7a] hover:text-[#f5f0e8] transition-colors duration-300"
          >
            CANCEL
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="flex items-center gap-2 font-jetbrains text-[10px] tracking-widest text-[#0d1a0d] bg-[#c9a84a] px-6 py-2 hover:bg-[#d4b660] transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <>
                <div className="w-3 h-3 border border-[#0d1a0d]/30 border-t-[#0d1a0d] rounded-full animate-spin" />
                SAVING...
              </>
            ) : (
              <>
                <Save className="w-3 h-3" />
                {editingTour ? 'UPDATE EXPERIENCE' : 'CREATE EXPERIENCE'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default GuideExperienceModal;
