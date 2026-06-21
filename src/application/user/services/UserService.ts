import { CreateUserDTO } from "../dtos/CreateUserDTO";
import { UpdateUserDTO } from "../dtos/UpdateUserDTO";
import { AppError } from "../../../shared/errors/AppError";
import { User } from "../../../domain/user/entities/User";
import { IUserRepository } from "../../../domain/user/repositories/IUserRepository";
import { ISkillRepository } from "../../../domain/skill/repositories/ISkillRepository";
import { IEducationRepository } from "../../../domain/education/repositories/IEducationRepository";

export class UserService {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly skillRepository: ISkillRepository,
    private readonly educationRepository: IEducationRepository,
  ) {}

  async create(dto: CreateUserDTO): Promise<User> {
    const existingByEmail = await this.userRepository.findByEmail(dto.email);
    if (existingByEmail) {
      throw new AppError("Email already registered", 409);
    }

    const { skills, educations, ...userData } = dto;
    const user = await this.userRepository.create(userData as any);

    const userWithSkillsAndEducation = {
      ...user,
      skills: await this.skillRepository.replaceForUser(user.id, skills),
      educations: await this.educationRepository.replaceForUser(user.id, educations),
    };

    return userWithSkillsAndEducation;
  }

  async update(id: string, dto: UpdateUserDTO): Promise<User> {
    const existing = await this.userRepository.findById(id);
    if (!existing) {
      throw new AppError("User not found", 404);
    }

    if (existing.email !== dto.email) {
      const existingByEmail = await this.userRepository.findByEmail(dto.email);
      if (existingByEmail) {
        throw new AppError("Email already registered", 409);
      }
    }

    const { skills, educations, ...userData } = dto;
    const updatedUser = await this.userRepository.update(id, userData as any);

    let resultSkills = existing.skills;
    let resultEducations = existing.educations;

    if (skills !== undefined) {
      resultSkills = await this.skillRepository.replaceForUser(id, skills);
    }

    if (educations !== undefined) {
      resultEducations = await this.educationRepository.replaceForUser(id, educations);
    }

    return {
      ...updatedUser,
      skills: resultSkills,
      educations: resultEducations,
    };
  }

  async findById(id: string): Promise<User> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new AppError("User not found", 404);
    }
    return user;
  }
}
