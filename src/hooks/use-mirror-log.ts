'use client';

import { useState, useEffect, useCallback } from 'react';
import type { LogEntry } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

const STORAGE_KEY = 'deception-mirror-log';

export function useMirrorLog() {
  const [logEntries, setLogEntries] = useState<LogEntry[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    try {
      const storedItems = localStorage.getItem(STORAGE_KEY);
      if (storedItems) {
        setLogEntries(JSON.parse(storedItems));
      }
    } catch (error) {
      console.error('Failed to load log entries from local storage:', error);
      toast({
        title: "Error",
        description: "Could not load mirror log from your browser's storage.",
        variant: "destructive"
      });
    }
  }, [toast]);

  const saveEntriesToStorage = useCallback((entries: LogEntry[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
    } catch (error) {
      console.error('Failed to save log entries to local storage:', error);
       toast({
        title: "Error",
        description: "Could not save to mirror log in your browser's storage.",
        variant: "destructive"
      });
    }
  }, [toast]);

  const addLogEntry = useCallback(
    (newEntryData: Omit<LogEntry, 'id' | 'timestamp'>) => {
      const newEntry: LogEntry = {
        ...newEntryData,
        id: new Date().toISOString() + Math.random().toString(36).substr(2, 9),
        timestamp: Date.now(),
      };

      setLogEntries((prevEntries) => {
        const updatedEntries = [newEntry, ...prevEntries];
        saveEntriesToStorage(updatedEntries);
        return updatedEntries;
      });
      toast({
          title: "Saved to Mirror Log",
          description: "Your analysis has been saved.",
      });
    },
    [saveEntriesToStorage, toast]
  );

  const deleteLogEntry = useCallback(
    (id: string) => {
      setLogEntries((prevEntries) => {
        const updatedEntries = prevEntries.filter((entry) => entry.id !== id);
        saveEntriesToStorage(updatedEntries);
        return updatedEntries;
      });
       toast({
          title: "Entry Deleted",
          description: "The log entry has been removed.",
      });
    },
    [saveEntriesToStorage, toast]
  );

  const clearLog = useCallback(() => {
    setLogEntries([]);
    saveEntriesToStorage([]);
     toast({
          title: "Log Cleared",
          description: "All entries have been removed from the mirror log.",
      });
  }, [saveEntriesToStorage, toast]);
  
  const exportLog = useCallback(() => {
    try {
        const dataStr = JSON.stringify(logEntries, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        
        const exportFileDefaultName = 'deception_mirror_log.json';
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
        linkElement.remove();
        toast({
            title: "Log Exported",
            description: "Your mirror log has been downloaded as a JSON file.",
        });
    } catch (error) {
        console.error('Failed to export log:', error);
        toast({
            title: "Error",
            description: "Could not export the mirror log.",
            variant: "destructive"
        });
    }
  }, [logEntries, toast]);

  return { logEntries, addLogEntry, deleteLogEntry, clearLog, exportLog };
}
