import { logRouteNotFound } from "./helpers/middlewares/middlewares";
import { Router } from "express";
import { masterUserRouter } from "./user/masterUserRouter";
import { masterAuthRouter } from "./auth/masterAuthRouter";
import { masterCartRouter } from "./cart/masterCartRouter";
import { masterProductRouter } from "./items/masterProductRouter";
import { searchRouter } from "./search/searchRouter";
import { masterCheckoutRouter } from "./checkout/masterCheckoutRouter";

export const masterAPIRouter = Router();

masterAPIRouter.use("/user", masterUserRouter);
masterAPIRouter.use("/auth", masterAuthRouter);
masterAPIRouter.use("/cart", masterCartRouter);
masterAPIRouter.use("/products", masterProductRouter);
masterAPIRouter.use("/search", searchRouter);
masterAPIRouter.use("/checkout", masterCheckoutRouter);

masterAPIRouter.use("/*", logRouteNotFound);
