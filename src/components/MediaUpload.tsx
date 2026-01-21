import { useState, useRef, useCallback } from 'react';
import { Upload, Mic, Video, Square, Circle } from 'lucide-react';
import { Button } from '@/components/ui/button';

type MediaType = 'audio' | 'video';
type Mode = 'upload' | 'record';

interface MediaUploadProps {
  type: MediaType;
  onAnalyze: (file: File) => void;
  isLoading: boolean;
}

const MediaUpload = ({ type, onAnalyze, isLoading }: MediaUploadProps) => {
  const [mode, setMode] = useState<Mode>('upload');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const videoPreviewRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const acceptedTypes = type === 'audio' 
    ? 'audio/*' 
    : 'video/*';

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setRecordedBlob(null);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      setSelectedFile(file);
      setRecordedBlob(null);
    }
  }, []);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const startRecording = async () => {
    try {
      const constraints = type === 'audio' 
        ? { audio: true } 
        : { audio: true, video: true };
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      
      if (type === 'video' && videoPreviewRef.current) {
        videoPreviewRef.current.srcObject = stream;
        videoPreviewRef.current.play();
      }

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const mimeType = type === 'audio' ? 'audio/webm' : 'video/webm';
        const blob = new Blob(chunksRef.current, { type: mimeType });
        setRecordedBlob(blob);
        setSelectedFile(null);
        
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
        }
        if (videoPreviewRef.current) {
          videoPreviewRef.current.srcObject = null;
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error('Error accessing media devices:', err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleAnalyze = () => {
    if (selectedFile) {
      onAnalyze(selectedFile);
    } else if (recordedBlob) {
      const extension = type === 'audio' ? 'webm' : 'webm';
      const file = new File([recordedBlob], `recording.${extension}`, { 
        type: recordedBlob.type 
      });
      onAnalyze(file);
    }
  };

  const hasContent = selectedFile || recordedBlob;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Mode Toggle */}
      <div className="flex items-center justify-center">
        <div className="inline-flex items-center gap-1 p-1 rounded-full border border-border bg-card/50">
          <button
            onClick={() => setMode('upload')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-medium transition-all duration-300 ${
              mode === 'upload'
                ? 'gradient-button text-foreground shadow-lg'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Upload className="w-4 h-4" />
            <span>Upload</span>
          </button>
          <button
            onClick={() => setMode('record')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-medium transition-all duration-300 ${
              mode === 'record'
                ? 'gradient-button text-foreground shadow-lg'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {type === 'audio' ? <Mic className="w-4 h-4" /> : <Video className="w-4 h-4" />}
            <span>Record Live</span>
          </button>
        </div>
      </div>

      {/* Upload Zone */}
      {mode === 'upload' && (
        <div
          className="upload-zone p-12 text-center"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={acceptedTypes}
            onChange={handleFileSelect}
            className="hidden"
          />
          <div className="flex flex-col items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-indisense-purple/20 flex items-center justify-center">
              <Upload className="w-10 h-10 text-indisense-pink" />
            </div>
            <div>
              <p className="text-foreground font-medium text-lg">
                Drop your {type} file here
              </p>
              <p className="text-muted-foreground text-sm mt-1">
                or click to browse
              </p>
            </div>
            {selectedFile && (
              <p className="text-primary text-sm mt-2">
                Selected: {selectedFile.name}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Record Zone */}
      {mode === 'record' && (
        <div className="glass-card p-8 text-center">
          {type === 'video' && (
            <div className="mb-6 rounded-xl overflow-hidden bg-muted aspect-video">
              <video
                ref={videoPreviewRef}
                className="w-full h-full object-cover"
                muted
                playsInline
              />
            </div>
          )}
          
          <div className="flex flex-col items-center gap-6">
            {!isRecording ? (
              <button
                onClick={startRecording}
                className="w-24 h-24 rounded-full bg-destructive/20 hover:bg-destructive/30 flex items-center justify-center transition-all duration-300 group"
              >
                <Circle className="w-12 h-12 text-destructive fill-destructive group-hover:scale-110 transition-transform" />
              </button>
            ) : (
              <button
                onClick={stopRecording}
                className="w-24 h-24 rounded-full bg-destructive/30 flex items-center justify-center animate-pulse"
              >
                <Square className="w-10 h-10 text-destructive fill-destructive" />
              </button>
            )}
            <p className="text-muted-foreground">
              {isRecording 
                ? 'Recording... Click to stop' 
                : recordedBlob 
                  ? 'Recording saved! Click analyze to process.'
                  : `Click to start ${type} recording`
              }
            </p>
          </div>
        </div>
      )}

      {/* Analyze Button */}
      <Button
        onClick={handleAnalyze}
        disabled={!hasContent || isLoading || isRecording}
        variant="gradient"
        size="xl"
        className="w-full"
      >
        {isLoading ? 'Analyzing...' : 'Analyze Sentiment'}
      </Button>
    </div>
  );
};

export default MediaUpload;
