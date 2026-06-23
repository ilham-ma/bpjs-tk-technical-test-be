import { ISkillRepository } from "../../../domain/skill/repositories/ISkillRepository";
import { Skill } from "../../../domain/skill/entities/Skill";
import { SkillInputDTO } from "../dtos/SkillInputDTO";

export class SkillService {
  constructor(private readonly skillRepository: ISkillRepository) {}

  async createMany(dtos: SkillInputDTO[]): Promise<Skill[]> {
    return await this.skillRepository.createMany(dtos);
  }

  async findAll(): Promise<Skill[]> {
    return await this.skillRepository.findAll();
  }
}
