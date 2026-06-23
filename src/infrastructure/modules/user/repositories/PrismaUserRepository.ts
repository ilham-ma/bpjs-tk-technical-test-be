import { User } from "../../../../domain/user/entities/User";
import { CreateUserDTO } from "../../../../application/user/dtos/CreateUserDTO";
import { UpdateUserDTO } from "../../../../application/user/dtos/UpdateUserDTO";
import prisma from "../../../database/prisma/client";
import { IUserRepository } from "../../../../domain/user/repositories/IUserRepository";

export class PrismaUserRepository implements IUserRepository {
  async findById(id: string): Promise<User | null> {
    const user = await prisma.user.findUnique({
      where: { id },
      include: { skills: { include: { skill: true } }, educations: true, employmentHistories: true },
    });
    if (!user) return null;
    return {
      ...user,
      skills: user.skills.map((us) => us.skill),
    };
  }

  async findByEmail(email: string): Promise<User | null> {
    return await prisma.user.findUnique({
      where: { email },
    }) as User | null;
  }

  async create(data: CreateUserDTO): Promise<User> {
    const result = await prisma.user.create({
      data: data as any,
    });
    return {
      ...result,
      skills: [],
      educations: [],
      employmentHistories: [],
    };
  }

  async update(id: string, data: UpdateUserDTO): Promise<User> {
    const result = await prisma.user.update({
      where: { id },
      data: data as any,
    });
    return {
      ...result,
      skills: [],
      educations: [],
      employmentHistories: [],
    };
  }

  async findAll(): Promise<User[]> {
    const users = await prisma.user.findMany({
      include: { skills: { include: { skill: true } }, educations: true, employmentHistories: true },
      orderBy: { createdAt: 'desc' },
    });
    return users.map((user) => ({
      ...user,
      skills: user.skills.map((us) => us.skill),
    }));
  }
}
