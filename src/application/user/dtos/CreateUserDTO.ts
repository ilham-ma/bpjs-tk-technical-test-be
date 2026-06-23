import { EducationInputDTO } from '../../education/dtos/EducationInputDTO';
import { EmploymentHistoryInputDTO } from '../../employment-history/dtos/EmploymentHistoryInputDTO';
import { SkillInputDTO } from '../../skill/dtos/SkillInputDTO';

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
  dateOfBirth: string;
  photoUrl: string;
  professionalSummary: string;
  skills: SkillInputDTO[];
  educations: EducationInputDTO[];
  employmentHistories: EmploymentHistoryInputDTO[];
};
