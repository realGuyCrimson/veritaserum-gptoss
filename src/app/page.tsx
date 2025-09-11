
'use client';

import { useState } from 'react';
import type { LogEntry, DeceptionAnalysis, Vertical, DebateText, DebateAudio } from '@/lib/types';
import { runAnalysis, runDebateText, runDebateAudio } from '@/app/actions';
import { useMirrorLog } from '@/hooks/use-mirror-log';

import { ClaimForm } from '@/components/claim-form';
import { AnalysisResult } from '@/components/analysis-result';
import { MirrorLog } from '@/components/mirror-log';
import { Logo } from '@/components/logo';
import { Separator } from '@/components/ui/separator';

import { useEffect, useMemo, } from "react";
import { motion } from "framer-motion";

export default function Home() {
  const [currentClaim, setCurrentClaim] = useState<{ claim: string, verticals: Vertical[] } | null>(null);
  const [analysis, setAnalysis] = useState<DeceptionAnalysis | null>(null);
  const [debateText, setDebateText] = useState<DebateText | null>(null);
  const [debateAudio, setDebateAudio] = useState<DebateAudio | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { addLogEntry } = useMirrorLog();

  const handleClaimSubmit = async (claim: string, verticals: Vertical[]) => {
    setIsLoading(true);
    setError(null);
    setAnalysis(null);
    setDebateText(null);
    setDebateAudio(null);
    setCurrentClaim({ claim, verticals });

    // Run analysis and update state immediately when it's done
    runAnalysis({ claim, verticals })
      .then(analysisResult => {
        setAnalysis(analysisResult);
      })
      .catch(err => {
        setError('An error occurred during analysis. Please try again.');
        console.error('Analysis error:', err);
      })
      .finally(() => {
        setIsLoading(false);
      });
      
    // Run debate text generation
    runDebateText({ claim, verticals })
        .then(textResult => {
            setDebateText(textResult);
            // Once text is available, trigger audio generation
            runDebateAudio(textResult)
                .then(audioResult => {
                    setDebateAudio(audioResult);
                })
                .catch(err => {
                    console.error('Debate audio generation error:', err);
                    setDebateAudio({ advocateAudio: '', skepticAudio: '' });
                });
        })
        .catch(err => {
            console.error('Debate text generation error:', err);
            setDebateText(null);
        });
  };

  const handleSaveToLog = (logEntry: Omit<LogEntry, 'id' | 'timestamp'>) => {
    addLogEntry(logEntry);
  };
  
  const fullDebateResult = debateText ? { ...debateText, ...debateAudio } : null;

  const [titleNumber, setTitleNumber] = useState(0);
const titles = useMemo(
  () => [
    "veri-TA-serum", "Deception Mirror", "Liar's Bar", "Dilemma Den",
    "Hoax Hell", "No-Cap Serum", "Potion of Proof", "VeriSus", "Fib Free Formula",
    "Cap Crack", "Lie-Less Liquor", "Truth Brew", "Fact Elixir",
    "Draught of the Living Truth", "Once upon a Truth", "Fast and Factious",
    "Matrix of Lies", "The CapFather", "Guardians of the Honesty", "The Honest Ex", "Red Flag Radar"
  ],
  []
);
useEffect(() => {
  const timeoutId = setTimeout(() => {
    if (titleNumber === titles.length - 1) {
      setTitleNumber(0);
    } else {
      setTitleNumber(titleNumber + 1);
    }
  }, 2000);
  return () => clearTimeout(timeoutId);
}, [titleNumber, titles]);

  return (
    <div className="flex flex-col min-h-screen">
      <header className="w-full">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between pointer-events-auto">
          <Logo />
        </div>
      </header>
      
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pointer-events-none">
          <div className="lg:col-span-3 pointer-events-auto">
          <motion.div
  className="w-full flex justify-center"
  layout
  transition={{
    layout: { duration: 0.44, ease: [0.18, 0.89, 0.32, 1.15] }
  }}
  style={{ minHeight: '130px' }} // or matching your h1 height if different
>
  <motion.h1
    className="text-7xl font-headline font-bold tracking-tight"
    style={{
      color: "#FFFFFF",
      textShadow: "8px 8px 8px rgba(13, 113, 31, 0.7), 4px 4px 4px #000",
      display: "flex",
      alignItems: "baseline",
      justifyContent: "center",
      flexWrap: "wrap",
      width: "max-content",
      margin: "0 auto",
      textAlign: "center"
    }}
    layout
  >
    <span>Welcome to&nbsp;</span>
    <span
      className="relative inline-block align-baseline"
      style={{ display: "inline-block", minWidth: 160 }}
    >
      {titles.map((title, index) => (
        <motion.span
          key={index}
          className="absolute w-full font-semibold"
          style={{ left: 0, textAlign: "left", whiteSpace: "nowrap" }}
          initial={{ opacity: 0, y: "-100%" }}
          animate={
            titleNumber === index
              ? { y: "0%", opacity: 1 }
              : { y: titleNumber > index ? "-150%" : "150%", opacity: 0 }
          }
          transition={{ type: "spring", stiffness: 50 }}
        >
          {title}
        </motion.span>
      ))}
      <span style={{ opacity: 0 }}>{titles[titleNumber]}</span>
    </span>
  </motion.h1>
</motion.div>



            <p
              className="mt-2 text-lg text-center max-w-3xl mx-auto"
              style={{ color: "#FFFFFF",
                       textShadow: "8px 8px 8px rgba(13, 113, 31, 0.7), 4px 4px 4px #000"
               }}
            >
              Uncover patterns of self-deception. Enter a statement below to receive a counter-narrative and test your reasoning.
            </p>
          </div>
          
          <div className="lg:col-span-3 pointer-events-auto">
            <ClaimForm onSubmit={handleClaimSubmit} isLoading={isLoading} />
          </div>
  
          <div className="lg:col-span-3 pointer-events-auto">
            <AnalysisResult
              claimData={currentClaim}
              analysis={analysis}
              debate={fullDebateResult}
              isLoading={isLoading}
              error={error}
              onSaveToLog={handleSaveToLog}
            />
          </div>
  
          <div className="lg:col-span-3 mt-8 pointer-events-auto">
             <Separator className="my-8" />
            <MirrorLog />
          </div>
        </div>
      </main>
  
      <footer className="py-4 border-t pointer-events-auto">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} veri-TA-serum. A clearer truth.</p>
        </div>
      </footer>
    </div>
  );
}
