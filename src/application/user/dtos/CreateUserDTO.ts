import { EducationInputDTO } from '../../education/dtos/EducationInputDTO';
import { EmploymentHistoryInputDTO } from '../../employment-history/dtos/EmploymentHistoryInputDTO';

export type CreateUserDTO = {
  wantedJobTitle: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  country: string;
  city: string;
  address: string;
  postalCode: string;
  drivingLicense: string;
  nationality: string;
  placeOfBirth: string;
  dateOfBirth: Date;
  photoUrl: string;
  professionalSummary: string;
  skills: string[];
  educations: EducationInputDTO[];
  employmentHistories: EmploymentHistoryInputDTO[];
};
