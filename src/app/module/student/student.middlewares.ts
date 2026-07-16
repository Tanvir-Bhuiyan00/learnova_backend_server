import { NextFunction, Request, Response } from "express";

export const updateStudentProfileMiddleware = (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  if (req.body.data) {
    req.body = JSON.parse(req.body.data);
  }

  const files = req.files as { [fieldName: string]: Express.Multer.File[] } | undefined;

  if (files?.profilePhoto?.[0]) {
    req.body.profilePhoto = files.profilePhoto[0].path;
  }

  next();
};
