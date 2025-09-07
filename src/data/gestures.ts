export interface Gesture {
  id: string;
  name: string;
  category: 'alphabet' | 'numbers' | 'greetings' | 'common';
  description: string;
  instructions: string;
  difficulty: 'easy' | 'medium' | 'hard';
  imageUrl?: string;
  videoUrl?: string;
}

export const AUSLAN_GESTURES: Gesture[] = [
  // Alphabet
  { id: 'a', name: 'A', category: 'alphabet', description: 'Letter A in AUSLAN', instructions: 'Make a fist with thumb pointing up alongside the index finger', difficulty: 'easy', imageUrl: '/lovable-uploads/32e96632-2de5-4631-861b-31e4dcdd6e3a.png' },
  { id: 'b', name: 'B', category: 'alphabet', description: 'Letter B in AUSLAN', instructions: 'Hold hand flat, fingers together pointing up, thumb across palm', difficulty: 'easy' },
  { id: 'c', name: 'C', category: 'alphabet', description: 'Letter C in AUSLAN', instructions: 'Curve hand into C shape', difficulty: 'easy' },
  { id: 'd', name: 'D', category: 'alphabet', description: 'Letter D in AUSLAN', instructions: 'Index finger up, other fingers and thumb form circle', difficulty: 'easy' },
  { id: 'e', name: 'E', category: 'alphabet', description: 'Letter E in AUSLAN', instructions: 'Curl fingertips to touch thumb', difficulty: 'easy' },
  
  // Numbers
  { id: '1', name: '1', category: 'numbers', description: 'Number one in AUSLAN', instructions: 'Hold up index finger', difficulty: 'easy' },
  { id: '2', name: '2', category: 'numbers', description: 'Number two in AUSLAN', instructions: 'Hold up index and middle fingers', difficulty: 'easy' },
  { id: '3', name: '3', category: 'numbers', description: 'Number three in AUSLAN', instructions: 'Hold up index, middle, and ring fingers', difficulty: 'easy' },
  { id: '4', name: '4', category: 'numbers', description: 'Number four in AUSLAN', instructions: 'Hold up four fingers, thumb tucked', difficulty: 'easy' },
  { id: '5', name: '5', category: 'numbers', description: 'Number five in AUSLAN', instructions: 'Hold up all five fingers', difficulty: 'easy' },
  
  // Greetings
  { id: 'hello', name: 'Hello', category: 'greetings', description: 'Hello greeting in AUSLAN', instructions: 'Wave hand from side to side with palm facing forward', difficulty: 'easy' },
  { id: 'goodbye', name: 'Goodbye', category: 'greetings', description: 'Goodbye gesture in AUSLAN', instructions: 'Wave hand with fingers closing and opening', difficulty: 'easy' },
  { id: 'thankyou', name: 'Thank You', category: 'greetings', description: 'Thank you in AUSLAN', instructions: 'Touch fingertips to chin then move hand forward', difficulty: 'medium' },
  { id: 'please', name: 'Please', category: 'greetings', description: 'Please in AUSLAN', instructions: 'Rub palm in circular motion on chest', difficulty: 'medium' },
  
  // Common words
  { id: 'yes', name: 'Yes', category: 'common', description: 'Yes in AUSLAN', instructions: 'Nod fist up and down', difficulty: 'easy' },
  { id: 'no', name: 'No', category: 'common', description: 'No in AUSLAN', instructions: 'Index and middle finger tap thumb', difficulty: 'easy' },
  { id: 'water', name: 'Water', category: 'common', description: 'Water in AUSLAN', instructions: 'Tap index finger on side of mouth', difficulty: 'medium' },
  { id: 'food', name: 'Food', category: 'common', description: 'Food in AUSLAN', instructions: 'Bring fingertips to mouth repeatedly', difficulty: 'medium' },
];

export const GESTURE_CATEGORIES = [
  { id: 'alphabet', name: 'Alphabet', description: 'Letters A-Z in AUSLAN', color: 'primary' },
  { id: 'numbers', name: 'Numbers', description: 'Numbers 0-9 in AUSLAN', color: 'learning' },
  { id: 'greetings', name: 'Greetings', description: 'Common greetings and polite phrases', color: 'practice' },
  { id: 'common', name: 'Common Words', description: 'Everyday words and phrases', color: 'success' },
] as const;