import { Router } from "express";
import { UserRole } from "../../../generated/prisma/enums";
import { checkAuth } from "../../middleware/checkAuth";
import { validateRequest } from "../../middleware/validateRequest";
import { InstructorController } from "./instructor.controller";
import { updateInstructorZodSchema } from "./instructor.validation";

const router = Router();

router.get("/", checkAuth(UserRole.STUDENT, UserRole.INSTRUCTOR, UserRole.ADMIN, UserRole.SUPER_ADMIN), InstructorController.getAllInstructors);

router.get("/:id", checkAuth(UserRole.STUDENT, UserRole.INSTRUCTOR, UserRole.ADMIN, UserRole.SUPER_ADMIN), InstructorController.getInstructorById);

router.patch(
    "/:id",
    checkAuth(UserRole.INSTRUCTOR, UserRole.ADMIN, UserRole.SUPER_ADMIN),
    validateRequest(updateInstructorZodSchema),
    InstructorController.updateInstructor,
);

router.delete("/:id", checkAuth(UserRole.ADMIN, UserRole.SUPER_ADMIN), InstructorController.softDeleteInstructor);

export const InstructorRoutes = router;
