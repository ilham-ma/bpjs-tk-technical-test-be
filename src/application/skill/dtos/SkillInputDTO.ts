import { SkillLevel } from '../../../domain/skill/entities/SkillLevel';

export type SkillInputDTO = {
  id?: string;
  name?: string;
  level?: SkillLevel;
};
