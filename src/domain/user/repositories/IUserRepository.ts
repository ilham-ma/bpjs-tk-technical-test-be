import { User } from "../entities/User";

export interface IUserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  create(data: Omit<User, "id" | "createdAt" | "updatedAt">): Promise<User>;
  update(
    id: string,
    data: Omit<User, "id" | "createdAt" | "updatedAt">,
  ): Promise<User>;
  findAll(): Promise<User[]>;
}
