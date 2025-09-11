
export type Vertical = 'Finance' | 'Fitness' | 'Career' | 'Relationships' | 'Famous Personas' | 'History' | 'Medicine';

/**
 * @description Represents a single dimension of the deception analysis, such as 'Cognitive Bias' or 'Emotional Manipulation'.
 * @property {string} bias - The name of the detected bias or risk dimension.
 * @property {string} diagnosis - A short, one-sentence explanation of how this dimension applies to the claim.
 * @property {number} riskScore - A numerical score from 0 to 1 indicating the risk level for this specific dimension.
 */
export interface DiagnosisItem {
  bias: string;
  diagnosis: string;
  riskScore: number;
}

/**
 * @description The complete output of the multi-dimensional deception analysis.
 * @property {number} deceptionRiskScore - An overall risk score from 0 to 1, aggregating all detected risks.
 * @property {string} tldr - A very short, one-sentence summary of the core issue.
 * @property {DiagnosisItem[]} diagnosis - An array of diagnosed risk dimensions and their explanations.
 */
export interface DeceptionAnalysis {
  deceptionRiskScore: number;
  tldr: string;
  diagnosis: DiagnosisItem[];
}

export interface DebateText {
    advocateText: string;
    skepticText: string;
}

export interface DebateAudio {
    advocateAudio: string;
    skepticAudio: string;
}

export interface DebateResult extends DebateText, Partial<DebateAudio> {}


export interface AnalysisResult {
  deceptionAnalysis: DeceptionAnalysis;
  debate?: string;
}

export interface LogEntry {
  id: string;
  claim: string;
  verticals: Vertical[];
  result: AnalysisResult;
  timestamp: number;
}
