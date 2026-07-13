import { Router } from "express";
import { CategoryRoutes } from "../module/category/category.route";
import { AuthRoutes } from "../module/auth/auth.route";

const router = Router();

router.use("/auth", AuthRoutes);
router.use("/categories", CategoryRoutes);

export const IndexRoutes = router;
