
export type Page = 'welcome' | 'testing' | 'admin';

export type TargetBox = 'exam' | 'event' | 'updates' | 'quote' | 'general';

export interface BoxData {
  exam: string;
  examImage?: string;
  event: string;
  eventImage?: string;
  updates: string[];
  updatesImage?: string;
  quote: string;
  quoteImage?: string;
  general: string;
  generalImage?: string;
}

export interface SummaryResult {
  detailedSummary: string;
  shortSummary: string;
}

export interface SummaryHistoryItem {
  id: string;
  timestamp: number;
  type: 'text' | 'image' | 'both';
  target: TargetBox;
  detailedSummary: string;
  shortSummary: string;
  imagePreview?: string;
}

export interface SummarizeParams {
  text?: string;
  imageBase64?: string;
  mimeType?: string;
}
