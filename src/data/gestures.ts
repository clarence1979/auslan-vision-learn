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
  { id: 'a', name: 'A', category: 'alphabet', description: 'Letter A in AUSLAN', instructions: 'Make a fist with thumb pointing up alongside the index finger', difficulty: 'easy', imageUrl: '/auslan-a.jpg' },
  { id: 'b', name: 'B', category: 'alphabet', description: 'Letter B in AUSLAN', instructions: 'Hold hand flat, fingers together pointing up, thumb across palm', difficulty: 'easy', imageUrl: '/auslan-b.jpg' },
  { id: 'c', name: 'C', category: 'alphabet', description: 'Letter C in AUSLAN', instructions: 'Curve hand into C shape', difficulty: 'easy', imageUrl: '/auslan-c.jpg' },
  { id: 'd', name: 'D', category: 'alphabet', description: 'Letter D in AUSLAN', instructions: 'Index finger up, other fingers and thumb form circle', difficulty: 'easy', imageUrl: '/auslan-d.jpg' },
  { id: 'e', name: 'E', category: 'alphabet', description: 'Letter E in AUSLAN', instructions: 'Curl fingertips to touch thumb', difficulty: 'easy', imageUrl: '/auslan-e.jpg' },
  { id: 'f', name: 'F', category: 'alphabet', description: 'Letter F in AUSLAN', instructions: 'Index and middle finger up, thumb touches ring finger', difficulty: 'easy', imageUrl: '/auslan-f.jpg' },
  { id: 'g', name: 'G', category: 'alphabet', description: 'Letter G in AUSLAN', instructions: 'Point index finger sideways, thumb up', difficulty: 'easy', imageUrl: '/auslan-g.jpg' },
  { id: 'h', name: 'H', category: 'alphabet', description: 'Letter H in AUSLAN', instructions: 'Index and middle finger sideways, other fingers folded', difficulty: 'easy', imageUrl: '/auslan-h.jpg' },
  { id: 'i', name: 'I', category: 'alphabet', description: 'Letter I in AUSLAN', instructions: 'Little finger up, other fingers folded', difficulty: 'easy', imageUrl: '/auslan-i.jpg' },
  { id: 'j', name: 'J', category: 'alphabet', description: 'Letter J in AUSLAN', instructions: 'Little finger up, move in J motion', difficulty: 'medium', imageUrl: '/auslan-j.jpg' },
  { id: 'k', name: 'K', category: 'alphabet', description: 'Letter K in AUSLAN', instructions: 'Index up, middle finger touches thumb', difficulty: 'medium', imageUrl: '/auslan-k.jpg' },
  { id: 'l', name: 'L', category: 'alphabet', description: 'Letter L in AUSLAN', instructions: 'Index finger up, thumb out to form L shape', difficulty: 'easy', imageUrl: '/auslan-l.jpg' },
  { id: 'm', name: 'M', category: 'alphabet', description: 'Letter M in AUSLAN', instructions: 'Three fingers over thumb, pinky up', difficulty: 'medium', imageUrl: '/auslan-m.jpg' },
  { id: 'n', name: 'N', category: 'alphabet', description: 'Letter N in AUSLAN', instructions: 'Two fingers over thumb', difficulty: 'medium', imageUrl: '/auslan-n.jpg' },
  { id: 'o', name: 'O', category: 'alphabet', description: 'Letter O in AUSLAN', instructions: 'Form circle with fingers and thumb', difficulty: 'easy', imageUrl: '/auslan-o.jpg' },
  { id: 'p', name: 'P', category: 'alphabet', description: 'Letter P in AUSLAN', instructions: 'Index finger down, middle finger touches thumb', difficulty: 'medium', imageUrl: '/auslan-p.jpg' },
  { id: 'q', name: 'Q', category: 'alphabet', description: 'Letter Q in AUSLAN', instructions: 'Index finger down, thumb up', difficulty: 'medium', imageUrl: '/auslan-q.jpg' },
  { id: 'r', name: 'R', category: 'alphabet', description: 'Letter R in AUSLAN', instructions: 'Cross index and middle fingers', difficulty: 'medium', imageUrl: '/auslan-r.jpg' },
  { id: 's', name: 'S', category: 'alphabet', description: 'Letter S in AUSLAN', instructions: 'Make fist with thumb in front', difficulty: 'easy', imageUrl: '/auslan-s.jpg' },
  { id: 't', name: 'T', category: 'alphabet', description: 'Letter T in AUSLAN', instructions: 'Thumb between index and middle finger', difficulty: 'medium', imageUrl: '/auslan-t.jpg' },
  { id: 'u', name: 'U', category: 'alphabet', description: 'Letter U in AUSLAN', instructions: 'Index and middle finger up together', difficulty: 'easy', imageUrl: '/auslan-u.jpg' },
  { id: 'v', name: 'V', category: 'alphabet', description: 'Letter V in AUSLAN', instructions: 'Index and middle finger up in V shape', difficulty: 'easy', imageUrl: '/auslan-v.jpg' },
  { id: 'w', name: 'W', category: 'alphabet', description: 'Letter W in AUSLAN', instructions: 'Three fingers up - index, middle, ring', difficulty: 'easy', imageUrl: '/auslan-w.jpg' },
  { id: 'x', name: 'X', category: 'alphabet', description: 'Letter X in AUSLAN', instructions: 'Index finger curved like a hook', difficulty: 'medium', imageUrl: '/auslan-x.jpg' },
  { id: 'y', name: 'Y', category: 'alphabet', description: 'Letter Y in AUSLAN', instructions: 'Thumb and pinky up, other fingers folded', difficulty: 'easy', imageUrl: '/auslan-y.jpg' },
  { id: 'z', name: 'Z', category: 'alphabet', description: 'Letter Z in AUSLAN', instructions: 'Index finger traces Z motion in air', difficulty: 'medium', imageUrl: '/auslan-z.jpg' },
  
  // Numbers
  { id: '0', name: '0', category: 'numbers', description: 'Number zero in AUSLAN', instructions: 'Make a fist with thumb tucked inside', difficulty: 'easy', imageUrl: '/auslan-0-new.jpg' },
  { id: '1', name: '1', category: 'numbers', description: 'Number one in AUSLAN', instructions: 'Hold up index finger', difficulty: 'easy', imageUrl: '/auslan-1-new.jpg' },
  { id: '2', name: '2', category: 'numbers', description: 'Number two in AUSLAN', instructions: 'Hold up index and middle fingers', difficulty: 'easy', imageUrl: '/auslan-2-new.jpg' },
  { id: '3', name: '3', category: 'numbers', description: 'Number three in AUSLAN', instructions: 'Hold up index, middle, and ring fingers', difficulty: 'easy', imageUrl: '/auslan-3-new.jpg' },
  { id: '4', name: '4', category: 'numbers', description: 'Number four in AUSLAN', instructions: 'Hold up four fingers, thumb tucked', difficulty: 'easy', imageUrl: '/auslan-4-new.jpg' },
  { id: '5', name: '5', category: 'numbers', description: 'Number five in AUSLAN', instructions: 'Hold up all five fingers', difficulty: 'easy', imageUrl: '/auslan-5-new.jpg' },
  { id: '6', name: '6', category: 'numbers', description: 'Number six in AUSLAN', instructions: 'Touch thumb to pinky, other fingers up', difficulty: 'easy', imageUrl: '/auslan-6-new.jpg' },
  { id: '7', name: '7', category: 'numbers', description: 'Number seven in AUSLAN', instructions: 'Touch thumb to ring finger, other fingers up', difficulty: 'easy', imageUrl: '/auslan-7-new.jpg' },
  { id: '8', name: '8', category: 'numbers', description: 'Number eight in AUSLAN', instructions: 'Touch thumb to middle finger, other fingers up', difficulty: 'easy', imageUrl: '/auslan-8-new.jpg' },
  { id: '9', name: '9', category: 'numbers', description: 'Number nine in AUSLAN', instructions: 'Touch thumb to index finger, other fingers up', difficulty: 'easy', imageUrl: '/auslan-9-new.jpg' },
  
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