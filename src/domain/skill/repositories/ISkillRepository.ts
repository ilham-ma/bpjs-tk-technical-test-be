import { Skill } from '../entities/Skill';
import { SkillInputDTO } from '../../../application/skill/dtos/SkillInputDTO';

export interface ISkillRepository {
  replaceForUser(userId: string, skills: SkillInputDTO[]): Promise<Skill[]>;
  findByUserId(userId: string): Promise<Skill[]>;
}
