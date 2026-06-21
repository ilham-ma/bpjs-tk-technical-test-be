import { Request, Response, NextFunction } from "express";
import { UserService } from "../../../../application/user/services/UserService";
import { CreateUserDTO } from "../../../../application/user/dtos/CreateUserDTO";
import { UpdateUserDTO } from "../../../../application/user/dtos/UpdateUserDTO";

export class UserController {
  constructor(private readonly userService: UserService) {}

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const dto: CreateUserDTO = {
        wantedJobTitle: req.body.wantedJobTitle,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        phone: req.body.phone,
        country: req.body.country,
        city: req.body.city,
        address: req.body.address,
        postalCode: req.body.postalCode,
        drivingLicense: req.body.drivingLicense,
        nationality: req.body.nationality,
        placeOfBirth: req.body.placeOfBirth,
        dateOfBirth: new Date(req.body.dateOfBirth),
        photoUrl: req.body.photoUrl,
      };

      const user = await this.userService.create(dto);
      res.status(201).json({
        status: "success",
        data: user,
      });
    } catch (err) {
      next(err);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id as string;
      const dto: UpdateUserDTO = {
        wantedJobTitle: req.body.wantedJobTitle,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        phone: req.body.phone,
        country: req.body.country,
        city: req.body.city,
        address: req.body.address,
        postalCode: req.body.postalCode,
        drivingLicense: req.body.drivingLicense,
        nationality: req.body.nationality,
        placeOfBirth: req.body.placeOfBirth,
        dateOfBirth: new Date(req.body.dateOfBirth),
        photoUrl: req.body.photoUrl,
      };

      const user = await this.userService.update(id, dto);
      res.status(200).json({
        status: "success",
        data: user,
      });
    } catch (err) {
      next(err);
    }
  };

  findById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id as string;
      const user = await this.userService.findById(id);
      res.status(200).json({
        status: "success",
        data: user,
      });
    } catch (err) {
      next(err);
    }
  };
}
