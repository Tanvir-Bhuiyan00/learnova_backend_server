import { Router } from "express";
import { AdminRoutes } from "../module/admin/admin.route";
import { AuthRoutes } from "../module/auth/auth.route";
import { CategoryRoutes } from "../module/category/category.route";
import { CourseRoutes } from "../module/course/course.route";
import { InstructorRoutes } from "../module/instructor/instructor.route";
import { UserRoutes } from "../module/user/user.route";

const router = Router();

router.use("/auth", AuthRoutes);
router.use("/admins", AdminRoutes);
router.use("/categories", CategoryRoutes);
router.use("/courses", CourseRoutes);
router.use("/users", UserRoutes);
router.use("/instructors", InstructorRoutes);

export const IndexRoutes = router;
