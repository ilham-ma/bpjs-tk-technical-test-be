export type EducationInputDTO = {
  school: string;
  degree: string;
  startDate: Date;
  endDate?: Date | null;
  city: string;
  description: string;
};
