import { logRouteNotFound } from "./middlewares";
import { Router } from "express";
import masterUserRouter from "./user/masterUserRouter";
import masterAuthRouter from "./auth/masterAuthRouter";
import masterCartRouter from "./cart/masterCartRouter";
import masterProductRouter from "./items/masterProductRouter";

const router = Router();

router.use("/user", masterUserRouter);
router.use("/auth", masterAuthRouter);
router.use("/cart", masterCartRouter);
router.use("/products", masterProductRouter);

router.get("/*", logRouteNotFound).post("/*", logRouteNotFound);

export default router;
