import { Education } from '../entities/Education';
import { EducationInputDTO } from '../../../application/education/dtos/EducationInputDTO';

export interface IEducationRepository {
  replaceForUser(userId: string, educations: EducationInputDTO[]): Promise<Education[]>;
  findByUserId(userId: string): Promise<Education[]>;
}
