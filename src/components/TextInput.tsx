import { useState } from 'react';
import { Button } from '@/components/ui/button';

interface TextInputProps {
  onAnalyze: (text: string) => void;
  isLoading: boolean;
}

const TextInput = ({ onAnalyze, isLoading }: TextInputProps) => {
  const [text, setText] = useState('');

  const handleSubmit = () => {
    if (text.trim()) {
      onAnalyze(text.trim());
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="glass-card p-1 rounded-2xl">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Enter text to analyze sentiment..."
          className="w-full h-48 p-4 bg-transparent border-none resize-none text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-0"
          disabled={isLoading}
        />
      </div>
      <Button
        onClick={handleSubmit}
        disabled={!text.trim() || isLoading}
        variant="gradient"
        size="xl"
        className="w-full"
      >
        {isLoading ? 'Analyzing...' : 'Analyze Sentiment'}
      </Button>
    </div>
  );
};

export default TextInput;
