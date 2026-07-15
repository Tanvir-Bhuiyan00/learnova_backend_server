import { Router } from "express";
import { UserRole } from "../../../generated/prisma/enums";
import { checkAuth } from "../../middleware/checkAuth";
import { EnrollmentController } from "./enrollment.controller";

const router = Router();

router.post(
  "/checkout",
  checkAuth(UserRole.STUDENT),
  EnrollmentController.checkoutCart,
);

router.get(
  "/my-enrollments",
  checkAuth(UserRole.STUDENT),
  EnrollmentController.getMyEnrollments,
);

router.get(
  "/my-enrollments/:id",
  checkAuth(UserRole.STUDENT),
  EnrollmentController.getSingleEnrollment,
);

router.get(
  "/",
  checkAuth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  EnrollmentController.getAllEnrollments,
);

export const EnrollmentRoutes = router;
