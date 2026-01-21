import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import Header from '@/components/Header';
import Starfield from '@/components/Starfield';
import InputTabs from '@/components/InputTabs';
import TextInput from '@/components/TextInput';
import MediaUpload from '@/components/MediaUpload';
import LoadingState3D from '@/components/LoadingState3D';
import AnalysisResults from '@/components/AnalysisResults';

type InputType = 'text' | 'audio' | 'video';

interface EmotionScores {
  Happy: number;
  Sad: number;
  Anger: number;
  Fear: number;
  Surprise: number;
  Neutral: number;
}

interface AnalysisResult {
  emotions: EmotionScores;
  transcription?: string;
  keyThemes?: string[];
}

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState<InputType>('text');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  const handleAnalyzeText = async (text: string) => {
    setIsLoading(true);
    setResult(null);

    try {
      const { data, error } = await supabase.functions.invoke('analyze-text', {
        body: { text },
      });

      if (error) throw new Error(error.message);

      if (data.status === 'error') {
        throw new Error(data.message);
      }

      setResult({
        emotions: data.emotions,
        keyThemes: data.keyThemes,
      });
    } catch (error: any) {
      console.error('Analysis error:', error);
      toast.error(error.message || 'Failed to analyze text');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnalyzeMedia = async (file: File, type: 'audio' | 'video') => {
    setIsLoading(true);
    setResult(null);

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Upload file to storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('media-files')
        .upload(fileName, file);

      if (uploadError) throw new Error('Failed to upload file');

      // Get the file URL
      const { data: { publicUrl } } = supabase.storage
        .from('media-files')
        .getPublicUrl(fileName);

      // Convert file to base64 for edge function
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onload = () => {
          const base64 = (reader.result as string).split(',')[1];
          resolve(base64);
        };
        reader.onerror = reject;
      });
      reader.readAsDataURL(file);
      const base64Data = await base64Promise;

      // Call appropriate edge function
      const functionName = type === 'audio' ? 'analyze-audio' : 'analyze-video';
      const { data, error } = await supabase.functions.invoke(functionName, {
        body: { 
          audioData: base64Data,
          mimeType: file.type,
          fileName: file.name,
        },
      });

      if (error) throw new Error(error.message);

      if (data.status === 'error') {
        throw new Error(data.message);
      }

      setResult({
        emotions: data.emotions,
        transcription: data.transcription,
        keyThemes: data.keyThemes,
      });
    } catch (error: any) {
      console.error('Analysis error:', error);
      toast.error(error.message || `Failed to analyze ${type}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setResult(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <Starfield />
      <Header />

      <main className="pt-24 pb-12 px-4">
        <div className="max-w-2xl mx-auto">
          {/* Title */}
          <div className="text-center mb-10">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="text-foreground">Sentiment </span>
              <span className="gradient-text">Analysis</span>
            </h1>
            <p className="text-muted-foreground text-lg">
              Analyze emotions in text, audio, or video with AI
            </p>
          </div>

          {/* Show results or input interface */}
          {result ? (
            <AnalysisResults
              emotions={result.emotions}
              transcription={result.transcription}
              keyThemes={result.keyThemes}
              onReset={handleReset}
            />
          ) : isLoading ? (
            <LoadingState3D />
          ) : (
            <>
              {/* Input Tabs */}
              <div className="mb-8">
                <InputTabs activeTab={activeTab} onTabChange={setActiveTab} />
              </div>

              {/* Input Content */}
              {activeTab === 'text' && (
                <TextInput onAnalyze={handleAnalyzeText} isLoading={isLoading} />
              )}
              {activeTab === 'audio' && (
                <MediaUpload
                  type="audio"
                  onAnalyze={(file) => handleAnalyzeMedia(file, 'audio')}
                  isLoading={isLoading}
                />
              )}
              {activeTab === 'video' && (
                <MediaUpload
                  type="video"
                  onAnalyze={(file) => handleAnalyzeMedia(file, 'video')}
                  isLoading={isLoading}
                />
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
