export interface FeaturedExperience {
  name: string;
  description: string;
  archetype: string;
}

export interface ExplorerTestimonial {
  quote: string;
  name: string;
  destination: string;
}

export const ARCHETYPE_PHILOSOPHY: Record<string, string> = {
  Historian: 'The past is still visible.',
  Pathfinder: 'The map ends here.',
  'Food Explorer': 'Every place has a flavor.',
  Naturalist: 'Learn the language of landscapes.',
  Architect: 'Buildings remember what people forget.',
  Storykeeper: 'Culture lives in people.',
  Photographer: 'Light changes everything.',
  'Adventure Specialist': 'The trail is the destination.',
};

export const WHY_EXPLORE_BY_ARCHETYPE: Record<string, string> = {
  Historian: 'Documenting forgotten corners of this city for the past fifteen years.',
  Pathfinder: 'Walking routes that no GPS has ever recorded.',
  'Food Explorer': 'Grew up exploring spice routes along the Kerala coast.',
  Naturalist: 'Learning to read ecosystems before learning to read maps.',
  Architect: 'Spent a decade photographing buildings the city is about to lose.',
  Storykeeper: 'Preserving oral histories from communities that do not write things down.',
  Photographer: 'Chasing the light that exists for twelve minutes every morning.',
  'Adventure Specialist': 'Mapped trails that connect villages who have never needed roads.',
};

export const SAMPLE_GEMS_BY_ARCHETYPE: Record<string, string[]> = {
  Historian: ['Forgotten Temple Courtyard', 'Colonial Quarter Archives', 'Ancient Trade Post'],
  Pathfinder: ['Hidden Waterfall Trail', 'Ridge Walk to Nowhere', 'Secret Forest Descent'],
  'Food Explorer': ['Forgotten Spice Route', 'Hidden Night Market', 'Family Spice Garden'],
  Naturalist: ['Monsoon Wetland Walk', 'Endemic Bird Grove', 'Hidden Valley Ecosystem'],
  Architect: ['Forgotten Architecture Trail', 'Abandoned Palace Wing', 'Vernacular Village Quarter'],
  Storykeeper: ['Living Ritual Ground', 'Oral History Village', 'Festival Preparation Street'],
  Photographer: ['Golden Hour Rooftop', 'Hidden Light Alley', 'Dawn Mist Riverbank'],
  'Adventure Specialist': ['Hidden Canyon Route', 'Off-Trail Summit Approach', 'River Crossing Path'],
  default: ['Hidden Viewpoint', 'Forgotten Path', 'Local Secret Spot'],
};

export const SAMPLE_FIELD_NOTES: string[][] = [
  [
    'Arrive before sunrise. The crowds arrive at 9 — the magic leaves at 8.',
    'Most visitors miss the eastern trail entirely. That is where the place actually lives.',
  ],
  [
    'The evening light hits the old quarter at a different angle in winter.',
    'Ask for the family kitchen, not the restaurant. That is where the real food is.',
  ],
  [
    'The map does not show the path behind the waterfall. Look for the mossy rock.',
    'There is a family that has kept the same recipe for two hundred years. They do not advertise.',
  ],
  [
    'If you go in monsoon season, the trail becomes something else entirely.',
    'The morning market disappears by 7 AM. Most people sleep through the best part.',
  ],
];

export const FEATURED_EXPERIENCES: FeaturedExperience[] = [
  {
    name: 'Forgotten Spice Route',
    description: 'A walk through narrow lanes that once connected spice traders across centuries.',
    archetype: 'Food Explorer',
  },
  {
    name: 'Secret Monsoon Trail',
    description: 'A forest path that only reveals itself fully when the rains arrive.',
    archetype: 'Naturalist',
  },
  {
    name: 'Hidden Village Walk',
    description: 'A community of artisans who have practiced the same craft for twelve generations.',
    archetype: 'Storykeeper',
  },
  {
    name: 'Architecture Through Time',
    description: 'A layered walk where four architectural eras overlap in one city block.',
    archetype: 'Architect',
  },
  {
    name: 'Dawn at the Eastern Ridge',
    description: 'A sunrise spot that locals keep deliberately unmarked on every tourist map.',
    archetype: 'Pathfinder',
  },
  {
    name: 'Forgotten Temple Circuit',
    description: 'Seven temples in seven hours — none of them on a guidebook itinerary.',
    archetype: 'Historian',
  },
];

export const EXPLORER_TESTIMONIALS: ExplorerTestimonial[] = [
  {
    quote: 'The destination was beautiful. The local expert made it unforgettable.',
    name: 'Priya S.',
    destination: 'Rajasthan',
  },
  {
    quote:
      "I had visited the city twice before. I never actually saw it until I went with a Vanguard local.",
    name: 'Marco L.',
    destination: 'Kolkata',
  },
  {
    quote:
      'She took us to a place that does not exist on any map. That is the only way to describe it.',
    name: 'Anika R.',
    destination: 'Kerala',
  },
];

export function deterministicNum(id: string, min: number, max: number): number {
  const sum = id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return min + (sum % (max - min + 1));
}
