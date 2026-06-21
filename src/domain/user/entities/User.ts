import { Skill } from '../../skill/entities/Skill';

export type User = {
  id: string;
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
  createdAt: Date;
  updatedAt: Date;
  skills: Skill[];
};
