import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { AuthService } from "./auth.service";
import status from "http-status";

const registerStudent = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body;

  console.log(payload);

  const result = await AuthService.registerStudent(payload);

  sendResponse(res, {
    httpStatusCode: status.CREATED,
    success: true,
    message: "Student registered successfully",
    data: result,
  });
});

const loginStudent = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body;
  const result = await AuthService.loginStudent(payload);
  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Student logged in successfully",
    data: result,
  });
});

export const AuthController = {
  registerStudent,
  loginStudent,
};
