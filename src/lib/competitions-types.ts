export const CATEGORY_OPTIONS = ["บุคคล", "ทีม"] as const;
export type CategoryOption = (typeof CATEGORY_OPTIONS)[number];

export interface CompetitionListItem {
  id: number;
  name: string;
  sportType: string;
  category: string;
  ageGroup: string | null;
  color: string;
  resultCount: number;
}

export interface CompetitionInput {
  name: string;
  sportType: string;
  category: string;
  ageGroup: string;
  color: string;
}
