
export interface Article {
  id: string;
  url: string;
  title: string;
  shortDescription: string;
  fullSummary: string;
  imageUrl: string;
  date: string;
  category: string;
}

export interface DailyEdition {
  id: string;
  date: string;
  title: string;
  summary?: string;
  cover?: {
    title?: string;
    summary: string;
    imageUrl?: string;
  };
  author?: string;
  articles: Article[];
}

export interface AppState {
  editions: DailyEdition[];
  isLoading: boolean;
  hasMore: boolean;
}

export enum AppMode {
  FEED = 'FEED',
  CURATE = 'CURATE'
}
