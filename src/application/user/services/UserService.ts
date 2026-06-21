import { CreateUserDTO } from "../dtos/CreateUserDTO";
import { UpdateUserDTO } from "../dtos/UpdateUserDTO";
import { AppError } from "../../../shared/errors/AppError";
import { User } from "../../../domain/user/entities/User";
import { IUserRepository } from "../../../domain/user/repositories/IUserRepository";
import { ISkillRepository } from "../../../domain/skill/repositories/ISkillRepository";
import { IEducationRepository } from "../../../domain/education/repositories/IEducationRepository";
import { IEmploymentHistoryRepository } from "../../../domain/employment-history/repositories/IEmploymentHistoryRepository";
import { IFileStorageService } from "../../../domain/profile/services/IFileStorageService";

export class UserService {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly skillRepository: ISkillRepository,
    private readonly educationRepository: IEducationRepository,
    private readonly employmentHistoryRepository: IEmploymentHistoryRepository,
    private readonly fileStorage?: IFileStorageService,
  ) {}

  async create(dto: CreateUserDTO): Promise<User> {
    const existingByEmail = await this.userRepository.findByEmail(dto.email);
    if (existingByEmail) {
      throw new AppError("Email already registered", 409);
    }

    const { skills, educations, employmentHistories, ...userData } = dto;
    const user = await this.userRepository.create(userData as any);

    const userWithSkillsEducationAndEmploymentHistories = {
      ...user,
      skills: await this.skillRepository.replaceForUser(user.id, skills),
      educations: await this.educationRepository.replaceForUser(user.id, educations),
      employmentHistories: await this.employmentHistoryRepository.replaceForUser(user.id, employmentHistories),
    };

    return userWithSkillsEducationAndEmploymentHistories;
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

    if (dto.photoUrl !== undefined && existing.photoUrl && existing.photoUrl !== dto.photoUrl) {
      if (this.fileStorage) {
        await this.fileStorage.delete(existing.photoUrl).catch(() => {});
      }
    }

    const { skills, educations, employmentHistories, ...userData } = dto;
    const updatedUser = await this.userRepository.update(id, userData as any);

    let resultSkills = existing.skills;
    let resultEducations = existing.educations;
    let resultEmploymentHistories = existing.employmentHistories;

    if (skills !== undefined) {
      resultSkills = await this.skillRepository.replaceForUser(id, skills);
    }

    if (educations !== undefined) {
      resultEducations = await this.educationRepository.replaceForUser(id, educations);
    }

    if (employmentHistories !== undefined) {
      resultEmploymentHistories = await this.employmentHistoryRepository.replaceForUser(id, employmentHistories);
    }

    return {
      ...updatedUser,
      skills: resultSkills,
      educations: resultEducations,
      employmentHistories: resultEmploymentHistories,
    };
  }

  async findById(id: string): Promise<User> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new AppError("User not found", 404);
    }
    return user;
  }

  async findAll(): Promise<User[]> {
    return await this.userRepository.findAll();
  }
}
