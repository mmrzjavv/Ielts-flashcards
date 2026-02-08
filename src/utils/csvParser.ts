import { Card } from '@/types';

export const parseCSV = (csvText: string): Card[] => {
  const lines = csvText.split('\n').filter(line => line.trim() !== '');
  const cards: Card[] = [];

  for (const line of lines) {
    // Handle quotes if necessary, but simple split for now based on sample
    // sample: journalist,/ˈdʒɜːr.nə.lɪst/,روزنامه‌نگار
    const parts = line.split(',');
    
    if (parts.length >= 3) {
      cards.push({
        word: parts[0].trim(),
        phonetic: parts[1].trim(),
        meaning: parts.slice(2).join(',').trim() // Join rest in case meaning has commas
      });
    }
  }

  return cards;
};
