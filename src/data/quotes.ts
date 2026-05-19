export interface Quote {
  id: string;
  quote: string;
  author: string;
  category: string;
  backgroundImage: string;
}

export const quotes: Quote[] = [
  {
    id: '1',
    quote: 'Travel makes one modest. You see what a tiny place you occupy in the world.',
    author: 'Gustave Flaubert',
    category: 'travel',
    backgroundImage: 'https://images.pexels.com/photos/3571551/pexels-photo-3571551.jpeg?auto=compress&cs=tinysrgb&w=1920'
  },
  {
    id: '2',
    quote: 'Not all those who wander are lost.',
    author: 'J.R.R. Tolkien',
    category: 'adventure',
    backgroundImage: 'https://images.pexels.com/photos/1591447/pexels-photo-1591447.jpeg?auto=compress&cs=tinysrgb&w=1920'
  },
  {
    id: '3',
    quote: 'To travel is to live.',
    author: 'Hans Christian Andersen',
    category: 'travel',
    backgroundImage: 'https://images.pexels.com/photos/1562/italian-landscape-mountains-nature.jpg?auto=compress&cs=tinysrgb&w=1920'
  },
  {
    id: '4',
    quote: 'The world is a book, and those who do not travel read only one page.',
    author: 'Saint Augustine',
    category: 'travel',
    backgroundImage: 'https://images.pexels.com/photos/3225531/pexels-photo-3225531.jpeg?auto=compress&cs=tinysrgb&w=1920'
  },
  {
    id: '5',
    quote: 'Adventure is worthwhile in itself.',
    author: 'Amelia Earhart',
    category: 'adventure',
    backgroundImage: 'https://images.pexels.com/photos/3408744/pexels-photo-3408744.jpeg?auto=compress&cs=tinysrgb&w=1920'
  },
  {
    id: '6',
    quote: 'The journey of a thousand miles begins with a single step.',
    author: 'Lao Tzu',
    category: 'journey',
    backgroundImage: 'https://images.pexels.com/photos/1666021/pexels-photo-1666021.jpeg?auto=compress&cs=tinysrgb&w=1920'
  },
  {
    id: '7',
    quote: 'Life is either a daring adventure or nothing at all.',
    author: 'Helen Keller',
    category: 'adventure',
    backgroundImage: 'https://images.pexels.com/photos/2418664/pexels-photo-2418664.jpeg?auto=compress&cs=tinysrgb&w=1920'
  },
  {
    id: '8',
    quote: 'We travel not to escape life, but for life not to escape us.',
    author: 'Anonymous',
    category: 'travel',
    backgroundImage: 'https://images.pexels.com/photos/2670/landscape-mountains-nature-lake.jpg?auto=compress&cs=tinysrgb&w=1920'
  },
  {
    id: '9',
    quote: 'Travel is the only thing you buy that makes you richer.',
    author: 'Anonymous',
    category: 'travel',
    backgroundImage: 'https://images.pexels.com/photos/1619317/pexels-photo-1619317.jpeg?auto=compress&cs=tinysrgb&w=1920'
  },
  {
    id: '10',
    quote: 'A journey is best measured in friends, rather than miles.',
    author: 'Tim Cahill',
    category: 'journey',
    backgroundImage: 'https://images.pexels.com/photos/2662116/pexels-photo-2662116.jpeg?auto=compress&cs=tinysrgb&w=1920'
  },
  {
    id: '11',
    quote: 'Take only memories, leave only footprints.',
    author: 'Chief Seattle',
    category: 'exploration',
    backgroundImage: 'https://images.pexels.com/photos/1624496/pexels-photo-1624496.jpeg?auto=compress&cs=tinysrgb&w=1920'
  },
  {
    id: '12',
    quote: 'The real voyage of discovery consists not in seeking new landscapes, but in having new eyes.',
    author: 'Marcel Proust',
    category: 'exploration',
    backgroundImage: 'https://images.pexels.com/photos/2356045/pexels-photo-2356045.jpeg?auto=compress&cs=tinysrgb&w=1920'
  },
  {
    id: '13',
    quote: 'Jobs fill your pocket, but adventures fill your soul.',
    author: 'Jamie Lyn Beatty',
    category: 'adventure',
    backgroundImage: 'https://images.pexels.com/photos/1118877/pexels-photo-1118877.jpeg?auto=compress&cs=tinysrgb&w=1920'
  },
  {
    id: '14',
    quote: 'Travel far enough, you meet yourself.',
    author: 'David Mitchell',
    category: 'travel',
    backgroundImage: 'https://images.pexels.com/photos/1181406/pexels-photo-1181406.jpeg?auto=compress&cs=tinysrgb&w=1920'
  },
  {
    id: '15',
    quote: 'The gladdest moment in human life is a departure into unknown lands.',
    author: 'Richard Burton',
    category: 'exploration',
    backgroundImage: 'https://images.pexels.com/photos/1659438/pexels-photo-1659438.jpeg?auto=compress&cs=tinysrgb&w=1920'
  }
];

export const getRandomQuote = (): Quote => {
  const randomIndex = Math.floor(Math.random() * quotes.length);
  return quotes[randomIndex];
};

export const getRandomQuotes = (count: number): Quote[] => {
  const shuffled = [...quotes].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
};
