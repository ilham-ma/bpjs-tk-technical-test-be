import { Skill } from '../entities/Skill';
import { SkillInputDTO } from '../../../application/skill/dtos/SkillInputDTO';

export interface ISkillRepository {
  create(input: SkillInputDTO): Promise<Skill>;
  findAll(): Promise<Skill[]>;
  findById(id: string): Promise<Skill | null>;
  findManyByIds(ids: string[]): Promise<Skill[]>;
  linkUserSkills(userId: string, skillIds: string[]): Promise<Skill[]>;
  findByUserId(userId: string): Promise<Skill[]>;
}
