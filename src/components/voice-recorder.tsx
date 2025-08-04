'use client';

import { useState, useRef } from 'react';
import { Mic, MicOff, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { handleTranscription } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface VoiceRecorderProps {
  onTranscription: (text: string) => void;
  className?: string;
}

export function VoiceRecorder({ onTranscription, className }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const { toast } = useToast();

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = async () => {
          const base64Audio = reader.result as string;
          setIsTranscribing(true);
          const result = await handleTranscription(base64Audio);
          setIsTranscribing(false);
          if (result.error || !result.data) {
            toast({
              variant: 'destructive',
              title: 'Transcription Failed',
              description: result.error || 'Could not process your voice input.',
            });
          } else {
            onTranscription(result.data.transcription);
            toast({
              title: 'Transcription Successful',
              description: 'Your voice has been converted to text.',
            });
          }
        };
        // Stop all tracks to turn off the microphone indicator
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      toast({
        variant: 'destructive',
        title: 'Microphone Error',
        description: 'Could not access the microphone. Please check your browser permissions.',
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleToggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  return (
    <Button
      type="button"
      size="icon"
      onClick={handleToggleRecording}
      disabled={isTranscribing}
      className={cn(
        'absolute top-1/2 right-3 -translate-y-1/2 rounded-full',
        isRecording && 'bg-red-500 hover:bg-red-600 animate-pulse',
        className
      )}
      aria-label={isRecording ? 'Stop recording' : 'Start recording'}
    >
      {isTranscribing ? (
        <Loader2 className="h-5 w-5 animate-spin" />
      ) : isRecording ? (
        <MicOff className="h-5 w-5" />
      ) : (
        <Mic className="h-5 w-5" />
      )}
    </Button>
  );
}
