export interface ExpandedQuote {
  id: string;
  text: string;
  author: string;
  category: string;
  tags: string[];
  mood: string;
}

export const expandedQuotes: ExpandedQuote[] = [
  {
    id: '1',
    text: 'Travel makes one modest. You see what a tiny place you occupy in the world.',
    author: 'Gustave Flaubert',
    category: 'travel',
    tags: ['humility', 'perspective', 'wisdom'],
    mood: 'reflective'
  },
  {
    id: '2',
    text: 'Not all those who wander are lost.',
    author: 'J.R.R. Tolkien',
    category: 'adventure',
    tags: ['wandering', 'purpose', 'exploration'],
    mood: 'inspiring'
  },
  {
    id: '3',
    text: 'To travel is to live.',
    author: 'Hans Christian Andersen',
    category: 'travel',
    tags: ['living', 'experience', 'vitality'],
    mood: 'uplifting'
  },
  {
    id: '4',
    text: 'The world is a book, and those who do not travel read only one page.',
    author: 'Saint Augustine',
    category: 'travel',
    tags: ['knowledge', 'exploration', 'learning'],
    mood: 'inspiring'
  },
  {
    id: '5',
    text: 'Adventure is worthwhile in itself.',
    author: 'Amelia Earhart',
    category: 'adventure',
    tags: ['courage', 'boldness', 'exploration'],
    mood: 'adventurous'
  },
  {
    id: '6',
    text: 'The journey of a thousand miles begins with a single step.',
    author: 'Lao Tzu',
    category: 'journey',
    tags: ['beginning', 'courage', 'action'],
    mood: 'motivating'
  },
  {
    id: '7',
    text: 'Life is either a daring adventure or nothing at all.',
    author: 'Helen Keller',
    category: 'adventure',
    tags: ['courage', 'living', 'boldness'],
    mood: 'bold'
  },
  {
    id: '8',
    text: 'We travel not to escape life, but for life not to escape us.',
    author: 'Anonymous',
    category: 'travel',
    tags: ['purpose', 'living', 'meaning'],
    mood: 'profound'
  },
  {
    id: '9',
    text: 'Travel is the only thing you buy that makes you richer.',
    author: 'Anonymous',
    category: 'travel',
    tags: ['value', 'wealth', 'experience'],
    mood: 'uplifting'
  },
  {
    id: '10',
    text: 'A journey is best measured in friends, rather than miles.',
    author: 'Tim Cahill',
    category: 'journey',
    tags: ['friendship', 'connection', 'relationships'],
    mood: 'heartwarming'
  },
  {
    id: '11',
    text: 'Take only memories, leave only footprints.',
    author: 'Chief Seattle',
    category: 'exploration',
    tags: ['sustainability', 'respect', 'nature'],
    mood: 'mindful'
  },
  {
    id: '12',
    text: 'The real voyage of discovery consists not in seeking new landscapes, but in having new eyes.',
    author: 'Marcel Proust',
    category: 'exploration',
    tags: ['perspective', 'insight', 'awareness'],
    mood: 'philosophical'
  },
  {
    id: '13',
    text: 'Jobs fill your pocket, but adventures fill your soul.',
    author: 'Jamie Lyn Beatty',
    category: 'adventure',
    tags: ['fulfillment', 'soul', 'purpose'],
    mood: 'inspiring'
  },
  {
    id: '14',
    text: 'Travel far enough, you meet yourself.',
    author: 'David Mitchell',
    category: 'travel',
    tags: ['self-discovery', 'identity', 'growth'],
    mood: 'introspective'
  },
  {
    id: '15',
    text: 'The gladdest moment in human life is a departure into unknown lands.',
    author: 'Richard Burton',
    category: 'exploration',
    tags: ['excitement', 'unknown', 'joy'],
    mood: 'exhilarating'
  },
  {
    id: '16',
    text: 'Once a year, go someplace you've never been before.',
    author: 'Dalai Lama',
    category: 'wanderlust',
    tags: ['exploration', 'discovery', 'growth'],
    mood: 'encouraging'
  },
  {
    id: '17',
    text: 'Travel is fatal to prejudice, bigotry, and narrow-mindedness.',
    author: 'Mark Twain',
    category: 'cultural',
    tags: ['understanding', 'empathy', 'growth'],
    mood: 'enlightening'
  },
  {
    id: '18',
    text: 'I haven't been everywhere, but it's on my list.',
    author: 'Susan Sontag',
    category: 'wanderlust',
    tags: ['dreams', 'ambition', 'goals'],
    mood: 'aspirational'
  },
  {
    id: '19',
    text: 'Travel brings power and love back into your life.',
    author: 'Rumi',
    category: 'transformation',
    tags: ['renewal', 'energy', 'love'],
    mood: 'spiritual'
  },
  {
    id: '20',
    text: 'The best education I have ever received was through travel.',
    author: 'Lisa Ling',
    category: 'learning',
    tags: ['education', 'growth', 'wisdom'],
    mood: 'enlightening'
  },
  {
    id: '21',
    text: 'Life begins at the end of your comfort zone.',
    author: 'Neale Donald Walsch',
    category: 'courage',
    tags: ['growth', 'comfort-zone', 'bravery'],
    mood: 'challenging'
  },
  {
    id: '22',
    text: 'Traveling – it leaves you speechless, then turns you into a storyteller.',
    author: 'Ibn Battuta',
    category: 'storytelling',
    tags: ['stories', 'experience', 'sharing'],
    mood: 'poetic'
  },
  {
    id: '23',
    text: 'Adventure may hurt you but monotony will kill you.',
    author: 'Anonymous',
    category: 'adventure',
    tags: ['risk', 'living', 'vitality'],
    mood: 'bold'
  },
  {
    id: '24',
    text: 'A ship in harbor is safe, but that is not what ships are built for.',
    author: 'John A. Shedd',
    category: 'courage',
    tags: ['purpose', 'risk', 'action'],
    mood: 'motivating'
  },
  {
    id: '25',
    text: 'Only those who risk going too far can possibly find out how far one can go.',
    author: 'T.S. Eliot',
    category: 'courage',
    tags: ['limits', 'risk', 'discovery'],
    mood: 'daring'
  },
  {
    id: '26',
    text: 'The world is too big to stay in one place, and life is too short to do just one thing.',
    author: 'Anonymous',
    category: 'wanderlust',
    tags: ['diversity', 'exploration', 'life'],
    mood: 'inspiring'
  },
  {
    id: '27',
    text: 'I am not the same, having seen the moon shine on the other side of the world.',
    author: 'Mary Anne Radmacher',
    category: 'transformation',
    tags: ['change', 'perspective', 'growth'],
    mood: 'transformative'
  },
  {
    id: '28',
    text: 'We live in a wonderful world that is full of beauty, charm and adventure.',
    author: 'Jawaharlal Nehru',
    category: 'nature',
    tags: ['beauty', 'wonder', 'appreciation'],
    mood: 'grateful'
  },
  {
    id: '29',
    text: 'To awaken quite alone in a strange town is one of the pleasantest sensations in the world.',
    author: 'Freya Stark',
    category: 'solo-travel',
    tags: ['independence', 'solitude', 'freedom'],
    mood: 'peaceful'
  },
  {
    id: '30',
    text: 'The man who goes alone can start today, but he who travels with another must wait.',
    author: 'Henry David Thoreau',
    category: 'solo-travel',
    tags: ['independence', 'freedom', 'spontaneity'],
    mood: 'liberating'
  },
  {
    id: '31',
    text: 'Do not follow where the path may lead. Go instead where there is no path and leave a trail.',
    author: 'Ralph Waldo Emerson',
    category: 'trailblazing',
    tags: ['innovation', 'courage', 'leadership'],
    mood: 'pioneering'
  },
  {
    id: '32',
    text: 'Twenty years from now you will be more disappointed by the things you didn't do.',
    author: 'Mark Twain',
    category: 'regret',
    tags: ['action', 'seize-the-day', 'courage'],
    mood: 'urgent'
  },
  {
    id: '33',
    text: 'Wherever you go becomes a part of you somehow.',
    author: 'Anita Desai',
    category: 'memory',
    tags: ['connection', 'experience', 'identity'],
    mood: 'nostalgic'
  },
  {
    id: '34',
    text: 'Travel is more than the seeing of sights; it is a change that goes on, deep and permanent.',
    author: 'Miriam Beard',
    category: 'transformation',
    tags: ['change', 'growth', 'depth'],
    mood: 'profound'
  },
  {
    id: '35',
    text: 'No place is ever as bad as they tell you it's going to be.',
    author: 'Chuck Thompson',
    category: 'optimism',
    tags: ['open-mind', 'discovery', 'expectations'],
    mood: 'optimistic'
  },
  {
    id: '36',
    text: 'People don't take trips, trips take people.',
    author: 'John Steinbeck',
    category: 'transformation',
    tags: ['change', 'surrender', 'journey'],
    mood: 'transformative'
  },
  {
    id: '37',
    text: 'I travel not to escape life, but so life doesn't escape me.',
    author: 'Anonymous',
    category: 'purpose',
    tags: ['meaning', 'living', 'intention'],
    mood: 'purposeful'
  },
  {
    id: '38',
    text: 'Don't listen to what they say. Go see.',
    author: 'Anonymous',
    category: 'discovery',
    tags: ['experience', 'independent-thinking', 'action'],
    mood: 'rebellious'
  },
  {
    id: '39',
    text: 'The journey changes you; it should change you.',
    author: 'Anthony Bourdain',
    category: 'transformation',
    tags: ['growth', 'change', 'evolution'],
    mood: 'accepting'
  },
  {
    id: '40',
    text: 'We travel, initially, to lose ourselves; and we travel, next, to find ourselves.',
    author: 'Pico Iyer',
    category: 'self-discovery',
    tags: ['identity', 'purpose', 'growth'],
    mood: 'philosophical'
  },
  {
    id: '41',
    text: 'The use of traveling is to regulate imagination by reality.',
    author: 'Samuel Johnson',
    category: 'learning',
    tags: ['reality', 'perspective', 'grounding'],
    mood: 'pragmatic'
  },
  {
    id: '42',
    text: 'Live life with no excuses, travel with no regret.',
    author: 'Oscar Wilde',
    category: 'living',
    tags: ['freedom', 'boldness', 'action'],
    mood: 'empowering'
  },
  {
    id: '43',
    text: 'If you think adventure is dangerous, try routine. It's lethal.',
    author: 'Paulo Coelho',
    category: 'adventure',
    tags: ['risk', 'vitality', 'change'],
    mood: 'provocative'
  },
  {
    id: '44',
    text: 'Travel makes one modest. You see what a tiny place you occupy in the world.',
    author: 'Gustave Flaubert',
    category: 'humility',
    tags: ['perspective', 'scale', 'awareness'],
    mood: 'humbling'
  },
  {
    id: '45',
    text: 'A good traveler has no fixed plans and is not intent on arriving.',
    author: 'Lao Tzu',
    category: 'mindfulness',
    tags: ['flexibility', 'present', 'flow'],
    mood: 'zen'
  },
  {
    id: '46',
    text: 'Travel is the only context in which some people ever look around.',
    author: 'Alain de Botton',
    category: 'awareness',
    tags: ['attention', 'presence', 'observation'],
    mood: 'contemplative'
  },
  {
    id: '47',
    text: 'Of all the books in the world, the best stories are found between the pages of a passport.',
    author: 'Anonymous',
    category: 'storytelling',
    tags: ['adventure', 'experiences', 'memories'],
    mood: 'romantic'
  },
  {
    id: '48',
    text: 'Travel far, pay no fare... a book can take you anywhere.',
    author: 'Anonymous',
    category: 'imagination',
    tags: ['reading', 'dreams', 'possibilities'],
    mood: 'whimsical'
  },
  {
    id: '49',
    text: 'Not all classrooms have four walls.',
    author: 'Anonymous',
    category: 'learning',
    tags: ['education', 'world', 'experience'],
    mood: 'enlightening'
  },
  {
    id: '50',
    text: 'Travel is never a matter of money but of courage.',
    author: 'Paulo Coelho',
    category: 'courage',
    tags: ['bravery', 'obstacles', 'determination'],
    mood: 'empowering'
  },
  {
    id: '51',
    text: 'In the middle of difficulty lies opportunity.',
    author: 'Albert Einstein',
    category: 'resilience',
    tags: ['challenges', 'growth', 'opportunity'],
    mood: 'hopeful'
  },
  {
    id: '52',
    text: 'The biggest adventure you can take is to live the life of your dreams.',
    author: 'Oprah Winfrey',
    category: 'dreams',
    tags: ['aspiration', 'boldness', 'living'],
    mood: 'inspiring'
  },
  {
    id: '53',
    text: 'Blessed are the curious for they shall have adventures.',
    author: 'Lovelle Drachman',
    category: 'curiosity',
    tags: ['exploration', 'wonder', 'discovery'],
    mood: 'playful'
  },
  {
    id: '54',
    text: 'Fill your life with experiences, not things. Have stories to tell, not stuff to show.',
    author: 'Anonymous',
    category: 'minimalism',
    tags: ['experiences', 'values', 'meaning'],
    mood: 'wise'
  },
  {
    id: '55',
    text: 'Wherever you go, go with all your heart.',
    author: 'Confucius',
    category: 'presence',
    tags: ['wholehearted', 'commitment', 'passion'],
    mood: 'passionate'
  },
  {
    id: '56',
    text: 'The real voyage of discovery consists not in seeking new landscapes.',
    author: 'Marcel Proust',
    category: 'perspective',
    tags: ['insight', 'awareness', 'vision'],
    mood: 'contemplative'
  },
  {
    id: '57',
    text: 'Don't call it a dream. Call it a plan.',
    author: 'Anonymous',
    category: 'planning',
    tags: ['action', 'determination', 'goals'],
    mood: 'motivating'
  },
  {
    id: '58',
    text: 'You are never too old to set another goal or to dream a new dream.',
    author: 'C.S. Lewis',
    category: 'dreams',
    tags: ['age', 'possibility', 'renewal'],
    mood: 'encouraging'
  },
  {
    id: '59',
    text: 'The most beautiful in the world is, of course, the world itself.',
    author: 'Wallace Stevens',
    category: 'nature',
    tags: ['beauty', 'appreciation', 'earth'],
    mood: 'reverent'
  },
  {
    id: '60',
    text: 'To travel is to discover that everyone is wrong about other countries.',
    author: 'Aldous Huxley',
    category: 'cultural',
    tags: ['stereotypes', 'truth', 'understanding'],
    mood: 'eye-opening'
  },
  {
    id: '61',
    text: 'There are no foreign lands. It is the traveler only who is foreign.',
    author: 'Robert Louis Stevenson',
    category: 'perspective',
    tags: ['belonging', 'connection', 'unity'],
    mood: 'unifying'
  },
  {
    id: '62',
    text: 'Every exit is an entry somewhere else.',
    author: 'Tom Stoppard',
    category: 'transition',
    tags: ['change', 'new-beginnings', 'possibility'],
    mood: 'hopeful'
  },
  {
    id: '63',
    text: 'The mountains are calling and I must go.',
    author: 'John Muir',
    category: 'nature',
    tags: ['mountains', 'calling', 'wilderness'],
    mood: 'yearning'
  },
  {
    id: '64',
    text: 'Life is short and the world is wide.',
    author: 'Simon Raven',
    category: 'urgency',
    tags: ['time', 'exploration', 'vastness'],
    mood: 'urgent'
  },
  {
    id: '65',
    text: 'Better to see something once than hear about it a thousand times.',
    author: 'Asian Proverb',
    category: 'experience',
    tags: ['firsthand', 'action', 'reality'],
    mood: 'practical'
  }
];