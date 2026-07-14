import { Router } from "express";
import { AuthRoutes } from "../module/auth/auth.route";
import { CategoryRoutes } from "../module/category/category.route";
import { InstructorRoutes } from "../module/instructor/instructor.route";
import { UserRoutes } from "../module/user/user.route";

const router = Router();

router.use("/auth", AuthRoutes);
router.use("/categories", CategoryRoutes);
router.use("/users", UserRoutes);
router.use("/instructors", InstructorRoutes);

export const IndexRoutes = router;
