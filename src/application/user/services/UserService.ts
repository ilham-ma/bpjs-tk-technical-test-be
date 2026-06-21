import { CreateUserDTO } from "../dtos/CreateUserDTO";
import { UpdateUserDTO } from "../dtos/UpdateUserDTO";
import { AppError } from "../../../shared/errors/AppError";
import { User } from "../../../domain/user/entities/User";
import { IUserRepository } from "../../../domain/user/repositories/IUserRepository";
import { ISkillRepository } from "../../../domain/skill/repositories/ISkillRepository";

export class UserService {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly skillRepository: ISkillRepository,
  ) {}

  async create(dto: CreateUserDTO): Promise<User> {
    const existingByEmail = await this.userRepository.findByEmail(dto.email);
    if (existingByEmail) {
      throw new AppError("Email already registered", 409);
    }

    const { skills, ...userData } = dto;
    const user = await this.userRepository.create(userData as any);

    const userWithSkills = {
      ...user,
      skills: await this.skillRepository.replaceForUser(user.id, skills),
    };

    return userWithSkills;
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

    const { skills, ...userData } = dto;
    const updatedUser = await this.userRepository.update(id, userData as any);

    if (skills !== undefined) {
      const updatedSkills = await this.skillRepository.replaceForUser(id, skills);
      return {
        ...updatedUser,
        skills: updatedSkills,
      };
    }

    const userWithSkills = await this.userRepository.findById(id);
    return userWithSkills!;
  }

  async findById(id: string): Promise<User> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new AppError("User not found", 404);
    }
    return user;
  }
}
