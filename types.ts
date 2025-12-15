export interface SuburbData {
  suburbName: string;
  postcode: string;
  longitude: number;
  latitude: number;
  top5NearSuburbs: string[];
  lga: string;
  state: string;
  region: string;
  top5Industries: string[];
  googleSearchCount: number;
}

export interface SearchState {
  query: string;
  isLoading: boolean;
  error: string | null;
  data: SuburbData[];
}

export enum SortField {
  NAME = 'suburbName',
  STATE = 'state',
  POSTCODE = 'postcode'
}

export enum SortOrder {
  ASC = 'asc',
  DESC = 'desc'
}