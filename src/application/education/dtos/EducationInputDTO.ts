export type EducationInputDTO = {
  id?: string;
  school: string;
  degree: string;
  startDate: string;
  endDate?: string | null;
  city: string;
  description: string;
};
