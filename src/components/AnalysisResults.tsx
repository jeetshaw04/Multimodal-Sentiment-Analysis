import { Button } from '@/components/ui/button';

interface EmotionScores {
  Happy: number;
  Sad: number;
  Anger: number;
  Fear: number;
  Surprise: number;
  Neutral: number;
}

interface AnalysisResultsProps {
  emotions: EmotionScores;
  transcription?: string;
  keyThemes?: string[];
  onReset: () => void;
}

const AnalysisResults = ({ emotions, transcription, keyThemes, onReset }: AnalysisResultsProps) => {
  const emotionColors: Record<keyof EmotionScores, string> = {
    Happy: 'bg-emotion-happy',
    Sad: 'bg-emotion-sad',
    Anger: 'bg-emotion-anger',
    Fear: 'bg-emotion-fear',
    Surprise: 'bg-emotion-surprise',
    Neutral: 'bg-emotion-neutral',
  };

  const emotionBarColors: Record<keyof EmotionScores, string> = {
    Happy: 'bg-emerald-500',
    Sad: 'bg-blue-500',
    Anger: 'bg-red-500',
    Fear: 'bg-purple-500',
    Surprise: 'bg-yellow-500',
    Neutral: 'bg-gray-500',
  };

  // Find dominant emotion
  const dominantEmotion = Object.entries(emotions).reduce((a, b) => 
    a[1] > b[1] ? a : b
  )[0] as keyof EmotionScores;

  const confidence = Math.round(emotions[dominantEmotion]);

  // Determine overall sentiment
  const getOverallSentiment = () => {
    if (emotions.Happy > 40 || emotions.Surprise > 40) return { label: 'Positive', color: 'bg-emerald-500' };
    if (emotions.Sad > 40 || emotions.Anger > 40 || emotions.Fear > 40) return { label: 'Negative', color: 'bg-red-500' };
    return { label: 'Neutral', color: 'bg-gray-500' };
  };

  const overall = getOverallSentiment();

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Overall Sentiment */}
      <div className="glass-card p-6">
        <h3 className="text-lg font-semibold text-indisense-purple mb-6">Overall Sentiment</h3>
        <div className="flex flex-col items-center gap-4">
          <div className={`w-24 h-24 rounded-full ${overall.color} flex items-center justify-center shadow-lg`}>
            <div className="w-20 h-20 rounded-full bg-background/20" />
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-foreground">{overall.label}</p>
            <p className="text-muted-foreground text-sm">Confidence: {confidence}%</p>
          </div>
        </div>
      </div>

      {/* Emotional Breakdown */}
      <div className="glass-card p-6">
        <h3 className="text-lg font-semibold text-indisense-purple mb-6">Emotional Breakdown</h3>
        
        {/* Bar Chart Visualization */}
        <div className="flex items-end justify-center gap-3 h-32 mb-8">
          {Object.entries(emotions).map(([emotion, value]) => (
            <div key={emotion} className="flex flex-col items-center gap-2">
              <div 
                className={`w-6 rounded-t ${emotionBarColors[emotion as keyof EmotionScores]} transition-all duration-500`}
                style={{ height: `${Math.max(value, 5)}%` }}
              />
              <span className="text-xs text-muted-foreground">{emotion.charAt(0)}</span>
            </div>
          ))}
        </div>

        {/* Emotion Bars */}
        <div className="grid grid-cols-3 gap-4">
          {Object.entries(emotions).map(([emotion, value]) => (
            <div key={emotion} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-foreground">{emotion}</span>
                <span className="text-sm text-muted-foreground">{Math.round(value)}%</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className={`h-full ${emotionBarColors[emotion as keyof EmotionScores]} transition-all duration-500`}
                  style={{ width: `${value}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Key Themes */}
      {keyThemes && keyThemes.length > 0 && (
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold text-indisense-purple mb-4">Key Themes</h3>
          <div className="flex flex-wrap gap-2">
            {keyThemes.map((theme, index) => (
              <span 
                key={index}
                className="px-3 py-1.5 bg-indisense-purple/20 text-indisense-purple rounded-full text-sm"
              >
                {theme}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Transcription */}
      {transcription && (
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold text-indisense-purple mb-4">Transcription</h3>
          <p className="text-muted-foreground text-sm leading-relaxed">{transcription}</p>
        </div>
      )}

      {/* Analyze Another Button */}
      <Button
        onClick={onReset}
        variant="gradient"
        size="xl"
        className="w-full"
      >
        Analyze Another
      </Button>
    </div>
  );
};

export default AnalysisResults;
