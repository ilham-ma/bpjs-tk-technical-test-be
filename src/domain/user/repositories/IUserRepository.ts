import { User } from "../entities/User";
import { CreateUserDTO } from "../../../application/user/dtos/CreateUserDTO";
import { UpdateUserDTO } from "../../../application/user/dtos/UpdateUserDTO";

export interface IUserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  create(data: Omit<CreateUserDTO, "skills" | "educations" | "employmentHistories">): Promise<User>;
  update(
    id: string,
    data: Omit<UpdateUserDTO, "skills" | "educations" | "employmentHistories">,
  ): Promise<User>;
  findAll(): Promise<User[]>;
}
