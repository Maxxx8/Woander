import React, { useState } from 'react';
import { X, MapPin, Image as ImageIcon, Info, Mountain, Upload, Loader, Check } from 'lucide-react';
import { supabase } from '../shared/supabase';
import { useAuth } from '../shared/AuthContext';

interface AddGemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const inputStyle: React.CSSProperties = {
  backgroundColor: 'transparent',
  border: '1px solid rgba(38,61,53,0.15)',
  borderRadius: '6px',
  padding: '12px 14px',
  fontFamily: 'Inter, system-ui, sans-serif',
  fontSize: '14px',
  fontWeight: 300,
  color: '#263D35',
  outline: 'none',
  transition: 'border-color 0.3s',
  width: '100%',
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontFamily: 'JetBrains Mono, Menlo, monospace',
  fontSize: '9px',
  letterSpacing: '0.15em',
  textTransform: 'uppercase',
  color: 'rgba(48,51,47,0.5)',
  marginBottom: '8px',
};

const AddGemModal: React.FC<AddGemModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [uploadMethod, setUploadMethod] = useState<'url' | 'upload'>('upload');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [selectedAttributes, setSelectedAttributes] = useState<string[]>([]);
  const [selectedEvidence, setSelectedEvidence] = useState<string[]>([]);
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

  const attributeOptions = [
    { value: 'historical', label: 'Historical' },
    { value: 'archaeological', label: 'Archaeological' },
    { value: 'cultural', label: 'Cultural' },
    { value: 'natural', label: 'Natural' },
    { value: 'living_heritage', label: 'Living Heritage' },
    { value: 'ancestral', label: 'Ancestral' },
    { value: 'community', label: 'Community' },
    { value: 'hidden', label: 'Hidden' },
  ];

  const evidenceOptions = [
    { value: 'archaeologically_documented', label: 'Archaeologically documented' },
    { value: 'officially_documented', label: 'Officially documented' },
    { value: 'scholarly_interpretation', label: 'Scholarly interpretation' },
    { value: 'community_memory', label: 'Community memory' },
    { value: 'explorer_observation', label: 'Explorer observation' },
  ];

  const toggleAttribute = (value: string) => {
    setSelectedAttributes(prev => prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]);
  };

  const toggleEvidence = (value: string) => {
    setSelectedEvidence(prev => prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]);
  };

  const categories = [
    { value: 'cafe', label: 'Café' },
    { value: 'viewpoint', label: 'Viewpoint' },
    { value: 'waterfall', label: 'Waterfall' },
    { value: 'trail', label: 'Trail' },
    { value: 'beach', label: 'Beach' },
    { value: 'other', label: 'Other' }
  ];

  const difficulties = [
    { value: 'easy', label: 'Easy', description: 'Accessible to most' },
    { value: 'moderate', label: 'Moderate', description: 'Some effort' },
    { value: 'challenging', label: 'Challenging', description: 'Experienced' }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be less than 5MB.');
      return;
    }
    setError('');
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setPreviewUrl(reader.result as string);
    reader.readAsDataURL(file);
  };

  const uploadImage = async (): Promise<string> => {
    if (!selectedFile || !user) throw new Error('No file selected or user not authenticated');
    setUploading(true);
    try {
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from('gem-images')
        .upload(fileName, selectedFile, { cacheControl: '3600', upsert: false });
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage.from('gem-images').getPublicUrl(fileName);
      return publicUrl;
    } finally {
      setUploading(false);
    }
  };

  const validateForm = () => {
    if (!formData.title.trim()) { setError('Please enter a title.'); return false; }
    if (!formData.description.trim() || formData.description.length < 50) {
      setError('Please provide a detailed description (at least 50 characters).'); return false;
    }
    if (!formData.location.trim()) { setError('Please enter a location.'); return false; }
    if (uploadMethod === 'upload' && !selectedFile) { setError('Please select an image.'); return false; }
    if (uploadMethod === 'url' && !formData.image_url.trim()) { setError('Please provide an image URL.'); return false; }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) { setError('Please sign in to add to the record.'); return; }
    if (!validateForm()) return;
    setError('');
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
        verification_status: 'pending',
        place_attributes: selectedAttributes,
        evidence_labels: selectedEvidence,
      };

      const { error: gemError } = await supabase.from('hidden_gems').insert(gemData);
      if (gemError) throw gemError;

      const { data: contribution } = await supabase
        .from('user_contributions')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (contribution) {
        await supabase
          .from('user_contributions')
          .update({ gems_discovered: contribution.gems_discovered + 1, updated_at: new Date().toISOString() })
          .eq('user_id', user.id);
      } else {
        await supabase
          .from('user_contributions')
          .insert({ user_id: user.id, gems_discovered: 1, gems_verified: 0, total_votes_received: 0, explorer_level: 1 });
      }

      setSuccess(true);
      setTimeout(() => {
        setFormData({ title: '', description: '', location: '', latitude: '', longitude: '', category: 'other', difficulty_level: 'easy', image_url: '', best_time_to_visit: '', tips: '' });
        setSelectedAttributes([]);
        setSelectedEvidence([]);
        setSelectedFile(null);
        setPreviewUrl('');
        setUploadMethod('upload');
        setSuccess(false);
        onSuccess();
        onClose();
      }, 1500);
    } catch (err: unknown) {
      console.error('Error submitting Worthy Place:', err);
      const message = err instanceof Error ? err.message.toLowerCase() : '';
      if (message.includes('bucket') || message.includes('storage')) {
        setError('The photo could not be uploaded. Please choose another image and try again.');
      } else if (message.includes('row-level security') || message.includes('permission')) {
        setError('Your session does not have permission to add this place. Please sign in again and retry.');
      } else {
        setError('Unable to save this place right now. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-start justify-center min-h-screen p-4 sm:p-6">
        <div
          className="fixed inset-0"
          style={{ backgroundColor: 'rgba(38,61,53,0.85)', backdropFilter: 'blur(4px)' }}
          onClick={onClose}
        />

        <div
          className="relative w-full max-w-2xl my-8 p-8 sm:p-10 max-h-[90vh] overflow-y-auto"
          style={{ backgroundColor: '#F6F2E9', border: '1px solid rgba(38,61,53,0.1)', borderRadius: '12px', boxShadow: '0 16px 48px rgba(38,61,53,0.2)' }}
        >
          <button
            onClick={onClose}
            className="absolute top-5 right-5 transition-colors duration-300"
            style={{ color: 'rgba(48,51,47,0.4)' }}
            onMouseEnter={(e) => { e.currentTarget.style.color = '#263D35'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(48,51,47,0.4)'; }}
          >
            <X className="h-5 w-5" strokeWidth={1.5} />
          </button>

          {/* Header */}
          <div className="mb-8">
            <p className="font-mono text-[10px] tracking-[0.2em] uppercase mb-3" style={{ color: 'rgba(48,51,47,0.4)' }}>Add to the Record</p>
            <h2 className="font-display text-3xl font-light mb-2" style={{ color: '#263D35' }}>
              Add to the <em className="italic" style={{ color: '#B77B65' }}>record.</em>
            </h2>
            <p className="text-sm font-light" style={{ color: 'rgba(48,51,47,0.5)' }}>
              Know something about this place that the map doesn&rsquo;t yet know?
            </p>
          </div>

          {success ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div
                className="flex items-center justify-center mb-6 animate-discovery-pulse"
                style={{
                  width: '56px', height: '56px', borderRadius: '50%',
                  border: '1px solid rgba(201,168,74,0.3)',
                  background: 'radial-gradient(circle, rgba(201,168,74,0.1) 0%, transparent 70%)',
                }}
              >
                <Check className="w-6 h-6" style={{ color: '#B69A63' }} strokeWidth={1.5} />
              </div>
              <p className="font-display text-2xl font-light mb-2" style={{ color: '#263D35' }}>
                You added a piece to the record.
              </p>
              <p className="font-display italic text-sm font-light" style={{ color: 'rgba(48,51,47,0.45)' }}>
                Your contribution will appear once reviewed.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="flex items-center gap-2 px-4 py-3" style={{ border: '1px solid rgba(185,120,98,0.2)', backgroundColor: 'rgba(185,120,98,0.05)', borderRadius: '6px' }}>
                  <Info className="w-4 h-4 flex-shrink-0" style={{ color: '#B97862' }} strokeWidth={1.5} />
                  <p className="text-sm font-light" style={{ color: '#B97862' }}>{error}</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label style={labelStyle}>Title *</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="e.g., Secret Waterfall Trail"
                    style={inputStyle}
                    onFocus={(e) => e.currentTarget.style.borderColor = 'rgba(182,154,99,0.4)'}
                    onBlur={(e) => e.currentTarget.style.borderColor = 'rgba(38,61,53,0.15)'}
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label style={labelStyle}>
                    Description * <span style={{ textTransform: 'none', letterSpacing: '0', color: 'rgba(48,51,47,0.35)' }}>(min 50 characters)</span>
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Describe what makes this place special, what visitors can expect, and why it's worth discovering..."
                    rows={4}
                    style={{ ...inputStyle, resize: 'none' }}
                    onFocus={(e) => e.currentTarget.style.borderColor = 'rgba(182,154,99,0.4)'}
                    onBlur={(e) => e.currentTarget.style.borderColor = 'rgba(38,61,53,0.15)'}
                    required
                  />
                  <p className="font-mono text-[9px] mt-1" style={{ color: 'rgba(48,51,47,0.3)' }}>{formData.description.length} characters</p>
                </div>

                <div>
                  <label style={labelStyle}>Location *</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: 'rgba(48,51,47,0.3)' }} strokeWidth={1.5} />
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      placeholder="City, State/Region"
                      style={{ ...inputStyle, paddingLeft: '36px' }}
                      onFocus={(e) => e.currentTarget.style.borderColor = 'rgba(182,154,99,0.4)'}
                      onBlur={(e) => e.currentTarget.style.borderColor = 'rgba(38,61,53,0.15)'}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label style={labelStyle}>Category *</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    style={{ ...inputStyle, cursor: 'pointer' }}
                    required
                  >
                    {categories.map(cat => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={labelStyle}>Latitude <span style={{ textTransform: 'none', letterSpacing: '0', color: 'rgba(48,51,47,0.35)' }}>(optional)</span></label>
                  <input
                    type="number"
                    step="any"
                    name="latitude"
                    value={formData.latitude}
                    onChange={handleInputChange}
                    placeholder="e.g., 12.9716"
                    style={inputStyle}
                    onFocus={(e) => e.currentTarget.style.borderColor = 'rgba(182,154,99,0.4)'}
                    onBlur={(e) => e.currentTarget.style.borderColor = 'rgba(38,61,53,0.15)'}
                  />
                </div>

                <div>
                  <label style={labelStyle}>Longitude <span style={{ textTransform: 'none', letterSpacing: '0', color: 'rgba(48,51,47,0.35)' }}>(optional)</span></label>
                  <input
                    type="number"
                    step="any"
                    name="longitude"
                    value={formData.longitude}
                    onChange={handleInputChange}
                    placeholder="e.g., 77.5946"
                    style={inputStyle}
                    onFocus={(e) => e.currentTarget.style.borderColor = 'rgba(182,154,99,0.4)'}
                    onBlur={(e) => e.currentTarget.style.borderColor = 'rgba(38,61,53,0.15)'}
                  />
                </div>

                <div className="md:col-span-2">
                  <label style={labelStyle}>Difficulty Level *</label>
                  <div className="grid grid-cols-3 gap-3">
                    {difficulties.map(diff => (
                      <button
                        key={diff.value}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, difficulty_level: diff.value }))}
                        className="flex flex-col items-center text-center p-4 transition-all duration-300"
                        style={{
                          border: formData.difficulty_level === diff.value
                            ? '1px solid rgba(182,154,99,0.4)'
                            : '1px solid rgba(38,61,53,0.12)',
                          backgroundColor: formData.difficulty_level === diff.value ? 'rgba(182,154,99,0.06)' : 'transparent',
                          borderRadius: '6px',
                          cursor: 'pointer',
                        }}
                      >
                        <Mountain
                          className="h-4 w-4 mb-2"
                          style={{ color: formData.difficulty_level === diff.value ? '#B69A63' : 'rgba(48,51,47,0.3)' }}
                          strokeWidth={1.5}
                        />
                        <span className="font-display text-sm font-light" style={{ color: formData.difficulty_level === diff.value ? '#263D35' : 'rgba(48,51,47,0.5)' }}>{diff.label}</span>
                        <span className="font-mono text-[8px] tracking-wider mt-1" style={{ color: 'rgba(48,51,47,0.35)' }}>{diff.description}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Place Attributes */}
                <div className="md:col-span-2">
                  <label style={labelStyle}>Place Attributes <span style={{ textTransform: 'none', letterSpacing: '0', color: 'rgba(48,51,47,0.35)' }}>(optional — select all that apply)</span></label>
                  <div className="flex flex-wrap gap-2">
                    {attributeOptions.map((attr) => {
                      const selected = selectedAttributes.includes(attr.value);
                      return (
                        <button
                          key={attr.value}
                          type="button"
                          onClick={() => toggleAttribute(attr.value)}
                          className="font-mono text-[9px] tracking-[0.12em] uppercase px-3 py-2 transition-all duration-300"
                          style={{
                            border: selected ? '1px solid rgba(182,154,99,0.4)' : '1px solid rgba(38,61,53,0.12)',
                            backgroundColor: selected ? 'rgba(182,154,99,0.06)' : 'transparent',
                            color: selected ? '#263D35' : 'rgba(48,51,47,0.5)',
                            borderRadius: '4px',
                            cursor: 'pointer',
                          }}
                        >
                          {attr.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Evidence */}
                <div className="md:col-span-2">
                  <label style={labelStyle}>How do we know? <span style={{ textTransform: 'none', letterSpacing: '0', color: 'rgba(48,51,47,0.35)' }}>(optional — select all that apply)</span></label>
                  <div className="flex flex-wrap gap-2">
                    {evidenceOptions.map((ev) => {
                      const selected = selectedEvidence.includes(ev.value);
                      return (
                        <button
                          key={ev.value}
                          type="button"
                          onClick={() => toggleEvidence(ev.value)}
                          className="font-mono text-[9px] tracking-[0.12em] uppercase px-3 py-2 transition-all duration-300"
                          style={{
                            border: selected ? '1px solid rgba(182,154,99,0.4)' : '1px solid rgba(38,61,53,0.12)',
                            backgroundColor: selected ? 'rgba(182,154,99,0.06)' : 'transparent',
                            color: selected ? '#263D35' : 'rgba(48,51,47,0.5)',
                            borderRadius: '4px',
                            cursor: 'pointer',
                          }}
                        >
                          {ev.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label style={labelStyle}>Image *</label>
                  <div className="flex gap-2 mb-4">
                    <button
                      type="button"
                      onClick={() => setUploadMethod('upload')}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 font-mono text-[9px] tracking-[0.15em] uppercase transition-all duration-300"
                      style={{
                        border: uploadMethod === 'upload' ? '1px solid rgba(182,154,99,0.4)' : '1px solid rgba(38,61,53,0.12)',
                        backgroundColor: uploadMethod === 'upload' ? 'rgba(182,154,99,0.06)' : 'transparent',
                        color: uploadMethod === 'upload' ? '#263D35' : 'rgba(48,51,47,0.5)',
                        borderRadius: '6px',
                        cursor: 'pointer',
                      }}
                    >
                      <Upload className="h-3.5 w-3.5" strokeWidth={1.5} />
                      Upload from Device
                    </button>
                    <button
                      type="button"
                      onClick={() => setUploadMethod('url')}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 font-mono text-[9px] tracking-[0.15em] uppercase transition-all duration-300"
                      style={{
                        border: uploadMethod === 'url' ? '1px solid rgba(182,154,99,0.4)' : '1px solid rgba(38,61,53,0.12)',
                        backgroundColor: uploadMethod === 'url' ? 'rgba(182,154,99,0.06)' : 'transparent',
                        color: uploadMethod === 'url' ? '#263D35' : 'rgba(48,51,47,0.5)',
                        borderRadius: '6px',
                        cursor: 'pointer',
                      }}
                    >
                      <ImageIcon className="h-3.5 w-3.5" strokeWidth={1.5} />
                      Image URL
                    </button>
                  </div>

                  {uploadMethod === 'upload' ? (
                    <div>
                      <input type="file" accept="image/*" onChange={handleFileSelect} className="hidden" id="image-upload" />
                      <label
                        htmlFor="image-upload"
                        className="flex flex-col items-center justify-center w-full h-36 cursor-pointer transition-all duration-300"
                        style={{
                          border: '2px dashed',
                          borderColor: previewUrl ? 'rgba(182,154,99,0.3)' : 'rgba(38,61,53,0.15)',
                          borderRadius: '8px',
                          overflow: 'hidden',
                        }}
                      >
                        {previewUrl ? (
                          <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                        ) : (
                          <div className="flex flex-col items-center">
                            <Upload className="h-8 w-8 mb-2" style={{ color: 'rgba(48,51,47,0.25)' }} strokeWidth={1} />
                            <p className="font-mono text-[9px] tracking-[0.15em] uppercase mb-1" style={{ color: 'rgba(48,51,47,0.4)' }}>Click to upload</p>
                            <p className="font-mono text-[8px]" style={{ color: 'rgba(48,51,47,0.3)' }}>PNG, JPG, WEBP up to 5MB</p>
                          </div>
                        )}
                      </label>
                      {selectedFile && (
                        <p className="font-mono text-[9px] mt-2" style={{ color: 'rgba(48,51,47,0.4)' }}>
                          {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="relative">
                      <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: 'rgba(48,51,47,0.3)' }} strokeWidth={1.5} />
                      <input
                        type="url"
                        name="image_url"
                        value={formData.image_url}
                        onChange={handleInputChange}
                        placeholder="https://example.com/image.jpg"
                        style={{ ...inputStyle, paddingLeft: '36px' }}
                        onFocus={(e) => e.currentTarget.style.borderColor = 'rgba(182,154,99,0.4)'}
                        onBlur={(e) => e.currentTarget.style.borderColor = 'rgba(38,61,53,0.15)'}
                      />
                    </div>
                  )}
                </div>

                <div>
                  <label style={labelStyle}>Best Time to Visit <span style={{ textTransform: 'none', letterSpacing: '0', color: 'rgba(48,51,47,0.35)' }}>(optional)</span></label>
                  <input
                    type="text"
                    name="best_time_to_visit"
                    value={formData.best_time_to_visit}
                    onChange={handleInputChange}
                    placeholder="e.g., October to March"
                    style={inputStyle}
                    onFocus={(e) => e.currentTarget.style.borderColor = 'rgba(182,154,99,0.4)'}
                    onBlur={(e) => e.currentTarget.style.borderColor = 'rgba(38,61,53,0.15)'}
                  />
                </div>

                <div>
                  <label style={labelStyle}>Insider Tips <span style={{ textTransform: 'none', letterSpacing: '0', color: 'rgba(48,51,47,0.35)' }}>(optional)</span></label>
                  <input
                    type="text"
                    name="tips"
                    value={formData.tips}
                    onChange={handleInputChange}
                    placeholder="e.g., Arrive early to avoid crowds"
                    style={inputStyle}
                    onFocus={(e) => e.currentTarget.style.borderColor = 'rgba(182,154,99,0.4)'}
                    onBlur={(e) => e.currentTarget.style.borderColor = 'rgba(38,61,53,0.15)'}
                  />
                </div>
              </div>

              {/* Guidelines */}
              <div className="flex gap-3 p-4" style={{ border: '1px solid rgba(38,61,53,0.08)', backgroundColor: '#FBF8F1', borderRadius: '6px' }}>
                <Info className="h-4 w-4 flex-shrink-0 mt-0.5" style={{ color: 'rgba(48,51,47,0.35)' }} strokeWidth={1.5} />
                <div className="text-xs font-light" style={{ color: 'rgba(48,51,47,0.5)' }}>
                  <p className="font-mono text-[9px] tracking-[0.15em] uppercase mb-2" style={{ color: 'rgba(48,51,47,0.4)' }}>Submission Guidelines</p>
                  <ul className="space-y-1 list-disc list-inside">
                    <li>Your contribution will be reviewed before appearing publicly</li>
                    <li>Only submit places you have personally visited</li>
                    <li>Respect local communities and private property</li>
                  </ul>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-6 py-3 font-mono text-[10px] tracking-[0.15em] uppercase transition-all duration-300"
                  style={{ border: '1px solid rgba(38,61,53,0.15)', color: 'rgba(48,51,47,0.5)', borderRadius: '6px', cursor: 'pointer' }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(38,61,53,0.3)'; e.currentTarget.style.color = '#263D35'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(38,61,53,0.15)'; e.currentTarget.style.color = 'rgba(48,51,47,0.5)'; }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || uploading}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 font-mono text-[10px] tracking-[0.15em] uppercase transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ backgroundColor: '#263D35', color: '#F6F2E9', border: '1px solid #263D35', borderRadius: '6px', cursor: 'pointer' }}
                  onMouseEnter={(e) => { if (!loading) { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#263D35'; } }}
                  onMouseLeave={(e) => { if (!loading) { e.currentTarget.style.backgroundColor = '#263D35'; e.currentTarget.style.color = '#F6F2E9'; } }}
                >
                  {loading || uploading ? (
                    <><Loader className="h-4 w-4 animate-spin" /> {uploading ? 'Uploading...' : 'Submitting...'}</>
                  ) : (
                    <>Add to the Record</>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddGemModal;
