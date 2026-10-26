export interface StudentResultItem {
  resultId: number;
  competitionId: number;
  competitionName: string;
  color: string;
  result: string;
  certificateId: number | null;
}

export interface StudentListItem {
  id: number;
  studentId: string;
  firstName: string;
  lastName: string;
  class: string;
  room: string;
  resultCount: number;
  awardCount: number;
}

export interface StudentInput {
  studentId: string;
  firstName: string;
  lastName: string;
  class: string;
  room: string;
}

export interface CompetitionOption {
  id: number;
  name: string;
  color: string;
}
