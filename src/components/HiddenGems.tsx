import React from 'react';
import { MapPin, TrendingUp, Users, Award } from 'lucide-react';

const stats = [
  {
    icon: MapPin,
    value: '247',
    label: 'Hidden Gems',
    color: 'from-blue-500 to-cyan-500'
  },
  {
    icon: Users,
    value: '1.2k',
    label: 'Explorers',
    color: 'from-orange-500 to-amber-500'
  },
  {
    icon: TrendingUp,
    value: '89',
    label: 'This Month',
    color: 'from-green-500 to-emerald-500'
  },
  {
    icon: Award,
    value: '156',
    label: 'Verified',
    color: 'from-purple-500 to-pink-500'
  }
];

const HiddenGems = () => {
  return (
    <section id="hidden-gems" className="py-20 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-100 to-pink-100 px-4 py-2 rounded-full mb-6">
            <MapPin className="h-5 w-5 text-orange-600" />
            <span className="text-orange-600 font-semibold">Community Discovery</span>
          </div>
          <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 opacity-0 animate-fade-in">
            Discover Hidden Gems
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Uncover secret spots, share your discoveries, and explore places that aren't in the guidebooks.
            Join a community of adventurers revealing the world's best-kept secrets.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="relative group"
            >
              <div className="absolute inset-0 bg-gradient-to-r opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-300"
                style={{
                  background: `linear-gradient(to right, var(--tw-gradient-stops))`,
                }}
              />
              <div className={`relative bg-white rounded-2xl p-6 shadow-lg border border-gray-100 group-hover:shadow-2xl transition-all duration-300 group-hover:-translate-y-1`}>
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} mb-4`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
                <div className="text-gray-600 text-sm font-medium">{stat.label}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="group bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <MapPin className="h-7 w-7 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Discover</h3>
            <p className="text-gray-600 leading-relaxed">
              Browse community-discovered locations that go beyond tourist traps. Filter by category,
              difficulty, and popularity to find your next adventure.
            </p>
          </div>

          <div className="group bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
            <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-amber-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <Users className="h-7 w-7 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Contribute</h3>
            <p className="text-gray-600 leading-relaxed">
              Share your secret spots with the community. Add locations, photos, tips, and help
              others discover amazing places off the beaten path.
            </p>
          </div>

          <div className="group bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
            <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <Award className="h-7 w-7 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Get Verified</h3>
            <p className="text-gray-600 leading-relaxed">
              Vote on locations, leave reviews, and help validate discoveries. Build your explorer
              reputation and unlock badges as you contribute.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HiddenGems;
