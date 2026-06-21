import { User } from "../../../../domain/user/entities/User";
import { CreateUserDTO } from "../../../../application/user/dtos/CreateUserDTO";
import { UpdateUserDTO } from "../../../../application/user/dtos/UpdateUserDTO";
import prisma from "../../../database/prisma/client";
import { IUserRepository } from "../../../../domain/user/repositories/IUserRepository";

export class PrismaUserRepository implements IUserRepository {
  async findById(id: string): Promise<User | null> {
    return await prisma.user.findUnique({
      where: { id },
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return await prisma.user.findUnique({
      where: { email },
    });
  }

  async create(data: CreateUserDTO): Promise<User> {
    return await prisma.user.create({
      data,
    });
  }

  async update(id: string, data: UpdateUserDTO): Promise<User> {
    return await prisma.user.update({
      where: { id },
      data,
    });
  }
}
