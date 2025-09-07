import React from 'react';

const TestIndex = () => {
  console.log('TestIndex component loaded successfully');
  
  return (
    <div className="min-h-screen bg-background text-foreground p-8">
      <h1 className="text-2xl font-bold">Test Page Loaded Successfully</h1>
      <p>If you can see this, the basic React app is working.</p>
    </div>
  );
};

export default TestIndex;