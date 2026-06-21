import { AppError } from "./AppError";

export type ValidationErrorDetail = {
  field: string;
  message: string;
};

export class ValidationError extends AppError {
  constructor(public readonly errors: ValidationErrorDetail[]) {
    super("Validation failed", 400);
    this.name = "ValidationError";
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
