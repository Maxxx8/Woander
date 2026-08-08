import React, { useState, useEffect } from 'react';
import { X, Upload, Plus, Trash2, CheckCircle, AlertCircle, Loader, Clock, XCircle } from 'lucide-react';
import { useAuth } from '../shared/AuthContext';
import { vanguardService } from '../services/vanguardService';

interface TourGuideApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const TourGuideApplicationModal: React.FC<TourGuideApplicationModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [existingApp, setExistingApp] = useState<any | null>(null);
  const [checkingExisting, setCheckingExisting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    full_name: '',
    bio: '',
    profile_image: '',
    phone: '',
    email: user?.email || '',
    location_city: '',
    location_state: '',
    location_country: 'India',
    years_experience: 1,
    archetype: '',
    languages: [] as string[],
    specialties: [] as string[],
    certifications: [] as Array<{ name: string; issuer: string; year: string }>,
  });

  const [newLanguage, setNewLanguage] = useState('');
  const [newSpecialty, setNewSpecialty] = useState('');
  const [newCert, setNewCert] = useState({ name: '', issuer: '', year: '' });

  const languageOptions = [
    'English', 'Hindi', 'Spanish', 'French', 'German',
    'Italian', 'Japanese', 'Mandarin', 'Portuguese', 'Arabic',
    'Bengali', 'Tamil', 'Telugu', 'Marathi', 'Gujarati'
  ];

  const specialtyOptions = [
    'cultural', 'adventure', 'food', 'history', 'nature',
    'photography', 'walking', 'cycling', 'wildlife', 'spiritual'
  ];

  const archetypeOptions = [
    'Historian', 'Pathfinder', 'Food Explorer', 'Naturalist',
    'Architect', 'Storykeeper', 'Photographer', 'Adventure Specialist',
  ];

  // Check for existing application when modal opens
  useEffect(() => {
    if (!isOpen || !user) return;
    let cancelled = false;
    setCheckingExisting(true);
    vanguardService.getTourGuideByUserId(user.id)
      .then((existing) => {
        if (!cancelled) setExistingApp(existing);
      })
      .catch(() => {
        if (!cancelled) setExistingApp(null);
      })
      .finally(() => {
        if (!cancelled) setCheckingExisting(false);
      });
    return () => { cancelled = true; };
  }, [isOpen, user]);

  if (!isOpen) return null;

  if (!user) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl max-w-md w-full p-8 text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Sign In Required</h3>
          <p className="text-gray-600 mb-6">
            You need to be signed in to apply as a Vanguard tour guide. Please sign in or create an account to continue.
          </p>
          <button
            onClick={onClose}
            className="px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-semibold"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  // Checking for existing application
  if (checkingExisting) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl max-w-md w-full p-8 text-center">
          <Loader className="w-8 h-8 text-teal-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Checking your application status...</p>
        </div>
      </div>
    );
  }

  // User already has an application on file
  if (existingApp) {
    const status = existingApp.status;
    const statusConfig: Record<string, { icon: React.ReactNode; color: string; label: string; message: string }> = {
      pending: {
        icon: <Clock className="w-10 h-10 text-amber-500" />,
        color: 'amber',
        label: 'Application Under Review',
        message: 'Your application is being reviewed by our team. You will be notified within 2-3 business days.',
      },
      approved: {
        icon: <CheckCircle className="w-10 h-10 text-green-600" />,
        color: 'green',
        label: 'Application Approved!',
        message: 'Congratulations! You are now a verified Vanguard local expert. Travelers can discover and book you.',
      },
      rejected: {
        icon: <XCircle className="w-10 h-10 text-red-500" />,
        color: 'red',
        label: 'Application Not Approved',
        message: 'Your application was not approved at this time. You can update your profile and apply again in the future.',
      },
      suspended: {
        icon: <AlertCircle className="w-10 h-10 text-orange-500" />,
        color: 'orange',
        label: 'Account Suspended',
        message: 'Your guide account has been suspended. Please contact support for more information.',
      },
    };

    const config = statusConfig[status] || statusConfig.pending;

    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl max-w-md w-full p-8 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            {config.icon}
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">{config.label}</h3>
          <p className="text-gray-600 mb-2">{config.message}</p>
          {existingApp.full_name && (
            <p className="text-sm text-gray-500 mb-6">Application for: <span className="font-semibold">{existingApp.full_name}</span></p>
          )}
          {status === 'rejected' && (
            <button
              onClick={() => {
                setExistingApp(null);
                // Pre-fill form with previous data so they can edit and resubmit
                setFormData(prev => ({
                  ...prev,
                  full_name: existingApp.full_name || '',
                  bio: existingApp.bio || '',
                  profile_image: existingApp.profile_image || '',
                  phone: existingApp.phone || '',
                  email: existingApp.email || user?.email || '',
                  location_city: existingApp.location_city || '',
                  location_state: existingApp.location_state || '',
                  location_country: existingApp.location_country || 'India',
                  years_experience: existingApp.years_experience || 1,
                  languages: existingApp.languages || [],
                  specialties: existingApp.specialties || [],
                  certifications: existingApp.certifications || [],
                }));
                setStep(1);
                setErrorMsg(null);
              }}
              className="px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-semibold mb-3"
            >
              Edit & Resubmit
            </button>
          )}
          <div>
            <button
              onClick={onClose}
              className="px-6 py-2 text-gray-700 hover:text-gray-900 transition-colors font-semibold"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const addLanguage = () => {
    if (newLanguage && !formData.languages.includes(newLanguage)) {
      setFormData(prev => ({
        ...prev,
        languages: [...prev.languages, newLanguage]
      }));
      setNewLanguage('');
    }
  };

  const removeLanguage = (lang: string) => {
    setFormData(prev => ({
      ...prev,
      languages: prev.languages.filter(l => l !== lang)
    }));
  };

  const addSpecialty = () => {
    if (newSpecialty && !formData.specialties.includes(newSpecialty)) {
      setFormData(prev => ({
        ...prev,
        specialties: [...prev.specialties, newSpecialty]
      }));
      setNewSpecialty('');
    }
  };

  const removeSpecialty = (specialty: string) => {
    setFormData(prev => ({
      ...prev,
      specialties: prev.specialties.filter(s => s !== specialty)
    }));
  };

  const addCertification = () => {
    if (newCert.name && newCert.issuer && newCert.year) {
      setFormData(prev => ({
        ...prev,
        certifications: [...prev.certifications, { ...newCert }]
      }));
      setNewCert({ name: '', issuer: '', year: '' });
    }
  };

  const removeCertification = (index: number) => {
    setFormData(prev => ({
      ...prev,
      certifications: prev.certifications.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async () => {
    if (!user) {
      setErrorMsg('Please sign in to apply as a tour guide');
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    try {
      const specialties = formData.archetype
        ? Array.from(new Set([...formData.specialties, formData.archetype]))
        : formData.specialties;

      const saved = await vanguardService.createTourGuide({
        user_id: user.id,
        full_name: formData.full_name,
        bio: formData.bio,
        profile_image: formData.profile_image || null,
        phone: formData.phone,
        email: formData.email,
        location_city: formData.location_city,
        location_state: formData.location_state,
        location_country: formData.location_country,
        years_experience: formData.years_experience,
        languages: formData.languages,
        specialties,
        certifications: formData.certifications,
      });

      console.log('[GuideApplication] Submission confirmed by Supabase, row id:', saved.id);
      setSubmitted(true);
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 3000);
    } catch (error: any) {
      console.error('[GuideApplication] Submission failed:', error?.code, error?.message);
      // 23505 = unique_violation — user already has an application
      if (error?.code === '23505' || error?.message?.includes('duplicate') || error?.message?.includes('unique')) {
        setErrorMsg('You have already submitted an application. We are checking your existing application status...');
        // Re-check for the existing app
        try {
          const existing = await vanguardService.getTourGuideByUserId(user.id);
          if (existing) setExistingApp(existing);
        } catch { /* ignore */ }
      } else {
        setErrorMsg(error.message || 'Failed to submit application. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    setErrorMsg(null);
    if (step === 1) {
      if (!formData.full_name || !formData.email || !formData.phone) {
        setErrorMsg('Please fill in all required fields');
        return;
      }
    }
    if (step === 2) {
      if (!formData.location_city || !formData.location_state) {
        setErrorMsg('Please fill in your location details');
        return;
      }
    }
    if (step === 3) {
      if (formData.languages.length === 0 || formData.specialties.length === 0) {
        setErrorMsg('Please add at least one language and one specialty');
        return;
      }
    }
    setStep(prev => prev + 1);
  };

  const prevStep = () => {
    setErrorMsg(null);
    setStep(prev => prev - 1);
  };

  if (submitted) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl max-w-md w-full p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Application Submitted!</h3>
          <p className="text-gray-600 mb-6">
            Thank you for applying to become a Vanguard tour guide. We'll review your application
            and get back to you within 2-3 business days.
          </p>
          <p className="text-sm text-gray-500">
            You'll receive an email notification once your application is reviewed.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full my-8">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Join the Vanguard Network</h2>
            <p className="text-sm text-gray-600 mt-1">Step {step} of 4</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          <div className="flex mb-8">
            {[1, 2, 3, 4].map((s) => (
              <div
                key={s}
                className={`flex-1 h-2 mx-1 rounded-full ${
                  s <= step ? 'bg-teal-600' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>

          {errorMsg && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
              <p className="text-red-700 text-sm">{errorMsg}</p>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Personal Information</h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="Your full name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="your.email@example.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="+91 9876543210"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Profile Image URL
                </label>
                <input
                  type="url"
                  name="profile_image"
                  value={formData.profile_image}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="https://example.com/your-photo.jpg"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Enter a URL to your professional photo
                </p>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Location & Experience</h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  City <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="location_city"
                  value={formData.location_city}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="Mumbai"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  State <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="location_state"
                  value={formData.location_state}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="Maharashtra"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Country
                </label>
                <input
                  type="text"
                  name="location_country"
                  value={formData.location_country}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="India"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Years of Experience
                </label>
                <input
                  type="number"
                  name="years_experience"
                  value={formData.years_experience}
                  onChange={handleInputChange}
                  min="0"
                  max="50"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Explorer Archetype
                </label>
                <select
                  name="archetype"
                  value={formData.archetype}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="">Select your archetype</option>
                  {archetypeOptions.map((a) => (
                    <option key={a} value={a}>{a}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Languages & Explorer Focus</h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Languages Spoken <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2 mb-2">
                  <select
                    value={newLanguage}
                    onChange={(e) => setNewLanguage(e.target.value)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="">Select a language</option>
                    {languageOptions.map((lang) => (
                      <option key={lang} value={lang}>{lang}</option>
                    ))}
                  </select>
                  <button
                    onClick={addLanguage}
                    className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.languages.map((lang) => (
                    <span
                      key={lang}
                      className="inline-flex items-center gap-2 px-3 py-1 bg-teal-100 text-teal-700 rounded-full text-sm"
                    >
                      {lang}
                      <button
                        onClick={() => removeLanguage(lang)}
                        className="hover:text-teal-900"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Explorer Focus <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2 mb-2">
                  <select
                    value={newSpecialty}
                    onChange={(e) => setNewSpecialty(e.target.value)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="">Select a specialty</option>
                    {specialtyOptions.map((spec) => (
                      <option key={spec} value={spec}>
                        {spec.charAt(0).toUpperCase() + spec.slice(1)}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={addSpecialty}
                    className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.specialties.map((spec) => (
                    <span
                      key={spec}
                      className="inline-flex items-center gap-2 px-3 py-1 bg-coral-100 text-coral-700 rounded-full text-sm"
                    >
                      {spec.charAt(0).toUpperCase() + spec.slice(1)}
                      <button
                        onClick={() => removeSpecialty(spec)}
                        className="hover:text-coral-900"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Bio & Expertise</h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Professional Bio
                </label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="Tell us about your experience as a tour guide, what makes you passionate about guiding, and what travelers can expect from your tours..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Expertise & Credentials (Optional)
                </label>
                <div className="space-y-2 mb-2">
                  <input
                    type="text"
                    value={newCert.name}
                    onChange={(e) => setNewCert({ ...newCert, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder="Certification name"
                  />
                  <input
                    type="text"
                    value={newCert.issuer}
                    onChange={(e) => setNewCert({ ...newCert, issuer: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder="Issuing organization"
                  />
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newCert.year}
                      onChange={(e) => setNewCert({ ...newCert, year: e.target.value })}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                      placeholder="Year"
                    />
                    <button
                      onClick={addCertification}
                      className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  {formData.certifications.map((cert, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div>
                        <p className="font-medium text-gray-900">{cert.name}</p>
                        <p className="text-sm text-gray-600">
                          {cert.issuer} • {cert.year}
                        </p>
                      </div>
                      <button
                        onClick={() => removeCertification(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between p-6 border-t border-gray-200">
          {step > 1 ? (
            <button
              onClick={prevStep}
              className="px-6 py-2 text-gray-700 hover:text-gray-900 transition-colors"
            >
              Previous
            </button>
          ) : (
            <div />
          )}

          {step < 4 ? (
            <button
              onClick={nextStep}
              className="px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-semibold"
            >
              Next Step
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Submitting...' : 'Join the Vanguard Network'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TourGuideApplicationModal;
