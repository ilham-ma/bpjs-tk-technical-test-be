export type EmploymentHistoryInputDTO = {
  jobTitle: string;
  employer: string;
  startDate: Date;
  endDate: Date | null;
  city: string;
  description: string;
};
