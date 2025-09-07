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
  { id: 'b', name: 'B', category: 'alphabet', description: 'Letter B in AUSLAN', instructions: 'Hold hand flat, fingers together pointing up, thumb across palm', difficulty: 'easy', imageUrl: '/lovable-uploads/2d13841b-6c51-4d18-a460-cc678e0d7068.png' },
  { id: 'c', name: 'C', category: 'alphabet', description: 'Letter C in AUSLAN', instructions: 'Curve hand into C shape', difficulty: 'easy', imageUrl: '/src/assets/auslan-c.jpg' },
  { id: 'd', name: 'D', category: 'alphabet', description: 'Letter D in AUSLAN', instructions: 'Index finger up, other fingers and thumb form circle', difficulty: 'easy', imageUrl: '/src/assets/auslan-d.jpg' },
  { id: 'e', name: 'E', category: 'alphabet', description: 'Letter E in AUSLAN', instructions: 'Curl fingertips to touch thumb', difficulty: 'easy', imageUrl: '/src/assets/auslan-e.jpg' },
  { id: 'f', name: 'F', category: 'alphabet', description: 'Letter F in AUSLAN', instructions: 'Index and middle finger up, thumb touches ring finger', difficulty: 'easy', imageUrl: '/src/assets/auslan-f.jpg' },
  { id: 'g', name: 'G', category: 'alphabet', description: 'Letter G in AUSLAN', instructions: 'Point index finger sideways, thumb up', difficulty: 'easy', imageUrl: '/src/assets/auslan-g.jpg' },
  { id: 'h', name: 'H', category: 'alphabet', description: 'Letter H in AUSLAN', instructions: 'Index and middle finger sideways, other fingers folded', difficulty: 'easy', imageUrl: '/src/assets/auslan-h.jpg' },
  { id: 'i', name: 'I', category: 'alphabet', description: 'Letter I in AUSLAN', instructions: 'Little finger up, other fingers folded', difficulty: 'easy', imageUrl: '/src/assets/auslan-i.jpg' },
  { id: 'j', name: 'J', category: 'alphabet', description: 'Letter J in AUSLAN', instructions: 'Little finger up, move in J motion', difficulty: 'medium', imageUrl: '/src/assets/auslan-j.jpg' },
  { id: 'k', name: 'K', category: 'alphabet', description: 'Letter K in AUSLAN', instructions: 'Index up, middle finger touches thumb', difficulty: 'medium', imageUrl: '/src/assets/auslan-k.jpg' },
  { id: 'l', name: 'L', category: 'alphabet', description: 'Letter L in AUSLAN', instructions: 'Index finger up, thumb out to form L shape', difficulty: 'easy', imageUrl: '/src/assets/auslan-l.jpg' },
  { id: 'm', name: 'M', category: 'alphabet', description: 'Letter M in AUSLAN', instructions: 'Three fingers over thumb, pinky up', difficulty: 'medium', imageUrl: '/src/assets/auslan-m.jpg' },
  { id: 'n', name: 'N', category: 'alphabet', description: 'Letter N in AUSLAN', instructions: 'Two fingers over thumb', difficulty: 'medium', imageUrl: '/src/assets/auslan-n.jpg' },
  { id: 'o', name: 'O', category: 'alphabet', description: 'Letter O in AUSLAN', instructions: 'Form circle with fingers and thumb', difficulty: 'easy', imageUrl: '/src/assets/auslan-o.jpg' },
  { id: 'p', name: 'P', category: 'alphabet', description: 'Letter P in AUSLAN', instructions: 'Index finger down, middle finger touches thumb', difficulty: 'medium', imageUrl: '/src/assets/auslan-p.jpg' },
  { id: 'q', name: 'Q', category: 'alphabet', description: 'Letter Q in AUSLAN', instructions: 'Index finger down, thumb up', difficulty: 'medium', imageUrl: '/src/assets/auslan-q.jpg' },
  { id: 'r', name: 'R', category: 'alphabet', description: 'Letter R in AUSLAN', instructions: 'Cross index and middle fingers', difficulty: 'medium', imageUrl: '/src/assets/auslan-r.jpg' },
  { id: 's', name: 'S', category: 'alphabet', description: 'Letter S in AUSLAN', instructions: 'Make fist with thumb in front', difficulty: 'easy', imageUrl: '/src/assets/auslan-s.jpg' },
  { id: 't', name: 'T', category: 'alphabet', description: 'Letter T in AUSLAN', instructions: 'Thumb between index and middle finger', difficulty: 'medium', imageUrl: '/src/assets/auslan-t.jpg' },
  { id: 'u', name: 'U', category: 'alphabet', description: 'Letter U in AUSLAN', instructions: 'Index and middle finger up together', difficulty: 'easy', imageUrl: '/src/assets/auslan-u.jpg' },
  { id: 'v', name: 'V', category: 'alphabet', description: 'Letter V in AUSLAN', instructions: 'Index and middle finger up in V shape', difficulty: 'easy', imageUrl: '/src/assets/auslan-v.jpg' },
  { id: 'w', name: 'W', category: 'alphabet', description: 'Letter W in AUSLAN', instructions: 'Three fingers up - index, middle, ring', difficulty: 'easy', imageUrl: '/src/assets/auslan-w.jpg' },
  { id: 'x', name: 'X', category: 'alphabet', description: 'Letter X in AUSLAN', instructions: 'Index finger curved like a hook', difficulty: 'medium', imageUrl: '/src/assets/auslan-x.jpg' },
  { id: 'y', name: 'Y', category: 'alphabet', description: 'Letter Y in AUSLAN', instructions: 'Thumb and pinky up, other fingers folded', difficulty: 'easy', imageUrl: '/src/assets/auslan-y.jpg' },
  { id: 'z', name: 'Z', category: 'alphabet', description: 'Letter Z in AUSLAN', instructions: 'Index finger traces Z motion in air', difficulty: 'medium', imageUrl: '/src/assets/auslan-z.jpg' },
  
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