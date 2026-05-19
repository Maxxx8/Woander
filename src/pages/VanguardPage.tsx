import React, { useState, useEffect } from 'react';
import { Shield, Star, Users, Award, Search, Filter, MapPin, Plus } from 'lucide-react';
import Footer from '../components/Footer';
import TourGuideApplicationModal from '../components/TourGuideApplicationModal';
import { vanguardService } from '../services/vanguardService';
import { useAuth } from '../shared/AuthContext';

const VanguardPage = () => {
  const [guides, setGuides] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    loadGuides();
  }, []);

  const loadGuides = async () => {
    try {
      setLoading(true);
      const data = await vanguardService.getTourGuides();
      setGuides(data || []);
    } catch (error) {
      console.error('Error loading guides:', error);
      setGuides([]);
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    {
      icon: Shield,
      value: guides.length.toString(),
      label: 'Verified Guides',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: Star,
      value: '4.8',
      label: 'Average Rating',
      color: 'from-yellow-500 to-amber-500'
    },
    {
      icon: Users,
      value: '10k+',
      label: 'Happy Travelers',
      color: 'from-green-500 to-emerald-500'
    },
    {
      icon: Award,
      value: '95%',
      label: 'Success Rate',
      color: 'from-orange-500 to-red-500'
    }
  ];

  return (
    <div className="min-h-screen pt-20 pb-20 md:pb-0 bg-gradient-to-b from-white to-gray-50">
      <section className="relative py-20 bg-gradient-to-br from-teal-600 via-teal-500 to-cyan-500 overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-teal-300/20 rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
              <Shield className="w-5 h-5 text-white" />
              <span className="text-white font-semibold">Vanguard</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
              Approved & Rated
              <br />
              <span className="text-yellow-300">Tour Guides</span>
            </h1>
            <p className="text-xl text-white/90 max-w-3xl mx-auto mb-8">
              Connect with verified, professional tour guides who bring destinations to life.
              Every guide is thoroughly vetted, highly rated, and passionate about creating
              unforgettable experiences.
            </p>
          
        </div>
      </section>

      <section className="py-12 bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              
                <div className="relative group">
                  <div className={`relative bg-gradient-to-br ${stat.color} rounded-2xl p-6 text-white shadow-lg group-hover:shadow-2xl transition-all duration-300 group-hover:-translate-y-1`}>
                    <stat.icon className="w-8 h-8 mb-3 opacity-90" />
                    <div className="text-3xl font-bold mb-1">{stat.value}</div>
                    <div className="text-sm opacity-90">{stat.label}</div>
                  </div>
                </div>
              
            ))}
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8 bg-gradient-to-r from-teal-50 to-cyan-50 border border-teal-200 rounded-2xl p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Are you a tour guide?
                </h3>
                <p className="text-gray-600">
                  Join Vanguard and connect with travelers worldwide
                </p>
              </div>
              <button
                onClick={() => setShowApplicationModal(true)}
                className="flex items-center gap-2 px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-all shadow-md hover:shadow-lg whitespace-nowrap"
              >
                <Plus className="w-5 h-5" />
                <span>Become a Guide</span>
              </button>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading tour guides...</p>
            </div>
          ) : guides.length > 0 ? (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                {guides.length} {guides.length === 1 ? 'Guide' : 'Guides'} Available
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {guides.map((guide, index) => (
                  <div key={guide.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                    <div className="h-48 bg-gradient-to-br from-teal-400 to-cyan-500"></div>
                    <div className="p-6">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{guide.full_name}</h3>
                      <p className="text-gray-600 mb-4 line-clamp-2">{guide.bio}</p>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <MapPin className="w-4 h-4" />
                        <span>{guide.location_city}, {guide.location_state}</span>
                      </div>
                      <div className="flex items-center gap-1 mt-2">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-semibold">{guide.average_rating}</span>
                        <span className="text-gray-500 text-sm">({guide.total_reviews} reviews)</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-20 bg-gray-50 rounded-xl">
              <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No guides available yet
              </h3>
              <p className="text-gray-600 mb-6">
                Be the first to join our Vanguard program!
              </p>
              <button
                onClick={() => setShowApplicationModal(true)}
                className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
              >
                Apply Now
              </button>
            </div>
          )}
        </div>
      </section>

      <section className="py-20 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Why Choose Vanguard Guides?
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Every guide on our platform is carefully vetted to ensure exceptional experiences
              </p>
            </div>
          

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
              <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mb-6">
                  <Shield className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Verified & Approved</h3>
                <p className="text-gray-600 leading-relaxed">
                  Every guide undergoes identity verification, background checks, and credential validation before joining our platform.
                </p>
              </div>
            

            
              <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all">
                <div className="w-14 h-14 bg-gradient-to-br from-yellow-500 to-amber-500 rounded-2xl flex items-center justify-center mb-6">
                  <Star className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Highly Rated</h3>
                <p className="text-gray-600 leading-relaxed">
                  Read verified reviews from real travelers. All guides maintain high ratings and consistently deliver exceptional tours.
                </p>
              </div>
            

            
              <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all">
                <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mb-6">
                  <Award className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Professional Excellence</h3>
                <p className="text-gray-600 leading-relaxed">
                  Our guides are passionate experts with certifications, local knowledge, and years of experience creating memorable adventures.
                </p>
              </div>
            
          </div>
        </div>
      </section>

      <Footer />

      <TourGuideApplicationModal
        isOpen={showApplicationModal}
        onClose={() => setShowApplicationModal(false)}
        onSuccess={() => {
          setShowApplicationModal(false);
          loadGuides();
        }}
      />
    </div>
  );
};

export default VanguardPage;
