
'use client';

import { useMirrorLog } from '@/hooks/use-mirror-log';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Trash2, Download, History } from 'lucide-react';
import { Badge } from './ui/badge';

export function MirrorLog() {
  const { logEntries, deleteLogEntry, clearLog, exportLog } = useMirrorLog();

  const getScoreColor = (score: number) => {
    if (score > 0.75) return 'text-red-500';
    if (score > 0.5) return 'text-yellow-500';
    return 'text-green-500';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
            <History />
            Mirror Log
        </CardTitle>
        <CardDescription>A history of your analyzed claims and their results.</CardDescription>
        {logEntries.length > 0 && (
          <div className="flex gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={exportLog}>
              <Download className="mr-2 h-4 w-4" />
              Export Log
            </Button>
            <Button variant="destructive" size="sm" onClick={clearLog}>
              <Trash2 className="mr-2 h-4 w-4" />
              Clear Log
            </Button>
          </div>
        )}
      </CardHeader>
      <CardContent>
        {logEntries.length === 0 ? (
          <div className="text-center text-muted-foreground p-8 border-dashed border-2 rounded-lg">
            <p>Your saved analyses will appear here.</p>
          </div>
        ) : (
          <Accordion type="single" collapsible className="w-full">
            {logEntries.map((entry) => (
              <AccordionItem value={entry.id} key={entry.id}>
                <AccordionTrigger>
                  <div className="flex justify-between items-center w-full pr-4">
                    <div className="flex-1 text-left">
                        <p className="font-medium truncate">{entry.claim}</p>
                        <p className="text-sm text-muted-foreground">
                        {new Date(entry.timestamp).toLocaleString()}
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className={`text-sm font-bold ${getScoreColor(entry.result.deceptionAnalysis.deceptionRiskScore)}`}>
                            {Math.round(entry.result.deceptionAnalysis.deceptionRiskScore * 100)}
                        </span>
                        <span className="text-sm text-muted-foreground">/ 100</span>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="p-4 bg-muted/50 rounded-b-md">
                    <div className="space-y-4">
                        <div>
                            <h4 className="font-semibold">Claim</h4>
                            <p className="italic">"{entry.claim}"</p>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-2">Verticals</h4>
                            <div className="flex flex-wrap gap-2">
                                {Array.isArray(entry.verticals) && entry.verticals.map(v => <Badge key={v} variant="secondary">{v}</Badge>)}
                            </div>
                        </div>
                        <div>
                            <h4 className="font-semibold">Diagnosis (TL;DR)</h4>
                            <p>{entry.result.deceptionAnalysis.tldr}</p>
                        </div>
                        {entry.result.deceptionAnalysis.diagnosis && (
                             <div>
                                <h4 className="font-semibold">Detected Biases</h4>
                                <ul className="list-disc list-inside mt-1 space-y-1">
                                    {entry.result.deceptionAnalysis.diagnosis.map((d, i) => (
                                        <li key={i}><strong>{d.bias}:</strong> {d.diagnosis}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                        {entry.result.debate && (
                            <div>
                                <h4 className="font-semibold">Debate</h4>
                                <pre className="whitespace-pre-wrap font-code text-sm bg-background p-2 mt-1 rounded-md">{entry.result.debate}</pre>
                            </div>
                        )}
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => deleteLogEntry(entry.id)}
                        >
                            <Trash2 className="mr-2 h-4 w-4" /> Delete Entry
                        </Button>
                    </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </CardContent>
    </Card>
  );
}
