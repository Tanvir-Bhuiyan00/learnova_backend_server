import { Router } from "express";
import { AdminRoutes } from "../module/admin/admin.route";
import { AuthRoutes } from "../module/auth/auth.route";
import { CartRoutes } from "../module/cart/cart.route";
import { CategoryRoutes } from "../module/category/category.route";
import { CourseRoutes } from "../module/course/course.route";
import { EnrollmentRoutes } from "../module/enrollment/enrollment.route";
import { InstructorRoutes } from "../module/instructor/instructor.route";
import { PaymentRoutes } from "../module/payment/payment.route";
import { StudentRoutes } from "../module/student/student.route";
import { UserRoutes } from "../module/user/user.route";

const router = Router();

router.use("/auth", AuthRoutes);
router.use("/admins", AdminRoutes);
router.use("/categories", CategoryRoutes);
router.use("/courses", CourseRoutes);
router.use("/users", UserRoutes);
router.use("/instructors", InstructorRoutes);
router.use("/carts", CartRoutes);
router.use("/enrollments", EnrollmentRoutes);
router.use("/payments", PaymentRoutes);
router.use("/students", StudentRoutes);

export const IndexRoutes = router;
