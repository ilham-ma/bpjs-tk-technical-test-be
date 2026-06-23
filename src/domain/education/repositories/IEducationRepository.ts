import { Education } from '../entities/Education';
import { EducationInputDTO } from '../../../application/education/dtos/EducationInputDTO';

export interface IEducationRepository {
  syncForUser(userId: string, educations: EducationInputDTO[]): Promise<Education[]>;
  findIdsByUserId(userId: string): Promise<string[]>;
  findByUserId(userId: string): Promise<Education[]>;
}
