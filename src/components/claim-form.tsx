'use client';

import { useState, useEffect, useRef } from 'react';
import type { Vertical } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Loader2, Zap, Mic, MicOff } from 'lucide-react';

interface ClaimFormProps {
  onSubmit: (claim: string, verticals: Vertical[]) => void;
  isLoading: boolean;
}

const ALL_VERTICALS: Vertical[] = ['Finance', 'Fitness', 'Career', 'Relationships', 'Famous Personas', 'History', 'Medicine'];

export function ClaimForm({ onSubmit, isLoading }: ClaimFormProps) {
  const [claim, setClaim] = useState('');
  const [selectedVerticals, setSelectedVerticals] = useState<Vertical[]>(['Finance']);
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.onresult = (event) => {
        let interimTranscript = '';
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }
        setClaim(claim => claim + finalTranscript);
      };
      recognitionRef.current = recognition;
    }

    return () => {
        recognitionRef.current?.stop();
    }
  }, []);

  const toggleRecording = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
    } else {
      setClaim('');
      recognitionRef.current?.start();
      setIsRecording(true);
    }
  };


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (claim.trim() && selectedVerticals.length > 0) {
      onSubmit(claim, selectedVerticals);
    }
  };

  const handleVerticalChange = (vertical: Vertical) => {
    setSelectedVerticals(prev => 
      prev.includes(vertical) 
        ? prev.filter(v => v !== vertical) 
        : [...prev, vertical]
    );
  };

  return (
    <Card className="w-full shadow-lg border-2 border-accent/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-accent">
          <Zap className="h-6 w-6" />
          Self-Deception Radar
        </CardTitle>
        <CardDescription>Enter a statement to analyze it for potential self-deception. You can also use your voice.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2 relative">
            <Label htmlFor="claim-input">Your Statement</Label>
            <Textarea
              id="claim-input"
              value={claim}
              onChange={(e) => setClaim(e.target.value)}
              placeholder="e.g., 'Buying options is always better than buying stocks. Even though it has less upside, it is less risky.'"
              rows={4}
              className="resize-none pr-12"
              disabled={isLoading}
            />
            {recognitionRef.current && (
                <Button
                    type="button"
                    variant={isRecording ? "destructive" : "outline"}
                    size="icon"
                    className="absolute bottom-2 right-2"
                    onClick={toggleRecording}
                    disabled={isLoading}
                >
                    {isRecording ? <MicOff /> : <Mic />}
                    <span className="sr-only">{isRecording ? 'Stop recording' : 'Start recording'}</span>
                </Button>
            )}
          </div>
          <div className="space-y-3">
            <Label>Select Vertical</Label>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
              {ALL_VERTICALS.map((v) => (
                <div key={v} className="flex items-center space-x-2">
                  <Checkbox
                    id={v.toLowerCase().replace(' ', '-')}
                    checked={selectedVerticals.includes(v)}
                    onCheckedChange={() => handleVerticalChange(v)}
                    disabled={isLoading}
                  />
                  <Label htmlFor={v.toLowerCase().replace(' ', '-')} className="font-normal">{v}</Label>
                </div>
              ))}
            </div>
          </div>
          <Button type="submit" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground" disabled={isLoading || !claim.trim() || selectedVerticals.length === 0}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              'Activate Radar'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
