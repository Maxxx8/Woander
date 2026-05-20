import { useState, useEffect } from 'react';
import { getRandomQuotes, Quote } from '../data/quotes';

export const useRandomQuotes = (count: number) => {
  // Initialize with empty array of correct length to prevent crashes
  const [quotes, setQuotes] = useState<Quote[]>(() =>
    Array(count).fill(null)
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    // Use setTimeout to prevent blocking render
    const timer = setTimeout(() => {
      setQuotes(getRandomQuotes(count));
      setIsLoading(false);
    }, 0);

    return () => clearTimeout(timer);
  }, [count]);

  return { quotes, isLoading };
};
