import React from 'react';
import { Users, Award, MapPin, Heart, Target, Lightbulb, Globe, Recycle, Users2, Eye, TrendingUp, Compass, Mountain, Camera } from 'lucide-react';
import QuoteSection from '../components/QuoteSection';
import Footer from '../components/Footer';
import { useRandomQuotes } from '../hooks/useRandomQuotes';

const stats = [
  { icon: Users, label: "Happy Travelers", value: "10,000+" },
  { icon: Award, label: "Years Experience", value: "15+" },
  { icon: MapPin, label: "Destinations", value: "100+" },
  { icon: Heart, label: "5-Star Reviews", value: "2,500+" }
];

const principles = [
  {
    icon: TrendingUp,
    title: "Covariance",
    description: "Ensuring that the efforts and outcomes of the collective's projects are interrelated and contribute to a common goal."
  },
  {
    icon: Recycle,
    title: "Continuous Improvement",
    description: "No processes are perfect, iteration and implementing improvements at higher frequencies."
  },
  {
    icon: Target,
    title: "Alignment",
    description: "All members and projects must adhere to a set of shared values and objectives to maintain coherence and maximize impact."
  },
  {
    icon: Globe,
    title: "Sustainability",
    description: "Prioritizing projects that have long-term benefits for the environment, society, and economy."
  },
  {
    icon: Lightbulb,
    title: "Innovation",
    description: "Encouraging creativity and technological advancements to solve complex problems."
  },
  {
    icon: Users2,
    title: "Community Engagement",
    description: "Actively involving local communities in project development and implementation."
  },
  {
    icon: Eye,
    title: "Transparency",
    description: "Maintaining open communication and accountability in all activities."
  }
];

const teamMembers = [
  {
    name: "Priya Sharma",
    role: "Founder & Chief Explorer",
    image: "https://images.pexels.com/photos/3756681/pexels-photo-3756681.jpeg?auto=compress&cs=tinysrgb&w=400",
    description: "15 years of travel expertise across India's diverse landscapes"
  },
  {
    name: "Rajesh Kumar",
    role: "Adventure Specialist",
    image: "https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=400",
    description: "Mountain trekking and adventure sports expert"
  },
  {
    name: "Ananya Patel",
    role: "Cultural Experience Lead",
    image: "https://images.pexels.com/photos/3763188/pexels-photo-3763188.jpeg?auto=compress&cs=tinysrgb&w=400",
    description: "Passionate about connecting travelers with local traditions"
  },
  {
    name: "Vikram Singh",
    role: "Operations Director",
    image: "https://images.pexels.com/photos/3785079/pexels-photo-3785079.jpeg?auto=compress&cs=tinysrgb&w=400",
    description: "Ensuring seamless travel experiences for every journey"
  }
];

const milestones = [
  { year: "2008", title: "Founded", description: "Started with a dream to make travel accessible" },
  { year: "2012", title: "10,000 Travelers", description: "Reached our first major milestone" },
  { year: "2016", title: "National Recognition", description: "Awarded Best Travel Company in India" },
  { year: "2020", title: "Digital Innovation", description: "Launched advanced trip planning platform" },
  { year: "2024", title: "Global Expansion", description: "Expanding to international destinations" }
];

const AboutPage = () => {
  const randomQuotes = useRandomQuotes(3);

  return (
    <div className="min-h-screen pt-20 pb-20 md:pb-0">
      <QuoteSection quote={randomQuotes[0]} />

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-20">
            <div>
              <div className="inline-flex items-center gap-2 bg-coral-100 px-4 py-2 rounded-full mb-6 animate-fadeIn">
                <Compass className="h-5 w-5 text-coral-500" />
                <span className="text-coral-500 font-semibold">Our Story</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                About <span className="bg-gradient-to-r from-coral-500 to-teal-500 bg-clip-text text-transparent">Woander</span>
              </h2>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                We believe that travel is not just about visiting places—it's about awakening your senses,
                discovering new perspectives, and creating memories that last a lifetime. For over 15 years,
                we've been crafting extraordinary journeys across India's diverse landscapes.
              </p>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                From the snow-capped peaks of the Himalayas to the sun-kissed beaches of Goa,
                from the royal palaces of Rajasthan to the serene backwaters of Kerala—we help you
                experience the incredible diversity that makes India truly magical.
              </p>
              <div className="flex items-start gap-4 bg-coral-50 p-6 rounded-xl border-l-4 border-coral-500">
                <Mountain className="h-6 w-6 text-coral-500 flex-shrink-0 mt-1" />
                <blockquote className="text-lg text-gray-700 italic font-medium">
                  "Adventure is worthwhile in itself." - Amelia Earhart
                </blockquote>
              </div>
            </div>

            <div className="relative">
              <img
                src="https://images.pexels.com/photos/1660995/pexels-photo-1660995.jpeg?auto=compress&cs=tinysrgb&w=800"
                alt="Indian landscape"
                className="rounded-2xl shadow-2xl"
              />
              <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-xl shadow-lg animate-fadeIn">
                <p className="text-3xl font-bold text-coral-500">15+</p>
                <p className="text-gray-600 font-semibold">Years of Excellence</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 mb-24">
            {stats.map((stat, index) => (
              <div key={index} className="text-center group">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-coral-100 rounded-full mb-4 group-hover:bg-coral-500 transition-all duration-300 group-hover:scale-110">
                  <stat.icon className="h-8 w-8 text-coral-500 group-hover:text-white transition-colors duration-300" />
                </div>
                <p className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</p>
                <p className="text-gray-600">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <QuoteSection quote={randomQuotes[1]} />

      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Our Vision & Mission
            </h3>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Guided by purpose, driven by passion
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-20">
            <div className="bg-gradient-to-br from-coral-50 to-sunset-100 rounded-2xl p-8 border border-coral-200 transform hover:scale-105 transition-all duration-300 hover:shadow-xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-coral-500 rounded-full p-3 transition-transform duration-300 hover:rotate-12">
                  <Eye className="h-6 w-6 text-white" />
                </div>
                <h4 className="text-2xl font-bold text-gray-900">Vision</h4>
              </div>
              <p className="text-gray-700 leading-relaxed">
                To create a world where Coherent and Coordinated efforts lead to Sustainable Development,
                Social Equity, and Technological Innovation.
              </p>
            </div>

            <div className="bg-gradient-to-br from-teal-50 to-teal-100 rounded-2xl p-8 border border-teal-200 transform hover:scale-105 transition-all duration-300 hover:shadow-xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-teal-500 rounded-full p-3 transition-transform duration-300 hover:rotate-12">
                  <Target className="h-6 w-6 text-white" />
                </div>
                <h4 className="text-2xl font-bold text-gray-900">Mission</h4>
              </div>
              <p className="text-gray-700 leading-relaxed">
                To Empower Travelers and Local Communities through Innovative, Hyper-local Technology solutions
                and Quality Services that enhance Travel Experiences and support sustainable Sector development.
              </p>
            </div>
          </div>

          <div className="mb-20">
            <div className="text-center mb-12">
              <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Core Principles & Values
              </h3>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                Our principles guide every decision we make and every experience we create
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {principles.map((principle, index) => (
                <div
                  key={index}
                  className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-xl transition-all duration-300 hover:border-coral-300 hover:-translate-y-2"
                >
                  <div className="flex items-start gap-4">
                    <div className="bg-coral-100 rounded-lg p-3 flex-shrink-0 transition-transform duration-300 group-hover:scale-110">
                      <principle.icon className="h-6 w-6 text-coral-500" />
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-gray-900 mb-2">
                        {principle.title}
                      </h4>
                      <p className="text-gray-600 leading-relaxed">
                        {principle.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-coral-100 px-4 py-2 rounded-full mb-6 animate-fadeIn">
              <Camera className="h-5 w-5 text-coral-500" />
              <span className="text-coral-500 font-semibold">Meet The Team</span>
            </div>
            <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              The People Behind Your Journey
            </h3>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Our passionate team of travel experts dedicated to creating unforgettable experiences
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
            {teamMembers.map((member, index) => (
              <div key={index} className="group">
                <div className="relative overflow-hidden rounded-xl mb-4">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-80 object-cover transform group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
                <h4 className="text-xl font-bold text-gray-900 mb-1">{member.name}</h4>
                <p className="text-coral-500 font-semibold mb-2">{member.role}</p>
                <p className="text-gray-600 text-sm">{member.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-br from-gray-900 to-gray-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="text-3xl md:text-4xl font-bold mb-4">Our Journey</h3>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto">
              A timeline of growth, innovation, and unforgettable experiences
            </p>
          </div>

          <div className="relative">
            <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-gradient-to-b from-coral-500 to-teal-500 hidden md:block" />
            <div className="space-y-12">
              {milestones.map((milestone, index) => (
                <div
                  key={index}
                  className={`flex items-center gap-8 ${
                    index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                  }`}
                >
                  <div className={`flex-1 ${index % 2 === 0 ? 'md:text-right' : 'md:text-left'}`}>
                    <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20">
                      <p className="text-coral-400 font-bold text-2xl mb-2">{milestone.year}</p>
                      <h4 className="text-xl font-bold mb-2">{milestone.title}</h4>
                      <p className="text-gray-300">{milestone.description}</p>
                    </div>
                  </div>
                  <div className="hidden md:block w-4 h-4 rounded-full bg-coral-500 border-4 border-gray-900 z-10 animate-pulse" />
                  <div className="flex-1" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <QuoteSection quote={randomQuotes[2]} />

      <Footer />
    </div>
  );
};

export default AboutPage;
