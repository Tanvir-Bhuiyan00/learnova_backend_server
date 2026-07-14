import { Request, Response } from "express";
import status from "http-status";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { InstructorService } from "./instructor.service";

const getAllInstructors = catchAsync(async (req: Request, res: Response) => {
    const result = await InstructorService.getAllInstructors(req.query);

    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Instructors fetched successfully",
        data: result,
    });
});

const getInstructorById = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await InstructorService.getInstructorById(id as string);

    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Instructor fetched successfully",
        data: result,
    });
});

const updateInstructor = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const payload = req.body;
    const result = await InstructorService.updateInstructor(id as string, payload);

    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Instructor updated successfully",
        data: result,
    });
});

const softDeleteInstructor = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await InstructorService.softDeleteInstructor(id as string);

    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Instructor deleted successfully",
        data: result,
    });
});

export const InstructorController = {
    getAllInstructors,
    getInstructorById,
    updateInstructor,
    softDeleteInstructor,
};
