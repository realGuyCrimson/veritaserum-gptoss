
'use client';

import { useState, useEffect, useRef } from 'react';
import type { DeceptionAnalysis, LogEntry, Vertical, DebateResult, DiagnosisItem } from '@/lib/types';
import { runDefaultAudio } from '@/app/actions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Save, AlertTriangle, Volume2, Play, Pause, CheckCircle2, CircleAlert } from 'lucide-react';
import { Skeleton } from './ui/skeleton';
import { Progress } from './ui/progress';
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from './ui/tooltip';

interface AnalysisResultProps {
  claimData: { claim: string; verticals: Vertical[] } | null;
  analysis: DeceptionAnalysis | null;
  debate: DebateResult | null;
  isLoading: boolean;
  error: string | null;
  onSaveToLog: (logEntry: Omit<LogEntry, 'id' | 'timestamp'>) => void;
}

const formatTextAsBullets = (text: string) => {
    return text.trim().split('. ').filter(sentence => sentence).map(sentence => sentence.endsWith('.') ? sentence : sentence + '.');
}


export function AnalysisResult({ claimData, analysis, debate, isLoading, error, onSaveToLog }: AnalysisResultProps) {
  const [overviewAudioUri, setOverviewAudioUri] = useState<string | null>(null);
  const [isOverviewAudioLoading, setIsOverviewAudioLoading] = useState(false);
  const [isOverviewPlaying, setIsOverviewPlaying] = useState(false);

  const [isAdvocatePlaying, setIsAdvocatePlaying] = useState(false);
  const [isSkepticPlaying, setIsSkepticPlaying] = useState(false);

  const overviewAudioRef = useRef<HTMLAudioElement | null>(null);
  const advocateAudioRef = useRef<HTMLAudioElement | null>(null);
  const skepticAudioRef = useRef<HTMLAudioElement | null>(null);
  
  const plainTextDiagnosis = (analysis?.diagnosis || []).map(d => `${d.bias}: ${d.diagnosis}`).join('\n');
  
  // Audio generation is now on-demand
  const handleFetchOverviewAudio = async () => {
    if (!analysis || overviewAudioUri) return; // Don't fetch if already loaded or no analysis
    
    setIsOverviewAudioLoading(true);
    try {
      // A comprehensive narration including the TLDR and all diagnosed dimensions.
      const textToNarrate = `${analysis.tldr} The analysis found the following: ${plainTextDiagnosis}`;
      const { audioDataUri } = await runDefaultAudio({textToSpeak: textToNarrate});
      setOverviewAudioUri(audioDataUri);
      // Automatically play after loading
      overviewAudioRef.current?.load();
      overviewAudioRef.current?.play().catch(console.error);
    } catch (err) {
      console.error("Failed to generate overview audio:", err);
      setOverviewAudioUri(''); // Set to empty to prevent retries
    } finally {
      setIsOverviewAudioLoading(false);
    }
  };


  useEffect(() => {
    // Reset secondary states when a new claim is submitted
    setOverviewAudioUri(null);
    setIsOverviewAudioLoading(false);
    stopAllPlayback();
  }, [claimData]);
  
  const stopAllPlayback = () => {
    if (overviewAudioRef.current && !overviewAudioRef.current.paused) {
        overviewAudioRef.current.pause();
    }
    if (advocateAudioRef.current && !advocateAudioRef.current.paused) {
        advocateAudioRef.current.pause();
    }
    if (skepticAudioRef.current && !skepticAudioRef.current.paused) {
        skepticAudioRef.current.pause();
    }
  }

  const handleTabChange = (value: string) => {
    stopAllPlayback();
  };

 const togglePlayback = (
    audioType: 'overview' | 'advocate' | 'skeptic'
  ) => {
    const audioRefs = {
        overview: overviewAudioRef,
        advocate: advocateAudioRef,
        skeptic: skepticAudioRef
    };
    const targetRef = audioRefs[audioType];
    
    // If overview audio is not loaded, fetch it first.
    if (audioType === 'overview' && !overviewAudioUri) {
        handleFetchOverviewAudio();
        return;
    }

    if (targetRef.current) {
        // Pause all other audio types before playing a new one
        Object.values(audioRefs).forEach(ref => {
            if(ref !== targetRef && ref.current && !ref.current.paused) {
                ref.current.pause();
            }
        });
        
        if (targetRef.current.paused) {
            targetRef.current.play().catch(console.error);
        } else {
            targetRef.current.pause();
        }
    }
  };

  useEffect(() => {
    const setupAudioEvents = (
        ref: React.RefObject<HTMLAudioElement>, 
        setPlaying: (playing: boolean) => void
    ) => {
        const audio = ref.current;
        if (audio) {
            const onPlay = () => setPlaying(true);
            const onPause = () => setPlaying(false);
            const onEnded = () => setPlaying(false);

            audio.addEventListener('play', onPlay);
            audio.addEventListener('pause', onPause);
            audio.addEventListener('ended', onEnded);

            return () => {
                audio.removeEventListener('play', onPlay);
                audio.removeEventListener('pause', onPause);
                audio.removeEventListener('ended', onEnded);
            };
        }
    };
    
    const cleanupOverview = setupAudioEvents(overviewAudioRef, setIsOverviewPlaying);
    const cleanupAdvocate = setupAudioEvents(advocateAudioRef, setIsAdvocatePlaying);
    const cleanupSkeptic = setupAudioEvents(skepticAudioRef, setIsSkepticPlaying);

    return () => {
        cleanupOverview?.();
        cleanupAdvocate?.();
        cleanupSkeptic?.();
    }
  }, [overviewAudioUri, debate]);


  const handleSave = () => {
    if (!claimData || !analysis || !debate) return;
    onSaveToLog({
      claim: claimData.claim,
      verticals: claimData.verticals,
      result: {
        deceptionAnalysis: analysis,
        debate: `Advocate: ${debate.advocateText}\nSkeptic: ${debate.skepticText}`,
      },
    });
  };
  
  const getScoreColor = (score: number) => {
    if (score > 75) return 'text-red-500';
    if (score > 50) return 'text-yellow-500';
    return 'text-green-500';
  }

  const getProgressColor = (score: number) => {
    if (score > 75) return 'bg-red-500';
    if (score > 50) return 'bg-yellow-500';
    return 'bg-green-500';
  }
  
  const RiskDimension = ({ item }: { item: DiagnosisItem }) => {
    const score = Math.round(item.riskScore * 100);
    return (
        <div className="space-y-2">
            <div className="flex justify-between items-baseline">
                <p className="font-semibold text-foreground">{item.bias}</p>
                <p className={`font-bold ${getScoreColor(score)}`}>{score}%</p>
            </div>
            <Progress value={score} className="h-2 [&>div]:bg-primary" indicatorClassName={getProgressColor(score)} />
        </div>
    );
  };

  if (isLoading && !analysis) {
    return (
      <Card className="pointer-events-auto">
        <CardHeader>
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-10 w-32" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="pointer-events-auto">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Analysis Failed</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!analysis || !claimData) {
    return (
      <Card className="flex flex-col items-center justify-center text-center p-8 border-dashed pointer-events-auto">
        <CardHeader>
          <CardTitle>Awaiting Analysis</CardTitle>
          <CardDescription>Your analysis results will appear here.</CardDescription>
        </CardHeader>
      </Card>
    );
  }
  
  const advocatePoints = debate?.advocateText ? formatTextAsBullets(debate.advocateText) : [];
  const skepticPoints = debate?.skepticText ? formatTextAsBullets(debate.skepticText) : [];

  const overallScorePercentage = Math.round(analysis.deceptionRiskScore * 100);

  return (
    <Card className="transition-all duration-500 ease-in-out animate-in fade-in pointer-events-auto">
        <CardHeader>
            <CardTitle>Analysis Complete</CardTitle>
            <CardDescription>
              For statement: <span className="italic">"{claimData.claim}"</span>
            </CardDescription>
        </CardHeader>
      <CardContent>
        <Tabs defaultValue="overview" onValueChange={handleTabChange}>
          <div className="flex justify-between items-center mb-4">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="debate">Debate Mode</TabsTrigger>
            </TabsList>
            <Button variant="outline" size="sm" onClick={handleSave} disabled={!analysis || !debate}>
              <Save className="mr-2 h-4 w-4" />
              Save to Log
            </Button>
          </div>

          <TabsContent value="overview" className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Risk Dimensions</CardTitle>
                     <CardDescription>
                        Overall Risk: <span className={`font-bold ${getScoreColor(overallScorePercentage)}`}>{overallScorePercentage}%</span>.
                        {overallScorePercentage > 75 ? " High potential for self-deception." : overallScorePercentage > 50 ? " Some inconsistencies found." : " Looks reasonable."}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {(analysis.diagnosis || []).map((item, index) => (
                      <RiskDimension key={index} item={item} />
                    ))}
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>A Clearer View</CardTitle>
                        <CardDescription>{analysis.tldr}</CardDescription>
                    </div>
                     <Button variant="outline" size="sm" onClick={() => togglePlayback('overview')} disabled={isOverviewAudioLoading}>
                        {isOverviewAudioLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : (isOverviewPlaying ? <Pause className="mr-2 h-4 w-4" /> : <Volume2 className="mr-2 h-4 w-4" />)}
                        {isOverviewPlaying ? 'Pause' : 'Listen'}
                    </Button>
                </CardHeader>
                <CardContent>
                    <ul className="space-y-3">
                        {/* This section now renders the multi-dimensional analysis */}
                        {(analysis.diagnosis || []).map((item, index) => (
                            <li key={index} className="flex items-start gap-3">
                                <CheckCircle2 className="h-5 w-5 mt-0.5 text-accent flex-shrink-0" />
                                <div>
                                    <p className="font-semibold text-foreground">{item.bias}</p>
                                    <p className="text-muted-foreground">{item.diagnosis}</p>
                                </div>
                            </li>
                        ))}
                    </ul>
                     {overviewAudioUri && <audio ref={overviewAudioRef} src={overviewAudioUri} />}
                </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="debate">
             {!debate && (
              <div className="text-center p-8 space-y-4 flex flex-col items-center">
                <Loader2 className="h-8 w-8 animate-spin" />
                <p>Generating Debate...</p>
                <p className="text-sm text-muted-foreground">This may take a moment.</p>
              </div>
            )}
            {debate && (
              <TooltipProvider>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                      <CardHeader>
                          <CardTitle>Advocate</CardTitle>
                      </CardHeader>
                      <CardContent className="min-h-[100px]">
                          {advocatePoints.length > 0 ? (
                              <ul className="list-disc pl-5 font-code text-sm leading-relaxed space-y-1">
                                  {advocatePoints.map((point, i) => <li key={`adv-${i}`}>{point}</li>)}
                              </ul>
                          ) : <p className="text-muted-foreground">No arguments from the advocate.</p>}
                      </CardContent>
                      <CardContent>
                        <Button className="w-full" onClick={() => togglePlayback('advocate')} disabled={!debate.advocateAudio}>
                            {!debate.advocateAudio ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : (isAdvocatePlaying ? <Pause className="mr-2 h-4 w-4" /> : <Play className="mr-2 h-4 w-4" />)}
                            Advocate
                        </Button>
                        {debate.advocateAudio && <audio ref={advocateAudioRef} src={debate.advocateAudio} />}
                      </CardContent>
                  </Card>
                   <Card>
                      <CardHeader>
                          <CardTitle>Skeptic</CardTitle>
                      </CardHeader>
                      <CardContent className="min-h-[100px]">
                          {skepticPoints.length > 0 ? (
                              <ul className="list-disc pl-5 font-code text-sm leading-relaxed space-y-1">
                                 {skepticPoints.map((point, i) => <li key={`skep-${i}`}>{point}</li>)}
                              </ul>
                          ): <p className="text-muted-foreground">No arguments from the skeptic.</p>}
                      </CardContent>
                      <CardContent>
                        {debate.skepticAudio === undefined ? (
                          <Button className="w-full" disabled>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Skeptic
                          </Button>
                        ) : debate.skepticAudio ? (
                           <Button className="w-full" onClick={() => togglePlayback('skeptic')} disabled={!debate.skepticAudio}>
                              {isSkepticPlaying ? <Pause className="mr-2 h-4 w-4" /> : <Play className="mr-2 h-4 w-4" />}
                              Skeptic
                           </Button>
                        ) : (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button className="w-full" variant="outline" disabled>
                                  <CircleAlert className="mr-2 h-4 w-4" />
                                  Skeptic
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Audio generation failed. Please try again later.</p>
                            </TooltipContent>
                          </Tooltip>
                        )}
                        {debate.skepticAudio && <audio ref={skepticAudioRef} src={debate.skepticAudio} />}
                      </CardContent>
                  </Card>
              </div>
              </TooltipProvider>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
