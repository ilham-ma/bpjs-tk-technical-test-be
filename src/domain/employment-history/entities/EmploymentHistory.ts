export type EmploymentHistory = {
  id: string;
  jobTitle: string;
  employer: string;
  startDate: Date;
  endDate: Date | null;
  city: string;
  description: string;
  userId: string;
};
