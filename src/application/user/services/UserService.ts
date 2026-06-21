import { CreateUserDTO } from "../dtos/CreateUserDTO";
import { UpdateUserDTO } from "../dtos/UpdateUserDTO";
import { AppError } from "../../../shared/errors/AppError";
import { User } from "../../../domain/user/entities/User";
import { IUserRepository } from "../../../domain/user/repositories/IUserRepository";

export class UserService {
  constructor(private readonly userRepository: IUserRepository) {}

  async create(dto: CreateUserDTO): Promise<User> {
    const existingByEmail = await this.userRepository.findByEmail(dto.email);
    if (existingByEmail) {
      throw new AppError("Email already registered", 409);
    }

    return await this.userRepository.create(dto);
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

    return await this.userRepository.update(id, dto);
  }

  async findById(id: string): Promise<User> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new AppError("User not found", 404);
    }
    return user;
  }
}
